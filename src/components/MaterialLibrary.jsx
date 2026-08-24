import { useMemo, useState } from "react";
import { materialCatalog, materialCategories, materialCount } from "../data/materialCatalog";
import MaterialArtwork from "./MaterialArtwork";
import useDialogFocus from "../hooks/useDialogFocus";

export default function MaterialLibrary({ onAdd, onClose }) {
  const [category, setCategory] = useState("character");
  const items = useMemo(() => materialCatalog.filter((item) => item.category === category), [category]);
  const active = materialCategories.find((item) => item.id === category);
  const dialogRef = useDialogFocus(onClose);

  return (
    <div className="play-library-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section ref={dialogRef} className="play-library" role="dialog" aria-modal="true" aria-labelledby="play-library-title">
        <header>
          <div><h2 id="play-library-title">选一个放进去</h2><p>{materialCount} 个手绘素材，点一下就加入世界。</p></div>
          <button className="round-close" type="button" onClick={onClose} aria-label="关闭素材库">×</button>
        </header>
        <nav className="play-library-tabs" aria-label="素材分类">
          {materialCategories.map((item) => (
            <button key={item.id} type="button" className={category === item.id ? "is-active" : ""} onClick={() => setCategory(item.id)} aria-pressed={category === item.id}>
              {item.shortName}
            </button>
          ))}
        </nav>
        <div className="play-library-heading"><b>{active?.name}</b><span>{items.length} 个</span></div>
        <div className="play-library-grid">
          {items.map((item) => (
            <button key={item.id} type="button" onClick={() => onAdd(item)} aria-label={`把${item.name}放进世界`}>
              <MaterialArtwork item={item} small />
              <b>{item.name}</b>
              <span>{item.category === "background" ? "换背景" : "放进去"}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
