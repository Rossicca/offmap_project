import useSceneDrag from "../hooks/useSceneDrag";

const FOREGROUND_CHARACTER_LAYER = 50;

export default function CustomSceneObject({ object, action, doorOpen, onInteract, onMove, onMoveEnd }) {
  const { dragging, activate, dragHandlers } = useSceneDrag({ object, onMove, onMoveEnd });
  const isForegroundCharacter = object.kind === "character" || object.kind === "animal";
  const objectLayer = isForegroundCharacter ? FOREGROUND_CHARACTER_LAYER : Math.min(40, object.layer || 10);


  return (
    <button
      className={`scene-object custom-drawn-object custom-kind-${object.kind} action-${action || "idle"} ${action ? "is-animating" : ""} ${dragging ? "is-dragging" : ""}`}
      style={{ "--x": `${object.x}%`, "--y": `${object.y}%`, "--object-scale": object.scale || 1, zIndex: objectLayer }}
      type="button"
      data-object-id={object.id}
      aria-describedby="drag-help"
      aria-label={`${object.label}，可拖动，当前位置横向${Math.round(object.x)}%，纵向${Math.round(object.y)}%；点击${object.kind === "house" ? (doorOpen ? "关门" : "开门") : "让它动起来"}`}
      onClick={() => activate(() => onInteract(object))}
      {...dragHandlers}
    >
      <span className="custom-drawn-art" style={{ backgroundImage: `url(${object.imageUrl})` }} aria-hidden="true" />
      {object.kind === "house" && <span className={`custom-house-door ${doorOpen ? "is-open" : ""}`} aria-hidden="true"><i /></span>}
      <b>{object.label}</b>
    </button>
  );
}
