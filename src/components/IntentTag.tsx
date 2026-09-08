/**
 * The Intent Score tag, and the one place its colour is decided.
 *
 * The fill is the only thing that varies: everything else — the 6px radius,
 * 2px/10px padding, 24px minimum width, 11px medium type in #2f2b3d — is the
 * design's and is fixed. Any surface that shows an `Intent XX%` tag should
 * render this rather than repeat the mapping, so the bands cannot drift apart.
 */

/** Figma's bands: warm through to green as intent climbs. */
export function intentTagColor(score: number): string {
  if (score >= 71) return "#C3FFC9";
  if (score >= 51) return "#E6FFC3";
  /* The bands start at 30. Nothing in the data sits below it, and a score that
     did would still be low intent, so it takes the low band's fill rather than
     rendering with no colour at all. */
  return "#FEFFCA";
}

export default function IntentTag({
  score,
  compact = false,
}: {
  score: number;
  /**
   * The prospect card's chip — Figma 219:1009. It runs 8px of horizontal
   * padding against the default's 10, a single pixel top and bottom against
   * two, and takes its height from the row it sits in rather than from its own
   * padding, which is what holds it level with the industry and date beside it.
   * The fill, radius, minimum width and type are the tag's own either way. Both
   * prospects tables and the modal keep the default.
   */
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "flex flex-row items-center relative self-stretch shrink-0"
          : "content-stretch flex flex-col items-center justify-center relative shrink-0"
      }
      data-name="Chip"
    >
      <div
        className={`content-stretch flex gap-[4px] items-center justify-center min-w-[24px] relative rounded-[6px] shrink-0 ${
          compact ? "h-full px-[8px] py-px" : "px-[10px] py-[2px]"
        }`}
        style={{ backgroundColor: intentTagColor(score) }}
        data-name="chip bg-label-info"
      >
        <div
          className={`[word-break:break-word] capitalize flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative text-[#2f2b3d] text-[11px] text-center ${
            compact ? "shrink-0 whitespace-nowrap" : "flex-[1_0_0] min-w-px"
          }`}
        >
          <p className="leading-[18px]">{`Intent ${score}%`}</p>
        </div>
      </div>
    </div>
  );
}
