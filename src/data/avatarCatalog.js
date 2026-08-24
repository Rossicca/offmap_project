import explorerMotion from "../assets/explorer-motion-paper.png";
import rabbitMotion from "../assets/rabbit-motion-paper.png";
import heroMotion from "../assets/hero-motion-paper.png";

export const avatarCatalog = [
  {
    id: "explorer",
    name: "小小探险家",
    kind: "人物",
    species: "human",
    gender: "男生",
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
    id: "hero",
    name: "星星男孩",
    kind: "人物",
    species: "human",
    gender: "男生",
    spritePosition: "100% 100%",
    motionSprite: heroMotion,
    colors: { accent: "#297ec5", secondary: "#ed4437", skin: "#ffd0a9", hair: "#513325" },
    joints: ["头", "身体", "左肩", "左肘", "右肩", "右肘", "左髋", "左膝", "右髋", "右膝"],
  },
];

export const primaryAvatarCatalog = avatarCatalog.filter((avatar) => avatar.species === "human");
