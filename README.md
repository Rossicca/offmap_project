# My Living Drawing

让孩子画出来的世界活起来。这个仓库是一套为三天 Hackathon 准备的稳定前端 Demo：用户通过本地演示登录后，可以上传儿童画，也可以从项目提供的 AI 卡通角色库选择人物或动物，再用按钮和中文指令触发关节动画。

## 本地运行

```bash
npm install
npm run dev
```

`npm run dev` 会同时启动前端（Vite，5173 端口）和识别后端代理（`server/`，3001 端口）。也可以分开运行：`npm run dev:web` / `npm run dev:api`。

生产构建：

```bash
npm run build
npm run preview
```

## 火山引擎配置（可选）

未配置时应用完整可用：画作识别自动降级为本地模板，语音输入会提示未配置。配置后启用云端画作识别（火山方舟豆包视觉）与云端语音识别（豆包语音识别大模型）。

1. 复制 `server/.env.example` 为 `server/.env`。
2. **画作识别**：登录 [火山方舟控制台](https://console.volcengine.com/ark) →「API Key 管理」创建 API Key 填入 `ARK_API_KEY`；在「开通管理」开通 `doubao-1-5-vision-pro-32k-250115`（新开通模型通常有约 50 万 token 免费额度）。
3. **语音识别**：控制台开通「大模型流式语音识别 2.0」；在语音技术「应用管理」创建应用，把 APP ID / Access Token 填入 `SPEECH_APP_ID` / `SPEECH_ACCESS_TOKEN`；资源 ID 默认 `volc.seedasr.sauc.duration`（小时版），如购买的是其他资源包请在「资源包管理」中核对并修改 `SPEECH_RESOURCE_ID`。

密钥只存在于本地 `server/.env`，已加入 `.gitignore`，不会被提交。

## Demo 路径

1. 输入昵称进入本地 Demo 创作空间，无需密码。
2. 从 AI 角色库选择人物、兔子或机器人，也可以上传 JPG、PNG、WEBP 或 GIF 图片，最大 12MB。
3. 进入世界后点击“显示关节”，查看人物四肢/头/身体，或动物耳朵/四腿/尾巴等节点。
4. 上传画作后选择人物、狗或兔子模板，拖动并确认关节；AI 角色也可以邀请一位搭档共同进入世界。
5. 点击人物、房门、太阳、树、小狗或苹果，使用快速互动，或完成三步故事任务。
6. 在角色聊天框连续对话、切换聊天对象、使用语音输入/朗读；部分回复会同步触发角色动作。
7. 编辑场景主题和对象位置，保存到本地作品库，并导出 SVG 作品卡、JSON 数据或分享文案。
8. 家长设置可拦截个人信息、控制语音与单次使用时长，首次使用时由家长设置独立 PIN。

## 已实现功能

- 火山方舟豆包视觉云端画作识别（识别人物/动物并预选关节模板，失败自动降级本地模板）
- 人物、狗、兔子关节模板与可拖动节点校准
- 身份一致的 AI 卡通角色动作帧、双角色世界与对象级动作
- 分支故事任务、连续角色对话、快捷话题和云端语音识别（豆包流式 ASR，浏览器不支持时回退原生语音输入）
- 四种场景主题、对象位置编辑、本地作品保存与恢复
- 本地 SVG/JSON 导出、PWA 安装与离线缓存
- 儿童隐私拦截、家长 PIN、语音权限和休息提醒

## 离线优先

- `src/utils/analyzeDrawing.js` 是儿童画分析边界。压缩图片后调用后端 `/api/analyze-drawing`（火山方舟豆包视觉）识别主角，映射到本地关节模板；识别不可用时自动降级为本地默认模板并给出提示。
- `src/data/avatarCatalog.js` 保存 AI 角色库及每个角色的关节定义，角色素材在 `src/assets/ai-character-sprite.png`。
- `src/data/animalRigProfiles.js` 根据动物类型返回可动节点；当前内置狗、猫、兔、鸟、马、乌龟和章鱼模板。
- `src/components/MotionAvatar.jsx` 保留选角页的原角色外观，在待机、挥手、跳跃和吃苹果动作帧之间切换，并叠加可选关节点。
- `src/utils/parseCommand.js` 在本地解析常用中文指令，不依赖网络。
- `src/utils/conversation.js` 提供问候、心情、爱好、动物与分支冒险等本地对话，并把部分回复连接到场景动作。
- `LivingWorld` 通过统一的 `playAction(objectId, action)` 接口执行按钮和自然语言触发的动作。
- 所有 P0 动画使用 CSS 与 React 本地状态完成。

## 主要目录

```text
src/
  components/       上传、舞台、对象、指令和快速操作
  data/demoScene.js 统一场景对象数据
  utils/            分析、指令解析和动作配置
scripts/
  visual-check.mjs  Playwright 桌面与移动端冒烟截图
artifacts/qa/       本地视觉验证截图
```

## 已知边界

当前版本不会自动分割上传图片中的人物轮廓，云端识别负责认出主角并预选最接近的关节模板，用户仍需手动校准节点。画作与语音会发送到火山引擎云端用于本次识别；图片、作品、对话与设置保存在浏览器本地。语音输入使用豆包流式识别（不支持 AudioWorklet 的浏览器回退原生 Speech Recognition），角色朗读使用浏览器 Speech Synthesis。导出格式为 SVG 作品卡和 JSON 数据。识别后端（`server/`）的生产部署（托管、TLS、反向代理）不在当前 Demo 范围内。
