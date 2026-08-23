async function postJson(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "AI 服务暂时不可用");
  return result;
}

export const analyzeDrawingWithArk = (image) => postJson("/api/vision/analyze", { image });
export const chatWithArk = (payload) => postJson("/api/chat", payload);
