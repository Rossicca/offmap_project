import MotionAvatar, { MotionDog } from "./MotionAvatar";
import useSceneDrag from "../hooks/useSceneDrag";


const emojiByType = { person: "🧒", sun: "☀️", tree: "🌳", dog: "🐕", food: "🍎" };


function WorldProp({ type }) {
  if (type === "sun") return <span className="world-sun-art" aria-hidden="true"><i /></span>;
  if (type === "tree") return <span className="world-tree-art" aria-hidden="true"><i /><b /></span>;
  if (type === "food") return <span className="world-apple-art" aria-hidden="true"><i /></span>;
  return <span aria-hidden="true">{emojiByType[type]}</span>;
}


export default function SceneObject({ object, action, persistentState, onInteract, onMove, onMoveEnd, avatar, showJoints, houseArt, houseDecor, onDecorate }) {
  const { dragging, activate, dragHandlers } = useSceneDrag({ object, onMove, onMoveEnd });


  if (object.type === "house") {
    const doorOpen = persistentState.doorOpen;
    return (
      <button
        className={`scene-object house-object action-${action || "idle"} ${dragging ? "is-dragging" : ""}`}
        style={{
          "--x": `${object.x}%`,
          "--y": `${object.y}%`,
          ...(houseDecor ? { "--house-wall": houseDecor.wall, "--house-roof": houseDecor.roof, "--house-door": houseDecor.door, "--house-trim": houseDecor.trim, "--house-accent": houseDecor.accent } : {}),
          ...(object.layer ? { zIndex: object.layer } : {}),
        }}
        type="button"
        aria-label={`${object.label}，可拖动；点击装饰房子。${doorOpen ? "门已打开" : "门已关闭"}`}
        aria-describedby="drag-help"
        data-object-id={object.id}
        onClick={() => activate(() => onDecorate?.())}
        {...dragHandlers}
      >
        {houseArt
          ? <span className="custom-house-art" style={{ backgroundImage: `url(${houseArt})` }} aria-hidden="true" />
          : <>
            <span className="house-roof" aria-hidden="true" />
            <span className={`house-body pattern-${houseDecor?.pattern || "plain"}`} aria-hidden="true">
              <i className="window left" /><i className="window right" />
              <i className={`door ${doorOpen ? "is-open" : ""}`}><b /></i>
            </span>
          </>}
      </button>
    );
  }


  const hidden = object.type === "food" && persistentState.appleHidden;
  const isRiggedPerson = object.type === "person" && avatar;
  const isRiggedDog = object.type === "dog";
  return (
    <button
      className={`scene-object ${object.type}-object action-${action || "idle"} ${hidden ? "is-hidden" : ""} ${dragging ? "is-dragging" : ""}`}
      style={{ "--x": `${object.x}%`, "--y": `${object.y}%`, ...(object.layer ? { zIndex: object.layer } : {}) }}
      type="button"
      aria-label={`${object.label}，可拖动，当前位置横向${Math.round(object.x)}%，纵向${Math.round(object.y)}%；点击${object.actions[0] === "feed" ? "去找小朋友" : "触发动作"}`}
      aria-describedby="drag-help"
      data-object-id={object.id}
      onClick={() => activate(() => onInteract(object.id, object.actions[0]))}
      {...dragHandlers}
      disabled={hidden}
    >
      {isRiggedPerson
        ? <MotionAvatar avatar={avatar} action={action} showJoints={showJoints} />
        : isRiggedDog
          ? <MotionDog action={action} showJoints={showJoints} />
          : <WorldProp type={object.type} />}
    </button>
  );
}
