import { createContext, useContext } from "react";
import { REVEAL_ALLOWANCE } from "@/data/contactLeads";

/**
 * Contact Reveals usage indicator in the page header — Figma node 37:3914.
 *
 * Renders the label, the circular progress ring and the count. The Buy More
 * button stays where it is in the imported header.
 */

export type RevealAllowance = { used: number; total: number };

const RevealAllowanceContext = createContext<RevealAllowance>({
  used: REVEAL_ALLOWANCE.used,
  total: REVEAL_ALLOWANCE.total,
});

export const RevealAllowanceProvider = RevealAllowanceContext.Provider;

export function useRevealAllowance(): RevealAllowance {
  return useContext(RevealAllowanceContext);
}

/* Geometry read from the exported ring: an 18px donut with an outer radius of
 * 9 and an inner radius of 6.58947, so the band is 2.41053 wide and its centre
 * line sits at 7.794735. Drawn as arcs rather than the fixed export because it
 * has to track the live count. */
const SIZE = 18;
const OUTER = 9;
const INNER = 6.58947;
const BAND = OUTER - INNER;
const RADIUS = (OUTER + INNER) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/* Figma 157:4099: the ring is drawn in the warning pair — a pale red track
   with the used portion in full red. The geometry, the anticlockwise sweep
   from nine o'clock and the rounded cap are unchanged. */
const TRACK = "#FFDBDC";
const PROGRESS = "#FF4C51";

/* The ring's outer edge lands exactly on the 18x18 frame, as it does in Figma,
   and an <svg> clips to its own viewport — which sliced the anti-aliased edge
   and left the circle looking flattened top, bottom, left and right. The
   drawing area is a unit wider on every side instead, with the box offset by
   the same amount, so one unit still renders as one pixel: the ring keeps its
   exact 18px diameter and position, and now has a pixel of clearance on all
   sides for its edge and its round caps. */
const PAD = 1;
const BOX = SIZE + PAD * 2;

export function RevealProgressRing({ used, total }: RevealAllowance) {
  const pct = total > 0 ? Math.min(Math.max(used / total, 0), 1) : 0;
  /* A round cap adds half the band beyond each end of the dash, so a dash of
     exactly pct x circumference draws pct + one band's worth of arc: at 48/50
     that overran the circle and the ring closed completely, with no gap to
     read. Taking the band back off the dash makes the *visible* arc — caps
     included — exactly pct of the ring, and a full allowance still closes it
     precisely. */
  const dash = Math.min(Math.max(CIRCUMFERENCE * pct - BAND, 0), CIRCUMFERENCE);

  return (
    <div className="relative shrink-0 size-[18px]">
      <svg
        className="absolute block overflow-visible"
        style={{ left: -PAD, top: -PAD, width: BOX, height: BOX }}
        viewBox={`${-PAD} ${-PAD} ${BOX} ${BOX}`}
        fill="none"
        role="img"
        aria-label={`${used} of ${total} contact reveals used`}
      >
        <circle cx={OUTER} cy={OUTER} r={RADIUS} stroke={TRACK} strokeWidth={BAND} />
        {pct > 0 && (
          <circle
            cx={OUTER}
            cy={OUTER}
            r={RADIUS}
            stroke={PROGRESS}
            strokeWidth={BAND}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
            /* Mirrors the x axis so the sweep starts at the nine o'clock
               position and runs anticlockwise, matching the export. */
            transform={`translate(${SIZE},0) scale(-1,1)`}
            style={{ transition: "stroke-dasharray 480ms ease" }}
          />
        )}
      </svg>
    </div>
  );
}

export default function ContactRevealsMeter() {
  const { used, total } = useRevealAllowance();
  return (
    <>
      <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[13px] text-[rgba(47,43,61,0.7)] text-center whitespace-nowrap">
        Contact Reveals
      </p>
      <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
        <RevealProgressRing used={used} total={total} />
        <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[13px] text-[rgba(47,43,61,0.7)] text-center whitespace-nowrap">
          <span className="font-['Inter',sans-serif] font-medium leading-[22px] text-[#072929]">
            {used}
          </span>
          <span className="leading-[22px]">/{total}</span>
        </p>
      </div>
    </>
  );
}
