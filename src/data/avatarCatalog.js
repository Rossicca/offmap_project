import characterSprite from "../assets/ai-character-sprite.png";
import explorerMotion from "../assets/explorer-motion.png";
import rabbitMotion from "../assets/rabbit-motion.png";
import robotMotion from "../assets/robot-motion.png";
import heroMotion from "../assets/hero-motion.png";

export const avatarCatalog = [
  {
    id: "explorer",
    name: "小小探险家",
    kind: "人物",
    species: "human",
    spritePosition: "0% 0%",
    motionSprite: explorerMotion,
    colors: { accent: "#f2be38", secondary: "#3e9b62", skin: "#ffd6b1", hair: "#6a3f28" },
    joints: ["头", "身体", "左肩", "左肘", "右肩", "右肘", "左髋", "左膝", "右髋", "右膝"],
  },
  {
    id: "rabbit",
    name: "兔兔伙伴",
    kind: "动物",
    species: "rabbit",
    spritePosition: "100% 0%",
    motionSprite: rabbitMotion,
    colors: { accent: "#ef4b3e", secondary: "#58bde1", skin: "#fff9e9", hair: "#17324d" },
    joints: ["头", "身体", "左耳", "右耳", "左前爪", "右前爪", "左后腿", "右后腿", "尾巴"],
  },
  {
    id: "robot",
    name: "波波机器人",
    kind: "机器人",
    species: "robot",
    spritePosition: "0% 100%",
    motionSprite: robotMotion,
    colors: { accent: "#3e9ad7", secondary: "#82bd48", skin: "#f8f4e8", hair: "#17324d" },
    joints: ["头", "身体", "左肩轴", "左肘轴", "右肩轴", "右肘轴", "左髋轴", "左膝轴", "右髋轴", "右膝轴"],
  },
  {
    id: "hero",
    name: "星星小英雄",
    kind: "人物",
    species: "human",
    spritePosition: "100% 100%",
    motionSprite: heroMotion,
    colors: { accent: "#297ec5", secondary: "#ed4437", skin: "#ffd0a9", hair: "#513325" },
    joints: ["头", "身体", "左肩", "左肘", "右肩", "右肘", "左髋", "左膝", "右髋", "右膝"],
  },
];

export { characterSprite };
