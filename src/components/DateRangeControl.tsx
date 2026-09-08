import { useLayoutEffect, useRef, useState } from "react";
import type { DateRange as DayPickerRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { DateRange } from "@/components/DateRangePicker";
import {
  DATE_PRESETS,
  selectionFor,
  type DatePresetKey,
  type DateSelection,
} from "@/data/dateRange";

/**
 * The Date Range popover, shared by the Signals and Prospects toolbars.
 *
 * Two panes: a two-month range calendar, and the presets beside it. Picking a
 * preset applies it and closes; dragging a range across the calendar puts the
 * control on Custom Range, which is what the calendar is for. There is no
 * Apply step on the presets — they behave like the filter chips, which apply on
 * the click — and the calendar keeps Cancel and Apply, so a half-picked
 * range is never applied by accident and closing without applying leaves the
 * page on whatever it was already showing.
 *
 * The calendar is the shadcn component; the panes, the card and the footer are
 * the module's own filter-menu chrome, so the popover reads as one of the row's
 * dropdowns rather than a foreign widget.
 */

const CARD_CLASS =
  "bg-white rounded-[12px] shadow-[0px_4px_18px_0px_rgba(47,43,61,0.16)] overflow-hidden flex";

/** Kept clear of the viewport edges, matching the menus' own 8px rhythm. */
const EDGE_GAP = 8;
/** The presets column, wide enough for its longest label. */
const PRESETS_W = 150;

/** The field the popover hangs from. */
export type DateAnchor = { left: number; right: number; bottom: number };

export default function DateRangeControl({
  anchor,
  align,
  selection,
  onSelect,
  onClose,
}: {
  anchor: DateAnchor;
  /** Signals hangs its menu off the field's right edge; Prospects off its left. */
  align: "left" | "right";
  selection: DateSelection;
  onSelect: (next: DateSelection) => void;
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  /* The working range. The calendar edits this; nothing reaches the page until
     Apply, so dragging out a new range never filters mid-gesture. It opens on
     whatever is applied, whether that came from the calendar or a preset, so
     the calendar always shows the period the page is on.

     All Time opens on nothing. It is the one selection that is not a period,
     so drawing its stored dates across the calendar would claim a range it
     does not stand for; the months render unmarked instead, and Apply stays
     inert until a range is actually drawn. */
  const [draft, setDraft] = useState<DayPickerRange | undefined>(
    selection.preset === "all"
      ? undefined
      : { from: selection.range.start, to: selection.range.end },
  );
  /**
   * Whether the calendar has been touched since the popover opened.
   *
   * The draft is seeded from the applied selection, so its mere presence says
   * nothing about intent — only an edit here means the reader is building a
   * custom range, which is what moves the highlight onto Custom Range.
   */
  const [edited, setEdited] = useState(false);

  /* Placed once the card's real size is known — it is far wider than the menu
     it replaces, so it needs measuring rather than assuming. */
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const wanted = align === "right" ? anchor.right - width : anchor.left;
    let y = anchor.bottom + 6;
    if (y + height > vh - EDGE_GAP) {
      const above = anchor.bottom - 34 - 6 - height;
      y = above >= EDGE_GAP ? above : Math.max(EDGE_GAP, vh - height - EDGE_GAP);
    }
    setPos({
      x: Math.max(EDGE_GAP, Math.min(wanted, vw - width - EDGE_GAP)),
      y,
    });
  }, [align, anchor.bottom, anchor.left, anchor.right]);

  const choose = (key: DatePresetKey) => {
    if (key === "custom") {
      /* Nothing to apply yet — the calendar is already open beside this, so
         this row only moves the highlight onto it and waits for a range. */
      setEdited(true);
      return;
    }
    onSelect(selectionFor(key));
    onClose();
  };

  const canApply = !!draft?.from && !!draft?.to;

  return (
    <div
      className="fixed z-[9999]"
      data-date-picker=""
      style={pos ? { left: pos.x, top: pos.y } : { left: 0, top: 0, opacity: 0 }}
      onClick={e => e.stopPropagation()}
    >
      <div ref={cardRef} className={`${CARD_CLASS} date-menu-enter`}>
        {/* ── Calendar ── */}
        <div className="flex flex-col">
          <Calendar
            mode="range"
            selected={draft}
            onSelect={next => { setDraft(next); setEdited(true); }}
            numberOfMonths={2}
            defaultMonth={selection.range?.start}
          />

          {/* The footer the filter cards carry, so the two read the same —
              divider, padding and button height unchanged. Both actions sit at
              the right, 8px apart. */}
          <div>
            <div style={{ height: 1, background: "rgba(47,43,61,0.06)", margin: "0 10px" }} />
            <div className="flex items-center justify-end px-[14px] py-[8px]">
              {/* Two equal columns rather than two content-width buttons, so
                  Apply takes the same width as Cancel without that width being
                  written down anywhere: 1fr columns settle on the wider of the
                  two labels, which is Cancel's. Cancel is already that wide and
                  does not move; only Apply grows to meet it. The grid shrinks to
                  its content, so the pair still sits at the right, still 8px
                  apart, and each button keeps its own padding and height. */}
              <div className="grid grid-cols-2 gap-[8px]">
              {/* Cancel discards the working range and leaves what was last
                  applied in place — the draft only ever lived in this popover,
                  so closing without applying is the whole of it.

                  The product's secondary button is the outlined one Buy More
                  renders: a #072929 hairline on no fill, the same ink in the
                  label, and the 6% wash of that ink on hover that every
                  outlined control here shares. This was on the shadcn grey
                  `bg-secondary` fill instead, which belongs to no other control
                  on these pages. Its own size, radius and type are untouched —
                  only the border, fill, ink and hover are the shared ones now,
                  and the border is inside the box, so the button still measures
                  what it did. */}
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center px-[12px] rounded-[8px] cursor-pointer font-['Inter',sans-serif] text-[12px] font-medium border border-solid border-[#072929] bg-transparent text-[#072929] hover:bg-[rgba(7,41,41,0.06)] transition-colors"
                style={{ height: 30 }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canApply}
                onClick={() => {
                  if (!draft?.from || !draft?.to) return;
                  const range: DateRange = { start: draft.from, end: draft.to };
                  onSelect({ preset: "custom", range });
                  onClose();
                }}
                className="flex items-center justify-center px-[12px] rounded-[8px] cursor-pointer font-['Inter',sans-serif] text-[12px] font-medium text-white bg-[#072929] hover:bg-[#0a3a3a] transition-colors disabled:opacity-40 disabled:cursor-default"
                style={{ height: 30 }}
              >
                Apply
              </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Presets ── */}
        <div
          role="menu"
          aria-label="Date range presets"
          className="border-l border-[rgba(47,43,61,0.06)] border-solid flex flex-col gap-[2px] p-[8px] shrink-0"
          style={{ width: PRESETS_W }}
        >
          {DATE_PRESETS.map(preset => {
            /* Custom Range reads as selected while a hand-picked range is what
               the page is showing, or while one is being drawn. */
            const active =
              preset.key === "custom"
                ? selection.preset === "custom" || edited
                : selection.preset === preset.key && !edited;
            return (
              <button
                key={preset.key}
                type="button"
                role="menuitem"
                onClick={() => choose(preset.key)}
                /* Selected is the ink at 16% behind the ink itself, so a chosen
                   row reads as filled without going solid. Hover stays the
                   module's own 3% wash, which keeps the two distinguishable —
                   and a selected row does not take it. */
                className={cn(
                  "h-[34px] rounded-[8px] w-full flex items-center px-[10px] cursor-pointer transition-colors shrink-0",
                  "font-['Inter',sans-serif] text-[13px] leading-[19px] text-left whitespace-nowrap",
                  active
                    ? "bg-[rgba(7,41,41,0.16)] text-[#072929] font-medium"
                    : "text-[#2f2b3d] font-normal hover:bg-black/[0.03]",
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
