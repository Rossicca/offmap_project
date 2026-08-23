import { avatarCatalog, characterSprite } from "../data/avatarCatalog";

export default function ProjectGallery({ projects, onOpen, onRename, onDelete, onClose }) {
  return (
    <section className="project-gallery" aria-labelledby="gallery-title">
      <header><div><h2 id="gallery-title">我的作品</h2><p>作品只保存在当前浏览器中。</p></div><button type="button" onClick={onClose}>返回角色库</button></header>
      {projects.length === 0 ? <div className="gallery-empty"><span aria-hidden="true">✦</span><h3>还没有保存的世界</h3><p>选择一个角色进入互动世界，然后点击“保存作品”。</p><button className="primary-button" type="button" onClick={onClose}>开始第一个作品</button></div> : <div className="project-grid">{projects.map((project) => {
        const avatar = avatarCatalog.find((item) => item.id === project.avatarId) || avatarCatalog[0];
        const projectAvatarName = project.avatarData?.name || avatar.name;
        return <article className="project-card" key={project.id}><span className="project-thumb">{project.avatarData?.imageUrl ? <img src={project.avatarData.imageUrl} alt="" /> : <i style={{ backgroundImage: `url(${characterSprite})`, backgroundPosition: avatar.spritePosition }} />}</span><div><small>{new Date(project.updatedAt).toLocaleDateString("zh-CN")}</small><h3>{project.name}</h3><p>{projectAvatarName} · {project.snapshot?.messages?.length || 1} 条对话</p></div><div className="project-card-actions"><button type="button" onClick={() => onOpen(project)}>继续创作</button><button type="button" onClick={() => onRename(project.id)}>重命名</button><button type="button" onClick={() => onDelete(project.id)}>删除</button></div></article>;
      })}</div>}
    </section>
  );
}
