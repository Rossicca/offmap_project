const themes = [{ id: "meadow", label: "晴空草地" }, { id: "forest", label: "森林黄昏" }, { id: "ocean", label: "海底世界" }, { id: "space", label: "星际舞台" }];


export default function SceneEditor({ objects, theme, positionBounds = {}, onThemeChange, onObjectChange, onLayerChange, onDeleteObject, onClose }) {
  return (
    <div className="scene-editor-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="scene-editor" role="dialog" aria-modal="true" aria-labelledby="scene-editor-title">
        <header>
          <div><h2 id="scene-editor-title">移动和调整东西</h2><p>调位置和大小；被挡住时，点“放前面”。</p></div>
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
                  {(object.isCustom || object.isLibrary) && <button type="button" onClick={() => onDeleteObject?.(object.id)}>拿走</button>}
                </header>
                <label>左右 <input type="range" min={bounds.minX} max={bounds.maxX} value={Math.max(bounds.minX, Math.min(bounds.maxX, object.x))} onChange={(event) => onObjectChange(object.id, "x", Number(event.target.value))} /></label>
                <label>上下 <input type="range" min={bounds.minY} max={bounds.maxY} value={Math.max(bounds.minY, Math.min(bounds.maxY, object.y))} onChange={(event) => onObjectChange(object.id, "y", Number(event.target.value))} /></label>
                <label className="object-size-control"><span>大小</span><input type="range" min="40" max="200" step="5" value={Math.round((object.scale || 1) * 100)} onChange={(event) => onObjectChange(object.id, "scale", Number(event.target.value) / 100)} /><b>{Math.round((object.scale || 1) * 100)}%</b></label>
                <div className="object-layer-controls"><span>谁挡住谁</span><button type="button" onClick={() => onLayerChange?.(object.id, -1)}>放后面</button><button type="button" onClick={() => onLayerChange?.(object.id, 1)}>放前面</button></div>
              </article>
            );
          })}
        </div>
        <button className="primary-button" type="button" onClick={onClose}>完成 <span aria-hidden="true">✓</span></button>
      </section>
    </div>
  );
}
