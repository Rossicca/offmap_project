import { useState } from "react";
import MotionAvatar from "./MotionAvatar";
import useDialogFocus from "../hooks/useDialogFocus";
import { defaultAvatarLook, wardrobeCatalog, wardrobeTabs } from "../data/wardrobeCatalog";

export default function AvatarWardrobe({ avatar, avatars = [avatar], value, onApply, onClose }) {
  const initial = { ...defaultAvatarLook, ...value };
  const [history, setHistory] = useState([initial]);
  const [cursor, setCursor] = useState(0);
  const [tab, setTab] = useState("avatar");
  const [selectedAvatarId, setSelectedAvatarId] = useState(avatar.id);
  const look = history[cursor];
  const previewAvatar = avatars.find((item) => item.id === selectedAvatarId) || avatar;
  const dialogRef = useDialogFocus(onClose);

  const choose = (id) => {
    if (tab === "avatar") {
      setSelectedAvatarId(id);
      const availableOutfits = wardrobeCatalog.outfit.filter((item) => item.avatars?.includes(id));
      if (!availableOutfits.some((item) => item.id === look.outfit)) {
        const next = { ...look, outfit: availableOutfits[0]?.id || "original" };
        setHistory((current) => [...current.slice(0, cursor + 1), next]);
        setCursor((current) => current + 1);
      }
      return;
    }
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
          <div><h2 id="avatar-wardrobe-title">我的形象</h2><p>先选主形象，再替换整套动作服装，不会叠在原衣服上。</p></div>
          <button className="round-close" type="button" onClick={onClose} aria-label="关闭我的形象">×</button>
        </header>
        <div className="avatar-wardrobe-layout">
          <div className="avatar-look-preview">
            <MotionAvatar avatar={previewAvatar} action="wave" look={look} />
            <b>{previewAvatar.name}</b><span>{previewAvatar.gender} · 挥挥手看看搭配</span>
          </div>
          <div className="avatar-look-editor">
            <nav className="wardrobe-tabs" aria-label="换装分类">
              {wardrobeTabs.map((item) => <button key={item.id} type="button" className={tab === item.id ? "is-active" : ""} onClick={() => setTab(item.id)} aria-pressed={tab === item.id}>{item.name}</button>)}
            </nav>
            <div className="wardrobe-options" aria-label={wardrobeTabs.find((item) => item.id === tab)?.name}>
              {(tab === "avatar" ? avatars : wardrobeCatalog[tab].filter((item) => item.avatars?.includes(previewAvatar.id))).map((item) => {
                const outfitSprite = item.sprite || previewAvatar.motionSprite;
                const paperBlend = item.paperBlend || (!item.sprite && previewAvatar.paperBlend);
                const maskStyle = item.maskWithBase ? { WebkitMaskImage: `url(${previewAvatar.motionSprite})`, WebkitMaskPosition: "0% 0%", WebkitMaskRepeat: "no-repeat", WebkitMaskSize: "200% 200%", maskImage: `url(${previewAvatar.motionSprite})`, maskPosition: "0% 0%", maskRepeat: "no-repeat", maskSize: "200% 200%" } : {};
                return <button key={item.id} type="button" className={(tab === "avatar" ? selectedAvatarId : look[tab]) === item.id ? "is-active" : ""} onClick={() => choose(item.id)} aria-pressed={(tab === "avatar" ? selectedAvatarId : look[tab]) === item.id} style={{ "--swatch": item.color || "#eee4cb", "--swatch-accent": item.accent || item.color || "#8ca4a8" }}>{tab === "avatar" ? <i className="wardrobe-avatar-thumb" style={{ backgroundImage: `url(${item.motionSprite})`, ...(item.paperBlend ? { mixBlendMode: "multiply", filter: "brightness(1.025) contrast(1.035)" } : {}) }} aria-hidden="true" /> : <i className="wardrobe-outfit-thumb" style={{ backgroundImage: `url(${outfitSprite})`, ...(paperBlend ? { mixBlendMode: "multiply", filter: "brightness(1.025) contrast(1.035)" } : {}), ...maskStyle }} aria-hidden="true" />}<b>{item.name}</b>{tab === "avatar" && <small>{item.gender}</small>}</button>;
              })}
            </div>
          </div>
        </div>
        <footer>
          <div><button type="button" onClick={() => setCursor((value) => value - 1)} disabled={cursor === 0}>撤销</button><button type="button" onClick={() => setCursor((value) => value + 1)} disabled={cursor >= history.length - 1}>恢复</button><button type="button" onClick={reset}>恢复默认</button></div>
          <button className="primary-button" type="button" onClick={() => { onApply(look, previewAvatar); onClose(); }}>保存形象和搭配</button>
        </footer>
      </section>
    </div>
  );
}
