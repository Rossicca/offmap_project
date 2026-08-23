# CLAUDE.md

儿童绘画应用 "My Living Drawing"（React + Vite 纯前端 + 轻量 Node 后端代理）。让孩子上传的画作"活起来"：识别主角 → 绑定关节模板 → 场景动画互动。中文 UI，本地对话规则 + 云端识别。

## 常用命令

- `npm run dev` — 同时启动前端（Vite 5173）和识别后端（`server/`，3001）；Vite 已配置代理 `/api/*`（含 WebSocket 升级）到 3001
- `npm run dev:web` / `npm run dev:api` — 分开启动
- `npm run build` / `npm run preview` — 构建/预览（preview 无 /api 代理，识别自动优雅降级）

## 火山引擎识别（2026-08-23 接入）

架构：浏览器只调同源 `/api/*` → `server/`（Express + ws）→ 火山引擎。API Key 只存在于 `server/.env`（已 gitignore）。

- **画作识别**：`server/vision.js` → 方舟 OpenAI 兼容接口（`https://ark.cn-beijing.volces.com/api/v3`，模型 doubao-1-5-vision-pro-32k-250115，严格 JSON 输出 + 容错重试）。前端 `src/utils/analyzeDrawing.js` 调用后映射到 `animalRigProfiles` 关节模板（识别人物/七种动物）；失败自动降级本地模板并带 notice。
- **语音识别**：`server/asr.js` → 豆包流式 ASR（sauc 协议，`wss://openspeech.bytedance.com/api/v3/sauc/bigmodel_async`；二进制帧 = header(0x11, msgType<<4|flags, 0x10, 0x00) + seq(4B) + size(4B) + payload；鉴权走 X-Api-App-Key / X-Api-Access-Key / X-Api-Resource-Id / X-Api-Connect-Id 四个升级头）。浏览器侧 `src/utils/asrClient.js`（AudioWorklet 16kHz Int16 PCM + 能量 VAD 自动停）↔ 后端桥（处理帧序号/结束帧）↔ 火山；浏览器不支持 AudioWorklet 时回退旧 SpeechRecognition。

### 凭据与开通（见 README「火山引擎配置」）

- 方舟：`ARK_API_KEY`；并在方舟控制台「开通管理」开通 doubao-1-5-vision-pro-32k-250115
- 语音技术：`SPEECH_APP_ID` / `SPEECH_ACCESS_TOKEN`；开通「大模型流式语音识别 2.0」
- `SPEECH_RESOURCE_ID` 默认 `volc.seedasr.sauc.duration`（小时版，按实际资源包改）

### 状态与待办（2026-08-23）

- ✅ 已实现：后端桥（vision REST + ASR WS）、前端两处接入、RigEditor 按识别结果预选模板并显示「小发现」描述、无凭据优雅降级、隐私文案、sw.js 排除 /api、README 配置章节
- ✅ 已验证：`npm run build` 通过；无凭据时视觉 503→前端降级、ASR 提示「语音服务未配置，请联系家长。」；Vite 代理 REST + WS 均连通
- ⬜ 待用户：填 `server/.env`；控制台开通两个服务；实测识别效果与收尾时序
- 🔧 实测调参点：`src/utils/asrClient.js` 顶部 `VAD_RMS` / `SILENCE_CHUNKS` / `MAX_SECONDS` / `FINAL_WAIT_MS`；`server/asr.js` 结束帧后 3s 等待（bigmodel_async 出 final 的时序）
