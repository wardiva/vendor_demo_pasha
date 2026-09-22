import { type ReactNode } from "react";
import svgPaths from "@/imports/BuyerActivityLeads/svg-ry772luhk7";
import CompanyContactsReveal from "@/components/reveal/variations";
import IntentTag from "@/components/IntentTag";
import LinkedInMark from "@/components/LinkedInMark";

import visitedGlyph from "./assets/icon-visited.svg";
import { withoutYear } from "@/data/demoDates";
import type { Prospect } from "@/data/prospects";

/**
 * A prospect card on the Prospects page.
 *
 * Every prospect is company-level, so the card is the imported company card —
 * logo, name, domain, intent meter, firmographics and date — rendered from
 * data instead of seven copies of static markup. Prospects with an identified
 * contact carry the Contact Reveal section on the right; the rest do not.
 *
 * Structure and classes are the export's own, so the card renders exactly as
 * the imported company cards did.
 */

/* ─────────────────────────── icons ─────────────────────────── */

function IndustryIcon() {
  return (
    /* #2F2B3D at 70% — rgba(47, 43, 61, 0.7) — matching the muted text beside
       it. The 70% sits on the group rather than on a path or the wrapper: the
       glyph composites once, so the roofline strokes that overlap stay the
       same weight as the rest of the mark. */
    <div className="relative shrink-0 size-[16px]" data-name="Frame">
      <div className="absolute inset-[9.38%_18.75%_14.24%_12.5%]">
        <div className="absolute inset-[-4.91%_-5.45%]">
          <svg
            className="block size-full"
            fill="none"
            height="13.421"
            preserveAspectRatio="none"
            viewBox="0 0 12.2 13.421"
            width="12.2"
          >
            <g opacity="0.7">
              <path d={svgPaths.p3e38d580} stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
              <path d={svgPaths.pbe01f80} stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
              <path d="M8.54385 0.600008H9.15496" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

/** The calendar mark the design puts beside the visited date. */
function VisitedIcon() {
  return (
    /* #2F2B3D at 70% — rgba(47, 43, 61, 0.7) — matching the muted text beside
       it, and applied once. The export already draws every stroke at that
       colour and that alpha, so the wrapper's own 70% on top of it composited
       to 0.49 and the mark read lighter than the date it labels and than the
       industry mark next to it. The alpha lives in the asset; nothing here
       dims it again. */
    <div className="relative shrink-0 size-[16px]" data-name="Frame">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={visitedGlyph} />
    </div>
  );
}

/* ─────────────────────── firmographic detail row ─────────────────────── */

function DetailRow({ icon, value, leading = "19px" }: { icon: ReactNode; value: string; leading?: string }) {
  return (
    /* The whole card is one clickable surface, so its rows opt out of the
       selectable-row hover. */
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0" data-name="Row" data-no-row-hover>
      <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Row" data-no-row-hover>
        {icon}
        <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[13px] text-[rgba(47,43,61,0.7)] whitespace-nowrap">
          <p style={{ lineHeight: leading }}>{value}</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── contact reveal section ─────────────────────── */

/* The panel is `CompanyContactsReveal`, which draws the company's contacts in
   whichever concept is selected. What it never does is charge per person: one
   reveal opens every contact the company holds, so the panel speaks about the
   group even where it previews one of them. */

/* ─────────────────────────── the card ─────────────────────────── */

export default function ProspectCard({ prospect }: { prospect: Prospect }) {
  return (
    <div
      className="bg-white content-stretch cursor-pointer flex items-center justify-between pl-[8px] pr-[4px] py-[4px] relative rounded-[16px] shrink-0 w-full"
      data-name="Card"
      data-prospect-id={prospect.id}
    >
      {/* The design fixes the company block at 554px and the contact panel at
          381px, so justify-between leaves a constant gap between the two
          rather than letting the company block stretch. */}
      <div
        className="content-stretch flex gap-[16px] items-center justify-center relative shrink-0 w-[554px]"
        data-name="Populer Plan"
      >
        <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-center justify-center min-w-px relative">
          {/* 219:981 — the logo comes down to 48px, on the same 8px radius. */}
          <div className="relative rounded-[8px] shrink-0 size-[48px]" data-name="Logo">
            <img
              alt=""
              className="absolute inset-0 max-w-none object-contain pointer-events-none rounded-[8px] size-full"
              src={prospect.logo}
            />
          </div>

          {/* 219:982 — two lines now, 5px apart: the design drops the domain
              from the card and leaves the name over the firmographics. */}
          <div className="content-stretch flex flex-[1_0_0] flex-col gap-[5px] items-start min-w-px relative">
            <div className="content-stretch flex flex-col items-start relative shrink-0">
              <div className="content-stretch flex items-center relative shrink-0">
                <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
                  <p className="[word-break:break-word] font-['Inter',sans-serif] font-medium leading-[21px] relative shrink-0 text-[#2f2b3d] text-[15px] whitespace-nowrap">
                    {prospect.name}
                  </p>
                  <LinkedInMark size={16} />
                </div>
              </div>
            </div>

            {/* Industry, visited date and Intent Score share one row */}
            <div className="content-stretch flex gap-[24px] items-center relative shrink-0">
              <DetailRow icon={<IndustryIcon />} value={prospect.industry} />
              {/* The year is dropped on the card — the record keeps it, so
                  sorting and the date filter still read the full value. */}
              <DetailRow icon={<VisitedIcon />} value={withoutYear(prospect.date)} />
              <IntentTag score={prospect.intentPct} compact />
            </div>
          </div>
        </div>
      </div>

      {/* The company's contacts, drawn by whichever reveal concept is selected.
          A company with none identified has no panel, as before. */}
      <CompanyContactsReveal company={prospect.name} contacts={prospect.contacts} layout="card" />
    </div>
  );
}
