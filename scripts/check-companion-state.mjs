import assert from "node:assert/strict";
import {
  ACTIVITY_IDS,
  COMPANION_STATE_SCHEMA_VERSION,
  SCENE_IDS,
} from "../src/data/companionSystem.js";
import {
  createDefaultCharacterState,
  migrateCompanionSnapshot,
  normalizeActiveActions,
  normalizeCharacterStates,
  normalizeSceneObjects,
} from "../src/utils/companionState.js";

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

console.log("Companion state checks passed.");
