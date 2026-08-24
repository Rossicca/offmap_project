import { useEffect, useRef, useState } from "react";

export default function KidToolDock({ onAvatar, onAdd, onDecorate, onDraw, onDrawBackground, onSave, saveLabel = "保存", onArrange, onExport, onParent, onReset, saveDisabled = false }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const firstMenuItemRef = useRef(null);

  useEffect(() => {
    if (!moreOpen) return undefined;
    firstMenuItemRef.current?.focus();
    const closeOnOutside = (event) => {
      if (!moreRef.current?.contains(event.target)) setMoreOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [moreOpen]);
  return (
    <div className="kid-tool-dock" aria-label="游戏工具">
      <button type="button" onClick={onAvatar}>我的形象</button>
      <button type="button" onClick={onAdd}>加东西</button>
      <button type="button" onClick={onDecorate}>装房子</button>
      <button type="button" onClick={onDraw}>自己画</button>
      <button type="button" onClick={onSave} disabled={saveDisabled} title={saveDisabled ? "场景切换完成后即可保存" : undefined}>{saveDisabled ? "切换中…" : saveLabel}</button>
      <div className="kid-more-wrap" ref={moreRef}>
        <button type="button" onClick={() => setMoreOpen((open) => !open)} aria-expanded={moreOpen} aria-haspopup="menu" aria-controls="kid-more-menu">更多</button>
        {moreOpen && <div className="kid-more-menu" id="kid-more-menu" role="menu" aria-label="更多工具">
          <button ref={firstMenuItemRef} role="menuitem" type="button" onClick={() => { onArrange(); setMoreOpen(false); }}>移动东西</button>
          <button type="button" onClick={() => { onDrawBackground(); setMoreOpen(false); }}>画背景</button>
          <button type="button" onClick={() => { onExport(); setMoreOpen(false); }}>分享作品</button>
          <button type="button" onClick={() => { onParent(); setMoreOpen(false); }}>家长设置</button>
          <button type="button" onClick={() => { onReset(); setMoreOpen(false); }}>换个角色</button>
        </div>}
      </div>
    </div>
  );
}
