import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

const sideDetails = {
  "visual-left": { label: "画面左边", color: "#ef8e77" },
  "visual-right": { label: "画面右边", color: "#5ca7c0" },
};

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("小手臂标注画布没有成功载入。"));
    image.src = source;
  });
}

function createCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function maskCentroid(mask, fallback) {
  const pixels = mask.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, mask.width, mask.height).data;
  let totalX = 0;
  let totalY = 0;
  let count = 0;
  const step = Math.max(1, Math.floor(Math.min(mask.width, mask.height) / 280));
  for (let y = 0; y < mask.height; y += step) {
    for (let x = 0; x < mask.width; x += step) {
      if (pixels[(y * mask.width + x) * 4 + 3] < 24) continue;
      totalX += x;
      totalY += y;
      count += 1;
    }
  }
  return count ? { x: totalX / count, y: totalY / count } : fallback;
}

function makeMaskOpaque(mask) {
  const context = mask.getContext("2d", { willReadFrequently: true });
  const pixels = context.getImageData(0, 0, mask.width, mask.height);
  for (let index = 3; index < pixels.data.length; index += 4) pixels.data[index] = pixels.data[index] > 16 ? 255 : 0;
  context.putImageData(pixels, 0, 0);
}

function findElbowDefinitions(nodes) {
  const elbows = nodes
    .filter((node) => /肘/.test(String(node.label || node.name || "")))
    .map((node) => ({ x: Number(node.x), y: Number(node.y), sourceLabel: node.label || node.name }))
    .filter((node) => Number.isFinite(node.x) && Number.isFinite(node.y))
    .sort((a, b) => a.x - b.x);
  if (!elbows.length) return [];
  if (elbows.length === 1) return [{ ...elbows[0], id: elbows[0].x < 50 ? "visual-left" : "visual-right" }];
  return [
    { ...elbows[0], id: "visual-left" },
    { ...elbows[elbows.length - 1], id: "visual-right" },
  ];
}

const ArmRigEditor = forwardRef(function ArmRigEditor({ imageUrl, nodes = [], onChange, onReady }, ref) {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const sourceImageRef = useRef(null);
  const sourcePixelsRef = useRef(null);
  const maskCanvasesRef = useRef({});
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const historyRef = useRef([]);
  const activeSideRef = useRef("visual-right");
  const definitions = useMemo(() => findElbowDefinitions(nodes), [nodes]);
  const [activeSide, setActiveSide] = useState(() => definitions.find((item) => item.id === "visual-right")?.id || definitions[0]?.id || "visual-right");
  const [tool, setTool] = useState("paint");
  const [brushPercent, setBrushPercent] = useState(5);
  const [coverage, setCoverage] = useState({});
  const [canUndo, setCanUndo] = useState(false);
  const [displaySize, setDisplaySize] = useState(null);
  const [loadError, setLoadError] = useState("");

  activeSideRef.current = activeSide;

  const fitWholeCharacter = () => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas?.width || !canvas?.height) return;
    const style = window.getComputedStyle(stage);
    const availableWidth = stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const availableHeight = stage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    if (availableWidth <= 0 || availableHeight <= 0) return;
    const scale = Math.min(availableWidth / canvas.width, availableHeight / canvas.height, 2);
    setDisplaySize({ width: Math.max(1, Math.floor(canvas.width * scale)), height: Math.max(1, Math.floor(canvas.height * scale)) });
  };

  const redraw = () => {
    const canvas = canvasRef.current;
    const image = sourceImageRef.current;
    if (!canvas || !image) return;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    definitions.forEach((definition) => {
      const mask = maskCanvasesRef.current[definition.id];
      if (!mask) return;
      context.save();
      context.globalAlpha = definition.id === activeSideRef.current ? .5 : .26;
      context.globalCompositeOperation = "source-atop";
      context.drawImage(mask, 0, 0);
      context.restore();
    });
    definitions.forEach((definition) => {
      const x = definition.x / 100 * canvas.width;
      const y = definition.y / 100 * canvas.height;
      const radius = Math.max(7, Math.min(canvas.width, canvas.height) * .015);
      context.save();
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = "#fff9d8";
      context.fill();
      context.lineWidth = Math.max(3, radius * .28);
      context.strokeStyle = sideDetails[definition.id].color;
      context.stroke();
      context.beginPath();
      context.arc(x, y, Math.max(2, radius * .23), 0, Math.PI * 2);
      context.fillStyle = sideDetails[definition.id].color;
      context.fill();
      context.restore();
    });
  };

  const updateCoverage = () => {
    const nextCoverage = {};
    definitions.forEach((definition) => {
      const mask = maskCanvasesRef.current[definition.id];
      if (!mask) return;
      const pixels = mask.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, mask.width, mask.height).data;
      const sourcePixels = sourcePixelsRef.current;
      let painted = false;
      for (let index = 3; index < pixels.length; index += 64) {
        if (pixels[index] > 20 && sourcePixels?.[index] > 20) { painted = true; break; }
      }
      nextCoverage[definition.id] = painted;
    });
    setCoverage(nextCoverage);
    onChange?.({ hasAny: Object.values(nextCoverage).some(Boolean), sides: nextCoverage });
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const observer = new ResizeObserver(fitWholeCharacter);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let active = true;
    setLoadError("");
    loadImage(imageUrl).then((image) => {
      if (!active) return;
      sourceImageRef.current = image;
      const canvas = canvasRef.current;
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const sourceCanvas = createCanvas(canvas.width, canvas.height);
      const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
      sourceContext.drawImage(image, 0, 0, canvas.width, canvas.height);
      sourcePixelsRef.current = sourceContext.getImageData(0, 0, canvas.width, canvas.height).data;
      maskCanvasesRef.current = Object.fromEntries(definitions.map((definition) => [definition.id, createCanvas(canvas.width, canvas.height)]));
      historyRef.current = [];
      setCanUndo(false);
      setCoverage({});
      redraw();
      fitWholeCharacter();
      onChange?.({ hasAny: false, sides: {} });
      onReady?.();
    }).catch((error) => setLoadError(error.message));
    return () => { active = false; };
  }, [imageUrl, definitions]);

  useEffect(redraw, [activeSide]);

  const pointFromEvent = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width * canvas.width,
      y: (event.clientY - rect.top) / rect.height * canvas.height,
    };
  };

  const brushRadius = () => Math.max(5, Math.min(canvasRef.current.width, canvasRef.current.height) * brushPercent / 100 / 2);

  const paintPoint = (point) => {
    const mask = maskCanvasesRef.current[activeSideRef.current];
    if (!mask) return;
    const radius = brushRadius();
    const context = mask.getContext("2d");
    context.save();
    context.globalCompositeOperation = tool === "paint" ? "source-over" : "destination-out";
    context.fillStyle = sideDetails[activeSideRef.current].color;
    context.beginPath();
    context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    context.fill();
    context.restore();
    if (tool === "paint") {
      definitions.filter((definition) => definition.id !== activeSideRef.current).forEach((definition) => {
        const other = maskCanvasesRef.current[definition.id];
        const otherContext = other?.getContext("2d");
        if (!otherContext) return;
        otherContext.save();
        otherContext.globalCompositeOperation = "destination-out";
        otherContext.beginPath();
        otherContext.arc(point.x, point.y, radius, 0, Math.PI * 2);
        otherContext.fill();
        otherContext.restore();
      });
    }
  };

  const paintLine = (from, to) => {
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(distance / Math.max(2, brushRadius() * .35)));
    for (let index = 0; index <= steps; index += 1) {
      paintPoint({ x: from.x + (to.x - from.x) * index / steps, y: from.y + (to.y - from.y) * index / steps });
    }
    redraw();
  };

  const startPaint = (event) => {
    if (event.button !== 0 || !maskCanvasesRef.current[activeSideRef.current]) return;
    const mask = maskCanvasesRef.current[activeSideRef.current];
    historyRef.current = [...historyRef.current.slice(-11), { side: activeSideRef.current, image: mask.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, mask.width, mask.height) }];
    setCanUndo(true);
    drawingRef.current = true;
    lastPointRef.current = pointFromEvent(event);
    paintPoint(lastPointRef.current);
    redraw();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const movePaint = (event) => {
    if (!drawingRef.current) return;
    const next = pointFromEvent(event);
    paintLine(lastPointRef.current, next);
    lastPointRef.current = next;
  };

  const finishPaint = (event) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPointRef.current = null;
    updateCoverage();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const clearActive = () => {
    const mask = maskCanvasesRef.current[activeSide];
    if (!mask) return;
    historyRef.current = [...historyRef.current.slice(-11), { side: activeSide, image: mask.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, mask.width, mask.height) }];
    mask.getContext("2d").clearRect(0, 0, mask.width, mask.height);
    setCanUndo(true);
    updateCoverage();
    redraw();
  };

  const undo = () => {
    const previous = historyRef.current.pop();
    if (!previous) return;
    const mask = maskCanvasesRef.current[previous.side];
    mask.getContext("2d").putImageData(previous.image, 0, 0);
    setActiveSide(previous.side);
    setCanUndo(historyRef.current.length > 0);
    updateCoverage();
    redraw();
  };

  useImperativeHandle(ref, () => ({
    exportRig: () => {
      const source = sourceImageRef.current;
      const canvas = canvasRef.current;
      if (!source || !canvas) return null;
      const completedDefinitions = definitions.filter((definition) => coverage[definition.id]);
      if (!completedDefinitions.length) return null;
      const workingMasks = completedDefinitions.map((definition) => {
        const mask = createCanvas(canvas.width, canvas.height);
        const context = mask.getContext("2d");
        context.drawImage(maskCanvasesRef.current[definition.id], 0, 0);
        const elbowPoint = { x: definition.x / 100 * canvas.width, y: definition.y / 100 * canvas.height };
        const centroid = maskCentroid(mask, elbowPoint);
        const elbowRadius = Math.max(7, Math.min(canvas.width, canvas.height) * .018);
        context.fillStyle = sideDetails[definition.id].color;
        context.beginPath();
        context.arc(elbowPoint.x, elbowPoint.y, elbowRadius, 0, Math.PI * 2);
        context.fill();
        makeMaskOpaque(mask);
        return { definition, mask, elbowRadius, centroid, elbowPoint };
      });
      const base = createCanvas(canvas.width, canvas.height);
      const baseContext = base.getContext("2d");
      baseContext.drawImage(source, 0, 0, canvas.width, canvas.height);
      workingMasks.forEach(({ mask }) => {
        baseContext.save();
        baseContext.globalCompositeOperation = "destination-out";
        baseContext.drawImage(mask, 0, 0);
        baseContext.restore();
      });
      workingMasks.forEach(({ definition, elbowRadius }) => {
        baseContext.save();
        baseContext.beginPath();
        baseContext.arc(definition.x / 100 * canvas.width, definition.y / 100 * canvas.height, elbowRadius * .58, 0, Math.PI * 2);
        baseContext.clip();
        baseContext.drawImage(source, 0, 0, canvas.width, canvas.height);
        baseContext.restore();
      });
      const arms = workingMasks.map(({ definition, mask, centroid, elbowPoint }) => {
        const layer = createCanvas(canvas.width, canvas.height);
        const context = layer.getContext("2d");
        context.drawImage(source, 0, 0, canvas.width, canvas.height);
        context.globalCompositeOperation = "destination-in";
        context.drawImage(mask, 0, 0);
        context.globalCompositeOperation = "source-over";
        const horizontalDirection = centroid.x >= elbowPoint.x ? 1 : -1;
        const raiseAngle = horizontalDirection > 0 ? -34 : 34;
        return {
          side: definition.sourceLabel || definition.id,
          visualSide: definition.id,
          elbow: { x: definition.x, y: definition.y },
          forearmUrl: layer.toDataURL("image/png"),
          motion: { raiseAngle, settleAngle: Math.round(raiseAngle * .72), maxDegrees: 38 },
        };
      });
      return { baseUrl: base.toDataURL("image/png"), arms, size: { width: canvas.width, height: canvas.height }, source: "child-painted-forearms" };
    },
  }), [coverage, definitions]);

  const selectedDetails = sideDetails[activeSide];
  return (
    <div className="arm-rig-editor">
      <div className="arm-rig-canvas" ref={stageRef}>
        <span className="arm-rig-tip">从手肘圆点开始，涂到小手</span>
        {loadError && <p role="alert">{loadError}</p>}
        <canvas ref={canvasRef} style={displaySize ? { width: `${displaySize.width}px`, height: `${displaySize.height}px` } : undefined} onPointerDown={startPaint} onPointerMove={movePaint} onPointerUp={finishPaint} onPointerCancel={finishPaint} role="img" aria-label="标记人物小手臂的画布" />
      </div>
      <div className="arm-rig-tools" aria-label="小手臂标记工具">
        <div className="arm-side-switch" aria-label="选择小手臂">
          {definitions.map((definition) => <button type="button" key={definition.id} className={activeSide === definition.id ? "is-active" : ""} onClick={() => setActiveSide(definition.id)} aria-pressed={activeSide === definition.id}><i style={{ background: sideDetails[definition.id].color }} />{sideDetails[definition.id].label}<small>{coverage[definition.id] ? "已标记" : "待标记"}</small></button>)}
        </div>
        <div className="arm-brush-tools">
          <button type="button" className={tool === "paint" ? "is-active" : ""} onClick={() => setTool("paint")} aria-pressed={tool === "paint"}>涂小手臂</button>
          <button type="button" className={tool === "erase" ? "is-active" : ""} onClick={() => setTool("erase")} aria-pressed={tool === "erase"}>擦掉多余</button>
          <label>笔刷 <input type="range" min="2" max="10" step="1" value={brushPercent} onChange={(event) => setBrushPercent(Number(event.target.value))} /></label>
          <button type="button" onClick={undo} disabled={!canUndo}>撤销</button>
          <button type="button" onClick={clearActive} disabled={!coverage[activeSide]}>清空{selectedDetails?.label}</button>
        </div>
      </div>
    </div>
  );
});

export default ArmRigEditor;
