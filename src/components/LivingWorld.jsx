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
import WorldDrawingEditor from "./WorldDrawingEditor";
import ObjectDrawingEditor from "./ObjectDrawingEditor";
import CustomSceneObject from "./CustomSceneObject";
import ParentControls from "./ParentControls";
import { screenChildMessage } from "../utils/safety";
import { chatWithArk } from "../utils/api";


const replacementTypeByKind = { house: "house", animal: "dog", character: "person", prop: "food" };
const defaultPositionByKind = {
  house: { x: 76, y: 43 },
  animal: { x: 64, y: 64 },
  character: { x: 34, y: 60 },
  prop: { x: 52, y: 69 },
};


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
    speakerId: selectedAvatar?.id,
    speakerName: characterName,
    text: `你好，${userName || "小小创作者"}！我是${characterName}。现在不只可以让我动起来，也可以和我聊天啦！`,
  }]);
  const [suggestions, setSuggestions] = useState(["你好呀！", "你喜欢什么？", "我们去冒险吧"]);
  const [typing, setTyping] = useState(false);
  const [storyActive, setStoryActive] = useState(false);
  const [storyStep, setStoryStep] = useState(initialState?.storyStep || 0);
  const [storyEnding, setStoryEnding] = useState(initialState?.storyEnding || null);
  const [showExport, setShowExport] = useState(false);
  const [showSceneEditor, setShowSceneEditor] = useState(false);
  const [positionBounds, setPositionBounds] = useState({});
  const [worldDrawingMode, setWorldDrawingMode] = useState(null);
  const [worldArt, setWorldArt] = useState(() => initialState?.worldArt || { house: null, background: null });
  const [showObjectDrawing, setShowObjectDrawing] = useState(false);
  const [customObjects, setCustomObjects] = useState(() => initialState?.customObjects || []);
  const [replacedTypes, setReplacedTypes] = useState(() => initialState?.replacedTypes || []);
  const [customObjectActions, setCustomObjectActions] = useState({});
  const [customHouseStates, setCustomHouseStates] = useState(() => initialState?.customHouseStates || {});
  const [showParentControls, setShowParentControls] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const timers = useRef([]);
  const stageRef = useRef(null);
  const messageId = useRef(Math.max(1, ...(initialState?.messages || []).map((item) => Number(item.id) || 0)) + 1);


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
    if (action === "move") {
      setPersistentState((state) => ({ ...state, dogMoved: !state.dogMoved }));
      setObjects((current) => current.map((item) => item.id === objectId ? { ...item, x: item.x > 58 ? 50 : 70 } : item));
    }
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
    setMessages((current) => [...current, {
      id: messageId.current++,
      role,
      text,
      ...(role === "assistant" ? { speakerId: activeCompanion?.id, speakerName: characterName } : {}),
    }]);
  };


  const addCustomObject = (drawing) => {
    const replacesType = drawing.placementMode === "replace" ? replacementTypeByKind[drawing.kind] : null;
    const sameKindCount = customObjects.filter((item) => item.kind === drawing.kind && !item.replacesType).length;
    const replacedObject = replacesType ? objects.find((item) => item.type === replacesType) : null;
    const position = replacedObject || defaultPositionByKind[drawing.kind];
    const customObject = {
      id: `custom-object-${Date.now()}`,
      isCustom: true,
      kind: drawing.kind,
      label: drawing.label,
      imageUrl: drawing.imageUrl,
      replacesType,
      x: Math.min(88, position.x + sameKindCount * 4),
      y: Math.min(78, position.y + sameKindCount * 3),
      layer: replacesType ? Math.max(6, (replacedObject?.layer || 3) + 1) : 10 + sameKindCount,
    };
    setCustomObjects((current) => [
      ...current.filter((item) => !replacesType || item.replacesType !== replacesType),
      customObject,
    ]);
    if (replacesType) setReplacedTypes((current) => [...new Set([...current, replacesType])]);
    setShowObjectDrawing(false);
    setMessage(`${drawing.label}已经加入游戏世界啦！`);
    setBubbleVisible(true);
    later(() => setBubbleVisible(false), 2400);
  };


  const animateCustomObject = (object) => {
    if (object.kind === "house") {
      const willOpen = !customHouseStates[object.id]?.doorOpen;
      setCustomHouseStates((current) => ({ ...current, [object.id]: { doorOpen: willOpen } }));
      setCustomObjectActions((current) => ({ ...current, [object.id]: willOpen ? "openDoor" : "closeDoor" }));
      setMessage(`${object.label}的门${willOpen ? "打开" : "关上"}啦！`);
    } else {
      setCustomObjectActions((current) => ({ ...current, [object.id]: object.kind }));
      setMessage(`${object.label}动起来啦！`);
    }
    setBubbleVisible(true);
    later(() => setCustomObjectActions((current) => ({ ...current, [object.id]: null })), 1100);
    later(() => setBubbleVisible(false), 2200);
  };


  const deleteCustomObject = (id) => {
    const target = customObjects.find((item) => item.id === id);
    setCustomObjects((current) => current.filter((item) => item.id !== id));
    setCustomHouseStates((current) => { const next = { ...current }; delete next[id]; return next; });
    if (target?.replacesType) setReplacedTypes((current) => current.filter((type) => type !== target.replacesType));
  };


  const moveSceneObject = (id, axis, value) => {
    if (customObjects.some((item) => item.id === id)) {
      setCustomObjects((current) => current.map((item) => item.id === id ? { ...item, [axis]: value } : item));
    } else {
      setObjects((current) => current.map((object) => object.id === id ? { ...object, [axis]: value } : object));
    }
  };


  const changeObjectLayer = (id, direction) => {
    const updateLayer = (item) => item.id === id ? { ...item, layer: Math.max(1, Math.min(40, (item.layer || 3) + direction)) } : item;
    if (customObjects.some((item) => item.id === id)) setCustomObjects((current) => current.map(updateLayer));
    else setObjects((current) => current.map(updateLayer));
  };


  const applyWorldArt = (art) => {
    setWorldArt(art);
    setWorldDrawingMode(null);
  };


  const handleConversation = async (text) => {
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


    try {
      let reply;
      try {
        reply = await chatWithArk({
          text,
          name: characterName,
          sceneObjects: objects,
          persistentState,
          history: messages.slice(-8),
        });
      } catch (error) {
        console.warn("Chat API unavailable; using local reply fallback:", error.message);
        reply = createCharacterReply(text, {
        name: characterName,
        turn: messages.length,
        sceneObjects: objects,
        persistentState,
        });
      }
      if (reply.target === "person1" && activeCompanionId !== selectedAvatar?.id) reply.target = "person2";
      setTyping(false);
      appendMessage("assistant", reply.text);
      setSuggestions(reply.suggestions || []);
      setMessage(reply.text);
      setBubbleVisible(true);
      if (reply.target && reply.action) playAction(reply.target, reply.action, reply.text);
      later(() => setBubbleVisible(false), 2800);
    } finally {
      setTyping(false);
    }
  };


  const handleDirectAction = (objectId, action) => {
    const originalType = objects.find((item) => item.id === objectId)?.type;
    const replacement = customObjects.find((item) => item.replacesType === originalType);
    if (replacement) {
      animateCustomObject(replacement);
      appendMessage("assistant", `${replacement.label}动起来啦！`);
      return;
    }
    playAction(objectId, action);
    const reply = actionFeedback[action] || "世界动起来啦！";
    appendMessage("assistant", reply);
    setSuggestions(["跟我挥挥手", "你喜欢什么？", "给我讲个故事"]);
  };


  const openSceneEditor = () => {
    const stage = stageRef.current;
    const stageBounds = stage?.getBoundingClientRect();
    if (stage && stageBounds) {
      const nextBounds = {};
      [...objects.filter((object) => !replacedTypes.includes(object.type)), ...customObjects].forEach((object) => {
        const element = stage.querySelector(`[data-object-id="${object.id}"]`);
        const bounds = element?.getBoundingClientRect();
        const halfWidth = Math.min(42, ((bounds?.width || 0) / 2 / stageBounds.width) * 100 + 1.5);
        const halfHeight = Math.min(42, ((bounds?.height || 0) / 2 / stageBounds.height) * 100 + 1.5);
        nextBounds[object.id] = { minX: Math.ceil(halfWidth), maxX: Math.floor(100 - halfWidth), minY: Math.ceil(halfHeight), maxY: Math.floor(100 - halfHeight) };
      });
      setPositionBounds(nextBounds);
    }
    setShowSceneEditor(true);
  };


  const moveObject = (objectId, clientX, clientY, objectSize) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const halfWidth = Math.min(42, ((objectSize?.width || 0) / 2 / rect.width) * 100 + 1.5);
    const halfHeight = Math.min(42, ((objectSize?.height || 0) / 2 / rect.height) * 100 + 1.5);
    const x = Math.max(halfWidth, Math.min(100 - halfWidth, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(halfHeight, Math.min(100 - halfHeight, ((clientY - rect.top) / rect.height) * 100));
    if (customObjects.some((object) => object.id === objectId)) {
      setCustomObjects((current) => current.map((object) => object.id === objectId ? { ...object, x, y } : object));
    } else {
      setObjects((current) => current.map((object) => object.id === objectId ? { ...object, x, y } : object));
    }
    if (objectId === "dog1") setPersistentState((state) => state.dogMoved ? { ...state, dogMoved: false } : state);
  };


  const finishMovingObject = (objectId) => {
    const object = [...objects, ...customObjects].find((item) => item.id === objectId);
    if (!object) return;
    setMessage(`${object.label}已经移动到新位置啦！`);
    setBubbleVisible(true);
    later(() => setBubbleVisible(false), 1800);
  };


  const visibleObjects = objects.filter((object) => !replacedTypes.includes(object.type));


  return (
    <main className="world-page">
      <header className="world-header">
        <button className="wordmark" type="button" onClick={onReset} aria-label="返回上传新画作">
          <span aria-hidden="true">✦</span><b>绘梦伙伴</b>
        </button>
        <div className="found-status"><span aria-hidden="true">●</span> 找到 {visibleObjects.length + customObjects.length} 个朋友</div>
        <div className="world-header-actions"><button type="button" onClick={() => setWorldDrawingMode("background")}>画背景图层</button><button type="button" onClick={() => setShowObjectDrawing(true)}>添加画作图层</button><button type="button" onClick={() => setShowParentControls(true)}>家长设置</button><button type="button" onClick={openSceneEditor}>编辑图层</button><button type="button" onClick={() => onSave?.({ persistentState, messages, storyStep, storyEnding, sceneObjects: objects, sceneTheme, worldArt, customObjects, replacedTypes, customHouseStates })}>保存作品</button><button type="button" onClick={() => setShowExport(true)}>导出分享</button><button className="new-drawing" type="button" onClick={onReset}>换个角色 <span aria-hidden="true">↗</span></button></div>
      </header>
      {showExport && <ExportPanel data={{ characterName, userName, messageCount: messages.length, ending: storyEnding, persistentState, messages, storyStep }} onClose={() => setShowExport(false)} />}
      {showSceneEditor && <SceneEditor objects={[...visibleObjects, ...customObjects]} theme={sceneTheme} positionBounds={positionBounds} onThemeChange={setSceneTheme} onObjectChange={moveSceneObject} onLayerChange={changeObjectLayer} onDeleteObject={deleteCustomObject} onClose={() => setShowSceneEditor(false)} />}
      {worldDrawingMode && <WorldDrawingEditor initialArt={worldArt} initialMode={worldDrawingMode} backgroundOnly onApply={applyWorldArt} onClose={() => setWorldDrawingMode(null)} />}
      {showObjectDrawing && <ObjectDrawingEditor onAdd={addCustomObject} onClose={() => setShowObjectDrawing(false)} />}
      {showParentControls && <ParentControls settings={safety} onChange={onSafetyChange} onClear={onClearLocalData} onClose={() => setShowParentControls(false)} />}
      {timeUp && <div className="break-reminder" role="dialog" aria-modal="true" aria-labelledby="break-title"><section><span aria-hidden="true">✦</span><h2 id="break-title">让眼睛休息一下吧</h2><p>已经创作了一段时间。看看远处、活动一下，准备好后再回来。</p><div><button type="button" onClick={onReset}>回到作品库</button><button type="button" onClick={() => setTimeUp(false)}>再创作一会儿</button></div></section></div>}


      <div className="world-experience">
      <section ref={stageRef} className={`world-stage theme-${sceneTheme} ${persistentState.night ? "is-night" : ""} ${storyActive ? "story-is-active" : ""}`} aria-label="可拖动的互动世界">
        <div className="demo-mode-badge"><span aria-hidden="true">●</span> {worldArt.background ? "原始世界 + 自绘背景图层" : selectedAvatar?.isUploaded ? "自绘角色已进入世界" : selectedAvatar ? "原角色动作帧" : "本地 Demo 识别"}</div>
        <div className="drag-tip" id="drag-help"><span aria-hidden="true">↔</span> 按住任意角色或物件直接拖动；位置会跟随作品保存</div>
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
        {worldArt.background && <div className="custom-world-background" style={{ backgroundImage: `url(${worldArt.background})` }} aria-hidden="true" />}
        <SpeechBubble message={message} visible={bubbleVisible && !storyActive} />
        <div className={persistentState.dogMoved ? "dog-route is-moved" : "dog-route"}>
          {visibleObjects.map((object) => (
            <SceneObject
              key={object.id}
              object={object}
              action={activeActions[object.id]}
              persistentState={persistentState}
              onInteract={handleDirectAction}
              onMove={moveObject}
              onMoveEnd={finishMovingObject}
              avatar={companions.find((avatar) => avatar.id === object.avatarId) || selectedAvatar}
              showJoints={showJoints}
              houseArt={worldArt.house}
            />
          ))}
          {customObjects.map((object) => (
            <CustomSceneObject
              key={object.id}
              object={object}
              action={customObjectActions[object.id]}
              doorOpen={Boolean(customHouseStates[object.id]?.doorOpen)}
              onInteract={animateCustomObject}
              onMove={moveObject}
              onMoveEnd={finishMovingObject}
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
