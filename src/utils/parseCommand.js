const rules = [
  { test: (text) => /太阳/.test(text) && /(下山|落山|日落|落下|天黑)/.test(text), type: "sun", action: "sunset", message: "太阳要下山啦！" },
  { test: (text) => /太阳/.test(text) && /(升起|升起来|日出|出来|天亮)/.test(text), type: "sun", action: "sunrise", message: "新的一天开始啦！" },
  { test: (text) => /(门|房子)/.test(text) && /(打开|开门|开启)/.test(text), type: "house", action: "openDoor", message: "吱呀，门打开啦！" },
  { test: (text) => /(门|房子)/.test(text) && /(关闭|关门|关上)/.test(text), type: "house", action: "closeDoor", message: "门轻轻关上啦。" },
  { test: (text) => /树/.test(text) && /(摇|晃|风)/.test(text), type: "tree", action: "shake", message: "风来啦！" },
  { test: (text) => /(小狗|狗狗|狗)/.test(text) && /(走|过来|移动|找|跑)/.test(text), type: "dog", action: "move", message: "小狗跑过来啦！" },
  { test: (text) => /(小狗|狗狗|狗)/.test(text) && /跳/.test(text), type: "dog", action: "jump", message: "小狗跳起来啦！" },
  { test: (text) => /挥手/.test(text), type: "person", action: "wave", message: "你好呀！" },
  { test: (text) => /(跳舞|舞蹈|跳个舞)/.test(text), type: "person", action: "dance", message: "跟着节奏跳起来！" },
  { test: (text) => /(转圈|转一圈|旋转)/.test(text), type: "person", action: "spin", message: "转一圈！" },
  { test: (text) => /(欢呼|庆祝|太棒)/.test(text), type: "person", action: "cheer", message: "一起欢呼吧！" },
  { test: (text) => /(休息|睡觉|困了)/.test(text), type: "person", action: "rest", message: "安静休息一下。" },
  { test: (text) => /跳/.test(text), type: "person", action: "jump", message: "一起跳起来！" },
  { test: (text) => /(苹果|吃|喂)/.test(text), type: "food", action: "feed", message: "把苹果送过去！" },
];

export function parseCommand(rawText, sceneObjects) {
  const text = rawText.trim().replace(/[，。！？,.!?\s]/g, "");
  if (!text) return null;

  const rule = rules.find((item) => item.test(text));
  if (!rule) {
    return { target: null, action: null, message: "我还没学会这个动作，试试“让太阳下山”吧。" };
  }

  const target = sceneObjects.find(
    (object) => object.type === rule.type && object.actions.includes(rule.action),
  );

  return target
    ? { target: target.id, action: rule.action, message: rule.message }
    : { target: null, action: null, message: "这幅画里还没有找到能做这个动作的角色。" };
}
