import dotenv from "dotenv";

// 先于其他模块加载 server/.env，保证 vision.js / asr.js 读取到的环境变量已就绪。
dotenv.config({ path: new URL("./.env", import.meta.url) });
