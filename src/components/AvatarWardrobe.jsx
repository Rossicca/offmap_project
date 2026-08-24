import { useState } from "react";
import MotionAvatar from "./MotionAvatar";
import useDialogFocus from "../hooks/useDialogFocus";
import { defaultAvatarLook, wardrobeCatalog, wardrobeTabs } from "../data/wardrobeCatalog";

export default function AvatarWardrobe({ avatar, value, onApply, onClose }) {
  const initial = { ...defaultAvatarLook, ...value };
  const [history, setHistory] = useState([initial]);
  const [cursor, setCursor] = useState(0);
  const [tab, setTab] = useState("outfit");
  const look = history[cursor];
  const dialogRef = useDialogFocus(onClose);

  const choose = (id) => {
    const next = { ...look, [tab]: id };
    setHistory((current) => [...current.slice(0, cursor + 1), next]);
    setCursor((current) => current + 1);
  };
  const reset = () => {
    setHistory((current) => [...current.slice(0, cursor + 1), defaultAvatarLook]);
    setCursor((current) => current + 1);
  };

  return (
    <div className="avatar-wardrobe-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section ref={dialogRef} className="avatar-wardrobe" role="dialog" aria-modal="true" aria-labelledby="avatar-wardrobe-title">
        <header>
          <div><h2 id="avatar-wardrobe-title">我的形象</h2><p>给{avatar.name}换衣服和配饰，动作时会一起移动。</p></div>
          <button className="round-close" type="button" onClick={onClose} aria-label="关闭我的形象">×</button>
        </header>
        <div className="avatar-wardrobe-layout">
          <div className="avatar-look-preview">
            <MotionAvatar avatar={avatar} action="wave" look={look} />
            <b>{avatar.name}</b><span>挥挥手，看看衣服跟不跟得上</span>
          </div>
          <div className="avatar-look-editor">
            <nav className="wardrobe-tabs" aria-label="换装分类">
              {wardrobeTabs.map((item) => <button key={item.id} type="button" className={tab === item.id ? "is-active" : ""} onClick={() => setTab(item.id)} aria-pressed={tab === item.id}>{item.name}</button>)}
            </nav>
            <div className="wardrobe-options" aria-label={wardrobeTabs.find((item) => item.id === tab)?.name}>
              {wardrobeCatalog[tab].map((item) => <button key={item.id} type="button" className={look[tab] === item.id ? "is-active" : ""} onClick={() => choose(item.id)} aria-pressed={look[tab] === item.id} style={{ "--swatch": item.color || "#eee4cb", "--swatch-accent": item.accent || item.color || "#8ca4a8" }}><i className={`wardrobe-swatch swatch-${tab} swatch-${item.id}`} aria-hidden="true" /><b>{item.name}</b></button>)}
            </div>
          </div>
        </div>
        <footer>
          <div><button type="button" onClick={() => setCursor((value) => value - 1)} disabled={cursor === 0}>撤销</button><button type="button" onClick={() => setCursor((value) => value + 1)} disabled={cursor >= history.length - 1}>恢复</button><button type="button" onClick={reset}>恢复默认</button></div>
          <button className="primary-button" type="button" onClick={() => { onApply(look); onClose(); }}>保存这套搭配</button>
        </footer>
      </section>
    </div>
  );
}
