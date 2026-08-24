import explorerSkyOutfit from "../assets/explorer-sky-outfit-paper.png";
import explorerFieldOutfit from "../assets/explorer-field-motion-paper.png";
import girlSunshineOutfit from "../assets/girl-sunshine-motion-paper.png";
import girlGrapeOutfit from "../assets/girl-grape-motion-paper.png";

export const defaultAvatarLook = {
  outfit: "original",
};

export const wardrobeTabs = [
  { id: "avatar", name: "形象" },
  { id: "outfit", name: "整套换装" },
];

export const wardrobeCatalog = {
  outfit: [
    { id: "original", name: "角色原装", color: "#e5b94c", accent: "#7f9a66", avatars: ["explorer", "hero", "girl"] },
    { id: "sky-study", name: "晴空学习装", color: "#76aaba", accent: "#d77b68", avatars: ["explorer"], sprite: explorerSkyOutfit, maskWithBase: true },
    { id: "field-study", name: "草木研学装", color: "#7f9f77", accent: "#d77b68", avatars: ["explorer"], sprite: explorerFieldOutfit, paperBlend: true },
    { id: "girl-sunshine", name: "向日葵学习装", color: "#e8bd4f", accent: "#6f88aa", avatars: ["girl"], sprite: girlSunshineOutfit, paperBlend: true },
    { id: "girl-grape", name: "葡萄背带装", color: "#88789b", accent: "#d4a13d", avatars: ["girl"], sprite: girlGrapeOutfit, paperBlend: true },
  ],
};

export const wardrobeItem = (slot, id) => wardrobeCatalog[slot].find((item) => item.id === id) || wardrobeCatalog[slot][0];
