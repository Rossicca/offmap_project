import { ACTION_IDS } from "../data/companionSystem.js";

const roomActivitySpots = Object.freeze({
  [ACTION_IDS.STUDY]: Object.freeze({ x: 72, y: 62 }),
  [ACTION_IDS.WORK]: Object.freeze({ x: 72, y: 62 }),
  [ACTION_IDS.REST]: Object.freeze({ x: 22, y: 62 }),
});

const clampPercent = (value) => Math.max(8, Math.min(92, value));

function furnitureSpot(action, furniture) {
  if (!Number.isFinite(furniture?.x) || !Number.isFinite(furniture?.y)) return roomActivitySpots[action];
  const verticalOffset = action === ACTION_IDS.REST ? 6 : 7;
  return { x: clampPercent(furniture.x), y: clampPercent(furniture.y - verticalOffset) };
}

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

export function roomActivitySpotFor(action, avatar, layout = {}, furniture = null) {
  const spot = furnitureSpot(action, furniture);
  if (!spot) return null;
  const anchor = avatar?.isUploaded && [ACTION_IDS.STUDY, ACTION_IDS.WORK].includes(action)
    ? hipAnchor(avatar.rigNodes)
    : null;
  const { stageWidth, stageHeight, avatarWidth, avatarHeight } = layout;
  if (!anchor || ![stageWidth, stageHeight, avatarWidth, avatarHeight].every((value) => Number.isFinite(value) && value > 0)) return { ...spot };
  const hipOffsetX = (anchor.x - 50) / 100 * avatarWidth / stageWidth * 100;
  const hipOffsetY = (anchor.y - 50) / 100 * avatarHeight / stageHeight * 100;
  const deskHipTarget = Number.isFinite(furniture?.x) && Number.isFinite(furniture?.y)
    ? { x: furniture.x, y: furniture.y - 5 }
    : { x: 72, y: 64 };
  return {
    x: clampPercent(deskHipTarget.x - hipOffsetX),
    y: clampPercent(deskHipTarget.y - hipOffsetY),
  };
}
