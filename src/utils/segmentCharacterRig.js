const rigCache = new Map();

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("人物动作图层没有成功载入。"));
    image.src = url;
  });
}

function findNode(nodes, pattern) {
  const node = nodes.find((item) => pattern.test(String(item.label || item.name || "")));
  if (!node) return null;
  return { x: Number(node.x), y: Number(node.y) };
}

function pointInPixels(point, width, height) {
  return { x: point.x / 100 * width, y: point.y / 100 * height };
}

function distance(from, to) {
  return Math.hypot(to.x - from.x, to.y - from.y);
}

function extendEndpoint(from, to, amount = .42) {
  return { x: to.x + (to.x - from.x) * amount, y: to.y + (to.y - from.y) * amount };
}

function alphaAt(pixels, width, height, x, y) {
  const sampleX = clamp(Math.round(x), 0, width - 1);
  const sampleY = clamp(Math.round(y), 0, height - 1);
  return pixels.data[(sampleY * width + sampleX) * 4 + 3];
}

function measureSegmentWidth(pixels, width, height, from, to, fallback, maximum) {
  const length = distance(from, to);
  if (!length) return fallback;
  const normal = { x: -(to.y - from.y) / length, y: (to.x - from.x) / length };
  const widths = [.32, .5, .68].map((progress) => {
    const center = { x: from.x + (to.x - from.x) * progress, y: from.y + (to.y - from.y) * progress };
    if (alphaAt(pixels, width, height, center.x, center.y) < 18) return 0;
    let total = 1;
    [-1, 1].forEach((direction) => {
      let transparentRun = 0;
      for (let step = 1; step <= maximum / 2; step += 1) {
        const alpha = alphaAt(pixels, width, height, center.x + normal.x * step * direction, center.y + normal.y * step * direction);
        if (alpha > 18) {
          total = Math.max(total, step + 1);
          transparentRun = 0;
        } else if (++transparentRun >= 3) break;
      }
    });
    return total * 2;
  }).filter(Boolean);
  return clamp((widths.length ? Math.max(...widths) * 1.12 : fallback), fallback, maximum);
}

function drawCapsule(context, from, to, width, endScale = 1) {
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = width;
  context.beginPath();
  context.moveTo(from.x, from.y);
  context.lineTo(to.x, to.y);
  context.stroke();
  context.beginPath();
  context.arc(to.x, to.y, width * .5 * endScale, 0, Math.PI * 2);
  context.fill();
}

function renderLayer(image, width, height, paintMask, operation = "destination-in") {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, width, height);
  context.globalCompositeOperation = operation;
  context.strokeStyle = "#000";
  context.fillStyle = "#000";
  paintMask(context);
  context.globalCompositeOperation = "source-over";
  return canvas.toDataURL("image/png");
}

function makeArm(image, nodes, side, width, height, pixels, fallbackWidth, maximumWidth) {
  const shoulder = findNode(nodes, new RegExp(`${side}肩`));
  const elbow = findNode(nodes, new RegExp(`${side}肘`));
  let wrist = findNode(nodes, new RegExp(`${side}(手腕|腕|手)`));
  if (!shoulder || !elbow) return null;
  if (!wrist) wrist = extendEndpoint(shoulder, elbow, .72);

  const shoulderPx = pointInPixels(shoulder, width, height);
  const elbowPx = pointInPixels(elbow, width, height);
  const wristPx = pointInPixels(wrist, width, height);
  const upperWidth = measureSegmentWidth(pixels, width, height, shoulderPx, elbowPx, fallbackWidth, maximumWidth);
  const forearmWidth = measureSegmentWidth(pixels, width, height, elbowPx, wristPx, fallbackWidth * .86, maximumWidth);
  const handEnd = extendEndpoint(elbowPx, wristPx, .24);

  return {
    side,
    shoulder,
    elbow,
    upperUrl: renderLayer(image, width, height, (context) => {
      drawCapsule(context, shoulderPx, elbowPx, upperWidth, 1.08);
    }),
    forearmUrl: renderLayer(image, width, height, (context) => {
      drawCapsule(context, elbowPx, handEnd, forearmWidth, 1.24);
    }),
    erase(context) {
      drawCapsule(context, shoulderPx, elbowPx, upperWidth * 1.05, 1.12);
      drawCapsule(context, elbowPx, handEnd, forearmWidth * 1.06, 1.28);
    },
  };
}

export async function segmentCharacterRig(imageUrl, nodes = []) {
  const cacheKey = `${imageUrl}|${nodes.map((node) => `${node.label}:${Number(node.x).toFixed(2)},${Number(node.y).toFixed(2)}`).join(";")}`;
  if (rigCache.has(cacheKey)) return rigCache.get(cacheKey);

  const promise = (async () => {
    if (!imageUrl || nodes.length < 6) return null;
    const image = await loadImage(imageUrl);
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    const leftShoulder = findNode(nodes, /左肩/);
    const rightShoulder = findNode(nodes, /右肩/);
    const shoulderSpan = leftShoulder && rightShoulder
      ? distance(pointInPixels(leftShoulder, width, height), pointInPixels(rightShoulder, width, height))
      : Math.min(width, height) * .28;
    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = width;
    sourceCanvas.height = height;
    const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
    sourceContext.drawImage(image, 0, 0, width, height);
    const pixels = sourceContext.getImageData(0, 0, width, height);
    const fallbackWidth = clamp(shoulderSpan * .38, Math.min(width, height) * .045, Math.min(width, height) * .12);
    const maximumWidth = clamp(shoulderSpan * .82, fallbackWidth, Math.min(width, height) * .2);
    const arms = [
      makeArm(image, nodes, "左", width, height, pixels, fallbackWidth, maximumWidth),
      makeArm(image, nodes, "右", width, height, pixels, fallbackWidth, maximumWidth),
    ].filter(Boolean);
    if (!arms.length) return null;

    const baseUrl = renderLayer(image, width, height, (context) => arms.forEach((arm) => arm.erase(context)), "destination-out");
    return {
      baseUrl,
      arms: arms.map(({ erase, ...arm }) => arm),
      size: { width, height },
    };
  })().catch((error) => {
    rigCache.delete(cacheKey);
    console.warn("人物分段骨架生成失败，将继续使用完整人物图层：", error.message);
    return null;
  });

  rigCache.set(cacheKey, promise);
  return promise;
}
