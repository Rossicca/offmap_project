const steps = [
  { title: "打开秘密小屋", detail: "先打开房门，寻找发光的地图。", target: "house1", action: "openDoor", cta: "打开房门" },
  { title: "叫上豆包", detail: "让小狗跑过来，和我们一起出发。", target: "dog1", action: "move", cta: "叫来豆包" },
  { title: "选择故事结局", detail: "让世界进入星光夜晚，或者迎接新的清晨。", choices: true },
];

export default function StoryMode({ active, step, ending, onToggle, onAction }) {
  const current = steps[Math.min(step, steps.length - 1)];
  return (
    <>
      <button className={`story-toggle ${active ? "is-active" : ""}`} type="button" onClick={onToggle} aria-expanded={active}><span aria-hidden="true">◆</span>{active ? "收起任务" : "故事任务"}</button>
      {active && <section className="story-card" aria-label="故事任务">
        <header><div><b>星星地图</b><span>{ending ? "任务完成" : `${Math.min(step + 1, 3)} / 3`}</span></div><i style={{ "--progress": ending ? 1 : step / 3 }} /></header>
        {ending ? <div className="story-ending"><strong>{ending === "night" ? "星光结局" : "晨光结局"}</strong><p>{ending === "night" ? "你和伙伴在星空下找到了会发光的友情种子！" : "太阳升起时，地图变成了一只金色纸飞机！"}</p><button type="button" onClick={onToggle}>回到自由世界</button></div> : <div className="story-step"><small>当前任务</small><h2>{current.title}</h2><p>{current.detail}</p>{current.choices ? <div className="story-choices"><button type="button" onClick={() => onAction("sun1", "sunset")}>进入星光夜晚</button><button type="button" onClick={() => onAction("sun1", "sunrise")}>迎接新的清晨</button></div> : <button className="story-action" type="button" onClick={() => onAction(current.target, current.action)}>{current.cta}<span>→</span></button>}</div>}
      </section>}
    </>
  );
}
