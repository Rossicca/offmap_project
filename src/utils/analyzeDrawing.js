import { demoScene } from "../data/demoScene";
import { analyzeAnimalRig, animalRigProfiles } from "../data/animalRigProfiles";

const SPECIES = Object.keys(animalRigProfiles);

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
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(sourceUrl);
      resolve(canvas.toDataURL("image/jpeg", .76));
    };
    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      reject(new Error("这张图片暂时打不开，请换一张试试。"));
    };
    image.src = sourceUrl;
  });
}

async function analyzeWithVision(previewUrl) {
  try {
    const response = await fetch("/api/analyze-drawing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: previewUrl }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data || !data.subject) return null;
    return data;
  } catch (error) {
    console.warn("云端画作识别不可用，使用本地模板。", error);
    return null;
  }
}

function mapVisionToRig(vision) {
  if (vision?.subject === "animal" && SPECIES.includes(vision.species)) {
    return { person: analyzeAnimalRig(vision.species), dog: analyzeAnimalRig("dog") };
  }
  return {
    person: { type: "人物", joints: 10, movable: ["头", "身体", "双臂", "双腿"] },
    dog: analyzeAnimalRig("dog"),
  };
}

export async function analyzeDrawing(image) {
  if (!(image instanceof File) || !image.type.startsWith("image/")) {
    throw new Error("请选择一张图片文件。支持 JPG、PNG、WEBP 或 GIF。 ");
  }

  if (image.size > 12 * 1024 * 1024) {
    throw new Error("图片有点大，请选择 12MB 以内的图片。 ");
  }

  const previewUrl = await createLocalPreview(image);
  const vision = await analyzeWithVision(previewUrl);

  return {
    sceneObjects: demoScene.map((object) => object.type === "person" ? { ...object, avatarId: "uploaded-character" } : { ...object }),
    source: vision ? "vision" : "mock",
    previewUrl,
    rigAnalysis: mapVisionToRig(vision),
    notice: vision ? `识别到：${vision.description}` : "云端识别暂不可用，已用本地模板继续。",
  };
}
