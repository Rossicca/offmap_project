import { useEffect, useMemo, useRef, useState } from "react";
import DrawingEnhancementPicker from "./DrawingEnhancementPicker";
import CharacterCutoutReview from "./CharacterCutoutReview";
import { enhanceDrawing } from "../utils/enhanceDrawing";
import { extractCharacterForeground } from "../utils/extractCharacterForeground";

const templates = {
  human: { label: "人物", nodes: [["头",50,18],["身体",50,43],["左肩",38,34],["左肘",27,48],["右肩",62,34],["右肘",73,48],["左髋",44,58],["左膝",42,76],["右髋",56,58],["右膝",58,76]] },
  dog: { label: "小狗", nodes: [["头",30,38],["躯干",54,50],["左前腿",40,68],["右前腿",48,70],["左后腿",63,69],["右后腿",72,68],["尾巴",82,38]] },
  rabbit: { label: "兔子", nodes: [["头",50,29],["身体",50,57],["左耳",42,10],["右耳",58,10],["左前爪",36,56],["右前爪",64,56],["左后腿",43,76],["右后腿",57,76],["尾巴",72,58]] },
};

export default function RigEditor({ analysis, onConfirm, onCancel }) {
  const originalPreviewUrl = analysis.originalPreviewUrl || analysis.previewUrl;
  const boardRef = useRef(null);
  const cutoutReviewRef = useRef(null);
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
  const [cutoutResult, setCutoutResult] = useState(null);
  const [cutoutReviewReady, setCutoutReviewReady] = useState(false);
  const [cutoutBusy, setCutoutBusy] = useState(false);
  const [cutoutProgress, setCutoutProgress] = useState("");
  const [cutoutError, setCutoutError] = useState("");
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
    setCutoutResult(null);
    setCutoutError("");
    setSpecies(nextSpecies);
    setNodes(templates[nextSpecies].nodes.map(([label,x,y]) => ({ label, x, y })));
  };

  const chooseEnhancement = async (level) => {
    setCutoutResult(null);
    setCutoutError("");
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

  const finishRig = ({ foregroundUrl = null, cutoutSize = null, finalNodes = nodes, foregroundPrepared = false } = {}) => onConfirm({
    ...analysis,
    originalPreviewUrl,
    previewUrl,
    foregroundUrl,
    foregroundPrepared,
    cutoutSize,
    enhancementLevel,
    needsRigSetup: false,
    rigAnalysis: {
      ...analysis.rigAnalysis,
      person: { type: detectedNodes?.length ? detectedType : template.label, joints: finalNodes.length, movable: finalNodes.map((node) => node.label), nodes: finalNodes, source: detectedNodes?.length ? "ark-vision-reviewed" : "user-calibrated-template" },
    },
  });

  const prepareCutout = async () => {
    setCutoutBusy(true);
    setCutoutError("");
    setCutoutProgress("正在准备人物范围…");
    try {
      const result = await extractCharacterForeground(previewUrl, nodes, {
        onProgress: ({ key, percent }) => {
          if (/fetch|download|model|resource/i.test(key)) setCutoutProgress(`首次加载本机人物模型 ${percent}%`);
          else if (/inference|compute/i.test(key)) setCutoutProgress("正在识别人物轮廓…");
          else setCutoutProgress("正在整理透明边缘…");
        },
      });
      setCutoutReviewReady(false);
      setCutoutResult(result);
      setCutoutProgress("人物已经单独提取，请检查边缘。");
    } catch (error) {
      setCutoutError(error.message || "人物没有成功提取。请调整关节点后重试。");
      setCutoutProgress("");
    } finally {
      setCutoutBusy(false);
    }
  };

  const confirm = async () => {
    if (!cutoutResult) {
      await prepareCutout();
      return;
    }
    finishRig({ foregroundUrl: cutoutReviewRef.current?.exportPng() || cutoutResult.url, cutoutSize: cutoutResult.size, finalNodes: cutoutResult.nodes, foregroundPrepared: true });
  };

  return (
    <main className="rig-editor-page">
      <header className="rig-editor-header"><div className="wordmark"><span>✦</span><b>AI 画伴</b></div><button type="button" onClick={onCancel}>返回主页</button></header>
      <section className="rig-editor-intro"><div><h1>{cutoutResult ? "人物已经单独提取" : detectedNodes?.length ? "AI 已找到关节" : "把关节放到"}<br /><em>{cutoutResult ? "请检查边缘" : detectedNodes?.length ? "请检查一下" : "正确的位置"}</em></h1><p>{cutoutResult ? "透明格子表示已经移除的部分。需要时用画笔擦掉多余背景，或补回被误删的人物。" : detectedNodes?.length ? `视觉模型识别到 ${detectedNodes.length} 个关节。校准后将在本机提取人物，不会按白色删除画面。` : "请选择最接近的角色模板并拖动节点校准。"}</p></div><span>第 2 步，共 3 步</span></section>
      <section className="rig-editor-workspace">
        <div className={`rig-canvas ${cutoutResult ? "is-cutout-review" : ""}`} ref={boardRef} style={{ backgroundImage: cutoutResult ? "none" : `url(${previewUrl})` }} aria-label={cutoutResult ? "人物透明背景检查画布" : "关节校准画布"}>
          {cutoutResult
            ? <CharacterCutoutReview ref={cutoutReviewRef} result={cutoutResult} onReady={() => setCutoutReviewReady(true)} />
            : nodes.map((node, index) => { const point = displayNode(node); return <button key={`${node.label}-${index}`} className={`rig-node ${draggingIndex === index ? "is-dragging" : ""}`} type="button" style={{ left: `${point.x}%`, top: `${point.y}%` }} onDragStart={(event) => event.preventDefault()} onPointerDown={(event) => startNodeDrag(index, event)} onPointerMove={(event) => moveNode(index, event)} onPointerUp={(event) => finishNodeDrag(index, event)} onPointerCancel={(event) => finishNodeDrag(index, event)} aria-label={`拖动${node.label}`}><i /><b>{node.label}</b></button>; })}
          {cutoutBusy && <div className="cutout-processing" role="status"><i aria-hidden="true" /><b>{cutoutProgress}</b><span>首次使用需要下载约 80MB 模型，之后会从浏览器缓存读取。</span></div>}
        </div>
        <aside className="rig-controls">
          {!cutoutResult && <DrawingEnhancementPicker value={enhancementLevel} busy={enhancementBusy || cutoutBusy} error={enhancementError} onChange={chooseEnhancement} />}
          <div className={`cutout-status ${cutoutResult ? "is-ready" : ""}`} role="status"><h2>{cutoutResult ? "人物边缘检查" : "本机人物提取"}</h2><p>{cutoutResult ? "人物内部的白色会保留；透明格子不会进入背景。完成修边后即可继续。" : "使用关节范围定位人物，再生成独立透明 PNG。图片只在这台设备上处理。"}</p>{cutoutProgress && !cutoutBusy && <small>{cutoutProgress}</small>}{cutoutError && <small className="cutout-error">{cutoutError}</small>}</div>
          {!cutoutResult && <><div><h2>{detectedNodes?.length ? "识别结果" : "角色类型"}</h2><p>{detectedNodes?.length ? `模型判断为${detectedType || template.label}；如有偏差可直接拖动红点。` : "不同动物会使用不同的可动节点。"}</p></div>
          <div className="rig-template-switch" aria-label="关节模板">{Object.entries(templates).map(([key,value]) => <button type="button" key={key} className={species === key ? "is-active" : ""} onClick={() => chooseTemplate(key)} aria-pressed={species === key}>{value.label}<small>{value.nodes.length} 个节点</small></button>)}</div>
          <div className="rig-node-list"><h3>当前节点</h3><div>{nodes.map((node) => <span key={node.label}>{node.label}</span>)}</div></div>
          <p className="rig-hint"><b>操作提示</b> 红点范围会帮助模型避开周围的房子、云朵和其他物件。</p></>}
          {cutoutResult && <button className="cutout-retry" type="button" onClick={() => { setCutoutResult(null); setCutoutReviewReady(false); setCutoutProgress(""); }}>重新定位关节</button>}
          {cutoutError && !cutoutResult && <button className="cutout-fallback" type="button" onClick={() => finishRig()}>暂用原图继续</button>}
          <button className="primary-button" type="button" onClick={confirm} disabled={enhancementBusy || cutoutBusy || (cutoutResult && !cutoutReviewReady)}>{enhancementBusy ? "正在调整画面…" : cutoutBusy ? "正在提取人物…" : cutoutResult && !cutoutReviewReady ? "正在生成预览…" : cutoutResult ? "使用这个人物，继续画背景" : "提取人物并检查"} {!enhancementBusy && !cutoutBusy && (!cutoutResult || cutoutReviewReady) && <span aria-hidden="true">→</span>}</button>
        </aside>
      </section>
    </main>
  );
}
