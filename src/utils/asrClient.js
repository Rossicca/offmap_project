// 火山引擎豆包语音识别客户端：采集麦克风 → 16kHz Int16 PCM → 经 /api/asr 后端桥转发
// 交互约定：final 文本由组件写入输入框，之后走原有发送流程（含隐私过滤）。

const CHUNK_BYTES = 6400; // 200ms @16kHz s16le（豆包推荐 100–200ms 一包）
const VAD_RMS = 0.008; // 静音判定能量阈值（实测可调）
const SILENCE_CHUNKS = 8; // 连续静音 ≈1.6s 自动结束
const MAX_SECONDS = 20; // 单次录音上限
const FINAL_WAIT_MS = 3000; // 发送结束帧后等待 final 的最长时间

function unsupportedError() {
  const error = new Error("当前浏览器不支持语音输入，请继续使用文字聊天。");
  error.code = "ASR_UNSUPPORTED";
  return error;
}

export function createAsrClient({ onPartial, onFinal, onError }) {
  let ws = null;
  let mediaStream = null;
  let audioContext = null;
  let workletNode = null;
  let pending = [];
  let pendingBytes = 0;
  let silentChunks = 0;
  let startedAt = 0;
  let finalDelivered = false;
  let stopped = false;
  let wsOpened = false;

  const teardown = () => {
    if (workletNode) {
      try { workletNode.port.onmessage = null; workletNode.disconnect(); } catch { /* 忽略 */ }
      workletNode = null;
    }
    if (audioContext) {
      try { audioContext.close(); } catch { /* 忽略 */ }
      audioContext = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      mediaStream = null;
    }
    if (ws) {
      try { ws.close(); } catch { /* 忽略 */ }
      ws = null;
    }
  };

  const deliverFinal = (text) => {
    if (finalDelivered) return;
    finalDelivered = true;
    stopped = true;
    teardown();
    onFinal(text);
  };

  const flush = () => {
    if (ws?.readyState !== 1 || pendingBytes < CHUNK_BYTES) return;
    const combined = new Int16Array(pendingBytes / 2);
    let offset = 0;
    for (const chunk of pending) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    pending = [];
    pendingBytes = 0;
    ws.send(combined.buffer);

    let sum = 0;
    for (let i = 0; i < combined.length; i++) {
      const s = combined[i] / 32768;
      sum += s * s;
    }
    const rms = Math.sqrt(sum / combined.length);
    if (rms < VAD_RMS) silentChunks += 1;
    else silentChunks = 0;
    if (silentChunks >= SILENCE_CHUNKS) stop();
    if ((Date.now() - startedAt) / 1000 >= MAX_SECONDS) stop();
  };

  const start = async () => {
    finalDelivered = false;
    stopped = false;
    wsOpened = false;
    silentChunks = 0;
    pending = [];
    pendingBytes = 0;

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      const error = new Error("需要麦克风权限才能使用语音输入。");
      error.code = "ASR_NO_MIC";
      throw error;
    }

    if (typeof AudioWorkletNode === "undefined") throw unsupportedError();
    audioContext = new AudioContext({ sampleRate: 16000 });
    if (audioContext.sampleRate !== 16000) {
      teardown();
      throw unsupportedError();
    }
    try {
      await audioContext.audioWorklet.addModule("/worklets/pcm16Worklet.js");
    } catch {
      teardown();
      throw unsupportedError();
    }

    const source = audioContext.createMediaStreamSource(mediaStream);
    workletNode = new AudioWorkletNode(audioContext, "pcm16-worklet");
    workletNode.port.onmessage = (event) => {
      if (stopped) return;
      pending.push(new Int16Array(event.data));
      pendingBytes += event.data.byteLength;
      flush();
    };
    source.connect(workletNode);

    await new Promise((resolve, reject) => {
      ws = new WebSocket("/api/asr");
      ws.binaryType = "arraybuffer";
      ws.onopen = () => { wsOpened = true; startedAt = Date.now(); resolve(); };
      ws.onerror = () => {
        if (!wsOpened && !stopped) {
          stopped = true;
          teardown();
          reject(new Error("语音服务暂时不可用，请稍后再试。"));
        }
      };
      ws.onmessage = (event) => {
        let message;
        try { message = JSON.parse(event.data); } catch { return; }
        if (message.type === "partial") onPartial(message.text);
        else if (message.type === "final") deliverFinal(message.text);
        else if (message.type === "error") {
          stopped = true;
          teardown();
          onError(message.message);
        }
      };
      ws.onclose = () => {
        if (!finalDelivered && !stopped) {
          stopped = true;
          teardown();
          onError("语音服务已断开，请重试。");
        }
      };
    });
  };

  const stop = () => {
    if (!ws || stopped) return;
    stopped = true;
    if (ws.readyState === 1) ws.send(JSON.stringify({ type: "end" }));
    setTimeout(() => {
      if (!finalDelivered) teardown();
    }, FINAL_WAIT_MS);
  };

  const cancel = () => {
    stopped = true;
    teardown();
  };

  return { start, stop, cancel };
}
