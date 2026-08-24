import { useRef, useState } from "react";


const dragThreshold = 5;


export default function useSceneDrag({ object, onMove, onMoveEnd }) {
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
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - centerX,
      offsetY: event.clientY - centerY,
      moved: false,
    };
    suppressClickRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };


  const moveDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) <= dragThreshold) return;
    drag.moved = true;
    setDragging(true);
    const visibleBounds = event.currentTarget.getBoundingClientRect();
    onMove?.(
      object.id,
      event.clientX - drag.offsetX,
      event.clientY - drag.offsetY,
      { width: visibleBounds.width, height: visibleBounds.height },
    );
  };


  const finishDrag = (event, cancelled = false) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    suppressClickRef.current = drag.moved && !cancelled;
    dragRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (drag.moved && !cancelled) onMoveEnd?.(object.id);
  };


  const activate = (callback) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    callback();
  };


  return {
    dragging,
    activate,
    dragHandlers: {
      onDragStart: (event) => event.preventDefault(),
      onPointerDown: startDrag,
      onPointerMove: moveDrag,
      onPointerUp: (event) => finishDrag(event),
      onPointerCancel: (event) => finishDrag(event, true),
    },
  };
}
