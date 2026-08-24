import { useRef, useState } from "react";

export default function UploadPanel({ onUpload, busy, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const chooseFile = (file) => {
    if (file) onUpload(file);
  };

  return (
    <main className="upload-layout">
      <section className="intro" aria-labelledby="intro-title">
        <div className="brand-mark" aria-hidden="true">✦</div>
        <h1 id="intro-title">让画里的世界<br /><em>动起来</em></h1>
        <p>上传一张孩子的画，认识画里的朋友，再用一句话让故事发生。</p>
        <div className="promise-strip" aria-label="体验步骤">
          <span>上传画作</span><b>→</b><span>发现角色</span><b>→</b><span>一起玩</span>
        </div>
      </section>

      <section
        className={`upload-board ${dragging ? "is-dragging" : ""}`}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          chooseFile(event.dataTransfer.files[0]);
        }}
      >
        <div className="paper-preview" aria-hidden="true">
          <span className="paper-sun">☀️</span><span className="paper-tree">🌳</span>
          <span className="paper-home">🏠</span><span className="paper-friend">🧒</span>
        </div>
        <div>
          <h2>{busy ? "正在认识画里的朋友…" : "把你的画放进来"}</h2>
          <p>{busy ? "太阳、房子、小狗，也许马上就会醒来。" : "拖到这里，或从设备中选择一张图片。"}</p>
        </div>
        <input
          ref={inputRef}
          className="visually-hidden"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(event) => chooseFile(event.target.files[0])}
          disabled={busy}
        />
        <button className="primary-button" type="button" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? <><span className="loading-dots" aria-hidden="true">•••</span> 正在分析</> : <>选择我的画 <span aria-hidden="true">↗</span></>}
        </button>
        <small>AI 分析或重绘时，图片会发送到配置的火山方舟模型；作品仍保存在本机 · 最大 12MB</small>
        {error && <p className="inline-error" role="alert">{error}</p>}
      </section>
    </main>
  );
}
