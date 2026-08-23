// 采集麦克风 Float32 采样并转为 16kHz Int16 PCM（浏览器 AudioContext 已重采样到 16kHz）
class PCM16Worklet extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0]?.[0];
    if (channel && channel.length) {
      const out = new Int16Array(channel.length);
      for (let i = 0; i < channel.length; i++) {
        const s = Math.max(-1, Math.min(1, channel[i]));
        out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      this.port.postMessage(out.buffer, [out.buffer]);
    }
    return true;
  }
}

registerProcessor("pcm16-worklet", PCM16Worklet);
