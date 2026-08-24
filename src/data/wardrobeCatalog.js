import explorerSkyOutfit from "../assets/explorer-sky-outfit-paper.png";

export const defaultAvatarLook = {
  outfit: "original",
};

export const wardrobeTabs = [
  { id: "avatar", name: "形象" },
  { id: "outfit", name: "整套换装" },
];

export const wardrobeCatalog = {
  outfit: [
    { id: "original", name: "原始探险装", color: "#e5b94c", accent: "#7f9a66", avatars: ["explorer", "hero"] },
    { id: "sky-study", name: "晴空学习装", color: "#76aaba", accent: "#d77b68", avatars: ["explorer"], sprite: explorerSkyOutfit, maskWithBase: true },
  ],
};

export const wardrobeItem = (slot, id) => wardrobeCatalog[slot].find((item) => item.id === id) || wardrobeCatalog[slot][0];
