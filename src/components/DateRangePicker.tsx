import { useLayoutEffect, useRef, useState } from "react";

/**
 * Date range picker for the Buyer Intent date field.
 *
 * Chrome, spacing and controls are the filter panel's: the same card class,
 * the same 1px divider and footer, the same dark Apply button and the same
 * hover / selected tints, so the two dropdowns read as one family.
 */

const CARD_CLASS =
  "bg-white rounded-[12px] shadow-[0px_4px_18px_0px_rgba(47,43,61,0.16)] overflow-hidden flex flex-col";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const CARD_W = 268;

/** The picker's width, for callers that right-align it against their field. */
export const DATE_PICKER_WIDTH = CARD_W;
/** Kept clear of the viewport edges, matching the filter panel's 8px rhythm. */
const EDGE_GAP = 8;

export type DateRange = { start: Date; end: Date };

export function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Month and day only, as the toolbars label their range: "Aug 9  →  Sep 9". */
export function formatShortDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();

/** Days shown for a month, padded with the neighbouring months' days. */
function monthGrid(view: Date) {
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export default function DateRangePicker({
  position,
  initial,
  onApply,
  onClose,
}: {
  position: { x: number; y: number };
  initial: DateRange;
  onApply: (range: DateRange) => void;
  onClose: () => void;
}) {
  const [view, setView] = useState(
    () => new Date(initial.start.getFullYear(), initial.start.getMonth(), 1),
  );
  const [start, setStart] = useState<Date | null>(initial.start);
  const [end, setEnd] = useState<Date | null>(initial.end);
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(position);

  /* Clamp into the viewport once the card's real size is known, flipping above
     the field when there is not enough room below it. */
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    /* clientWidth/Height, not innerWidth/Height: the latter count the
       scrollbars, which the picker cannot actually be drawn over. */
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const maxX = vw - width - EDGE_GAP;
    let y = position.y;
    if (y + height > vh - EDGE_GAP) {
      /* position.y sits just below the field; the field itself is 34 tall. */
      const above = position.y - 6 - height - 34;
      y = above >= EDGE_GAP ? above : Math.max(EDGE_GAP, vh - height - EDGE_GAP);
    }
    setPos({ x: Math.max(EDGE_GAP, Math.min(position.x, maxX)), y });
  }, [position.x, position.y]);

  const pick = (d: Date) => {
    const day = startOfDay(d);
    /* First click starts a new range, the second closes it. */
    if (!start || (start && end)) {
      setStart(day);
      setEnd(null);
      return;
    }
    if (day < start) {
      setStart(day);
      setEnd(start);
      return;
    }
    setEnd(day);
  };

  const inRange = (d: Date) => {
    if (!start || !end) return false;
    const t = startOfDay(d).getTime();
    return t > startOfDay(start).getTime() && t < startOfDay(end).getTime();
  };
  const isEdge = (d: Date) => (!!start && sameDay(d, start)) || (!!end && sameDay(d, end));

  const shiftMonth = (by: number) =>
    setView(v => new Date(v.getFullYear(), v.getMonth() + by, 1));

  const days = monthGrid(view);
  const canApply = !!start && !!end;

  return (
    <div
      className="fixed z-[9999]"
      data-date-picker=""
      style={{ left: pos.x, top: pos.y }}
      onClick={e => e.stopPropagation()}
    >
      <div ref={cardRef} className={CARD_CLASS} style={{ width: CARD_W }}>
        {/* Month navigation */}
        <div className="flex items-center justify-between px-[14px] pt-[12px] pb-[8px]">
          <button
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="flex items-center justify-center size-[24px] rounded-[6px] cursor-pointer text-[#072929] hover:bg-[rgba(7,41,41,0.06)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M8.75 3.5 5.25 7l3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <p className="font-['Inter',sans-serif] font-medium text-[13px] leading-[22px] text-[#2f2b3d]">
            {view.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
          <button
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="flex items-center justify-center size-[24px] rounded-[6px] cursor-pointer text-[#072929] hover:bg-[rgba(7,41,41,0.06)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M5.25 3.5 8.75 7l-3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 px-[12px] pb-[2px]">
          {WEEKDAYS.map((w, i) => (
            <div
              key={i}
              className="flex items-center justify-center h-[24px] font-['Inter',sans-serif] font-normal text-[11px] text-[rgba(47,43,61,0.55)]"
            >
              {w}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 px-[12px] pb-[10px]">
          {days.map((d, i) => {
            const outside = d.getMonth() !== view.getMonth();
            const edge = isEdge(d);
            const between = inRange(d);
            const tone = edge
              ? "bg-[#072929] text-white font-medium rounded-[6px]"
              : between
                ? "bg-[rgba(7,41,41,0.08)] text-[#072929]"
                : outside
                  ? "rounded-[6px] text-[rgba(47,43,61,0.35)] hover:bg-[rgba(7,41,41,0.06)]"
                  : "rounded-[6px] text-[#2f2b3d] hover:bg-[rgba(7,41,41,0.06)]";
            return (
              <button
                key={i}
                onClick={() => pick(d)}
                className={`flex items-center justify-center h-[30px] cursor-pointer font-['Inter',sans-serif] text-[12px] transition-colors ${tone}`}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>

        {/* Footer — the filter cards' divider, labels and buttons */}
        <div>
          <div style={{ height: 1, background: "rgba(47,43,61,0.06)", margin: "0 10px" }} />
          <div className="flex items-center justify-between px-[14px] py-[8px] gap-[8px]">
            <button
              onClick={() => {
                setStart(initial.start);
                setEnd(initial.end);
                setView(new Date(initial.start.getFullYear(), initial.start.getMonth(), 1));
              }}
              className="cursor-pointer font-['Inter',sans-serif] text-[11px] font-normal text-[#072929]/50 hover:text-[#072929] transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => {
                if (start && end) {
                  onApply({ start, end });
                  onClose();
                }
              }}
              disabled={!canApply}
              className="flex items-center justify-center px-[12px] rounded-[8px] cursor-pointer font-['Inter',sans-serif] text-[12px] font-medium text-white bg-[#072929] hover:bg-[#0a3a3a] transition-colors disabled:opacity-40 disabled:cursor-default"
              style={{ height: 30 }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
