import { useMemo, useRef, useState } from "react";

const templates = {
  human: { label: "人物", nodes: [["头",50,18],["身体",50,43],["左肩",38,34],["左肘",27,48],["右肩",62,34],["右肘",73,48],["左髋",44,58],["左膝",42,76],["右髋",56,58],["右膝",58,76]] },
  dog: { label: "小狗", nodes: [["头",30,38],["躯干",54,50],["左前腿",40,68],["右前腿",48,70],["左后腿",63,69],["右后腿",72,68],["尾巴",82,38]] },
  rabbit: { label: "兔子", nodes: [["头",50,29],["身体",50,57],["左耳",42,10],["右耳",58,10],["左前爪",36,56],["右前爪",64,56],["左后腿",43,76],["右后腿",57,76],["尾巴",72,58]] },
};

export default function RigEditor({ analysis, onConfirm, onCancel }) {
  const boardRef = useRef(null);
  const dragRef = useRef(null);
  const [species, setSpecies] = useState("human");
  const [nodes, setNodes] = useState(() => templates.human.nodes.map(([label,x,y]) => ({ label, x, y })));
  const [draggingIndex, setDraggingIndex] = useState(null);
  const template = useMemo(() => templates[species], [species]);

  const chooseTemplate = (nextSpecies) => {
    setSpecies(nextSpecies);
    setNodes(templates[nextSpecies].nodes.map(([label,x,y]) => ({ label, x, y })));
  };

  const startNodeDrag = (index, event) => {
    if (event.button !== 0) return;
    const board = boardRef.current;
    const rect = board?.getBoundingClientRect();
    if (!board || !rect) return;
    const originX = rect.left + board.clientLeft;
    const originY = rect.top + board.clientTop;
    const node = nodes[index];
    dragRef.current = {
      index,
      pointerId: event.pointerId,
      offsetX: event.clientX - (originX + board.clientWidth * node.x / 100),
      offsetY: event.clientY - (originY + board.clientHeight * node.y / 100),
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
    const halfWidth = (event.currentTarget.offsetWidth / 2 / board.clientWidth) * 100 + .5;
    const halfHeight = (event.currentTarget.offsetHeight / 2 / board.clientHeight) * 100 + .5;
    const x = Math.max(halfWidth, Math.min(100 - halfWidth, ((event.clientX - drag.offsetX - originX) / board.clientWidth) * 100));
    const y = Math.max(halfHeight, Math.min(100 - halfHeight, ((event.clientY - drag.offsetY - originY) / board.clientHeight) * 100));
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
    needsRigSetup: false,
    rigAnalysis: {
      ...analysis.rigAnalysis,
      person: { type: template.label, joints: nodes.length, movable: nodes.map((node) => node.label), nodes, source: "user-calibrated-template" },
    },
  });

  return (
    <main className="rig-editor-page">
      <header className="rig-editor-header"><div className="wordmark"><span>✦</span><b>AI 画伴</b></div><button type="button" onClick={onCancel}>返回主页</button></header>
      <section className="rig-editor-intro"><div><h1>把关节放到<br /><em>正确的位置</em></h1><p>选择最接近的角色模板，然后直接拖动节点。这里是本地可校准模板，不会假装已经完成云端 AI 识别。</p></div><span>第 2 步，共 3 步</span></section>
      <section className="rig-editor-workspace">
        <div className="rig-canvas" ref={boardRef} style={{ backgroundImage: `url(${analysis.previewUrl})` }} aria-label="关节校准画布">
          {nodes.map((node, index) => <button key={`${node.label}-${index}`} className={`rig-node ${draggingIndex === index ? "is-dragging" : ""}`} type="button" style={{ left: `${node.x}%`, top: `${node.y}%` }} onDragStart={(event) => event.preventDefault()} onPointerDown={(event) => startNodeDrag(index, event)} onPointerMove={(event) => moveNode(index, event)} onPointerUp={(event) => finishNodeDrag(index, event)} onPointerCancel={(event) => finishNodeDrag(index, event)} aria-label={`拖动${node.label}`}><i /><b>{node.label}</b></button>)}
        </div>
        <aside className="rig-controls">
          <div><h2>角色类型</h2><p>不同动物会使用不同的可动节点。</p></div>
          <div className="rig-template-switch" aria-label="关节模板">{Object.entries(templates).map(([key,value]) => <button type="button" key={key} className={species === key ? "is-active" : ""} onClick={() => chooseTemplate(key)} aria-pressed={species === key}>{value.label}<small>{value.nodes.length} 个节点</small></button>)}</div>
          <div className="rig-node-list"><h3>当前节点</h3><div>{nodes.map((node) => <span key={node.label}>{node.label}</span>)}</div></div>
          <p className="rig-hint"><b>操作提示</b> 按住红色节点拖动；节点名称会跟着移动。确认后仍可在互动世界中显示或隐藏关节。</p>
          <button className="primary-button" type="button" onClick={confirm}>确认关节，继续画背景 <span aria-hidden="true">→</span></button>
        </aside>
      </section>
    </main>
  );
}
