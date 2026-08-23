import { useEffect, useState } from "react";
import CreatorHub from "./components/CreatorHub";
import LoginScreen from "./components/LoginScreen";
import LivingWorld from "./components/LivingWorld";
import { avatarCatalog } from "./data/avatarCatalog";
import { demoScene } from "./data/demoScene";
import { analyzeDrawing } from "./utils/analyzeDrawing";

export default function App() {
  const [userName, setUserName] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (analysis?.previewUrl) URL.revokeObjectURL(analysis.previewUrl);
  }, [analysis]);

  const upload = async (file) => {
    setBusy(true);
    setError("");
    try {
      const result = await analyzeDrawing(file);
      setSelectedAvatar(avatarCatalog[0]);
      setAnalysis(result);
    } catch (uploadError) {
      setError(uploadError.message || "这张图片暂时打不开，请换一张试试。 ");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    if (analysis?.previewUrl) URL.revokeObjectURL(analysis.previewUrl);
    setAnalysis(null);
    setSelectedAvatar(null);
    setError("");
  };

  const chooseAvatar = (avatar) => {
    setSelectedAvatar(avatar);
    setAnalysis({
      sceneObjects: demoScene.map((object) => object.type === "person" ? { ...object, avatarId: avatar.id } : { ...object }),
      source: "avatar-library",
      previewUrl: null,
      rigAnalysis: {
        person: { type: avatar.kind, joints: avatar.joints.length, movable: avatar.joints },
        dog: { type: "小狗", joints: 7, movable: ["头", "躯干", "四腿", "尾巴"] },
      },
    });
  };

  if (!userName) return <LoginScreen onLogin={setUserName} />;

  return analysis
    ? <LivingWorld sceneObjects={analysis.sceneObjects} previewUrl={analysis.previewUrl} onReset={reset} selectedAvatar={selectedAvatar} rigAnalysis={analysis.rigAnalysis} />
    : <CreatorHub userName={userName} onUpload={upload} onChooseAvatar={chooseAvatar} busy={busy} error={error} onLogout={() => setUserName("")} />;
}
