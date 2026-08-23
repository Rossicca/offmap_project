import { useEffect, useRef, useState } from "react";
import { actionDurations, actionFeedback } from "../utils/actions";
import { createCharacterReply } from "../utils/conversation";
import ActionButtons from "./ActionButtons";
import ConversationPanel from "./ConversationPanel";
import SceneObject from "./SceneObject";
import SpeechBubble from "./SpeechBubble";
import StoryMode from "./StoryMode";

export default function LivingWorld({ sceneObjects, previewUrl, onReset, selectedAvatar, rigAnalysis, userName, initialState, onSave }) {
  const characterName = selectedAvatar?.name || "画中小伙伴";
  const [activeActions, setActiveActions] = useState({});
  const [persistentState, setPersistentState] = useState(() => initialState?.persistentState || { night: false, doorOpen: false, appleHidden: false, dogMoved: false });
  const [message, setMessage] = useState(() => selectedAvatar
    ? `${selectedAvatar.name}已经进入互动世界啦！`
    : "Demo 已找到 6 个朋友，点点它们试试看！");
  const [bubbleVisible, setBubbleVisible] = useState(true);
  const [showJoints, setShowJoints] = useState(false);
  const [messages, setMessages] = useState(() => initialState?.messages || [{
    id: 1,
    role: "assistant",
    text: `你好，${userName || "小小创作者"}！我是${characterName}。现在不只可以让我动起来，也可以和我聊天啦！`,
  }]);
  const [suggestions, setSuggestions] = useState(["你好呀！", "你喜欢什么？", "我们去冒险吧"]);
  const [typing, setTyping] = useState(false);
  const [storyActive, setStoryActive] = useState(false);
  const [storyStep, setStoryStep] = useState(initialState?.storyStep || 0);
  const [storyEnding, setStoryEnding] = useState(initialState?.storyEnding || null);
  const timers = useRef([]);
  const messageId = useRef(2);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const later = (callback, delay) => {
    const timer = window.setTimeout(callback, delay);
    timers.current.push(timer);
  };

  const playAction = (objectId, action, customMessage) => {
    const object = sceneObjects.find((item) => item.id === objectId);
    if (!object || !object.actions.includes(action)) return;

    if (storyActive && !storyEnding) {
      if (storyStep === 0 && objectId === "house1" && action === "openDoor") setStoryStep(1);
      if (storyStep === 1 && objectId === "dog1" && action === "move") setStoryStep(2);
      if (storyStep === 2 && objectId === "sun1" && ["sunset", "sunrise"].includes(action)) setStoryEnding(action === "sunset" ? "night" : "morning");
    }

    setActiveActions((current) => ({ ...current, [objectId]: action }));
    setMessage(customMessage || actionFeedback[action] || "世界动起来啦！");
    setBubbleVisible(true);

    if (action === "sunset") setPersistentState((state) => ({ ...state, night: true }));
    if (action === "sunrise") setPersistentState((state) => ({ ...state, night: false }));
    if (action === "openDoor") setPersistentState((state) => ({ ...state, doorOpen: true }));
    if (action === "closeDoor") setPersistentState((state) => ({ ...state, doorOpen: false }));
    if (action === "move") setPersistentState((state) => ({ ...state, dogMoved: !state.dogMoved }));
    if (action === "feed") {
      later(() => {
        setPersistentState((state) => ({ ...state, appleHidden: true }));
        setActiveActions((current) => ({ ...current, person1: "eat" }));
        setMessage("好吃！");
      }, 1150);
      later(() => setPersistentState((state) => ({ ...state, appleHidden: false })), 3200);
    }

    later(() => setActiveActions((current) => ({ ...current, [objectId]: null, ...(action === "feed" ? { person1: null } : {}) })), actionDurations[action] || 1000);
    later(() => setBubbleVisible(false), action === "feed" ? 2800 : 2300);
  };

  const appendMessage = (role, text) => {
    setMessages((current) => [...current, { id: messageId.current++, role, text }]);
  };

  const handleConversation = (text) => {
    appendMessage("user", text);
    setTyping(true);
    setSuggestions([]);

    later(() => {
      const reply = createCharacterReply(text, {
        name: characterName,
        turn: messages.length,
        sceneObjects,
        persistentState,
      });
      setTyping(false);
      appendMessage("assistant", reply.text);
      setSuggestions(reply.suggestions || []);
      setMessage(reply.text);
      setBubbleVisible(true);
      if (reply.target && reply.action) playAction(reply.target, reply.action, reply.text);
      later(() => setBubbleVisible(false), 2800);
    }, 560);
  };

  const handleDirectAction = (objectId, action) => {
    playAction(objectId, action);
    const reply = actionFeedback[action] || "世界动起来啦！";
    appendMessage("assistant", reply);
    setSuggestions(["跟我挥挥手", "你喜欢什么？", "给我讲个故事"]);
  };

  return (
    <main className="world-page">
      <header className="world-header">
        <button className="wordmark" type="button" onClick={onReset} aria-label="返回上传新画作">
          <span aria-hidden="true">✦</span><b>My Living Drawing</b>
        </button>
        <div className="found-status"><span aria-hidden="true">●</span> 找到 {sceneObjects.length} 个朋友</div>
        <div className="world-header-actions"><button type="button" onClick={() => onSave?.({ persistentState, messages, storyStep, storyEnding })}>保存作品</button><button className="new-drawing" type="button" onClick={onReset}>换个角色 <span aria-hidden="true">↗</span></button></div>
      </header>

      <div className="world-experience">
      <section className={`world-stage ${persistentState.night ? "is-night" : ""}`} aria-label="互动世界">
        <div className="demo-mode-badge"><span aria-hidden="true">●</span> {selectedAvatar ? "原角色动作帧" : "本地 Demo 识别"}</div>
        <button className={`joint-toggle ${showJoints ? "is-active" : ""}`} type="button" onClick={() => setShowJoints((value) => !value)} aria-pressed={showJoints}>
          <span aria-hidden="true">⌘</span> {showJoints ? "隐藏关节" : "显示关节"}
        </button>
        <StoryMode active={storyActive} step={storyStep} ending={storyEnding} onToggle={() => setStoryActive((value) => !value)} onAction={handleDirectAction} />
        <div className="drawing-backdrop" style={{ backgroundImage: previewUrl ? `url(${previewUrl})` : "none" }} aria-hidden="true" />
        <div className="sky-wash" aria-hidden="true" />
        <div className="stars" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="cloud cloud-one" aria-hidden="true" />
        <div className="cloud cloud-two" aria-hidden="true" />
        <div className="ground" aria-hidden="true" />
        <SpeechBubble message={message} visible={bubbleVisible} />
        <div className={persistentState.dogMoved ? "dog-route is-moved" : "dog-route"}>
          {sceneObjects.map((object) => (
            <SceneObject
              key={object.id}
              object={object}
              action={activeActions[object.id]}
              persistentState={persistentState}
              onInteract={handleDirectAction}
              selectedAvatar={selectedAvatar}
              showJoints={showJoints}
            />
          ))}
        </div>
        {showJoints && (
          <div className="rig-summary" role="status">
            <b>骨架分析</b>
            <span>{selectedAvatar?.kind || rigAnalysis?.person?.type || "人物"} · {selectedAvatar?.joints.length || rigAnalysis?.person?.joints || 10} 节点</span>
            <span>小狗 · {rigAnalysis?.dog?.joints || 7} 节点</span>
          </div>
        )}
      </section>

      <ConversationPanel
        characterName={characterName}
        messages={messages}
        suggestions={suggestions}
        typing={typing}
        onSend={handleConversation}
      />
      </div>

      <ActionButtons onAction={handleDirectAction} persistentState={persistentState} />
    </main>
  );
}
