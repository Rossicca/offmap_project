import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadLocalEnv() {
  try {
    const source = readFileSync(resolve(".env.local"), "utf8");
    for (const line of source.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].trim();
    }
  } catch {
    // Production environments can provide variables directly.
  }
}

loadLocalEnv();

const port = Number(process.env.API_PORT || 8787);
const baseUrl = (process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3").replace(/\/$/, "");
const imageModel = process.env.ARK_IMAGE_MODEL || "doubao-seedream-4-0-250828";
const allowedActions = new Set(["wave", "jump", "eat", "dance", "spin", "cheer", "rest", "openDoor", "closeDoor", "sunset", "sunrise", "shake", "move", "feed"]);

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 10 * 1024 * 1024) throw new Error("请求内容过大");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced || text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  return JSON.parse(candidate);
}

async function callArk(model, messages, timeoutMs = 45_000) {
  if (!process.env.ARK_API_KEY) throw new Error("后端尚未配置 ARK_API_KEY");
  if (!model) throw new Error("后端尚未配置模型 Endpoint ID");
  const upstream = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.ARK_API_KEY}` },
    body: JSON.stringify({ model, messages, temperature: 0.2, response_format: { type: "json_object" } }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const result = await upstream.json().catch(() => ({}));
  if (!upstream.ok) throw new Error(result?.error?.message || `方舟请求失败（${upstream.status}）`);
  const content = result?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("方舟没有返回可解析的内容");
  return extractJson(content);
}

const artworkPrompts = {
  light: "在严格保留原画角色数量、姿势、轮廓、构图和童真手绘感的前提下润色这幅画。修顺线条，补全自然的五官与肢体连接，清理纸面杂点，加入克制协调的颜色。不要改变角色身份，不增加角色，不改变动作，纯净浅色背景，输出单张完整插画。",
  medium: "把这幅画重绘成精致、温暖的二维儿童绘本卡通插画。必须保留原画的角色数量、核心外形、姿势和画面位置，修正不自然的比例，补全清晰五官、服装和肢体细节，使用柔和手绘线条与协调彩铅色彩。不要添加文字、边框或新角色，输出单张完整插画。",
  strong: "以原画为角色设计草图，重绘成完成度很高、可用于动画的可爱原创卡通角色。保留角色数量、核心概念、姿势、朝向和构图，让造型更有辨识度，完善五官、发型或动物特征、服装、鞋子、肢体结构、配色和轻柔阴影。不要写实，不添加文字、边框或新角色，干净浅色背景，输出单张完整插画。",
};

const projectArtworkStyle = "统一为本项目的温暖二维手绘绘本风格：暖白纸张底色，清晰但略带手绘抖动的石墨轮廓，彩铅和蜡笔质感，珊瑚红、芥末黄、鼠尾草绿、灰蓝与可可棕的低饱和配色。画面只保留主体需要的内容，背景干净。禁止照片写实、塑料3D、霓虹高饱和、企业扁平矢量、文字、水印、边框、灰色放大人物或云朵轮廓、重复主体和无关装饰。";

async function handleArtworkEnhancement(body, clientSignal) {
  const imageMatch = typeof body.image === "string" && body.image.match(/^data:image\/(png|jpeg|webp|gif);base64,([a-z0-9+/=\r\n]+)$/i);
  if (!imageMatch) throw new Error("缺少有效原画");
  if (Buffer.byteLength(imageMatch[2], "base64") > 6 * 1024 * 1024) throw new Error("处理后的原画不能超过 6MB");
  const levelPrompt = artworkPrompts[body.level];
  if (!levelPrompt) throw new Error("请选择轻度、中度或重度");
  const styleLock = body.styleLock !== false;
  const prompt = styleLock
    ? `必须严格遵守以下项目风格规范，不得偏离：${projectArtworkStyle}\n${levelPrompt}`
    : `以以下项目风格作为优先参考，但允许保留原作更明显的个人笔触：${projectArtworkStyle}\n${levelPrompt}`;
  if (!process.env.ARK_API_KEY) throw new Error("后端尚未配置 ARK_API_KEY");
  const upstream = await fetch(`${baseUrl}/images/generations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.ARK_API_KEY}` },
    body: JSON.stringify({ model: imageModel, prompt, image: body.image, size: "2K", sequential_image_generation: "disabled", response_format: "b64_json", watermark: false }),
    signal: AbortSignal.any([clientSignal, AbortSignal.timeout(180_000)]),
  });
  const result = await upstream.json().catch(() => ({}));
  if (!upstream.ok) throw new Error(result?.error?.message || `豆包图片生成失败（${upstream.status}）`);
  const output = result?.data?.[0];
  if (output?.b64_json) {
    if (typeof output.b64_json !== "string" || Buffer.byteLength(output.b64_json, "base64") > 12 * 1024 * 1024) throw new Error("豆包返回的图片过大，请换一个强度重试");
    return { image: `data:image/png;base64,${output.b64_json}`, model: result.model || imageModel };
  }
  if (output?.url) {
    const generated = await fetch(output.url, { signal: AbortSignal.any([clientSignal, AbortSignal.timeout(60_000)]) });
    if (!generated.ok) throw new Error("豆包已完成重绘，但结果图片下载失败");
    const mime = generated.headers.get("content-type") || "";
    if (!mime.startsWith("image/")) throw new Error("豆包返回的结果不是有效图片");
    const declaredSize = Number(generated.headers.get("content-length") || 0);
    if (declaredSize > 12 * 1024 * 1024) throw new Error("豆包返回的图片过大，请换一个强度重试");
    const bytes = Buffer.from(await generated.arrayBuffer());
    if (bytes.length > 12 * 1024 * 1024) throw new Error("豆包返回的图片过大，请换一个强度重试");
    const encoded = bytes.toString("base64");
    return { image: `data:${mime};base64,${encoded}`, model: result.model || imageModel };
  }
  throw new Error("豆包没有返回可用的重绘图片");
}

function normalizeChat(reply, sceneObjects) {
  const validTargets = new Set(sceneObjects.map((object) => object.id));
  const target = validTargets.has(reply.target) ? reply.target : null;
  const action = target && allowedActions.has(reply.action) ? reply.action : null;
  return {
    text: String(reply.reply || reply.text || "我听见啦！").slice(0, 300),
    target,
    action,
    suggestions: Array.isArray(reply.suggestions) ? reply.suggestions.map(String).slice(0, 3) : [],
  };
}

async function handleChat(body) {
  const sceneObjects = Array.isArray(body.sceneObjects) ? body.sceneObjects : [];
  const actionList = sceneObjects.map(({ id, type, label, actions }) => ({ id, type, label, actions }));
  const reply = await callArk(process.env.ARK_CHAT_MODEL, [
    { role: "system", content: `你是儿童互动绘画里的友好角色${body.name ? `“${body.name}”` : ""}。回答温暖、简短、安全，不询问个人信息。只能从给定场景对象及其 actions 中选择动作。必须只返回 JSON：{"reply":"中文回复","target":"对象id或null","action":"动作或null","suggestions":["建议1","建议2","建议3"]}。场景：${JSON.stringify(actionList)}` },
    ...(Array.isArray(body.history) ? body.history.slice(-8).map(({ role, text }) => ({ role, content: String(text || "").slice(0, 300) })) : []),
    { role: "user", content: String(body.text || "").slice(0, 300) },
  ]);
  return normalizeChat(reply, sceneObjects);
}

async function handleVision(body) {
  if (typeof body.image !== "string" || !body.image.startsWith("data:image/")) throw new Error("缺少有效图片");
  const result = await callArk(process.env.ARK_VISION_MODEL, [{
    role: "user",
    content: [
      { type: "image_url", image_url: { url: body.image } },
      { type: "text", text: `分析图片中最主要的单个可动角色，忽略背景和其他次要对象。识别人物或动物类别、当前姿态，并把关节坐标精确放在可见身体关节中心。人物优先返回：头部中心、身体中心、左肩、左肘、左手腕、右肩、右肘、右手腕、左髋、左膝、左脚踝、右髋、右膝、右脚踝；动物返回头、躯干和各肢体关键节点。x/y 必须相对完整图片宽高归一化为 0 到 1，左上角是 (0,0)，右下角是 (1,1)。不确定或不可见的节点不要编造。只返回 JSON：{"characterType":"人物|狗|兔子|猫|鸟|马|乌龟|章鱼|其他动物","pose":"姿态描述","confidence":0到1,"joints":[{"name":"关节中文名","x":0.5,"y":0.5,"confidence":0.8}],"movable":["可动部位"],"notes":"简短提示"}` },
    ],
  }], 120_000);
  let joints = Array.isArray(result.joints) ? result.joints.filter((joint) => Number.isFinite(joint.x) && Number.isFinite(joint.y)).map((joint) => ({ name: String(joint.name || "关节"), x: Math.max(0, Math.min(1, joint.x)), y: Math.max(0, Math.min(1, joint.y)), confidence: Math.max(0, Math.min(1, Number(joint.confidence) || 0)) })).slice(0, 32) : [];
  if (String(result.characterType || "").includes("人物")) {
    const standardJoints = [
      ["头部", /头/], ["身体中心", /身体中心|躯干|胸/],
      ["左肩", /左肩/], ["左肘", /左肘/], ["左手腕", /左手腕|左腕|左手/],
      ["右肩", /右肩/], ["右肘", /右肘/], ["右手腕", /右手腕|右腕|右手/],
      ["左髋", /左髋|左胯/], ["左膝", /左膝/], ["左脚踝", /左脚踝|左踝|左脚/],
      ["右髋", /右髋|右胯/], ["右膝", /右膝/], ["右脚踝", /右脚踝|右踝|右脚/],
    ];
    const normalized = standardJoints.map(([name, pattern]) => {
      const match = joints.find((joint) => pattern.test(joint.name));
      return match ? { ...match, name } : null;
    }).filter(Boolean);
    if (normalized.length >= 6) joints = normalized;
  }
  return { characterType: String(result.characterType || "人物"), pose: String(result.pose || "未知姿态"), confidence: Math.max(0, Math.min(1, Number(result.confidence) || 0)), joints, movable: Array.isArray(result.movable) ? result.movable.map(String).slice(0, 16) : [], notes: String(result.notes || "") };
}

createServer(async (request, response) => {
  try {
    if (request.method === "GET" && request.url === "/api/health") return sendJson(response, 200, { ok: true, vision: Boolean(process.env.ARK_VISION_MODEL), chat: Boolean(process.env.ARK_CHAT_MODEL), image: Boolean(imageModel) });
    if (request.method !== "POST") return sendJson(response, 404, { error: "Not found" });
    const body = await readJson(request);
    if (request.url === "/api/chat") return sendJson(response, 200, await handleChat(body));
    if (request.url === "/api/vision/analyze") return sendJson(response, 200, await handleVision(body));
    if (request.url === "/api/vision/enhance") {
      const clientController = new AbortController();
      const abortUpstream = () => clientController.abort();
      request.once("aborted", abortUpstream);
      response.once("close", () => { if (!response.writableEnded) abortUpstream(); });
      return sendJson(response, 200, await handleArtworkEnhancement(body, clientController.signal));
    }
    return sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    if (response.destroyed || response.writableEnded) return;
    console.error(`[api] ${request.method} ${request.url}:`, error.message);
    return sendJson(response, 502, { error: error.message || "服务暂时不可用" });
  }
}).listen(port, "127.0.0.1", () => console.log(`[api] http://127.0.0.1:${port}`));
