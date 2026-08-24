import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("人物预览无法读取，请重新处理。"));
    image.src = source;
  });
}

const CharacterCutoutReview = forwardRef(function CharacterCutoutReview({ result, onReady }, ref) {
  const canvasRef = useRef(null);
  const restoreImageRef = useRef(null);
  const historyRef = useRef([]);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const [tool, setTool] = useState("erase");
  const [brushSize, setBrushSize] = useState(28);
  const [canUndo, setCanUndo] = useState(false);

  const resetCanvas = async () => {
    const [foreground, restore] = await Promise.all([loadImage(result.url), loadImage(result.restoreUrl)]);
    restoreImageRef.current = restore;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = result.size.width;
    canvas.height = result.size.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(foreground, 0, 0, canvas.width, canvas.height);
    historyRef.current = [];
    setCanUndo(false);
    onReady?.();
  };

  useEffect(() => { resetCanvas(); }, [result]);

  useImperativeHandle(ref, () => ({ exportPng: () => canvasRef.current.toDataURL("image/png") }));

  const pointFromEvent = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) / rect.width * canvas.width, y: (event.clientY - rect.top) / rect.height * canvas.height };
  };

  const paintPoint = (point) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const radius = brushSize / 2;
    context.save();
    context.beginPath();
    context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    context.clip();
    if (tool === "erase") {
      context.globalCompositeOperation = "destination-out";
      context.fillStyle = "rgba(0,0,0,.94)";
      context.fillRect(point.x - radius, point.y - radius, brushSize, brushSize);
    } else if (restoreImageRef.current) {
      context.globalCompositeOperation = "source-over";
      context.drawImage(restoreImageRef.current, 0, 0, canvas.width, canvas.height);
    }
    context.restore();
  };

  const paintLine = (from, to) => {
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(distance / Math.max(2, brushSize * .2)));
    for (let index = 0; index <= steps; index += 1) paintPoint({ x: from.x + (to.x - from.x) * index / steps, y: from.y + (to.y - from.y) * index / steps });
  };

  const startPaint = (event) => {
    if (event.button !== 0) return;
    const canvas = canvasRef.current;
    historyRef.current = [...historyRef.current.slice(-9), canvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height)];
    setCanUndo(true);
    drawingRef.current = true;
    lastPointRef.current = pointFromEvent(event);
    paintPoint(lastPointRef.current);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const movePaint = (event) => {
    if (!drawingRef.current) return;
    const next = pointFromEvent(event);
    paintLine(lastPointRef.current, next);
    lastPointRef.current = next;
  };

  const finishPaint = (event) => {
    drawingRef.current = false;
    lastPointRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const undo = () => {
    const previous = historyRef.current.pop();
    if (!previous) return;
    canvasRef.current.getContext("2d").putImageData(previous, 0, 0);
    setCanUndo(historyRef.current.length > 0);
  };

  return (
    <div className="cutout-review">
      <div className="cutout-review-canvas"><canvas ref={canvasRef} onPointerDown={startPaint} onPointerMove={movePaint} onPointerUp={finishPaint} onPointerCancel={finishPaint} role="img" aria-label="人物透明背景修正画布" /></div>
      <div className="cutout-review-tools" aria-label="人物边缘修正工具">
        <div className="cutout-tool-switch"><button type="button" className={tool === "erase" ? "is-active" : ""} onClick={() => setTool("erase")} aria-pressed={tool === "erase"}>擦掉多余</button><button type="button" className={tool === "restore" ? "is-active" : ""} onClick={() => setTool("restore")} aria-pressed={tool === "restore"}>补回人物</button></div>
        <label>笔刷大小 <input type="range" min="10" max="72" step="2" value={brushSize} onChange={(event) => setBrushSize(Number(event.target.value))} /></label>
        <button type="button" onClick={undo} disabled={!canUndo}>撤销一步</button>
        <button type="button" onClick={resetCanvas}>恢复自动结果</button>
      </div>
    </div>
  );
});

export default CharacterCutoutReview;
