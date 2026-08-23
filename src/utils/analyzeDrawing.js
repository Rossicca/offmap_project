import { demoScene } from "../data/demoScene";
import { analyzeAnimalRig } from "../data/animalRigProfiles";
import { analyzeDrawingWithArk } from "./api";


function createLocalPreview(file) {
  return new Promise((resolve, reject) => {
    const sourceUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const maxSide = 720;
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      const preserveTransparency = file.type === "image/png";
      if (!preserveTransparency) {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(sourceUrl);
      resolve(preserveTransparency ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", .76));
    };
    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      reject(new Error("这张图片暂时打不开，请换一张试试。"));
    };
    image.src = sourceUrl;
  });
}


export async function analyzeDrawing(image) {
  if (!(image instanceof File) || !image.type.startsWith("image/")) {
    throw new Error("请选择一张图片文件。支持 JPG、PNG、WEBP 或 GIF。 ");
  }


  if (image.size > 12 * 1024 * 1024) {
    throw new Error("图片有点大，请选择 12MB 以内的图片。 ");
  }


  const previewUrl = await createLocalPreview(image);
  let vision = null;
  try {
    vision = await analyzeDrawingWithArk(previewUrl);
  } catch (error) {
    console.warn("Vision API unavailable; using local rig fallback:", error.message);
  }
  const type = vision?.characterType || "人物";
  const movable = vision?.movable?.length ? vision.movable : ["头", "身体", "双臂", "双腿"];
  return {
    sceneObjects: demoScene.map((object) => object.type === "person" ? { ...object, avatarId: "uploaded-character" } : { ...object }),
    source: vision ? "ark-vision" : "mock",
    previewUrl,
    rigAnalysis: {
      person: { type, joints: vision?.joints?.length || 10, movable, nodes: vision?.joints || undefined, pose: vision?.pose, confidence: vision?.confidence, notes: vision?.notes },
      dog: analyzeAnimalRig("dog"),
    },
  };
}


