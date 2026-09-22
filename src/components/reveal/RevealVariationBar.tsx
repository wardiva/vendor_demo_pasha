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

  const current = REVEAL_VARIATIONS.find(v => v.key === variation);
  const shell =
    "fixed bottom-[24px] left-[24px] z-[9000] rounded-[10px] bg-white font-['Inter',sans-serif]";
  const shellStyle = {
    border: "1px solid rgba(47,43,61,0.18)",
    boxShadow: "0px 4px 18px 0px rgba(47,43,61,0.16)",
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpenPersisted(true)}
        className={`${shell} cursor-pointer px-[12px] py-[6px] text-[12px] text-[#2f2b3d]`}
        style={shellStyle}
        data-reveal-variation-bar
        title="Contact reveal concepts"
      >
        Reveal UX · <span className="font-medium">{current?.label ?? variation}</span>
      </button>
    );
  }

  return (
    <div
      className={`${shell} flex flex-col gap-[8px] p-[10px] w-[268px]`}
      style={shellStyle}
      data-reveal-variation-bar
      role="group"
      aria-label="Contact reveal concept"
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-[rgba(47,43,61,0.7)] uppercase tracking-[0.04em]">
          Contact reveal · concepts
        </p>
        <button
          type="button"
          onClick={() => setOpenPersisted(false)}
          className="cursor-pointer text-[11px] text-[rgba(47,43,61,0.7)] hover:text-[#2f2b3d]"
          aria-label="Collapse"
        >
          Hide
        </button>
      </div>

      <div role="tablist" aria-label="Contact reveal concept" className="flex flex-col gap-[2px]">
        {REVEAL_VARIATIONS.map(o => {
          const active = o.key === variation;
          return (
            <button
              key={o.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(o.key)}
              className={`cursor-pointer rounded-[7px] px-[10px] py-[5px] text-left transition-colors ${
                active
                  ? "bg-[#072929] text-white"
                  : "text-[#2f2b3d] hover:bg-[rgba(7,41,41,0.06)]"
              }`}
            >
              <span className={`block text-[12px] leading-[18px] ${active ? "font-medium" : ""}`}>
                {o.label}
              </span>
              <span
                className={`block text-[11px] leading-[16px] ${
                  active ? "text-[rgba(255,255,255,0.72)]" : "text-[rgba(47,43,61,0.7)]"
                }`}
              >
                {o.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* The allowance, so the exhausted state and the ordinary one are both a
          click away. Demo controls: they set the same counter a reveal spends. */}
      <div className="flex items-center gap-[6px] border-t border-[rgba(47,43,61,0.12)] pt-[8px]">
        <p className="flex-1 text-[11px] text-[rgba(47,43,61,0.7)]">
          {variation === "current"
            ? "Contact reveals"
            : `${Math.max(total - used, 0)} of ${total} left`}
        </p>
        <button
          type="button"
          onClick={() => onSetUsed(42)}
          className="cursor-pointer rounded-[6px] border border-[rgba(47,43,61,0.18)] px-[8px] py-[3px] text-[11px] text-[#2f2b3d] hover:bg-[rgba(7,41,41,0.06)]"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => onSetUsed(total)}
          className="cursor-pointer rounded-[6px] border border-[rgba(47,43,61,0.18)] px-[8px] py-[3px] text-[11px] text-[#2f2b3d] hover:bg-[rgba(7,41,41,0.06)]"
        >
          Use all
        </button>
      </div>
    </div>
  );
}
