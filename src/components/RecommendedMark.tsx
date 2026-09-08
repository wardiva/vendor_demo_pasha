import aiFillGlyph from "@/components/company/assets/ai-fill.svg";

/**
 * The AI-recommended mark.
 *
 * One implementation for the Prospects page card's contact tag and the Signals
 * table's contact column, so the two can never drift. The glyph sits slightly
 * inset in its box and nudged half a pixel right, exactly as the card draws it
 * at 11px; both are scaled from `size` so a larger mark keeps those ratios.
 * The table's cell (Figma 117:506) draws the glyph filling its box instead, so
 * `glyph` can override that size.
 */
export default function RecommendedMark({ size = 11, glyph }: { size?: number; glyph?: number }) {
  const scale = size / 11;
  const inner = glyph ?? 10 * scale;
  return (
    <div className="relative shrink-0" data-name="ai-fill 1" style={{ width: size, height: size }}>
      <div
        className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2"
        data-name="Group"
        style={{
          left: glyph ? "50%" : `calc(50% + ${0.5 * scale}px)`,
          width: inner,
          height: inner,
        }}
      >
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={aiFillGlyph} />
      </div>
    </div>
  );
}
