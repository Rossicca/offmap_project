import {
  ACTION_IDS,
  ACTIVITY_IDS,
  SCENE_IDS,
  isActionId,
  isActiveActionId,
} from "../data/companionSystem.js";
import { normalizeCharacterState, normalizeSceneId } from "./companionState.js";

const requiredSceneByAction = Object.freeze({
  [ACTION_IDS.ENTER_ROOM]: SCENE_IDS.OUTDOOR,
  [ACTION_IDS.LEAVE_ROOM]: SCENE_IDS.ROOM,
  [ACTION_IDS.STUDY]: SCENE_IDS.ROOM,
  [ACTION_IDS.WORK]: SCENE_IDS.ROOM,
  [ACTION_IDS.REST]: SCENE_IDS.ROOM,
  [ACTION_IDS.PLAY]: SCENE_IDS.OUTDOOR,
});

const activityByAction = Object.freeze({
  [ACTION_IDS.STUDY]: ACTIVITY_IDS.STUDYING,
  [ACTION_IDS.WORK]: ACTIVITY_IDS.WORKING,
  [ACTION_IDS.PLAY]: ACTIVITY_IDS.PLAYING,
  [ACTION_IDS.REST]: ACTIVITY_IDS.RESTING,
});

export function executeCompanionAction({ action, characterState, currentSceneId }) {
  const sceneId = normalizeSceneId(currentSceneId);
  const state = normalizeCharacterState(characterState, sceneId);
  if (!isActionId(action)) return { accepted: false, reason: "unknown-action", state, activeAction: null };

  const requiredSceneId = requiredSceneByAction[action];
  if (requiredSceneId && (sceneId !== requiredSceneId || state.location !== requiredSceneId)) {
    return {
      accepted: false,
      reason: requiredSceneId === SCENE_IDS.ROOM ? "room-required" : "outdoor-required",
      state,
      activeAction: null,
    };
  }

  if (action === ACTION_IDS.ENTER_ROOM) {
    return { accepted: true, transitionTo: SCENE_IDS.ROOM, state: { location: SCENE_IDS.ROOM, activity: ACTIVITY_IDS.IDLE }, activeAction: null };
  }
  if (action === ACTION_IDS.LEAVE_ROOM) {
    return { accepted: true, transitionTo: SCENE_IDS.OUTDOOR, state: { location: SCENE_IDS.OUTDOOR, activity: ACTIVITY_IDS.IDLE }, activeAction: null };
  }

  const activity = activityByAction[action]
    || (action === ACTION_IDS.JUMP && state.activity === ACTIVITY_IDS.RESTING ? ACTIVITY_IDS.IDLE : state.activity);
  return {
    accepted: true,
    state: { ...state, activity },
    activeAction: isActiveActionId(action) ? action : null,
  };
}

