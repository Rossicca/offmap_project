import { useState } from "react";

export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");

  const submit = (event) => {
    event.preventDefault();
    onLogin(name.trim() || "小小创作者");
  };

  return (
    <main className="login-page">
      <section className="login-story" aria-labelledby="login-title">
        <div className="brand-mark" aria-hidden="true">✦</div>
        <h1 id="login-title">欢迎来到<br /><em>会动的画里</em></h1>
        <p>上传你的画，或挑选一个 AI 小伙伴。每个角色都有自己的关节和动作。</p>
        <div className="login-figures" aria-hidden="true">
          <i className="mini-figure one" /><i className="mini-figure two" /><i className="mini-figure three" />
        </div>
      </section>

      <form className="login-card" onSubmit={submit}>
        <div className="login-card-top"><span aria-hidden="true">●</span> Demo 创作空间</div>
        <h2>先告诉我怎么称呼你</h2>
        <p>这里只是比赛演示登录，不会上传或保存个人信息。</p>
        <label htmlFor="creator-name">你的名字</label>
        <input
          id="creator-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="例如：乐乐"
          autoFocus
        />
        <button className="primary-button login-submit" type="submit">
          进入创作空间 <span aria-hidden="true">→</span>
        </button>
        <small><span aria-hidden="true">✓</span> 本地 Demo · 无需密码</small>
      </form>
    </main>
  );
}
