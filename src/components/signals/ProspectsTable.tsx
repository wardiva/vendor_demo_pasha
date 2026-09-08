import InfoIcon from "@/components/InfoIcon";
import LeadsTableEmptyState from "@/components/LeadsTableEmptyState";
import { useLeadsTable } from "@/context/SignalsAnalyticsContext";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import ContactTag from "@/components/ContactTag";
import CopyableValue from "@/components/CopyableValue";
import IntentTag from "@/components/IntentTag";
import LinkedInMark from "@/components/LinkedInMark";
import RevealContactButton from "@/components/reveal/RevealContactButton";
import { fireConfettiFrom } from "@/components/reveal/confetti";
import { REVEAL_DELAY, showButtonLoader } from "@/components/reveal/revealMechanics";
import { contactId, useProspectReveal } from "@/context/ProspectRevealContext";
import { SIGNAL_ROWS, type SignalRow } from "@/data/signalsRows";

/**
 * The prospects table — Figma node 197:1865.
 *
 * One component behind both surfaces: the Signals page's table and the
 * Prospects page's table view, so a company's logo, name, domain, industry,
 * date, score, contact and status read identically on each. Filtering, the
 * empty state, the row click and View All are the page's own.
 */

/**
 * Column widths, from the node's header row.
 *
 * Three are the table's own rather than the node's. BUYER is not the node's
 * 232: the sample names it was drawn against are shorter than these companies,
 * and the longest of them, at 175px of text, needs 284 to sit beside its logo
 * and mark without ending in an ellipsis. Measured from the data rather than
 * guessed, with a few pixels over the 280 it exactly fills so that rounding at
 * another zoom or on another machine cannot tip it back into a truncation.
 * PHONE is not the 233 its
 * header cell states: that left 84px of empty column after the number while
 * every other column runs on 20 or less, so the row read as having a gap in
 * it, and it is sized here to the widest number the data holds plus the same
 * slack its neighbours carry. STATUS is not in the node at all, and takes the
 * width its own tag needs inside the 20px padding.
 */
const W = {
  buyer: 284,
  industry: 183,
  visited: 124,
  intent: 135,
  contact: 233,
  phone: 169,
  status: 148,
} as const;

/** The trailing cell that carries the add-column control. */
const ADD_COL_W = 44;

/* Written out so Tailwind generates each one. */
const COLUMNS = [
  { label: "BUYER", width: "w-[284px]", sticky: true },
  { label: "INDUSTRY", width: "w-[183px]" },
  { label: "VISITED", width: "w-[124px]" },
  { label: "INTENT SCORE", width: "w-[135px]" },
  { label: "CONTACT INFO", width: "w-[233px]" },
  { label: "PHONE", width: "w-[169px]" },
  { label: "STATUS", width: "w-[148px]" },
];

const BASE_WIDTH = Object.values(W).reduce((sum, w) => sum + w, 0);

/* 197:1948 puts one Reveal Contact across the two withheld columns rather than
   inside either, so it is placed against their combined span. */
const REVEAL_LEFT = W.buyer + W.industry + W.visited + W.intent;
const REVEAL_SPAN = W.contact + W.phone;

/**
 * The BUYER column stays put while the rest scrolls.
 *
 * It needs an opaque fill of its own or the cells passing beneath would show
 * through, which is why the row's hover cannot simply paint through it either —
 * `table-sticky-cell` repeats that tint over this fill so the row still reads
 * as one band. The header's cell carries the header's own wash over white for
 * the same reason.
 */
const STICKY_BASE = "sticky left-0 border-r border-solid";
/**
 * The frozen column's right edge.
 *
 * The border is always there and only its colour changes, so the divider
 * appearing cannot nudge the columns by a pixel. It shows the table's own
 * hairline once anything has scrolled under the column, and nothing at all
 * while the table is at rest on its left edge.
 */
const edge = (scrolled: boolean) =>
  scrolled ? "border-[rgba(0,0,0,0.08)]" : "border-transparent";

const stickyCell = (scrolled: boolean) =>
  `${STICKY_BASE} z-[2] bg-white table-sticky-cell ${edge(scrolled)}`;
const stickyHead = (scrolled: boolean) =>
  `${STICKY_BASE} z-[3] bg-white bg-[linear-gradient(rgba(244,242,240,0.6),rgba(244,242,240,0.6))] ${edge(scrolled)}`;

/**
 * The add-column control, at the end of the header.
 *
 * A 24px target inside the header's own 24px line, so the row does not grow,
 * with the hover wash every other icon control in the module uses. It opens
 * nothing for now: the button, where it sits and how it responds are the whole
 * of it until there is something to hang off it.
 */
function AddColumnControl() {
  return (
    <div
      /* The same 10px the other header cells carry, so the control sits on
         the STATUS label own line rather than above it, and the header keeps
         its height. */
      className="flex items-center justify-center py-[10px] relative shrink-0"
      style={{ width: ADD_COL_W }}
      data-name="th"
    >
      <button
        type="button"
        aria-label="Add column"
        className="content-stretch cursor-pointer flex h-[24px] items-center justify-center relative rounded-[6px] shrink-0 text-[#2f2b3d] transition-colors w-[24px] hover:bg-[rgba(7,41,41,0.06)]"
        data-add-column
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M7 2.5V11.5M2.5 7H11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

/** The company logo, at the design's 36px rounded tile. */
function CompanyLogo({ src }: { src: string }) {
  return (
    <div className="relative rounded-[6px] shrink-0 size-[36px]" data-name="Icon">
      <img
        alt=""
        className="absolute inset-0 max-w-none object-contain pointer-events-none rounded-[6px] size-full"
        src={src}
      />
    </div>
  );
}

/** The View All arrow, drawn exactly as the imported page already ships it. */
function MaskedArrow() {
  return (
    <div className="h-[16px] relative shrink-0 w-[10px]" data-name="Masked Icon">
      <div className="absolute left-[-2px] size-[14px] top-px" data-name="arrow-right">
        <svg className="absolute block inset-0 size-full" fill="none" height="32" preserveAspectRatio="none" viewBox="0 0 32 32" width="32">
          <g id="Path" />
        </svg>
        <div className="absolute inset-[47.92%_20.83%]" data-name="Path">
          <div className="absolute inset-[-52.86%_-7.35%]">
            <svg className="block size-full" fill="none" height="1.2" preserveAspectRatio="none" viewBox="0 0 9.36667 1.2" width="9.36667">
              <path d="M0.6 0.6H8.76667" stroke="#072929" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-1/4 left-[54.17%] right-[20.83%] top-1/2" data-name="Path">
          <div className="absolute inset-[-17.14%]">
            <svg className="block size-full" fill="none" height="4.7" preserveAspectRatio="none" viewBox="0 0 4.7 4.7" width="4.7">
              <path d="M0.6 4.1L4.1 0.6" stroke="#072929" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-1/2 left-[54.17%] right-[20.83%] top-1/4" data-name="Path">
          <div className="absolute inset-[-17.14%]">
            <svg className="block size-full" fill="none" height="4.7" preserveAspectRatio="none" viewBox="0 0 4.7 4.7" width="4.7">
              <path d="M0.6 0.6L4.1 4.1" stroke="#072929" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/** A plain text cell — INDUSTRY and VISITED. */
function Cell({ width, value }: { width: string; value: string }) {
  return (
    <div
      className={`content-stretch flex flex-col h-full items-start justify-center px-[20px] py-[14px] relative shrink-0 ${width}`}
      data-name="td"
    >
      <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[13px] text-[rgba(47,43,61,0.7)] whitespace-nowrap">
        {value}
      </p>
    </div>
  );
}

/**
 * CONTACT DETAILS — the 35px avatar, the name with its mark, and the title.
 *
 * Withheld until the contact is disclosed, under the same veil the prospect
 * cards use: no card of its own, so the frost is full-bleed across the cell,
 * which is how the design's rectangle covers it.
 */
function ContactDetailsCell({ contact, locked }: { contact: SignalRow["contact"]; locked: boolean }) {
  if (!contact) {
    return (
      <div className="content-stretch flex h-full items-center pl-[16px] pr-[16px] relative shrink-0 w-[233px]" data-name="td">
        <p className="font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[13px] text-[rgba(47,43,61,0.7)]">
          -
        </p>
      </div>
    );
  }
  return (
    <div
      className={`content-stretch flex gap-[12px] h-full items-center overflow-hidden pl-[16px] pr-[16px] relative shrink-0 w-[233px] ${
        locked ? "lead-card-locked" : ""
      }`}
      data-name="Container"
    >
      <div className="relative rounded-[100px] shrink-0 size-[35px]" data-name="Image">
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[100px] size-full"
          src={contact.avatar}
        />
      </div>
      <div
        className="[word-break:break-word] content-stretch flex flex-col items-start min-w-px relative shrink whitespace-nowrap"
        data-name="Text"
      >
        <div className="content-stretch flex gap-[4px] items-center min-w-px relative shrink w-full">
          {/* The design specifies Public Sans here; the app sets Inter globally
              for every glyph, so this renders in the page's own face. */}
          <p className="font-['Inter',sans-serif] font-medium leading-[22px] overflow-hidden relative shrink text-[#2f2b3d] text-[14px] text-ellipsis">
            {contact.name}
          </p>
          <LinkedInMark size={16} />
        </div>
        <p className="font-['Inter',sans-serif] font-normal leading-[20px] not-italic overflow-hidden relative shrink-0 text-[13px] text-[rgba(47,43,61,0.7)] text-ellipsis w-full">
          {contact.jobTitle}
        </p>
      </div>
    </div>
  );
}

/**
 * PHONE — the number, withheld under the same veil until disclosed.
 *
 * The number keeps the copy control every other phone number in the module
 * has; a click anywhere in the cell is held back from the row so copying can
 * never open the modal underneath.
 */
function PhoneCell({ contact, locked }: { contact: SignalRow["contact"]; locked: boolean }) {
  return (
    <div
      className={`content-stretch flex flex-col h-full items-start justify-center px-[20px] py-[14px] relative shrink-0 w-[169px] ${
        locked ? "lead-card-locked" : ""
      }`}
      data-name="td"
      onClick={e => {
        if ((e.target as HTMLElement).closest("[data-copy-row]")) e.stopPropagation();
      }}
    >
      {contact ? (
        /* data-no-row-hover: the leads-table hover rule matches on the name
           "Row", and nothing in this cell is selectable but its copy button. */
        <CopyableValue
          value={contact.phone}
          className="content-stretch flex items-center min-w-px relative"
        >
          <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[13px] text-[rgba(47,43,61,0.7)] whitespace-nowrap">
            {contact.phone}
          </p>
        </CopyableValue>
      ) : (
        <p className="font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[13px] text-[rgba(47,43,61,0.7)]">
          -
        </p>
      )}
    </div>
  );
}

/**
 * STATUS — the module's own Verified / Recommended tag.
 *
 * The mark runs a point over the 11px it takes elsewhere, and the label at the
 * 13px the table sets for its body text.
 */
function StatusCell({ contact }: { contact: SignalRow["contact"] }) {
  return (
    <div
      className="content-stretch flex h-full items-center px-[20px] py-[14px] relative shrink-0 w-[148px]"
      data-name="td"
    >
      {contact ? (
        <ContactTag variant={contact.variant} size={12} labelSize={13} />
      ) : (
        <p className="font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[13px] text-[rgba(47,43,61,0.7)]">
          -
        </p>
      )}
    </div>
  );
}

function TableRow({
  row,
  hidden,
  onSelect,
  scrolled,
}: {
  row: SignalRow;
  hidden: boolean;
  onSelect: () => void;
  /** True once the columns have been scrolled off their left edge. */
  scrolled: boolean;
}) {
  const { revealed: revealedIds, requestReveal, completeReveal } = useProspectReveal();
  /* Keyed by the contact, not by this row: a person disclosed on their card or
     in the modal opens here already disclosed, and is never charged twice. */
  const id = row.contact ? contactId(row.company, row.contact.name) : "";
  const locked = !!row.contact && !revealedIds.has(id);
  const [, setSettled] = useState(!locked);
  const btnRef = useRef<HTMLButtonElement>(null);
  const pending = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* The same sequence the prospect cards and the modal run: the loader in the
     button, the reveal, the burst from the button, then the veil fading out. */
  const handleReveal = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (pending.current || !locked || !row.contact) return;
    if (!requestReveal(id)) return;
    pending.current = true;

    const btn = btnRef.current;
    const restore = btn ? showButtonLoader(btn) : () => {};

    timers.current.push(
      window.setTimeout(() => {
        pending.current = false;
        restore();
        const origin = btn?.getBoundingClientRect();
        if (origin) fireConfettiFrom(origin);
        completeReveal(id, row.contact?.phone);
        timers.current.push(window.setTimeout(() => setSettled(true), 520));
      }, REVEAL_DELAY),
    );
  };

  return (
    <div
      className="border-[rgba(0,0,0,0.08)] border-b border-solid content-stretch flex h-[66px] items-center relative shrink-0 w-full"
      data-name="Row"
      style={hidden ? { display: "none" } : undefined}
      onClick={onSelect}
    >
      <div
        className={`content-stretch flex gap-[12px] h-full items-center overflow-hidden pl-[20px] pr-[16px] shrink-0 w-[284px] ${stickyCell(scrolled)}`}
        data-name="Container"
      >
        <CompanyLogo src={row.logo} />
        {/* The column is the design width and this cell paints over the one
            behind it, so a name longer than the sample ones ends in an ellipsis
            inside the cell rather than running across the industry beside it. */}
        <div
          className="[word-break:break-word] content-stretch flex flex-col items-start min-w-px relative shrink whitespace-nowrap"
          data-name="Text"
        >
          {/* Name and mark paired exactly as the card view pairs them: 4px
              apart, centred on each other, the mark at the card's 16px. */}
          <div className="content-stretch flex gap-[4px] items-center min-w-px relative shrink w-full">
            {/* The design specifies Public Sans here; the app sets Inter globally
                for every glyph, so this renders in the page's own face. */}
            <p className="font-['Inter',sans-serif] font-medium leading-[22px] overflow-hidden relative shrink text-[#2f2b3d] text-[15px] text-ellipsis">
              {row.company}
            </p>
            <LinkedInMark size={16} />
          </div>
          <p className="font-['Inter',sans-serif] font-normal leading-[20px] not-italic overflow-hidden relative shrink-0 text-[13px] text-[rgba(47,43,61,0.7)] text-ellipsis w-full">
            {row.domain}
          </p>
        </div>
      </div>

      <Cell width="w-[183px]" value={row.industry} />
      <Cell width="w-[124px]" value={row.visited} />

      <div
        className="content-stretch flex gap-[6px] h-full items-center px-[20px] py-[14px] relative shrink-0 w-[135px]"
        data-name="td"
      >
        <IntentTag score={row.intentPct} />
      </div>

      <ContactDetailsCell contact={row.contact} locked={locked} />
      <PhoneCell contact={row.contact} locked={locked} />
      <StatusCell contact={row.contact} />

      {/* Holds the row level with the header's trailing control cell. */}
      <div className="shrink-0" style={{ width: ADD_COL_W }} aria-hidden />

      {/* One control over both withheld columns, above their veils. */}
      {locked && (
        <div
          className="absolute bottom-0 flex items-center justify-center pointer-events-none top-0 z-[3]"
          style={{ left: REVEAL_LEFT, width: REVEAL_SPAN }}
        >
          <RevealContactButton
            ref={btnRef}
            onClick={handleReveal}
            variant="label"
            className="pointer-events-auto"
          />
        </div>
      )}
    </div>
  );
}

export default function ProspectsTable({ showHeader = true }: { showHeader?: boolean }) {
  const { isEmpty, onReset, emptyMinHeight, visibility, onSelectRow, order } = useLeadsTable();
  /* Whether anything has scrolled under the frozen column, which is the only
     thing its divider depends on. Setting the same boolean is a no-op, so this
     re-renders on the crossing rather than on every scroll event. */
  const [scrolled, setScrolled] = useState(false);
  /* The floor the columns scroll below. */
  const tableWidth = BASE_WIDTH + ADD_COL_W;
  /* The Sort control hands down an order; without one the dataset's stands. */
  const rows = order
    ? order.map(id => SIGNAL_ROWS.find(row => row.id === id)).filter(Boolean as unknown as (r: SignalRow | undefined) => r is SignalRow)
    : SIGNAL_ROWS;

  return (
    <div
      className="bg-white content-stretch flex flex-col items-start overflow-hidden relative rounded-[12px] shrink-0 w-full"
      data-name="Invoice Table"
    >
      {/* Title row. data-no-row-hover keeps it out of the selectable-row hover,
          and the View All control keeps the data-name the page delegates on.
          The Prospects page renders the table under its own heading, so it
          asks for the row to be left out. It sits outside the scroller: it
          belongs to the card, not to the columns. */}
      {showHeader && (
      <div
        className="content-stretch flex items-center justify-between px-[20px] py-[12px] relative shrink-0 w-full"
        data-name="Row"
        data-no-row-hover
      >
        <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
          <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[16px] whitespace-nowrap">
            <p className="leading-[24px]">Prospects</p>
          </div>
          <InfoIcon />
        </div>
        <div
          className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0 cursor-pointer"
          data-name="btn-text-secondary btn-sm"
        >
          <p className="[word-break:break-word] capitalize font-['Inter',sans-serif] font-medium leading-[18px] not-italic relative shrink-0 text-[#072929] text-[12px] whitespace-nowrap">
            View All
          </p>
          <MaskedArrow />
        </div>
      </div>
      )}

      {/* The columns scroll only when they genuinely do not fit: the grid holds
          its own width as a floor and stretches to fill anything wider. */}
      <div
        className="overflow-x-auto relative w-full"
        onScroll={e => setScrolled(e.currentTarget.scrollLeft > 0)}
      >
        <div style={{ minWidth: tableWidth }}>
          <div
            className="bg-[rgba(244,242,240,0.6)] border-[rgba(0,0,0,0.08)] border-b border-solid border-t content-stretch flex items-start relative shrink-0 w-full"
            data-name="Table Header"
          >
            {COLUMNS.map(col => (
              <div
                key={col.label}
                className={`content-stretch flex items-center px-[20px] py-[10px] shrink-0 ${col.width} ${
                  col.sticky ? stickyHead(scrolled) : "relative"
                }`}
                data-name="th"
              >
                <p className="[word-break:break-word] font-['Inter',sans-serif] font-medium leading-[24px] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] tracking-[0.2px] uppercase whitespace-nowrap">
                  {col.label}
                </p>
              </div>
            ))}
            <AddColumnControl />
          </div>

          {rows.map(row => (
            <TableRow
              key={row.id}
              row={row}
              hidden={visibility[row.id] === false}
              onSelect={() => onSelectRow(row.id)}
              scrolled={scrolled}
            />
          ))}

          {/* Data rows above are hidden by the filters; this takes their place. */}
          {isEmpty && <LeadsTableEmptyState onReset={onReset} minHeight={emptyMinHeight} />}
        </div>
      </div>
    </div>
  );
}
