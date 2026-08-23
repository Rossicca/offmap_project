import { WebSocketServer, WebSocket } from "ws";
import crypto from "node:crypto";

// 豆包大模型流式语音识别（sauc 协议，双向流式优化版）
const ASR_URL = "wss://openspeech.bytedance.com/api/v3/sauc/bigmodel_async";

// 消息类型与标志位（字节序均为大端）
// 帧结构: header(4B: 0x11 | msgType<<4|flags | 0x10 | 0x00) + seq(4B) + payload_size(4B) + payload
const MSG = { FULL_CLIENT_REQUEST: 0x1, AUDIO_ONLY_REQUEST: 0x2, FULL_SERVER_RESPONSE: 0x9, SERVER_ERROR_RESPONSE: 0xf };
const FLAG_LAST = 0b0010;

const wss = new WebSocketServer({ noServer: true });

function u32(value) {
  const buf = Buffer.alloc(4);
  buf.writeUInt32BE(value >>> 0);
  return buf;
}

function i32(value) {
  const buf = Buffer.alloc(4);
  buf.writeInt32BE(value | 0);
  return buf;
}

function encodeFrame(msgType, flags, payload, seq = 0, hasSeq = false) {
  const header = Buffer.from([0x11, (msgType << 4) | flags, 0x10, 0x00]);
  const seqBuf = hasSeq ? i32(seq) : u32(0);
  return Buffer.concat([header, seqBuf, u32(payload.length), payload]);
}

function mapAsrError(code) {
  switch (code) {
    case 45000001: return "语音服务参数错误，请检查配置。";
    case 45000002: return "没有听到声音，请再试一次。";
    case 55000031: return "语音服务正忙，请稍后再试。";
    default: return "语音服务暂时不可用，请稍后再试。";
  }
}

export function asrUpgrade(req, socket, head) {
  wss.handleUpgrade(req, socket, head, (browser) => bridge(browser));
}

function bridge(browser) {
  const appKey = process.env.SPEECH_APP_ID;
  const accessKey = process.env.SPEECH_ACCESS_TOKEN;
  if (!appKey || !accessKey) {
    if (browser.readyState === WebSocket.OPEN) {
      browser.send(JSON.stringify({ type: "error", message: "语音服务未配置，请联系家长。" }));
    }
    browser.close();
    return;
  }

  let upstream = null;
  let seq = 0;
  let ended = false;
  let finalized = false;
  let closed = false;
  let watchdog = null;

  const sendJson = (obj) => {
    if (!closed && browser.readyState === WebSocket.OPEN) browser.send(JSON.stringify(obj));
  };
  const closeBoth = () => {
    if (closed) return;
    closed = true;
    clearTimeout(watchdog);
    try { upstream?.close(); } catch { /* 忽略 */ }
    try { browser.close(); } catch { /* 忽略 */ }
  };
  const resetWatchdog = () => {
    clearTimeout(watchdog);
    watchdog = setTimeout(() => {
      console.warn("[asr] 30s 未收到浏览器数据，关闭连接");
      closeBoth();
    }, 30_000);
  };

  upstream = new WebSocket(ASR_URL, {
    headers: {
      "X-Api-App-Key": appKey,
      "X-Api-Access-Key": accessKey,
      "X-Api-Resource-Id": process.env.SPEECH_RESOURCE_ID || "volc.seedasr.sauc.duration",
      "X-Api-Connect-Id": crypto.randomUUID(),
    },
  });

  upstream.on("open", () => {
    const header = JSON.stringify({
      user: { uid: `offmap-${crypto.randomBytes(2).toString("hex")}` },
      audio: { format: "pcm", codec: "raw", rate: 16000, bits: 16, channel: 1 },
      request: {
        model_name: "bigmodel",
        enable_itn: true,
        enable_punc: true,
        enable_nonstream: false,
        show_utterances: true,
        result_type: "full",
      },
    });
    upstream.send(encodeFrame(MSG.FULL_CLIENT_REQUEST, 0x0, Buffer.from(header, "utf8")));
  });

  browser.on("message", (data, isBinary) => {
    if (closed) return;
    resetWatchdog();
    if (isBinary) {
      if (upstream?.readyState !== WebSocket.OPEN || ended) return;
      seq += 1;
      upstream.send(encodeFrame(MSG.AUDIO_ONLY_REQUEST, 0b0001, data, seq, true));
    } else {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "end" && !ended) {
          ended = true;
          if (upstream?.readyState === WebSocket.OPEN) {
            upstream.send(encodeFrame(MSG.AUDIO_ONLY_REQUEST, FLAG_LAST, Buffer.alloc(0)));
          }
          setTimeout(() => {
            if (closed) return;
            if (!finalized) sendJson({ type: "error", message: "没有听清楚，可以再试一次或直接输入文字。" });
            closeBoth();
          }, 3000);
        }
      } catch { /* 忽略非法 JSON */ }
    }
  });

  upstream.on("message", (data) => {
    const buf = Buffer.from(data);
    const msgType = (buf[1] >> 4) & 0xf;
    const flags = buf[1] & 0xf;
    if (msgType === MSG.FULL_SERVER_RESPONSE) {
      try {
        const json = JSON.parse(buf.subarray(12).toString("utf8")); // header(4) + seq(4) + size(4)
        const text = json.result?.text || "";
        if (text) sendJson({ type: "partial", text });
        if (flags & FLAG_LAST) {
          finalized = true;
          sendJson({ type: "final", text });
          closeBoth();
        }
      } catch { /* 忽略无法解析的帧 */ }
    } else if (msgType === MSG.SERVER_ERROR_RESPONSE) {
      const code = buf.readUInt32BE(4);
      const detail = buf.subarray(12).toString("utf8").trim();
      console.warn("[asr] 上游错误:", code, detail);
      sendJson({ type: "error", message: mapAsrError(code) });
      closeBoth();
    }
  });

  upstream.on("error", (error) => {
    console.warn("[asr] 上游连接失败:", error.message);
    if (!closed) {
      sendJson({ type: "error", message: "语音服务暂时不可用，请稍后再试。" });
      closeBoth();
    }
  });

  upstream.on("close", () => {
    if (!closed && !finalized) {
      sendJson({ type: "error", message: "语音服务暂时不可用，请稍后再试。" });
      closeBoth();
    }
  });

  browser.on("close", () => {
    clearTimeout(watchdog);
    if (closed) return;
    closed = true;
    // 浏览器中途断开：尽力补发结束帧，等上游给出 final 后关闭（最多 2s）
    if (!ended && upstream?.readyState === WebSocket.OPEN) {
      upstream.send(encodeFrame(MSG.AUDIO_ONLY_REQUEST, FLAG_LAST, Buffer.alloc(0)));
    }
    setTimeout(() => { try { upstream?.close(); } catch { /* 忽略 */ } }, 2000);
  });

  resetWatchdog();
}
