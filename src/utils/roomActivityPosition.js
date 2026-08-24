import { ACTION_IDS } from "../data/companionSystem.js";

const roomActivitySpots = Object.freeze({
  [ACTION_IDS.STUDY]: Object.freeze({ x: 72, y: 62 }),
  [ACTION_IDS.WORK]: Object.freeze({ x: 72, y: 62 }),
  [ACTION_IDS.REST]: Object.freeze({ x: 22, y: 62 }),
});

const deskHipTarget = Object.freeze({ x: 72, y: 64 });
const clampPercent = (value) => Math.max(8, Math.min(92, value));

function hipAnchor(nodes) {
  const hips = Array.isArray(nodes)
    ? nodes.filter((node) => /髋|胯|hip/i.test(String(node?.label || "")) && Number.isFinite(node.x) && Number.isFinite(node.y))
    : [];
  if (!hips.length) return null;
  return {
    x: hips.reduce((sum, node) => sum + node.x, 0) / hips.length,
    y: hips.reduce((sum, node) => sum + node.y, 0) / hips.length,
  };
}

export function roomActivitySpotFor(action, avatar, layout = {}) {
  const spot = roomActivitySpots[action];
  if (!spot) return null;
  const anchor = avatar?.isUploaded && [ACTION_IDS.STUDY, ACTION_IDS.WORK].includes(action)
    ? hipAnchor(avatar.rigNodes)
    : null;
  const { stageWidth, stageHeight, avatarWidth, avatarHeight } = layout;
  if (!anchor || ![stageWidth, stageHeight, avatarWidth, avatarHeight].every((value) => Number.isFinite(value) && value > 0)) return { ...spot };
  const hipOffsetX = (anchor.x - 50) / 100 * avatarWidth / stageWidth * 100;
  const hipOffsetY = (anchor.y - 50) / 100 * avatarHeight / stageHeight * 100;
  return {
    x: clampPercent(deskHipTarget.x - hipOffsetX),
    y: clampPercent(deskHipTarget.y - hipOffsetY),
  };
}
