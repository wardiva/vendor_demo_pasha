import { useEffect, useRef, useState } from "react";
import ViewControl from "@/components/prospects/ViewControl";
import FilterChip from "@/components/filters/FilterChip";
import { FIELD_IDLE, fieldState } from "@/components/filters/fieldStates";
import { useProspectsPage } from "@/context/ProspectsPageContext";
import sortGlyph from "./assets/icon-sort.svg";
import notifyGlyph from "./assets/icon-notify.svg";
import exportGlyph from "./assets/icon-export.svg";
import { PROSPECT_SORTS } from "@/data/prospectSort";
import searchGlyph from "./assets/icon-search.svg";
import calendarGlyph from "./assets/icon-calendar.svg";
import moreGlyph from "./assets/icon-more.svg";

/**
 * Prospects page toolbar — Figma 76:1759.
 *
 * Filters and a search control on the left, the date range and a More menu on
 * the right. Search starts collapsed to its icon and expands into an input;
 * Export and Notify Recipients moved off the toolbar into the More menu.
 *
 * The Filters and date controls keep the markup the page delegates on
 * (`[data-name="text-field"]` and the active/idle badge slots), so the filter
 * panel and date picker open exactly as they did.
 */

/** Shared shell for the toolbar's controls. */
/** The field shell without its hairline, for controls that draw their own. */
const FIELD_BASE = "bg-white content-stretch flex items-center relative rounded-[10px] shrink-0";

const FIELD = `${FIELD_BASE} ${FIELD_IDLE}`;

/** The row's filters, then the clear-all that only appears once something is
    applied. */
function FilterGroup() {
  const {
    signalsCount,
    contactsCount,
    intentCount,
    industryCount,
    hasFilters,
    resetFilters,
    openFilter,
    renderFilterDropdown,
    closeFilter,
  } = useProspectsPage();
  /* Each chip anchors its own menu, so a scroll moves the two together. */
  const menu = (key: string) => ({
    open: openFilter === key,
    dropdown: renderFilterDropdown(key),
    onDismiss: closeFilter,
  });
  return (
    <>
      <FilterChip label="Signals" count={signalsCount} legacyHook {...menu("signals")} />
      <FilterChip label="Intent Score" count={intentCount} marker={{ "data-intent-filter": "" }} {...menu("intent")} />
      <FilterChip label="Industry" count={industryCount} marker={{ "data-industry-filter": "" }} {...menu("industry")} />
      <FilterChip label="Contacts" count={contactsCount} marker={{ "data-contacts-filter": "" }} {...menu("contacts")} />
      {hasFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="[word-break:break-word] cursor-pointer font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap"
        >
          Clear all
        </button>
      )}
    </>
  );
}

/** Collapsed to its icon until clicked, then an input that takes focus. */
function SearchControl() {
  const { search, setSearch } = useProspectsPage();
  const [open, setOpen] = useState(false);
  /* Being open and being typed in are different: the field stays expanded
     while a query stands, and an expanded field nobody is in is not active. */
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  /* Collapse again on an outside click, but only while the field is empty —
     a live query stays visible so the filtered list still explains itself. */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: globalThis.MouseEvent) => {
      const target = e.target as Node;
      if (hostRef.current?.contains(target)) return;
      if (!inputRef.current?.value) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (!open) {
    return (
      <button
        type="button"
        aria-label="Search prospects"
        onClick={() => setOpen(true)}
        className={`${FIELD} cursor-pointer justify-center py-[8px] size-[34px]`}
        data-name="search-toggle"
      >
        <div className="relative shrink-0 size-[16px]" data-name="search">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={searchGlyph} />
        </div>
      </button>
    );
  }

  return (
    /* The field takes the dark stroke while the cursor is in it — the same
       hairline, only recoloured, so its size, radius and spacing are untouched.
       focus-within rather than open: the control stays expanded while a query
       stands, and an expanded field nobody is typing in is not active. */
    <div
      ref={hostRef}
      className={`${FIELD_BASE} ${fieldState(focused)} flex-[1_0_0] gap-[8px] h-[34px] max-w-[264px] min-w-px px-[12px] py-[8px]`}
      data-name="search-field"
    >
      <div className="opacity-40 relative shrink-0 size-[16px]" data-name="search">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={searchGlyph} />
      </div>
      <input
        ref={inputRef}
        value={search}
        onChange={e => setSearch(e.target.value)}
        onKeyDown={e => {
          if (e.key !== "Escape") return;
          setSearch("");
          setOpen(false);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search"
        aria-label="Search prospects"
        className="bg-transparent border-none flex-[1_0_0] font-['Inter',sans-serif] leading-[18px] min-w-px outline-none text-[#2f2b3d] text-[13px] placeholder:text-[rgba(47,43,61,0.4)]"
      />
    </div>
  );
}

function DateControl({ label }: { label: string }) {
  const { dateOpen } = useProspectsPage();
  return (
    /* data-date-field is what the page's click delegate opens the menu on.
       The field is unchanged — same height, padding, calendar mark, type and
       active treatment — and only what it reads varies: a preset's name, or a
       custom range spelled out as it always was. */
    <div
      className={`${FIELD_BASE} ${fieldState(dateOpen)} cursor-pointer h-[34px] pl-[12px] pr-[10px]`}
      data-name="text-field"
      data-date-field
    >
      <div className="content-stretch flex gap-[8px] items-center justify-center py-[6px] relative shrink-0">
        <div className="relative shrink-0 size-[20px]" data-name="Frame">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={calendarGlyph} />
        </div>
        <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">
          <p className="whitespace-pre">
            <span className="leading-[22px]">{label}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * The tick against an applied menu option.
 *
 * The module's own check, at the geometry the filter checkboxes draw it —
 * `M3 7.5L6 10.5L12 4.5` on a 15-unit box, round caps and joins. Drawn in the
 * product's ink rather than the white those use inside a filled box, since
 * here it stands on the menu's own background.
 */
function MenuCheck() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M3 7.5L6 10.5L12 4.5"
        stroke="#072929"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Sort — Figma 142:3047.
 *
 * The row's icon-only field at 39x34, with the design's 14px glyph. The field
 * takes the filters' active treatment while its menu is open and drops back to
 * the default once it closes — an applied order is carried by the list, not by
 * the button. The menu is the More menu's, so both dropdowns behave the same.
 */
function SortControl() {
  const { sort, setSort } = useProspectsPage();
  const [open, setOpen] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: globalThis.MouseEvent) => {
      if (!hostRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={hostRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="Sort prospects"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={e => {
          e.stopPropagation();
          setOpen(prev => !prev);
        }}
        className={`${FIELD_BASE} cursor-pointer justify-center py-[8px] size-[34px] ${fieldState(open)}`}
        data-name="text-field"
        data-sort-control
      >
        {/* Figma 142:3048 nests the glyph rather than stretching it to the
            frame: the outer inset places the 12.2x9.5 art in the 14px box and
            the inner one is the bleed its round caps need, which comes out at
            the asset's own 13.715x11. Filling the frame instead scaled it
            27% taller than drawn. */}
        <span className="relative shrink-0 size-[14px]" data-name="sort-icon">
          <span className="absolute inset-[14.29%_9.18%_17.86%_3.57%]">
            <span className="absolute inset-[-6.84%_-5.32%]">
              <img alt="" className="block max-w-none size-full" src={sortGlyph} />
            </span>
          </span>
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bg-white content-stretch flex flex-col gap-[2px] items-start overflow-clip p-[4px] right-0 rounded-[12px] shadow-[0px_4px_18px_0px_rgba(47,43,61,0.16)] top-[calc(100%+6px)] w-[210px] z-[9998]"
        >
          {PROSPECT_SORTS.map(option => (
            <button
              key={option.key}
              type="button"
              role="menuitemradio"
              aria-checked={sort === option.key}
              onClick={() => {
                setSort(option.key);
                setOpen(false);
              }}
              className="content-stretch cursor-pointer flex font-['Inter',sans-serif] font-normal gap-[8px] h-[34px] hover:bg-[#f5f6f6] items-center leading-[19px] px-[10px] py-[6px] relative rounded-[8px] shrink-0 text-[#2f2b3d] text-[13px] text-left transition-colors w-full"
            >
              {/* The label takes the row and the tick sits after it, so the
                  mark lands against the row's own right padding rather than
                  being spaced off the end of the text. */}
              <span className="flex-1 min-w-px">{option.label}</span>
              {/* Applied, not merely hovered: the row keeps its default
                  background and says which order is in force through the mark
                  alone. Nothing is ticked while the list is in its own order. */}
              {sort === option.key && <MenuCheck />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Export and Notify Recipients, collapsed behind the three-dot control. */
function MoreMenu() {
  const { onExport, onNotify } = useProspectsPage();
  const [open, setOpen] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: globalThis.MouseEvent) => {
      if (!hostRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div ref={hostRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className={`${FIELD_BASE} ${fieldState(open)} cursor-pointer justify-center py-[8px] size-[34px]`}
        data-name="more-toggle"
      >
        <div className="relative shrink-0 size-[14px]" data-name="Frame">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={moreGlyph} />
        </div>
      </button>

      {open && (
        <div
          role="menu"
          data-prospects-more-menu
          className="absolute bg-white content-stretch flex flex-col gap-[2px] items-start overflow-clip p-[4px] right-0 rounded-[12px] shadow-[0px_4px_18px_0px_rgba(47,43,61,0.16)] top-[calc(100%+6px)] w-[180px] z-[9998]"
        >
          {[
            { label: "Notify Recipients", action: onNotify, icon: notifyGlyph },
            { label: "Export", action: onExport, icon: exportGlyph },
          ].map(item => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => run(item.action)}
              className="content-stretch cursor-pointer flex h-[34px] hover:bg-[#f5f6f6] items-center justify-center px-[10px] py-[6px] relative rounded-[8px] shrink-0 transition-colors w-full"
            >
              <span className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-w-px relative">
                <span className="relative shrink-0 size-[16px]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={item.icon} />
                </span>
                <span className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[19px] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">
                  {item.label}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProspectsToolbar() {
  const { dateLabel } = useProspectsPage();
  return (
    /* data-toolbar-row opts this out of the selectable-row hover styling. */
    <div
      className="content-stretch flex items-center justify-between py-[12px] relative shrink-0 w-full"
      data-name="Row"
      data-toolbar-row
    >
      <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
        <FilterGroup />
      </div>

      {/* Search, the date range, the sort, the view switch, then More — the
          order the design puts them in on the right of the row.

          The group takes the width the filters leave and justifies its controls
          to the right, so an expanding search eats its own slack rather than
          pushing anything out of the container. The 12px start margin is the
          floor on the gap to the filters: while the row has room the controls
          are right-aligned and it costs nothing, but once the active filters
          have widened enough for the search to want that space, it cannot grow
          into the last 12px and so can never meet Clear all. */}
      <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center justify-end min-w-px ml-[12px] relative">
        <SearchControl />
        <DateControl label={dateLabel} />
        <SortControl />
        <ViewControl />
        <MoreMenu />
      </div>
    </div>
  );
}
