import { useEffect, useMemo, useRef, useState } from "react";
import DrawingEnhancementPicker from "./DrawingEnhancementPicker";
import CharacterCutoutReview from "./CharacterCutoutReview";
import ArmRigEditor from "./ArmRigEditor";
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
  const armRigRef = useRef(null);
  const dragRef = useRef(null);
  const enhancementRequestRef = useRef(0);
  const enhancementAbortRef = useRef(null);
  const enhancementCacheRef = useRef(new Map([
    ["original", originalPreviewUrl],
    ...(analysis.enhancementLevel && analysis.enhancementLevel !== "original"
      ? [[`${analysis.enhancementLevel}:${analysis.enhancementStyleLock === false ? "flexible" : "storybook"}`, analysis.previewUrl]]
      : []),
  ]));
  const detectedType = analysis.rigAnalysis?.person?.type;
  const usingTemplateFallback = analysis.rigAnalysis?.person?.source === "local-template-fallback";
  const initialSpecies = detectedType === "兔子" ? "rabbit" : detectedType === "狗" || detectedType === "小狗" ? "dog" : "human";
  const detectedNodes = analysis.rigAnalysis?.person?.nodes;
  const [species, setSpecies] = useState(initialSpecies);
  const [nodes, setNodes] = useState(() => detectedNodes?.length ? detectedNodes : templates[initialSpecies].nodes.map(([label,x,y]) => ({ label, x, y })));
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [enhancementLevel, setEnhancementLevel] = useState(analysis.enhancementLevel || "original");
  const [styleLock, setStyleLock] = useState(analysis.enhancementStyleLock !== false);
  const [previewUrl, setPreviewUrl] = useState(analysis.previewUrl);
  const [enhancementBusy, setEnhancementBusy] = useState(false);
  const [enhancementError, setEnhancementError] = useState("");
  const [cutoutEnabled, setCutoutEnabled] = useState(false);
  const [cutoutResult, setCutoutResult] = useState(null);
  const [cutoutReviewReady, setCutoutReviewReady] = useState(false);
  const [cutoutBusy, setCutoutBusy] = useState(false);
  const [cutoutProgress, setCutoutProgress] = useState("");
  const [cutoutError, setCutoutError] = useState("");
  const [armRigging, setArmRigging] = useState(false);
  const [armRigSourceUrl, setArmRigSourceUrl] = useState("");
  const [armRigReady, setArmRigReady] = useState(false);
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

  const chooseEnhancement = async (level, locked = styleLock) => {
    setCutoutResult(null);
    setCutoutError("");
    const request = ++enhancementRequestRef.current;
    enhancementAbortRef.current?.abort();
    enhancementAbortRef.current = null;
    setEnhancementLevel(level);
    setEnhancementError("");
    const cacheKey = `${level}:${locked ? "storybook" : "flexible"}`;
    const cached = level === "original" ? originalPreviewUrl : enhancementCacheRef.current.get(cacheKey);
    if (cached) {
      setPreviewUrl(cached);
      setEnhancementBusy(false);
      return;
    }
    setEnhancementBusy(true);
    const controller = new AbortController();
    enhancementAbortRef.current = controller;
    try {
      const result = await enhanceDrawing(originalPreviewUrl, level, { signal: controller.signal, styleLock: locked });
      enhancementCacheRef.current.set(cacheKey, result);
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

  const chooseStyleLock = (locked) => {
    setStyleLock(locked);
    if (enhancementLevel !== "original") chooseEnhancement(enhancementLevel, locked);
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

  const finishRig = ({ foregroundUrl = null, cutoutSize = null, finalNodes = nodes, foregroundPrepared = false, cutoutApplied = false, armRig = null } = {}) => onConfirm({
    ...analysis,
    originalPreviewUrl,
    previewUrl,
    foregroundUrl,
    foregroundPrepared,
    cutoutApplied,
    armRig,
    cutoutSize,
    enhancementLevel,
    enhancementStyleLock: styleLock,
    needsRigSetup: false,
    rigAnalysis: {
      ...analysis.rigAnalysis,
      person: { type: detectedNodes?.length ? detectedType : template.label, joints: finalNodes.length, movable: finalNodes.map((node) => node.label), nodes: finalNodes, source: detectedNodes?.length ? "ark-vision-reviewed" : "user-calibrated-template" },
    },
  });

  const prepareCutout = async () => {
    if (!cutoutEnabled) return;
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

  const changeCutoutMode = (enabled) => {
    setCutoutEnabled(enabled);
    setCutoutError("");
    setCutoutProgress("");
    if (!enabled) {
      setCutoutResult(null);
      setCutoutReviewReady(false);
      setArmRigging(false);
      setArmRigSourceUrl("");
      setArmRigReady(false);
    }
  };

  const useOriginal = () => finishRig({
    foregroundUrl: previewUrl,
    cutoutSize: analysis.imageSize,
    foregroundPrepared: false,
    cutoutApplied: false,
  });

  const openArmRigEditor = () => {
    const reviewedUrl = cutoutReviewRef.current?.exportPng() || cutoutResult?.url;
    if (!reviewedUrl) return;
    setCutoutResult((current) => current ? { ...current, url: reviewedUrl } : current);
    setArmRigSourceUrl(reviewedUrl);
    setArmRigReady(false);
    setArmRigging(true);
  };

  const useCutoutWithoutArmRig = () => finishRig({
    foregroundUrl: armRigSourceUrl || cutoutReviewRef.current?.exportPng() || cutoutResult?.url,
    cutoutSize: cutoutResult?.size,
    finalNodes: cutoutResult?.nodes || nodes,
    foregroundPrepared: true,
    cutoutApplied: true,
    armRig: null,
  });

  const confirm = async () => {
    if (!cutoutEnabled) {
      useOriginal();
      return;
    }
    if (armRigging) {
      const armRig = armRigRef.current?.exportRig();
      if (!armRig) return;
      finishRig({ foregroundUrl: armRigSourceUrl, cutoutSize: cutoutResult.size, finalNodes: cutoutResult.nodes, foregroundPrepared: true, cutoutApplied: true, armRig });
      return;
    }
    if (!cutoutResult) {
      await prepareCutout();
      return;
    }
    openArmRigEditor();
  };

  return (
    <main className="rig-editor-page">
      <header className="rig-editor-header"><div className="wordmark"><span>✦</span><b>AI 画伴</b></div><button type="button" onClick={onCancel}>返回主页</button></header>
      <section className="rig-editor-intro"><div><h1>{armRigging ? "描出小手臂" : cutoutResult ? "人物已经单独提取" : detectedNodes?.length ? "AI 已找到关节" : "把关节放到"}<br /><em>{armRigging ? "让手肘自然动" : cutoutResult ? "请检查边缘" : detectedNodes?.length ? "请检查一下" : "正确的位置"}</em></h1><p>{armRigging ? "从手肘圆点涂到小手，只涂要转动的小手臂。动作会限制在自然角度，人物原图不会被改色。" : cutoutResult ? "透明格子表示已经移除的部分。需要时用画笔擦掉多余背景，或补回被误删的人物。" : detectedNodes?.length ? `视觉模型识别到 ${detectedNodes.length} 个关节。校准后将在本机提取人物，不会按白色删除画面。` : usingTemplateFallback ? "这次自动识别没有得到足够关节点，已自动换成可拖动模板。把红点放到角色对应位置即可继续。" : "请选择最接近的角色模板并拖动节点校准。"}</p></div><span>第 2 步，共 3 步</span></section>
      <section className="rig-editor-workspace">
        <div className={`rig-canvas ${cutoutResult ? "is-cutout-review" : ""} ${armRigging ? "is-arm-rig-review" : ""}`} ref={boardRef} style={{ backgroundImage: cutoutResult ? "none" : `url(${previewUrl})` }} aria-label={armRigging ? "小手臂动作标记画布" : cutoutResult ? "人物透明背景检查画布" : "关节校准画布"}>
          {armRigging
            ? <ArmRigEditor ref={armRigRef} imageUrl={armRigSourceUrl} nodes={cutoutResult.nodes} onChange={({ hasAny }) => setArmRigReady(hasAny)} />
            : cutoutResult
            ? <CharacterCutoutReview ref={cutoutReviewRef} result={cutoutResult} onReady={() => setCutoutReviewReady(true)} />
            : nodes.map((node, index) => { const point = displayNode(node); return <button key={`${node.label}-${index}`} className={`rig-node ${draggingIndex === index ? "is-dragging" : ""}`} type="button" style={{ left: `${point.x}%`, top: `${point.y}%` }} onDragStart={(event) => event.preventDefault()} onPointerDown={(event) => startNodeDrag(index, event)} onPointerMove={(event) => moveNode(index, event)} onPointerUp={(event) => finishNodeDrag(index, event)} onPointerCancel={(event) => finishNodeDrag(index, event)} aria-label={`拖动${node.label}`}><i /><b>{node.label}</b></button>; })}
          {cutoutBusy && <div className="cutout-processing" role="status"><i aria-hidden="true" /><b>{cutoutProgress}</b><span>首次使用需要下载约 80MB 模型，之后会从浏览器缓存读取。</span></div>}
        </div>
        <aside className="rig-controls">
          <div className={`cutout-mode-toggle ${cutoutEnabled ? "is-active" : ""}`}>
            <div><h2>自动抠图</h2><p id="cutout-mode-description">{cutoutEnabled ? "已启用。画面仍保持原图；点击下面的“开始抠图并检查”后才会处理。" : "已关闭。不会运行抠图模型，进入世界时会完整保留原图。"}</p></div>
            <label className="cutout-switch">
              <input type="checkbox" checked={cutoutEnabled} disabled={cutoutBusy} onChange={(event) => changeCutoutMode(event.target.checked)} aria-label="启用自动抠图" aria-describedby="cutout-mode-description" />
              <span className="cutout-switch-track" aria-hidden="true"><i /></span>
              <b>{cutoutEnabled ? "已开启" : "已关闭"}</b>
            </label>
          </div>
          {!cutoutResult && <DrawingEnhancementPicker value={enhancementLevel} busy={enhancementBusy || cutoutBusy} error={enhancementError} styleLock={styleLock} onStyleLockChange={chooseStyleLock} onChange={chooseEnhancement} />}
          <div className={`cutout-status ${cutoutResult ? "is-ready" : cutoutEnabled ? "is-enabled" : ""}`} role="status"><h2>{armRigging ? "标记手肘动作" : cutoutResult ? "人物边缘检查" : cutoutEnabled ? "等待手动开始" : "使用原图"}</h2><p>{armRigging ? "涂色只用来告诉程序哪一块是小手臂。转动角度最多 38°，手肘处有接缝保护，不会整圈旋转。" : cutoutResult ? "人物内部的白色会保留；透明格子不会进入背景。完成修边后即可继续。" : cutoutEnabled ? "开关只启用功能，不会自动处理。确认关节点后，再点击按钮开始抠图。" : "保留当前画面的全部内容和颜色，不执行人物提取。"}</p>{cutoutProgress && !cutoutBusy && <small>{cutoutProgress}</small>}{cutoutError && <small className="cutout-error">{cutoutError}</small>}</div>
          {!cutoutResult && <><div><h2>{detectedNodes?.length ? "识别结果" : "角色类型"}</h2><p>{detectedNodes?.length ? `模型判断为${detectedType || template.label}；如有偏差可直接拖动红点。` : "不同动物会使用不同的可动节点。"}</p></div>
          <div className="rig-template-switch" aria-label="关节模板">{Object.entries(templates).map(([key,value]) => <button type="button" key={key} className={species === key ? "is-active" : ""} onClick={() => chooseTemplate(key)} aria-pressed={species === key}>{value.label}<small>{value.nodes.length} 个节点</small></button>)}</div>
          <div className="rig-node-list"><h3>当前节点</h3><div>{nodes.map((node) => <span key={node.label}>{node.label}</span>)}</div></div>
          <p className="rig-hint"><b>操作提示</b> 红点范围会帮助模型避开周围的房子、云朵和其他物件。</p></>}
          {armRigging && <button className="cutout-retry" type="button" onClick={() => { setArmRigging(false); setArmRigReady(false); }}>返回人物修边</button>}
          {cutoutResult && !armRigging && <button className="cutout-retry" type="button" onClick={() => { setCutoutResult(null); setCutoutReviewReady(false); setCutoutProgress(""); }}>重新定位关节</button>}
          {cutoutResult && <button className="cutout-fallback" type="button" onClick={useCutoutWithoutArmRig} disabled={!armRigging && !cutoutReviewReady}>暂时不要手肘动作</button>}
          {cutoutError && !cutoutResult && <button className="cutout-fallback" type="button" onClick={useOriginal}>关闭抠图，使用原图</button>}
          <button className="primary-button" type="button" onClick={confirm} disabled={enhancementBusy || cutoutBusy || (cutoutResult && !armRigging && !cutoutReviewReady) || (armRigging && !armRigReady)}>{enhancementBusy ? "正在调整画面…" : cutoutBusy ? "正在提取人物…" : cutoutResult && !armRigging && !cutoutReviewReady ? "正在生成预览…" : armRigging ? armRigReady ? "保存手肘动作，继续画背景" : "先涂一条小手臂" : cutoutResult ? "下一步：标记小手臂" : cutoutEnabled ? "开始抠图并检查" : "使用原图，继续画背景"} {!enhancementBusy && !cutoutBusy && (!cutoutResult || cutoutReviewReady) && (!armRigging || armRigReady) && <span aria-hidden="true">→</span>}</button>
        </aside>
      </section>
    </main>
  );
}
