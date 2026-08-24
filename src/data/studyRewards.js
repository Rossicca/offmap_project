export const STUDY_PROGRESS_STORAGE_KEY = "living-drawing-study-focus";

export const studySubjects = [
  { id: "math", name: "数学", mark: "＋" },
  { id: "reading", name: "阅读", mark: "书" },
  { id: "english", name: "英语", mark: "A" },
  { id: "discovery", name: "自由探索", mark: "?" },
];

export const focusDurations = [10, 15, 25];

export const studyRewards = [
  { action: "dance", minutes: 10, label: "跳个舞", mark: "♫" },
  { action: "cheer", minutes: 25, label: "一起欢呼", mark: "★" },
  { action: "rpsGame", minutes: 45, label: "石头剪刀布", mark: "拳" },
  { action: "cardCompare", minutes: 60, label: "卡牌比大小", mark: "牌" },
].map((reward) => ({ ...reward, seconds: reward.minutes * 60 }));

export const studyRewardForAction = (action) => studyRewards.find((reward) => reward.action === action) || null;

export const isStudyRewardUnlocked = (action, totalSeconds = 0) => {
  const reward = studyRewardForAction(action);
  return !reward || Math.max(0, Number(totalSeconds) || 0) >= reward.seconds;
};

export const getNextStudyReward = (totalSeconds = 0) => studyRewards.find((reward) => reward.seconds > (Number(totalSeconds) || 0)) || null;

export const getNewStudyRewards = (beforeSeconds = 0, afterSeconds = 0) => studyRewards.filter((reward) => reward.seconds > beforeSeconds && reward.seconds <= afterSeconds);

export const remainingStudyMinutes = (reward, totalSeconds = 0) => reward
  ? Math.max(1, Math.ceil((reward.seconds - (Number(totalSeconds) || 0)) / 60))
  : 0;

export const formatStudyTotal = (seconds = 0) => {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  if (safeSeconds < 60) return safeSeconds ? "不到 1 分钟" : "0 分钟";
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  if (!hours) return `${Math.floor(safeSeconds / 60)} 分钟`;
  return minutes ? `${hours} 小时 ${minutes} 分钟` : `${hours} 小时`;
};

export const formatCountdown = (seconds = 0) => {
  const safeSeconds = Math.max(0, Math.ceil(Number(seconds) || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
};
