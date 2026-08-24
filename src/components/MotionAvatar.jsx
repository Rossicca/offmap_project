import { useEffect, useState } from "react";
import dogMotion from "../assets/dog-motion-paper.png";
import { segmentCharacterRig } from "../utils/segmentCharacterRig";


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

function SegmentedCharacter({ avatar }) {
  const [rig, setRig] = useState(null);

  useEffect(() => {
    let active = true;
    setRig(null);
    segmentCharacterRig(avatar.imageUrl, avatar.rigNodes).then((nextRig) => {
      if (active) setRig(nextRig);
    });
    return () => { active = false; };
  }, [avatar.imageUrl, avatar.rigNodes]);

  if (!rig) return <img className="uploaded-avatar-art" src={avatar.imageUrl} alt="" draggable="false" />;

  const centerX = avatar.rigNodes.find((node) => /身体中心|身体|躯干|胸/.test(node.label))?.x ?? 50;
  return (
    <span className="segmented-character" style={{ "--body-center-x": `${centerX}%` }} aria-hidden="true">
      <img className="segmented-character-base" src={rig.baseUrl} alt="" draggable="false" />
      {rig.arms.map((arm) => {
        const visualSide = arm.shoulder.x < centerX ? "visual-left" : "visual-right";
        return (
          <span
            className={`segmented-arm ${visualSide}`}
            key={arm.side}
            style={{ "--shoulder-x": `${arm.shoulder.x}%`, "--shoulder-y": `${arm.shoulder.y}%`, "--elbow-x": `${arm.elbow.x}%`, "--elbow-y": `${arm.elbow.y}%` }}
          >
            <img className="segmented-upper-arm" src={arm.upperUrl} alt="" draggable="false" />
            <span className="segmented-forearm"><img src={arm.forearmUrl} alt="" draggable="false" /></span>
          </span>
        );
      })}
    </span>
  );
}


export default function MotionAvatar({ avatar, action, showJoints }) {
  const frame = frameByAction[action] || "0% 0%";
  const canSegment = avatar.isUploaded && avatar.rigNodes?.length && !avatar.preserveSourceArt;
  const uploadedAspect = avatar.isUploaded && avatar.imageSize?.width && avatar.imageSize?.height
    ? `${avatar.imageSize.width} / ${avatar.imageSize.height}`
    : undefined;
  return (
    <div className={`motion-avatar motion-${action || "idle"} ${canSegment ? "has-segmented-rig" : ""} ${avatar.isUploaded ? "preserve-art-colors" : ""} ${showJoints ? "show-joints" : ""}`} style={uploadedAspect ? { aspectRatio: uploadedAspect } : undefined}>
      {avatar.isUploaded
        ? canSegment ? <SegmentedCharacter avatar={avatar} /> : <img className="uploaded-avatar-art" src={avatar.imageUrl} alt="" draggable="false" />
        : <span className="motion-sprite" style={{ backgroundImage: `url(${avatar.motionSprite})`, backgroundPosition: frame }} aria-hidden="true" />}
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
