export default function MaterialArtwork({ item, small = false }) {
  if (!item) return null;
  return (
    <span
      className={`material-art material-${item.category} material-variant-${item.variant} ${small ? "is-small" : ""}`}
      style={{ "--material-color": item.color, "--material-accent": item.accent }}
      aria-hidden="true"
    >
      <i className="material-shape-one" />
      <i className="material-shape-two" />
      <i className="material-shape-three" />
    </span>
  );
}
