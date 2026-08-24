export default function MaterialArtwork({ item, small = false }) {
  if (!item) return null;
  if (item.motionSprite) return <span className={`material-art material-character-art ${small ? "is-small" : ""}`} style={{ backgroundImage: `url(${item.motionSprite})`, backgroundPosition: item.frame || "0% 0%" }} aria-hidden="true" />;
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
