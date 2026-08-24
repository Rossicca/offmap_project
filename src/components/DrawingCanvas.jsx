import { useEffect, useRef, useState } from "react";

const colors = ["#17324d", "#ef493d", "#f2b72f", "#55a95d", "#4da9d9", "#8f63c7", "#f28bb2"];
const paperColor = "#fffdf7";

function exportCharacter(canvas, onComplete) {
  const context = canvas.getContext("2d");
  const { width, height } = canvas;
  const source = context.getImageData(0, 0, width, height);
  const paper = [255, 253, 247];
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const distance = Math.max(
        Math.abs(source.data[index] - paper[0]),
        Math.abs(source.data[index + 1] - paper[1]),
        Math.abs(source.data[index + 2] - paper[2]),
      );
      if (source.data[index + 3] > 0 && distance > 18) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
  }

  if (right < left || bottom < top) return;

  const padding = Math.max(18, Math.round(Math.max(right - left, bottom - top) * 0.06));
  left = Math.max(0, left - padding);
  top = Math.max(0, top - padding);
  right = Math.min(width - 1, right + padding);
  bottom = Math.min(height - 1, bottom + padding);

  const output = document.createElement("canvas");
  output.width = right - left + 1;
  output.height = bottom - top + 1;
  const outputContext = output.getContext("2d");
  const cropped = context.getImageData(left, top, output.width, output.height);

  for (let index = 0; index < cropped.data.length; index += 4) {
    const distance = Math.max(
      Math.abs(cropped.data[index] - paper[0]),
      Math.abs(cropped.data[index + 1] - paper[1]),
      Math.abs(cropped.data[index + 2] - paper[2]),
    );
    if (distance <= 18) cropped.data[index + 3] = 0;
    else if (distance < 48) cropped.data[index + 3] = Math.round(cropped.data[index + 3] * ((distance - 18) / 30));
  }

  outputContext.putImageData(cropped, 0, 0);
  output.toBlob((blob) => {
    if (!blob) return;
    onComplete(new File([blob], `我的画作-${Date.now()}.png`, { type: "image/png" }));
  }, "image/png");
}

export default function DrawingCanvas({ onComplete, busy, error, initialImageUrl = "", editingName = "" }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const historyRef = useRef([]);
  const historyIndexRef = useRef(0);
  const [color, setColor] = useState(colors[0]);
  const [size, setSize] = useState(10);
  const [tool, setTool] = useState("brush");
  const [historyVersion, setHistoryVersion] = useState(0);
  const [hasDrawing, setHasDrawing] = useState(false);

  const snapshot = (blank = false) => {
    const canvas = canvasRef.current;
    const next = historyRef.current.slice(0, historyIndexRef.current + 1);
    next.push({ image: canvas.toDataURL("image/png"), blank });
    historyRef.current = next.slice(-20);
    historyIndexRef.current = historyRef.current.length - 1;
    setHasDrawing(!blank);
    setHistoryVersion((value) => value + 1);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const resetPaper = () => {
      context.fillStyle = paperColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
    };
    const rememberInitialImage = (blank) => {
      historyRef.current = [{ image: canvas.toDataURL("image/png"), blank }];
      historyIndexRef.current = 0;
      setHasDrawing(!blank);
      setHistoryVersion(1);
    };

    resetPaper();
    if (!initialImageUrl) {
      rememberInitialImage(true);
      return undefined;
    }

    let active = true;
    const image = new Image();
    image.onload = () => {
      if (!active) return;
      resetPaper();
      const scale = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
      rememberInitialImage(false);
    };
    image.onerror = () => { if (active) rememberInitialImage(true); };
    image.src = initialImageUrl;
    return () => { active = false; };
  }, [initialImageUrl]);

  const pointFromEvent = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (event) => {
    if (event.button !== 0) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const point = pointFromEvent(event);
    canvas.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = size;
    context.strokeStyle = tool === "eraser" ? paperColor : color;
    context.fillStyle = context.strokeStyle;
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
    snapshot(false);
  };

  const restore = (index) => {
    const entry = historyRef.current[index];
    if (!entry) return;
    const image = new Image();
    image.onload = () => {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
      historyIndexRef.current = index;
      setHasDrawing(!entry.blank);
      setHistoryVersion((value) => value + 1);
    };
    image.src = entry.image;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.fillStyle = paperColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    snapshot(true);
  };

  const finish = () => {
    exportCharacter(canvasRef.current, onComplete);
  };

  const download = () => {
    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = "我的画作.png";
    link.click();
  };

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  return (
    <section className="drawing-canvas-studio" aria-labelledby="drawing-canvas-title" data-history-version={historyVersion}>
      <header className="drawing-canvas-heading">
        <div><span>绘梦伙伴 · {editingName ? "修改画作" : "自由画板"}</span><h2 id="drawing-canvas-title">{editingName ? `继续修改《${editingName}》` : "画出你的新朋友"}</h2></div>
        <p>{editingName ? "原画已经放回画板，可以继续绘制、擦除或调整颜色。完成后会更新原作品。" : "用画笔、颜色和橡皮擦完成作品，然后直接送进互动世界。"}</p>
      </header>

      <div className="drawing-toolbar" aria-label="绘画工具">
        <div className="drawing-colors" aria-label="画笔颜色">
          {colors.map((item) => <button key={item} type="button" style={{ "--swatch": item }} className={tool === "brush" && color === item ? "is-active" : ""} onClick={() => { setColor(item); setTool("brush"); }} aria-label={`选择颜色 ${item}`} aria-pressed={tool === "brush" && color === item} />)}
        </div>
        <button type="button" className={tool === "brush" ? "is-active" : ""} onClick={() => setTool("brush")} aria-pressed={tool === "brush"}>画笔</button>
        <button type="button" className={tool === "eraser" ? "is-active" : ""} onClick={() => setTool("eraser")} aria-pressed={tool === "eraser"}>橡皮擦</button>
        <label>粗细<input type="range" min="3" max="36" value={size} onChange={(event) => setSize(Number(event.target.value))} /></label>
        <div className="drawing-history-actions">
          <button type="button" disabled={!canUndo} onClick={() => restore(historyIndexRef.current - 1)}>撤销</button>
          <button type="button" disabled={!canRedo} onClick={() => restore(historyIndexRef.current + 1)}>重做</button>
          <button type="button" onClick={clearCanvas}>清空</button>
        </div>
      </div>

      <div className={`drawing-paper ${tool === "eraser" ? "is-erasing" : ""}`}>
        <canvas ref={canvasRef} width="900" height="600" onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerCancel={stopDrawing} aria-label="自由绘画画布" />
      </div>

      <footer className="drawing-canvas-footer">
        <p>{hasDrawing ? "画好以后，可以先保存 PNG，也可以直接让作品活起来。" : "在白纸上画几笔，完成按钮就会亮起来。"}</p>
        <div><button type="button" onClick={download}>保存 PNG</button><button className="primary-button" type="button" disabled={!hasDrawing || busy} onClick={finish}>{busy ? "正在生成骨架…" : editingName ? "完成修改，重新生成" : "完成绘画，让它活起来"} <span aria-hidden="true">→</span></button></div>
        {error && <p className="inline-error" role="alert">{error}</p>}
      </footer>
    </section>
  );
}
