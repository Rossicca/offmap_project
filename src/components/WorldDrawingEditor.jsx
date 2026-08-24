import { useEffect, useRef, useState } from "react";

const colors = ["#17324d", "#ef493d", "#f2b72f", "#55a95d", "#4da9d9", "#8f63c7", "#f28bb2", "#fffdf7"];
const backgroundPaper = "#e8f8ff";

export default function WorldDrawingEditor({ initialArt, initialMode = "background", onApply, onClose, embedded = false, backgroundOnly = false }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const draftsRef = useRef({ house: initialArt?.house || null, background: initialArt?.background || null });
  const hasContentRef = useRef({ house: Boolean(initialArt?.house), background: Boolean(initialArt?.background) });
  const [mode, setMode] = useState(initialMode);
  const [color, setColor] = useState(colors[1]);
  const [size, setSize] = useState(14);
  const [tool, setTool] = useState("brush");
  const [version, setVersion] = useState(0);
  const backgroundLayer = backgroundOnly || initialMode === "background";

  const prepareCanvas = (targetMode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    context.globalCompositeOperation = "source-over";
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (targetMode === "background" && !backgroundLayer) {
      context.fillStyle = backgroundPaper;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    const draft = draftsRef.current[targetMode];
    if (!draft) return;
    const image = new Image();
    image.onload = () => context.drawImage(image, 0, 0, canvas.width, canvas.height);
    image.src = draft;
  };

  useEffect(() => prepareCanvas(mode), [mode]);

  const saveCurrent = () => {
    draftsRef.current[mode] = hasContentRef.current[mode] ? canvasRef.current.toDataURL("image/png") : null;
  };

  const switchMode = (nextMode) => {
    saveCurrent();
    setMode(nextMode);
  };

  const pointFromEvent = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const setDrawingStyle = (context) => {
    const transparentEraser = tool === "eraser" && (mode === "house" || backgroundLayer);
    context.globalCompositeOperation = transparentEraser ? "destination-out" : "source-over";
    context.strokeStyle = tool === "eraser" && !transparentEraser ? backgroundPaper : color;
    context.fillStyle = context.strokeStyle;
    context.lineWidth = size;
    context.lineCap = "round";
    context.lineJoin = "round";
  };

  const startDrawing = (event) => {
    if (event.button !== 0) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const point = pointFromEvent(event);
    canvas.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    hasContentRef.current[mode] = true;
    setDrawingStyle(context);
    context.beginPath();
    context.arc(point.x, point.y, size / 2, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const draw = (event) => {
    if (!drawingRef.current) return;
    const context = canvasRef.current.getContext("2d");
    const point = pointFromEvent(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    canvasRef.current.getContext("2d").closePath();
    setVersion((value) => value + 1);
  };

  const resetCurrent = () => {
    draftsRef.current[mode] = null;
    hasContentRef.current[mode] = false;
    prepareCanvas(mode);
    setVersion((value) => value + 1);
  };

  const apply = () => {
    saveCurrent();
    onApply({ ...draftsRef.current });
  };

  const editor = (
      <section className={`world-drawing-editor ${embedded ? "is-embedded" : ""}`} role={embedded ? "region" : "dialog"} aria-modal={embedded ? undefined : "true"} aria-labelledby="world-drawing-title" data-version={version}>
        <header>
          <div><span>{backgroundOnly ? "绘梦伙伴 · 背景画板" : "绘梦伙伴 · 场景画板"}</span><h2 id="world-drawing-title">{backgroundOnly ? "画出完整的游戏世界" : "画自己的房子和背景"}</h2></div>
          {!embedded && <button type="button" onClick={onClose} aria-label="关闭场景画板">×</button>}
        </header>

        {!backgroundOnly && <div className="world-drawing-modes" aria-label="选择绘画内容">
          <button type="button" className={mode === "house" ? "is-active" : ""} onClick={() => switchMode("house")} aria-pressed={mode === "house"}>画房子</button>
          <button type="button" className={mode === "background" ? "is-active" : ""} onClick={() => switchMode("background")} aria-pressed={mode === "background"}>画背景</button>
        </div>}

        <div className="world-drawing-tools">
          <div className="world-drawing-colors">{colors.map((item) => <button key={item} type="button" style={{ "--swatch": item }} className={tool === "brush" && color === item ? "is-active" : ""} onClick={() => { setColor(item); setTool("brush"); }} aria-label={`选择颜色 ${item}`} />)}</div>
          <button type="button" className={tool === "brush" ? "is-active" : ""} onClick={() => setTool("brush")}>画笔</button>
          <button type="button" className={tool === "eraser" ? "is-active" : ""} onClick={() => setTool("eraser")}>橡皮擦</button>
          <label>粗细 <input type="range" min="4" max="44" value={size} onChange={(event) => setSize(Number(event.target.value))} /></label>
        </div>

        <div className={`world-drawing-paper is-${mode}`}>
          <canvas ref={canvasRef} width="900" height="600" onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerCancel={stopDrawing} aria-label={mode === "house" ? "绘画房子的画布" : "绘画背景的画布"} />
        </div>

        <footer>
          <p>{backgroundOnly ? "背景装饰会放在原始天空和草地上；房子、人物和道具都会继续保留。" : mode === "house" ? "画好后会换掉世界里的小房子。" : "背景装饰会放进原始世界，场景里的东西都会继续保留。"}</p>
          <div><button type="button" onClick={resetCurrent}>清空重画</button><button className="primary-button" type="button" disabled={backgroundOnly && !hasContentRef.current.background} onClick={apply}>{backgroundOnly ? "带背景进入世界" : "应用到游戏"} <span aria-hidden="true">✓</span></button></div>
        </footer>
      </section>
  );

  if (embedded) return editor;

  return (
    <div className="world-drawing-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      {editor}
    </div>
  );
}
