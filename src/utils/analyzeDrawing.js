import { demoScene } from "../data/demoScene";
import { analyzeAnimalRig } from "../data/animalRigProfiles";
import { analyzeDrawingWithArk } from "./api";


function createLocalPreview(file) {
  return new Promise((resolve, reject) => {
    const sourceUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      // Keep enough line and color detail for joint placement and foreground matting.
      const maxSide = 1440;
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
      resolve({
        url: preserveTransparency ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", .84),
        size: { width: canvas.width, height: canvas.height },
      });
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


  const preview = await createLocalPreview(image);
  let vision;
  let visionError = "";
  try {
    vision = await analyzeDrawingWithArk(preview.url);
  } catch (error) {
    // A temporary model/network failure should not block the child from
    // continuing. RigEditor can start from a draggable local template.
    visionError = error.message || "视觉模型暂时不可用";
    console.warn("关节自动识别暂时不可用，改用可调节模板：", visionError);
    vision = { characterType: "人物", joints: [], movable: [], confidence: 0 };
  }
  const detectedNodes = vision.joints?.length >= 6 ? vision.joints.map((joint) => ({
    label: joint.name || "关节",
    x: Math.max(2, Math.min(98, Number(joint.x) * (Number(joint.x) <= 1 ? 100 : 1))),
    y: Math.max(2, Math.min(98, Number(joint.y) * (Number(joint.y) <= 1 ? 100 : 1))),
    confidence: Number(joint.confidence) || 0,
  })) : undefined;
  const type = vision.characterType || "人物";
  const movable = vision.movable?.length ? vision.movable : detectedNodes?.map((node) => node.label) || [];
  const usedTemplateFallback = !detectedNodes;
  return {
    sceneObjects: demoScene.map((object) => object.type === "person" ? { ...object, avatarId: "uploaded-character" } : { ...object }),
    source: "ark-vision",
    previewUrl: preview.url,
    imageSize: preview.size,
    rigAnalysis: {
      person: {
        type,
        joints: detectedNodes?.length || 0,
        movable,
        nodes: detectedNodes,
        pose: vision.pose,
        confidence: vision.confidence,
        notes: usedTemplateFallback
          ? `自动识别没有得到足够关节点，已经加载可拖动模板。${visionError ? `原因：${visionError}` : "请把红点拖到正确位置。"}`
          : vision.notes,
        source: usedTemplateFallback ? "local-template-fallback" : "ark-vision",
      },
      dog: analyzeAnimalRig("dog"),
    },
  };
}

