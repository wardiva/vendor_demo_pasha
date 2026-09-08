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
export default function InfoIcon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Infro-circle">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={infoGlyph} />
    </div>
  );
}
