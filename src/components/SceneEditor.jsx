const themes = [{ id: "meadow", label: "晴空草地" }, { id: "forest", label: "森林黄昏" }, { id: "ocean", label: "海底世界" }, { id: "space", label: "星际舞台" }];


export default function SceneEditor({ objects, theme, positionBounds = {}, onThemeChange, onObjectChange, onLayerChange, onDeleteObject, onClose }) {
  return (
    <div className="scene-editor-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="scene-editor" role="dialog" aria-modal="true" aria-labelledby="scene-editor-title">
        <header>
          <div><h2 id="scene-editor-title">布置互动世界</h2><p>选择场景，再调整朋友们的位置。</p></div>
          <button type="button" onClick={onClose} aria-label="关闭场景编辑器">×</button>
        </header>
        <div className="theme-picker" aria-label="场景主题">
          {themes.map((item) => <button type="button" key={item.id} className={theme === item.id ? "is-active" : ""} onClick={() => onThemeChange(item.id)} aria-pressed={theme === item.id}>{item.label}</button>)}
        </div>
        <div className="object-position-list">
          {objects.map((object) => {
            const bounds = positionBounds[object.id] || { minX: 8, maxX: 92, minY: 8, maxY: 92 };
            return (
              <article key={object.id} className={object.isCustom ? "is-custom-object" : ""}>
                <header>
                  <b>{object.label}</b>
                  {object.isCustom && <button type="button" onClick={() => onDeleteObject?.(object.id)}>删除画作</button>}
                </header>
                <label>左右 <input type="range" min={bounds.minX} max={bounds.maxX} value={Math.max(bounds.minX, Math.min(bounds.maxX, object.x))} onChange={(event) => onObjectChange(object.id, "x", Number(event.target.value))} /></label>
                <label>上下 <input type="range" min={bounds.minY} max={bounds.maxY} value={Math.max(bounds.minY, Math.min(bounds.maxY, object.y))} onChange={(event) => onObjectChange(object.id, "y", Number(event.target.value))} /></label>
                <div className="object-layer-controls"><span>图层 {object.layer || 3}</span><button type="button" onClick={() => onLayerChange?.(object.id, -1)}>下移一层</button><button type="button" onClick={() => onLayerChange?.(object.id, 1)}>上移一层</button></div>
              </article>
            );
          })}
        </div>
        <button className="primary-button" type="button" onClick={onClose}>完成布置 <span aria-hidden="true">✓</span></button>
      </section>
    </div>
  );
}
