export default function MaterialArtwork({ item, small = false }) {
  if (!item) return null;
  if (item.artSheet) return <span className={`material-art material-sprite-art ${small ? "is-small" : ""}`} style={{ backgroundImage: `url(${item.artSheet})`, backgroundPosition: item.artPosition, backgroundSize: item.artSize }} aria-hidden="true" />;
  if (item.motionSprite) return <span className={`material-art material-character-art ${small ? "is-small" : ""}`} style={{ backgroundImage: `url(${item.motionSprite})`, backgroundPosition: item.frame || "0% 0%" }} aria-hidden="true" />;
  if (item.sceneObject) {
    const type = item.sceneObject.type;
    const artwork = {
      sun: <span className="world-sun-art"><i /></span>,
      tree: <span className={`world-tree-art tree-${item.sceneObject.treeVariant || "plain"}`}><i /><b />{item.sceneObject.treeVariant && <em className="tree-fruits">{Array.from({ length: item.sceneObject.treeVariant === "blossom" ? 9 : 7 }, (_, index) => <span key={index} />)}</em>}</span>,
      food: <span className="world-apple-art"><i /></span>,
      dogToy: <span className="world-dog-toy-art"><i /><b /></span>,
      fetchBall: <span className="world-fetch-ball-art"><i /></span>,
      toyBasket: <span className="world-toy-basket-art"><i /><b /><em><u /><small /></em></span>,
    }[type];
    return <span className={`material-art material-interactive-art preview-${type} ${small ? "is-small" : ""}`} aria-hidden="true">{artwork}</span>;
  }
  if (item.category === "doghouse") {
    return <span className={`doghouse-choice-art variant-${item.variant} ${small ? "is-small" : ""}`} style={{ "--doghouse-roof": item.roof, "--doghouse-wall": item.wall, "--doghouse-door": item.door, "--doghouse-sign": item.sign }} aria-hidden="true"><i /><b><em /></b><small>🐾</small><u /></span>;
  }
  return (
    <span
      className={`material-art material-${item.category} material-${item.id} material-variant-${item.variant} ${small ? "is-small" : ""}`}
      style={{ "--material-color": item.color, "--material-accent": item.accent }}
      aria-hidden="true"
    >
      <i className="material-shape-one" />
      <i className="material-shape-two" />
      <i className="material-shape-three" />
      <i className="material-shape-four" />
      <i className="material-shape-five" />
      <i className="material-shape-six" />
    </span>
  );
}
