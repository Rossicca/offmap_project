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
      { type: "text", text: `分析这幅儿童画中最主要的可动角色。识别人物或动物类别、当前姿态，以及归一化关节坐标（x/y 均为图片宽高的 0 到 1）。儿童画可能夸张或缺少肢体，不确定的节点不要编造。只返回 JSON：{"characterType":"人物|狗|兔子|猫|鸟|马|乌龟|章鱼|其他动物","pose":"姿态描述","confidence":0到1,"joints":[{"name":"关节中文名","x":0.5,"y":0.5,"confidence":0.8}],"movable":["可动部位"],"notes":"简短提示"}` },
    ],
  }], 120_000);
  const joints = Array.isArray(result.joints) ? result.joints.filter((joint) => Number.isFinite(joint.x) && Number.isFinite(joint.y)).map((joint) => ({ name: String(joint.name || "关节"), x: Math.max(0, Math.min(1, joint.x)), y: Math.max(0, Math.min(1, joint.y)), confidence: Math.max(0, Math.min(1, Number(joint.confidence) || 0)) })).slice(0, 24) : [];
  return { characterType: String(result.characterType || "人物"), pose: String(result.pose || "未知姿态"), confidence: Math.max(0, Math.min(1, Number(result.confidence) || 0)), joints, movable: Array.isArray(result.movable) ? result.movable.map(String).slice(0, 16) : [], notes: String(result.notes || "") };
}

createServer(async (request, response) => {
  try {
    if (request.method === "GET" && request.url === "/api/health") return sendJson(response, 200, { ok: true, vision: Boolean(process.env.ARK_VISION_MODEL), chat: Boolean(process.env.ARK_CHAT_MODEL) });
    if (request.method !== "POST") return sendJson(response, 404, { error: "Not found" });
    const body = await readJson(request);
    if (request.url === "/api/chat") return sendJson(response, 200, await handleChat(body));
    if (request.url === "/api/vision/analyze") return sendJson(response, 200, await handleVision(body));
    return sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    console.error(`[api] ${request.method} ${request.url}:`, error.message);
    return sendJson(response, 502, { error: error.message || "服务暂时不可用" });
  }
}).listen(port, "127.0.0.1", () => console.log(`[api] http://127.0.0.1:${port}`));
