import { useEffect, useRef, useState } from "react";

const defaultSuggestions = ["你好呀！", "你喜欢什么？", "我们去冒险吧"];

export default function ConversationPanel({ characterName, messages, suggestions = defaultSuggestions, typing, onSend }) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceReply, setVoiceReply] = useState(() => localStorage.getItem("living-drawing-voice") === "on");
  const [voiceNotice, setVoiceNotice] = useState("");
  const logRef = useRef(null);
  const recognitionRef = useRef(null);
  const spokenMessageRef = useRef(0);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    const latest = messages[messages.length - 1];
    if (!voiceReply || !latest || latest.role !== "assistant" || latest.id === spokenMessageRef.current || !("speechSynthesis" in window)) return;
    spokenMessageRef.current = latest.id;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(latest.text);
    utterance.lang = "zh-CN";
    utterance.rate = .95;
    utterance.pitch = 1.08;
    window.speechSynthesis.speak(utterance);
  }, [messages, voiceReply]);

  useEffect(() => () => {
    recognitionRef.current?.abort();
    window.speechSynthesis?.cancel();
  }, []);

  const send = (value) => {
    const next = value.trim();
    if (!next || typing) return;
    onSend(next);
    setText("");
  };

  const toggleVoiceReply = () => {
    const next = !voiceReply;
    setVoiceReply(next);
    localStorage.setItem("living-drawing-voice", next ? "on" : "off");
    if (!next) window.speechSynthesis?.cancel();
  };

  const startListening = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceNotice("当前浏览器不支持语音输入，请继续使用文字聊天。");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "zh-CN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => { setListening(true); setVoiceNotice("正在听你说…"); };
    recognition.onresult = (event) => { const heard = event.results[0][0].transcript; setText(heard); setVoiceNotice(`听到：${heard}`); };
    recognition.onerror = () => setVoiceNotice("没有听清楚，可以再试一次或直接输入文字。");
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <aside className="conversation-panel" aria-labelledby="conversation-title">
      <header className="conversation-header">
        <span className="conversation-avatar" aria-hidden="true">✦</span>
        <div><h2 id="conversation-title">和{characterName}聊聊天</h2><p><i /> 正在这个小世界里陪你</p></div>
        <button className={`voice-reply-toggle ${voiceReply ? "is-active" : ""}`} type="button" onClick={toggleVoiceReply} aria-pressed={voiceReply} aria-label={voiceReply ? "关闭角色朗读" : "开启角色朗读"}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9v6h4l5 4V5L9 9H5Z"/><path d="M17 9c1.5 1.5 1.5 4.5 0 6M19.5 6.5c3 3 3 8 0 11"/></svg></button>
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
        <button className={`voice-input-button ${listening ? "is-listening" : ""}`} type="button" onClick={startListening} disabled={typing || listening} aria-label={listening ? "正在听你说" : "语音输入"}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M8.5 21h7"/></svg></button>
        <button type="submit" disabled={!text.trim() || typing} aria-label="发送消息"><span>发送</span><b aria-hidden="true">↑</b></button>
      </form>
      {voiceNotice && <p className="voice-notice" role="status">{voiceNotice}</p>}
      <small>本地对话 Demo · 也能听懂场景动作指令</small>
    </aside>
  );
}
