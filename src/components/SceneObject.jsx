import MotionAvatar, { MotionDog } from "./MotionAvatar";
import useSceneDrag from "../hooks/useSceneDrag";


const emojiByType = { person: "🧒", sun: "☀️", tree: "🌳", dog: "🐕", food: "🍎" };
const FOREGROUND_CHARACTER_LAYER = 50;


function WorldProp({ type, dogInHouse = false, treeVariant, fruitVariant, houseVariant, personVariant, currentFood }) {
  if (type === "sun") return <span className="world-sun-art" aria-hidden="true"><i /></span>;
  if (type === "tree") return <span className={`world-tree-art tree-${treeVariant || "plain"}`} aria-hidden="true"><i /><b />{treeVariant && <em className="tree-fruits">{Array.from({ length: treeVariant === "blossom" ? 9 : 7 }, (_, index) => <span key={index} />)}</em>}</span>;
  if (type === "food") return currentFood?.id === "apple" ? <span className="world-apple-art" aria-hidden="true"><i /></span> : <span className="world-upgraded-food-art" aria-hidden="true">{currentFood?.emoji || "🍎"}</span>;
  if (type === "harvestFruit") return <span className={`harvest-fruit-art fruit-${fruitVariant || "apple"}`} aria-hidden="true"><i /><b /></span>;
  if (type === "distantHouse") return <span className={`world-distant-house-art variant-${houseVariant || "red"}`} aria-hidden="true"><i /><b><em /><u /><small /></b></span>;
  if (type === "distantPerson") return <span className={`world-distant-person-art variant-${personVariant || "red"}`} aria-hidden="true"><i /><b /><em /><u /></span>;
  if (type === "dogToy") return <span className="world-dog-toy-art" aria-hidden="true"><i /><b /></span>;
  if (type === "fetchBall") return <span className="world-fetch-ball-art" aria-hidden="true"><i /></span>;
  if (type === "toyBasket") return <span className="world-toy-basket-art" aria-hidden="true"><i /><b /><em><u /><small /></em></span>;
  if (type === "doghouse") return <span className="world-doghouse-art" aria-hidden="true"><i /><b><em /></b><u /><strong className={`doghouse-status-sign ${dogInHouse ? "is-home" : "is-away"}`}>{dogInHouse ? "狗狗进屋了" : "狗狗不在窝里"}</strong></span>;
  if (type === "roomBed") return <span className="room-bed-art" aria-hidden="true"><i /><b /><em /><u /></span>;
  if (type === "roomDesk") return <span className="room-desk-art" aria-hidden="true"><i /><b /><em><u /><small /></em></span>;
  if (type === "roomChair") return <span className="room-chair-art" aria-hidden="true"><i /><b /><em /></span>;
  if (type === "roomBookshelf") return <span className="room-bookshelf-art" aria-hidden="true"><i /><b>{Array.from({ length: 8 }, (_, index) => <em key={index} />)}</b></span>;
  return <span aria-hidden="true">{emojiByType[type]}</span>;
}


export default function SceneObject({ object, action, activity, editable = false, persistentState, onInteract, onSelect, selected, onMoveStart, onMove, onMoveEnd, avatar, avatarLook, houseArt, houseDecor, doghouseDecor, onDoghouseDecorate, currentFood }) {
  const { dragging, activate, dragHandlers } = useSceneDrag({ object, onMoveStart, onMove, onMoveEnd, enabled: editable });
  const isForegroundCharacter = object.type === "person" || object.type === "dog";
  const isDeskActivity = object.type === "person" && ["studying", "working"].includes(activity);
  const isBedActivity = object.type === "person" && activity === "resting";
  const objectLayer = isDeskActivity ? 11 : isBedActivity ? 9 : isForegroundCharacter ? FOREGROUND_CHARACTER_LAYER : object.layer;


  if (object.type === "house") {
    const doorOpen = persistentState.doorOpen;
    return (
      <button
        className={`scene-object house-object action-${action || "idle"} ${editable ? "is-editable" : ""} ${selected ? "is-selected" : ""} ${dragging ? "is-dragging" : ""}`}
        style={{
          "--x": `${object.x}%`,
          "--y": `${object.y}%`,
          "--object-scale": object.scale || 1,
          ...(houseDecor ? { "--house-wall": houseDecor.wall, "--house-roof": houseDecor.roof, "--house-door": houseDecor.door, "--house-trim": houseDecor.trim, "--house-accent": houseDecor.accent } : {}),
          ...(object.layer ? { zIndex: object.layer } : {}),
        }}
        type="button"
        aria-label={editable ? `${object.label}，点击选中后可移动或调整大小` : `${object.label}，点击${doorOpen ? "关门" : "开门"}。${doorOpen ? "门已打开" : "门已关闭"}`}
        aria-describedby={editable ? "drag-help" : undefined}
        data-object-id={object.id}
        onClick={() => activate(() => editable ? onSelect?.(object.id) : onInteract?.(object.id, doorOpen ? "closeDoor" : "openDoor"))}
        {...dragHandlers}
      >
        {houseArt
          ? <span className="custom-house-art" style={{ backgroundImage: `url(${houseArt})` }} aria-hidden="true" />
          : <>
            <span className="cottage-chimney" aria-hidden="true"><i /><b /><em /></span>
            <span className="house-roof" aria-hidden="true" />
            <span className={`house-body pattern-${houseDecor?.pattern || "plain"}`} aria-hidden="true">
              <i className="window left" /><i className="window right" />
              <i className={`door ${doorOpen ? "is-open" : ""}`}><b /></i>
            </span>
          </>}
      </button>
    );
  }


  const isToy = ["dogToy", "fetchBall"].includes(object.type);
  const hidden = (object.type === "food" && persistentState.appleHidden) || (object.type === "fetchBall" && persistentState.fetchBallHeld) || (isToy && (persistentState.toysStored || persistentState.toysBeingCarried));
  const isRiggedPerson = object.type === "person" && avatar;
  const isRiggedDog = object.type === "dog";
  const isInDoghouse = isRiggedDog && persistentState.dogInHouse;
  const primaryAction = object.actions?.[0];
  const isHarvestFruit = object.type === "harvestFruit";
  const interactionLabel = primaryAction
    ? `点击${primaryAction === "feed" ? "去找小朋友" : "触发动作"}`
    : "点击选中";
  return (
    <button
      className={`scene-object ${object.type}-object ${object.type === "doghouse" ? `variant-${doghouseDecor?.variant || "gable"}` : ""} ${object.type === "toyBasket" && persistentState.toysStored ? "has-toys" : ""} ${isHarvestFruit ? "is-fresh-fruit" : ""} action-${action || "idle"} ${editable ? "is-editable" : ""} ${isDeskActivity ? "is-desk-activity" : ""} ${isBedActivity ? "is-bed-activity" : ""} ${selected ? "is-selected" : ""} ${hidden ? "is-hidden" : ""} ${isInDoghouse ? "is-in-doghouse" : ""} ${dragging ? "is-dragging" : ""}`}
      style={{ "--x": `${object.x}%`, "--y": `${object.y}%`, "--object-scale": object.scale || 1, ...(objectLayer ? { zIndex: objectLayer } : {}), ...(object.type === "doghouse" && doghouseDecor ? { "--doghouse-roof": doghouseDecor.roof, "--doghouse-wall": doghouseDecor.wall, "--doghouse-door": doghouseDecor.door, "--doghouse-sign": doghouseDecor.sign } : {}) }}
      type="button"
      aria-label={editable ? `${object.label}，点击选中后可移动或调整大小，当前位置横向${Math.round(object.x)}%，纵向${Math.round(object.y)}%` : `${object.label}，${interactionLabel}`}
      aria-describedby={editable ? "drag-help" : undefined}
      data-object-id={object.id}
      onClick={() => activate(() => editable ? onSelect?.(object.id) : primaryAction && onInteract?.(object.id, primaryAction))}
      onDoubleClick={() => !editable && object.type === "tree" && onInteract?.(object.id, "shake")}
      {...dragHandlers}
      disabled={hidden}
    >
      {isRiggedPerson
        ? <MotionAvatar avatar={avatar} action={action} activity={activity} look={avatarLook} />
        : isRiggedDog
          ? <MotionDog action={action} />
          : <WorldProp type={object.type} dogInHouse={persistentState.dogInHouse} treeVariant={object.treeVariant} fruitVariant={object.fruitVariant} houseVariant={object.houseVariant} personVariant={object.personVariant} currentFood={currentFood} />}
    </button>
  );
}
