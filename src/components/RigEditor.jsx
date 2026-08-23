import { useMemo, useRef, useState } from "react";

const templates = {
  human: { label: "人物", nodes: [["头",50,18],["身体",50,43],["左肩",38,34],["左肘",27,48],["右肩",62,34],["右肘",73,48],["左髋",44,58],["左膝",42,76],["右髋",56,58],["右膝",58,76]] },
  dog: { label: "小狗", nodes: [["头",30,38],["躯干",54,50],["左前腿",40,68],["右前腿",48,70],["左后腿",63,69],["右后腿",72,68],["尾巴",82,38]] },
  rabbit: { label: "兔子", nodes: [["头",50,29],["身体",50,57],["左耳",42,10],["右耳",58,10],["左前爪",36,56],["右前爪",64,56],["左后腿",43,76],["右后腿",57,76],["尾巴",72,58]] },
};

const SPECIES_BY_TYPE = { "人物": "human", "小狗": "dog", "兔子": "rabbit" };

export default function RigEditor({ analysis, onConfirm, onCancel }) {
  const boardRef = useRef(null);
  const initialSpecies = SPECIES_BY_TYPE[analysis.rigAnalysis?.person?.type] || "human";
  const [species, setSpecies] = useState(initialSpecies);
  const [nodes, setNodes] = useState(() => templates[initialSpecies].nodes.map(([label,x,y]) => ({ label, x, y })));
  const template = useMemo(() => templates[species], [species]);

  const chooseTemplate = (nextSpecies) => {
    setSpecies(nextSpecies);
    setNodes(templates[nextSpecies].nodes.map(([label,x,y]) => ({ label, x, y })));
  };

  const moveNode = (index, event) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = Math.max(2, Math.min(98, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(98, ((event.clientY - rect.top) / rect.height) * 100));
    setNodes((current) => current.map((node, nodeIndex) => nodeIndex === index ? { ...node, x, y } : node));
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
      <header className="rig-editor-header"><div className="wordmark"><span>✦</span><b>My Living Drawing</b></div><button type="button" onClick={onCancel}>取消</button></header>
      <section className="rig-editor-intro"><div><h1>把关节放到<br /><em>正确的位置</em></h1><p>云端会先帮你认出画里的角色并预选模板，你仍然可以切换模板并手动拖动节点校准。</p></div><span>第 2 步，共 2 步</span></section>
      <section className="rig-editor-workspace">
        <div className="rig-canvas" ref={boardRef} style={{ backgroundImage: `url(${analysis.previewUrl})` }} aria-label="关节校准画布">
          {nodes.map((node, index) => <button key={`${node.label}-${index}`} className="rig-node" type="button" style={{ left: `${node.x}%`, top: `${node.y}%` }} onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)} onPointerMove={(event) => moveNode(index, event)} aria-label={`拖动${node.label}`}><i /><b>{node.label}</b></button>)}
        </div>
        <aside className="rig-controls">
          <div><h2>角色类型</h2><p>不同动物会使用不同的可动节点。</p></div>
          <div className="rig-template-switch" aria-label="关节模板">{Object.entries(templates).map(([key,value]) => <button type="button" key={key} className={species === key ? "is-active" : ""} onClick={() => chooseTemplate(key)} aria-pressed={species === key}>{value.label}<small>{value.nodes.length} 个节点</small></button>)}</div>
          <div className="rig-node-list"><h3>当前节点</h3><div>{nodes.map((node) => <span key={node.label}>{node.label}</span>)}</div></div>
          <p className="rig-hint"><b>操作提示</b> 按住红色节点拖动；节点名称会跟着移动。确认后仍可在互动世界中显示或隐藏关节。</p>
          {analysis.notice && <p className="rig-hint" role="status"><b>小发现</b> {analysis.notice}</p>}
          <button className="primary-button" type="button" onClick={confirm}>确认关节，进入世界 <span aria-hidden="true">→</span></button>
        </aside>
      </section>
    </main>
  );
}
