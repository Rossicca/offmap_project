import { doghouseCatalog } from "../data/materialCatalog";
import useDialogFocus from "../hooks/useDialogFocus";

const decorStyle = (decor) => ({
  "--doghouse-roof": decor.roof,
  "--doghouse-wall": decor.wall,
  "--doghouse-door": decor.door,
  "--doghouse-sign": decor.sign,
});

function DoghouseArt({ decor }) {
  return <span className={`doghouse-choice-art variant-${decor.variant}`} style={decorStyle(decor)} aria-hidden="true"><i /><b><em /></b><small>🐾</small><u /></span>;
}

export default function DoghouseDecorator({ value, onChange, onClose }) {
  const current = value || doghouseCatalog[0];
  const dialogRef = useDialogFocus(onClose);

  return (
    <div className="doghouse-decor-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section ref={dialogRef} className="doghouse-decorator" role="dialog" aria-modal="true" aria-labelledby="doghouse-decor-title">
        <header><div><h2 id="doghouse-decor-title">给狗狗挑一个小窝</h2><p>8 种不同造型，点一个马上换上。</p></div><button className="round-close" type="button" onClick={onClose} aria-label="关闭狗窝样式">×</button></header>
        <div className="doghouse-current-preview"><DoghouseArt decor={current} /><b>{current.name}</b></div>
        <div className="doghouse-decor-grid">
          {doghouseCatalog.map((item) => <button key={item.id} className={current.id === item.id ? "is-active" : ""} type="button" onClick={() => onChange(item)} aria-pressed={current.id === item.id}><DoghouseArt decor={item} /><b>{item.name}</b></button>)}
        </div>
        <button className="primary-button doghouse-decor-done" type="button" onClick={onClose}>选好啦</button>
      </section>
    </div>
  );
}
