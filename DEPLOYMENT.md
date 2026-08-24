# AI 画伴部署说明

这个项目采用单服务部署：Node.js 轻后端同时提供 `/api/*` 接口和 `dist/` 前端静态文件。API Key 只配置在服务端环境变量中，不会进入浏览器构建产物。

## 方案一：直接运行打包文件

要求 Node.js 20 或更高版本。部署包已经包含构建好的 `dist/`，因此不需要安装依赖即可启动：

```bash
cp .env.example .env.local
# 编辑 .env.local，填写真实的 ARK_API_KEY 和模型 Endpoint ID
npm start
```

默认访问地址为 `http://服务器地址:8787`，健康检查为 `/api/health`。生产服务器、防火墙或平台需要放行该端口；也可以通过 `PORT` 修改。

## 方案二：Docker

```bash
docker build -t offmap-ai-companion .
docker run --rm -p 8787:8787 --env-file .env.local offmap-ai-companion
```

不要把 `.env.local` 复制进镜像或提交到 Git。容器默认监听 `0.0.0.0:8787`。

## 方案三：Render、Railway 等 Node 平台

- 运行时：Node.js 20+
- 构建命令：`npm ci && npm run build`
- 启动命令：`npm start`
- 健康检查：`/api/health`
- 对外端口：使用平台自动注入的 `PORT`
- 服务类型：Web Service，不要只部署成静态站点

需要配置的服务端环境变量：

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `ARK_API_KEY` | 是 | 火山方舟 API Key，只能放在服务端 |
| `ARK_VISION_MODEL` | 是 | 视觉模型 Endpoint ID，用于人物与关节识别 |
| `ARK_CHAT_MODEL` | 是 | 对话模型 Endpoint ID |
| `ARK_IMAGE_MODEL` | 否 | 图像重绘模型，默认 `doubao-seedream-4-0-250828` |
| `ARK_BASE_URL` | 否 | 默认 `https://ark.cn-beijing.volces.com/api/v3` |
| `HOST` | 否 | 生产环境建议 `0.0.0.0` |
| `PORT` | 否 | 云平台通常自动注入，本地默认 8787 |

## 上线前检查

```bash
npm ci
npm run build
npm start
```

然后检查：

1. 打开 `/api/health`，确认 `ok`、`vision`、`chat`、`image` 为 `true`。
2. 上传一张测试人物图，确认关节识别请求成功。
3. 发送一条聊天消息，确认聊天模型可用。
4. 刷新页面，确认前端路由仍能加载。

## 数据与限制

- 作品、学习时长、聊天和设置主要保存在用户浏览器本地，不需要数据库。
- 更换浏览器或清除浏览器数据后，本地作品不会自动迁移。
- 如果需要多设备同步、家长后台或账号系统，后续再增加数据库和鉴权服务。
- 图片和对话请求会由轻后端转发到火山方舟；部署地区必须能访问方舟 API。
