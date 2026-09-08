import InfoIcon from "@/components/InfoIcon";
import LeadsTableEmptyState from "@/components/LeadsTableEmptyState";
import ProspectCard from "@/components/prospects/ProspectCard";
import { useLeadsTable } from "@/context/SignalsAnalyticsContext";
import { PROSPECTS, type Prospect } from "@/data/prospects";

/**
 * The Signals page's Prospects section — Figma node 212:861.
 *
 * The node is named "Invoice Table" but holds no table: no header, no columns,
 * no dividers. It is the title row over a 12px-gapped stack of prospect cards,
 * and each card is the design the Prospects page's cards already render — the
 * 66px logo, the name with its LinkedIn mark, the domain, the industry, visited
 * date and Intent chip on one line, and the 312px contact panel with its veil
 * and Reveal Contact control. So the card here IS `ProspectCard`, unchanged and
 * unforked: the two surfaces cannot drift apart, and every field, avatar, mark,
 * blur and reveal is the one the cards already ship.
 *
 * Only the page's own behaviour lives here — the title row, the row click that
 * opens the Prospect Details modal, and the no-data state. The Prospects page's
 * table view still runs on `ProspectsTable`, which this does not touch.
 *
 * The section is independent of the filter row above it. Those chips and the
 * date range narrow what the summary figures and the four charts are
 * aggregated from; this list is not one of those readouts and does not move
 * with them.
 */

/**
 * How many prospects this section lists.
 *
 * The dataset is longer than the page shows, so this takes its first eight
 * companies. A fixed window on a fixed list: the count is the same eight
 * whatever is selected above.
 */
const SIGNALS_LIMIT = 8;

/** The View All arrow, drawn exactly as the Signals table already ships it. */
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

export default function ProspectsCardList() {
  /* Only the row click and the no-data reset are taken from the page. The
     filter state deliberately is not: see below. */
  const { onReset, onSelectRow } = useLeadsTable();

  /* One card per company. The dataset holds one prospect per company already,
     so nothing is dropped here today; the guard is what keeps a company that
     gains a second record — another session, another visit, another office —
     from being drawn twice on a surface that lists companies. */
  const seen = new Set<string>();

  /**
   * The section's own list: the dataset's first eight companies, in the
   * dataset's own order.
   *
   * Read straight from `PROSPECTS` rather than from anything the page's filters
   * have been through. The chips and the date range above narrow the accounts
   * the metrics and the four charts are aggregated from; this section is not
   * one of those readouts, and it holds still while they move. So no filter can
   * add a card, drop one, swap a company or reorder the list — applying,
   * changing, clearing a selection all leave exactly these eight, exactly here.
   */
  const rows: Prospect[] = PROSPECTS.filter(p => {
    if (seen.has(p.name)) return false;
    seen.add(p.name);
    return true;
  }).slice(0, SIGNALS_LIMIT);

  /* Only ever true if the dataset itself is empty — nothing on this page can
     narrow the list to nothing. */
  const noneVisible = rows.length === 0;

  return (
    <div
      /* 212:861 — no fill and no padding of its own: the cards are the white
         surfaces, on the page's own ground. */
      className="content-stretch flex flex-col items-start relative rounded-[12px] shrink-0 w-full"
      data-name="Invoice Table"
    >
      {/* 212:862. data-no-row-hover keeps the title out of the selectable-row
          hover, and the View All control keeps the data-name the page
          delegates on. The node gives this row 12px of vertical padding and
          none horizontally, so the title sits flush with the cards below it. */}
      <div
        className="content-stretch flex items-center justify-between py-[12px] relative shrink-0 w-full"
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

      {/* 212:872 — the cards, 12px apart. */}
      <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
        {rows.map(prospect => (
          /* The card carries the design; this wrapper carries the row. Naming
             it "Row" is what gives it the table's own hover — the same 6% lime
             wash, transition and pointer, from the same rule — and the click
             that opens the Prospect Details modal. The card paints an opaque
             white over that wash, so `data-prospect-row` lets the tint be
             repeated on top of it and the hover reads as one band across the
             card and its contact panel.

             Reveal Contact stops its own click in React, and a click on a
             phone number is stopped by App's capture-phase copy delegate, so
             neither opens the modal underneath. */
          <div
            key={prospect.id}
            className="relative shrink-0 w-full"
            data-name="Row"
            data-prospect-row
            onClick={() => onSelectRow(prospect.id)}
          >
            <ProspectCard prospect={prospect} />
          </div>
        ))}

        {/* Every card above is hidden by the filters; this takes their place.
            It keeps the white card the table's own empty state sat on, since
            the rows it replaces are the only white surfaces in this section.

            No floor under it. The height passed here was the dataset's own —
            every prospect times a row — which a table wants so its body does
            not vanish out from under its header, but this section has no header
            to hold open. It only ever made the section as tall as all nineteen
            prospects would have been, so a filter that matched nothing left
            1254px of white with a sentence in the middle of it. Left to its
            content the panel is the height of the state it is showing, and the
            state centres itself in it. */}
        {/* 115px above and below, so the panel stands 230px taller than its
            content alone would make it. Left at exactly its content the panel
            read as cramped against the section above it. The padding is
            symmetric and the state centres itself, so the sentence and its
            button sit in the middle of the taller panel and the spacing inside
            the state is untouched. */}
        {noneVisible && (
          <div className="bg-white overflow-hidden py-[115px] relative rounded-[12px] shrink-0 w-full">
            <LeadsTableEmptyState onReset={onReset} />
          </div>
        )}
      </div>
    </div>
  );
}
