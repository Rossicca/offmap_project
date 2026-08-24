export const growthLevels = [
  { level: 1, minXp: 0, title: "初次见面", reward: "一起聊天、挥手和探索世界" },
  { level: 2, minXp: 25, title: "默契伙伴", reward: "获得「认真起步」成长贴纸" },
  { level: 3, minXp: 60, title: "学习搭档", reward: "获得「好奇探险家」称号" },
  { level: 4, minXp: 110, title: "故事伙伴", reward: "获得「一起完成故事」纪念章" },
  { level: 5, minXp: 180, title: "成长之星", reward: "点亮最高等级成长标记" },
];

export const defaultAvatarGrowth = {
  totalXp: 0,
  earnedEvents: {},
};

export function getGrowthProgress(growth = defaultAvatarGrowth) {
  const totalXp = Math.max(0, Number(growth.totalXp) || 0);
  const current = [...growthLevels].reverse().find((item) => totalXp >= item.minXp) || growthLevels[0];
  const next = growthLevels.find((item) => item.level === current.level + 1) || null;
  const span = next ? next.minXp - current.minXp : 1;
  const progress = next ? Math.max(0, Math.min(1, (totalXp - current.minXp) / span)) : 1;
  return { totalXp, current, next, progress, xpToNext: next ? Math.max(0, next.minXp - totalXp) : 0 };
}

export function awardGrowth(growth, eventId, xp) {
  const current = { ...defaultAvatarGrowth, ...growth, earnedEvents: { ...(growth?.earnedEvents || {}) } };
  if (!eventId || current.earnedEvents[eventId]) return { growth: current, awarded: 0, leveledUp: false };
  const before = getGrowthProgress(current);
  const next = {
    ...current,
    totalXp: current.totalXp + xp,
    earnedEvents: { ...current.earnedEvents, [eventId]: true },
  };
  const after = getGrowthProgress(next);
  return { growth: next, awarded: xp, leveledUp: after.current.level > before.current.level };
}
