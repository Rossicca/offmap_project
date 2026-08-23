import { useState } from "react";

export default function ParentControls({ settings, onChange, onClear, onClose }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const unlock = (event) => {
    event.preventDefault();
    const expected = localStorage.getItem("living-drawing-parent-pin") || "2468";
    if (pin === expected) setUnlocked(true); else setError("家长码不正确，请重试。Demo 默认家长码为 2468。 ");
  };
  return <div className="parent-backdrop"><section className="parent-controls" role="dialog" aria-modal="true" aria-labelledby="parent-title"><header><div><h2 id="parent-title">家长与安全</h2><p>所有设置只保存在当前浏览器。</p></div><button type="button" onClick={onClose} aria-label="关闭家长设置">×</button></header>{!unlocked ? <form className="parent-gate" onSubmit={unlock}><label htmlFor="parent-pin">输入 4 位家长码</label><input id="parent-pin" inputMode="numeric" maxLength="4" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))} placeholder="默认 2468" autoFocus /><button className="primary-button" type="submit">进入家长设置</button>{error && <p role="alert">{error}</p>}</form> : <div className="parent-settings"><label><span><b>隐私保护</b><small>拦截电话、账号和详细地址</small></span><input type="checkbox" checked={settings.safeChat} onChange={(event) => onChange({ safeChat: event.target.checked })} /></label><label><span><b>允许语音功能</b><small>控制语音输入和角色朗读</small></span><input type="checkbox" checked={settings.voiceAllowed} onChange={(event) => onChange({ voiceAllowed: event.target.checked })} /></label><label className="parent-time"><span><b>单次使用时长</b><small>到时后显示休息提醒</small></span><select value={settings.sessionMinutes} onChange={(event) => onChange({ sessionMinutes: Number(event.target.value) })}><option value="0">不限时</option><option value="15">15 分钟</option><option value="30">30 分钟</option><option value="60">60 分钟</option></select></label><div className="privacy-summary"><b>本地隐私说明</b><p>角色对话、作品和设置默认只存放在此设备；当前 Demo 不会把儿童图片或聊天内容上传到服务器。</p></div><button className="clear-local-data" type="button" onClick={onClear}>清除全部本地作品和对话数据</button></div>}</section></div>;
}
