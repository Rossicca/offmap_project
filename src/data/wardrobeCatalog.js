export const defaultAvatarLook = {
  outfit: "sunny",
  pattern: "plain",
  hair: "natural",
  shoes: "cocoa",
  headwear: "none",
  accessory: "scarf",
};

export const wardrobeTabs = [
  { id: "avatar", name: "形象" },
  { id: "outfit", name: "衣服" },
  { id: "pattern", name: "图案" },
  { id: "hair", name: "头发" },
  { id: "shoes", name: "鞋子" },
  { id: "headwear", name: "头饰" },
  { id: "accessory", name: "配饰" },
];

export const wardrobeCatalog = {
  outfit: [
    { id: "sunny", name: "阳光黄", color: "#e5b94c", accent: "#7f9a66" },
    { id: "coral", name: "珊瑚红", color: "#d77b68", accent: "#f0c66d" },
    { id: "sky", name: "晴空蓝", color: "#76aaba", accent: "#e7bd58" },
    { id: "sage", name: "草木绿", color: "#7f9f77", accent: "#e6c677" },
    { id: "grape", name: "葡萄紫", color: "#8f80a3", accent: "#e9c56d" },
    { id: "cream", name: "奶油白", color: "#e8dfc5", accent: "#bb705e" },
  ],
  pattern: [
    { id: "plain", name: "纯色" },
    { id: "stars", name: "小星星" },
    { id: "dots", name: "圆点" },
    { id: "stripes", name: "细条纹" },
    { id: "flowers", name: "四瓣花" },
    { id: "leaves", name: "小树叶" },
  ],
  hair: [
    { id: "natural", name: "原来发色", color: "transparent" },
    { id: "chestnut", name: "栗棕色", color: "#76503b" },
    { id: "darktea", name: "深茶色", color: "#4d4039" },
    { id: "honey", name: "暖蜜色", color: "#a97948" },
  ],
  shoes: [
    { id: "cocoa", name: "可可短靴", color: "#8c6245" },
    { id: "coral", name: "珊瑚球鞋", color: "#c96f62" },
    { id: "blue", name: "灰蓝布鞋", color: "#668fa2" },
    { id: "sage", name: "草绿雨靴", color: "#718d66" },
  ],
  headwear: [
    { id: "none", name: "原来的样子" },
    { id: "headband", name: "彩色发带", color: "#d77b68" },
    { id: "clips", name: "星星发夹", color: "#e7bd58" },
    { id: "beret", name: "小画家帽", color: "#6e9cad" },
  ],
  accessory: [
    { id: "none", name: "不戴配饰" },
    { id: "scarf", name: "探险领巾", color: "#7c9569" },
    { id: "badge", name: "学习徽章", color: "#e7bd58" },
    { id: "glasses", name: "圆圆眼镜", color: "#6d5143" },
    { id: "satchel", name: "故事书包", color: "#a87550" },
    { id: "bow", name: "小蝴蝶结", color: "#cb756c" },
  ],
};

export const wardrobeItem = (slot, id) => wardrobeCatalog[slot].find((item) => item.id === id) || wardrobeCatalog[slot][0];
