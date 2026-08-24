import useSceneDrag from "../hooks/useSceneDrag";

const FOREGROUND_CHARACTER_LAYER = 50;

export default function CustomSceneObject({ object, action, doorOpen, editable = false, onInteract, onSelect, selected, onMoveStart, onMove, onMoveEnd }) {
  const { dragging, activate, dragHandlers } = useSceneDrag({ object, onMoveStart, onMove, onMoveEnd, enabled: editable });
  const isForegroundCharacter = object.kind === "character" || object.kind === "animal";
  const objectLayer = isForegroundCharacter ? FOREGROUND_CHARACTER_LAYER : Math.min(40, object.layer || 10);


  return (
    <button
      className={`scene-object custom-drawn-object custom-kind-${object.kind} action-${action || "idle"} ${editable ? "is-editable" : ""} ${selected ? "is-selected" : ""} ${action ? "is-animating" : ""} ${dragging ? "is-dragging" : ""}`}
      style={{ "--x": `${object.x}%`, "--y": `${object.y}%`, "--object-scale": object.scale || 1, zIndex: objectLayer }}
      type="button"
      data-object-id={object.id}
      aria-describedby={editable ? "drag-help" : undefined}
      aria-label={editable ? `${object.label}，点击选中后可移动或调整大小` : `${object.label}，点击${object.kind === "house" ? (doorOpen ? "关门" : "开门") : "让它动起来"}`}
      onClick={() => activate(() => editable ? onSelect?.(object.id) : onInteract(object))}
      {...dragHandlers}
    >
      <span className="custom-drawn-art" style={{ backgroundImage: `url(${object.imageUrl})` }} aria-hidden="true" />
      {object.kind === "house" && <span className={`custom-house-door ${doorOpen ? "is-open" : ""}`} aria-hidden="true"><i /></span>}
      <b>{object.label}</b>
    </button>
  );
}
