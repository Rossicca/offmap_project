import { useEffect, useMemo, useRef, useState } from "react";
import DrawingEnhancementPicker from "./DrawingEnhancementPicker";
import { enhanceDrawing } from "../utils/enhanceDrawing";

const templates = {
  human: { label: "人物", nodes: [["头",50,18],["身体",50,43],["左肩",38,34],["左肘",27,48],["右肩",62,34],["右肘",73,48],["左髋",44,58],["左膝",42,76],["右髋",56,58],["右膝",58,76]] },
  dog: { label: "小狗", nodes: [["头",30,38],["躯干",54,50],["左前腿",40,68],["右前腿",48,70],["左后腿",63,69],["右后腿",72,68],["尾巴",82,38]] },
  rabbit: { label: "兔子", nodes: [["头",50,29],["身体",50,57],["左耳",42,10],["右耳",58,10],["左前爪",36,56],["右前爪",64,56],["左后腿",43,76],["右后腿",57,76],["尾巴",72,58]] },
};

export default function RigEditor({ analysis, onConfirm, onCancel }) {
  const originalPreviewUrl = analysis.originalPreviewUrl || analysis.previewUrl;
  const boardRef = useRef(null);
  const dragRef = useRef(null);
  const enhancementRequestRef = useRef(0);
  const enhancementAbortRef = useRef(null);
  const enhancementCacheRef = useRef(new Map([
    ["original", originalPreviewUrl],
    ...(analysis.enhancementLevel && analysis.enhancementLevel !== "original"
      ? [[analysis.enhancementLevel, analysis.previewUrl]]
      : []),
  ]));
  const detectedType = analysis.rigAnalysis?.person?.type;
  const initialSpecies = detectedType === "兔子" ? "rabbit" : detectedType === "狗" || detectedType === "小狗" ? "dog" : "human";
  const detectedNodes = analysis.rigAnalysis?.person?.nodes;
  const [species, setSpecies] = useState(initialSpecies);
  const [nodes, setNodes] = useState(() => detectedNodes?.length ? detectedNodes : templates[initialSpecies].nodes.map(([label,x,y]) => ({ label, x, y })));
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [enhancementLevel, setEnhancementLevel] = useState(analysis.enhancementLevel || "original");
  const [previewUrl, setPreviewUrl] = useState(analysis.previewUrl);
  const [enhancementBusy, setEnhancementBusy] = useState(false);
  const [enhancementError, setEnhancementError] = useState("");
  const template = useMemo(() => templates[species], [species]);
  const [boardSize, setBoardSize] = useState({ width: 1, height: 1 });
  const imageAspect = analysis.imageSize ? analysis.imageSize.width / analysis.imageSize.height : null;

  useEffect(() => {
    if (!boardRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => setBoardSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(boardRef.current);
    return () => observer.disconnect();
  }, []);

  const imageRect = useMemo(() => {
    if (!imageAspect) return { x: 0, y: 0, width: boardSize.width, height: boardSize.height };
    const boardAspect = boardSize.width / boardSize.height;
    if (imageAspect > boardAspect) {
      const height = boardSize.width / imageAspect;
      return { x: 0, y: (boardSize.height - height) / 2, width: boardSize.width, height };
    }
    const width = boardSize.height * imageAspect;
    return { x: (boardSize.width - width) / 2, y: 0, width, height: boardSize.height };
  }, [boardSize, imageAspect]);

  const displayNode = (node) => ({
    x: ((imageRect.x + node.x / 100 * imageRect.width) / boardSize.width) * 100,
    y: ((imageRect.y + node.y / 100 * imageRect.height) / boardSize.height) * 100,
  });

  useEffect(() => () => enhancementAbortRef.current?.abort(), []);

  const chooseTemplate = (nextSpecies) => {
    setSpecies(nextSpecies);
    setNodes(templates[nextSpecies].nodes.map(([label,x,y]) => ({ label, x, y })));
  };

  const chooseEnhancement = async (level) => {
    const request = ++enhancementRequestRef.current;
    enhancementAbortRef.current?.abort();
    enhancementAbortRef.current = null;
    setEnhancementLevel(level);
    setEnhancementError("");
    const cached = enhancementCacheRef.current.get(level);
    if (cached) {
      setPreviewUrl(cached);
      setEnhancementBusy(false);
      return;
    }
    setEnhancementBusy(true);
    const controller = new AbortController();
    enhancementAbortRef.current = controller;
    try {
      const result = await enhanceDrawing(originalPreviewUrl, level, { signal: controller.signal });
      enhancementCacheRef.current.set(level, result);
      if (request === enhancementRequestRef.current) setPreviewUrl(result);
    } catch (error) {
      if (request === enhancementRequestRef.current && error.name !== "AbortError") {
        setEnhancementLevel("original");
        setPreviewUrl(originalPreviewUrl);
        setEnhancementError(error.message || "画面调整失败，请继续使用原图。");
      }
    } finally {
      if (request === enhancementRequestRef.current) {
        enhancementAbortRef.current = null;
        setEnhancementBusy(false);
      }
    }
  };

  const startNodeDrag = (index, event) => {
    if (event.button !== 0) return;
    const board = boardRef.current;
    const rect = board?.getBoundingClientRect();
    if (!board || !rect) return;
    const originX = rect.left + board.clientLeft;
    const originY = rect.top + board.clientTop;
    const point = displayNode(nodes[index]);
    dragRef.current = {
      index,
      pointerId: event.pointerId,
      offsetX: event.clientX - (originX + board.clientWidth * point.x / 100),
      offsetY: event.clientY - (originY + board.clientHeight * point.y / 100),
    };
    setDraggingIndex(index);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveNode = (index, event) => {
    const drag = dragRef.current;
    if (!drag || drag.index !== index || drag.pointerId !== event.pointerId) return;
    const board = boardRef.current;
    const rect = board.getBoundingClientRect();
    const originX = rect.left + board.clientLeft;
    const originY = rect.top + board.clientTop;
    const boardX = event.clientX - drag.offsetX - originX;
    const boardY = event.clientY - drag.offsetY - originY;
    const halfWidth = (event.currentTarget.offsetWidth / 2 / imageRect.width) * 100 + .5;
    const halfHeight = (event.currentTarget.offsetHeight / 2 / imageRect.height) * 100 + .5;
    const x = Math.max(halfWidth, Math.min(100 - halfWidth, ((boardX - imageRect.x) / imageRect.width) * 100));
    const y = Math.max(halfHeight, Math.min(100 - halfHeight, ((boardY - imageRect.y) / imageRect.height) * 100));
    setNodes((current) => current.map((node, nodeIndex) => nodeIndex === index ? { ...node, x, y } : node));
  };

  const finishNodeDrag = (index, event) => {
    const drag = dragRef.current;
    if (!drag || drag.index !== index || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDraggingIndex(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const confirm = () => onConfirm({
    ...analysis,
    originalPreviewUrl,
    previewUrl,
    enhancementLevel,
    needsRigSetup: false,
    rigAnalysis: {
      ...analysis.rigAnalysis,
      person: { type: detectedNodes?.length ? detectedType : template.label, joints: nodes.length, movable: nodes.map((node) => node.label), nodes, source: detectedNodes?.length ? "ark-vision-reviewed" : "user-calibrated-template" },
    },
  });

  return (
    <main className="rig-editor-page">
      <header className="rig-editor-header"><div className="wordmark"><span>✦</span><b>AI 画伴</b></div><button type="button" onClick={onCancel}>返回主页</button></header>
      <section className="rig-editor-intro"><div><h1>{detectedNodes?.length ? "AI 已找到关节" : "把关节放到"}<br /><em>{detectedNodes?.length ? "请检查一下" : "正确的位置"}</em></h1><p>{detectedNodes?.length ? `视觉模型识别到 ${detectedNodes.length} 个关节。拖动不准确的节点后即可进入世界。` : "请选择最接近的角色模板并拖动节点校准。"}</p></div><span>第 2 步，共 3 步</span></section>
      <section className="rig-editor-workspace">
        <div className="rig-canvas" ref={boardRef} style={{ backgroundImage: `url(${previewUrl})` }} aria-label="关节校准画布">
          {nodes.map((node, index) => { const point = displayNode(node); return <button key={`${node.label}-${index}`} className={`rig-node ${draggingIndex === index ? "is-dragging" : ""}`} type="button" style={{ left: `${point.x}%`, top: `${point.y}%` }} onDragStart={(event) => event.preventDefault()} onPointerDown={(event) => startNodeDrag(index, event)} onPointerMove={(event) => moveNode(index, event)} onPointerUp={(event) => finishNodeDrag(index, event)} onPointerCancel={(event) => finishNodeDrag(index, event)} aria-label={`拖动${node.label}`}><i /><b>{node.label}</b></button>; })}
        </div>
        <aside className="rig-controls">
          <DrawingEnhancementPicker value={enhancementLevel} busy={enhancementBusy} error={enhancementError} onChange={chooseEnhancement} />
          <div><h2>{detectedNodes?.length ? "识别结果" : "角色类型"}</h2><p>{detectedNodes?.length ? `模型判断为${detectedType || template.label}；如有偏差可直接拖动红点。` : "不同动物会使用不同的可动节点。"}</p></div>
          <div className="rig-template-switch" aria-label="关节模板">{Object.entries(templates).map(([key,value]) => <button type="button" key={key} className={species === key ? "is-active" : ""} onClick={() => chooseTemplate(key)} aria-pressed={species === key}>{value.label}<small>{value.nodes.length} 个节点</small></button>)}</div>
          <div className="rig-node-list"><h3>当前节点</h3><div>{nodes.map((node) => <span key={node.label}>{node.label}</span>)}</div></div>
          <p className="rig-hint"><b>操作提示</b> 按住红色节点拖动；节点名称会跟着移动。确认后仍可在互动世界中显示或隐藏关节。</p>
          <button className="primary-button" type="button" onClick={confirm} disabled={enhancementBusy}>{enhancementBusy ? "正在调整画面…" : "确认关节，继续画背景"} {!enhancementBusy && <span aria-hidden="true">→</span>}</button>
        </aside>
      </section>
    </main>
  );
}
