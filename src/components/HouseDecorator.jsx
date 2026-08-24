import { useMemo, useState } from "react";
import { houseDecorCatalog, houseDecorCount } from "../data/materialCatalog";
import useDialogFocus from "../hooks/useDialogFocus";

const patternTabs = [
  { id: "dots", name: "圆点" },
  { id: "stripes", name: "条纹" },
  { id: "checks", name: "方格" },
  { id: "petals", name: "花朵" },
  { id: "stars", name: "星星" },
];

const decorStyle = (decor) => ({
  "--house-wall": decor.wall,
  "--house-roof": decor.roof,
  "--house-door": decor.door,
  "--house-trim": decor.trim,
  "--house-accent": decor.accent,
});

function DecorHouse({ decor, className = "" }) {
  return <span className={`decor-house-model house-object ${className}`} style={decorStyle(decor)} aria-hidden="true">
    <i className="cottage-chimney" />
    <i className="house-roof" />
    <i className={`house-body pattern-${decor.pattern}`}><b className="window left" /><b className="window right" /><b className="door" /></i>
  </span>;
}

export default function HouseDecorator({ value, onChange, onClose }) {
  const [group, setGroup] = useState(value?.group || "dots");
  const items = useMemo(() => houseDecorCatalog.filter((item) => item.group === group), [group]);
  const current = value || houseDecorCatalog[0];
  const dialogRef = useDialogFocus(onClose);

  return (
    <div className="house-decor-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section ref={dialogRef} className="house-decorator" role="dialog" aria-modal="true" aria-labelledby="house-decor-title">
        <header>
          <div><h2 id="house-decor-title">给小房子换衣服</h2><p>{houseDecorCount} 种装饰，点一个马上看看。</p></div>
          <button className="round-close" type="button" onClick={onClose} aria-label="关闭房屋装饰">×</button>
        </header>
        <div className="house-decorator-workspace">
          <aside className="house-current-look" aria-label={`当前装饰：${current.name}，${current.accentName}`}>
            <DecorHouse decor={current} className="decor-house-preview" />
            <b>{current.name}</b><span>{current.accentName} · 点击右侧立即预览</span>
          </aside>
          <div className="house-decorator-options">
            <nav className="house-pattern-tabs" aria-label="房屋花纹">
              {patternTabs.map((item) => <button key={item.id} type="button" className={group === item.id ? "is-active" : ""} onClick={() => setGroup(item.id)} aria-pressed={group === item.id}>{item.name}</button>)}
            </nav>
            <div className="house-decor-grid">
              {items.map((item) => (
                <button key={item.id} className={value?.id === item.id ? "is-active" : ""} type="button" onClick={() => onChange(item)} aria-pressed={value?.id === item.id}>
                  <DecorHouse decor={item} className="decor-choice-house" />
                  <span className="house-choice-copy"><b>{item.name}</b><small>{item.accentName}</small></span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <button className="primary-button house-decor-done" type="button" onClick={onClose}>装好啦</button>
      </section>
    </div>
  );
}
