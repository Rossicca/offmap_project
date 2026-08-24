export const COMPANION_STATE_SCHEMA_VERSION = 1;

export const SCENE_IDS = Object.freeze({
  OUTDOOR: "outdoor",
  ROOM: "room",
});

export const ACTIVITY_IDS = Object.freeze({
  IDLE: "idle",
  PLAYING: "playing",
  STUDYING: "studying",
  WORKING: "working",
  RESTING: "resting",
});

export const ACTION_IDS = Object.freeze({
  WAVE: "wave",
  JUMP: "jump",
  EAT: "eat",
  DANCE: "dance",
  SPIN: "spin",
  CHEER: "cheer",
  ENTER_ROOM: "enterRoom",
  LEAVE_ROOM: "leaveRoom",
  STUDY: "study",
  WORK: "work",
  PLAY: "play",
  REST: "rest",
});

export const DEFAULT_SCENE_ID = SCENE_IDS.OUTDOOR;
export const DEFAULT_ACTIVITY_ID = ACTIVITY_IDS.IDLE;

export const SCENE_DEFINITIONS = Object.freeze({
  [SCENE_IDS.OUTDOOR]: Object.freeze({
    id: SCENE_IDS.OUTDOOR,
    label: "室外",
    allowedActivities: Object.freeze([ACTIVITY_IDS.IDLE, ACTIVITY_IDS.PLAYING]),
  }),
  [SCENE_IDS.ROOM]: Object.freeze({
    id: SCENE_IDS.ROOM,
    label: "房间",
    allowedActivities: Object.freeze([
      ACTIVITY_IDS.IDLE,
      ACTIVITY_IDS.STUDYING,
      ACTIVITY_IDS.WORKING,
      ACTIVITY_IDS.RESTING,
    ]),
  }),
});

export const ACTIVITY_DEFINITIONS = Object.freeze({
  [ACTIVITY_IDS.IDLE]: Object.freeze({ id: ACTIVITY_IDS.IDLE, label: "空闲", sceneIds: Object.freeze([SCENE_IDS.OUTDOOR, SCENE_IDS.ROOM]) }),
  [ACTIVITY_IDS.PLAYING]: Object.freeze({ id: ACTIVITY_IDS.PLAYING, label: "玩耍", sceneIds: Object.freeze([SCENE_IDS.OUTDOOR]) }),
  [ACTIVITY_IDS.STUDYING]: Object.freeze({ id: ACTIVITY_IDS.STUDYING, label: "学习", sceneIds: Object.freeze([SCENE_IDS.ROOM]) }),
  [ACTIVITY_IDS.WORKING]: Object.freeze({ id: ACTIVITY_IDS.WORKING, label: "专注创作", sceneIds: Object.freeze([SCENE_IDS.ROOM]) }),
  [ACTIVITY_IDS.RESTING]: Object.freeze({ id: ACTIVITY_IDS.RESTING, label: "休息", sceneIds: Object.freeze([SCENE_IDS.ROOM]) }),
});

export const ACTION_DEFINITIONS = Object.freeze({
  [ACTION_IDS.WAVE]: Object.freeze({ id: ACTION_IDS.WAVE, label: "挥手" }),
  [ACTION_IDS.JUMP]: Object.freeze({ id: ACTION_IDS.JUMP, label: "跳跃" }),
  [ACTION_IDS.EAT]: Object.freeze({ id: ACTION_IDS.EAT, label: "吃东西" }),
  [ACTION_IDS.DANCE]: Object.freeze({ id: ACTION_IDS.DANCE, label: "跳舞" }),
  [ACTION_IDS.SPIN]: Object.freeze({ id: ACTION_IDS.SPIN, label: "转圈" }),
  [ACTION_IDS.CHEER]: Object.freeze({ id: ACTION_IDS.CHEER, label: "欢呼" }),
  [ACTION_IDS.ENTER_ROOM]: Object.freeze({ id: ACTION_IDS.ENTER_ROOM, label: "进入房间" }),
  [ACTION_IDS.LEAVE_ROOM]: Object.freeze({ id: ACTION_IDS.LEAVE_ROOM, label: "去室外" }),
  [ACTION_IDS.STUDY]: Object.freeze({ id: ACTION_IDS.STUDY, label: "学习" }),
  [ACTION_IDS.WORK]: Object.freeze({ id: ACTION_IDS.WORK, label: "专注创作" }),
  [ACTION_IDS.PLAY]: Object.freeze({ id: ACTION_IDS.PLAY, label: "玩耍" }),
  [ACTION_IDS.REST]: Object.freeze({ id: ACTION_IDS.REST, label: "休息" }),
});

export const ACTIVE_ACTION_IDS = Object.freeze([
  ACTION_IDS.WAVE,
  ACTION_IDS.JUMP,
  ACTION_IDS.STUDY,
  ACTION_IDS.WORK,
  ACTION_IDS.PLAY,
  ACTION_IDS.REST,
]);

export const DEFAULT_CHARACTER_STATE = Object.freeze({
  location: DEFAULT_SCENE_ID,
  activity: DEFAULT_ACTIVITY_ID,
});

export const isSceneId = (value) => Object.hasOwn(SCENE_DEFINITIONS, value);
export const isActivityId = (value) => Object.hasOwn(ACTIVITY_DEFINITIONS, value);
export const isActionId = (value) => Object.hasOwn(ACTION_DEFINITIONS, value);
export const isActiveActionId = (value) => ACTIVE_ACTION_IDS.includes(value);

export const isActivityAllowedInScene = (activityId, sceneId) => (
  isActivityId(activityId)
  && isSceneId(sceneId)
  && ACTIVITY_DEFINITIONS[activityId].sceneIds.includes(sceneId)
);
