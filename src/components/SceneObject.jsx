import MotionAvatar, { MotionDog } from "./MotionAvatar";

const emojiByType = { person: "🧒", sun: "☀️", tree: "🌳", dog: "🐕", food: "🍎" };

function WorldProp({ type }) {
  if (type === "sun") return <span className="world-sun-art" aria-hidden="true"><i /></span>;
  if (type === "tree") return <span className="world-tree-art" aria-hidden="true"><i /><b /></span>;
  if (type === "food") return <span className="world-apple-art" aria-hidden="true"><i /></span>;
  return <span aria-hidden="true">{emojiByType[type]}</span>;
}

export default function SceneObject({ object, action, persistentState, onInteract, avatar, showJoints }) {
  if (object.type === "house") {
    const doorOpen = persistentState.doorOpen;
    return (
      <button
        className={`scene-object house-object action-${action || "idle"}`}
        style={{ "--x": `${object.x}%`, "--y": `${object.y}%` }}
        type="button"
        aria-label={`${object.label}，${doorOpen ? "门已打开" : "门已关闭"}`}
        onClick={() => onInteract(object.id, doorOpen ? "closeDoor" : "openDoor")}
      >
        <span className="house-roof" aria-hidden="true" />
        <span className="house-body" aria-hidden="true">
          <i className="window left" /><i className="window right" />
          <i className={`door ${doorOpen ? "is-open" : ""}`}><b /></i>
        </span>
      </button>
    );
  }

  const hidden = object.type === "food" && persistentState.appleHidden;
  const isRiggedPerson = object.type === "person" && avatar;
  const isRiggedDog = object.type === "dog";
  return (
    <button
      className={`scene-object ${object.type}-object action-${action || "idle"} ${hidden ? "is-hidden" : ""}`}
      style={{ "--x": `${object.x}%`, "--y": `${object.y}%` }}
      type="button"
      aria-label={`让${object.label}${object.actions[0] === "feed" ? "去找小朋友" : "动一动"}`}
      onClick={() => onInteract(object.id, object.actions[0])}
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
