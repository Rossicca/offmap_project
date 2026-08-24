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
        <nav className="house-pattern-tabs" aria-label="房屋花纹">
          {patternTabs.map((item) => <button key={item.id} type="button" className={group === item.id ? "is-active" : ""} onClick={() => setGroup(item.id)} aria-pressed={group === item.id}>{item.name}</button>)}
        </nav>
        <div className={`decor-house-preview pattern-${current.pattern}`} style={decorStyle(current)} aria-label={`当前装饰：${current.name}，${current.accentName}`}>
          <i className="decor-preview-roof" /><i className="decor-preview-body"><b /><b /></i><i className="decor-preview-door" />
        </div>
        <div className="house-decor-grid">
          {items.map((item) => (
            <button key={item.id} className={`${value?.id === item.id ? "is-active" : ""} pattern-${item.pattern}`} style={decorStyle(item)} type="button" onClick={() => onChange(item)} aria-pressed={value?.id === item.id}>
              <span className="decor-choice-house" aria-hidden="true"><i className="decor-choice-roof" /><i className="decor-choice-body" /><i className="decor-choice-door" /><i className="decor-choice-windows"><em /><em /></i></span>
              <b>{item.name}</b><span>{item.accentName}</span>
            </button>
          ))}
        </div>
        <button className="primary-button house-decor-done" type="button" onClick={onClose}>装好啦</button>
      </section>
    </div>
  );
}
