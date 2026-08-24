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
import { clearProjects, loadProjects, migrateLegacyProjects, removeProject, storeProject } from "./utils/projectStorage";


const releasePreview = (url) => { if (url?.startsWith("blob:")) URL.revokeObjectURL(url); };
const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ""));
  reader.onerror = () => reject(reader.error || new Error("画作读取失败。"));
  reader.readAsDataURL(file);
});


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


  useEffect(() => {
    let active = true;
    loadProjects()
      .then(async (stored) => stored.length ? stored : migrateLegacyProjects())
      .then((stored) => { if (active && stored.length) setProjects(stored); })
      .catch((storageError) => console.warn("作品数据库暂时不可用：", storageError.message));
    return () => { active = false; };
  }, []);
  useEffect(() => { localStorage.setItem("living-drawing-safety", JSON.stringify(safety)); }, [safety]);


  const setUserName = (name) => {
    setUserNameState(name);
    if (name) localStorage.setItem("living-drawing-name", name);
    else localStorage.removeItem("living-drawing-name");
  };


  useEffect(() => () => {
    releasePreview(previewUrlRef.current);
  }, []);


  const upload = async (file, options = {}) => {
    setBusy(true);
    setError("");
    try {
      const [result, editableImageUrl] = await Promise.all([
        analyzeDrawing(file, options),
        options.inputOrigin === "canvas" ? fileToDataUrl(file) : Promise.resolve(""),
      ]);
      releasePreview(previewUrlRef.current);
      previewUrlRef.current = result.previewUrl;
      setSelectedAvatar(null);
      setCompanions([]);
      setAnalysis({
        ...result,
        sceneObjects: options.savedState?.sceneObjects || result.sceneObjects,
        savedState: options.savedState || null,
        editableImageUrl,
        needsRigSetup: true,
      });
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
      sourceImageUrl: nextAnalysis.originalPreviewUrl || nextAnalysis.previewUrl,
      imageSize: nextAnalysis.cutoutSize || nextAnalysis.imageSize,
      foregroundExtracted: Boolean(nextAnalysis.cutoutApplied),
      preserveSourceArt: !nextAnalysis.cutoutApplied,
      cutoutApplied: Boolean(nextAnalysis.cutoutApplied),
      armRig: nextAnalysis.armRig || null,
      inputOrigin: nextAnalysis.inputOrigin || "upload",
      editableImageUrl: nextAnalysis.editableImageUrl || "",
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


  const changeWorldAvatar = (avatar) => {
    const previousId = selectedAvatar?.id;
    setSelectedAvatar(avatar);
    setCompanions((current) => [avatar, ...current.filter((item) => item.id !== previousId && item.id !== avatar.id && item.species !== "robot")]);
    setAnalysis((current) => current ? {
      ...current,
      sceneObjects: current.sceneObjects.map((object) => object.type === "person" && (!previousId || object.avatarId === previousId) ? { ...object, avatarId: avatar.id, label: avatar.name } : object),
    } : current);
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
      void storeProject(project).catch((storageError) => {
        console.error("作品保存失败：", storageError);
        window.alert("作品没有成功保存，请检查浏览器存储权限后再试一次。");
      });
      return [project, ...current.filter((item) => item.id !== id)];
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

  const editProjectArtwork = (project, file) => {
    setCurrentProjectId(project.id);
    void upload(file, { inputOrigin: "canvas", editingProjectId: project.id, savedState: project.snapshot });
  };


  const renameProject = (id) => {
    const current = projects.find((project) => project.id === id);
    const name = window.prompt("给作品取一个新名字", current?.name || "我的作品")?.trim();
    if (name) setProjects((items) => items.map((project) => {
      if (project.id !== id) return project;
      const renamed = { ...project, name, updatedAt: new Date().toISOString() };
      void storeProject(renamed).catch((storageError) => console.error("作品重命名保存失败：", storageError));
      return renamed;
    }));
  };


  const deleteProject = (id) => {
    if (window.confirm("确定删除这个本地作品吗？")) {
      setProjects((items) => items.filter((project) => project.id !== id));
      void removeProject(id).catch((storageError) => console.error("作品删除失败：", storageError));
    }
  };


  const clearLocalData = () => {
    if (!window.confirm("确定清除所有本地作品、聊天和语音设置吗？此操作无法撤销。")) return;
    setProjects([]);
    setCurrentProjectId(null);
    void clearProjects().catch((storageError) => console.error("作品数据库清理失败：", storageError));
    localStorage.removeItem("living-drawing-projects");
    localStorage.removeItem("living-drawing-voice");
    localStorage.removeItem("living-drawing-avatar-growth");
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
      ? <LivingWorld sceneObjects={analysis.sceneObjects} previewUrl={analysis.previewUrl} onReset={reset} selectedAvatar={selectedAvatar} companions={companions.length ? companions : [selectedAvatar].filter(Boolean)} onAvatarChange={changeWorldAvatar} rigAnalysis={analysis.rigAnalysis} userName={userName} initialState={analysis.savedState} onSave={saveProject} editingProjectName={projects.find((project) => project.id === currentProjectId)?.name || ""} safety={safety} onSafetyChange={(patch) => setSafety((current) => ({ ...current, ...patch }))} onClearLocalData={clearLocalData} />
      : <CreatorHub userName={userName} onUpload={upload} onEditArtwork={editProjectArtwork} onChooseAvatar={chooseAvatar} onCreateBackground={createBackgroundWorld} busy={busy} error={error} onLogout={() => setUserName("")} projects={projects} onOpenProject={openProject} onRenameProject={renameProject} onDeleteProject={deleteProject} />;

  return <>{screen}{userName && <CompanionMusic variant="floating" />}</>;
}
