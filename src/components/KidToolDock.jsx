import { useState } from "react";

export default function KidToolDock({ onAdd, onDecorate, onDraw, onDrawBackground, onSave, onArrange, onExport, onParent, onReset }) {
  const [moreOpen, setMoreOpen] = useState(false);
  return (
    <div className="kid-tool-dock" aria-label="游戏工具">
      <button type="button" onClick={onAdd}>加东西</button>
      <button type="button" onClick={onDecorate}>装房子</button>
      <button type="button" onClick={onDraw}>自己画</button>
      <button type="button" onClick={onSave}>保存</button>
      <div className="kid-more-wrap">
        <button type="button" onClick={() => setMoreOpen((open) => !open)} aria-expanded={moreOpen}>更多</button>
        {moreOpen && <div className="kid-more-menu">
          <button type="button" onClick={() => { onArrange(); setMoreOpen(false); }}>移动东西</button>
          <button type="button" onClick={() => { onDrawBackground(); setMoreOpen(false); }}>画背景</button>
          <button type="button" onClick={() => { onExport(); setMoreOpen(false); }}>分享作品</button>
          <button type="button" onClick={() => { onParent(); setMoreOpen(false); }}>家长设置</button>
          <button type="button" onClick={() => { onReset(); setMoreOpen(false); }}>换个角色</button>
        </div>}
      </div>
    </div>
  );
}
