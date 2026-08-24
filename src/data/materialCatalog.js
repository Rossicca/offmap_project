const makeItems = (category, names, colors) => names.map((name, index) => ({
  id: `${category}-${index + 1}`,
  category,
  name,
  variant: index % 6,
  color: colors[index % colors.length],
  accent: colors[(index + 2) % colors.length],
}));

const pencilColors = ["#e88a72", "#e7bd58", "#75ad87", "#6da9bd", "#9685b5", "#c8799a"];

export const materialCategories = [
  { id: "character", name: "伙伴", shortName: "伙伴" },
  { id: "background", name: "背景", shortName: "背景" },
  { id: "nature", name: "草地自然", shortName: "自然" },
  { id: "prop", name: "家具与摆件", shortName: "摆件" },
];

export const materialCatalog = [
  { id: "character-explorer", category: "character", name: "探险男孩", variant: 0, motionSprite: explorerMotion, frame: "0% 0%" },
  { id: "character-hero", category: "character", name: "星星女孩", variant: 1, motionSprite: heroMotion, frame: "0% 0%" },
  { id: "character-rabbit", category: "character", name: "兔兔朋友", variant: 2, motionSprite: rabbitMotion, frame: "0% 0%" },
  { id: "character-dog", category: "character", name: "小狗伙伴", variant: 3, motionSprite: dogMotion, frame: "0% 0%" },
  ...makeItems("background", ["晴天草坡", "森林小路", "海边沙滩", "星空营地", "雨后彩虹", "秋日公园", "雪地木屋", "花园午后", "山谷日出", "月亮湖边"], ["#b9d8e4", "#bed7a3", "#e7c98c", "#8c94bd", "#d5b8d8"]),
  ...makeItems("nature", ["小草丛", "蒲公英", "向日葵", "蘑菇堆", "圆石头", "小池塘", "灌木球", "落叶堆"], ["#78a56e", "#d5b44b", "#d98763", "#7998ad"]),
  ...makeItems("prop", ["野餐篮", "小风筝", "故事书", "画板", "小帐篷", "玩具船", "气球束", "路牌", "小灯笼", "音乐盒"], pencilColors),
];

export const materialCount = materialCatalog.length;

const housePalettes = [
  { name: "草莓", wall: "#f7cfcb", roof: "#c95f60", door: "#98594f", trim: "#fff2dc" },
  { name: "柠檬", wall: "#f3dfa2", roof: "#d58a4b", door: "#8d624b", trim: "#fff9da" },
  { name: "薄荷", wall: "#c9dfc5", roof: "#6d927e", door: "#79614d", trim: "#eef7df" },
  { name: "海风", wall: "#bedde4", roof: "#668ca5", door: "#765d59", trim: "#edf8f5" },
  { name: "葡萄", wall: "#d8cce3", roof: "#83739c", door: "#74566b", trim: "#f8eff4" },
  { name: "桃子", wall: "#f5d0ae", roof: "#c47769", door: "#8c5a4c", trim: "#fff0dc" },
];

const housePatterns = [
  { name: "小圆点", pattern: "dots" },
  { name: "糖果条", pattern: "stripes" },
  { name: "小方格", pattern: "checks" },
  { name: "花瓣印", pattern: "petals" },
  { name: "小星星", pattern: "stars" },
];

const houseAccents = [
  { name: "白窗框", accent: "#fffaf0" },
  { name: "蓝窗框", accent: "#8dbbc5" },
  { name: "绿窗框", accent: "#88a77d" },
  { name: "红窗框", accent: "#c87970" },
];

export const houseDecorCatalog = housePalettes.flatMap((palette, paletteIndex) => housePatterns.flatMap((motif, motifIndex) => houseAccents.map((accent, accentIndex) => ({
  id: `house-${paletteIndex + 1}-${motifIndex + 1}-${accentIndex + 1}`,
  name: `${palette.name}${motif.name} · ${accent.name.replace("窗框", "窗")}`,
  group: motif.pattern,
  wall: palette.wall,
  roof: palette.roof,
  door: palette.door,
  trim: palette.trim,
  accent: accent.accent,
  accentName: accent.name,
  pattern: motif.pattern,
}))));

export const houseDecorCount = houseDecorCatalog.length;

export const defaultHouseDecor = houseDecorCatalog[0];

export const backgroundStyleFor = (item) => item ? {
  "--library-sky": item.color,
  "--library-ground": item.accent,
  "--library-sun": pencilColors[(item.variant + 1) % pencilColors.length],
} : undefined;
import explorerMotion from "../assets/explorer-motion-paper.png";
import heroMotion from "../assets/hero-motion-paper.png";
import rabbitMotion from "../assets/rabbit-motion-paper.png";
import dogMotion from "../assets/dog-motion-paper.png";
