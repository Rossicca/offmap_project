import { useEffect, useRef, useState } from "react";
import CreatorHub from "./components/CreatorHub";
import LoginScreen from "./components/LoginScreen";
import LivingWorld from "./components/LivingWorld";
import RigEditor from "./components/RigEditor";
import WorldDrawingEditor from "./components/WorldDrawingEditor";
import CompanionMusic from "./components/CompanionMusic";
import { avatarCatalog } from "./data/avatarCatalog";
import { companionObject, demoScene } from "./data/demoScene";
import { analyzeDrawing } from "./utils/analyzeDrawing";


const releasePreview = (url) => { if (url?.startsWith("blob:")) URL.revokeObjectURL(url); };


export default function App() {
  const [userName, setUserNameState] = useState(() => localStorage.getItem("living-drawing-name") || "小小创作者");
  const [analysis, setAnalysis] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [companions, setCompanions] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [projects, setProjects] = useState(() => {
    try { return JSON.parse(localStorage.getItem("living-drawing-projects") || "[]"); } catch { return []; }
  });
  const [safety, setSafety] = useState(() => {
    try { return JSON.parse(localStorage.getItem("living-drawing-safety")) || { safeChat: true, voiceAllowed: true, sessionMinutes: 30 }; } catch { return { safeChat: true, voiceAllowed: true, sessionMinutes: 30 }; }
  });
  const previewUrlRef = useRef(null);


  useEffect(() => { localStorage.setItem("living-drawing-projects", JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem("living-drawing-safety", JSON.stringify(safety)); }, [safety]);


  const setUserName = (name) => {
    setUserNameState(name);
    if (name) localStorage.setItem("living-drawing-name", name);
    else localStorage.removeItem("living-drawing-name");
  };


  useEffect(() => () => {
    releasePreview(previewUrlRef.current);
  }, []);


  const upload = async (file) => {
    setBusy(true);
    setError("");
    try {
      const result = await analyzeDrawing(file);
      releasePreview(previewUrlRef.current);
      previewUrlRef.current = result.previewUrl;
      setSelectedAvatar(null);
      setCompanions([]);
      setAnalysis({ ...result, needsRigSetup: true });
    } catch (uploadError) {
      setError(uploadError.message || "这张图片暂时打不开，请换一张试试。 ");
    } finally {
      setBusy(false);
    }
  };


  const reset = () => {
    releasePreview(previewUrlRef.current);
    previewUrlRef.current = null;
    setAnalysis(null);
    setSelectedAvatar(null);
    setCompanions([]);
    setError("");
    setCurrentProjectId(null);
  };


  const confirmRig = (nextAnalysis) => {
    const rig = nextAnalysis.rigAnalysis.person;
    const uploadedAvatar = {
      id: "uploaded-character",
      name: rig.type === "人物" ? "我的画中伙伴" : `我的${rig.type}`,
      kind: rig.type,
      species: rig.type === "兔子" ? "rabbit" : rig.type === "人物" ? "human" : "animal",
      joints: rig.movable,
      rigNodes: rig.nodes,
      imageUrl: nextAnalysis.foregroundUrl || nextAnalysis.previewUrl,
      sourceImageUrl: nextAnalysis.previewUrl,
      imageSize: nextAnalysis.cutoutSize || nextAnalysis.imageSize,
      foregroundExtracted: Boolean(nextAnalysis.foregroundPrepared),
      isUploaded: true,
    };
    setSelectedAvatar(uploadedAvatar);
    setCompanions([uploadedAvatar]);
    setAnalysis({
      ...nextAnalysis,
      needsBackgroundSetup: true,
      sceneObjects: nextAnalysis.sceneObjects.map((object) => object.type === "person" ? { ...object, avatarId: uploadedAvatar.id, label: uploadedAvatar.name } : object),
    });
  };


  const finishCharacterBackground = (art = null) => {
    setAnalysis((current) => {
      if (!current) return current;
      const background = art?.background || null;
      return {
        ...current,
        needsBackgroundSetup: false,
        savedState: {
          ...(current.savedState || {}),
          sceneObjects: current.sceneObjects,
          sceneTheme: current.savedState?.sceneTheme || "meadow",
          worldArt: { ...(current.savedState?.worldArt || { house: null }), background },
          customObjects: current.savedState?.customObjects || [],
          replacedTypes: current.savedState?.replacedTypes || [],
        },
      };
    });
  };


  const chooseAvatar = (selection) => {
    const selectedCompanions = Array.isArray(selection) ? selection.filter(Boolean) : [selection];
    const avatar = selectedCompanions[0];
    setCurrentProjectId(null);
    setSelectedAvatar(avatar);
    setCompanions(selectedCompanions);
    setAnalysis({
      sceneObjects: [...demoScene.map((object) => object.type === "person" ? { ...object, avatarId: avatar.id } : { ...object }), ...(selectedCompanions[1] ? [{ ...companionObject, avatarId: selectedCompanions[1].id, label: selectedCompanions[1].name }] : [])],
      source: "avatar-library",
      previewUrl: null,
      rigAnalysis: {
        person: { type: avatar.kind, joints: avatar.joints.length, movable: avatar.joints },
        dog: { type: "小狗", joints: 7, movable: ["头", "躯干", "四腿", "尾巴"] },
      },
    });
  };


  const createBackgroundWorld = (background) => {
    const avatar = avatarCatalog[0];
    const sceneObjects = demoScene.map((object) => object.type === "person" ? { ...object, avatarId: avatar.id } : { ...object });
    setCurrentProjectId(null);
    setSelectedAvatar(avatar);
    setCompanions([avatar]);
    setAnalysis({
      sceneObjects,
      source: "background-canvas",
      previewUrl: null,
      savedState: {
        sceneObjects,
        sceneTheme: "meadow",
        worldArt: { house: null, background },
        customObjects: [],
        replacedTypes: [],
      },
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
      const avatarData = selectedAvatar?.isUploaded ? { ...selectedAvatar } : null;
      const project = { id, name: existing?.name || (analysis?.source === "background-canvas" ? "我的手绘背景世界" : `${selectedAvatar?.name || "我的角色"}的世界`), avatarId: selectedAvatar?.id || "explorer", avatarData, companionIds: companions.map((avatar) => avatar.id), createdAt: existing?.createdAt || now, updatedAt: now, snapshot };
      const next = [project, ...current.filter((item) => item.id !== id)].slice(0, 20);
      while (next.length > 1 && JSON.stringify(next).length > 4_200_000) next.pop();
      return next;
    });
    setCurrentProjectId(id);
  };


  const openProject = (project) => {
    const restoredUploadedAvatar = project.avatarData?.isUploaded ? project.avatarData : null;
    const restoredCompanions = restoredUploadedAvatar ? [restoredUploadedAvatar] : (project.companionIds?.length ? project.companionIds : [project.avatarId]).map((id) => avatarCatalog.find((item) => item.id === id)).filter(Boolean);
    const avatar = restoredCompanions[0] || avatarCatalog[0];
    previewUrlRef.current = restoredUploadedAvatar?.sourceImageUrl || restoredUploadedAvatar?.imageUrl || null;
    setSelectedAvatar(avatar);
    setCompanions(restoredCompanions.length ? restoredCompanions : [avatar]);
    setCurrentProjectId(project.id);
    setAnalysis({ sceneObjects: project.snapshot?.sceneObjects || [...demoScene.map((object) => object.type === "person" ? { ...object, avatarId: avatar.id } : { ...object }), ...(restoredCompanions[1] ? [{ ...companionObject, avatarId: restoredCompanions[1].id, label: restoredCompanions[1].name }] : [])], source: restoredUploadedAvatar ? "saved-upload" : "saved-project", previewUrl: restoredUploadedAvatar?.sourceImageUrl || restoredUploadedAvatar?.imageUrl || null, savedState: project.snapshot, rigAnalysis: { person: { type: avatar.kind, joints: avatar.joints.length, movable: avatar.joints, nodes: avatar.rigNodes }, dog: { type: "小狗", joints: 7 } } });
  };


  const renameProject = (id) => {
    const current = projects.find((project) => project.id === id);
    const name = window.prompt("给作品取一个新名字", current?.name || "我的作品")?.trim();
    if (name) setProjects((items) => items.map((project) => project.id === id ? { ...project, name, updatedAt: new Date().toISOString() } : project));
  };


  const deleteProject = (id) => {
    if (window.confirm("确定删除这个本地作品吗？")) setProjects((items) => items.filter((project) => project.id !== id));
  };


  const clearLocalData = () => {
    if (!window.confirm("确定清除所有本地作品、聊天和语音设置吗？此操作无法撤销。")) return;
    setProjects([]);
    setCurrentProjectId(null);
    localStorage.removeItem("living-drawing-voice");
    if (analysis) reset();
  };


  let screen;
  if (!userName) screen = <LoginScreen onLogin={setUserName} />;
  else if (analysis?.needsRigSetup) screen = <RigEditor analysis={analysis} onConfirm={confirmRig} onCancel={reset} />;
  else if (analysis?.needsBackgroundSetup) screen = (
    <main className="creator-page character-background-step">
      <header className="character-background-header">
        <div><span>第 3 步，共 3 步</span><h1>再给你的伙伴画一个背景</h1><p>人物已经保存好了。现在画出的背景会和人物一起进入游戏世界。</p></div>
        <div><button type="button" onClick={() => setAnalysis((current) => ({ ...current, needsRigSetup: true, needsBackgroundSetup: false }))}>← 返回关节调整</button><button type="button" onClick={() => finishCharacterBackground()}>暂时不画，直接进入世界</button></div>
      </header>
      <WorldDrawingEditor
        initialArt={{ house: null, background: analysis.savedState?.worldArt?.background || null }}
        initialMode="background"
        embedded
        backgroundOnly
        onApply={finishCharacterBackground}
      />
    </main>
  );


  else screen = analysis
      ? <LivingWorld sceneObjects={analysis.sceneObjects} previewUrl={analysis.previewUrl} onReset={reset} selectedAvatar={selectedAvatar} companions={companions.length ? companions : [selectedAvatar].filter(Boolean)} rigAnalysis={analysis.rigAnalysis} userName={userName} initialState={analysis.savedState} onSave={saveProject} safety={safety} onSafetyChange={(patch) => setSafety((current) => ({ ...current, ...patch }))} onClearLocalData={clearLocalData} />
      : <CreatorHub userName={userName} onUpload={upload} onChooseAvatar={chooseAvatar} onCreateBackground={createBackgroundWorld} busy={busy} error={error} onLogout={() => setUserName("")} projects={projects} onOpenProject={openProject} onRenameProject={renameProject} onDeleteProject={deleteProject} />;

  return <>{screen}{userName && <CompanionMusic variant="floating" />}</>;
}
