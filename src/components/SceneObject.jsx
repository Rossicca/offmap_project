import { useRef, useState } from "react";
import MotionAvatar, { MotionDog } from "./MotionAvatar";

const emojiByType = { person: "🧒", sun: "☀️", tree: "🌳", dog: "🐕", food: "🍎" };

function WorldProp({ type }) {
  if (type === "sun") return <span className="world-sun-art" aria-hidden="true"><i /></span>;
  if (type === "tree") return <span className="world-tree-art" aria-hidden="true"><i /><b /></span>;
  if (type === "food") return <span className="world-apple-art" aria-hidden="true"><i /></span>;
  return <span aria-hidden="true">{emojiByType[type]}</span>;
}

export default function SceneObject({ object, action, persistentState, onInteract, onMove, avatar, showJoints }) {
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const startDrag = (event) => {
    if (event.button !== 0) return;
    const stageBounds = event.currentTarget.closest(".world-stage")?.getBoundingClientRect();
    const centerX = stageBounds ? stageBounds.left + stageBounds.width * object.x / 100 : event.clientX;
    const centerY = stageBounds ? stageBounds.top + stageBounds.height * object.y / 100 : event.clientY;
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      offsetX: event.clientX - centerX,
      offsetY: event.clientY - centerY,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 5) {
      drag.moved = true;
      setDragging(true);
      onMove?.(object.id, event.clientX - drag.offsetX, event.clientY - drag.offsetY, { width: event.currentTarget.offsetWidth, height: event.currentTarget.offsetHeight });
    }
  };
  const endDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    suppressClickRef.current = drag.moved;
    dragRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const cancelDrag = (event) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    suppressClickRef.current = false;
    setDragging(false);
  };
  const activate = (callback) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    callback();
  };
  const dragHandlers = { onPointerDown: startDrag, onPointerMove: moveDrag, onPointerUp: endDrag, onPointerCancel: cancelDrag };

  if (object.type === "house") {
    const doorOpen = persistentState.doorOpen;
    return (
      <button
        className={`scene-object house-object action-${action || "idle"} ${dragging ? "is-dragging" : ""}`}
        style={{ "--x": `${object.x}%`, "--y": `${object.y}%` }}
        type="button"
        aria-label={`${object.label}，可拖动，${doorOpen ? "门已打开" : "门已关闭"}，当前位置横向${Math.round(object.x)}%，纵向${Math.round(object.y)}%`}
        aria-describedby="drag-help"
        data-object-id={object.id}
        onClick={() => activate(() => onInteract(object.id, doorOpen ? "closeDoor" : "openDoor"))}
        {...dragHandlers}
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
      className={`scene-object ${object.type}-object action-${action || "idle"} ${hidden ? "is-hidden" : ""} ${dragging ? "is-dragging" : ""}`}
      style={{ "--x": `${object.x}%`, "--y": `${object.y}%` }}
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
