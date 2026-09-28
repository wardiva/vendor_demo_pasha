/**
 * The locked Prospects tab — Figma 61:1394.
 *
 * The real Prospects page stays drawn underneath, frosted, with an unlock
 * dialog over it. That is the design's argument: the reader can see that the
 * page is full — rows, logos, intent chips — without being able to read any of
 * it, which says what the plan buys more convincingly than a description would.
 *
 * Geometry, read off the node rather than judged:
 *
 *   frost   Rectangle 18370   x 302, y 60 — the content area, one pixel inside
 *                             its left border and clear of the 60px top bar —
 *                             to the right and bottom edges; #ffffff at 80%,
 *                             background blur 4, radius 10. The sidebars and
 *                             the top bar are not covered.
 *   dialog  Dialog/Notes      778 x 524 at content-relative (180, 220), which
 *                             is horizontally centred; white, radius 16, drop
 *                             shadow 0 4 18 #2f2b3d at 16% — the same shadow
 *                             the app's own floating panels already use.
 *
 * The page beneath is made inert by the host while this is up, so nothing
 * behind the frost can be clicked, focused or tabbed to. The lock is a lock.
 */

import ProspectsUnlockAnimation from "./ProspectsUnlockAnimation";

const INK = "#2f2b3d";
const MUTED = "rgba(47,43,61,0.7)";
const LIVE = "#072929";

/* The node's eight rows, in its order. The asterisks are the node's — they
   point at the footnote under the list. */
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

/** 61:2461's own tick, exported from the node: 14px lime disc, #072929 check. */
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

export default function ProspectsLockedOverlay() {
  return (
    <div
      /* #FFFFFF at 80% and nothing else. The node's 4px background blur is
         applied to the page column underneath (see Frame63) rather than here
         as a backdrop-filter: at this element's full-page height the browser
         blurred it unevenly, sharper toward the foot. Blurring the content
         directly is uniform everywhere, and the result is the same composite —
         4px of blur with 80% white laid over it. The dialog is not part of the
         blurred content, so it stays sharp. */
      className="absolute bottom-0 left-[302px] right-0 top-[60px] z-[5] rounded-[10px] bg-[rgba(255,255,255,0.8)]"
      data-name="Prospects / Locked"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="prospects-locked-title"
        /* No fixed height: the dialog hugs the copy, so the button closes the
           left panel at the node's own 32px bottom padding instead of floating
           above a band of empty panel. The right half stretches to match. */
        className="absolute flex items-stretch overflow-hidden rounded-[16px] bg-white w-[778px] left-1/2 -translate-x-1/2 top-[220px]"
        style={{ boxShadow: "0px 4px 18px 0px rgba(47,43,61,0.16)" }}
        data-name="Dialog/Notes"
      >
        {/* 61:2453 — the copy. A fixed 28px between the title block and the
            list, which is the node's own itemSpacing; it used to be stretched
            to 54 by space-between. Packed to the top, so every gap below it
            keeps its value and the spare height falls to the foot. */}
        <div className="flex w-[389px] shrink-0 flex-col gap-[28px] pb-[32px] pl-[24px] pr-[24px] pt-[24px]">
          <div className="flex flex-col gap-[8px]">
            <h2
              id="prospects-locked-title"
              className="font-['Inter',sans-serif] font-medium leading-[32px] text-[24px]"
              style={{ color: INK }}
            >
              Unlock Buyer Intelligence
            </h2>
            <p className="font-['Inter',sans-serif] font-normal leading-[21px] text-[14px]" style={{ color: MUTED }}>
              See the companies researching your profile.
            </p>
          </div>

          {/* 24 from the footnote to the button, down from 32: close enough
              that the button reads as the list's conclusion, still clear of
              the footnote's descenders. */}
          <div className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[20px]">
              <ul className="flex flex-col gap-[12px]">
                {FEATURES.map(f => (
                  <li key={f} className="flex h-[20px] items-center gap-[8px]">
                    {/* 14 x 18 in the node, the tick centred in it. */}
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

            {/* 61:2482 "Default Button": 341 x 36, #072929 at radius 10, a
                0 2 6 shadow in the same ink at 30%, 15px medium white. The
                node's text is "View plans" set in title case. */}
            <button
              type="button"
              className="flex h-[36px] w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#072929] font-['Inter',sans-serif] font-medium leading-[24px] text-[15px] text-white transition-colors hover:bg-[#0b3b3b]"
              style={{ boxShadow: "0px 2px 6px 0px rgba(7,41,41,0.3)" }}
            >
              View Plans
            </button>
          </div>
        </div>

        {/* 61:2520 — the right half, a flat #f4f2f0 panel, carrying the
            animation of what the plan unlocks. Same size, same fill; the
            animation is clipped to it. */}
        <div className="w-[389px] shrink-0 self-stretch overflow-hidden bg-[#f4f2f0]">
          <ProspectsUnlockAnimation />
        </div>
      </div>
    </div>
  );
}
