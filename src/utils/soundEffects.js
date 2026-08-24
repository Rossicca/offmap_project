const getEffectsVolume = () => {
  try {
    const saved = Number(window.localStorage.getItem("living-drawing-music-volume") ?? .28);
    return Math.max(0, Math.min(1, saved));
  } catch {
    return .28;
  }
};


export async function playDogBark(count = 1, delaySeconds = 0) {
  if (typeof window === "undefined") return;
  const volume = getEffectsVolume();
  if (volume <= 0) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const context = new AudioContext();
  try {
    if (context.state === "suspended") await context.resume();
    const master = context.createGain();
    const compressor = context.createDynamicsCompressor();
    master.gain.value = Math.min(.2, .055 + volume * .14);
    master.connect(compressor);
    compressor.connect(context.destination);

    for (let index = 0; index < count; index += 1) {
      const start = context.currentTime + delaySeconds + index * .43;
      const duration = .22;
      const noiseBuffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
      const samples = noiseBuffer.getChannelData(0);
      for (let sample = 0; sample < samples.length; sample += 1) {
        const envelope = Math.pow(1 - sample / samples.length, 2.4);
        samples[sample] = (Math.random() * 2 - 1) * envelope;
      }

      const noise = context.createBufferSource();
      const barkFilter = context.createBiquadFilter();
      const noiseGain = context.createGain();
      noise.buffer = noiseBuffer;
      barkFilter.type = "bandpass";
      barkFilter.frequency.setValueAtTime(720 - index * 65, start);
      barkFilter.Q.value = 1.1;
      noiseGain.gain.setValueAtTime(.01, start);
      noiseGain.gain.exponentialRampToValueAtTime(.9, start + .018);
      noiseGain.gain.exponentialRampToValueAtTime(.01, start + duration);
      noise.connect(barkFilter);
      barkFilter.connect(noiseGain);
      noiseGain.connect(master);

      const voice = context.createOscillator();
      const voiceGain = context.createGain();
      voice.type = "sawtooth";
      voice.frequency.setValueAtTime(185 - index * 12, start);
      voice.frequency.exponentialRampToValueAtTime(82, start + duration);
      voiceGain.gain.setValueAtTime(.01, start);
      voiceGain.gain.exponentialRampToValueAtTime(.7, start + .02);
      voiceGain.gain.exponentialRampToValueAtTime(.01, start + duration);
      voice.connect(voiceGain);
      voiceGain.connect(master);

      noise.start(start);
      noise.stop(start + duration);
      voice.start(start);
      voice.stop(start + duration);
    }

    window.setTimeout(() => context.close().catch(() => {}), delaySeconds * 1000 + count * 430 + 650);
  } catch {
    context.close().catch(() => {});
  }
}
