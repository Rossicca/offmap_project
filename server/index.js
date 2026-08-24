import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";

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

const port = Number(process.env.PORT || process.env.API_PORT || 8787);
const host = process.env.HOST || "127.0.0.1";
const baseUrl = (process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3").replace(/\/$/, "");
const imageModel = process.env.ARK_IMAGE_MODEL || "doubao-seedream-4-0-250828";
const staticRoot = resolve("dist");
const immutableAssetRoot = resolve(staticRoot, "assets");
const staticMimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".wasm": "application/wasm",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".webp": "image/webp",
};

function getBeijingClock(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return {
    dateText: `${parts.year}年${Number(parts.month)}月${Number(parts.day)}日${parts.weekday}`,
    timeText: `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`,
  };
}

function createClockReply(text) {
  const clock = getBeijingClock();
  if (/(今天|现在|当前).*(几月几号|日期|星期几|周几)|今天是/.test(text)) {
    return { text: `今天是${clock.dateText}。`, target: null, action: null, suggestions: ["现在几点？", "今天学什么？", "我们去冒险吧"], learning: null };
  }
  if (/(现在|当前).*(几点|时间)|几点了/.test(text)) {
    return { text: `现在北京时间是 ${clock.timeText}。`, target: null, action: null, suggestions: ["今天是几号？", "陪我学习", "我们去冒险吧"], learning: null };
  }
  return null;
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(payload));
}

function sendStatic(request, response) {
  if (!existsSync(staticRoot)) {
    return sendJson(response, 503, { error: "前端尚未构建，请先运行 npm run build" });
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    return sendJson(response, 400, { error: "无效请求地址" });
  }
  const relativePath = pathname.replace(/^\/+/, "") || "index.html";
  let filePath = resolve(staticRoot, relativePath);
  if (filePath !== staticRoot && !filePath.startsWith(`${staticRoot}${sep}`)) return sendJson(response, 403, { error: "Forbidden" });
  if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = resolve(filePath, "index.html");
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    if (extname(relativePath)) return sendJson(response, 404, { error: "Not found" });
    filePath = resolve(staticRoot, "index.html");
  }
  const extension = extname(filePath).toLowerCase();
  const immutableAsset = filePath.startsWith(`${immutableAssetRoot}${sep}`);
  response.writeHead(200, {
    "Content-Type": staticMimeTypes[extension] || "application/octet-stream",
    "Cache-Control": immutableAsset ? "public, max-age=31536000, immutable" : "no-cache",
  });
  if (request.method === "HEAD") return response.end();
  createReadStream(filePath).pipe(response);
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
  const sources = fenced ? [fenced, text] : [text];
  for (const source of sources) {
    for (let start = source.indexOf("{"); start >= 0; start = source.indexOf("{", start + 1)) {
      let depth = 0;
      let inString = false;
      let escaped = false;
      for (let index = start; index < source.length; index += 1) {
        const character = source[index];
        if (inString) {
          if (escaped) escaped = false;
          else if (character === "\\") escaped = true;
          else if (character === "\"") inString = false;
          continue;
        }
        if (character === "\"") inString = true;
        else if (character === "{") depth += 1;
        else if (character === "}") {
          depth -= 1;
          if (depth === 0) {
            try { return JSON.parse(source.slice(start, index + 1)); }
            catch { break; }
          }
        }
      }
    }
  }
  throw new Error("方舟返回的 JSON 格式不正确");
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
  const targetObject = target ? sceneObjects.find((object) => object.id === target) : null;
  const action = targetObject?.actions?.includes(reply.action) ? reply.action : null;
  return {
    text: String(reply.reply || reply.text || "我听见啦！").slice(0, 300),
    target,
    action,
    suggestions: Array.isArray(reply.suggestions) ? reply.suggestions.map((suggestion) => String(suggestion).slice(0, 18)).slice(0, 3) : [],
    learning: reply.learning && typeof reply.learning === "object" ? {
      mode: ["quiz", "hint", "explain", "encourage", "chat"].includes(reply.learning.mode) ? reply.learning.mode : "chat",
      result: ["correct", "try-again", "neutral"].includes(reply.learning.result) ? reply.learning.result : "neutral",
      progressDelta: reply.learning.result === "correct" && reply.learning.progressDelta === 1 ? 1 : 0,
      topic: ["math", "reading", "english", "discovery"].includes(reply.learning.topic) ? reply.learning.topic : undefined,
      expectedAnswer: typeof reply.learning.expectedAnswer === "string" ? reply.learning.expectedAnswer.slice(0, 40) : undefined,
    } : null,
  };
}

function inferRequestedSceneAction(userText, currentSceneId, sceneObjects) {
  const people = sceneObjects.filter((object) => object.type === "person" && Array.isArray(object.actions));
  const person = people[0];
  if (!person) return null;
  const supports = (action) => person.actions.includes(action) ? { target: person.id, action } : null;
  const wantsRoom = /(?:去|进|回|到|进入).{0,8}(?:房间|屋里|屋内)|(?:房间|屋里|屋内).{0,8}(?:读书|学习|休息|睡觉|画画|创作|做作业)/.test(userText);
  const wantsOutdoor = /(?:去|到|回|走到).{0,8}(?:室外|户外|外面|屋外)|(?:出去|出门).{0,8}(?:玩|走走|活动)?/.test(userText);
  if (currentSceneId === "outdoor" && wantsRoom) return supports("enterRoom");
  if (currentSceneId === "room" && wantsOutdoor) return supports("leaveRoom");
  if (currentSceneId === "room" && /(?:读书|学习|复习|做题|写作业)/.test(userText)) return supports("study");
  if (currentSceneId === "room" && /(?:画画|创作|做手工|写故事)/.test(userText)) return supports("work");
  if (currentSceneId === "room" && /(?:休息|睡觉|躺一会|歇一会)/.test(userText)) return supports("rest");
  if (currentSceneId === "outdoor" && /(?:一起玩|去玩|玩游戏|做游戏|活动一下)/.test(userText)) return supports("play");
  return null;
}

function createRealtimeCapabilityReply(text) {
  const asksCurrentWeather = /(?:今天|现在|当前|明天|实时).{0,12}(?:天气|气温|温度|下雨|降雨|风力)|(?:天气|气温|温度|降雨|风力).{0,12}(?:怎么样|如何|多少|吗|预报)/.test(text);
  if (!asksCurrentWeather) return null;
  return {
    text: "我目前没有接入实时天气数据，所以不能可靠地告诉你当前天气。请查看手机或电脑的天气应用，再把结果告诉我，我们可以一起决定适合室内还是室外活动。",
    target: null,
    action: null,
    suggestions: ["我查到天气了", "安排室内活动", "安排室外活动"],
    learning: null,
  };
}

function buildChatSystemPrompt({ body, clock, actionList, currentSceneId }) {
  return `你是互动绘画里的陪伴型 AI 伙伴${body.name ? `“${body.name}”` : ""}，既要像日常 AI 一样真正回答问题，也要让画中世界自然参与。

当前北京时间：${clock.dateText} ${clock.timeText}。当前场景：${currentSceneId === "room" ? "房间" : "室外"}。当前学习状态：${JSON.stringify(body.learningState || {})}。

回答原则：
1. 普通常识、解释、计算或日常问题，先用 1 至 3 句给出清楚、正确的核心答案，再加一句可选的观察、小游戏或场景互动。除非用户明确说“考考我、让我猜、只给提示、先别说答案”，否则不得只反问、只鼓励猜测或故意不回答。
2. 只有用户明确进入做题、提示或复习时，才采用“先尝试、再提示、最后解释”的学习顺序；普通聊天的 learning 必须为 null。
3. 情绪陪伴要先承认具体感受，再给一个很小、能做到的下一步。不要说“根本不算什么”“没什么大不了”，不要夸张安慰，也不要使用亲吻、暧昧或过量 emoji。
4. 语气温暖、有趣但自然，不要每句都卖萌，不要连续使用波浪号。故事可以有画面感，控制在约 60 至 140 个汉字。
5. 可以在回答中选择一个真实场景动作增强互动，但动作必须来自对应对象的 actions。用户要求动作时优先执行；只是问知识时可不强行动作。
6. 一次只能返回一个动作。当前在室外时，用户要求去房间读书、学习、休息或创作，应先对人物使用 enterRoom；当前在房间时再用 study、work 或 rest。当前在房间而用户要出去玩，应先用 leaveRoom；室外可用 play。
7. 涉及今天、明天、星期或时间必须以上面的北京时间为准，不得声称无法获取当前日期。你没有实时天气、新闻或联网搜索能力时要如实说明，但仍可告诉用户如何查看。
8. 不询问或复述姓名、学校、住址、电话、账号和联系方式等个人信息。

场景对象及允许动作：${JSON.stringify(actionList)}。

必须只返回 JSON：{"reply":"中文回复","target":"对象id或null","action":"动作或null","suggestions":["短建议1","短建议2","短建议3"],"learning":null或{"mode":"quiz|hint|explain|encourage|chat","result":"correct|try-again|neutral","progressDelta":0或1,"topic":"math|reading|english|discovery","expectedAnswer":"当前小题答案或空字符串"}}。`;
}

async function handleChat(body) {
  const sceneObjects = Array.isArray(body.sceneObjects) ? body.sceneObjects : [];
  const userText = String(body.text || "").slice(0, 300);
  const clockReply = createClockReply(userText);
  if (clockReply) return clockReply;
  const realtimeCapabilityReply = createRealtimeCapabilityReply(userText);
  if (realtimeCapabilityReply) return realtimeCapabilityReply;
  const clock = getBeijingClock();
  const currentSceneId = body.currentSceneId === "room" ? "room" : "outdoor";
  const actionList = sceneObjects.map(({ id, type, label, actions }) => ({ id, type, label, actions }));
  const reply = await callArk(process.env.ARK_CHAT_MODEL, [
    { role: "system", content: buildChatSystemPrompt({ body, clock, actionList, currentSceneId }) },
    ...(Array.isArray(body.history) ? body.history.slice(-8).map(({ role, text }) => ({ role, content: String(text || "").slice(0, 300) })) : []),
    { role: "user", content: userText },
  ]);
  const normalized = normalizeChat(reply, sceneObjects);
  const requestedSceneAction = inferRequestedSceneAction(userText, currentSceneId, sceneObjects);
  return requestedSceneAction ? { ...normalized, ...requestedSceneAction } : normalized;
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
    if (["GET", "HEAD"].includes(request.method) && !request.url.startsWith("/api/")) return sendStatic(request, response);
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
}).listen(port, host, () => console.log(`[app] http://${host}:${port}`));
