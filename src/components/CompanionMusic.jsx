import { useEffect, useRef, useState } from "react";

const tracks = [
  {
    name: "纸飞机旅行", mood: "轻快 · 有起伏", bpm: 96,
    melody: [[72,.5],[74,.5],[76,1],[79,.75],[76,.25],[74,1],[null,.5],[76,.5],[81,1.5],[79,.5],[76,.5],[74,.5],[72,1.5],[null,.5],[67,.5],[72,.5],[74,.5],[76,.75],[77,.25],[79,1],[83,1],[81,.5],[79,.5],[76,1.5],[74,.5],[76,.5],[79,.5],[81,1],[79,.5],[74,.5],[72,2]],
    harmony: [[60,1],[64,.5],[67,.5],[62,1],[65,.5],[69,.5],[57,1],[60,.5],[64,.5],[55,1],[59,.5],[62,.5]],
  },
  {
    name: "午后小溪", mood: "舒缓 · 流动", bpm: 78,
    melody: [[67,1],[71,.5],[74,1.5],[72,.5],[71,.5],[69,1],[null,.5],[67,.5],[69,.5],[72,1],[76,1.5],[74,.5],[72,1],[69,1.5],[null,.5],[64,.5],[67,1],[69,.5],[71,.5],[74,1],[76,.5],[79,1.5],[76,.5],[74,.5],[72,1],[71,.5],[69,.5],[67,2]],
    harmony: [[55,1.5],[62,.5],[59,1],[62,1],[52,1.5],[59,.5],[57,1],[64,1]],
  },
  {
    name: "月光秋千", mood: "安静 · 梦幻", bpm: 68,
    melody: [[76,1.5],[79,.5],[83,1],[81,1],[79,2],[null,1],[74,.5],[76,.5],[79,1.5],[76,.5],[72,2],[null,.5],[71,.5],[74,1],[76,.5],[79,.5],[81,1.5],[79,.5],[76,1],[74,1],[72,2.5],[null,.5],[76,.5],[79,.5],[76,1],[74,1],[71,1],[72,3]],
    harmony: [[60,2],[67,1],[64,1],[57,2],[64,1],[60,1],[53,2],[60,1],[57,1],[55,2],[62,1],[59,1]],
  },
  {
    name: "森林捉迷藏", mood: "活泼 · 跳跃", bpm: 104,
    melody: [[67,.5],[69,.5],[72,.75],[74,.25],[76,1],[72,.5],[69,.5],[67,1],[null,.5],[71,.5],[74,.5],[79,1],[76,.5],[74,.5],[72,1.5],[69,.5],[67,.5],[69,.5],[72,1],[76,.75],[77,.25],[79,1],[76,.5],[72,.5],[74,1],[71,.5],[67,.5],[64,1.5],[67,.5],[72,2]],
    harmony: [[55,.5],[62,.5],[59,1],[57,.5],[64,.5],[60,1],[52,.5],[59,.5],[55,1],[50,.5],[57,.5],[54,1]],
  },
  {
    name: "贝壳小浪花", mood: "清新 · 海风", bpm: 86,
    melody: [[71,1],[74,.5],[78,.5],[81,1.5],[78,.5],[76,1],[74,1],[null,.5],[69,.5],[71,1],[74,1.5],[76,.5],[78,1],[76,.5],[74,.5],[71,2],[null,.5],[74,.5],[76,.5],[78,.5],[83,1],[81,1],[78,.5],[76,.5],[74,1.5],[71,.5],[69,1],[71,2]],
    harmony: [[59,1],[66,1],[62,1.5],[66,.5],[57,1],[64,1],[61,1.5],[64,.5]],
  },
  {
    name: "雨后彩虹", mood: "明亮 · 轻柔", bpm: 90,
    melody: [[65,.5],[69,.5],[72,1],[74,.5],[77,1.5],[76,.5],[72,.5],[69,1],[null,.5],[67,.5],[71,1],[74,.5],[76,.5],[79,1.5],[77,.5],[74,1],[72,1.5],[null,.5],[69,.5],[72,.5],[76,1],[81,1],[79,.5],[77,.5],[76,1],[72,.5],[69,.5],[67,1],[69,1],[72,2]],
    harmony: [[53,1],[60,.5],[57,.5],[55,1],[62,.5],[59,.5],[52,1],[59,.5],[55,.5],[57,1],[64,.5],[60,.5]],
  },
  {
    name: "早安向日葵", mood: "温暖 · 朝气", bpm: 98,
    melody: [[64,.5],[67,.5],[69,.5],[71,.5],[72,1],[76,1],[74,.5],[72,.5],[69,1],[null,.5],[71,.5],[74,1],[79,1],[76,.5],[74,.5],[72,1.5],[67,.5],[69,.5],[72,.5],[76,.5],[79,1.5],[81,.5],[79,.5],[76,.5],[74,1],[72,.5],[69,.5],[67,1.5],[64,.5],[67,.5],[72,2]],
    harmony: [[52,1],[59,.5],[55,.5],[57,1],[64,.5],[60,.5],[55,1],[62,.5],[59,.5],[48,1],[55,.5],[52,.5]],
  },
  {
    name: "银河漂流瓶", mood: "辽阔 · 宁静", bpm: 64,
    melody: [[72,2],[76,1],[79,1],[83,2.5],[null,.5],[81,.5],[79,1],[76,2],[74,1],[72,2],[null,1],[67,1],[71,1],[74,2],[79,1.5],[76,.5],[74,1],[72,2.5],[null,.5],[76,1],[81,1],[79,2],[76,1],[74,1],[71,2],[72,3]],
    harmony: [[48,2],[55,2],[52,2],[59,2],[45,2],[52,2],[43,2],[50,2]],
  },
  {
    name: "蒲公英邮差", mood: "俏皮 · 自由", bpm: 102,
    melody: [[69,.5],[72,.5],[76,1],[74,.5],[72,.5],[69,1],[76,.75],[79,.25],[81,1],[79,.5],[76,.5],[74,1.5],[null,.5],[72,.5],[74,.5],[76,.5],[79,1],[83,1],[81,.5],[79,.5],[76,1],[74,.5],[72,.5],[69,1],[71,.5],[74,.5],[72,1.5],[69,.5],[64,.5],[69,2]],
    harmony: [[57,.5],[64,.5],[60,1],[55,.5],[62,.5],[59,1],[52,.5],[59,.5],[55,1],[57,.5],[64,.5],[61,1]],
  },
  {
    name: "萤火虫晚会", mood: "温柔 · 闪亮", bpm: 74,
    melody: [[74,1],[78,.5],[81,1.5],[79,.5],[78,.5],[74,1.5],[null,.5],[69,.5],[71,.5],[74,1],[78,1],[83,1.5],[81,.5],[78,1],[76,1],[74,2],[null,.5],[78,.5],[81,.5],[85,1.5],[83,.5],[81,1],[78,.5],[76,.5],[74,1.5],[71,.5],[69,1],[71,.5],[74,2.5]],
    harmony: [[50,1.5],[57,.5],[54,1],[61,1],[47,1.5],[54,.5],[52,1],[59,1],[45,1.5],[52,.5],[50,1],[57,1]],
  },
];

const frequency = (midi) => 440 * (2 ** ((midi - 69) / 12));

export default function CompanionMusic({ variant = "tile" }) {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(() => Number(localStorage.getItem("living-drawing-music-track") || 0) % tracks.length);
  const [volume, setVolume] = useState(() => Math.max(0, Math.min(1, Number(localStorage.getItem("living-drawing-music-volume") || .16))));
  const audioRef = useRef({ context: null, master: null, timer: null, generation: 0 });
  const triggerRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const [position, setPosition] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("living-drawing-music-position"));
      return saved ? { x: Math.max(8, Math.min(window.innerWidth - 56, saved.x)), y: Math.max(8, Math.min(window.innerHeight - 56, saved.y)) } : { x: Math.max(16, window.innerWidth - 196), y: 92 };
    }
    catch { return { x: Math.max(16, window.innerWidth - 196), y: 92 }; }
  });
  const positionRef = useRef(position);

  const stopAudio = () => {
    const audio = audioRef.current;
    audio.generation += 1;
    window.clearTimeout(audio.timer);
    audio.timer = null;
    audio.context?.close().catch(() => {});
    audio.context = null;
    audio.master = null;
  };

  const scheduleNote = (context, master, midi, start, length, type, level) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency(midi);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(level, start + .06);
    gain.gain.exponentialRampToValueAtTime(.0001, start + length);
    oscillator.connect(gain).connect(master);
    oscillator.start(start);
    oscillator.stop(start + length + .05);
  };

  const startAudio = async (index = trackIndex) => {
    stopAudio();
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const master = context.createGain();
    master.gain.value = volume * .55;
    master.connect(context.destination);
    await context.resume();
    const generation = audioRef.current.generation;
    audioRef.current.context = context;
    audioRef.current.master = master;

    const scheduleLoop = () => {
      if (audioRef.current.generation !== generation || context.state === "closed") return;
      const track = tracks[index];
      const beat = 60 / track.bpm;
      const start = context.currentTime + .08;
      let melodyCursor = 0;
      track.melody.forEach(([midi, beats], noteIndex) => {
        if (midi) {
          scheduleNote(context, master, midi, start + melodyCursor * beat, beats * beat * .88, noteIndex % 5 === 0 ? "triangle" : "sine", noteIndex % 7 === 0 ? .105 : .082);
          if (noteIndex % 8 === 3) scheduleNote(context, master, midi + 12, start + (melodyCursor + .08) * beat, beats * beat * .62, "sine", .018);
        }
        melodyCursor += beats;
      });
      let harmonyCursor = 0;
      let harmonyIndex = 0;
      while (harmonyCursor < melodyCursor) {
        const [midi, beats] = track.harmony[harmonyIndex % track.harmony.length];
        scheduleNote(context, master, midi, start + harmonyCursor * beat, beats * beat * .82, "triangle", .022);
        if (harmonyIndex % 3 === 1) scheduleNote(context, master, midi + 7, start + (harmonyCursor + .12) * beat, beats * beat * .66, "sine", .012);
        harmonyCursor += beats;
        harmonyIndex += 1;
      }
      audioRef.current.timer = window.setTimeout(scheduleLoop, melodyCursor * beat * 1000 - 140);
    };
    scheduleLoop();
    setPlaying(true);
  };

  const pause = () => { stopAudio(); setPlaying(false); };
  const selectTrack = (nextIndex) => {
    const normalized = (nextIndex + tracks.length) % tracks.length;
    setTrackIndex(normalized);
    localStorage.setItem("living-drawing-music-track", String(normalized));
    if (playing) startAudio(normalized);
  };
  const changeVolume = (nextVolume) => {
    setVolume(nextVolume);
    localStorage.setItem("living-drawing-music-volume", String(nextVolume));
    const { master, context } = audioRef.current;
    if (master && context) master.gain.setTargetAtTime(nextVolume * .55, context.currentTime, .04);
  };

  useEffect(() => () => stopAudio(), []);
  useEffect(() => {
    const openPlayer = () => setOpen(true);
    window.addEventListener("living-drawing-open-music", openPlayer);
    return () => window.removeEventListener("living-drawing-open-music", openPlayer);
  }, []);
  useEffect(() => {
    const keepOnScreen = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition((current) => {
        const next = { x: Math.max(8, Math.min(window.innerWidth - rect.width - 8, current.x)), y: Math.max(8, Math.min(window.innerHeight - rect.height - 8, current.y)) };
        positionRef.current = next;
        return next;
      });
    };
    keepOnScreen();
    window.addEventListener("resize", keepOnScreen);
    return () => window.removeEventListener("resize", keepOnScreen);
  }, [variant]);

  const startDrag = (event) => {
    if (variant === "tile" || event.button !== 0) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { pointerId: event.pointerId, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top, startX: event.clientX, startY: event.clientY, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const moved = drag.moved || Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 5;
    drag.moved = moved;
    const next = { x: Math.max(8, Math.min(window.innerWidth - rect.width - 8, event.clientX - drag.offsetX)), y: Math.max(8, Math.min(window.innerHeight - rect.height - 8, event.clientY - drag.offsetY)) };
    positionRef.current = next;
    setPosition(next);
  };
  const finishDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    suppressClickRef.current = drag.moved;
    dragRef.current = null;
    localStorage.setItem("living-drawing-music-position", JSON.stringify(positionRef.current));
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const openWorldTool = (tool) => {
    window.dispatchEvent(new CustomEvent("living-drawing-open-world-tool", { detail: tool }));
    setOpen(false);
  };

  const trigger = variant === "tile"
    ? <button className={`doodle-tile yellow music-tile side-tool${playing ? " is-playing" : ""}`} data-label="伙伴音乐" type="button" onClick={() => setOpen(true)} aria-label="打开伙伴音乐播放器" title="伙伴音乐">♫</button>
    : <button ref={triggerRef} className={`music-floating-button${playing ? " is-playing" : ""}`} style={{ left: position.x, top: position.y }} type="button" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={finishDrag} onClick={() => { if (suppressClickRef.current) { suppressClickRef.current = false; return; } setOpen(true); }} aria-label="拖动或打开伙伴音乐与快捷设置"><span>{playing ? "♫" : "♪"}</span><b>伙伴音乐</b><small>{playing ? tracks[trackIndex].name : "拖动我 · 点开设置"}</small></button>;

  return <>
    {trigger}
    {open && <div className="music-player-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <section className="music-player" role="dialog" aria-modal="true" aria-labelledby="music-player-title">
        <header><div><span>COMPANION MUSIC</span><h2 id="music-player-title">伙伴音乐</h2></div><button type="button" onClick={() => setOpen(false)} aria-label="关闭音乐播放器">×</button></header>
        <div className={`music-disc${playing ? " is-playing" : ""}`} aria-hidden="true"><i>♫</i></div>
        <div className="music-now"><small>当前曲目</small><b>{tracks[trackIndex].name}</b><span>{tracks[trackIndex].mood}</span></div>
        <div className="music-controls"><button type="button" onClick={() => selectTrack(trackIndex - 1)} aria-label="上一首">‹</button><button className="music-play" type="button" onClick={() => playing ? pause() : startAudio()} aria-label={playing ? "暂停" : "播放"}>{playing ? "Ⅱ" : "▶"}</button><button type="button" onClick={() => selectTrack(trackIndex + 1)} aria-label="下一首">›</button></div>
        <label className="music-volume"><span>{volume === 0 ? "静音" : "音量"}</span><input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => changeVolume(Number(event.target.value))} /><b>{Math.round(volume * 100)}%</b></label>
        <div className="music-quick-settings"><b>当前画面</b><div><button type="button" onClick={() => openWorldTool("arrange")}>位置和大小</button><button type="button" onClick={() => openWorldTool("materials")}>加东西</button><button type="button" onClick={() => openWorldTool("house")}>装房子</button><button type="button" onClick={() => openWorldTool("joints")}>显示或隐藏关节</button></div></div>
        <div className="music-library-heading"><b>全部音乐</b><span>{tracks.length} 首</span></div>
        <div className="music-track-list" aria-label="选择音乐">{tracks.map((track, index) => <button type="button" key={track.name} className={index === trackIndex ? "is-active" : ""} onClick={() => selectTrack(index)}><span>{index === trackIndex && playing ? "♫" : index + 1}</span><b>{track.name}</b><small>{track.mood}</small></button>)}</div>
        <p>音乐在设备本地生成，音量和曲目选择会自动记住。</p>
      </section>
    </div>}
  </>;
}
