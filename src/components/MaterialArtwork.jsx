export default function MaterialArtwork({ item, small = false }) {
  if (!item) return null;
  if (item.motionSprite) return <span className={`material-art material-character-art ${small ? "is-small" : ""}`} style={{ backgroundImage: `url(${item.motionSprite})`, backgroundPosition: item.frame || "0% 0%", ...(item.paperBlend ? { mixBlendMode: "multiply", filter: "brightness(1.025) contrast(1.035) drop-shadow(0 6px 4px rgba(77,60,43,.14))" } : {}) }} aria-hidden="true" />;
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
