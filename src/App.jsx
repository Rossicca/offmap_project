import { useEffect, useState } from "react";
import CreatorHub from "./components/CreatorHub";
import LoginScreen from "./components/LoginScreen";
import LivingWorld from "./components/LivingWorld";
import RigEditor from "./components/RigEditor";
import { avatarCatalog } from "./data/avatarCatalog";
import { demoScene } from "./data/demoScene";
import { analyzeDrawing } from "./utils/analyzeDrawing";

export default function App() {
  const [userName, setUserName] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [projects, setProjects] = useState(() => {
    try { return JSON.parse(localStorage.getItem("living-drawing-projects") || "[]"); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem("living-drawing-projects", JSON.stringify(projects)); }, [projects]);

  useEffect(() => () => {
    if (analysis?.previewUrl) URL.revokeObjectURL(analysis.previewUrl);
  }, [analysis]);

  const upload = async (file) => {
    setBusy(true);
    setError("");
    try {
      const result = await analyzeDrawing(file);
      setSelectedAvatar(avatarCatalog[0]);
      setAnalysis({ ...result, needsRigSetup: true });
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
    setCurrentProjectId(null);
  };

  const chooseAvatar = (avatar) => {
    setCurrentProjectId(null);
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

  const saveProject = (snapshot) => {
    const id = currentProjectId || `project-${Date.now()}`;
    const now = new Date().toISOString();
    setProjects((current) => {
      const existing = current.find((project) => project.id === id);
      const project = { id, name: existing?.name || `${selectedAvatar?.name || "我的角色"}的世界`, avatarId: selectedAvatar?.id || "explorer", createdAt: existing?.createdAt || now, updatedAt: now, snapshot };
      return [project, ...current.filter((item) => item.id !== id)].slice(0, 20);
    });
    setCurrentProjectId(id);
  };

  const openProject = (project) => {
    const avatar = avatarCatalog.find((item) => item.id === project.avatarId) || avatarCatalog[0];
    setSelectedAvatar(avatar);
    setCurrentProjectId(project.id);
    setAnalysis({ sceneObjects: demoScene.map((object) => object.type === "person" ? { ...object, avatarId: avatar.id } : { ...object }), source: "saved-project", previewUrl: null, savedState: project.snapshot, rigAnalysis: { person: { type: avatar.kind, joints: avatar.joints.length, movable: avatar.joints }, dog: { type: "小狗", joints: 7 } } });
  };

  const renameProject = (id) => {
    const current = projects.find((project) => project.id === id);
    const name = window.prompt("给作品取一个新名字", current?.name || "我的作品")?.trim();
    if (name) setProjects((items) => items.map((project) => project.id === id ? { ...project, name, updatedAt: new Date().toISOString() } : project));
  };

  const deleteProject = (id) => {
    if (window.confirm("确定删除这个本地作品吗？")) setProjects((items) => items.filter((project) => project.id !== id));
  };

  if (!userName) return <LoginScreen onLogin={setUserName} />;

  if (analysis?.needsRigSetup) return <RigEditor analysis={analysis} onConfirm={setAnalysis} onCancel={reset} />;

  return analysis
    ? <LivingWorld sceneObjects={analysis.sceneObjects} previewUrl={analysis.previewUrl} onReset={reset} selectedAvatar={selectedAvatar} rigAnalysis={analysis.rigAnalysis} userName={userName} initialState={analysis.savedState} onSave={saveProject} />
    : <CreatorHub userName={userName} onUpload={upload} onChooseAvatar={chooseAvatar} busy={busy} error={error} onLogout={() => setUserName("")} projects={projects} onOpenProject={openProject} onRenameProject={renameProject} onDeleteProject={deleteProject} />;
}
