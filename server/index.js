import "./env.js";
import express from "express";
import { handleAnalyzeDrawing } from "./vision.js";
import { asrUpgrade } from "./asr.js";

const app = express();
app.use(express.json({ limit: "5mb" }));
app.post("/api/analyze-drawing", handleAnalyzeDrawing);

app.use((error, req, res, next) => {
  console.warn("[api] 未处理错误:", error.message);
  res.status(error.status || 500).json({ error: "server_error", message: "服务暂时不可用，请稍后再试。" });
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`[api] 后端已启动 http://localhost:${PORT}`);
  console.log(`[api] 画作识别: ${process.env.ARK_API_KEY ? "已配置" : "未配置（上传后自动降级为本地模板）"}`);
  console.log(`[api] 语音识别: ${process.env.SPEECH_APP_ID && process.env.SPEECH_ACCESS_TOKEN ? "已配置" : "未配置（语音输入会提示未配置）"}`);
});

server.on("upgrade", (req, socket, head) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  if (pathname === "/api/asr") asrUpgrade(req, socket, head);
  else socket.destroy();
});
