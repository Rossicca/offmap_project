import dogMotion from "../assets/dog-motion-paper.png";
import { wardrobeItem } from "../data/wardrobeCatalog";


const frameByAction = {
  wave: "100% 0%",
  jump: "0% 100%",
  eat: "100% 100%",
  dance: "100% 0%",
  spin: "0% 0%",
  cheer: "0% 100%",
  rest: "0% 0%",
};


const reactionByAction = { dance: "跳舞时间", spin: "转起来", cheer: "太棒啦", rest: "房间休息" };


const humanNodes = [
  ["头", 50, 25], ["身体", 50, 54],
  ["左肩", 35, 45], ["左肘", 25, 58], ["右肩", 65, 45], ["右肘", 76, 58],
  ["左髋", 43, 67], ["左膝", 40, 80], ["右髋", 57, 67], ["右膝", 60, 80],
];


const rabbitNodes = [
  ["头", 50, 31], ["身体", 50, 60], ["左耳", 39, 12], ["右耳", 61, 12],
  ["左前爪", 29, 53], ["右前爪", 72, 53], ["左后腿", 42, 78], ["右后腿", 59, 78], ["尾巴", 76, 65],
];


function JointOverlay({ species, calibratedNodes }) {
  const nodes = calibratedNodes?.length
    ? calibratedNodes.map((node) => [node.label, node.x, node.y])
    : species === "rabbit" ? rabbitNodes : humanNodes;
  return (
    <span className={`image-joints ${calibratedNodes?.length ? "is-calibrated" : ""}`} aria-hidden="true">
      {nodes.map(([label, x, y]) => (
        <i key={label} style={{ left: `${x}%`, top: `${y}%` }}><b>{label}</b></i>
      ))}
    </span>
  );
}

export default function MotionAvatar({ avatar, action, showJoints, look }) {
  const frame = frameByAction[action] || "0% 0%";
  const outfit = wardrobeItem("outfit", look?.outfit || "original");
  const outfitSprite = outfit.avatars?.includes(avatar.id) && outfit.sprite ? outfit.sprite : avatar.motionSprite;
  const outfitMask = outfit.maskWithBase && outfitSprite !== avatar.motionSprite ? {
    WebkitMaskImage: `url(${avatar.motionSprite})`,
    WebkitMaskPosition: frame,
    WebkitMaskRepeat: "no-repeat",
    WebkitMaskSize: "200% 200%",
    maskImage: `url(${avatar.motionSprite})`,
    maskPosition: frame,
    maskRepeat: "no-repeat",
    maskSize: "200% 200%",
  } : {};
  const paperBlend = outfit.paperBlend || (outfitSprite === avatar.motionSprite && avatar.paperBlend);
  const uploadedAspect = avatar.isUploaded && avatar.imageSize?.width && avatar.imageSize?.height
    ? `${avatar.imageSize.width} / ${avatar.imageSize.height}`
    : undefined;
  return (
    <div className={`motion-avatar motion-${action || "idle"} ${showJoints ? "show-joints" : ""}`} style={uploadedAspect ? { aspectRatio: uploadedAspect } : undefined}>
      {avatar.isUploaded
        ? <img className="uploaded-avatar-art" src={avatar.imageUrl} alt="" draggable="false" />
        : <span className="motion-sprite" style={{ backgroundImage: `url(${outfitSprite})`, backgroundPosition: frame, ...(paperBlend ? { mixBlendMode: "multiply", filter: "brightness(1.025) contrast(1.035)" } : {}), ...outfitMask }} aria-hidden="true" />}
      {showJoints && <JointOverlay species={avatar.species} calibratedNodes={avatar.rigNodes} />}
      {reactionByAction[action] && <em className="reaction-badge">{reactionByAction[action]}</em>}
    </div>
  );
}


export function MotionDog({ action, showJoints }) {
  const dogFrames = { idle: "0% 0%", move: "100% 0%", jump: "0% 100%", sit: "100% 100%" };
  const frame = dogFrames[action] || dogFrames.idle;
  const dogNodes = [["头",35,33],["躯干",57,52],["左前腿",39,72],["右前腿",50,74],["左后腿",66,73],["右后腿",77,72],["尾巴",82,45]];
  return (
    <div className={`motion-dog motion-${action || "idle"} ${showJoints ? "show-joints" : ""}`}>
      <span className="motion-sprite" style={{ backgroundImage: `url(${dogMotion})`, backgroundPosition: frame }} aria-hidden="true" />
      {showJoints && <span className="image-joints dog-joints" aria-hidden="true">{dogNodes.map(([label,x,y]) => <i key={label} style={{left:`${x}%`,top:`${y}%`}}><b>{label}</b></i>)}</span>}
    </div>
  );
}
