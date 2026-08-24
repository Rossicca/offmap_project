export async function enhanceDrawing(source, level, { signal } = {}) {
  if (level === "original") return source;
  const response = await fetch("/api/vision/enhance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: source, level }),
    signal,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "豆包暂时没有完成重绘，请稍后再试。");
  if (!result.image?.startsWith("data:image/")) throw new Error("没有收到可用的重绘图片，请重试。");
  return result.image;
}
