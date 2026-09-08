import { useProspectsPage, type ProspectsView } from "@/context/ProspectsPageContext";

/**
 * The Prospects page's view switch — Figma 157:4155.
 *
 * Two 34px buttons in a shell that draws only its left, top and bottom
 * hairline: the selected button carries its own full border, so it closes the
 * shell on whichever side it sits and reads as a pill lifted out of it. The
 * marks are 16px, drawn at 60% ink when idle and full ink when selected —
 * which, with the tinted fill, is the whole difference between the states.
 */
const INK = "#2F2B3D";
const IDLE_OPACITY = 0.6;

/** The table mark — the node's exported glyph, a filled 16px form. */
function TableIcon({ active }: { active: boolean }) {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 16 16">
        <path
          d="M14.9423 2H1.55769C1.40978 2 1.26793 2.05876 1.16334 2.16334C1.05876 2.26793 1 2.40978 1 2.55769V12.0385C1 12.3343 1.11751 12.618 1.32669 12.8272C1.53586 13.0363 1.81957 13.1538 2.11538 13.1538H14.3846C14.6804 13.1538 14.9641 13.0363 15.1733 12.8272C15.3825 12.618 15.5 12.3343 15.5 12.0385V2.55769C15.5 2.40978 15.4412 2.26793 15.3367 2.16334C15.2321 2.05876 15.0902 2 14.9423 2ZM2.11538 6.46154H4.90385V8.69231H2.11538V6.46154ZM6.01923 6.46154H14.3846V8.69231H6.01923V6.46154ZM14.3846 3.11538V5.34615H2.11538V3.11538H14.3846ZM2.11538 9.80769H4.90385V12.0385H2.11538V9.80769ZM14.3846 12.0385H6.01923V9.80769H14.3846V12.0385Z"
          fill={INK}
          fillOpacity={active ? 1 : IDLE_OPACITY}
        />
      </svg>
    </div>
  );
}

/**
 * The card-list mark: three rules in their own 10.8x8.4 box, which the design
 * insets 20% from the sides, a quarter from the top and 30% from the bottom of
 * the 16px frame.
 */
function CardListIcon({ active }: { active: boolean }) {
  const stroke = {
    stroke: INK,
    strokeOpacity: active ? 1 : IDLE_OPACITY,
    strokeWidth: "1.2",
    strokeLinecap: "round" as const,
  };
  return (
    <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Card List">
      <div className="absolute bottom-[30%] left-[20%] right-[20%] top-1/4">
        <div className="absolute inset-[-8.33%_-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8 8.4">
            <path d="M0.6 0.6H10.2" {...stroke} />
            <path d="M0.6 4.2H10.2" {...stroke} />
            <path d="M0.6 7.8H10.2" {...stroke} />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* The selected button: the design's pale green fill, green stroke and soft
   shadow, on the same 10px radius the shell uses. */
const SELECTED =
  "bg-[#f7ffef] border border-[#b1fa63] border-solid shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)]";

export default function ViewControl() {
  const { view, setView } = useProspectsPage();
  const pick = (next: ProspectsView) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setView(next);
  };
  /* 34px tall, not h-full: Figma draws the shell's stroke inside its frame,
     where CSS takes it out of the content box. The buttons overlap those
     hairlines instead, so the selected pill is the full height of the shell and
     sits flush with its edge, as the design has it. */
  const half =
    "cursor-pointer flex flex-[1_0_0] h-[34px] items-center justify-center overflow-clip relative rounded-[10px] -my-px";

  return (
    <div
      /* Closed on all four sides, so the shell reads the same whichever
         segment is selected; the selected pill overlaps the hairline on its own
         side and sits flush with the control's edge, as it does in the design. */
      className="bg-white border border-[rgba(47,43,61,0.18)] border-solid content-stretch flex h-[34px] items-center justify-center relative rounded-[10px] shrink-0 w-[69px]"
      data-name="View"
      role="group"
      aria-label="View"
    >
      <button
        type="button"
        onClick={pick("table")}
        aria-pressed={view === "table"}
        aria-label="Table view"
        className={`${half} -ml-px ${view === "table" ? SELECTED : ""}`}
      >
        <TableIcon active={view === "table"} />
      </button>
      <button
        type="button"
        onClick={pick("cards")}
        aria-pressed={view === "cards"}
        aria-label="Card view"
        className={`${half} -mr-px ${view === "cards" ? SELECTED : ""}`}
      >
        <CardListIcon active={view === "cards"} />
      </button>
    </div>
  );
}
