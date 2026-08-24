import useSceneDrag from "../hooks/useSceneDrag";
import MaterialArtwork from "./MaterialArtwork";

export default function MaterialSceneObject({ object, onMove, onMoveEnd, onInteract }) {
  const { dragging, activate, dragHandlers } = useSceneDrag({ object, onMove, onMoveEnd });
  return (
    <button
      className={`scene-object library-scene-object library-${object.material.category} library-${object.material.id} ${dragging ? "is-dragging" : ""}`}
      style={{ "--x": `${object.x}%`, "--y": `${object.y}%`, "--object-scale": object.scale || 1, zIndex: object.layer || 12 }}
      type="button"
      data-object-id={object.id}
      aria-describedby="drag-help"
      aria-label={`${object.label}，可拖动；点击${object.material.category === "doghouse" ? "更换样式" : "和它玩"}`}
      onClick={() => activate(() => onInteract?.(object))}
      {...dragHandlers}
    >
      <MaterialArtwork item={object.material} />
      <b>{object.label}</b>
    </button>
  );
}
