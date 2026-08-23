import { useEffect, useRef, useState } from "react";
import { actionDurations, actionFeedback } from "../utils/actions";
import { createCharacterReply } from "../utils/conversation";
import ActionButtons from "./ActionButtons";
import ConversationPanel from "./ConversationPanel";
import SceneObject from "./SceneObject";
import SpeechBubble from "./SpeechBubble";
import StoryMode from "./StoryMode";
import ExportPanel from "./ExportPanel";
import SceneEditor from "./SceneEditor";
import ParentControls from "./ParentControls";
import { screenChildMessage } from "../utils/safety";

export default function LivingWorld({ sceneObjects, previewUrl, onReset, selectedAvatar, companions = [], rigAnalysis, userName, initialState, onSave, safety = { safeChat: true, voiceAllowed: true, sessionMinutes: 30 }, onSafetyChange, onClearLocalData }) {
  const [activeCompanionId, setActiveCompanionId] = useState(selectedAvatar?.id);
  const activeCompanion = companions.find((avatar) => avatar.id === activeCompanionId) || selectedAvatar;
  const characterName = activeCompanion?.name || "画中小伙伴";
  const [objects, setObjects] = useState(() => initialState?.sceneObjects || sceneObjects);
  const [sceneTheme, setSceneTheme] = useState(initialState?.sceneTheme || "meadow");
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
  const [showExport, setShowExport] = useState(false);
  const [showSceneEditor, setShowSceneEditor] = useState(false);
  const [showParentControls, setShowParentControls] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const timers = useRef([]);
  const messageId = useRef(2);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);
  useEffect(() => {
    if (!safety.sessionMinutes) return undefined;
    const timer = window.setTimeout(() => setTimeUp(true), safety.sessionMinutes * 60 * 1000);
    return () => window.clearTimeout(timer);
  }, [safety.sessionMinutes]);

  const later = (callback, delay) => {
    const timer = window.setTimeout(callback, delay);
    timers.current.push(timer);
  };

  const playAction = (objectId, action, customMessage) => {
    const object = objects.find((item) => item.id === objectId);
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
    const screened = screenChildMessage(text, safety.safeChat);
    appendMessage("user", screened.text);
    if (!screened.safe) {
      appendMessage("assistant", screened.reply);
      setSuggestions(["聊聊画画", "给我讲个故事", "看看小狗"]);
      setMessage(screened.reply);
      setBubbleVisible(true);
      later(() => setBubbleVisible(false), 3200);
      return;
    }
    setTyping(true);
    setSuggestions([]);

    later(() => {
      const reply = createCharacterReply(text, {
        name: characterName,
        turn: messages.length,
        sceneObjects: objects,
        persistentState,
      });
      if (reply.target === "person1" && activeCompanionId !== selectedAvatar?.id) reply.target = "person2";
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
        <div className="found-status"><span aria-hidden="true">●</span> 找到 {objects.length} 个朋友</div>
        <div className="world-header-actions"><button type="button" onClick={() => setShowParentControls(true)}>家长设置</button><button type="button" onClick={() => setShowSceneEditor(true)}>编辑场景</button><button type="button" onClick={() => onSave?.({ persistentState, messages, storyStep, storyEnding, sceneObjects: objects, sceneTheme })}>保存作品</button><button type="button" onClick={() => setShowExport(true)}>导出分享</button><button className="new-drawing" type="button" onClick={onReset}>换个角色 <span aria-hidden="true">↗</span></button></div>
      </header>
      {showExport && <ExportPanel data={{ characterName, userName, messageCount: messages.length, ending: storyEnding, persistentState, messages, storyStep }} onClose={() => setShowExport(false)} />}
      {showSceneEditor && <SceneEditor objects={objects} theme={sceneTheme} onThemeChange={setSceneTheme} onObjectChange={(id, axis, value) => setObjects((current) => current.map((object) => object.id === id ? { ...object, [axis]: value } : object))} onClose={() => setShowSceneEditor(false)} />}
      {showParentControls && <ParentControls settings={safety} onChange={onSafetyChange} onClear={onClearLocalData} onClose={() => setShowParentControls(false)} />}
      {timeUp && <div className="break-reminder" role="dialog" aria-modal="true" aria-labelledby="break-title"><section><span aria-hidden="true">✦</span><h2 id="break-title">让眼睛休息一下吧</h2><p>已经创作了一段时间。看看远处、活动一下，准备好后再回来。</p><div><button type="button" onClick={onReset}>回到作品库</button><button type="button" onClick={() => setTimeUp(false)}>再创作一会儿</button></div></section></div>}

      <div className="world-experience">
      <section className={`world-stage theme-${sceneTheme} ${persistentState.night ? "is-night" : ""}`} aria-label="互动世界">
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
          {objects.map((object) => (
            <SceneObject
              key={object.id}
              object={object}
              action={activeActions[object.id]}
              persistentState={persistentState}
              onInteract={handleDirectAction}
              avatar={companions.find((avatar) => avatar.id === object.avatarId) || selectedAvatar}
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
        companions={companions}
        activeCompanionId={activeCompanionId}
        onCompanionChange={setActiveCompanionId}
        messages={messages}
        suggestions={suggestions}
        typing={typing}
        onSend={handleConversation}
        voiceAllowed={safety.voiceAllowed}
      />
      </div>

      <ActionButtons onAction={handleDirectAction} persistentState={persistentState} />
    </main>
  );
}
