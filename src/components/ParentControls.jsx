import { useState } from "react";

const pinKey = "living-drawing-parent-pin";

export default function ParentControls({ settings, onChange, onClear, onClose }) {
  const [hasPin, setHasPin] = useState(() => Boolean(localStorage.getItem(pinKey)));
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const submitGate = (event) => {
    event.preventDefault();
    setError("");
    if (!hasPin) {
      if (!/^\d{4}$/.test(pin)) return setError("请设置 4 位数字家长码。");
      if (pin !== confirmPin) return setError("两次输入的家长码不一致。");
      localStorage.setItem(pinKey, pin);
      setHasPin(true);
      setUnlocked(true);
      setPin("");
      setConfirmPin("");
      return;
    }
    if (pin === localStorage.getItem(pinKey)) {
      setUnlocked(true);
      setPin("");
    } else setError("家长码不正确，请重试。");
  };

  const changePin = () => {
    if (!/^\d{4}$/.test(newPin)) return setNotice("新家长码需要是 4 位数字。");
    localStorage.setItem(pinKey, newPin);
    setNewPin("");
    setNotice("家长码已更新。");
  };

  return <div className="parent-backdrop"><section className="parent-controls" role="dialog" aria-modal="true" aria-labelledby="parent-title"><header><div><h2 id="parent-title">家长与安全</h2><p>所有设置只保存在当前浏览器。</p></div><button type="button" onClick={onClose} aria-label="关闭家长设置">×</button></header>{!unlocked ? <form className="parent-gate" onSubmit={submitGate}><label htmlFor="parent-pin">{hasPin ? "输入家长码" : "首次使用，请设置 4 位家长码"}</label><input id="parent-pin" inputMode="numeric" type="password" maxLength="4" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))} placeholder="4 位数字" autoFocus />{!hasPin && <><label htmlFor="parent-pin-confirm">再输入一次</label><input id="parent-pin-confirm" inputMode="numeric" type="password" maxLength="4" value={confirmPin} onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, ""))} placeholder="确认家长码" /></>}<button className="primary-button" type="submit">{hasPin ? "进入家长设置" : "设置并进入"}</button>{error && <p role="alert">{error}</p>}</form> : <div className="parent-settings"><label><span><b>隐私保护</b><small>拦截电话、账号和详细地址</small></span><input type="checkbox" checked={settings.safeChat} onChange={(event) => onChange({ safeChat: event.target.checked })} /></label><label><span><b>允许语音功能</b><small>控制语音输入和角色朗读</small></span><input type="checkbox" checked={settings.voiceAllowed} onChange={(event) => onChange({ voiceAllowed: event.target.checked })} /></label><label className="parent-time"><span><b>单次使用时长</b><small>到时后显示休息提醒</small></span><select value={settings.sessionMinutes} onChange={(event) => onChange({ sessionMinutes: Number(event.target.value) })}><option value="0">不限时</option><option value="15">15 分钟</option><option value="30">30 分钟</option><option value="60">60 分钟</option></select></label><div className="parent-pin-change"><label htmlFor="new-parent-pin"><span><b>修改家长码</b><small>输入新的 4 位数字</small></span></label><input id="new-parent-pin" inputMode="numeric" type="password" maxLength="4" value={newPin} onChange={(event) => setNewPin(event.target.value.replace(/\D/g, ""))} placeholder="新家长码" /><button type="button" onClick={changePin}>更新</button></div>{notice && <p className="parent-notice" role="status">{notice}</p>}<div className="privacy-summary"><b>隐私说明</b><p>上传的画作和语音内容会发送到火山引擎云端进行识别，仅用于本次识别；角色对话、作品和设置仍只存放在此设备。</p></div><button className="clear-local-data" type="button" onClick={onClear}>清除全部本地作品和对话数据</button></div>}</section></div>;
}
