# My Living Drawing

让孩子画出来的世界活起来。这个仓库是一套为三天 Hackathon 准备的稳定前端 Demo：用户通过本地演示登录后，可以上传儿童画，也可以从项目提供的 AI 卡通角色库选择人物或动物，再用按钮和中文指令触发关节动画。

## 本地运行

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

## Demo 路径

1. 输入昵称进入本地 Demo 创作空间，无需密码。
2. 从 AI 角色库选择人物、兔子或机器人，也可以上传 JPG、PNG、WEBP 或 GIF 图片，最大 12MB。
3. 进入世界后点击“显示关节”，查看人物四肢/头/身体，或动物耳朵/四腿/尾巴等节点。
4. 点击人物、房门、太阳、树、小狗或苹果，或者使用“快速互动”。
5. 在指令框尝试“让太阳下山”“打开房子的门”“让小狗去找小朋友”“给小朋友吃苹果”。

## 离线优先

- `src/utils/analyzeDrawing.js` 是儿童画识别边界。当前返回 mock 场景，未来可在这里替换真实 Vision API。
- `src/data/avatarCatalog.js` 保存 AI 角色库及每个角色的关节定义，角色素材在 `src/assets/ai-character-sprite.png`。
- `src/data/animalRigProfiles.js` 根据动物类型返回可动节点；当前内置狗、猫、兔、鸟、马、乌龟和章鱼模板。
- `src/components/MotionAvatar.jsx` 保留选角页的原角色外观，在待机、挥手、跳跃和吃苹果动作帧之间切换，并叠加可选关节点。
- `src/utils/parseCommand.js` 在本地解析常用中文指令，不依赖网络。
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

目前的“识别”是比赛稳定性优先的 mock fallback，不会把上传画面中的真实轮廓拆成精灵。上传图片会低透明度显示为互动舞台底纸，场景对象来自统一的 Demo 数据。
