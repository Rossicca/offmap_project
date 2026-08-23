import OpenAI from "openai";

const DEFAULT_MODEL = "doubao-1-5-vision-pro-32k-250115";
const FALLBACK = { subject: "unclear", species: null, description: "画得真棒！" };
const SUBJECTS = new Set(["person", "animal", "object", "unclear"]);
const SPECIES = new Set(["dog", "cat", "rabbit", "bird", "horse", "turtle", "octopus"]);

const SYSTEM_PROMPT = `你是一个儿童画识别助手。孩子画里只有一位主角，请识别主角是什么，并给孩子一句鼓励。只返回一个 JSON 对象，不要输出 JSON 以外的任何文字。JSON 格式：{"subject":"person"|"animal"|"object"|"unclear","species":"dog"|"cat"|"rabbit"|"bird"|"horse"|"turtle"|"octopus"|null,"description":"不超过30个字的儿童友好中文描述"}。规则：1. subject 只能是 person、animal、object、unclear 之一；2. 只有 subject 是 animal 时 species 才能填值，并且只能是列出的七种之一，实在无法判断时填 null；3. 其他情况下 species 必须为 null；4. description 用孩子能看懂的话夸奖这幅画，例如"画得真棒，太阳在微笑！"。`;

function normalize(raw) {
  try {
    const cleaned = String(raw).replace(/```(?:json)?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const subject = SUBJECTS.has(parsed?.subject) ? parsed.subject : FALLBACK.subject;
    const species = subject === "animal" && SPECIES.has(parsed?.species) ? parsed.species : null;
    const description = typeof parsed?.description === "string" && parsed.description.trim()
      ? parsed.description.trim().slice(0, 60)
      : FALLBACK.description;
    return { subject, species, description };
  } catch {
    return { ...FALLBACK };
  }
}

export async function handleAnalyzeDrawing(req, res) {
  if (!process.env.ARK_API_KEY) {
    return res.status(503).json({ error: "not_configured", message: "画作识别服务未配置" });
  }
  const image = req.body?.image;
  if (typeof image !== "string" || !image.startsWith("data:image/")) {
    return res.status(400).json({ error: "bad_image", message: "图片格式不正确" });
  }
  if (image.length * 0.75 > 10 * 1024 * 1024) {
    return res.status(400).json({ error: "image_too_large", message: "图片过大，请换一张试试。" });
  }

  const client = new OpenAI({
    apiKey: process.env.ARK_API_KEY,
    baseURL: "https://ark.cn-beijing.volces.com/api/v3",
    timeout: 30_000,
  });
  const model = process.env.ARK_VISION_MODEL || DEFAULT_MODEL;
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: [
      { type: "text", text: "请识别这幅儿童画。" },
      { type: "image_url", image_url: { url: image } },
    ] },
  ];

  try {
    const response = await client.chat.completions.create({
      model,
      temperature: 0.2,
      max_tokens: 300,
      response_format: { type: "json_object" },
      messages,
    });
    return res.json(normalize(response.choices?.[0]?.message?.content));
  } catch (error) {
    if (error?.status === 400 && error?.message?.includes("response_format")) {
      // 部分接入点对 response_format 返回 400，去掉后重试一次。
      try {
        const retry = await client.chat.completions.create({ model, temperature: 0.2, max_tokens: 300, messages });
        return res.json(normalize(retry.choices?.[0]?.message?.content));
      } catch (retryError) {
        console.warn("[vision] 重试失败:", retryError.status ?? retryError.message);
      }
    } else {
      console.warn("[vision] 识别失败:", error.status ?? error.message);
    }
    return res.status(502).json({ error: "vision_failed", message: "画作识别服务暂时不可用" });
  }
}
