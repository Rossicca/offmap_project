const levels = [
  { id: "original", name: "原图", hint: "不调整" },
  { id: "light", name: "轻度", hint: "提亮纸张" },
  { id: "medium", name: "中度", hint: "清理灰底" },
  { id: "strong", name: "重度", hint: "强化线条" },
];

export default function DrawingEnhancementPicker({ value, busy, error, onChange }) {
  return (
    <section className="drawing-enhancement" aria-labelledby="drawing-enhancement-title">
      <div><h2 id="drawing-enhancement-title">画面效果</h2><p>原图一直保留，选一个喜欢的效果。</p></div>
      <div className="drawing-enhancement-options" role="group" aria-label="选择画作优化强度">
        {levels.map((level) => (
          <button key={level.id} type="button" className={value === level.id ? "is-active" : ""} onClick={() => onChange(level.id)} aria-pressed={value === level.id} disabled={busy}>
            <b>{level.name}</b><small>{level.hint}</small>
          </button>
        ))}
      </div>
      <p className={`drawing-enhancement-status ${error ? "is-error" : ""}`} role="status">{error || (busy ? "正在调整画面…" : value === "original" ? "现在显示原图" : `现在显示${levels.find((level) => level.id === value)?.name}效果`)}</p>
    </section>
  );
}
