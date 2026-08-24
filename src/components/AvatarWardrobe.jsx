import { useState } from "react";
import MotionAvatar from "./MotionAvatar";
import AvatarGrowthCard from "./AvatarGrowthCard";
import useDialogFocus from "../hooks/useDialogFocus";
import { defaultAvatarLook, wardrobeCatalog, wardrobeTabs } from "../data/wardrobeCatalog";
import { formatStudyTotal, studySubjects } from "../data/studyRewards";

export default function AvatarWardrobe({ avatar, avatars = [avatar], value, growth, studyProgress, studyCompletionRatio = 0, activityLabel = "正在陪伴", recentActivities = [], onApply, onClose }) {
  const initial = { ...defaultAvatarLook, ...value };
  const [history, setHistory] = useState([initial]);
  const [cursor, setCursor] = useState(0);
  const [tab, setTab] = useState("avatar");
  const [selectedAvatarId, setSelectedAvatarId] = useState(avatar.id);
  const look = history[cursor];
  const previewAvatar = avatars.find((item) => item.id === selectedAvatarId) || avatar;
  const favoriteSubject = Object.entries(studyProgress?.subjectSeconds || {}).sort((a, b) => b[1] - a[1])[0];
  const favoriteSubjectName = studySubjects.find((item) => item.id === favoriteSubject?.[0])?.name || "自由探索";
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
            <div className="avatar-preview-heading"><div><b>{previewAvatar.name}</b><span>{previewAvatar.gender} · {activityLabel}</span></div><button type="button" onClick={() => setTab("avatar")}>更换形象</button></div>
            <AvatarGrowthCard growth={growth} />
            <section className="avatar-learning-summary" aria-labelledby="avatar-learning-title">
              <div className="avatar-learning-heading"><div><h3 id="avatar-learning-title">陪伴学习</h3><p>最常学习：{favoriteSubjectName}</p></div><strong>{formatStudyTotal(studyProgress?.totalSeconds || 0)}</strong></div>
              <div className="avatar-study-progress" role="progressbar" aria-label="本次学习完成进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(studyCompletionRatio * 100)}><i style={{ "--study-progress": studyCompletionRatio }} /></div>
              <div className="avatar-learning-stats"><span><b>{studyProgress?.completedSessions || 0}</b>次完成</span><span><b>{Math.floor((studyProgress?.totalSeconds || 0) / 60)}</b>分钟</span></div>
              <div className="avatar-recent-activities"><b>最近做了什么</b>{recentActivities.length ? <ul>{recentActivities.slice(-3).reverse().map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p>还没有新记录，去学习或探索一下吧。</p>}</div>
            </section>
          </div>
          <div className="avatar-look-editor">
            <nav className="wardrobe-tabs" aria-label="换装分类">
              {wardrobeTabs.map((item) => <button key={item.id} type="button" className={tab === item.id ? "is-active" : ""} onClick={() => setTab(item.id)} aria-pressed={tab === item.id}>{item.name}</button>)}
            </nav>
            <div className="wardrobe-options" aria-label={wardrobeTabs.find((item) => item.id === tab)?.name}>
              {(tab === "avatar" ? avatars : wardrobeCatalog[tab].filter((item) => item.avatars?.includes(previewAvatar.id))).map((item) => {
                const outfitSprite = item.sprite || previewAvatar.motionSprite;
                const maskStyle = item.maskWithBase ? { WebkitMaskImage: `url(${previewAvatar.motionSprite})`, WebkitMaskPosition: "0% 0%", WebkitMaskRepeat: "no-repeat", WebkitMaskSize: "200% 200%", maskImage: `url(${previewAvatar.motionSprite})`, maskPosition: "0% 0%", maskRepeat: "no-repeat", maskSize: "200% 200%" } : {};
                return <button key={item.id} type="button" className={(tab === "avatar" ? selectedAvatarId : look[tab]) === item.id ? "is-active" : ""} onClick={() => choose(item.id)} aria-pressed={(tab === "avatar" ? selectedAvatarId : look[tab]) === item.id} style={{ "--swatch": item.color || "#eee4cb", "--swatch-accent": item.accent || item.color || "#8ca4a8" }}>{tab === "avatar" ? <i className="wardrobe-avatar-thumb" style={{ backgroundImage: `url(${item.motionSprite})` }} aria-hidden="true" /> : <i className="wardrobe-outfit-thumb" style={{ backgroundImage: `url(${outfitSprite})`, ...maskStyle }} aria-hidden="true" />}<b>{item.name}</b>{tab === "avatar" && <small>{item.gender}</small>}</button>;
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
