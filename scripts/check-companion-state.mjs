import assert from "node:assert/strict";
import {
  ACTIVITY_IDS,
  COMPANION_STATE_SCHEMA_VERSION,
  ROOM_SCENE_OBJECTS,
  SCENE_IDS,
} from "../src/data/companionSystem.js";
import {
  createDefaultCharacterState,
  migrateCompanionSnapshot,
  normalizeActiveActions,
  normalizeCharacterStates,
  normalizeSceneObjects,
} from "../src/utils/companionState.js";
import { executeCompanionAction } from "../src/utils/executeCompanionAction.js";
import { roomActivitySpotFor } from "../src/utils/roomActivityPosition.js";

const empty = migrateCompanionSnapshot(null);
assert.equal(empty.companionStateVersion, COMPANION_STATE_SCHEMA_VERSION);
assert.equal(empty.currentSceneId, SCENE_IDS.OUTDOOR);
assert.deepEqual(empty.characterStates, {});
assert.deepEqual(empty.sceneObjects, []);

const legacy = {
  sceneTheme: "forest",
  sceneObjects: [
    { id: "person1", type: "person", x: 30, y: 60 },
    { id: "person2", type: "person", x: 45, y: 60 },
    { id: "house1", type: "house", x: 70, y: 45 },
  ],
  persistentState: { restingCharacters: ["person2"] },
};
const legacyBefore = JSON.stringify(legacy);
const migratedLegacy = migrateCompanionSnapshot(legacy);
assert.equal(JSON.stringify(legacy), legacyBefore, "migration must not mutate the saved project");
assert.equal(migratedLegacy.sceneTheme, "forest", "visual themes remain separate and unchanged");
assert.equal(migratedLegacy.currentSceneId, SCENE_IDS.OUTDOOR);
assert.deepEqual(migratedLegacy.characterStates.person1, { location: SCENE_IDS.OUTDOOR, activity: ACTIVITY_IDS.IDLE });
assert.deepEqual(migratedLegacy.characterStates.person2, { location: SCENE_IDS.ROOM, activity: ACTIVITY_IDS.RESTING });
assert.equal(migratedLegacy.sceneObjects.find(({ id }) => id === "person2").sceneId, SCENE_IDS.ROOM);
assert.equal(migratedLegacy.sceneObjects.find(({ id }) => id === "house1").sceneId, SCENE_IDS.OUTDOOR);

const abnormal = migrateCompanionSnapshot({
  currentSceneId: "space-theme-is-not-a-scene",
  sceneObjects: [
    { id: "person1", type: "person", sceneId: "unknown" },
    { id: "person2", type: "person", sceneId: SCENE_IDS.ROOM },
    null,
  ],
  characterStates: {
    person1: { location: SCENE_IDS.OUTDOOR, activity: ACTIVITY_IDS.STUDYING },
    person2: { location: SCENE_IDS.ROOM, activity: "flying" },
    constructor: { location: SCENE_IDS.ROOM, activity: ACTIVITY_IDS.RESTING },
  },
});
assert.equal(abnormal.currentSceneId, SCENE_IDS.OUTDOOR);
assert.deepEqual(abnormal.characterStates.person1, { location: SCENE_IDS.OUTDOOR, activity: ACTIVITY_IDS.IDLE });
assert.deepEqual(abnormal.characterStates.person2, { location: SCENE_IDS.ROOM, activity: ACTIVITY_IDS.IDLE });
assert.equal(Object.hasOwn(abnormal.characterStates, "constructor"), false);

assert.deepEqual(createDefaultCharacterState({ location: SCENE_IDS.ROOM, activity: ACTIVITY_IDS.STUDYING }), {
  location: SCENE_IDS.ROOM,
  activity: ACTIVITY_IDS.STUDYING,
});
assert.deepEqual(normalizeCharacterStates(null, [{ id: "person1", type: "person" }]).person1, {
  location: SCENE_IDS.OUTDOOR,
  activity: ACTIVITY_IDS.IDLE,
});
assert.deepEqual(normalizeCharacterStates(
  { person2: { activity: ACTIVITY_IDS.STUDYING } },
  [{ id: "person2", type: "person", sceneId: SCENE_IDS.ROOM }],
).person2, { location: SCENE_IDS.ROOM, activity: ACTIVITY_IDS.STUDYING });
assert.deepEqual(normalizeActiveActions({ person1: "wave", person2: "teleport" }), { person1: "wave", person2: null });
assert.equal(normalizeSceneObjects([{ id: "old-object", type: "house" }])[0].sceneId, SCENE_IDS.OUTDOOR);
assert.equal(ROOM_SCENE_OBJECTS.length, 4);
assert.equal(ROOM_SCENE_OBJECTS.every((object) => object.sceneId === SCENE_IDS.ROOM), true);
assert.deepEqual(roomActivitySpotFor("study", { isUploaded: false }), { x: 72, y: 62 });
assert.deepEqual(roomActivitySpotFor("study", { isUploaded: true }), { x: 72, y: 42 });
assert.equal(roomActivitySpotFor("wave", { isUploaded: true }), null);

const studying = executeCompanionAction({
  action: "study",
  currentSceneId: SCENE_IDS.ROOM,
  characterState: { location: SCENE_IDS.ROOM, activity: ACTIVITY_IDS.IDLE },
});
assert.equal(studying.accepted, true);
assert.equal(studying.state.activity, ACTIVITY_IDS.STUDYING);
assert.equal(studying.activeAction, "study");
assert.equal(executeCompanionAction({ action: "study", currentSceneId: SCENE_IDS.OUTDOOR }).reason, "room-required");
assert.equal(executeCompanionAction({ action: "play", currentSceneId: SCENE_IDS.ROOM, characterState: { location: SCENE_IDS.ROOM } }).reason, "outdoor-required");
assert.deepEqual(executeCompanionAction({ action: "jump", currentSceneId: SCENE_IDS.ROOM, characterState: { location: SCENE_IDS.ROOM, activity: ACTIVITY_IDS.RESTING } }).state, { location: SCENE_IDS.ROOM, activity: ACTIVITY_IDS.IDLE });
assert.equal(executeCompanionAction({ action: "enterRoom", currentSceneId: SCENE_IDS.OUTDOOR }).transitionTo, SCENE_IDS.ROOM);
assert.equal(executeCompanionAction({ action: "leaveRoom", currentSceneId: SCENE_IDS.ROOM, characterState: { location: SCENE_IDS.ROOM } }).transitionTo, SCENE_IDS.OUTDOOR);

console.log("Companion state checks passed.");
