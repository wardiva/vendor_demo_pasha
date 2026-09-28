/**
 * The locked Prospects tab, second design — Figma 64:7354.
 *
 * A variation of ProspectsLockedOverlay, kept beside it so the two can be
 * compared; the review switch picks which one draws. Same frost, same copy,
 * same lock — only the dialog differs. Geometry, read off the node:
 *
 *   dialog  Dialog/Notes   880 x 638 at content-relative (129, 163), which is
 *                          horizontally centred; white, radius 16, padding 24
 *                          all round, drop shadow 0 4 18 #2f2b3d at 16%.
 *   copy    64:7355        443 x 590, padding 24 24 32 24, space-between: the
 *                          copy packed to the top, the button to the foot.
 *   panel   64:7426        389 x 590, #f5f6f6, radius 12, inset in the
 *                          dialog's padding rather than bled to its edge.
 *   button  64:7419        155 x 42, #072929, radius 12, 0 1 6 #131120 at
 *                          16%; 26px side padding, 15/26 medium, a 10px gap
 *                          to a 20px arrow-right.
 */

import { useLockedAnimation } from "@/lib/prospectsAccess";
import { LOCKED_ANIMATIONS } from "./animations";
import LockedAnimationBar from "./LockedAnimationBar";

const INK = "#2f2b3d";
const MUTED = "rgba(47,43,61,0.7)";
const LIVE = "#072929";

const FEATURES = [
  "Company-level buyer intent contacts*",
  "Contact reveal credits per month*",
  "Buyer intent score on every prospect",
  "Category and activity level signals",
  "Competitor signals*",
  "Company firmographics and technographics",
  "Activity history and AI prospect summary",
  "CSV export and API integration",
] as const;

/** The node's tick — the same 14px lime disc and #072929 check as the first design. */
function FeatureTick() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="block shrink-0">
      <path
        d="M7.14258 0.5C7.99617 0.5 8.84127 0.668462 9.62988 0.995117C10.4185 1.32177 11.1357 1.79974 11.7393 2.40332C12.3428 3.0069 12.8208 3.72408 13.1475 4.5127C13.4741 5.30131 13.6426 6.14641 13.6426 7C13.6426 7.85359 13.4741 8.69869 13.1475 9.4873C12.8208 10.2759 12.3428 10.9931 11.7393 11.5967C11.1357 12.2003 10.4185 12.6782 9.62988 13.0049C8.84127 13.3315 7.99617 13.5 7.14258 13.5C6.28899 13.5 5.44389 13.3315 4.65527 13.0049C3.86666 12.6782 3.14948 12.2003 2.5459 11.5967C1.94232 10.9931 1.46435 10.2759 1.1377 9.4873C0.81104 8.69869 0.642578 7.85359 0.642578 7C0.642578 6.14641 0.81104 5.30131 1.1377 4.5127C1.46435 3.72408 1.94232 3.0069 2.5459 2.40332C3.14948 1.79974 3.86666 1.32177 4.65527 0.995117C5.44389 0.668462 6.28899 0.5 7.14258 0.5Z"
        fill="#B1FA63"
        stroke="#B1FA63"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 7L6 9L10 5" stroke={LIVE} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 64:7425 arrow-right, exported from the node. */
function ArrowRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden className="block shrink-0">
      <path d="M4.16602 10.0002H15.8327" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.834 15L15.834 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.834 5L15.834 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ProspectsLockedOverlayV2() {
  const animation = useLockedAnimation();
  const Animation = (LOCKED_ANIMATIONS.find(a => a.key === animation) ?? LOCKED_ANIMATIONS[0]).Component;
  return (
    <div
      /* The same frost as the first design: #FFFFFF at 80% over the page
         column, which carries the 4px blur itself (see Frame63). */
      className="absolute bottom-0 left-[302px] right-0 top-[60px] z-[5] rounded-[10px] bg-[rgba(255,255,255,0.8)]"
      data-name="Prospects / Locked V2"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="prospects-locked-v2-title"
        className="absolute left-1/2 top-[163px] flex h-[638px] w-[880px] -translate-x-1/2 items-stretch overflow-hidden rounded-[16px] bg-white p-[24px]"
        style={{ boxShadow: "0px 4px 18px 0px rgba(47,43,61,0.16)" }}
        data-name="Dialog/Notes"
      >
        {/* 64:7355 — the copy, with the button pushed to the foot. */}
        <div className="flex w-[443px] shrink-0 flex-col justify-between pb-[32px] pl-[24px] pr-[24px] pt-[24px]">
          <div className="flex flex-col gap-[28px]">
            <div className="flex flex-col gap-[8px]">
              <h2
                id="prospects-locked-v2-title"
                className="font-['Inter',sans-serif] font-medium leading-[32px] text-[24px]"
                style={{ color: INK }}
              >
                Unlock Buyer Intelligence
              </h2>
              <p className="font-['Inter',sans-serif] font-normal leading-[21px] text-[14px]" style={{ color: MUTED }}>
                See the companies researching your profile.
              </p>
            </div>

            <div className="flex flex-col gap-[20px]">
              <ul className="flex flex-col gap-[12px]">
                {FEATURES.map(f => (
                  <li key={f} className="flex h-[20px] items-center gap-[8px]">
                    <span className="flex h-[18px] w-[14px] shrink-0 items-center justify-center">
                      <FeatureTick />
                    </span>
                    <span
                      className="font-['Inter',sans-serif] font-medium leading-[20px] text-[14px] whitespace-nowrap"
                      style={{ color: INK }}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="font-['Inter',sans-serif] font-normal leading-[21px] text-[14px]" style={{ color: MUTED }}>
                *Limits and availability vary by plan
              </p>
            </div>
          </div>

          {/* 64:7419 "Default Button". The node's text is "view plans" set
              in title case. */}
          <button
            type="button"
            className="flex h-[42px] w-[155px] cursor-pointer items-center justify-center gap-[10px] rounded-[12px] bg-[#072929] px-[26px] font-['Inter',sans-serif] font-medium leading-[26px] text-[15px] text-white transition-colors hover:bg-[#0b3b3b]"
            style={{ boxShadow: "0px 1px 6px 0px rgba(19,17,32,0.16)" }}
          >
            <span className="whitespace-nowrap">View Plans</span>
            {/* The node masks the arrow into a 14px slot; the arrow's own
                20px box overhangs it by 3px each side. */}
            <span className="flex h-[22px] w-[14px] shrink-0 items-center justify-center">
              <ArrowRight />
            </span>
          </button>
        </div>

        {/* 64:7426 — the right-hand panel, carrying whichever animation the
            history has chosen. Keyed on it, so a switch starts it from the top. */}
        <div className="relative w-[389px] shrink-0 self-stretch overflow-hidden rounded-[12px] bg-[#f5f6f6]">
          <Animation key={animation} />
        </div>
      </div>
      <LockedAnimationBar />
    </div>
  );
}
