import { useRef, useState } from "react";
import { avatarCatalog, characterSprite } from "../data/avatarCatalog";
import ProjectGallery from "./ProjectGallery";

export default function CreatorHub({ userName, onUpload, onChooseAvatar, busy, error, onLogout, projects = [], onOpenProject, onRenameProject, onDeleteProject }) {
  const inputRef = useRef(null);
  const [mode, setMode] = useState("avatar");
  const [selected, setSelected] = useState(avatarCatalog[0]);
  const [showGallery, setShowGallery] = useState(false);

  return (
    <main className="creator-page">
      <header className="creator-header">
        <div className="wordmark"><span aria-hidden="true">✦</span><b>My Living Drawing</b></div>
        <p>你好，{userName}</p>
        <div className="creator-header-actions"><button type="button" onClick={() => setShowGallery(true)}>我的作品{projects.length ? ` (${projects.length})` : ""}</button><button type="button" onClick={onLogout}>退出</button></div>
      </header>

      {showGallery ? <ProjectGallery projects={projects} onOpen={onOpenProject} onRename={onRenameProject} onDelete={onDeleteProject} onClose={() => setShowGallery(false)} /> : <>

      <section className="creator-intro">
        <div>
          <h1>今天想让谁<br /><em>活起来？</em></h1>
          <p>从你的画开始，或者直接挑选一个已经做好关节的 AI 小伙伴。</p>
        </div>
        <div className="mode-switch" aria-label="创作方式">
          <button type="button" className={mode === "avatar" ? "is-active" : ""} onClick={() => setMode("avatar")}>AI 角色库</button>
          <button type="button" className={mode === "drawing" ? "is-active" : ""} onClick={() => setMode("drawing")}>上传我的画</button>
        </div>
      </section>

      {mode === "avatar" ? (
        <section className="avatar-studio" aria-labelledby="avatar-title">
          <div className="avatar-list">
            <div className="section-copy">
              <h2 id="avatar-title">选择一个小伙伴</h2>
              <p>每个角色都已经拆分成可动关节。</p>
            </div>
            <div className="avatar-grid">
              {avatarCatalog.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  className={selected.id === avatar.id ? "avatar-card is-selected" : "avatar-card"}
                  onClick={() => setSelected(avatar)}
                  aria-pressed={selected.id === avatar.id}
                >
                  <span className="sprite-window"><i style={{ backgroundImage: `url(${characterSprite})`, backgroundPosition: avatar.spritePosition }} /></span>
                  <b>{avatar.name}</b><small>{avatar.kind} · {avatar.joints.length} 个节点</small>
                </button>
              ))}
            </div>
          </div>

          <aside className="rig-preview">
            <div className="selected-character">
              <i style={{ backgroundImage: `url(${characterSprite})`, backgroundPosition: selected.spritePosition }} />
            </div>
            <div className="rig-preview-copy">
              <span>{selected.kind}骨架已就绪</span>
              <h2>{selected.name}</h2>
              <div className="joint-tags">{selected.joints.map((joint) => <em key={joint}>{joint}</em>)}</div>
              <p className="avatar-conversion-note">进入世界后保留同一个角色外观，并切换它的专属动作帧；关节节点可以单独打开查看。</p>
            </div>
            <button className="primary-button" type="button" onClick={() => onChooseAvatar(selected)}>带原角色进入世界 <span aria-hidden="true">→</span></button>
          </aside>
        </section>
      ) : (
        <section className="drawing-uploader">
          <div className="upload-illustration" aria-hidden="true"><span>🖍️</span><b>你的画</b><i>＋</i><span>关节</span></div>
          <div>
            <h2>{busy ? "正在分析角色和动物…" : "上传人物或动物画"}</h2>
            <p>Demo 会识别人物与小狗，并生成对应的关节模板。真实 Vision 模型可以之后接入同一个分析接口。</p>
            <input ref={inputRef} className="visually-hidden" type="file" accept="image/*" disabled={busy} onChange={(event) => event.target.files[0] && onUpload(event.target.files[0])} />
            <button className="primary-button" type="button" disabled={busy} onClick={() => inputRef.current?.click()}>{busy ? "正在生成骨架…" : "选择人物或动物画"} <span aria-hidden="true">↗</span></button>
            {error && <p className="inline-error" role="alert">{error}</p>}
          </div>
        </section>
      )}
      </>}
    </main>
  );
}
