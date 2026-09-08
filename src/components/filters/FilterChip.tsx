import { useEffect, useRef, type ReactNode } from "react";
import AnchoredMenu from "@/components/filters/AnchoredMenu";
import { fieldState } from "@/components/filters/fieldStates";
import chevronGlyph from "@/components/prospects/assets/icon-chevron-down.svg";
import clearGlyph from "@/components/prospects/assets/icon-x.svg";

/**
 * One filter chip on a page's filter row — Figma 142:3011 (Prospects) and
 * 163:4949 (Signals), which draw it identically.
 *
 * Default is the field's own hairline; a group with a selection takes the green
 * stroke, the soft drop shadow, a count of the options applied and a clear
 * button. A chip whose menu is open takes that same stroke and shadow — but not
 * the count or the clear, which belong to a filter that is actually applied. The label sits on the field's 13/22 text, 4px from the 14px chevron,
 * and the count and clear controls keep their own 8px and 6px gaps.
 *
 * The chip also anchors its own menu: the dropdown is absolutely positioned
 * against the chip rather than the viewport, so it travels with the row when
 * the page scrolls instead of floating over the cards below. Should the chip
 * itself scroll out of view, the menu closes — there is nothing left to anchor
 * it to.
 *
 * Opening turns the chevron up and eases the menu into place; closing reverses
 * both. Every chip on both pages is this component, so the two pages open and
 * close identically.
 */
const FIELD_BASE = "bg-white content-stretch flex items-center relative rounded-[10px] shrink-0";

export default function FilterChip({
  label,
  count,
  marker,
  legacyHook = false,
  open = false,
  dropdown,
  onDismiss,
}: {
  label: string;
  count: number;
  /** Attributes the page's click delegate finds this chip by. */
  marker?: Record<string, string>;
  /** The Prospects Signals chip is opened through the delegate's first marker. */
  legacyHook?: boolean;
  /** True while this chip's menu is the open one. */
  open?: boolean;
  /** The menu itself, rendered anchored beneath the chip. */
  dropdown?: ReactNode;
  /** Called when the chip leaves the viewport with its menu open. */
  onDismiss?: () => void;
}) {
  /* Two separate things the chip says. `applied` is whether the group is
     filtering anything, and it alone decides the count and the clear control.
     `lit` is the field's own treatment, which an open menu takes as well —
     a chip being chosen from reads as active while it is open, then falls back
     to the default once it closes with nothing picked. */
  const applied = count > 0;
  const lit = applied || open;
  const hostRef = useRef<HTMLDivElement>(null);

  /* Anchored, not fixed — but a menu hanging off a trigger that has scrolled
     past the top of the page is still no use, so it is dismissed. */
  useEffect(() => {
    if (!open || !onDismiss || !hostRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => !entry.isIntersecting)) onDismiss();
      },
      { threshold: 0.5 },
    );
    observer.observe(hostRef.current);
    return () => observer.disconnect();
  }, [open, onDismiss]);

  return (
    <div ref={hostRef} className="relative shrink-0">
      <div
        className={`${FIELD_BASE} cursor-pointer gap-[4px] h-[34px] pl-[12px] pr-[10px] ${fieldState(lit)}`}
        data-name="text-field"
        {...marker}
      >
        {/* Not rendered: the delegate has identified that control by this
            attribute since the panel was built, and still does. */}
        {legacyHook && <span aria-hidden data-filters-idle className="hidden" />}

        <div className="content-stretch flex gap-[8px] items-center justify-center py-[6px] relative shrink-0">
          <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">
            <p className="leading-[22px]">{label}</p>
          </div>
          {applied && (
            <div
              data-name="chip bg-label-danger"
              className="bg-[rgba(177,250,99,0.32)] content-stretch flex items-center justify-center p-[4px] relative rounded-[6px] shrink-0 size-[18px]"
            >
              <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#072929] text-[11px] text-center whitespace-nowrap">
                <p className="leading-[16px]">{count}</p>
              </div>
            </div>
          )}
        </div>

        <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
          {applied && (
            /* Clearing runs through the page's delegate alongside opening the
               menu, so both live in one place. */
            <span
              data-clear-filter=""
              role="button"
              aria-label={`Clear ${label} filter`}
              className="bg-[#f3f2f5] content-stretch cursor-pointer flex items-center justify-center relative rounded-[100px] shrink-0 size-[18px]"
            >
              <span className="relative shrink-0 size-[11px]" data-name="x">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={clearGlyph} />
              </span>
            </span>
          )}
          {/* One glyph, turned over: open rotates it up, closing rotates it
              back down, both on the menu's own timing. */}
          <div
            className={`relative shrink-0 size-[14px] transition-transform duration-[190ms] ease-out motion-reduce:transition-none ${
              open ? "rotate-180" : "rotate-0"
            }`}
            data-name="chevron-down"
          >
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={chevronGlyph} />
          </div>
        </div>
      </div>

      {/* 6px below the chip's own box, left-aligned with it — the offsets the
          menus used when they were positioned from a captured rect. The menu
          fades and slides into that spot, and back out of it on close. */}
      <AnchoredMenu open={open}>{dropdown}</AnchoredMenu>
    </div>
  );
}
