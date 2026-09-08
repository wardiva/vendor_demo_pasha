import { useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

/**
 * Building blocks shared by the Signals and Leads filter panels, so both use
 * one implementation of the checkbox, option row, nav row and card chrome
 * rather than two that can drift apart.
 */

/** Gap between a parent filter card and its child card. */
export const FILTER_CARD_GAP = 8;

/** Default card width, matching the Figma filter cards. */
export const FILTER_CARD_W = 220;

/**
 * For a list whose rows carry a logo as well as a label.
 *
 * The competitors list is the one that does, and its longest company name —
 * "Meridian Health Systems" — needs 220px of row on its own once the checkbox,
 * the mark and the row's padding are counted. At the default width that ran
 * past the card and put a horizontal bar under the list. 248 is that row plus
 * the card's padding and the vertical bar's gutter, with a few pixels over so
 * rounding at another zoom cannot bring the bar back.
 */
export const FILTER_CARD_WIDE_W = 248;

/**
 * How many option rows a menu shows before the rest scroll.
 *
 * The menus are sized by their content, which is fine for a group of five and
 * not for one that grows with the dataset — the competitors list is every
 * company the Prospects page holds, and left alone it runs the menu past the
 * height of the page behind it. Six keeps the card at roughly the height the
 * fixed-length menus already stand at, and the rest of the list scrolls.
 */
const MAX_VISIBLE_ROWS = 6;

/* Row geometry: 34px rows, 2px apart. */
const OPTION_LIST_MAX_H = MAX_VISIBLE_ROWS * 34 + (MAX_VISIBLE_ROWS - 1) * 2;

const CARD_CLASS =
  "bg-white rounded-[12px] shadow-[0px_4px_18px_0px_rgba(47,43,61,0.16)] overflow-hidden flex flex-col";

/**
 * "All" selects every option in its group rather than acting as a cleared
 * state, so the filtering logic receives explicit values and the user never has
 * to tick each option by hand. It stays checked only while every option is
 * selected, so toggling any individual option afterwards drops it automatically
 * and leaves just the individual selections in play.
 */
export function makeToggle(
  setSel: Dispatch<SetStateAction<Set<string>>>,
  allValues: readonly string[],
) {
  return (val: string) => {
    if (val === "All") {
      setSel(prev => (prev.size === allValues.length ? new Set() : new Set(allValues)));
      return;
    }
    setSel(prev => {
      const next = new Set(prev);
      next.has(val) ? next.delete(val) : next.add(val);
      return next;
    });
  };
}

export const isAllSelected = (selected: Set<string>, allValues: readonly string[]) =>
  allValues.length > 0 && selected.size === allValues.length;

/* ─────────────────────────── checkbox ─────────────────────────── */

export function InlineCheckbox({ checked }: { checked: boolean }) {
  return checked ? (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
      <rect width="15" height="15" rx="4" fill="#072929" />
      <path d="M3 7.5L6 10.5L12 4.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
      <rect width="15" height="15" rx="4" fill="white" />
      <rect x="0.5" y="0.5" width="14" height="14" rx="3.5" stroke="rgba(47,43,61,0.18)" />
    </svg>
  );
}

/** Selected-count chip, matching the one on the Filters button. */
export function InlineCountBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <div className="bg-[rgba(177,250,99,0.32)] flex items-center justify-center p-[4px] rounded-[6px] size-[18px] shrink-0">
      <span className="text-[11px] font-['Inter',sans-serif] font-semibold text-[#072929] leading-[16px]">
        {count}
      </span>
    </div>
  );
}

/* ─────────────────────────── option card ─────────────────────────── */

/**
 * A checkbox list with an "All" row on top.
 *
 * Usually the second-level card opened from a nav row, but a panel with a
 * single group renders it on its own and passes the Reset All / Apply Filters
 * footer straight in, exactly as NavFilterCard does.
 */
export function OptionFilterCard({
  options,
  selected,
  onToggle,
  onReset,
  width = FILTER_CARD_W,
  onMouseEnter,
  footer,
  includeAll = true,
  searchPlaceholder,
}: {
  options: { label: string; icon?: ReactNode }[];
  selected: Set<string>;
  onToggle: (val: string) => void;
  /** Omit to leave the "All" row without its inline Reset. */
  onReset?: () => void;
  width?: number;
  onMouseEnter?: () => void;
  footer?: ReactNode;
  /** The Prospects page's filters list their values only, with no "All" row. */
  includeAll?: boolean;
  /** Set to put a search field above a long option list. */
  searchPlaceholder?: string;
}) {
  /* Local to the card: it narrows what is listed and never touches the
     selection, so filtering the list cannot unpick what is already chosen. */
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const visible = needle
    ? options.filter(o => o.label.toLowerCase().includes(needle))
    : options;
  const rows = includeAll ? [{ label: "All", icon: undefined }, ...visible] : visible;
  const values = options.map(o => o.label);

  /* The "All" row sits above the scrolling area rather than inside it, so it
     stays in view however far down the list the reader is — it acts on the
     whole group, not on what happens to be on screen. */
  const allRow = includeAll ? rows[0] : null;

  const renderRow = (row: { label: string; icon?: ReactNode }) => {
    const isAll = row.label === "All";
    const checked = isAll ? isAllSelected(selected, values) : selected.has(row.label);
    return (
      <div
        key={row.label}
        onClick={() => onToggle(row.label)}
        className="h-[34px] rounded-[8px] w-full flex items-center px-[10px] gap-[8px] cursor-pointer hover:bg-black/[0.03] transition-colors shrink-0"
      >
        <InlineCheckbox checked={checked} />
        {/* Figma 165:5377 groups the mark with its label 4px apart, and
            the row's own 8px gap sits between the checkbox and that
            pair. Rows without a mark keep the plain 8px spacing. */}
        {row.icon ? (
          <span className="flex flex-1 gap-[4px] items-center min-w-px">
            {row.icon}
            <span className="font-['Inter',sans-serif] font-normal text-[#2f2b3d] text-[13px] leading-[19px] whitespace-nowrap">
              {row.label}
            </span>
          </span>
        ) : (
          <span className="font-['Inter',sans-serif] font-normal text-[#2f2b3d] text-[13px] leading-[19px] flex-1 whitespace-nowrap">
            {row.label}
          </span>
        )}
        {isAll && onReset && selected.size > 0 && (
          <button
            onClick={e => { e.stopPropagation(); onReset(); }}
            className="font-['Inter',sans-serif] text-[11px] font-normal text-[#072929]/50 hover:text-[#072929] transition-colors shrink-0"
          >
            Reset
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={CARD_CLASS} style={{ width }} onMouseEnter={onMouseEnter}>
      <div className="flex flex-col gap-[2px] p-[4px]">
        {searchPlaceholder && (
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onClick={e => e.stopPropagation()}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            data-filter-search
            className="bg-white border border-[rgba(47,43,61,0.18)] border-solid font-['Inter',sans-serif] h-[34px] leading-[19px] outline-none px-[10px] rounded-[8px] text-[#2f2b3d] text-[13px] w-full placeholder:text-[rgba(47,43,61,0.4)] focus:border-[rgba(47,43,61,0.35)] transition-colors"
          />
        )}
        {searchPlaceholder && rows.length === 0 && (
          <div className="flex h-[34px] items-center px-[10px] font-['Inter',sans-serif] font-normal leading-[19px] text-[13px] text-[rgba(47,43,61,0.4)]">
            No matches
          </div>
        )}
        {allRow && renderRow(allRow)}

        {/* The values themselves. The cap only bites on a list longer than it,
            so the short groups render exactly as they did — no scroller, no
            bar — and the long one keeps the card at their height. */}
        <div className="filter-option-scroll flex flex-col gap-[2px]" style={{ maxHeight: OPTION_LIST_MAX_H }}>
          {visible.map(renderRow)}
        </div>
      </div>
      {footer}
    </div>
  );
}

/* ─────────────────────────── nav card ─────────────────────────── */

/** Right-pointing chevron, matching the one in the Figma filter cards. */
function Chevron() {
  return (
    <div className="flex items-center justify-center relative shrink-0 size-[14px]">
      <div className="-rotate-90 flex-none">
        <div className="relative size-[14px]" data-name="chevron-down">
          <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]">
            <div className="absolute inset-[-21.43%_-10.71%]">
              <svg className="block size-full" fill="none" height="5" preserveAspectRatio="none" viewBox="0 0 8.5 5" width="8.5">
                <path
                  d="M0.75 0.75L4.25 4.25L7.75 0.75"
                  stroke="#2F2B3D"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.6"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * First-level card: category rows that open a child card on hover or click.
 * Row geometry matches the Figma "Signals Filters" card exactly.
 */
export function NavFilterCard({
  items,
  activeItem,
  onSelect,
  onHover,
  width = FILTER_CARD_W,
  onMouseEnter,
  footer,
}: {
  items: { label: string; count: number }[];
  activeItem: string | null;
  onSelect: (label: string) => void;
  onHover: (label: string) => void;
  width?: number;
  onMouseEnter?: () => void;
  footer?: ReactNode;
}) {
  return (
    <div className={CARD_CLASS} style={{ width }} onMouseEnter={onMouseEnter}>
      <div className="flex flex-col gap-[2px] p-[4px]">
        {items.map(item => (
          <div
            key={item.label}
            onClick={() => onSelect(item.label)}
            onMouseEnter={() => onHover(item.label)}
            className={`h-[34px] rounded-[8px] w-full flex items-center gap-[8px] px-[10px] py-[6px] cursor-pointer transition-colors ${
              activeItem === item.label ? "bg-black/[0.03]" : "hover:bg-black/[0.03]"
            }`}
          >
            <span className="font-['Inter',sans-serif] font-normal text-[#2f2b3d] text-[13px] leading-[19px] flex-1 whitespace-nowrap">
              {item.label}
            </span>
            <InlineCountBadge count={item.count} />
            <Chevron />
          </div>
        ))}
      </div>
      {footer}
    </div>
  );
}

