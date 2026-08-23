import { useRef, useState } from "react";

const kinds = {
  house: { label: "我的房子", hint: "加入一栋新房子" },
  animal: { label: "我的动物", hint: "加入小猫、小鸟、恐龙或任何动物" },
  character: { label: "新伙伴", hint: "加入另一个人物伙伴" },
  prop: { label: "神奇道具", hint: "加入交通工具、植物、食物或其他物品" },
};
const colors = ["#17324d", "#ef493d", "#f2b72f", "#55a95d", "#4da9d9", "#8f63c7", "#f28bb2", "#fffdf7"];

function cropDrawing(canvas) {
  const context = canvas.getContext("2d");
  const { width, height } = canvas;
  const pixels = context.getImageData(0, 0, width, height);
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = pixels.data[(y * width + x) * 4 + 3];
      if (alpha > 8) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
  }
  if (right < left || bottom < top) return null;

  const padding = Math.max(18, Math.round(Math.max(right - left, bottom - top) * 0.08));
  left = Math.max(0, left - padding);
  top = Math.max(0, top - padding);
  right = Math.min(width - 1, right + padding);
  bottom = Math.min(height - 1, bottom + padding);
  const output = document.createElement("canvas");
  output.width = right - left + 1;
  output.height = bottom - top + 1;
  output.getContext("2d").putImageData(context.getImageData(left, top, output.width, output.height), 0, 0);
  return output.toDataURL("image/png");
}

export default function ObjectDrawingEditor({ onAdd, onClose }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [kind, setKind] = useState("house");
  const [placementMode, setPlacementMode] = useState("add");
  const [name, setName] = useState(kinds.house.label);
  const [color, setColor] = useState(colors[1]);
  const [size, setSize] = useState(16);
  const [tool, setTool] = useState("brush");
  const [hasDrawing, setHasDrawing] = useState(false);

  const pointFromEvent = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * canvas.width, y: ((event.clientY - rect.top) / rect.height) * canvas.height };
  };

  const configureBrush = (context) => {
    context.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    context.strokeStyle = color;
    context.fillStyle = color;
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
    configureBrush(context);
    context.beginPath();
    context.arc(point.x, point.y, size / 2, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.moveTo(point.x, point.y);
    setHasDrawing(true);
  };

  const draw = (event) => {
    if (!drawingRef.current) return;
    const context = canvasRef.current.getContext("2d");
    const point = pointFromEvent(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    canvasRef.current?.getContext("2d").closePath();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
  };

  const addToWorld = () => {
    const imageUrl = cropDrawing(canvasRef.current);
    if (!imageUrl) return;
    onAdd({ kind, label: name.trim() || kinds[kind].label, placementMode, imageUrl });
  };

  return (
    <div className="world-drawing-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="world-drawing-editor object-drawing-editor" role="dialog" aria-modal="true" aria-labelledby="object-drawing-title">
        <header><div><span>添加画作</span><h2 id="object-drawing-title">画一个新东西放进世界</h2></div><button type="button" onClick={onClose} aria-label="关闭添加画作">×</button></header>

        <div className="object-kind-picker" aria-label="画作类型">
          {Object.entries(kinds).map(([key, value]) => <button type="button" key={key} className={kind === key ? "is-active" : ""} onClick={() => { setKind(key); setName(value.label); }} aria-pressed={kind === key}><b>{value.label}</b><small>{value.hint}</small></button>)}
        </div>

        <div className="object-placement-mode" aria-label="加入方式">
          <button type="button" className={placementMode === "add" ? "is-active" : ""} onClick={() => setPlacementMode("add")} aria-pressed={placementMode === "add"}>加入原场景</button>
          <button type="button" className={placementMode === "replace" ? "is-active" : ""} onClick={() => setPlacementMode("replace")} aria-pressed={placementMode === "replace"}>替换同类对象</button>
          <label>名字 <input value={name} maxLength="16" onChange={(event) => setName(event.target.value)} /></label>
        </div>

        <div className="world-drawing-tools">
          <div className="world-drawing-colors">{colors.map((item) => <button key={item} type="button" style={{ "--swatch": item }} className={tool === "brush" && color === item ? "is-active" : ""} onClick={() => { setColor(item); setTool("brush"); }} aria-label={`选择颜色 ${item}`} />)}</div>
          <button type="button" className={tool === "brush" ? "is-active" : ""} onClick={() => setTool("brush")}>画笔</button>
          <button type="button" className={tool === "eraser" ? "is-active" : ""} onClick={() => setTool("eraser")}>橡皮擦</button>
          <label>粗细 <input type="range" min="4" max="48" value={size} onChange={(event) => setSize(Number(event.target.value))} /></label>
        </div>

        <div className="world-drawing-paper is-house"><canvas ref={canvasRef} width="900" height="600" onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerCancel={stopDrawing} aria-label="绘画新对象的画布" /></div>

        <footer><p>{placementMode === "add" ? "它会作为一个全新的对象加入，不会删除原来的东西。" : "它会隐藏场景里原有的同类对象，并接替它的位置。"}</p><div><button type="button" onClick={clear}>清空</button><button className="primary-button" type="button" disabled={!hasDrawing} onClick={addToWorld}>加入游戏世界 <span aria-hidden="true">＋</span></button></div></footer>
      </section>
    </div>
  );
}
