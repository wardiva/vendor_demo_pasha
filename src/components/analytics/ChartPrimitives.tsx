import type { Slice } from "@/data/signals";

/**
 * Shared building blocks for the Signals page analytics cards.
 * Visual language (colours, radii, type scale) matches the imported design.
 */

/** Longest bar fills this share of its track, so bars never touch the edge. */
export const MAX_BAR_FILL = 0.88;

/** Bar length as a percentage string, scaled against the largest value shown. */
export function barWidth(count: number, max: number): string {
  if (max <= 0 || count <= 0) return "0%";
  return `${(count / max) * MAX_BAR_FILL * 100}%`;
}

export function largest(slices: Slice[]): number {
  return slices.reduce((m, s) => Math.max(m, s.count), 0);
}

/**
 * Shown inside a card when the active filters match nothing, so the card keeps
 * its shape instead of collapsing into an empty box.
 */
export function CardEmptyState({ message = "No companies match your filters" }: { message?: string }) {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-center justify-center min-h-px relative w-full">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <circle cx="14" cy="14" r="12" stroke="#072929" strokeOpacity="0.18" strokeWidth="1.5" />
        <path d="M9.5 14h9" stroke="#072929" strokeOpacity="0.32" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[19px] not-italic text-[13px] text-[rgba(47,43,61,0.7)] text-center">
        {message}
      </p>
    </div>
  );
}

/* ─────────────────────────── donut ─────────────────────────── */

const BOX = 171;
const CENTER = BOX / 2;
const RADIUS = 78.35;
const STROKE = 14.3;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Arc length dropped between adjacent segments to reproduce the design's gaps. */
const GAP = 14;

const RING_COLOR = "#072929";

/**
 * Proportional donut replacing the design's three fixed arcs. Segment order and
 * colours are preserved; only the sweep is now driven by the data.
 */
/**
 * @param total  The ring's full sweep, from the figures the chart is heading
 *               for. Passing it lets the arcs be drawn from counts that are
 *               still moving: dividing by their own running sum would hold
 *               every arc at its final proportion and the ring would never
 *               appear to draw itself.
 */
export function DonutChart({ slices, total: fullTotal }: { slices: Slice[]; total?: number }) {
  const bySize = new Map(slices.map(s => [s.label, s]));
  /* Original render order, outermost first: High is the solid arc at the top. */
  const segments = [
    { label: "High", opacity: 1 },
    { label: "Low", opacity: 0.08 },
    { label: "Medium", opacity: 0.32 },
  ].map(s => ({ ...s, count: bySize.get(s.label)?.count ?? 0 }));

  const total = fullTotal ?? segments.reduce((sum, s) => sum + s.count, 0);
  const drawn = segments.filter(s => s.count > 0);

  let offset = 0;
  return (
    <div className="relative shrink-0 size-[171px]">
      <svg className="absolute block inset-0 size-full" viewBox={`0 0 ${BOX} ${BOX}`} fill="none">
        {total === 0 && (
          <circle
            cx={CENTER} cy={CENTER} r={RADIUS}
            stroke={RING_COLOR} strokeOpacity={0.08} strokeWidth={STROKE}
          />
        )}
        {drawn.map(seg => {
          const arc = (seg.count / total) * CIRCUMFERENCE;
          /* A lone segment wraps the full ring, so it needs no gap or caps. */
          const solo = drawn.length === 1;
          /* A segment shorter than its own gap has nothing left to draw, and
             would otherwise show as a dot on the way up or down. */
          const dash = solo ? Math.min(arc, CIRCUMFERENCE) : Math.max(arc - GAP, 0.01);
          if (dash <= 0.01) { offset += arc; return null; }
          const rotation = (offset / CIRCUMFERENCE) * 360 - 90;
          offset += arc;
          return (
            <circle
              key={seg.label}
              cx={CENTER} cy={CENTER} r={RADIUS}
              stroke={RING_COLOR} strokeOpacity={seg.opacity} strokeWidth={STROKE}
              strokeLinecap={solo ? "butt" : "round"}
              strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
              transform={`rotate(${rotation + (solo ? 0 : (GAP / 2 / CIRCUMFERENCE) * 360)} ${CENTER} ${CENTER})`}
            />
          );
        })}
      </svg>
    </div>
  );
}
