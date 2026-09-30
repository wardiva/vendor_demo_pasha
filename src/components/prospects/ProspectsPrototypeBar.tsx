/**
 * The Prospects page's prototype switch — a review control, not product UI.
 *
 * Two icons, one above the other, pinned to the right edge of the window, that
 * swap what the list slot shows: the real prospects, or the empty-state
 * prototype in their place. It touches nothing else — the filters, the search,
 * the date range, the count beside the heading and the data behind them all
 * carry on exactly as they do, which is the point: the empty state is being
 * looked at in the page it will live in, with everything around it real.
 *
 * Shown only while the tab is unlocked — "View Plans" on the locked dialog
 * opens it. Locked, the page is the design: the dialog, its animation and the
 * portal around it, with nothing else on screen. Unlocked, a third control
 * sits beneath a hairline: the lock, which puts the Locked V3 dialog back
 * over the page, and is the only way back.
 *
 * Drawn in the product's own control language: a white well at radius 12 with
 * a hairline and the floating shadow, the chosen icon on a filled ink tile,
 * and the product's tooltip naming each on hover. The tooltips open beside
 * their icons, level with them, on the page side of the well — the well is
 * 24px from the window's edge, which is not room for a tooltip, and opened
 * above, the edge pushed them sideways and over the icon above. 14px from the
 * icon puts the caret's tip 3px clear of the well. Fixed to the viewport and
 * vertically centred on it, so it stands beside the design rather than in it,
 * and it is shown on every host — a review control that exists only on
 * localhost is invisible on the deployed link, which is the one place a
 * reviewer opens.
 */

import { createPortal } from "react-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { setProspectsLocked, useProspectsLocked } from "@/lib/prospectsAccess";

export type ProspectsPrototypeView = "prospects" | "empty";

const OPTIONS: ReadonlyArray<{ key: ProspectsPrototypeView; label: string }> = [
  { key: "prospects", label: "Prospects" },
  { key: "empty", label: "Empty state" },
];

/** The two marks, 16px on a 1.5 stroke: a list of people, and an empty tray. */
function Glyph({ view }: { view: ProspectsPrototypeView }) {
  if (view === "prospects") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="4" cy="4" r="1.6" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="4" cy="12" r="1.6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8.5 4h5M8.5 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2.5 9.5l1.6-5.1A1 1 0 015.05 3.7h5.9a1 1 0 01.95.7l1.6 5.1V12a1.5 1.5 0 01-1.5 1.5H4A1.5 1.5 0 012.5 12V9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M2.5 9.5h3.2a2.3 2.3 0 004.6 0h3.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/** The lock, 16px on the same stroke. */
function LockGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="3" y="7" width="10" height="7" rx="1.8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.25 7V5.25a2.75 2.75 0 015.5 0V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function ProspectsPrototypeBar({
  view,
  onChange,
}: {
  view: ProspectsPrototypeView;
  onChange: (view: ProspectsPrototypeView) => void;
}) {
  const locked = useProspectsLocked();
  if (locked) return null;
  /* Portaled to the body. It is fixed to the window, but it is rendered from
     inside the page column — and while the Prospects tab is locked that column
     carries a CSS filter, which would make the column its containing block,
     blur it with the page and carry it off to the column's own corner. From
     the body it is fixed to the window whatever its origin does. */
  return createPortal(
    <div
      className="fixed right-[24px] top-1/2 z-[9000] flex -translate-y-1/2 flex-col gap-[2px] rounded-[12px] bg-white p-[4px]"
      data-name="Prototype Switch"
      data-prototype-bar
      aria-label="Prototype view"
      style={{
        border: "1px solid rgba(47,43,61,0.18)",
        boxShadow: "0px 4px 18px 0px rgba(47,43,61,0.16)",
      }}
    >
      <div role="tablist" aria-orientation="vertical" className="flex flex-col gap-[2px]">
        {OPTIONS.map(o => {
          const active = o.key === view;
          return (
            <Tooltip key={o.key}>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={o.label}
                    onClick={() => onChange(o.key)}
                    className={`flex size-[36px] cursor-pointer items-center justify-center rounded-[9px] transition-colors ${
                      active ? "bg-[#072929] text-white" : "text-[#2f2b3d] hover:bg-[rgba(7,41,41,0.06)]"
                    }`}
                  />
                }
              >
                <Glyph view={o.key} />
              </TooltipTrigger>
              <TooltipContent side="left" sideOffset={14}>{o.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      <span aria-hidden className="mx-[6px] my-[2px] block h-px bg-[rgba(47,43,61,0.12)]" />
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label="Locked"
              data-lock-prospects
              onClick={() => setProspectsLocked(true)}
              className="flex size-[36px] cursor-pointer items-center justify-center rounded-[9px] text-[#2f2b3d] transition-colors hover:bg-[rgba(7,41,41,0.06)]"
            />
          }
        >
          <LockGlyph />
        </TooltipTrigger>
        <TooltipContent side="left" sideOffset={14}>Locked</TooltipContent>
      </Tooltip>
    </div>,
    document.body,
  );
}
