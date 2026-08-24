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
import MaterialLibrary from "./MaterialLibrary";
import MaterialSceneObject from "./MaterialSceneObject";
import HouseDecorator from "./HouseDecorator";
import DoghouseDecorator from "./DoghouseDecorator";
import KidToolDock from "./KidToolDock";
import RockPaperScissors from "./RockPaperScissors";
import { screenChildMessage } from "../utils/safety";
import { chatWithArk } from "../utils/api";
import { playDogBark } from "../utils/soundEffects";
import { backgroundStyleFor, defaultDoghouseDecor, defaultHouseDecor } from "../data/materialCatalog";


const replacementTypeByKind = { house: "house", animal: "dog", character: "person", prop: "food" };
const FOREGROUND_CHARACTER_LAYER = 50;
const MAX_SCENERY_LAYER = 40;
const defaultAppleObject = { id: "apple1", type: "food", x: 51, y: 69, actions: ["feed"], label: "苹果" };
const defaultDoghouseObject = { id: "doghouse1", type: "doghouse", x: 82, y: 72, layer: 5, actions: ["visitDoghouse"], label: "狗狗的小窝" };
const defaultDogToyObject = { id: "dogToy1", type: "dogToy", x: 57, y: 76, layer: 16, actions: ["toyBounce"], label: "狗狗的玩具球" };
const defaultFetchBallObject = { id: "fetchBall1", type: "fetchBall", x: 45, y: 75, layer: 17, actions: ["ballBounce"], label: "狗狗捡的小球" };
const defaultToyBasketObject = { id: "toyBasket1", type: "toyBasket", x: 35, y: 76, layer: 18, actions: ["basketHello"], label: "玩具篮子" };
const removedDefaultObjectIds = new Set(["tree2", "tree3", "tree4", "tree5", "distantHouse1", "distantHouse2", "distantHouse3", "distantHouse4", "villager1", "villager2", "villager3", "villager4"]);
const defaultPositionByKind = {
  house: { x: 76, y: 43 },
  animal: { x: 64, y: 64 },
  character: { x: 34, y: 60 },
  prop: { x: 52, y: 69 },
};
const defaultLearningState = { topic: "discovery", stars: 0, streak: 0, attempts: 0, currentAnswer: null, lastResult: "neutral" };
const learningPrompts = {
  start: { math: "我们一起学数学吧，请先用一个简单问题了解我的程度。", reading: "我们一起练阅读吧，请给我一小段适合朗读的内容。", english: "我们一起学英语吧，请从一个简单的生活词语开始。", discovery: "我想自由探索，请从这幅画里的事物开始教我一个小知识。" },
  quiz: { math: "请给我出一道简短的数学小题，先不要告诉我答案。", reading: "请给我一道简短的阅读理解小题，先让我自己想。", english: "请给我一道简单的英语词语小题，先不要公布答案。", discovery: "请根据画面给我出一道观察或常识小题。" },
  hint: { math: "这道题我还没想明白，请只给我一步提示，不要直接说答案。", reading: "请提示我应该回到哪句话找线索，不要直接说答案。", english: "请给我一个联想或首字母提示，不要直接说答案。", discovery: "请给我一个观察提示，让我自己发现答案。" },
  review: { math: "请用一句话带我复习刚才的数学方法，再给一个很小的例子。", reading: "请帮我复习刚才用到的阅读方法。", english: "请带我复习刚才学过的英语词语。", discovery: "请用三个要点帮我复习刚才发现的知识。" },
};


export default function LivingWorld({ sceneObjects, onReset, selectedAvatar, companions = [], rigAnalysis, userName, initialState, onSave, safety = { safeChat: true, voiceAllowed: true, sessionMinutes: 30 }, onSafetyChange, onClearLocalData }) {
  const [activeCompanionId, setActiveCompanionId] = useState(selectedAvatar?.id);
  const activeCompanion = companions.find((avatar) => avatar.id === activeCompanionId) || selectedAvatar;
  const characterName = activeCompanion?.name || "画中小伙伴";
  const [objects, setObjects] = useState(() => {
    const initialObjects = (initialState?.sceneObjects || sceneObjects).filter((object) => !removedDefaultObjectIds.has(object.id));
    const withApple = initialObjects.some((object) => object.id === "apple1") ? initialObjects : [...initialObjects, defaultAppleObject];
    const withDoghouse = withApple.some((object) => object.id === "doghouse1") ? withApple : [...withApple, defaultDoghouseObject];
    const withDogToy = withDoghouse.some((object) => object.id === "dogToy1") ? withDoghouse : [...withDoghouse, defaultDogToyObject];
    const withFetchBall = withDogToy.some((object) => object.id === "fetchBall1") ? withDogToy : [...withDogToy, defaultFetchBallObject];
    return withFetchBall.some((object) => object.id === "toyBasket1") ? withFetchBall : [...withFetchBall, defaultToyBasketObject];
  });
  const [sceneTheme, setSceneTheme] = useState(initialState?.sceneTheme || "meadow");
  const [activeActions, setActiveActions] = useState({});
  const [persistentState, setPersistentState] = useState(() => initialState?.persistentState || { night: false, doorOpen: false, appleHidden: false, dogMoved: false, restingCharacters: [] });
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
  const [showMaterialLibrary, setShowMaterialLibrary] = useState(false);
  const [showHouseDecorator, setShowHouseDecorator] = useState(false);
  const [showDoghouseDecorator, setShowDoghouseDecorator] = useState(false);
  const [editingDoghouseId, setEditingDoghouseId] = useState(null);
  const [libraryObjects, setLibraryObjects] = useState(() => initialState?.libraryObjects || []);
  const [materialBackground, setMaterialBackground] = useState(() => initialState?.materialBackground || null);
  const [houseDecor, setHouseDecor] = useState(() => initialState?.houseDecor || defaultHouseDecor);
  const [learningState, setLearningState] = useState(() => initialState?.learningState || defaultLearningState);
  const [doghouseDecor, setDoghouseDecor] = useState(() => initialState?.doghouseDecor || defaultDoghouseDecor);
  const [showParentControls, setShowParentControls] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [showRpsGame, setShowRpsGame] = useState(false);
  const [windActive, setWindActive] = useState(false);
  const [cloudDrift, setCloudDrift] = useState(() => initialState?.cloudDrift || 0);
  const timers = useRef([]);
  const stageRef = useRef(null);
  const roomReturnPositions = useRef({});
  const feedReturnPositions = useRef({});
  const doghouseReturnPosition = useRef(null);
  const dogEatReturnPosition = useRef(null);
  const dogPlayReturnPosition = useRef(null);
  const fetchReturnPositions = useRef({ dog: null, ball: null });
  const toyBasketReturnPositions = useRef({ person: null, toys: {} });
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
    const feedTarget = action === "feed"
      ? objects.find((item) => item.type === "person" && item.avatarId === activeCompanionId) || objects.find((item) => item.type === "person")
      : null;
    const isRoomExit = action === "leaveRoom" && object?.type === "person";
    const isDoghouseAction = object?.type === "dog" && ["enterDoghouse", "exitDoghouse", "dogEat", "dogEatApple", "dogPlay", "dogFetch"].includes(action);
    const isToyBasketAction = object?.type === "person" && ["tidyToys", "takeToys"].includes(action);
    if (!object || (!object.actions.includes(action) && !isRoomExit && !isDoghouseAction && !isToyBasketAction)) return;
    if (action === "dogEat" && activeActions[objectId]) return;
    if (action === "dogEatApple" && (activeActions[objectId] || activeActions.apple1 || persistentState.appleHidden)) return;
    if (action === "dogPlay" && activeActions[objectId]) return;
    if (action === "dogFetch" && activeActions[objectId]) return;
    if (isToyBasketAction && (activeActions[objectId] || activeActions.dog1)) return;

    const isPerson = object.type === "person";
    const isAlreadyInRoom = persistentState.restingCharacters?.includes(objectId);
    if (isPerson && action !== "rest" && isAlreadyInRoom) {
      const returnPosition = roomReturnPositions.current[objectId];
      const leaveRoom = () => {
        setObjects((current) => current.map((item) => item.id === objectId ? {
          ...item,
          x: returnPosition?.x ?? Math.max(12, item.x - 15),
          y: returnPosition?.y ?? Math.min(78, item.y + 18),
        } : item));
        setPersistentState((state) => ({ ...state, restingCharacters: (state.restingCharacters || []).filter((id) => id !== objectId) }));
      };

      if (action === "leaveRoom") {
        const room = customObjects.find((item) => item.kind === "house") || objects.find((item) => item.type === "house");
        if (room?.isCustom) {
          setCustomHouseStates((current) => ({ ...current, [room.id]: { ...(current[room.id] || {}), doorOpen: true } }));
        } else {
          setPersistentState((state) => ({ ...state, doorOpen: true }));
        }
        later(leaveRoom, 500);
        later(() => {
          if (room?.isCustom) {
            setCustomHouseStates((current) => ({ ...current, [room.id]: { ...(current[room.id] || {}), doorOpen: false } }));
          } else {
            setPersistentState((state) => ({ ...state, doorOpen: false }));
          }
        }, 1200);
      } else {
        leaveRoom();
      }
    }


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
    if (action === "rest") {
      const room = customObjects.find((item) => item.kind === "house") || objects.find((item) => item.type === "house");
      if (room) {
        if (!isAlreadyInRoom) roomReturnPositions.current[objectId] = { x: object.x, y: object.y };
        if (room.isCustom) {
          setCustomHouseStates((current) => ({ ...current, [room.id]: { ...(current[room.id] || {}), doorOpen: true } }));
        }
        setObjects((current) => current.map((item) => item.id === objectId ? { ...item, x: room.x, y: Math.min(78, room.y + 5) } : item));
        setPersistentState((state) => ({
          ...state,
          doorOpen: room.isCustom ? state.doorOpen : true,
          restingCharacters: [...new Set([...(state.restingCharacters || []), objectId])],
        }));
        later(() => {
          if (room.isCustom) {
            setCustomHouseStates((current) => ({ ...current, [room.id]: { ...(current[room.id] || {}), doorOpen: false } }));
          } else {
            setPersistentState((state) => ({ ...state, doorOpen: false }));
          }
        }, 900);
      }
    }
    if (action === "enterDoghouse") {
      const doghouse = objects.find((item) => item.id === "doghouse1");
      if (doghouse) {
        doghouseReturnPosition.current = { x: object.x, y: object.y };
        setObjects((current) => current.map((item) => item.id === objectId ? { ...item, x: doghouse.x, y: doghouse.y + 1 } : item));
        later(() => setPersistentState((state) => ({ ...state, dogInHouse: true })), 900);
      }
    }
    if (action === "exitDoghouse") {
      const returnPosition = doghouseReturnPosition.current;
      setPersistentState((state) => ({ ...state, dogInHouse: false }));
      later(() => setObjects((current) => current.map((item) => item.id === objectId ? {
        ...item,
        x: returnPosition?.x ?? 62,
        y: returnPosition?.y ?? 63,
      } : item)), 260);
    }
    if (action === "dogEat") {
      const doghouse = objects.find((item) => item.id === "doghouse1");
      if (doghouse) {
        dogEatReturnPosition.current = { x: object.x, y: object.y };
        setActiveActions((current) => ({ ...current, [objectId]: "move" }));
        setObjects((current) => current.map((item) => item.id === objectId ? { ...item, x: doghouse.x + 2, y: doghouse.y + 3 } : item));
        later(() => setActiveActions((current) => ({ ...current, [objectId]: "dogEat" })), 900);
        later(() => {
          const returnPosition = dogEatReturnPosition.current;
          if (returnPosition) setObjects((current) => current.map((item) => item.id === objectId ? { ...item, ...returnPosition } : item));
        }, 5900);
      }
    }
    if (action === "dogEatApple") {
      const apple = objects.find((item) => item.id === "apple1");
      if (apple) {
        setActiveActions((current) => ({ ...current, [objectId]: "move" }));
        setObjects((current) => current.map((item) => item.id === objectId ? {
          ...item,
          x: Math.min(92, apple.x + 6),
          y: Math.max(8, apple.y - 2),
        } : item));
        later(() => setActiveActions((current) => ({ ...current, [objectId]: "dogEat" })), 900);
        later(() => {
          setPersistentState((state) => ({ ...state, appleHidden: true }));
          setMessage("咔嚓咔嚓，狗狗把苹果吃掉啦！");
        }, 1450);
        later(() => {
          setActiveActions((current) => ({ ...current, [objectId]: null }));
          setMessage("狗狗吃饱啦，就留在苹果旁边休息！");
        }, 3600);
        later(() => setPersistentState((state) => ({ ...state, appleHidden: false })), 4850);
      }
    }
    if (action === "dogPlay") {
      const toy = objects.find((item) => item.id === "dogToy1");
      if (toy) {
        playDogBark(2, .9);
        dogPlayReturnPosition.current = { x: object.x, y: object.y };
        setActiveActions((current) => ({ ...current, [objectId]: "move" }));
        setObjects((current) => current.map((item) => item.id === objectId ? { ...item, x: toy.x - 5, y: toy.y - 7 } : item));
        later(() => {
          setActiveActions((current) => ({ ...current, [objectId]: "dogPlay", [toy.id]: "toyBounce" }));
        }, 900);
        later(() => {
          const returnPosition = dogPlayReturnPosition.current;
          setActiveActions((current) => ({ ...current, [objectId]: "move", [toy.id]: null }));
          if (returnPosition) setObjects((current) => current.map((item) => item.id === objectId ? { ...item, ...returnPosition } : item));
        }, 4900);
      }
    }
    if (action === "dogFetch") {
      const ball = objects.find((item) => item.id === "fetchBall1");
      const person = objects.find((item) => item.id === "person1");
      if (ball && person) {
        playDogBark(1, .98);
        const target = { x: 82, y: Math.min(78, Math.max(66, ball.y)) };
        fetchReturnPositions.current = { dog: { x: object.x, y: object.y }, ball: { x: ball.x, y: ball.y } };
        setPersistentState((state) => ({ ...state, fetchBallHeld: false }));
        setActiveActions((current) => ({ ...current, [objectId]: null, [person.id]: "throwBall", [ball.id]: "ballThrow" }));
        setObjects((current) => current.map((item) => item.id === ball.id ? { ...item, x: person.x + 4, y: person.y + 1 } : item));
        later(() => setObjects((current) => current.map((item) => item.id === ball.id ? { ...item, ...target } : item)), 180);
        later(() => {
          setActiveActions((current) => ({ ...current, [person.id]: null, [objectId]: "dogChase", [ball.id]: "ballBounce" }));
          setObjects((current) => current.map((item) => item.id === objectId ? { ...item, x: target.x - 5, y: target.y - 7 } : item));
        }, 980);
        later(() => {
          setPersistentState((state) => ({ ...state, fetchBallHeld: true }));
          setActiveActions((current) => ({ ...current, [objectId]: "dogCarry", [ball.id]: null }));
          setObjects((current) => current.map((item) => item.id === objectId ? { ...item, x: person.x + 8, y: person.y + 1 } : item));
        }, 2300);
        later(() => {
          setPersistentState((state) => ({ ...state, fetchBallHeld: false }));
          setObjects((current) => current.map((item) => item.id === ball.id ? { ...item, ...(fetchReturnPositions.current.ball || { x: person.x + 4, y: person.y + 6 }) } : item));
          setActiveActions((current) => ({ ...current, [objectId]: "move" }));
        }, 4000);
        later(() => {
          const dogReturn = fetchReturnPositions.current.dog;
          if (dogReturn) setObjects((current) => current.map((item) => item.id === objectId ? { ...item, ...dogReturn } : item));
        }, 4180);
      }
    }
    if (action === "tidyToys") {
      const basket = objects.find((item) => item.id === "toyBasket1");
      const toys = objects.filter((item) => ["dogToy1", "fetchBall1"].includes(item.id));
      const firstToy = toys[0];
      if (basket && firstToy && !persistentState.toysStored) {
        toyBasketReturnPositions.current = {
          person: { x: object.x, y: object.y },
          toys: Object.fromEntries(toys.map((toy) => [toy.id, { x: toy.x, y: toy.y }])),
        };
        setActiveActions((current) => ({ ...current, [objectId]: "move" }));
        setObjects((current) => current.map((item) => item.id === objectId ? { ...item, x: firstToy.x - 5, y: firstToy.y - 7 } : item));
        later(() => {
          setPersistentState((state) => ({ ...state, toysBeingCarried: true }));
          setActiveActions((current) => ({ ...current, [objectId]: "carryToy" }));
          setObjects((current) => current.map((item) => item.id === objectId ? { ...item, x: basket.x - 5, y: basket.y - 7 } : item));
        }, 900);
        later(() => {
          setPersistentState((state) => ({ ...state, toysBeingCarried: false, toysStored: true }));
          setActiveActions((current) => ({ ...current, [objectId]: "cheer" }));
        }, 1950);
        later(() => {
          const returnPosition = toyBasketReturnPositions.current.person;
          if (returnPosition) setObjects((current) => current.map((item) => item.id === objectId ? { ...item, ...returnPosition } : item));
        }, 2250);
      }
    }
    if (action === "takeToys") {
      const basket = objects.find((item) => item.id === "toyBasket1");
      const dog = objects.find((item) => item.id === "dog1");
      if (basket && dog && persistentState.toysStored) {
        toyBasketReturnPositions.current.person = { x: object.x, y: object.y };
        setActiveActions((current) => ({ ...current, [objectId]: "move" }));
        setObjects((current) => current.map((item) => item.id === objectId ? { ...item, x: basket.x - 5, y: basket.y - 7 } : item));
        later(() => {
          setPersistentState((state) => ({ ...state, toysStored: false, toysBeingCarried: true }));
          setActiveActions((current) => ({ ...current, [objectId]: "carryToy" }));
          setObjects((current) => current.map((item) => item.id === objectId ? { ...item, x: dog.x - 9, y: dog.y - 2 } : item));
        }, 900);
        later(() => {
          setObjects((current) => current.map((item) => {
            if (item.id === "dogToy1") return { ...item, x: Math.max(8, dog.x - 7), y: Math.min(82, dog.y + 11) };
            if (item.id === "fetchBall1") return { ...item, x: Math.min(92, dog.x + 6), y: Math.min(82, dog.y + 11) };
            return item;
          }));
          setPersistentState((state) => ({ ...state, toysBeingCarried: false }));
          setActiveActions((current) => ({ ...current, [objectId]: "cheer" }));
        }, 1950);
        later(() => {
          const returnPosition = toyBasketReturnPositions.current.person;
          if (returnPosition) setObjects((current) => current.map((item) => item.id === objectId ? { ...item, ...returnPosition } : item));
        }, 2250);
      }
    }
    if (action === "move") {
      setPersistentState((state) => ({ ...state, dogMoved: !state.dogMoved }));
      setObjects((current) => current.map((item) => item.id === objectId ? { ...item, x: item.x > 58 ? 50 : 70 } : item));
    }
    if (action === "feed") {
      if (feedTarget) {
        feedReturnPositions.current[objectId] = { x: object.x, y: object.y };
        setPersistentState((state) => ({ ...state, appleHidden: false }));
        setObjects((current) => current.map((item) => item.id === objectId ? {
          ...item,
          x: Math.max(5, Math.min(95, feedTarget.x + 2)),
          y: Math.max(5, Math.min(90, feedTarget.y - 4)),
        } : item));
      }
      later(() => {
        setPersistentState((state) => ({ ...state, appleHidden: true }));
        setActiveActions((current) => ({ ...current, [feedTarget?.id || "person1"]: "eat" }));
        setMessage("好吃！");
      }, 980);
      later(() => {
        const returnPosition = feedReturnPositions.current[objectId];
        if (returnPosition) setObjects((current) => current.map((item) => item.id === objectId ? { ...item, ...returnPosition } : item));
      }, 2200);
      later(() => setPersistentState((state) => ({ ...state, appleHidden: false })), 3150);
    }


    later(() => setActiveActions((current) => ({ ...current, [objectId]: null, ...(action === "feed" ? { [feedTarget?.id || "person1"]: null } : {}) })), actionDurations[action] || 1000);
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


  const addMaterial = (material) => {
    if (material.category === "background") {
      setMaterialBackground(material);
      setShowMaterialLibrary(false);
      setMessage(`背景换成${material.name}啦！`);
      setBubbleVisible(true);
      later(() => setBubbleVisible(false), 2200);
      return;
    }
    const index = libraryObjects.length;
    const object = {
      id: `library-object-${Date.now()}`,
      isLibrary: true,
      label: material.name,
      material,
      x: 28 + (index % 5) * 11,
      y: 53 + (index % 3) * 8,
      layer: 12 + index,
    };
    setLibraryObjects((current) => [...current, object]);
    setShowMaterialLibrary(false);
    setMessage(`${material.name}放进来啦，可以拖动它！`);
    setBubbleVisible(true);
    later(() => setBubbleVisible(false), 2200);
  };


  const playWithMaterial = (object) => {
    if (object.material.category === "doghouse") {
      setEditingDoghouseId(object.id);
      setShowDoghouseDecorator(true);
      return;
    }
    setMessage(`${object.label}在和你打招呼！`);
    setBubbleVisible(true);
    later(() => setBubbleVisible(false), 1800);
  };


  const changeDoghouseDecor = (decor) => {
    if (editingDoghouseId) {
      setLibraryObjects((current) => current.map((object) => object.id === editingDoghouseId ? {
        ...object,
        label: decor.name,
        material: { ...decor, category: "doghouse", color: decor.wall, accent: decor.roof },
      } : object));
    } else {
      setDoghouseDecor(decor);
    }
  };


  const closeDoghouseDecorator = () => {
    setShowDoghouseDecorator(false);
    setEditingDoghouseId(null);
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
    if (libraryObjects.some((item) => item.id === id)) {
      setLibraryObjects((current) => current.filter((item) => item.id !== id));
      return;
    }
    const target = customObjects.find((item) => item.id === id);
    setCustomObjects((current) => current.filter((item) => item.id !== id));
    setCustomHouseStates((current) => { const next = { ...current }; delete next[id]; return next; });
    if (target?.replacesType) setReplacedTypes((current) => current.filter((type) => type !== target.replacesType));
  };


  const moveSceneObject = (id, axis, value) => {
    if (libraryObjects.some((item) => item.id === id)) {
      setLibraryObjects((current) => current.map((item) => item.id === id ? { ...item, [axis]: value } : item));
    } else if (customObjects.some((item) => item.id === id)) {
      setCustomObjects((current) => current.map((item) => item.id === id ? { ...item, [axis]: value } : item));
    } else {
      setObjects((current) => current.map((object) => object.id === id ? { ...object, [axis]: value } : object));
      if (id === "doghouse1" && persistentState.dogInHouse) {
        setObjects((current) => current.map((object) => object.id === "dog1" ? { ...object, [axis]: axis === "y" ? value + 1 : value } : object));
      }
    }
  };


  const changeObjectLayer = (id, direction) => {
    const updateLayer = (item) => {
      if (item.id !== id) return item;
      const isForegroundCharacter = ["person", "dog"].includes(item.type) || ["character", "animal"].includes(item.kind);
      return {
        ...item,
        layer: isForegroundCharacter
          ? FOREGROUND_CHARACTER_LAYER
          : Math.max(1, Math.min(MAX_SCENERY_LAYER, (item.layer || 3) + direction)),
      };
    };
    if (libraryObjects.some((item) => item.id === id)) setLibraryObjects((current) => current.map(updateLayer));
    else if (customObjects.some((item) => item.id === id)) setCustomObjects((current) => current.map(updateLayer));
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
          learningState,
          history: messages.slice(-8),
        });
      } catch (error) {
        console.warn("Chat API unavailable; using local reply fallback:", error.message);
        reply = createCharacterReply(text, {
        name: characterName,
        turn: messages.length,
        sceneObjects: objects,
        persistentState,
        learningState,
        });
      }
      if (reply.target === "person1" && activeCompanionId !== selectedAvatar?.id) reply.target = "person2";
      setTyping(false);
      appendMessage("assistant", reply.text);
      setSuggestions(reply.suggestions || []);
      if (reply.learning) setLearningState((state) => ({
        ...state,
        topic: reply.learning.topic || state.topic,
        stars: Math.max(0, Math.min(5, state.stars + (reply.learning.progressDelta || 0))),
        attempts: state.attempts + (reply.learning.mode === "quiz" ? 1 : 0),
        streak: reply.learning.result === "correct" ? state.streak + 1 : reply.learning.result === "try-again" ? 0 : state.streak,
        currentAnswer: Object.hasOwn(reply.learning, "expectedAnswer") ? (reply.learning.expectedAnswer || null) : state.currentAnswer,
        lastResult: reply.learning.result || "neutral",
      }));
      setMessage(reply.text);
      setBubbleVisible(true);
      if (reply.target && reply.action) playAction(reply.target, reply.action, reply.text);
      later(() => setBubbleVisible(false), 2800);
    } finally {
      setTyping(false);
    }
  };

  const handleLearningAction = (action, topic = learningState.topic) => {
    const nextTopic = learningPrompts[action]?.[topic] ? topic : "discovery";
    if (action === "start") setLearningState((state) => ({ ...state, topic: nextTopic, currentAnswer: null, lastResult: "neutral" }));
    handleConversation(learningPrompts[action]?.[nextTopic] || learningPrompts.quiz.discovery);
  };


  const handleDirectAction = (objectId, action) => {
    if (action === "wind") {
      if (windActive) return;
      setWindActive(true);
      setCloudDrift((current) => Math.min(220, current + 55));
      setMessage("呼——风吹过来了，树木、小草和轻轻的东西都动起来啦！");
      setBubbleVisible(true);
      later(() => setWindActive(false), 5200);
      later(() => setBubbleVisible(false), 3600);
      return;
    }
    if (action === "rpsGame") {
      setShowRpsGame(true);
      setMessage(`来和${characterName}玩石头剪刀布吧！`);
      setBubbleVisible(true);
      later(() => setBubbleVisible(false), 2200);
      return;
    }
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


  const handleRpsRound = ({ characterChoice, result }) => {
    const actionByChoice = { rock: "rpsRock", scissors: "rpsScissors", paper: "rpsPaper" };
    const resultMessage = result === "win" ? "小人输了，你赢啦！" : result === "lose" ? "小人赢了这一局！" : "我们出的一样，是平局！";
    setActiveActions((current) => ({ ...current, person1: actionByChoice[characterChoice] }));
    setMessage(resultMessage);
    setBubbleVisible(true);
    later(() => setActiveActions((current) => ({ ...current, person1: null })), 1200);
    later(() => setBubbleVisible(false), 2000);
  };


  const openSceneEditor = () => {
    const stage = stageRef.current;
    const stageBounds = stage?.getBoundingClientRect();
    if (stage && stageBounds) {
      const nextBounds = {};
      [...objects.filter((object) => !replacedTypes.includes(object.type)), ...customObjects, ...libraryObjects].forEach((object) => {
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

  useEffect(() => {
    const openWorldTool = (event) => {
      if (event.detail === "arrange") openSceneEditor();
      if (event.detail === "materials") setShowMaterialLibrary(true);
      if (event.detail === "house") setShowHouseDecorator(true);
      if (event.detail === "joints") setShowJoints((value) => !value);
    };
    window.addEventListener("living-drawing-open-world-tool", openWorldTool);
    return () => window.removeEventListener("living-drawing-open-world-tool", openWorldTool);
  }, [objects, customObjects, libraryObjects]);


  const moveObject = (objectId, clientX, clientY, objectSize) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const halfWidth = Math.min(42, ((objectSize?.width || 0) / 2 / rect.width) * 100 + 1.5);
    const halfHeight = Math.min(42, ((objectSize?.height || 0) / 2 / rect.height) * 100 + 1.5);
    const x = Math.max(halfWidth, Math.min(100 - halfWidth, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(halfHeight, Math.min(100 - halfHeight, ((clientY - rect.top) / rect.height) * 100));
    if (libraryObjects.some((object) => object.id === objectId)) {
      setLibraryObjects((current) => current.map((object) => object.id === objectId ? { ...object, x, y } : object));
    } else if (customObjects.some((object) => object.id === objectId)) {
      setCustomObjects((current) => current.map((object) => object.id === objectId ? { ...object, x, y } : object));
    } else {
      setObjects((current) => current.map((object) => object.id === objectId ? { ...object, x, y } : object));
    }
    if (objectId === "doghouse1" && persistentState.dogInHouse) {
      setObjects((current) => current.map((object) => object.id === "dog1" ? { ...object, x, y: y + 1 } : object));
    }
    if (objectId === "dog1") setPersistentState((state) => state.dogMoved ? { ...state, dogMoved: false } : state);
    if (objectId === "dog1" && persistentState.dogInHouse) setPersistentState((state) => ({ ...state, dogInHouse: false }));
    if (persistentState.restingCharacters?.includes(objectId)) {
      setPersistentState((state) => ({ ...state, restingCharacters: (state.restingCharacters || []).filter((id) => id !== objectId) }));
    }
  };


  const finishMovingObject = (objectId) => {
    const object = [...objects, ...customObjects, ...libraryObjects].find((item) => item.id === objectId);
    if (!object) return;
    setMessage(`${object.label}已经移动到新位置啦！`);
    setBubbleVisible(true);
    later(() => setBubbleVisible(false), 1800);
  };


  const visibleObjects = objects.filter((object) => !replacedTypes.includes(object.type));
  const saveWorld = () => onSave?.({
    persistentState,
    messages,
    storyStep,
    storyEnding,
    sceneObjects: objects,
    sceneTheme,
    worldArt,
    customObjects,
    replacedTypes,
    customHouseStates,
    libraryObjects,
    materialBackground,
    houseDecor,
    learningState,
    doghouseDecor,
    cloudDrift,
  });


  return (
    <main className="world-page">
      <header className="world-header">
        <button className="wordmark" type="button" onClick={onReset} aria-label="返回上传新画作">
          <span aria-hidden="true">✦</span><b>AI 画伴</b>
        </button>
        <button className="world-back-button" type="button" onClick={onReset}>← 返回作品库</button>
        <div className="found-status" aria-label={`世界里有 ${visibleObjects.length + customObjects.length + libraryObjects.length} 个朋友`}><span aria-hidden="true">●</span><b>{visibleObjects.length + customObjects.length + libraryObjects.length}</b><em>个朋友</em></div>
        <KidToolDock
          onAdd={() => setShowMaterialLibrary(true)}
          onDecorate={() => setShowHouseDecorator(true)}
          onDraw={() => setShowObjectDrawing(true)}
          onDrawBackground={() => setWorldDrawingMode("background")}
          onSave={saveWorld}
          onArrange={openSceneEditor}
          onExport={() => setShowExport(true)}
          onParent={() => setShowParentControls(true)}
          onReset={onReset}
        />
      </header>
      {showExport && <ExportPanel data={{ characterName, userName, messageCount: messages.length, ending: storyEnding, persistentState, messages, storyStep }} onClose={() => setShowExport(false)} />}
      {showMaterialLibrary && <MaterialLibrary onAdd={addMaterial} onClose={() => setShowMaterialLibrary(false)} />}
      {showHouseDecorator && <HouseDecorator value={houseDecor} onChange={setHouseDecor} onClose={() => setShowHouseDecorator(false)} />}
      {showDoghouseDecorator && <DoghouseDecorator value={editingDoghouseId ? libraryObjects.find((object) => object.id === editingDoghouseId)?.material : doghouseDecor} onChange={changeDoghouseDecor} onClose={closeDoghouseDecorator} />}
      {showSceneEditor && <SceneEditor objects={[...visibleObjects, ...customObjects, ...libraryObjects]} theme={sceneTheme} positionBounds={positionBounds} onThemeChange={setSceneTheme} onObjectChange={moveSceneObject} onLayerChange={changeObjectLayer} onDeleteObject={deleteCustomObject} onClose={() => setShowSceneEditor(false)} />}
      {worldDrawingMode && <WorldDrawingEditor initialArt={worldArt} initialMode={worldDrawingMode} backgroundOnly onApply={applyWorldArt} onClose={() => setWorldDrawingMode(null)} />}
      {showObjectDrawing && <ObjectDrawingEditor onAdd={addCustomObject} onClose={() => setShowObjectDrawing(false)} />}
      {showParentControls && <ParentControls settings={safety} onChange={onSafetyChange} onClear={onClearLocalData} onClose={() => setShowParentControls(false)} />}
      {showRpsGame && <RockPaperScissors characterName={characterName} onRound={handleRpsRound} onClose={() => setShowRpsGame(false)} />}
      {timeUp && <div className="break-reminder" role="dialog" aria-modal="true" aria-labelledby="break-title"><section><span aria-hidden="true">✦</span><h2 id="break-title">让眼睛休息一下吧</h2><p>已经创作了一段时间。看看远处、活动一下，准备好后再回来。</p><div><button type="button" onClick={onReset}>回到作品库</button><button type="button" onClick={() => setTimeUp(false)}>再创作一会儿</button></div></section></div>}


      <div className="world-experience">
      <section ref={stageRef} style={backgroundStyleFor(materialBackground)} className={`world-stage theme-${sceneTheme} ${materialBackground ? "has-library-background" : ""} ${worldArt.background ? "has-custom-background" : ""} ${persistentState.night ? "is-night" : ""} ${storyActive ? "story-is-active" : ""} ${windActive ? "is-windy" : ""}`} aria-label="可拖动的互动世界">
        <div className="demo-mode-badge"><span aria-hidden="true">●</span> {worldArt.background ? "原始世界 + 自绘背景" : selectedAvatar?.isUploaded ? "自绘角色已进入世界" : selectedAvatar ? "原角色动作帧" : "本地 Demo 识别"}</div>
        <div className="drag-tip" id="drag-help"><span aria-hidden="true">↔</span> 按住任意角色或物件直接拖动；位置会跟随作品保存</div>
        <button className={`joint-toggle ${showJoints ? "is-active" : ""}`} type="button" onClick={() => setShowJoints((value) => !value)} aria-pressed={showJoints}>
          <span aria-hidden="true">⌘</span> {showJoints ? "隐藏关节" : "显示关节"}
        </button>
        <StoryMode active={storyActive} step={storyStep} ending={storyEnding} onToggle={() => setStoryActive((value) => !value)} onAction={handleDirectAction} />
        <div className="sky-wash" aria-hidden="true" />
        <div className="stars" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="cloud cloud-one" style={{ "--cloud-drift": `${cloudDrift}%` }} aria-hidden="true" />
        <div className="cloud cloud-two" style={{ "--cloud-drift": `${cloudDrift * .65}%` }} aria-hidden="true" />
        <div className="ground" aria-hidden="true" />
        {worldArt.background && <div className="custom-world-background" style={{ backgroundImage: `url(${worldArt.background})` }} aria-hidden="true" />}
        <div className="background-grass" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => <span key={index}><i /><b /><em /></span>)}
        </div>
        {windActive && <div className="wind-outline" aria-hidden="true">
          <svg viewBox="0 0 520 210"><path d="M10 62C95 4 196 115 295 49c55-37 111-22 144 2 24 18 19 52-9 56-23 3-38-12-35-30"/><path d="M-20 112c105-44 204 41 326 2 65-21 137-9 204 30"/><path d="M20 163c85-28 161 24 242 5 47-11 92-10 135 7"/></svg>
          <span /><span /><span /><span />
        </div>}
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
              houseDecor={houseDecor}
              doghouseDecor={doghouseDecor}
              onDecorate={() => setShowHouseDecorator(true)}
              onDoghouseDecorate={() => { setEditingDoghouseId(null); setShowDoghouseDecorator(true); }}
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
          {libraryObjects.map((object) => (
            <MaterialSceneObject key={object.id} object={object} onMove={moveObject} onMoveEnd={finishMovingObject} onInteract={playWithMaterial} />
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
        learningState={learningState}
        onLearningAction={handleLearningAction}
      />
      </div>


      <ActionButtons onAction={handleDirectAction} persistentState={persistentState} activeActions={activeActions} windActive={windActive} />
    </main>
  );
}
