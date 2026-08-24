import { getGrowthProgress, growthLevels } from "../utils/avatarGrowth";

export default function AvatarGrowthCard({ growth, compact = false }) {
  const { totalXp, current, next, progress, xpToNext } = getGrowthProgress(growth);
  if (compact) {
    return <span className="growth-compact-copy"><b>成长 Lv.{current.level}</b><span>{current.title}</span></span>;
  }
  return (
    <section className="avatar-growth-card" aria-labelledby="avatar-growth-title">
      <div className="growth-level-stamp" aria-hidden="true"><b>{current.level}</b><span>等级</span></div>
      <div className="growth-card-body">
        <div className="growth-card-heading"><div><h3 id="avatar-growth-title">{current.title}</h3><p>一起学习、创作和完成故事，就会慢慢长大。</p></div><strong>{totalXp} 经验</strong></div>
        <div className="growth-progress-track" role="progressbar" aria-label="伙伴成长进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(progress * 100)}><i style={{ "--growth-progress": progress }} /></div>
        <div className="growth-next-copy">{next ? <><span>再获得 {xpToNext} 经验</span><b>下一步：{next.reward}</b></> : <><span>已经到达最高等级</span><b>{current.reward}</b></>}</div>
        <ol className="growth-milestones" aria-label="成长等级">
          {growthLevels.map((item) => <li key={item.level} className={item.level <= current.level ? "is-earned" : ""}><i>{item.level}</i><span>{item.title}</span></li>)}
        </ol>
      </div>
    </section>
  );
}
