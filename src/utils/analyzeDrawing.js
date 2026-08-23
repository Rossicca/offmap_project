import { demoScene } from "../data/demoScene";
import { analyzeAnimalRig } from "../data/animalRigProfiles";

export async function analyzeDrawing(image) {
  if (!(image instanceof File) || !image.type.startsWith("image/")) {
    throw new Error("请选择一张图片文件。支持 JPG、PNG、WEBP 或 GIF。 ");
  }

  if (image.size > 12 * 1024 * 1024) {
    throw new Error("图片有点大，请选择 12MB 以内的图片。 ");
  }

  // Demo fallback: keep this boundary stable so a real Vision API can replace it later.
  await new Promise((resolve) => window.setTimeout(resolve, 850));
  return {
    sceneObjects: demoScene.map((object) => object.type === "person" ? { ...object, avatarId: "explorer" } : { ...object }),
    source: "mock",
    previewUrl: URL.createObjectURL(image),
    rigAnalysis: {
      person: { type: "人物", joints: 10, movable: ["头", "身体", "双臂", "双腿"] },
      dog: analyzeAnimalRig("dog"),
    },
  };
}
