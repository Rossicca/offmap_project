# 绘梦伙伴

让孩子画出来的世界活起来。这个仓库是一套为三天 Hackathon 准备的稳定前端 Demo：用户通过本地演示登录后，可以上传儿童画，也可以从项目提供的 AI 卡通角色库选择人物或动物，再用按钮和中文指令触发关节动画。

## 本地运行

```bash
npm install
npm run dev
```

`npm run dev` 会同时启动 Vite 前端和本地 API 后端。复制 `.env.example` 为 `.env.local`，填写方舟 API Key、视觉/聊天 Endpoint ID 与 Seedream 图像模型 ID；`.env.local` 不会提交到 Git。`ARK_IMAGE_MODEL` 未填写时默认使用 `doubao-seedream-4-0-250828`。

生产构建：

```bash
npm run build
npm run preview
```

## Demo 路径

1. 输入昵称进入本地 Demo 创作空间，无需密码。
2. 从 AI 角色库选择人物、兔子或机器人，也可以上传 JPG、PNG、WEBP 或 GIF 图片，最大 12MB。
3. 进入世界后点击“显示关节”，查看人物四肢/头/身体，或动物耳朵/四腿/尾巴等节点。
4. 上传画作后可让豆包按轻度、中度或重度真正重绘，再选择人物、狗或兔子模板并校准关节；原图始终可以恢复。
5. 点击人物、房门、太阳、树、小狗或苹果，使用快速互动，或完成三步故事任务。
6. 在角色聊天框连续对话、切换聊天对象、使用语音输入/朗读；部分回复会同步触发角色动作。
7. 编辑场景主题和对象位置，保存到本地作品库，并导出 SVG 作品卡、JSON 数据或分享文案。
8. 家长设置可拦截个人信息、控制语音与单次使用时长，首次使用时由家长设置独立 PIN。

## 已实现功能

- 人物、狗、兔子关节模板与可拖动节点校准
- 豆包 Seedream 图生图：保留画风润色、绘本卡通化与角色重绘
- 身份一致的 AI 卡通角色动作帧、双角色世界与对象级动作
- 分支故事任务、连续角色对话、快捷话题和浏览器语音能力
- 四种场景主题、对象位置编辑、本地作品保存与恢复
- 本地 SVG/JSON 导出、PWA 安装与离线缓存
- 儿童隐私拦截、家长 PIN、语音权限和休息提醒

## 本地优先

- `src/utils/analyzeDrawing.js` 负责画作上传与预览；关节识别和三档 AI 重绘通过本地后端代理调用方舟，API Key 不会暴露给浏览器。
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

当前版本不会自动分割上传图片中的人物轮廓。用户需要选择最接近的关节模板并手动校准节点；未使用 AI 重绘时，图片、作品、对话与设置保存在浏览器本地，选择 AI 重绘后原画会发送给配置的方舟 Seedream 模型处理。语音能力取决于浏览器的 Speech Recognition / Speech Synthesis 支持，导出格式为 SVG 作品卡和 JSON 数据。
