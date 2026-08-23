function download(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}

const escapeXml = (value) => String(value).replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[char]));

export function downloadStoryCard({ characterName, userName, messageCount, ending }) {
  const endingText = ending === "night" ? "完成了星光结局" : ending === "morning" ? "完成了晨光结局" : "正在创造新的故事";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><rect width="1200" height="675" rx="42" fill="#fffaf0"/><rect x="38" y="38" width="1124" height="599" rx="34" fill="#79d8f2" stroke="#17324d" stroke-width="8"/><path d="M38 455 Q300 390 600 448 T1162 440 V637 H38Z" fill="#91cc69"/><circle cx="1010" cy="145" r="62" fill="#f8bd2d" stroke="#17324d" stroke-width="8"/><circle cx="1010" cy="145" r="82" fill="none" stroke="#f36b3f" stroke-width="24"/><path d="M170 425v-150" stroke="#17324d" stroke-width="30"/><circle cx="170" cy="235" r="82" fill="#58ab5d" stroke="#17324d" stroke-width="8"/><rect x="285" y="110" width="620" height="350" rx="30" fill="#fff" stroke="#17324d" stroke-width="7"/><text x="335" y="180" font-family="Microsoft YaHei,Arial,sans-serif" font-size="30" font-weight="800" fill="#e84133">MY LIVING DRAWING</text><text x="335" y="258" font-family="Microsoft YaHei,Arial,sans-serif" font-size="58" font-weight="900" fill="#17324d">${escapeXml(characterName)}的互动世界</text><text x="335" y="322" font-family="Microsoft YaHei,Arial,sans-serif" font-size="28" font-weight="700" fill="#48677f">创作者：${escapeXml(userName)} · ${messageCount} 条对话</text><text x="335" y="375" font-family="Microsoft YaHei,Arial,sans-serif" font-size="28" font-weight="700" fill="#48677f">${escapeXml(endingText)}</text><rect x="335" y="404" width="300" height="4" rx="2" fill="#e84133"/><text x="335" y="438" font-family="Microsoft YaHei,Arial,sans-serif" font-size="20" font-weight="700" fill="#557284">让孩子画出来的世界活起来</text></svg>`;
  download(svg, `${characterName}-作品卡.svg`, "image/svg+xml;charset=utf-8");
}

export function downloadProjectData(data) {
  download(JSON.stringify({ schema: 1, exportedAt: new Date().toISOString(), ...data }, null, 2), `${data.characterName}-互动世界.json`, "application/json;charset=utf-8");
}

export async function copyShareText({ characterName, messageCount, ending }) {
  const endingText = ending ? `，还完成了${ending === "night" ? "星光" : "晨光"}结局` : "";
  const text = `我让${characterName}活起来啦！我们已经聊了 ${messageCount} 句话${endingText}。来自 My Living Drawing。`;
  await navigator.clipboard.writeText(text);
  return text;
}

