const actions = [
  { target: "person1", action: "wave", icon: "wave", label: "挥挥手" },
  { target: "person1", action: "jump", icon: "jump", label: "跳一下" },
  { target: "person1", action: "dance", icon: "dance", label: "跳个舞" },
  { target: "person1", action: "cheer", icon: "cheer", label: "一起欢呼" },
  { target: "person1", action: "rest", icon: "rest", label: "休息一下" },
  { target: "house1", action: "openDoor", icon: "door", label: "打开门" },
  { target: "sun1", action: "sunset", icon: "sun", label: "看日落" },
  { target: "tree1", action: "shake", icon: "tree", label: "摇摇树" },
  { target: "dog1", action: "move", icon: "dog", label: "小狗过来" },
  { target: "apple1", action: "feed", icon: "apple", label: "喂苹果" },
];

function ActionIcon({ name }) {
  const drawings = {
    wave: <path d="M8 12V6.7c0-1.7 2.2-1.7 2.2 0v3.1-5c0-1.7 2.2-1.7 2.2 0v5-4c0-1.7 2.2-1.7 2.2 0v4.4-2.7c0-1.6 2.2-1.6 2.2 0v5.6c0 4.3-2.6 6.9-6.3 6.9-3 0-4.7-1.8-6.2-4.2l-1.1-1.7c-.9-1.5 1-2.7 2.1-1.4L8 15.5" />,
    jump: <><path d="M12 20V5M7.5 9.5 12 5l4.5 4.5" /><path d="M5 20h14" /></>,
    dance: <><circle cx="12" cy="5" r="2"/><path d="M12 7v6M12 9 7 12M12 9l5-2M12 13l-4 7M12 13l5 6"/></>,
    cheer: <><path d="M7 21v-8l-4-5M17 21v-8l4-5M7 13l5 3 5-3"/><circle cx="12" cy="7" r="3"/></>,
    rest: <><path d="M4 17h16M6 17V9h10a4 4 0 0 1 4 4v4M6 13h5"/><path d="M7 20v1M18 20v1"/></>,
    door: <><path d="M6 21V3h12v18M9 21V6h7v15" /><circle cx="13.5" cy="13" r=".8" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" /></>,
    tree: <><path d="M12 21v-6" /><path d="M12 4c-4 0-6.5 2.6-5.4 5.3-2.2 1.5-.9 5.3 2.1 5.2 1.1 2 5.5 2 6.6 0 3 .1 4.3-3.7 2.1-5.2C18.5 6.6 16 4 12 4Z" /></>,
    dog: <><path d="M5 10 3 6c3-.6 4.2.7 4.8 2.3 2.7-1 6-.5 7.8 1.6L20 9v7h-3l-1 4h-2v-4H8l-1 4H5v-5.5c-1.5-.9-1.8-3.2 0-4.5Z" /><circle cx="16.3" cy="11.5" r=".7" /></>,
    apple: <><path d="M12 8c-1.8-2.4-6-1.6-7 1.5-1.3 4 2.2 10.5 7 10.5s8.3-6.5 7-10.5C18 6.4 13.8 5.6 12 8Z" /><path d="M12 7c.2-2.5 1.5-4 3.5-5M13.2 4.6c2.1-1.1 4.1-.7 5.3.5" /></>,
  };
  return <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">{drawings[name]}</svg>;
}

export default function ActionButtons({ onAction, persistentState }) {
  return (
    <section className="quick-actions" aria-labelledby="quick-actions-title">
      <div className="quick-heading">
        <h2 id="quick-actions-title">快速互动</h2>
        <p className="desktop-hint">点一下，马上有惊喜</p>
        <p className="scroll-hint">左右滑动查看更多 →</p>
      </div>
      <div className="action-scroll">
        {actions.map((item) => {
          const actualAction = item.target === "house1" && persistentState.doorOpen ? "closeDoor" : item.action;
          const label = actualAction === "closeDoor" ? "关上门" : item.label;
          return (
            <button key={`${item.target}-${item.action}`} type="button" onClick={() => onAction(item.target, actualAction)}>
              <ActionIcon name={item.icon} />{label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
