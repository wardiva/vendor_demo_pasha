import { useState } from "react";
import {
  REVEAL_VARIATIONS,
  type RevealVariation,
} from "@/context/RevealVariationContext";

/**
 * The contact-reveal design switch — a review control, not product UI.
 *
 * A tab per concept, pinned to the bottom-left of the window: the
 * implementation that shipped before reveals were counted per company, and the
 * concepts for counting them per company. Choosing one swaps the panel on the Signals cards,
 * the Prospects cards and the Prospect Details modal together, so each concept
 * is judged as a whole experience rather than as a card in isolation.
 *
 * Nothing else moves with it. The list, the filters, the search, the sort, the
 * modal's other tabs and the allowance in the header all carry on exactly as
 * they do, which is the point: the concepts are being looked at in the product
 * they will live in, with everything around them real.
 *
 * The two controls beneath the tabs set the allowance, because two of the
 * states that matter most — a plan with reveals left and a plan with none — are
 * otherwise twenty clicks apart.
 *
 * Fixed to the viewport, and on the opposite corner from the Prospects page's
 * own prototype switch so the two never overlap. It collapses to a single pill,
 * which is remembered, so it can be kept out of the way while a page is read.
 */
export default function RevealVariationBar({
  variation,
  onChange,
  used,
  total,
  onSetUsed,
}: {
  variation: RevealVariation;
  onChange: (v: RevealVariation) => void;
  /** Company reveals spent, for the two demo controls. */
  used: number;
  total: number;
  onSetUsed: (used: number) => void;
}) {
  const [open, setOpen] = useState(() => {
    try {
      return sessionStorage.getItem("reveal-variation-bar") !== "closed";
    } catch {
      return true;
    }
  });

  const setOpenPersisted = (next: boolean) => {
    setOpen(next);
    try {
      sessionStorage.setItem("reveal-variation-bar", next ? "open" : "closed");
    } catch {
      /* Storage unavailable — the choice still holds for this render. */
    }
  };

  /* One string for both states, so the panel and the pill it collapses into
     can never be retitled apart. */
  const PANEL_TITLE = "History — Variations of Stacked Cards";

  /* The Intent Signals selector's own values, so the two version histories
     read as one system rather than as two panels that happen to both be
     lists. Card: white, radius 12, one soft shadow, no border — a border
     under a shadow is the same edge drawn twice. Selected: the modal rail's
     16% tint of the product's ink with a rule down the left edge, never a
     solid black pill. Hover: the same ink at 6%. */
  const INK = "#2f2b3d";
  const MUTED = "rgba(47,43,61,0.7)";
  const FAINT = "rgba(47,43,61,0.45)";
  const HAIR = "rgba(47,43,61,0.10)";
  const LIVE = "#072929";
  const SELECTED_BG = "rgba(7,41,41,0.16)";
  const HOVER_BG = "rgba(7,41,41,0.06)";
  const CARD_SURFACE =
    "rounded-[12px] bg-white font-['Inter',sans-serif] shadow-[0px_4px_18px_0px_rgba(47,43,61,0.16)]";
  /* Bottom-left, on the opposite corner from the Intent Signals pill so the
     two version histories can be open at once without meeting. */
  const PLACE = "fixed bottom-[24px] left-[24px] z-[9000]";

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpenPersisted(true)}
        className={`${CARD_SURFACE} ${PLACE} cursor-pointer flex h-[30px] items-center px-[12px] text-[11px] whitespace-nowrap`}
        style={{ color: MUTED }}
        data-reveal-variation-bar
        title={PANEL_TITLE}
      >
        {PANEL_TITLE}
      </button>
    );
  }

  return (
    <div
      className={`${CARD_SURFACE} ${PLACE} flex flex-col p-[4px] w-[292px]`}
      style={{
        /* The list grew past the window as concepts were added. The panel is
           held to whichever is smaller — a comfortable reading height, or
           whatever the window leaves above its own 24px offset — so it can
           never run off the top of the screen however long the list gets. */
        maxHeight: "min(440px, calc(100vh - 48px))",
      }}
      data-reveal-variation-bar
      role="group"
      aria-label="Contact reveal concept"
    >
      {/* Fixed: the list scrolls under it, not with it. The heading is a
          plain label at the weight the other panel's header carries — not a
          tracked-out uppercase micro-caption, which was the one thing in
          either panel set in a style nothing else in the product uses. */}
      <div className="flex gap-[6px] h-[30px] items-center pl-[8px] pr-[4px] shrink-0">
        <p
          className="flex-1 font-medium leading-[16px] overflow-hidden text-[11.5px] text-ellipsis whitespace-nowrap"
          style={{ color: INK }}
          title={PANEL_TITLE}
        >
          {PANEL_TITLE}
        </p>
        <button
          type="button"
          onClick={() => setOpenPersisted(false)}
          className="cursor-pointer flex items-center justify-center rounded-[6px] shrink-0 size-[22px] transition-colors hover:bg-[rgba(7,41,41,0.06)]"
          style={{ color: MUTED }}
          aria-label="Close version history"
          title="Close — the concept stays as it is"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M3 3L9 9M9 3L3 9"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* The only part that scrolls. `min-h-0` is what lets a flex child be
          shorter than its content; without it the list would size to its rows
          and push the footer out of the panel instead of scrolling.

          `filter-option-scroll` is the module's own bar — 6px, no track, no
          buttons, the thumb in the same muted ink as the labels beside it —
          and it is the bar the Intent Signals list uses too. */}
      <div
        role="tablist"
        aria-label="Contact reveal concept"
        className="filter-option-scroll flex flex-1 flex-col gap-[1px] min-h-0"
      >
        {REVEAL_VARIATIONS.map(o => {
          const active = o.key === variation;
          return (
            <button
              key={o.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(o.key)}
              /* shrink-0: the rows keep their own height in the scroller
                 rather than being squeezed to fit it. */
              className="cursor-pointer overflow-hidden pl-[9px] pr-[8px] py-[5px] relative rounded-[7px] shrink-0 text-left transition-colors"
              style={{ background: active ? SELECTED_BG : undefined }}
              onMouseEnter={e => {
                if (!active) e.currentTarget.style.background = HOVER_BG;
              }}
              onMouseLeave={e => {
                if (!active) e.currentTarget.style.background = "";
              }}
            >
              {/* Where you are in the list, read at a glance — the same rule
                  the Intent Signals selector draws down its selected row,
                  run to this row's own height because these rows are two
                  lines rather than one. */}
              {active && (
                <span
                  aria-hidden
                  className="absolute bottom-[6px] left-0 rounded-[2px] top-[6px]"
                  style={{ background: LIVE, width: 2 }}
                />
              )}
              <span
                className="block leading-[18px] text-[12.5px]"
                style={{ color: active ? LIVE : INK, fontWeight: active ? 500 : 400 }}
              >
                {o.label}
              </span>
              <span
                className="block leading-[16px] text-[11px]"
                style={{ color: active ? "rgba(7,41,41,0.7)" : MUTED }}
              >
                {o.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* The allowance, so the exhausted state and the ordinary one are both a
          click away. Demo controls: they set the same counter a reveal spends.
          Borderless, like everything else in both panels — the hover tint is
          what says they are pressable. */}
      <div
        className="flex items-center gap-[4px] mt-[4px] pl-[9px] pr-[4px] pt-[7px] shrink-0"
        style={{ borderTop: `1px solid ${HAIR}` }}
      >
        <p className="flex-1 text-[10.5px]" style={{ color: FAINT }}>
          {variation === "current"
            ? "Contact reveals"
            : `${Math.max(total - used, 0)} of ${total} left`}
        </p>
        <button
          type="button"
          onClick={() => onSetUsed(42)}
          className="cursor-pointer rounded-[6px] px-[8px] py-[3px] text-[10.5px] transition-colors hover:bg-[rgba(7,41,41,0.06)]"
          style={{ color: INK }}
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => onSetUsed(total)}
          className="cursor-pointer rounded-[6px] px-[8px] py-[3px] text-[10.5px] transition-colors hover:bg-[rgba(7,41,41,0.06)]"
          style={{ color: INK }}
        >
          Use all
        </button>
      </div>
    </div>
  );
}
