import { useState } from "react";
import { copyShareText, downloadProjectData, downloadStoryCard } from "../utils/exportProject";

export default function ExportPanel({ data, onClose }) {
  const [notice, setNotice] = useState("");
  const share = async () => {
    try { await copyShareText(data); setNotice("分享文案已复制，可以粘贴给朋友啦！"); }
    catch { setNotice("当前浏览器不能自动复制，请下载作品卡分享。"); }
  };
  return <div className="export-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="export-panel" role="dialog" aria-modal="true" aria-labelledby="export-title"><header><div><h2 id="export-title">带走这个小世界</h2><p>选择适合你的保存方式。</p></div><button type="button" onClick={onClose} aria-label="关闭导出面板">×</button></header><div className="export-preview"><span>✦</span><h3>{data.characterName}的互动世界</h3><p>{data.messageCount} 条对话 · {data.ending ? "故事结局已完成" : "故事还在继续"}</p></div><div className="export-options"><button type="button" onClick={() => downloadStoryCard(data)}><b>作品卡 SVG</b><span>高清图片，可打印或分享</span></button><button type="button" onClick={() => downloadProjectData(data)}><b>作品数据 JSON</b><span>保存动作、故事和对话记录</span></button><button type="button" onClick={share}><b>复制分享文案</b><span>直接发送给家人和朋友</span></button></div>{notice && <p className="export-notice" role="status">{notice}</p>}<small>作品导出在本地完成，不会上传图片或聊天内容。</small></section></div>;
}
