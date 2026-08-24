import { parseCommand } from "./parseCommand.js";

const topicRules = [
  {
    test: (text) => /出一道.*数学|数学小题|一起学数学/.test(text),
    reply: () => ({ text: "好呀，先来一道小题：树上有 3 个苹果，又长出了 4 个，现在一共有几个？你可以慢慢数。", target: "tree1", action: "shake", suggestions: ["7 个", "给我一点提示", "换一道题"], learning: { mode: "quiz", result: "neutral", progressDelta: 0, topic: "math", expectedAnswer: "7" } }),
  },
  {
    test: (text) => /给我一点提示|一步提示|没想明白/.test(text),
    reply: ({ learningState }) => ({ text: learningState?.topic === "math" ? "先把 3 个苹果记在心里，再接着数 4 下：4、5、6、7。现在你想选哪个答案？" : "先找题目里最重要的一个词，再回到画面或句子中寻找线索。", suggestions: learningState?.topic === "math" ? ["答案是 7", "我再数一次", "直接讲解"] : ["我找到线索了", "再提示一点", "帮我讲解"], learning: { mode: "hint", result: "neutral", progressDelta: 0, topic: learningState?.topic || "discovery", expectedAnswer: learningState?.currentAnswer || "" } }),
  },
  {
    test: (text, context) => context.learningState?.currentAnswer === "7" && /^(7\s*个?|答案是\s*7)$/.test(text),
    reply: () => ({ text: "答对啦！3 再往后数 4 下就是 7。你不只找到了答案，也用对了接着数的方法！", target: "person1", action: "cheer", suggestions: ["再来一道", "帮我复习", "学点别的"], learning: { mode: "encourage", result: "correct", progressDelta: 1, topic: "math", expectedAnswer: "" } }),
  },
  {
    test: (text, context) => context.learningState?.currentAnswer === "树下" && /树下/.test(text),
    reply: () => ({ text: "找对啦！句子里的“推到树下”直接告诉了我们地点。阅读时圈出表示地点的词，会更容易找到答案。", target: "person1", action: "cheer", suggestions: ["再来一道", "帮我复习", "学点别的"], learning: { mode: "encourage", result: "correct", progressDelta: 1, topic: "reading", expectedAnswer: "" } }),
  },
  {
    test: (text, context) => context.learningState?.currentAnswer === "apple" && /^apple$/i.test(text),
    reply: () => ({ text: "读得很好，apple 就是苹果！你已经把画里的东西和一个新单词连起来啦。", target: "person1", action: "jump", suggestions: ["再学一个词", "帮我复习", "学点别的"], learning: { mode: "encourage", result: "correct", progressDelta: 1, topic: "english", expectedAnswer: "" } }),
  },
  {
    test: (text) => /自由探索|观察或常识小题|画里的事物.*小知识/.test(text),
    reply: () => ({ text: "观察小挑战：太阳、树和房子里，哪一个会自己生长？先看看它们的特点再回答。", suggestions: ["树会生长", "给我一点提示", "换一个问题"], learning: { mode: "quiz", result: "neutral", progressDelta: 0, topic: "discovery", expectedAnswer: "树" } }),
  },
  {
    test: (text, context) => context.learningState?.currentAnswer === "树" && /树会生长|答案是树/.test(text),
    reply: () => ({ text: "答对啦，树是有生命的植物，会慢慢长高、长出新叶。你观察得很仔细！", target: "tree1", action: "shake", suggestions: ["再观察一次", "帮我复习", "学点别的"], learning: { mode: "encourage", result: "correct", progressDelta: 1, topic: "discovery", expectedAnswer: "" } }),
  },
  {
    test: (text) => /帮我复习|复习刚才|三个要点/.test(text),
    reply: ({ learningState }) => ({ text: learningState?.topic === "math" ? "刚才的方法是：先记住第一个数，再接着往后数；例如 2 加 3，可以从 2 后面数 3、4、5。" : learningState?.topic === "reading" ? "阅读小方法：先读问题、圈出关键词，再回到原句找同样的线索。" : learningState?.topic === "english" ? "今天把图和单词连在了一起：apple 是苹果。看见苹果时再读一遍，会记得更牢。" : "观察时可以按三步走：先看形状，再找不同，最后说出为什么。", suggestions: ["再来一道", "我记住了", "学点别的"], learning: { mode: "explain", result: "neutral", progressDelta: 0, topic: learningState?.topic || "discovery", expectedAnswer: "" } }),
  },
  {
    test: (text) => /阅读理解|练阅读|一起练阅读/.test(text),
    reply: () => ({ text: "读一读：小狗把红苹果推到树下。问题是——苹果最后在哪里？先回到句子里找地点。", target: "dog1", action: "move", suggestions: ["在树下", "给我一点提示", "我想再读一次"], learning: { mode: "quiz", result: "neutral", progressDelta: 0, topic: "reading", expectedAnswer: "树下" } }),
  },
  {
    test: (text) => /学英语|英语词语|英语小题/.test(text),
    reply: () => ({ text: "我们从画里的苹果开始：苹果的英文是 apple。你愿意跟我读一次 apple 吗？", target: "apple1", action: "feed", suggestions: ["apple", "它怎么读？", "再学一个词"], learning: { mode: "quiz", result: "neutral", progressDelta: 0, topic: "english", expectedAnswer: "apple" } }),
  },
  {
    test: (text) => /^(你好|嗨|哈喽|hello)|早上好|下午好|晚上好/.test(text),
    reply: ({ name }) => ({ text: `你好呀！我是${name}。见到你真开心，我们一起聊聊天吧！`, target: "person1", action: "wave", suggestions: ["你喜欢什么？", "我们去冒险吧", "给我讲个故事"] }),
  },
  {
    test: (text) => /你(叫|是)什么|你的名字|介绍一下/.test(text),
    reply: ({ name }) => ({ text: `我叫${name}，是这个纸片世界里的小伙伴。我会聊天，也会跟着故事一起动起来！`, suggestions: ["你喜欢什么？", "你今天开心吗？", "我们去冒险吧"] }),
  },
  {
    test: (text) => /喜欢什么|爱好|最喜欢/.test(text),
    reply: () => ({ text: "我喜欢探索新地方、和小狗赛跑，还喜欢香甜的红苹果。你喜欢什么呢？", suggestions: ["我喜欢画画", "我喜欢小动物", "我也喜欢冒险"] }),
  },
  {
    test: (text) => /我喜欢画|画画|绘画/.test(text),
    reply: () => ({ text: "太棒啦！每一幅画都能藏着一个新世界。下次也把你的角色带来和我认识吧！", suggestions: ["给我讲个故事", "我们去冒险吧", "看看小狗"] }),
  },
  {
    test: (text) => /小狗叫什么/.test(text),
    reply: () => ({ text: "它叫豆包！别看它腿短短的，跑起来可快啦。", target: "dog1", action: "jump", suggestions: ["和小狗玩", "我们去冒险吧", "给我讲个故事"] }),
  },
  {
    test: (text) => /小动物|小狗|狗狗|宠物/.test(text) && !/(过来|跑|走|跳)/.test(text),
    reply: () => ({ text: "我也喜欢小动物！旁边这只小狗是我的好朋友，它一听见我们聊天就想跑过来。", target: "dog1", action: "move", suggestions: ["小狗叫什么？", "和小狗玩", "你今天开心吗？"] }),
  },
  {
    test: (text) => /难过|不开心|伤心|害怕/.test(text),
    reply: ({ name }) => ({ text: `没关系，${name}会陪着你。我们可以慢慢说，也可以看看小狗做个可爱的动作。`, target: "person1", action: "wave", suggestions: ["谢谢你", "看看小狗", "讲个开心的故事"] }),
  },
  {
    test: (text) => /开心|心情|怎么样/.test(text),
    reply: () => ({ text: "和你说话以后，我的心情像太阳一样亮！如果你也开心，我们一起跳一下吧。", target: "person1", action: "jump", suggestions: ["我也很开心", "我有点难过", "给我讲个故事"] }),
  },
  {
    test: (text) => /冒险|出发|探险/.test(text),
    reply: () => ({ text: "出发！我们先穿过苹果树，再敲开小屋的门，看看里面藏着什么秘密。", target: "house1", action: "openDoor", suggestions: ["门里有什么？", "带上小狗", "天黑了怎么办？"] }),
  },
  {
    test: (text) => /门里|里面有什么|什么秘密/.test(text),
    reply: () => ({ text: "里面有一张会发光的地图！地图说，只有愿意帮助朋友的人才能找到星星宝藏。", suggestions: ["我们帮助谁？", "带上小狗", "继续讲"] }),
  },
  {
    test: (text) => /故事|继续讲|然后呢|讲个/.test(text),
    reply: ({ turn }) => ({
      text: turn > 5 ? "我们沿着发光的脚印走到山顶，星星宝藏原来不是金子，而是一颗会实现友情愿望的种子！" : "从前，这棵苹果树每天晚上都会听见星星唱歌。一天，一颗星星掉进了小屋后面的草丛里……",
      target: "sun1",
      action: "sunset",
      suggestions: ["然后呢？", "我们去找星星", "让太阳升起来"],
    }),
  },
  {
    test: (text) => /谢谢|再见|拜拜/.test(text),
    reply: ({ name }) => ({ text: `不用谢！${name}会一直在这里等你。下次再一起冒险吧！`, target: "person1", action: "wave", suggestions: ["再聊一会儿", "最后跳一下", "看看太阳"] }),
  },
];

export function createCharacterReply(rawText, context) {
  const text = rawText.trim().replace(/[，。！？,.!?]/g, "");
  const topic = topicRules.find((rule) => rule.test(text, context));
  if (topic) return topic.reply(context);

  const command = parseCommand(rawText, context.sceneObjects);
  if (command?.target) {
    return { text: `${command.message} 你还想让这个世界发生什么？`, target: command.target, action: command.action, suggestions: ["跟我挥挥手", "让小狗过来", "给我讲个故事"] };
  }

  return {
    text: "我听见啦！我现在最会聊冒险、画画、心情和小动物，也能听懂“挥挥手”“让太阳下山”这样的指令。",
    suggestions: ["你喜欢什么？", "我们去冒险吧", "让小狗过来"],
  };
}
