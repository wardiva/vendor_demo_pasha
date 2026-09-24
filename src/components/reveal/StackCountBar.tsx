import { useEffect, useRef, useState } from "react";
import {
  STACK_COUNT_TREATMENTS,
  setStackCountTreatment,
  useStackCountTreatment,
} from "./StackCount";

/**
 * The picker for the stack count treatments.
 *
 * Third of the app's three version histories, and built to the values the
 * other two already settled so they read as one system rather than as three
 * panels that happen to be lists. What differs is only where it sits: the
 * Intent Signals panel holds the bottom-right corner and the stacked cards
 * panel the bottom-left, so this one takes the bottom edge between them.
 *
 * Switching is what makes the ten comparable. The prospects table is showing
 * nineteen companies at once — some with three contacts, some with two, some
 * with one — so a treatment is never judged on a single mock. Every press
 * redraws all of them at real size, against the real reveal button and the
 * real Verified tag, including the one-contact rows that must stay bare.
 */

const INK = "#2f2b3d";
const MUTED = "rgba(47,43,61,0.7)";
const FAINT = "rgba(47,43,61,0.45)";
const HAIR = "rgba(47,43,61,0.10)";
const LIVE = "#072929";
const SELECTED_BG = "rgba(7,41,41,0.16)";
const HOVER_BG = "rgba(7,41,41,0.06)";
const CARD_SURFACE =
  "rounded-[12px] bg-white font-['Inter',sans-serif] shadow-[0px_4px_18px_0px_rgba(47,43,61,0.16)]";
/* The bottom edge, clear of both corners the other two histories hold. */
const PLACE = "fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[9000]";
const TITLE = "History — Variations of Stack Count";
const KEY = "stack-count-bar";

export default function StackCountBar() {
  /* Closed unless this session has opened it, the same default the other two
     panels take. */
  const [open, setOpen] = useState(() => {
    try {
      return sessionStorage.getItem(KEY) === "open";
    } catch {
      return false;
    }
  });
  const setOpenPersisted = (next: boolean) => {
    setOpen(next);
    try {
      sessionStorage.setItem(KEY, next ? "open" : "closed");
    } catch {
      /* Storage unavailable — the choice still holds for this render. */
    }
  };

  const active = useStackCountTreatment();
  const index = Math.max(0, STACK_COUNT_TREATMENTS.findIndex(t => t.id === active));
  const listRef = useRef<HTMLDivElement>(null);

  /* Stepping, so a treatment can be compared against its neighbour without
     the hand leaving the keyboard. Silenced while the panel is closed — the
     arrows would otherwise redraw every row on a page showing no picker. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      const target = e.target as HTMLElement | null;
      if (target && target.closest("input, textarea, [contenteditable]")) return;
      e.preventDefault();
      const delta = e.key === "ArrowDown" ? 1 : -1;
      const next =
        STACK_COUNT_TREATMENTS[
          (index + delta + STACK_COUNT_TREATMENTS.length) % STACK_COUNT_TREATMENTS.length
        ];
      setStackCountTreatment(next.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index]);

  /* Keep the chosen row in view when it is stepped to rather than clicked. */
  useEffect(() => {
    if (!open) return;
    const row = listRef.current?.children[index] as HTMLElement | undefined;
    row?.scrollIntoView({ block: "nearest" });
  }, [open, index]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpenPersisted(true)}
        className={`${CARD_SURFACE} ${PLACE} cursor-pointer flex h-[30px] items-center px-[12px] text-[11px] whitespace-nowrap`}
        style={{ color: MUTED }}
        data-stack-count-bar
        title={TITLE}
      >
        {TITLE}
      </button>
    );
  }

  return (
    <div
      className={`${CARD_SURFACE} ${PLACE} flex flex-col p-[4px] w-[264px]`}
      style={{ maxHeight: "min(440px, calc(100vh - 48px))" }}
      data-stack-count-bar
      role="group"
      aria-label="Stack count treatment"
    >
      <div className="flex gap-[6px] h-[30px] items-center pl-[8px] pr-[4px] shrink-0">
        <p
          className="flex-1 font-medium leading-[16px] overflow-hidden text-[11.5px] text-ellipsis whitespace-nowrap"
          style={{ color: INK }}
          title={TITLE}
        >
          {TITLE}
        </p>
        <p className="shrink-0 tabular-nums text-[11px]" style={{ color: FAINT }}>
          <span className="font-medium" style={{ color: INK }}>
            {index + 1}
          </span>
          {` / ${STACK_COUNT_TREATMENTS.length}`}
        </p>
        <button
          type="button"
          onClick={() => setOpenPersisted(false)}
          className="cursor-pointer flex h-[22px] items-center justify-center rounded-[6px] shrink-0 w-[22px]"
          style={{ color: MUTED }}
          aria-label="Close"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div ref={listRef} className="filter-option-scroll flex flex-col gap-[1px] overflow-y-auto">
        {STACK_COUNT_TREATMENTS.map(t => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setStackCountTreatment(t.id)}
              className="cursor-pointer flex gap-[7px] items-start overflow-hidden pl-[9px] pr-[8px] py-[5px] relative rounded-[7px] shrink-0 text-left transition-colors"
              style={{ background: selected ? SELECTED_BG : undefined }}
              onMouseEnter={e => {
                if (!selected) e.currentTarget.style.background = HOVER_BG;
              }}
              onMouseLeave={e => {
                if (!selected) e.currentTarget.style.background = "";
              }}
            >
              {selected && (
                <span
                  aria-hidden
                  className="absolute left-0 rounded-[2px] top-[6px]"
                  style={{ background: LIVE, height: 16, width: 2 }}
                />
              )}
              <span
                className="shrink-0 tabular-nums text-[10.5px] text-right w-[13px]"
                style={{ color: selected ? LIVE : FAINT, lineHeight: "16px" }}
              >
                {t.id}
              </span>
              <span className="flex-1 min-w-px">
                <span
                  className="block leading-[16px] overflow-hidden text-[12.5px] text-ellipsis whitespace-nowrap"
                  style={{ color: selected ? LIVE : INK, fontWeight: selected ? 500 : 400 }}
                >
                  {t.name}
                </span>
                {/* What it is trying, so the list can be read without
                    switching to every one of them in turn. */}
                <span className="block leading-[14px] text-[10.5px]" style={{ color: FAINT }}>
                  {t.note}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p
        className="pt-[7px] px-[9px] shrink-0 text-[10px]"
        style={{ color: FAINT, borderTop: `1px solid ${HAIR}`, marginTop: 4 }}
      >
        ↑ ↓ to step through · shown on every row at once
      </p>
    </div>
  );
}
