import { useState } from "react";
import { isStudyRewardUnlocked, remainingStudyMinutes, studyRewardForAction } from "../data/studyRewards";

const actions = [
  { target: "person1", action: "wave", icon: "wave", label: "挥挥手" },
  { target: "person1", action: "jump", icon: "jump", label: "跳一下" },
  { target: "person1", action: "dance", icon: "dance", label: "跳个舞" },
  { target: "person1", action: "cheer", icon: "cheer", label: "一起欢呼" },
  { target: "person1", action: "rpsGame", icon: "game", label: "和小人玩石头剪刀布" },
  { target: "person1", action: "cardCompare", icon: "cards", label: "和小人比大小" },
  { target: "person1", action: "rest", icon: "rest", label: "进入房间休息" },
  { target: "person1", action: "leaveRoom", icon: "outside", label: "出去活动" },
  { target: "house1", action: "openDoor", icon: "door", label: "打开门" },
  { target: "sun1", action: "sunset", icon: "sun", label: "看日落" },
  { target: "sun1", action: "sunrise", icon: "sunrise", label: "看日出" },
  { target: "tree1", action: "shake", icon: "tree", label: "摇摇树" },
  { target: "world", action: "wind", icon: "wind", label: "吹风了" },
  { target: "dog1", action: "move", icon: "dog", label: "小狗过来" },
  { target: "dog1", action: "dogEat", icon: "bowl", label: "狗狗吃东西" },
  { target: "dog1", action: "dogEatApple", icon: "apple", label: "狗狗吃苹果" },
  { target: "dog1", action: "dogPlay", icon: "toy", label: "狗狗玩玩具" },
  { target: "dog1", action: "dogFetch", icon: "fetch", label: "狗狗捡球" },
  { target: "person1", action: "tidyToys", icon: "basket", label: "收拾玩具" },
  { target: "person1", action: "takeToys", icon: "takeToy", label: "拿玩具" },
  { target: "dog1", action: "enterDoghouse", icon: "doghouse", label: "狗狗进入小窝" },
  { target: "dog1", action: "exitDoghouse", icon: "outside", label: "狗狗出来活动" },
  { target: "apple1", action: "feed", icon: "apple", label: "喂苹果" },
];


function ActionIcon({ name }) {
  const drawings = {
    wave: <path d="M8 12V6.7c0-1.7 2.2-1.7 2.2 0v3.1-5c0-1.7 2.2-1.7 2.2 0v5-4c0-1.7 2.2-1.7 2.2 0v4.4-2.7c0-1.6 2.2-1.6 2.2 0v5.6c0 4.3-2.6 6.9-6.3 6.9-3 0-4.7-1.8-6.2-4.2l-1.1-1.7c-.9-1.5 1-2.7 2.1-1.4L8 15.5" />,
    jump: <><path d="M12 20V5M7.5 9.5 12 5l4.5 4.5" /><path d="M5 20h14" /></>,
    dance: <><circle cx="12" cy="5" r="2"/><path d="M12 7v6M12 9 7 12M12 9l5-2M12 13l-4 7M12 13l5 6"/></>,
    cheer: <><path d="M7 21v-8l-4-5M17 21v-8l4-5M7 13l5 3 5-3"/><circle cx="12" cy="7" r="3"/></>,
    game: <><path d="M6 12V7a2 2 0 0 1 4 0v3-5a2 2 0 0 1 4 0v5-3a2 2 0 0 1 4 0v7c0 4-2.5 7-6.5 7C7 21 4 17.5 4 14v-2h2Z"/><path d="M7 3v2M18 2l-1 2M21 7h-2"/></>,
    cards: <><rect x="5" y="3" width="12" height="17" rx="2"/><path d="m9 9 2-2 2 2-2 2-2-2ZM9 15h4M18 7l2 1v11a2 2 0 0 1-2 2h-8"/></>,
    rest: <><path d="M4 17h16M6 17V9h10a4 4 0 0 1 4 4v4M6 13h5"/><path d="M7 20v1M18 20v1"/></>,
    outside: <><path d="M4 21V3h10v18M8 12h12M16 8l4 4-4 4"/><circle cx="11" cy="12" r=".7"/></>,
    door: <><path d="M6 21V3h12v18M9 21V6h7v15" /><circle cx="13.5" cy="13" r=".8" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" /></>,
    sunrise: <><path d="M3 18h18M5 14h14M7.5 14a4.5 4.5 0 0 1 9 0M12 3v4M5.6 6.6 8 9M18.4 6.6 16 9" /><path d="m9.5 5 2.5-2 2.5 2" /></>,
    tree: <><path d="M12 21v-6" /><path d="M12 4c-4 0-6.5 2.6-5.4 5.3-2.2 1.5-.9 5.3 2.1 5.2 1.1 2 5.5 2 6.6 0 3 .1 4.3-3.7 2.1-5.2C18.5 6.6 16 4 12 4Z" /></>,
    wind: <><path d="M3 8h11c2.8 0 2.8-4 0-4-1.2 0-2 .6-2.4 1.4M3 12h16c3 0 3 4.5 0 4.5-1.3 0-2.2-.7-2.6-1.6M3 16h8"/></>,
    dog: <><path d="M5 10 3 6c3-.6 4.2.7 4.8 2.3 2.7-1 6-.5 7.8 1.6L20 9v7h-3l-1 4h-2v-4H8l-1 4H5v-5.5c-1.5-.9-1.8-3.2 0-4.5Z" /><circle cx="16.3" cy="11.5" r=".7" /></>,
    doghouse: <><path d="m3 11 9-7 9 7M5 10v10h14V10"/><path d="M9 20v-5a3 3 0 0 1 6 0v5"/><circle cx="12" cy="9" r="1"/></>,
    bowl: <><path d="M4 11h16l-2 7H6l-2-7Z"/><path d="M7 11c.7-2 2.1-3 4-2M12 9c1.7-1.4 3.5-.8 4.4 2"/><circle cx="9" cy="12.5" r=".7"/><circle cx="14" cy="12.5" r=".7"/></>,
    toy: <><circle cx="12" cy="13" r="7"/><path d="M7 8c2 2.5 7.5 2.5 10 0M6 15c3-1.5 9-1.5 12 0M12 6v14"/></>,
    fetch: <><circle cx="9" cy="14" r="4"/><path d="M4 7h11M11 3l4 4-4 4M15 15c2.5.4 4.2 1.8 5 4"/></>,
    basket: <><path d="M4 10h16l-2 10H6L4 10Z"/><path d="M7 10c.4-4 2-6 5-6s4.6 2 5 6M8 13v4M12 13v4M16 13v4"/></>,
    takeToy: <><path d="M4 11h16l-2 9H6l-2-9Z"/><circle cx="12" cy="7" r="3"/><path d="m9 5 3-2 3 2M12 10v5M9.5 12.5 12 15l2.5-2.5"/></>,
    apple: <><path d="M12 8c-1.8-2.4-6-1.6-7 1.5-1.3 4 2.2 10.5 7 10.5s8.3-6.5 7-10.5C18 6.4 13.8 5.6 12 8Z" /><path d="M12 7c.2-2.5 1.5-4 3.5-5M13.2 4.6c2.1-1.1 4.1-.7 5.3.5" /></>,
  };
  return <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">{drawings[name]}</svg>;
}


export default function ActionButtons({ onAction, persistentState, visibleObjectIds, activeActions = {}, windActive = false, currentFood = { name: "苹果" }, currentSceneId = "outdoor", activeCharacterId = "person1", transitioning = false, studyTotalSeconds = 0 }) {
  const [open, setOpen] = useState(false);
  const restingCharacters = persistentState.restingCharacters || [];
  const visibleActions = actions.filter((item) => {
    const target = item.target === "person1" ? activeCharacterId : item.target;
    if (currentSceneId === "room" && target === "world") return false;
    if (visibleObjectIds && !visibleObjectIds.has(target)) return false;
    if (visibleObjectIds && item.action === "enterDoghouse" && !visibleObjectIds.has("doghouse1")) return false;
    if (visibleObjectIds && item.action === "exitDoghouse" && !visibleObjectIds.has("doghouse1")) return false;
    if (visibleObjectIds && item.action === "dogEat" && !visibleObjectIds.has("doghouse1")) return false;
    if (visibleObjectIds && item.action === "dogEatApple" && !visibleObjectIds.has("apple1")) return false;
    if (visibleObjectIds && item.action === "dogPlay" && !visibleObjectIds.has("dogToy1")) return false;
    if (visibleObjectIds && item.action === "dogFetch" && !visibleObjectIds.has("fetchBall1")) return false;
    if (visibleObjectIds && ["tidyToys", "takeToys"].includes(item.action) && !visibleObjectIds.has("toyBasket1")) return false;
    if (item.action === "leaveRoom") return currentSceneId === "room";
    if (item.action === "rest") return currentSceneId === "outdoor";
    if (item.action === "rpsGame") return !restingCharacters.includes(target);
    if (item.action === "cardCompare") return !restingCharacters.includes(target);
    if (item.action === "enterDoghouse") return !persistentState.dogInHouse;
    if (item.action === "exitDoghouse") return Boolean(persistentState.dogInHouse);
    if (item.action === "move" && item.target === "dog1") return !persistentState.dogInHouse;
    if (item.action === "dogEat") return !persistentState.dogInHouse;
    if (item.action === "dogEatApple") return !persistentState.dogInHouse && !persistentState.appleHidden && !activeActions.apple1;
    if (item.action === "dogPlay") return !persistentState.dogInHouse && !persistentState.toysStored && !persistentState.toysBeingCarried;
    if (item.action === "dogFetch") return !persistentState.dogInHouse && !persistentState.toysStored && !persistentState.toysBeingCarried;
    if (item.action === "tidyToys") return !persistentState.toysStored && !persistentState.toysBeingCarried && !restingCharacters.includes(target) && !["dogPlay", "dogFetch"].includes(activeActions.dog1);
    if (item.action === "takeToys") return Boolean(persistentState.toysStored) && !persistentState.toysBeingCarried && !restingCharacters.includes(target);
    return true;
  });
  return (
    <section className={`quick-actions${open ? " is-open" : ""}`} aria-labelledby="quick-actions-title">
      <button className="quick-actions-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="quick-actions-list">
        <ActionIcon name="wave" /><span id="quick-actions-title">{open ? "收起互动" : "打开互动"}</span><b aria-hidden="true">{open ? "×" : "+"}</b>
      </button>
      <div className="quick-actions-panel" id="quick-actions-list" hidden={!open}>
        <div className="quick-heading"><h2>想让谁动起来？</h2><p>也可以直接单击或双击画面里的朋友</p></div>
        <div className="action-scroll">
        {visibleActions.map((item) => {
          const target = item.target === "person1" ? activeCharacterId : item.target;
          const actualAction = item.target === "house1" && persistentState.doorOpen ? "closeDoor" : item.action;
          const label = actualAction === "closeDoor" ? "关上门" : item.action === "wind" && windActive ? "风正在吹" : item.action === "feed" ? `喂${currentFood.name}` : item.action === "dogEatApple" ? `狗狗吃${currentFood.name}` : item.label;
          const reward = studyRewardForAction(item.action);
          const locked = reward && !isStudyRewardUnlocked(item.action, studyTotalSeconds);
          const lockHint = locked ? `再专注 ${remainingStudyMinutes(reward, studyTotalSeconds)} 分钟解锁` : "";
          return (
            <button key={`${target}-${item.action}`} type="button" className={locked ? "is-study-locked" : ""} disabled={transitioning || locked || (item.action === "wind" && windActive)} title={lockHint || label} aria-label={locked ? `${label}，${lockHint}` : label} onClick={() => onAction(target, actualAction)}>
              <ActionIcon name={item.icon} /><span>{label}</span>{locked && <small><b aria-hidden="true">锁</b>{reward.minutes} 分钟</small>}
            </button>
          );
        })}
        </div>
      </div>
    </section>
  );
}
