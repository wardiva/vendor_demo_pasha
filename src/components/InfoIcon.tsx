import infoGlyph from "./assets/icon-info.svg";

/**
 * The Buyer Intent info icon — one implementation for the whole module.
 *
 * Figma 37:4060, as exported: the circle, the stem and the dot are one asset
 * drawn in its own 16x16 box, rather than three separately-inset SVGs pieced
 * back together. Same box, same #2F2B3D at 0.6 opacity as before, so every
 * instance renders identically and at the same size it always did. Anywhere an
 * info icon appears in Buyer Intent should use this rather than its own copy.
 */
export default function InfoIcon({ size = 16 }: { size?: number }) {
  return (
    /* 16 everywhere it has always been; the Prospect Details modal's panel
       headings draw it at 14 (Figma 5:130), so the box is a prop rather than a
       second copy of the same glyph. */
    <div className="relative shrink-0" data-name="Infro-circle" style={{ width: size, height: size }}>
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={infoGlyph} />
    </div>
  );
}
