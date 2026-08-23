import { useEffect, useRef, useState } from "react";

const defaultSuggestions = ["你好呀！", "你喜欢什么？", "我们去冒险吧"];

export default function ConversationPanel({ characterName, messages, suggestions = defaultSuggestions, typing, onSend }) {
  const [text, setText] = useState("");
  const logRef = useRef(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (value) => {
    const next = value.trim();
    if (!next || typing) return;
    onSend(next);
    setText("");
  };

  return (
    <aside className="conversation-panel" aria-labelledby="conversation-title">
      <header className="conversation-header">
        <span className="conversation-avatar" aria-hidden="true">✦</span>
        <div><h2 id="conversation-title">和{characterName}聊聊天</h2><p><i /> 正在这个小世界里陪你</p></div>
      </header>

      <div className="conversation-log" ref={logRef} role="log" aria-live="polite" aria-label="对话记录">
        {messages.map((message) => (
          <div className={`chat-message is-${message.role}`} key={message.id}>
            {message.role === "assistant" && <b>{characterName}</b>}
            <p>{message.text}</p>
          </div>
        ))}
        {typing && <div className="chat-message is-assistant is-typing" aria-label={`${characterName}正在回复`}><b>{characterName}</b><p><i /><i /><i /></p></div>}
      </div>

      <div className="conversation-suggestions" aria-label="快捷话题">
        {suggestions.slice(0, 3).map((suggestion) => <button type="button" key={suggestion} onClick={() => send(suggestion)} disabled={typing}>{suggestion}</button>)}
      </div>

      <form className="conversation-composer" onSubmit={(event) => { event.preventDefault(); send(text); }}>
        <label className="visually-hidden" htmlFor="character-chat">对{characterName}说</label>
        <input id="character-chat" value={text} onChange={(event) => setText(event.target.value)} placeholder={`对${characterName}说点什么…`} autoComplete="off" maxLength={100} />
        <button type="submit" disabled={!text.trim() || typing} aria-label="发送消息"><span>发送</span><b aria-hidden="true">↑</b></button>
      </form>
      <small>本地对话 Demo · 也能听懂场景动作指令</small>
    </aside>
  );
}
