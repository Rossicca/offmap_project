import { ACTION_IDS } from "../data/companionSystem.js";

const roomActivitySpots = Object.freeze({
  [ACTION_IDS.STUDY]: Object.freeze({ x: 72, y: 62 }),
  [ACTION_IDS.WORK]: Object.freeze({ x: 72, y: 62 }),
  [ACTION_IDS.REST]: Object.freeze({ x: 22, y: 62 }),
});

const uploadedDeskActivityY = 42;

export function roomActivitySpotFor(action, avatar) {
  const spot = roomActivitySpots[action];
  if (!spot) return null;
  const needsArtworkLift = avatar?.isUploaded && [ACTION_IDS.STUDY, ACTION_IDS.WORK].includes(action);
  return { ...spot, ...(needsArtworkLift ? { y: uploadedDeskActivityY } : {}) };
}
