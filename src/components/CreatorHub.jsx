import { useRef, useState } from "react";
import { primaryAvatarCatalog } from "../data/avatarCatalog";
import DrawingCanvas from "./DrawingCanvas";
import ProjectGallery from "./ProjectGallery";
import WorldDrawingEditor from "./WorldDrawingEditor";

const DoodleIcon = ({ name }) => {
  const paths = {
    move: <path d="M8 5.5c0-1.8 2.5-1.8 2.5 0v4-5c0-1.8 2.5-1.8 2.5 0v5-4c0-1.8 2.5-1.8 2.5 0v4.5-2.6c0-1.7 2.5-1.7 2.5 0V13c0 4.4-2.7 7-6.7 7-3.2 0-4.9-2-6.4-4.4L3.2 14c-1-1.6 1.2-3 2.3-1.5L8 15.2Z" />,
    chat: <><path d="M4 5.5h16v11H9l-5 3v-14Z" /><path d="M8 10h.01M12 10h.01M16 10h.01" /></>,
    save: <><path d="M5 4h12l2 2v14H5Z" /><path d="M8 4v6h8V4M8 20v-6h8v6" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
};

export default function CreatorHub({ userName, onUpload, onChooseAvatar, onCreateBackground, busy, error, onLogout, projects = [], onOpenProject, onRenameProject, onDeleteProject }) {
  const inputRef = useRef(null);
  const [selected, setSelected] = useState(primaryAvatarCatalog[0]);
  const [panel, setPanel] = useState(null);
  const [dreamMode, setDreamMode] = useState(false);
  const [friendship, setFriendship] = useState(() => Number(localStorage.getItem("living-drawing-friendship") || 0));
  const [toolNotice, setToolNotice] = useState("");

  const showToolNotice = (message) => {
    setToolNotice(message);
    window.setTimeout(() => setToolNotice(""), 1800);
  };

  const addFriendship = () => {
    const next = friendship + 1;
    setFriendship(next);
    localStorage.setItem("living-drawing-friendship", String(next));
    showToolNotice(`${selected.name} 收到爱心啦 · 亲密度 ${next}`);
  };

  const toggleDreamMode = () => {
    setDreamMode((current) => {
      showToolNotice(current ? "回到晴朗的白天" : "进入云朵梦境");
      return !current;
    });
  };

  if (panel === "gallery") return <ProjectGallery projects={projects} onOpen={onOpenProject} onRename={onRenameProject} onDelete={onDeleteProject} onClose={() => setPanel(null)} />;
  if (panel === "canvas") return <main className="creator-page"><button className="studio-back" type="button" onClick={() => setPanel(null)}>← 返回伙伴主页</button><DrawingCanvas onComplete={(file) => onUpload(file, { inputOrigin: "canvas" })} busy={busy} error={error} /></main>;
  if (panel === "background") return <main className="creator-page"><button className="studio-back" type="button" onClick={() => setPanel(null)}>← 返回伙伴主页</button><WorldDrawingEditor initialArt={{ house: null, background: null }} initialMode="background" embedded backgroundOnly onApply={(art) => art.background && onCreateBackground(art.background)} /></main>;

  return (
    <main className={`companion-home${dreamMode ? " is-dreaming" : ""}`}>
      <div className="side-doodles left">
        <button className="doodle-tile blue side-tool" data-label="现在就画" type="button" onClick={() => setPanel("canvas")} aria-label="打开画板" title="现在就画">✎</button><i aria-hidden="true">〰</i>
        <button className="doodle-tile blue side-tool" data-label="收藏作品" type="button" onClick={() => setPanel("gallery")} aria-label="打开收藏作品" title="收藏作品">★</button>
        <button className="doodle-tile yellow music-tile side-tool" data-label="伙伴音乐" type="button" onClick={() => window.dispatchEvent(new Event("living-drawing-open-music"))} aria-label="打开伙伴音乐播放器" title="伙伴音乐">♫</button><i aria-hidden="true">➰</i>
      </div>
      <section className="companion-window" aria-labelledby="companion-title">
        <header className="companion-titlebar"><div className="window-dots" aria-hidden="true"><i /><i /></div><div><span>MY LIVING DRAWING</span><h1 id="companion-title">AI 画伴</h1></div><button type="button" onClick={onLogout} aria-label="进入登录界面">登</button></header>
        <div className="companion-content">
          <section className="companion-hero">
            <div className="character-showcase"><span className="spark s1">★</span><span className="spark s2">✦</span><span className="spark s3">〰</span><div className="character-frame" style={{ backgroundImage: `url(${selected.motionSprite})` }} role="img" aria-label={selected.name} /><div className="character-caption"><b>{selected.name}</b><span>今天也想陪你一起玩！</span></div></div>
            <div className="companion-actions">
              <p>你好，{userName}！<br /><b>今天想做什么？</b></p>
              <input ref={inputRef} className="visually-hidden" type="file" accept="image/*" disabled={busy} onChange={(event) => event.target.files[0] && onUpload(event.target.files[0], { inputOrigin: "upload" })} />
              <button className="companion-action coral" type="button" disabled={busy} onClick={() => inputRef.current?.click()}><span><DoodleIcon name="move" /></span>{busy ? "正在唤醒…" : "让画动起来"}</button>
              <button className="companion-action sunshine" type="button" onClick={() => onChooseAvatar(selected)}><span><DoodleIcon name="chat" /></span>和我聊天</button>
              <button className="companion-action leaf" type="button" onClick={() => setPanel("gallery")}><span><DoodleIcon name="save" /></span>我的小伙伴{projects.length ? ` · ${projects.length}` : ""}</button>
              <div className="companion-secondary-actions"><button type="button" onClick={() => setPanel("canvas")}>✎ 现在就画一个</button><button type="button" onClick={() => setPanel("background")}>▧ 画游戏背景</button></div>
              {error && <p className="companion-error" role="alert">{error}</p>}
            </div>
          </section>
          <section className="friend-message" aria-label="伙伴留言"><div className="message-avatar" style={{ backgroundImage: `url(${selected.motionSprite})` }} /><div><b>{selected.name}</b><p>今天也想陪你玩呀！</p><span aria-label="三个爱心">♥ ♥ ♥</span></div><div className="mini-character" style={{ backgroundImage: `url(${selected.motionSprite})` }} aria-hidden="true" /></section>
          <section className="companion-picker" aria-label="选择主形象"><span>选择我的形象</span>{primaryAvatarCatalog.map((avatar) => <button key={avatar.id} type="button" className={selected.id === avatar.id ? "is-selected" : ""} onClick={() => setSelected(avatar)} aria-label={`选择${avatar.name}，${avatar.gender}`} title={`${avatar.name} · ${avatar.gender}`}><i style={{ backgroundImage: `url(${avatar.motionSprite})` }} /></button>)}</section>
        </div>
      </section>
      <div className="side-doodles right"><button className="doodle-tile yellow side-tool heart-tool" data-label="送爱心" type="button" onClick={addFriendship} aria-label={`送爱心，当前亲密度${friendship}`} title="送给伙伴爱心">♥<small>{friendship || ""}</small></button><i aria-hidden="true">✦</i><button className={`doodle-tile blue side-tool${dreamMode ? " is-active" : ""}`} data-label="云朵梦境" type="button" onClick={toggleDreamMode} aria-label="切换云朵梦境" title="云朵梦境">☁</button><button className="doodle-tile green side-tool camera-tool" data-label="上传画作" type="button" onClick={() => inputRef.current?.click()} aria-label="上传画作" title="上传画作"><span aria-hidden="true" /></button><i aria-hidden="true">〰</i></div>
      {toolNotice && <div className="side-tool-notice" role="status">{toolNotice}</div>}
    </main>
  );
}
