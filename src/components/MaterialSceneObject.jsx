import useSceneDrag from "../hooks/useSceneDrag";
import MaterialArtwork from "./MaterialArtwork";

export default function MaterialSceneObject({ object, editable = false, onMoveStart, onMove, onMoveEnd, onInteract, onSelect, selected }) {
  const { dragging, activate, dragHandlers } = useSceneDrag({ object, onMoveStart, onMove, onMoveEnd, enabled: editable });
  return (
    <button
      className={`scene-object library-scene-object library-${object.material.category} library-${object.material.id} ${editable ? "is-editable" : ""} ${selected ? "is-selected" : ""} ${dragging ? "is-dragging" : ""}`}
      style={{ "--x": `${object.x}%`, "--y": `${object.y}%`, "--object-scale": object.scale || 1, zIndex: object.layer || 12 }}
      type="button"
      data-object-id={object.id}
      aria-describedby={editable ? "drag-help" : undefined}
      aria-label={editable ? `${object.label}，点击选中后可移动或调整大小` : `${object.label}，点击和它互动`}
      onClick={() => activate(() => editable ? onSelect?.(object.id) : onInteract?.(object))}
      {...dragHandlers}
    >
      <MaterialArtwork item={object.material} />
      <b>{object.label}</b>
    </button>
  );
}
