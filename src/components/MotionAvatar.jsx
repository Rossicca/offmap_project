import dogMotion from "../assets/dog-motion-paper.png";
import { wardrobeItem } from "../data/wardrobeCatalog";


const frameByAction = {
  wave: "100% 0%",
  jump: "0% 100%",
  eat: "100% 100%",
  dance: "100% 0%",
  spin: "0% 0%",
  cheer: "0% 100%",
  throwBall: "100% 0%",
  carryToy: "100% 0%",
};

const activityFrameByAction = {
  study: "0% 0%",
  work: "100% 0%",
  play: "0% 100%",
  rest: "100% 100%",
};

const actionByActivity = {
  studying: "study",
  working: "work",
  playing: "play",
  resting: "rest",
};


const reactionByAction = { dance: "跳舞时间", spin: "转起来", cheer: "太棒啦", study: "认真学习", work: "专注创作", play: "户外玩耍", rest: "安静休息" };
const rpsGestureByAction = { rpsRock: "✊", rpsScissors: "✌️", rpsPaper: "✋" };


function SegmentedCharacter({ avatar }) {
  const rig = avatar.armRig;
  if (!rig?.arms?.length) return <img className="uploaded-avatar-art" src={avatar.imageUrl} alt="" draggable="false" />;

  const centerX = avatar.rigNodes.find((node) => /身体中心|身体|躯干|胸/.test(node.label))?.x ?? 50;
  const waveSide = rig.arms.some((arm) => arm.visualSide === "visual-right") ? "visual-right" : rig.arms[0].visualSide;
  return (
    <span className="segmented-character" style={{ "--body-center-x": `${centerX}%` }} aria-hidden="true">
      <img className="segmented-character-base" src={rig.baseUrl} alt="" draggable="false" />
      {rig.arms.map((arm) => {
        const visualSide = arm.visualSide || (arm.elbow.x < centerX ? "visual-left" : "visual-right");
        return (
          <span
            className={`segmented-arm manual-arm-layer ${visualSide} ${visualSide === waveSide ? "wave-arm" : ""}`}
            key={arm.side}
            style={{ "--shoulder-x": `${arm.elbow.x}%`, "--shoulder-y": `${arm.elbow.y}%`, "--elbow-x": `${arm.elbow.x}%`, "--elbow-y": `${arm.elbow.y}%`, "--forearm-lift": `${Math.max(-38, Math.min(38, arm.motion?.raiseAngle || (visualSide === "visual-left" ? 34 : -34)))}deg`, "--forearm-settle": `${Math.max(-28, Math.min(28, arm.motion?.settleAngle || (visualSide === "visual-left" ? 24 : -24)))}deg` }}
          >
            <span className="segmented-forearm"><img src={arm.forearmUrl} alt="" draggable="false" /></span>
          </span>
        );
      })}
    </span>
  );
}


export default function MotionAvatar({ avatar, action, activity, look }) {
  const poseAction = action || actionByActivity[activity] || "idle";
  const activityFrame = activityFrameByAction[poseAction];
  const frame = activityFrame || frameByAction[poseAction] || "0% 0%";
  const canSegment = avatar.isUploaded && avatar.rigNodes?.length && avatar.armRig?.arms?.length;
  const useArmRig = canSegment && ["wave", "cheer"].includes(action);
  const outfit = wardrobeItem("outfit", look?.outfit || "original");
  const outfitSprite = outfit.avatars?.includes(avatar.id) && outfit.sprite ? outfit.sprite : avatar.motionSprite;
  const displayedSprite = activityFrame && avatar.activitySprite ? avatar.activitySprite : outfitSprite;
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
  const uploadedAspect = avatar.isUploaded && avatar.imageSize?.width && avatar.imageSize?.height
    ? `${avatar.imageSize.width} / ${avatar.imageSize.height}`
    : undefined;
  return (
    <div className={`motion-avatar motion-${poseAction} ${useArmRig ? "has-segmented-rig has-manual-arm-rig" : ""} ${canSegment ? "arm-rig-ready" : ""} ${avatar.isUploaded ? "preserve-art-colors" : ""}`} style={uploadedAspect ? { aspectRatio: uploadedAspect } : undefined}>
      {avatar.isUploaded
        ? useArmRig ? <SegmentedCharacter avatar={avatar} /> : <img className="uploaded-avatar-art" src={avatar.imageUrl} alt="" draggable="false" />
        : <span className="motion-sprite" style={{ backgroundImage: `url(${displayedSprite})`, backgroundPosition: frame, ...(displayedSprite === outfitSprite ? outfitMask : {}) }} aria-hidden="true" />}
      {poseAction === "study" && <span className="avatar-reading-book" aria-hidden="true"><i /><b /><em /></span>}
      {poseAction === "rest" && <span className="avatar-sleep-blanket" aria-hidden="true"><i /><b /></span>}
      {action === "carryToy" && <span className="person-carry-toy" aria-hidden="true"><i /><b /><small /></span>}
      {reactionByAction[action] && <em className="reaction-badge">{reactionByAction[action]}</em>}
      {rpsGestureByAction[action] && <span className="rps-world-gesture" aria-hidden="true">{rpsGestureByAction[action]}</span>}
    </div>
  );
}


export function MotionDog({ action }) {
  const dogFrames = { idle: "0% 0%", move: "100% 0%", jump: "0% 100%", sit: "100% 100%", dogEat: "100% 0%", dogPlay: "100% 0%", dogChase: "100% 0%", dogCarry: "100% 0%" };
  const frame = dogFrames[action] || dogFrames.idle;
  return (
    <div className={`motion-dog motion-${action || "idle"}`}>
      <span className="motion-sprite" style={{ backgroundImage: `url(${dogMotion})`, backgroundPosition: frame }} aria-hidden="true" />
      {action === "dogCarry" && <span className="dog-mouth-fetch-ball" aria-hidden="true" />}
    </div>
  );
}
