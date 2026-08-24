import { useState } from "react";
import robotMotion from "../assets/robot-motion-paper.png";

export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");

  const submit = (event) => {
    event.preventDefault();
    onLogin(name.trim() || "小小创作者");
  };

  return (
    <main className="companion-login-page">
      <span className="login-doodle login-pencil" aria-hidden="true">✎</span>
      <span className="login-doodle login-star" aria-hidden="true">★</span>
      <span className="login-doodle login-heart" aria-hidden="true">♥</span>
      <span className="login-doodle login-cloud" aria-hidden="true">☁</span>

      <section className="companion-login-window" aria-labelledby="login-title">
        <header>
          <div className="window-dots" aria-hidden="true"><i /><i /></div>
          <div><span>DREAM DRAWING COMPANION</span><b>绘梦伙伴</b></div>
          <i className="login-header-spark" aria-hidden="true">✦</i>
        </header>

        <div className="companion-login-body">
          <section className="login-character-side">
            <div className="login-character-art" style={{ backgroundImage: `url(${robotMotion})` }} role="img" aria-label="挥手欢迎你的波波机器人" />
            <i className="login-spark-one" aria-hidden="true">★</i>
            <i className="login-spark-two" aria-hidden="true">〰</i>
            <div className="login-speech">嗨！我一直在等你呀</div>
          </section>

          <form className="companion-login-form" onSubmit={submit}>
            <span className="login-eyebrow">WELCOME, LITTLE CREATOR</span>
            <h1 id="login-title">欢迎来到<br /><em>会动的画里</em></h1>
            <p>告诉伙伴怎么称呼你，一起让画动起来、聊天和冒险吧！</p>
            <label htmlFor="creator-name">你叫什么名字？</label>
            <div className="companion-name-field">
              <span aria-hidden="true">☺</span>
              <input id="creator-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：乐乐" autoFocus autoComplete="nickname" />
            </div>
            <button type="submit">认识我的新伙伴 <span aria-hidden="true">→</span></button>
            <small><span aria-hidden="true">✓</span> 仅保存在你的设备上 · 无需密码</small>
          </form>
        </div>
      </section>
    </main>
  );
}
