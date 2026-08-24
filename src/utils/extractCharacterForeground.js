import { removeBackground } from "@imgly/background-removal";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function restoreForegroundColors(foregroundPixels, sourcePixels) {
  const length = Math.min(foregroundPixels.data.length, sourcePixels.data.length);
  for (let offset = 0; offset < length; offset += 4) {
    const maskAlpha = foregroundPixels.data[offset + 3];
    if (!maskAlpha) continue;
    foregroundPixels.data[offset] = sourcePixels.data[offset];
    foregroundPixels.data[offset + 1] = sourcePixels.data[offset + 1];
    foregroundPixels.data[offset + 2] = sourcePixels.data[offset + 2];
    foregroundPixels.data[offset + 3] = Math.min(maskAlpha, sourcePixels.data[offset + 3]);
  }
  return foregroundPixels;
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("人物图片暂时无法读取，请换一张图片重试。"));
    image.src = source;
  });
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("人物图片转换失败，请重试。")), "image/png"));
}

function characterBounds(nodes, width, height) {
  if (!nodes?.length) return { x: 0, y: 0, width, height };
  const xs = nodes.map((node) => clamp(Number(node.x) / 100, 0, 1) * width);
  const ys = nodes.map((node) => clamp(Number(node.y) / 100, 0, 1) * height);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);
  const spanX = Math.max(width * .12, right - left);
  const spanY = Math.max(height * .18, bottom - top);
  const padX = Math.max(width * .065, spanX * .55);
  const padTop = Math.max(height * .11, spanY * .22);
  const padBottom = Math.max(height * .07, spanY * .18);
  const x = Math.floor(clamp(left - padX, 0, width - 1));
  const y = Math.floor(clamp(top - padTop, 0, height - 1));
  const x2 = Math.ceil(clamp(right + padX, x + 1, width));
  const y2 = Math.ceil(clamp(bottom + padBottom, y + 1, height));
  return { x, y, width: x2 - x, height: y2 - y };
}

function cropSource(image, nodes) {
  const bounds = characterBounds(nodes, image.naturalWidth, image.naturalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = bounds.width;
  canvas.height = bounds.height;
  canvas.getContext("2d", { willReadFrequently: true }).drawImage(image, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height);
  return { canvas, bounds };
}

function keepJointConnectedForeground(pixels, sourcePixels, width, height, nodes, bounds, sourceSize) {
  const length = width * height;
  const core = new Uint8Array(length);
  const alphaAt = (x, y) => pixels.data[(y * width + x) * 4 + 3];
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      let solid = true;
      for (let dy = -1; dy <= 1 && solid; dy += 1) for (let dx = -1; dx <= 1; dx += 1) if (alphaAt(x + dx, y + dy) < 96) { solid = false; break; }
      if (solid) core[y * width + x] = 1;
    }
  }

  const labels = new Int32Array(length);
  const areas = [0];
  const queue = new Int32Array(length);
  let label = 0;
  for (let index = 0; index < length; index += 1) {
    if (!core[index] || labels[index]) continue;
    label += 1;
    let start = 0;
    let end = 1;
    queue[0] = index;
    labels[index] = label;
    let area = 0;
    while (start < end) {
      const current = queue[start++];
      area += 1;
      const x = current % width;
      const y = Math.floor(current / width);
      for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) {
        if (!dx && !dy) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const next = ny * width + nx;
        if (core[next] && !labels[next]) { labels[next] = label; queue[end++] = next; }
      }
    }
    areas[label] = area;
  }

  const selected = new Set();
  const searchRadius = Math.max(8, Math.round(Math.min(width, height) * .08));
  nodes.forEach((node) => {
    const x = clamp(Math.round(Number(node.x) / 100 * sourceSize.width - bounds.x), 0, width - 1);
    const y = clamp(Math.round(Number(node.y) / 100 * sourceSize.height - bounds.y), 0, height - 1);
    let bestLabel = 0;
    let bestDistance = Infinity;
    for (let dy = -searchRadius; dy <= searchRadius; dy += 1) for (let dx = -searchRadius; dx <= searchRadius; dx += 1) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const candidate = labels[ny * width + nx];
      const distance = dx * dx + dy * dy;
      if (candidate && distance < bestDistance) { bestLabel = candidate; bestDistance = distance; }
    }
    if (bestLabel) selected.add(bestLabel);
  });
  if (!selected.size && label) selected.add(areas.indexOf(Math.max(...areas)));

  const keep = new Uint8Array(length);
  const edge = [];
  for (let index = 0; index < length; index += 1) if (selected.has(labels[index])) { keep[index] = 1; edge.push(index); }
  const dilation = Math.max(3, Math.min(10, Math.round(Math.min(width, height) * .018)));
  for (let step = 0, frontier = edge; step < dilation; step += 1) {
    const nextFrontier = [];
    frontier.forEach((current) => {
      const x = current % width;
      const y = Math.floor(current / width);
      for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const next = ny * width + nx;
        if (!keep[next]) { keep[next] = 1; nextFrontier.push(next); }
      }
    });
    frontier = nextFrontier;
  }
  for (let index = 0; index < length; index += 1) if (!keep[index]) pixels.data[index * 4 + 3] = 0;

  let closed = new Uint8Array(length);
  for (let index = 0; index < length; index += 1) if (pixels.data[index * 4 + 3] > 18) closed[index] = 1;
  const closingRadius = Math.max(2, Math.min(5, Math.round(Math.min(width, height) * .016)));
  for (let step = 0; step < closingRadius; step += 1) {
    const expanded = new Uint8Array(closed);
    for (let index = 0; index < length; index += 1) if (closed[index]) {
      const x = index % width;
      const y = Math.floor(index / width);
      for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < width && ny < height) expanded[ny * width + nx] = 1;
      }
    }
    closed = expanded;
  }
  for (let step = 0; step < closingRadius; step += 1) {
    const contracted = new Uint8Array(closed);
    for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) if (closed[y * width + x]) {
      let solid = true;
      for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height || !closed[ny * width + nx]) solid = false;
      }
      if (!solid) contracted[y * width + x] = 0;
    }
    closed = contracted;
  }
  const exterior = new Uint8Array(length);
  let exteriorStart = 0;
  let exteriorEnd = 0;
  const addExterior = (index) => { if (!closed[index] && !exterior[index]) { exterior[index] = 1; queue[exteriorEnd++] = index; } };
  for (let x = 0; x < width; x += 1) { addExterior(x); addExterior((height - 1) * width + x); }
  for (let y = 0; y < height; y += 1) { addExterior(y * width); addExterior(y * width + width - 1); }
  while (exteriorStart < exteriorEnd) {
    const current = queue[exteriorStart++];
    const x = current % width;
    const y = Math.floor(current / width);
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) return;
      addExterior(ny * width + nx);
    });
  }
  for (let index = 0; index < length; index += 1) if (!exterior[index]) {
    const offset = index * 4;
    pixels.data[offset] = sourcePixels.data[offset];
    pixels.data[offset + 1] = sourcePixels.data[offset + 1];
    pixels.data[offset + 2] = sourcePixels.data[offset + 2];
    pixels.data[offset + 3] = 255;
  }

  const jointPoint = (pattern) => {
    const node = nodes.find((candidate) => pattern.test(candidate.label));
    return node ? { x: Number(node.x) / 100 * sourceSize.width - bounds.x, y: Number(node.y) / 100 * sourceSize.height - bounds.y } : null;
  };
  const head = jointPoint(/头/);
  const body = jointPoint(/身体|躯干|胸/);
  const leftShoulder = jointPoint(/左肩/);
  const rightShoulder = jointPoint(/右肩/);
  const leftHip = jointPoint(/左髋|左胯/);
  const rightHip = jointPoint(/右髋|右胯/);
  const shoulderWidth = leftShoulder && rightShoulder ? Math.hypot(leftShoulder.x - rightShoulder.x, leftShoulder.y - rightShoulder.y) : Math.min(width, height) * .24;
  const limbRadius = Math.max(3, shoulderWidth * .11);
  const segments = [
    [leftShoulder, jointPoint(/左肘/)], [jointPoint(/左肘/), jointPoint(/左手腕|左腕|左手/)],
    [rightShoulder, jointPoint(/右肘/)], [jointPoint(/右肘/), jointPoint(/右手腕|右腕|右手/)],
    [leftHip, jointPoint(/左膝/)], [jointPoint(/左膝/), jointPoint(/左脚踝|左踝|左脚/)],
    [rightHip, jointPoint(/右膝/)], [jointPoint(/右膝/), jointPoint(/右脚踝|右踝|右脚/)],
  ].filter(([from,to]) => from && to);
  const torso = leftShoulder && rightShoulder && leftHip && rightHip ? [leftShoulder, rightShoulder, rightHip, leftHip] : [];
  const insidePolygon = (x, y, polygon) => {
    let inside = false;
    for (let first = 0, second = polygon.length - 1; first < polygon.length; second = first++) {
      const a = polygon[first];
      const b = polygon[second];
      if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) inside = !inside;
    }
    return inside;
  };
  const distanceToSegment = (x, y, from, to) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const amount = clamp(((x - from.x) * dx + (y - from.y) * dy) / Math.max(1, dx * dx + dy * dy), 0, 1);
    return Math.hypot(x - (from.x + amount * dx), y - (from.y + amount * dy));
  };
  const headRadiusX = head ? Math.max(shoulderWidth * .66, width * .12) : 0;
  const headRadiusY = head && body ? Math.max(Math.abs(body.y - head.y) * .52, headRadiusX * .72) : headRadiusX;
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const inHead = head && ((x - head.x) / headRadiusX) ** 2 + ((y - head.y) / headRadiusY) ** 2 <= 1;
    const inBody = torso.length && insidePolygon(x, y, torso);
    const inLimb = segments.some(([from,to]) => distanceToSegment(x, y, from, to) <= limbRadius);
    if (!inHead && !inBody && !inLimb) continue;
    const offset = (y * width + x) * 4;
    pixels.data[offset] = sourcePixels.data[offset];
    pixels.data[offset + 1] = sourcePixels.data[offset + 1];
    pixels.data[offset + 2] = sourcePixels.data[offset + 2];
    pixels.data[offset + 3] = 255;
  }
}

function trimForeground(foreground, sourceCanvas, bounds, nodes, sourceSize) {
  const scan = document.createElement("canvas");
  scan.width = foreground.naturalWidth;
  scan.height = foreground.naturalHeight;
  const scanContext = scan.getContext("2d", { willReadFrequently: true });
  scanContext.drawImage(foreground, 0, 0);
  const pixels = scanContext.getImageData(0, 0, scan.width, scan.height);
  const sourcePixels = sourceCanvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  keepJointConnectedForeground(pixels, sourcePixels, scan.width, scan.height, nodes, bounds, sourceSize);
  // The segmentation model supplies only the alpha mask. Always take visible RGB
  // values from the source artwork so white fills and original line colors cannot
  // be replaced by the model's black/premultiplied foreground pixels.
  restoreForegroundColors(pixels, sourcePixels);
  scanContext.putImageData(pixels, 0, 0);
  let left = scan.width;
  let top = scan.height;
  let right = -1;
  let bottom = -1;
  let solidPixels = 0;
  for (let y = 0; y < scan.height; y += 1) {
    for (let x = 0; x < scan.width; x += 1) {
      const alpha = pixels.data[(y * scan.width + x) * 4 + 3];
      if (alpha > 18) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
      if (alpha > 128) solidPixels += 1;
    }
  }
  if (right < left || bottom < top) throw new Error("没有找到完整人物。请把关节点放在人物身上后重试。");
  const coverage = solidPixels / (scan.width * scan.height);
  if (coverage > .92) throw new Error("人物和背景没有成功分开。请调整关节点范围，或换一张人物更清楚的图片。");
  const padding = Math.max(8, Math.round(Math.min(scan.width, scan.height) * .035));
  const contentWidth = right - left + 1;
  const contentHeight = bottom - top + 1;
  const outputWidth = contentWidth + padding * 2;
  const outputHeight = contentHeight + padding * 2;
  const output = document.createElement("canvas");
  output.width = outputWidth;
  output.height = outputHeight;
  output.getContext("2d").drawImage(scan, left, top, contentWidth, contentHeight, padding, padding, contentWidth, contentHeight);
  const restore = document.createElement("canvas");
  restore.width = outputWidth;
  restore.height = outputHeight;
  restore.getContext("2d").drawImage(sourceCanvas, left, top, contentWidth, contentHeight, padding, padding, contentWidth, contentHeight);
  const adjustedNodes = nodes.map((node) => {
    const sourceX = Number(node.x) / 100 * sourceSize.width;
    const sourceY = Number(node.y) / 100 * sourceSize.height;
    return {
      ...node,
      x: clamp(((sourceX - bounds.x - left + padding) / outputWidth) * 100, 1, 99),
      y: clamp(((sourceY - bounds.y - top + padding) / outputHeight) * 100, 1, 99),
    };
  });
  return { url: output.toDataURL("image/png"), restoreUrl: restore.toDataURL("image/png"), size: { width: outputWidth, height: outputHeight }, nodes: adjustedNodes, coverage, backend: "local-isnet-fp16" };
}

async function runLocalSegmentation(blob, onProgress) {
  const progress = (key, current, total) => onProgress?.({ key, percent: total > 0 ? clamp(Math.round(current / total * 100), 0, 100) : 0 });
  const baseConfig = { model: "isnet_fp16", output: { format: "image/png", quality: 1 }, progress };
  if (navigator.gpu) {
    try {
      return await removeBackground(blob, { ...baseConfig, device: "gpu", proxyToWorker: true });
    } catch (error) {
      console.warn("WebGPU segmentation unavailable; retrying on CPU:", error.message);
    }
  }
  try {
    // IMG.LY documents that worker proxying is not supported by the WASM/CPU backend.
    return await removeBackground(blob, { ...baseConfig, device: "cpu", proxyToWorker: false });
  } catch (error) {
    throw new Error(`本机人物识别没有成功启动：${error.message || "模型加载失败"}`);
  }
}

export async function extractCharacterForeground(imageUrl, nodes, { onProgress } = {}) {
  const image = await loadImage(imageUrl);
  const sourceSize = { width: image.naturalWidth, height: image.naturalHeight };
  const { canvas, bounds } = cropSource(image, nodes);
  onProgress?.({ key: "prepare", percent: 100 });
  const foregroundBlob = await runLocalSegmentation(await canvasToBlob(canvas), onProgress);
  const foregroundUrl = URL.createObjectURL(foregroundBlob);
  try {
    return trimForeground(await loadImage(foregroundUrl), canvas, bounds, nodes, sourceSize);
  } finally {
    URL.revokeObjectURL(foregroundUrl);
  }
}
