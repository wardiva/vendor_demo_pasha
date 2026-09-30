import { Fragment, useState } from "react";
import { createPortal } from "react-dom";

/**
 * A version history — a review control, not product UI — for comparing the
 * variations of one part of a design.
 *
 * Drawn to the Stacked Cards history's values so the version histories read
 * as one system: a white card at radius 12 under one soft shadow, two-line
 * rows, the selected row tinted with the product ink and ruled down its left
 * edge. It sits bottom-left, over the empty foot of the side menus, clear of
 * the dialog.
 *
 * Open by default, because comparing is the only reason to be looking; it
 * collapses to a pill, and that is remembered for the tab session.
 */

const INK = "#2f2b3d";
const MUTED = "rgba(47,43,61,0.7)";
const LIVE = "#072929";
const SELECTED_BG = "rgba(7,41,41,0.16)";
const HOVER_BG = "rgba(7,41,41,0.06)";
const CARD_SURFACE = "rounded-[12px] bg-white font-['Inter',sans-serif] shadow-[0px_4px_18px_0px_rgba(47,43,61,0.16)]";
const PLACE = "fixed bottom-[64px] left-[24px] z-[9000]";

export type VariationItem<K extends string> = { key: K; label: string; description: string; group?: string };

export default function VariationHistory<K extends string>({
  title,
  label,
  items,
  current,
  onSelect,
  storageKey,
  marker,
}: {
  title: string;
  /** What is being varied, for assistive tech. */
  label: string;
  items: ReadonlyArray<VariationItem<K>>;
  current: K;
  onSelect: (key: K) => void;
  /** Where open/closed is remembered. */
  storageKey: string;
  /** A data attribute set on the panel, so reviews and captures can find it. */
  marker: string;
}) {
  const [open, setOpen] = useState(() => {
    try {
      return sessionStorage.getItem(storageKey) !== "closed";
    } catch {
      return true;
    }
  });
  const setOpenPersisted = (next: boolean) => {
    setOpen(next);
    try {
      sessionStorage.setItem(storageKey, next ? "open" : "closed");
    } catch {
      /* Storage unavailable — the choice still holds for this render. */
    }
  };
  const mark = { [marker]: true };

  if (!open) {
    return createPortal(
      <button
        type="button"
        onClick={() => setOpenPersisted(true)}
        className={`${CARD_SURFACE} ${PLACE} flex h-[30px] cursor-pointer items-center px-[12px] text-[11px] whitespace-nowrap`}
        style={{ color: MUTED }}
        title={title}
        {...mark}
      >
        {title}
      </button>,
      document.body,
    );
  }

  return createPortal(
    <div
      className={`${CARD_SURFACE} ${PLACE} flex w-[300px] flex-col p-[4px]`}
      /* Never taller than the window leaves above its 64px offset; the list scrolls. */
      style={{ maxHeight: "min(440px, calc(100vh - 88px))" }}
      role="group"
      aria-label={label}
      {...mark}
    >
      <div className="flex h-[30px] shrink-0 items-center gap-[6px] pl-[8px] pr-[4px]">
        <p className="flex-1 truncate font-medium leading-[16px] text-[11.5px]" style={{ color: INK }} title={title}>
          {title}
        </p>
        <button
          type="button"
          onClick={() => setOpenPersisted(false)}
          className="flex size-[22px] shrink-0 cursor-pointer items-center justify-center rounded-[6px] transition-colors hover:bg-[rgba(7,41,41,0.06)]"
          style={{ color: MUTED }}
          aria-label="Close version history"
          title="Close — the choice stays as it is"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div role="tablist" aria-label={label} className="filter-option-scroll flex min-h-0 flex-1 flex-col gap-[1px]">
        {items.map(o => {
          const active = o.key === current;
          return (
            <Fragment key={o.key}>
              {o.group && (
                <p className="shrink-0 pb-[2px] pl-[9px] pt-[8px] leading-[14px] text-[10.5px]" style={{ color: "rgba(47,43,61,0.45)" }}>
                  {o.group}
                </p>
              )}
              <button
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelect(o.key)}
                className="relative shrink-0 cursor-pointer overflow-hidden rounded-[7px] py-[5px] pl-[9px] pr-[8px] text-left transition-colors"
                style={{ background: active ? SELECTED_BG : undefined }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.background = HOVER_BG;
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.background = "";
                }}
              >
                {active && <span aria-hidden className="absolute bottom-[6px] left-0 top-[6px] rounded-[2px]" style={{ background: LIVE, width: 2 }} />}
                <span className="block leading-[18px] text-[12.5px]" style={{ color: active ? LIVE : INK, fontWeight: active ? 500 : 400 }}>
                  {o.label}
                </span>
                <span className="block leading-[16px] text-[11px]" style={{ color: active ? "rgba(7,41,41,0.7)" : MUTED }}>
                  {o.description}
                </span>
              </button>
            </Fragment>
          );
        })}
      </div>
    </div>,
    document.body,
  );
}
