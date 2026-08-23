import { parseCommand } from "./parseCommand.js";

const topicRules = [
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
  const topic = topicRules.find((rule) => rule.test(text));
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
