import { useState } from "react";

export default function CommandBox({ onCommand }) {
  const [text, setText] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    onCommand(text);
    setText("");
  };

  return (
    <form className="command-box" onSubmit={submit}>
      <label htmlFor="world-command">告诉这个世界，你想发生什么？</label>
      <div className="command-row">
        <input
          id="world-command"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="试试：让太阳下山"
          autoComplete="off"
        />
        <button type="submit" disabled={!text.trim()} aria-label="发送指令">
          <span>发送</span><b aria-hidden="true">↑</b>
        </button>
      </div>
      <p><span aria-hidden="true">●</span> 离线也能听懂常用指令</p>
    </form>
  );
}
