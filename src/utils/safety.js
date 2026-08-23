const privatePatterns = [
  /(?:电话|手机|号码|联系)[^\d]{0,5}\d{7,}/,
  /\b1[3-9]\d{9}\b/,
  /(?:微信|QQ|邮箱|账号)[:：\s]*[a-zA-Z0-9_@.-]{4,}/i,
  /(?:我家住|家庭住址|学校地址|详细地址).{2,}/,
];

export function screenChildMessage(text, enabled = true) {
  if (!enabled) return { safe: true, text };
  const unsafe = privatePatterns.some((pattern) => pattern.test(text));
  return unsafe ? { safe: false, text: "（已隐藏可能的个人信息）", reply: "为了保护你的隐私，我们不要在聊天里发送电话、账号、学校或家庭地址。可以继续聊画画、故事和小动物哦！" } : { safe: true, text };
}

