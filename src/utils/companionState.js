import {
  ACTIVITY_IDS,
  COMPANION_STATE_SCHEMA_VERSION,
  DEFAULT_ACTIVITY_ID,
  DEFAULT_CHARACTER_STATE,
  DEFAULT_SCENE_ID,
  SCENE_IDS,
  isActiveActionId,
  isActivityAllowedInScene,
  isSceneId,
} from "../data/companionSystem.js";

const unsafeObjectIds = new Set(["__proto__", "constructor", "prototype"]);
const sceneObjectCollections = ["sceneObjects", "customObjects", "libraryObjects"];

const isRecord = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const isSafeObjectId = (value) => typeof value === "string" && value.length > 0 && !unsafeObjectIds.has(value);
const isCharacterObject = (object) => object?.type === "person" && isSafeObjectId(object.id);

export function normalizeSceneId(value, fallback = DEFAULT_SCENE_ID) {
  if (isSceneId(value)) return value;
  return isSceneId(fallback) ? fallback : DEFAULT_SCENE_ID;
}

export function normalizeActivityId(value, sceneId = DEFAULT_SCENE_ID) {
  const location = normalizeSceneId(sceneId);
  return isActivityAllowedInScene(value, location) ? value : DEFAULT_ACTIVITY_ID;
}

export function createDefaultCharacterState(overrides = {}) {
  const source = isRecord(overrides) ? overrides : {};
  const location = normalizeSceneId(source.location ?? source.sceneId);
  return {
    ...DEFAULT_CHARACTER_STATE,
    location,
    activity: normalizeActivityId(source.activity, location),
  };
}

export function normalizeCharacterState(value, fallbackLocation = DEFAULT_SCENE_ID) {
  const source = isRecord(value) ? value : {};
  const location = normalizeSceneId(
    source.location ?? source.sceneId,
    fallbackLocation,
  );
  return {
    location,
    activity: normalizeActivityId(source.activity, location),
  };
}

export function normalizeSceneObject(object) {
  if (!isRecord(object)) return null;
  return { ...object, sceneId: normalizeSceneId(object.sceneId) };
}

export function normalizeSceneObjects(sceneObjects) {
  if (!Array.isArray(sceneObjects)) return [];
  return sceneObjects.map(normalizeSceneObject).filter(Boolean);
}

export function normalizeCharacterStates(characterStates, sceneObjects = []) {
  const source = isRecord(characterStates) ? characterStates : {};
  const normalized = Object.create(null);
  const characterObjects = normalizeSceneObjects(sceneObjects).filter(isCharacterObject);
  const fallbackLocations = new Map(characterObjects.map((object) => [object.id, object.sceneId]));

  for (const [objectId, state] of Object.entries(source)) {
    if (!isSafeObjectId(objectId)) continue;
    normalized[objectId] = normalizeCharacterState(state, fallbackLocations.get(objectId));
  }

  for (const object of characterObjects) {
    if (!Object.hasOwn(normalized, object.id)) {
      normalized[object.id] = normalizeCharacterState(null, object.sceneId);
    }
  }

  return { ...normalized };
}

export function normalizeActiveActions(activeActions) {
  const source = isRecord(activeActions) ? activeActions : {};
  return Object.fromEntries(Object.entries(source)
    .filter(([objectId]) => isSafeObjectId(objectId))
    .map(([objectId, action]) => [objectId, isActiveActionId(action) ? action : null]));
}

function legacyRestingCharacterIds(snapshot) {
  const restingCharacters = snapshot?.persistentState?.restingCharacters;
  return Array.isArray(restingCharacters)
    ? restingCharacters.filter(isSafeObjectId)
    : [];
}

function alignCharacterSceneIds(sceneObjects, characterStates) {
  return sceneObjects.map((object) => (
    isCharacterObject(object) && characterStates[object.id]
      ? { ...object, sceneId: characterStates[object.id].location }
      : object
  ));
}

export function migrateCompanionSnapshot(snapshot) {
  const source = isRecord(snapshot) ? snapshot : {};
  const normalizedCollections = Object.fromEntries(sceneObjectCollections.map((key) => [
    key,
    normalizeSceneObjects(source[key]),
  ]));
  const allSceneObjects = sceneObjectCollections.flatMap((key) => normalizedCollections[key]);
  const hasCharacterStates = isRecord(source.characterStates);
  const characterStates = normalizeCharacterStates(source.characterStates, allSceneObjects);

  for (const objectId of legacyRestingCharacterIds(source)) {
    if (hasCharacterStates && Object.hasOwn(source.characterStates, objectId)) continue;
    characterStates[objectId] = {
      location: SCENE_IDS.ROOM,
      activity: ACTIVITY_IDS.RESTING,
    };
  }

  const alignedCollections = Object.fromEntries(sceneObjectCollections.map((key) => [
    key,
    alignCharacterSceneIds(normalizedCollections[key], characterStates),
  ]));

  return {
    ...source,
    ...alignedCollections,
    companionStateVersion: COMPANION_STATE_SCHEMA_VERSION,
    currentSceneId: normalizeSceneId(source.currentSceneId),
    characterStates,
  };
}
