import useSceneDrag from "../hooks/useSceneDrag";


export default function CustomSceneObject({ object, action, doorOpen, onInteract, onMove, onMoveEnd }) {
  const { dragging, activate, dragHandlers } = useSceneDrag({ object, onMove, onMoveEnd });


  return (
    <button
      className={`scene-object custom-drawn-object custom-kind-${object.kind} action-${action || "idle"} ${action ? "is-animating" : ""} ${dragging ? "is-dragging" : ""}`}
      style={{ "--x": `${object.x}%`, "--y": `${object.y}%`, zIndex: object.layer || 10 }}
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
