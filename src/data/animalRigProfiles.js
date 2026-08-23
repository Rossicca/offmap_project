export const animalRigProfiles = {
  dog: { type: "小狗", joints: 7, movable: ["头", "躯干", "左前腿", "右前腿", "左后腿", "右后腿", "尾巴"] },
  cat: { type: "小猫", joints: 9, movable: ["头", "躯干", "左耳", "右耳", "四腿", "尾巴"] },
  rabbit: { type: "兔子", joints: 9, movable: ["头", "身体", "左耳", "右耳", "左前爪", "右前爪", "左后腿", "右后腿", "尾巴"] },
  bird: { type: "小鸟", joints: 6, movable: ["头", "身体", "左翅", "右翅", "左腿", "右腿"] },
  horse: { type: "小马", joints: 8, movable: ["头", "脖子", "躯干", "四腿", "尾巴"] },
  turtle: { type: "乌龟", joints: 7, movable: ["头", "龟壳", "四肢", "尾巴"] },
  octopus: { type: "章鱼", joints: 9, movable: ["头", "八条触手"] },
};

export function analyzeAnimalRig(species = "dog") {
  const profile = animalRigProfiles[species] || animalRigProfiles.dog;
  return { species, ...profile, source: "local-rig-profile" };
}
