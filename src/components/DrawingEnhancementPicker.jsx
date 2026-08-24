const levels = [
  { id: "original", name: "原图", hint: "不调整" },
  { id: "light", name: "轻度", hint: "保留画风" },
  { id: "medium", name: "中度", hint: "绘本卡通" },
  { id: "strong", name: "重度", hint: "角色重绘" },
];

export default function DrawingEnhancementPicker({ value, busy, error, onChange }) {
  return (
    <section className="drawing-enhancement" aria-labelledby="drawing-enhancement-title">
      <div><h2 id="drawing-enhancement-title">豆包帮我画</h2><p>选择后原画会发送到火山方舟重绘；原图仍保存在本机。</p></div>
      <div className="drawing-enhancement-options" role="group" aria-label="选择画作优化强度">
        {levels.map((level) => (
          <button key={level.id} type="button" className={value === level.id ? "is-active" : ""} onClick={() => onChange(level.id)} aria-pressed={value === level.id} disabled={busy}>
            <b>{level.name}</b><small>{level.hint}</small>
          </button>
        ))}
      </div>
      <p className={`drawing-enhancement-status ${error ? "is-error" : ""}`} role="status">{error || (busy ? "豆包正在重新画，请稍等…" : value === "original" ? "现在显示原图" : `豆包${levels.find((level) => level.id === value)?.name}重绘已完成`)}</p>
    </section>
  );
}
