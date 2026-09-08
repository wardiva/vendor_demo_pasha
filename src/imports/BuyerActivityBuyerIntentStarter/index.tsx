import chevronDownGlyph from "@/components/nav/assets/icon-chevron-down.svg";
import BuyerIntelligenceSubNav, { MainNavBuyerIntelligence } from "@/components/nav/BuyerIntelligenceNav";
import svgPaths from "./svg-dwbtzma8kn";
import imgIconJpeg from "./62fcc20d40d8545e652158ad9365c64cfd17b62f.png";
import imgEllipse604 from "./dc37899f-c3de-43cc-b219-15a5468d33f4.png";
import imgEllipse607 from "./cd1f800d-4e42-489c-9136-74db43656c5f.png";
import imgEllipse606 from "./ef6c5297-a4d8-42a6-ac7a-6aea597acfdf.png";
import imgFrame from "./f0d9253d-52cb-4748-bde2-7247fd59eba0.png";
/* Competitor Signals has its own avatar set — Figma 95:2733. */
import imgCompetitor1 from "./ca89ac40-9c73-4f70-8f68-ac161c3d6311.png";
import imgCompetitor2 from "./5c0cd833-c415-443a-84be-8c7f0f0da0e0.png";
import imgCompetitor3 from "./3d013011-6d98-43e2-9851-31e78c29b6c6.png";
import imgCompetitor4 from "./44f1be8e-e378-481b-b978-f1cefbe83ce8.png";
import imgCompetitor5 from "./79a1a775-40de-4b07-a610-5b8eed37ae8b.png";
import imgCompetitorMore from "./c0c83bcc-d499-465b-b910-3b4e3f39a456.png";
import imgImage from "./025345fc75e7100f8bef072c3c35641d598f915e.png";
import imgImage667 from "./c20326823186c31c8948928871851564bb9c8589.png";
import imgImage1 from "./31a60c48e14ab2409792068b893ad2f89fe32ee0.png";
import imgImage2 from "./cd81baf587a9dd9e1b0dd03b300af6b2dcd43627.png";
import imgImage3 from "./1d005ad055e5ad711af65c3db30f19057b89ab41.png";
import imgImage4 from "./e1316db0d52da017d8dadbb3f046c242e3ae0c06.png";
import imgAvatar from "./148b1a6d07c50cdb128bc8e19f77df73c62e2be8.png";
import { imgGroup, imgGroup1, imgVector, imgGroup2 } from "./svg-ynf45";
import type { ComponentType } from "react";
import { useSignalsAnalytics } from "@/context/SignalsAnalyticsContext";
import AnimatedMetric from "@/components/signals/AnimatedMetric";
import { shownValue, useAnimatedSlices } from "@/components/analytics/useAnimatedSlices";
import ProspectsCardList from "@/components/signals/ProspectsCardList";
import InfoIcon from "@/components/InfoIcon";
import ContactRevealsMeter from "@/components/ContactRevealsMeter";
import SignalsFilterRow from "@/components/signals/SignalsFilterRow";
import { COMPANIES, type SignalsAnalytics, type SummaryStat } from "@/data/signals";
import { PROSPECT_COMPANIES } from "@/data/prospects";
import { CardEmptyState, DonutChart, MAX_BAR_FILL, barWidth, largest } from "@/components/analytics/ChartPrimitives";
import { HelpControl } from "@/components/HelpIcon";

function Frame() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" height="20" preserveAspectRatio="none" viewBox="0 0 20 20" width="20">
        <g clipPath="url(#clip0_0_639)" id="Frame">
          <g id="Vector" />
          <g id="Group 1261156441">
            <path d="M3.33203 6H16.6654" id="Vector_2" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" strokeWidth="1.5" />
            <path d="M5 10H15" id="Vector_3" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" strokeWidth="1.5" />
            <path d="M7.5 14H12.5" id="Vector_4" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" strokeWidth="1.5" />
          </g>
        </g>
        <defs>
          <clipPath id="clip0_0_639">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame64() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center py-[6px] relative shrink-0">
      <Frame />
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">
        <p className="leading-[22px]">Filters</p>
      </div>
    </div>
  );
}

function TextField() {
  return (
    <div className="bg-white content-stretch flex items-center pl-[10px] pr-[12px] relative rounded-[10px] shrink-0" data-name="text-field">
      <div aria-hidden data-filters-idle="" className="absolute border border-[rgba(47,43,61,0.18)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Frame64 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" height="20" preserveAspectRatio="none" viewBox="0 0 20 20" width="20">
        <g clipPath="url(#clip0_0_572)" id="Frame">
          <g id="Vector" />
          <path d={svgPaths.p1acbfa00} id="Vector_2" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" strokeWidth="1.5" />
          <path d="M13.3333 2.5V5.83333" id="Vector_3" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" strokeWidth="1.5" />
          <path d="M6.66667 2.5V5.83333" id="Vector_4" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" strokeWidth="1.5" />
          <path d="M3.33333 9.16667H16.6667" id="Vector_5" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" strokeWidth="1.5" />
        </g>
        <defs>
          <clipPath id="clip0_0_572">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame65() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center py-[6px] relative shrink-0">
      <Frame1 />
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">
        <p className="whitespace-pre">
          <span className="leading-[22px]">{`Aug 9, 2025  `}</span>
          <span className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[22px] not-italic">→</span>
          <span className="leading-[22px]">{`  Sep 9, 2025 `}</span>
        </p>
      </div>
    </div>
  );
}

function TextField1() {
  return (
    <div className="bg-white content-stretch flex items-center pl-[10px] pr-[12px] relative rounded-[10px] shrink-0" data-name="text-field">
      <div aria-hidden className="absolute border border-[rgba(47,43,61,0.18)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Frame65 />
    </div>
  );
}

function Frame134() {
  return (
    <div className="absolute content-stretch flex gap-[8px] items-center left-[215px] top-[-5px]">
      <TextField />
      <TextField1 />
    </div>
  );
}

function Frame148() {
  return (
    <div className="[word-break:break-word] content-stretch flex gap-[10px] items-center not-italic relative shrink-0 whitespace-nowrap">
      <p className="font-['Inter',sans-serif] font-medium leading-[46px] relative shrink-0 text-[#2f2b3d] text-[24px]">Signals</p>
      <p className="font-['Inter',sans-serif] font-normal leading-[0] relative shrink-0 text-[13px] text-[rgba(47,43,61,0.7)] text-center">
        <span className="leading-[22px]">{`Companies `}</span>
        <span className="font-['Inter',sans-serif] font-medium leading-[22px] text-[#072929]">478</span>
        <span className="leading-[22px]">/600</span>
      </p>
    </div>
  );
}

function Frame146() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0">
      <Frame148 />
    </div>
  );
}

function OutlineButton() {
  return (
    <div className="h-[34px] relative rounded-[10px] shrink-0" data-name="Outline Button">
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip px-[12px] relative rounded-[inherit] size-full">
        <p className="[word-break:break-word] capitalize font-['Inter',sans-serif] font-medium leading-[24px] not-italic relative shrink-0 text-[#072929] text-[13px] whitespace-nowrap">Buy More</p>
      </div>
      <div aria-hidden className="absolute border border-[#072929] border-solid inset-0 pointer-events-none rounded-[10px]" />
    </div>
  );
}

function Frame17() {
  return (
    <div className="content-stretch flex gap-[8px] h-full items-center relative shrink-0">
      <ContactRevealsMeter />
      <OutlineButton />
    </div>
  );
}

function Frame16() {
  return (
    <div className="content-stretch flex h-[34px] items-center relative shrink-0">
      <Frame17 />
    </div>
  );
}

function Frame147() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <Frame16 />
    </div>
  );
}

function Frame135() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <Frame146 />
      <Frame147 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" height="20" preserveAspectRatio="none" viewBox="0 0 20 20" width="20">
        <g clipPath="url(#clip0_0_572)" id="Frame">
          <g id="Vector" />
          <path d={svgPaths.p1acbfa00} id="Vector_2" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" strokeWidth="1.5" />
          <path d="M13.3333 2.5V5.83333" id="Vector_3" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" strokeWidth="1.5" />
          <path d="M6.66667 2.5V5.83333" id="Vector_4" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" strokeWidth="1.5" />
          <path d="M3.33333 9.16667H16.6667" id="Vector_5" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" strokeWidth="1.5" />
        </g>
        <defs>
          <clipPath id="clip0_0_572">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame66() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center py-[6px] relative shrink-0">
      <Frame2 />
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">
        <p className="whitespace-pre">
          <span className="leading-[22px]">{`Aug 9, 2025  `}</span>
          <span className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[22px] not-italic">→</span>
          <span className="leading-[22px]">{`  Sep 9, 2025 `}</span>
        </p>
      </div>
    </div>
  );
}

function TextField2() {
  return (
    <div className="bg-white content-stretch flex items-center pl-[10px] pr-[12px] relative rounded-[10px] shrink-0" data-name="text-field">
      <div aria-hidden className="absolute border border-[rgba(47,43,61,0.18)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Frame66 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" height="20" preserveAspectRatio="none" viewBox="0 0 20 20" width="20">
        <g clipPath="url(#clip0_0_639)" id="Frame">
          <g id="Vector" />
          <g id="Group 1261156441">
            <path d="M3.33203 6H16.6654" id="Vector_2" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" strokeWidth="1.5" />
            <path d="M5 10H15" id="Vector_3" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" strokeWidth="1.5" />
            <path d="M7.5 14H12.5" id="Vector_4" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" strokeWidth="1.5" />
          </g>
        </g>
        <defs>
          <clipPath id="clip0_0_639">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function ChipBgLabelDanger1() {
  return (
    <div className="bg-[rgba(177,250,99,0.32)] content-stretch flex items-center justify-center p-[4px] relative rounded-[6px] shrink-0 size-[18px]" data-name="chip bg-label-danger">
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#072929] text-[11px] text-center whitespace-nowrap">
        <p className="leading-[16px]">2</p>
      </div>
    </div>
  );
}

function Frame67() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center py-[6px] relative shrink-0">
      <Frame3 />
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">
        <p className="leading-[22px]">Filters</p>
      </div>
      <ChipBgLabelDanger1 />
    </div>
  );
}

function TextField3() {
  return (
    <div className="bg-white content-stretch flex items-center pl-[10px] pr-[12px] relative rounded-[10px] shrink-0" data-name="text-field">
      {/* Closed state — same hairline as the Date Range control beside it. */}
      <div aria-hidden data-filters-idle="" className="absolute border border-[rgba(47,43,61,0.18)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      {/* Active state — unchanged; shown with its drop shadow once filters apply. */}
      <div aria-hidden data-filters-active="" className="absolute border border-[#b1fa63] border-solid inset-0 pointer-events-none rounded-[10px]" style={{ display: "none" }} />
      <Frame67 />
    </div>
  );
}

function Frame136() {
  return (
    /* Filters holds the row's left edge and the date range is pushed to its
       right edge, which lines up with Buy More in the header above. The row is
       already full width, so justify-between does it without any offsets. */
    <div className="content-stretch flex gap-[12px] items-center justify-between relative shrink-0 w-full">
      {/* Figma 163:4949 — the five filter chips and the clear-all hold the
          row's left edge; the date range keeps the right. */}
      <SignalsFilterRow />
      <TextField2 />
    </div>
  );
}

const TREND_COLORS = { up: "#24B364", down: "#FF4C51", flat: "rgba(47,43,61,0.6)" } as const;

/* The two glyph sizes the design uses: the first summary card is slightly
 * smaller than the three signal cards. */
const TREND_VARIANTS = {
  sm: {
    line: { inset: { top: "-10.29%", bottom: "-10.29%", left: "-5.71%", right: "-5.71%" }, w: 11.7, h: 7.03333, path: svgPaths.p1bb22f00 },
    head: { inset: { top: "-14.69%", bottom: "-14.69%", left: "-14.69%", right: "-14.69%" }, size: 5.28333, path: "M0.6 0.6H4.68333V4.68333" },
    stroke: 1.2,
  },
  md: {
    line: { inset: { top: "-12.86%", bottom: "-12.86%", left: "-7.14%", right: "-7.14%" }, w: 12, h: 7.33333, path: svgPaths.p26a35900 },
    head: { inset: { top: "-18.37%", bottom: "-18.37%", left: "-18.37%", right: "-18.37%" }, size: 5.58333, path: "M0.75 0.75H4.83333V4.83333" },
    stroke: 1.5,
  },
} as const;

/**
 * Change against the previous reporting period, recomputed from whatever the
 * current filters select. Uses the design's trending-up mark, mirrored for a
 * decline and replaced by a dash when there is no baseline to compare against.
 */
function TrendIndicator({ stat, variant }: { stat: SummaryStat; variant: "sm" | "md" }) {
  const { deltaPct } = stat;
  const direction = deltaPct === null || Math.abs(deltaPct) < 0.05 ? "flat" : deltaPct > 0 ? "up" : "down";
  const color = TREND_COLORS[direction];
  const label =
    deltaPct === null ? "—" : direction === "flat" ? "0%" : `${Math.abs(deltaPct).toFixed(1)}%`;
  const v = TREND_VARIANTS[variant];
  const textCls = variant === "sm" ? "text-[13px]" : "text-[14px]";
  const leadCls = variant === "sm" ? "leading-[19px]" : "leading-[22px]";

  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Percentage">
      <div
        className="relative shrink-0 size-[14px]"
        data-name={direction === "down" ? "trending-down" : direction === "up" ? "trending-up" : "trending-flat"}
      >
        {direction === "flat" ? (
          <svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 14 14">
            <path d="M3 7H11" stroke={color} strokeWidth={v.stroke} strokeLinecap="round" />
          </svg>
        ) : (
          /* A decline is the same mark flipped, so both directions stay on-design. */
          <div className="absolute inset-0" style={direction === "down" ? { transform: "scaleY(-1)" } : undefined}>
            <div className="absolute inset-[29.17%_12.5%]" data-name="Path">
              <div className="absolute" style={v.line.inset}>
                <svg className="block size-full" fill="none" height={v.line.h} preserveAspectRatio="none" viewBox={`0 0 ${v.line.w} ${v.line.h}`} width={v.line.w}>
                  <path d={v.line.path} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={v.stroke} />
                </svg>
              </div>
            </div>
            <div className="absolute inset-[29.17%_12.5%_41.67%_58.33%]" data-name="Path">
              <div className="absolute" style={v.head.inset}>
                <svg className="block size-full" fill="none" height={v.head.size} preserveAspectRatio="none" viewBox={`0 0 ${v.head.size} ${v.head.size}`} width={v.head.size}>
                  <path d={v.head.path} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={v.stroke} />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
      <div
        className={`[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 whitespace-nowrap ${textCls}`}
        style={{ color }}
      >
        <p className={leadCls}>{label}</p>
      </div>
    </div>
  );
}

function Percentage() {
  return <TrendIndicator stat={useSignalsAnalytics().stats.buyers} variant="sm" />;
}

function Frame52() {
  return (
    <div className="content-stretch flex gap-[4px] items-end relative shrink-0">
      <div className="[word-break:break-word] capitalize flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[28px] whitespace-nowrap">
        {/* Only the figure counts; the trend beside it is untouched. */}
        <p className="leading-[36px]"><AnimatedMetric value={useSignalsAnalytics().stats.buyers.value} /></p>
      </div>
      <Percentage />
    </div>
  );
}

function Frame34() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
        <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[16px] whitespace-nowrap">
          <p className="leading-[24px]">Buyers in Market</p>
        </div>
        <InfoIcon />
      </div>
      <Frame52 />
    </div>
  );
}

function Frame33() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame34 />
    </div>
  );
}

function Frame35() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame33 />
    </div>
  );
}

function Group() {
  return (
    /* The mark fills the circle rather than sitting 4.17% inside it: that
       inset is measured from the padding box, so once the wrapper took its 1px
       ring the art shrank away from it and left a pale gap that read as a
       thick, ragged stroke. Filling the box puts the mark against the ring the
       way every other avatar sits, with no fractional inset to round off.
       (Figma writes the same correction as inset-[calc(4.17%-0.92px)].) */
    <div className="absolute inset-0" data-name="Group">
      <svg className="absolute block inset-0 size-full" fill="none" height="25.6667" preserveAspectRatio="none" viewBox="0 0 25.6667 25.6667" width="25.6667">
        <g id="Group">
          <path d={svgPaths.p1f6b9080} fill="#B2C248" id="Vector" />
          <path d={svgPaths.p2ff3bf80} fill="#1E1E1E" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function ClipPathGroup() {
  return (
    <div className="absolute contents inset-[4.17%]" data-name="Clip path group">
      <Group />
    </div>
  );
}

function Frame121() {
  return (
    <div className="border border-solid border-white mr-[-4px] overflow-hidden relative rounded-[100px] shrink-0 size-[28px]">
      <ClipPathGroup />
    </div>
  );
}

function Frame4() {
  return (
    /* The white ring is this element's own border, as 95:2754 draws it, rather
       than an overlay laid inside it: an inset overlay is a second rounded
       edge clipped against the wrapper's, and the two rounding passes are what
       left the stroke looking doubled and ragged. One border on one circle
       antialiases once. */
    <div
      className="border border-solid border-white mr-[-4px] overflow-hidden relative rounded-[100px] shrink-0 size-[28px]"
      data-name="Frame"
    >
      <div aria-hidden className="absolute inset-0 pointer-events-none rounded-[100px]">
        <img alt="" className="absolute max-w-none object-contain rounded-[100px] size-full" src={imgFrame} />
        <div className="absolute bg-[rgba(0,0,0,0.6)] inset-0 rounded-[100px]" />
      </div>
      <div className="content-stretch flex items-center justify-center overflow-clip relative rounded-[inherit] size-full">
        <p className="[word-break:break-word] font-['Inter',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[13px] text-white whitespace-nowrap">+1</p>
      </div>
    </div>
  );
}

/**
 * The avatar group on the Competitor Signals card (Figma 95:2733).
 *
 * Same geometry as the shared Friends group — 28px circles overlapping by 4px,
 * white rings on the first, fourth and last — but its own images, and a plain
 * image in the fourth slot where the shared group draws a vector mark. It is a
 * separate component so the two cards' avatar sets stay independent; it keeps
 * data-name="Friends", which is what the hover spring and the click that opens
 * the Prospects page both key on.
 */
function FriendsCompetitor() {
  /* Figma 95:2733, built like the Buyers in Market stack beside it: the logos
     are full-bleed square artwork, so the circle belongs to the avatar rather
     than the file — each slot clips its image to a round wrapper and carries
     the ring as that wrapper's own border. One rounded edge per avatar, so the
     stroke antialiases once instead of being an inset overlay clipped against
     a second circle. object-cover crops nothing on a square source, and the
     28px size and -4px overlap are the design's. */
  const slot =
    "border border-solid border-white mr-[-4px] overflow-hidden relative rounded-[100px] shrink-0 size-[28px]";
  const mark = "absolute block inset-0 max-w-none object-cover size-full";
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Friends">
      <div className={`${slot} pointer-events-none`} data-name="Icon.jpeg">
        <img alt="" className={mark} src={imgCompetitor1} />
      </div>
      <div className={slot}>
        <img alt="" className={mark} height="28" src={imgCompetitor2} width="28" />
      </div>
      <div className={slot}>
        <img alt="" className={mark} height="28" src={imgCompetitor3} width="28" />
      </div>
      <div className={`${slot} pointer-events-none`}>
        <img alt="" className={mark} src={imgCompetitor4} />
      </div>
      <div className={slot}>
        <img alt="" className={mark} height="28" src={imgCompetitor5} width="28" />
      </div>
      {/* 95:2745 — the +1, its count over the dimmed last avatar. */}
      <div className={slot} data-name="Frame">
        <div aria-hidden className="absolute inset-0 pointer-events-none rounded-[100px]">
          <img alt="" className="absolute max-w-none object-cover rounded-[100px] size-full" src={imgCompetitorMore} />
          <div className="absolute bg-[rgba(0,0,0,0.6)] inset-0 rounded-[100px]" />
        </div>
        <div className="content-stretch flex items-center justify-center overflow-clip relative rounded-[inherit] size-full">
          <p className="[word-break:break-word] font-['Inter',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[13px] text-white whitespace-nowrap">+1</p>
        </div>
      </div>
    </div>
  );
}

function Friends() {
  /* Every mark here is a square source — the logos are full-bleed artwork and
     Figma's own exports carry the node's square bounds — so the circle is the
     avatar's, not the file's: each slot clips its image to a round wrapper.
     object-cover on a square image in a square box crops nothing, so the mark
     fills the avatar at its own proportions. Sizes and the -4px overlap are
     untouched. */
  /* The ring is each wrapper's own border — one circle, one edge, one
     antialiasing pass — rather than an overlay laid inside it, which rounds a
     second time against the wrapper's clip and reads as a doubled, ragged
     stroke. It costs the artwork a pixel a side, which is what a ring is. */
  const slot =
    "border border-solid border-white mr-[-4px] overflow-hidden relative rounded-[100px] shrink-0 size-[28px]";
  const mark = "absolute block inset-0 max-w-none object-cover size-full";
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Friends">
      <div className={`${slot} pointer-events-none`} data-name="Icon.jpeg">
        <img alt="" className={mark} src={imgIconJpeg} />
      </div>
      <div className={slot}>
        <img alt="" className={mark} height="28" src={imgEllipse604} width="28" />
      </div>
      <div className={slot}>
        <img alt="" className={mark} height="28" src={imgEllipse607} width="28" />
      </div>
      <Frame121 />
      <div className={slot}>
        <img alt="" className={mark} height="28" src={imgEllipse606} width="28" />
      </div>
      <Frame4 />
    </div>
  );
}

function Frame68() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-[197px]">
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[11px] text-[rgba(47,43,61,0.6)] w-[min-content]">
        <p className="leading-[15px]">Researched your category.</p>
      </div>
      <Friends />
    </div>
  );
}

function MemoryUsage() {
  return (
    <div className="bg-white flex-[1_1_220px] h-[186px] min-w-px relative rounded-[12px]" data-name="Memory Usage">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-between p-[20px] relative size-full">
          <Frame35 />
          <Frame68 />
        </div>
      </div>
    </div>
  );
}













function Frame55() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Competitor Signals</p>
      </div>
      <InfoIcon />
    </div>
  );
}

function Percentage3() {
  return <TrendIndicator stat={useSignalsAnalytics().stats.competitor} variant="md" />;
}
function Frame56() {
  return (
    <div className="content-stretch flex gap-[4px] items-end relative shrink-0">
      <div className="[word-break:break-word] capitalize flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[28px] whitespace-nowrap">
        {/* Only the figure counts; the trend beside it is untouched. */}
        <p className="leading-[36px]"><AnimatedMetric value={useSignalsAnalytics().stats.competitor.value} /></p>
      </div>
      <Percentage3 />
    </div>
  );
}

function Frame41() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
      <Frame55 />
      <Frame56 />
    </div>
  );
}

function Frame40() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame41 />
    </div>
  );
}

function Frame139() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-[197.5px]">
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[11px] text-[rgba(47,43,61,0.6)] w-full">
        <p className="leading-[15px]">Researched your competitors.</p>
      </div>
      <FriendsCompetitor />
    </div>
  );
}

function MemoryUsage3() {
  return (
    <div className="bg-white flex-[1_1_220px] h-[186px] min-w-px relative rounded-[12px]" data-name="Memory Usage">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-between p-[20px] relative size-full">
          <Frame40 />
          <Frame139 />
        </div>
      </div>
    </div>
  );
}

/**
 * The buyer companies behind a research signal, and how many are not shown.
 *
 * Read off the dataset rather than written down: a company is in the stack
 * when its account actually produces that signal, and the logos are the ones
 * the Prospects page and the Competitors filter already draw for it, so the
 * faces on the card are the same companies named everywhere else. Six slots,
 * as the two cards beside them have — five logos and a sixth carrying the
 * overflow count over a dimmed logo.
 */
function signalStack(kind: "profile" | "pricing") {
  const carrying = PROSPECT_COMPANIES.filter(
    c => COMPANIES.find(account => account.name === c.name)?.signals[kind],
  );
  return { slots: carrying.slice(0, 6).map(c => c.logo), more: Math.max(0, carrying.length - 5) };
}

const SIGNAL_STACKS = { profile: signalStack("profile"), pricing: signalStack("pricing") };

/**
 * The avatar group on the Profile and Pricing cards.
 *
 * The geometry the other two groups use — 28px circles overlapping by 4px, a
 * white ring on each, the last dimmed under its count — and the same
 * data-name="Friends", which is what the hover spring and the click through to
 * the Prospects page key on, so all four cards behave alike. Its own component
 * rather than a parameter on the existing two, which are left exactly as they
 * were.
 */
function FriendsSignal({ kind }: { kind: "profile" | "pricing" }) {
  const { slots, more } = SIGNAL_STACKS[kind];
  const slot =
    "border border-solid border-white mr-[-4px] overflow-hidden relative rounded-[100px] shrink-0 size-[28px]";
  const mark = "absolute block inset-0 max-w-none object-cover size-full";
  const [lead, overflow] = [slots.slice(0, 5), slots[5]];
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Friends">
      {lead.map((logo, i) => (
        <div key={i} className={slot}>
          <img alt="" className={mark} height="28" src={logo} width="28" />
        </div>
      ))}
      {more > 0 && (
        <div className={slot} data-name="Frame">
          <div aria-hidden className="absolute inset-0 pointer-events-none rounded-[100px]">
            {overflow && (
              <img alt="" className="absolute max-w-none object-cover rounded-[100px] size-full" src={overflow} />
            )}
            <div className="absolute bg-[rgba(0,0,0,0.6)] inset-0 rounded-[100px]" />
          </div>
          <div className="content-stretch flex items-center justify-center overflow-clip relative rounded-[inherit] size-full">
            <p className="[word-break:break-word] font-['Inter',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[13px] text-white whitespace-nowrap">
              +{more}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Profile Signals and Pricing Signals.
 *
 * Built to the spec of Competitor Signals beside them: the same white 186px
 * card at 12px radius, the same 20px padding, the same title-and-info row over
 * a 28px figure with the md trend glyph, and the same 11px caption over the
 * avatar stack. Only the words, the figure and the faces differ, so the four
 * read as one set. The figure counts buyers, and is animated and trended by the
 * components the other cards already use.
 */
function SignalSummaryCard({
  title,
  caption,
  stat,
  kind,
}: {
  title: string;
  caption: string;
  stat: SummaryStat;
  kind: "profile" | "pricing";
}) {
  return (
    <div className="bg-white flex-[1_1_220px] h-[186px] min-w-px relative rounded-[12px]" data-name="Memory Usage">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-between p-[20px] relative size-full">
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
            <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
                <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[16px] whitespace-nowrap">
                  <p className="leading-[24px]">{title}</p>
                </div>
                <InfoIcon />
              </div>
              <div className="content-stretch flex gap-[4px] items-end relative shrink-0">
                <div className="[word-break:break-word] capitalize flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[28px] whitespace-nowrap">
                  {/* Only the figure counts; the trend beside it is untouched. */}
                  <p className="leading-[36px]"><AnimatedMetric value={stat.value} /></p>
                </div>
                <TrendIndicator stat={stat} variant="md" />
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-[197.5px]">
            <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[11px] text-[rgba(47,43,61,0.6)] w-full">
              <p className="leading-[15px]">{caption}</p>
            </div>
            <FriendsSignal kind={kind} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MemoryUsageProfile() {
  return (
    <SignalSummaryCard
      title="Profile Signals"
      caption="Visited your product profile."
      stat={useSignalsAnalytics().signalBuyers.profile}
      kind="profile"
    />
  );
}

function MemoryUsagePricing() {
  return (
    <SignalSummaryCard
      title="Pricing Signals"
      caption="Visited your pricing page."
      stat={useSignalsAnalytics().signalBuyers.pricing}
      kind="pricing"
    />
  );
}

function Row() {
  /* data-summary-cards opts this row out of the [data-name="Row"] hover styling
   * that the selectable leads-table rows use — these cards are static.
   *
   * All four across one line, at the 16px gutter the row already used. The
   * content column is 998px wide, so a quarter of it less the gutters is
   * 237.5px a card and 197.5px inside the 20px padding — which is the width
   * the caption block and its avatar stack were already drawn at. The card's
   * own spacing therefore needs nothing taken out of it to fit: four across is
   * the width these cards were designed for.
   *
   * Wrapping is the row's, not a breakpoint's. This page is drawn on a canvas
   * held open at 1440px whatever the window does, so a `md:`-style rule reads a
   * viewport that has nothing to do with how much room the cards actually have.
   * Each card asks for 220px and takes an equal share of whatever is left over,
   * so the four sit on one line while the row can hold 4 x 220 plus gutters and
   * fall onto a second line when it cannot — at which point the ones still
   * together share their line equally, the same way. `h-[186px]` keeps every
   * card the design's height on every line. */
  return (
    <div
      className="content-stretch flex flex-wrap gap-[16px] items-start relative shrink-0 w-full"
      data-name="Row"
      data-summary-cards
    >
      {/* Buyers in Market, then the two page signals it breaks down into, then
          Competitor — the whole audience first, then what it looked at. */}
      <MemoryUsage />
      <MemoryUsageProfile />
      <MemoryUsagePricing />
      <MemoryUsage3 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Activity Level</p>
      </div>
      <InfoIcon />
    </div>
  );
}

function Frame89() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <Frame10 />
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[13px] text-[rgba(47,43,61,0.7)] whitespace-nowrap">
        <p className="leading-[19px]">By Time Spent</p>
      </div>
    </div>
  );
}

/** Swatch colours carried over from the design, keyed by activity level. */
const ACTIVITY_SWATCH: Record<string, string> = {
  Low: "bg-[rgba(46,38,61,0.16)]",
  Medium: "bg-[rgba(46,38,61,0.32)]",
  High: "bg-[#072929]",
};

function ActivityLegendItem({
  label,
  count,
  pct,
  animating,
}: {
  label: string;
  count: number;
  pct: number;
  animating: boolean;
}) {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
      <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
        <div className={`${ACTIVITY_SWATCH[label]} relative rounded-[4px] shrink-0 size-[14px]`} />
        <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[13px] text-[rgba(47,43,61,0.7)] whitespace-nowrap">
          <p className="leading-[19px]">{label}</p>
        </div>
      </div>
      <div className="[word-break:break-word] content-stretch flex gap-[8px] items-center leading-[0] not-italic relative shrink-0 text-[13px] whitespace-nowrap">
        <div className="flex flex-col font-['Inter',sans-serif] font-medium justify-center relative shrink-0 text-[#2f2b3d]">
          <p className="leading-[22px]">{shownValue(count).toLocaleString()}</p>
        </div>
        <div className="flex flex-col font-['Inter',sans-serif] font-normal justify-center relative shrink-0 text-[rgba(47,43,61,0.7)]">
          <p className="leading-[19px]">{shownValue(pct)}%</p>
        </div>
      </div>
    </div>
  );
}

function Frame104() {
  const { activity, isEmpty } = useSignalsAnalytics();
  /* Figures on their way to the filtered ones; the ring's full sweep and the
     bars' scale stay the target's, or nothing would appear to move. */
  const [shown, animating] = useAnimatedSlices(activity);
  /* Measured against whichever is larger, the figures on screen or the ones
     they are heading for. Against the target alone a shrinking bar would be
     divided by a scale smaller than itself and run past its track; against the
     moving figures alone every bar would hold its final proportion and the
     load would never appear to grow. Taking the larger of the two keeps a bar
     inside its track throughout and still lets it draw itself in. */
  const sum = (slices: typeof activity) => slices.reduce((n, slice) => n + slice.count, 0);
  const total = Math.max(sum(shown), sum(activity));
  if (isEmpty) return <CardEmptyState />;
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-between min-h-px relative w-full">
      <DonutChart slices={shown} total={total} />
      <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
        {shown.map(slice => (
          <ActivityLegendItem
            key={slice.label}
            label={slice.label}
            count={slice.count}
            pct={slice.pct}
            animating={animating}
          />
        ))}
      </div>
    </div>
  );
}

function Card() {
  return (
    <div className="bg-white content-stretch flex flex-[1_0_0] flex-col gap-[14px] h-[347px] items-center min-w-px overflow-clip p-[24px] relative rounded-[12px]" data-name="Card">
      <Frame89 />
      <Frame104 />
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Buyers Tech Stack</p>
      </div>
      <InfoIcon />
    </div>
  );
}

function Frame71() {
  return (
    <div className="[word-break:break-word] content-stretch flex font-['Inter',sans-serif] font-normal items-center justify-between leading-[0] not-italic relative shrink-0 text-[13px] text-[rgba(47,43,61,0.7)] w-full">
      <div className="flex flex-col justify-center relative shrink-0 whitespace-nowrap">
        <p className="leading-[19px]">Name</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-right w-[25px]">
        <p className="leading-[19px]">#</p>
      </div>
    </div>
  );
}














function SymbolSvg() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Symbol.svg">
      <div className="absolute contents inset-[0_8.86%_0_8.34%]" data-name="Clip path group">
        <div className="absolute inset-[7.44%_9.31%_5.96%_8.34%]" data-name="Group">
          <svg className="absolute block inset-0 size-full" fill="none" height="20.7842" preserveAspectRatio="none" viewBox="0 0 19.7634 20.7842" width="19.7634">
            <g id="Group">
              <path clipRule="evenodd" d={svgPaths.p1b453100} fill="#FF4800" fillRule="evenodd" id="Vector" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

function SymbolSvg1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Symbol.svg">
      <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
        <g id="Symbol.svg">
          <path d={svgPaths.p888d300} fill="#1E1E1E" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function SymbolSvg2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Symbol.svg">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[24px] left-1/2 top-1/2 w-[16px]" data-name="Symbol.svg">
        <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 16 24" width="16">
          <g clipPath="url(#clip0_0_578)" id="Symbol.svg">
            <path d={svgPaths.p3cb56380} fill="#1ABCFE" id="Vector" />
            <path d={svgPaths.p1a7dcf00} fill="#0ACF83" id="Vector_2" />
            <path d={svgPaths.p202abc00} fill="#FF7262" id="Vector_3" />
            <path d={svgPaths.p14130f00} fill="#F24E1E" id="Vector_4" />
            <path d={svgPaths.p2b9e8080} fill="#A259FF" id="Vector_5" />
          </g>
          <defs>
            <clipPath id="clip0_0_578">
              <rect fill="white" height="24" width="16" />
            </clipPath>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function SymbolSvg4() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Symbol.svg">
      <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
        <g clipPath="url(#clip0_0_426)" id="Symbol.svg">
          <path d={svgPaths.p6c13ef2} fill="#D97757" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_0_426">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function LogoSvg() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Logo.svg">
      <div className="absolute contents inset-[4.17%_4.17%_4.64%_4.17%]" data-name="Mask group">
        <div className="absolute contents inset-[4.17%_4.16%_4.64%_4.11%]" data-name="Group">
          <div className="absolute inset-[4.17%_4.17%_26.55%_4.11%]" data-name="Vector">
            <svg className="absolute block inset-0 size-full" fill="none" height="16.6274" preserveAspectRatio="none" viewBox="0 0 22.0134 16.6274" width="22.0134">
              <path d={svgPaths.p33ac37f8} fill="#0065A9" id="Vector" />
            </svg>
          </div>
          <div className="absolute inset-[26.08%_4.16%_4.64%_4.12%]" data-name="Group">
            <div className="absolute inset-[-50.12%_-37.86%]">
              <svg className="block size-full" fill="none" height="33.2941" preserveAspectRatio="none" viewBox="0 0 38.6801 33.2941" width="38.6801">
                <g id="Group">
                  <path d={svgPaths.p227ae980} fill="#007ACC" id="Vector" />
                </g>
              </svg>
            </div>
          </div>
          <div className="absolute inset-[4.17%_4.16%_4.64%_67.19%]" data-name="Group">
            <div className="absolute inset-[-38.08%_-121.21%]">
              <svg className="block size-full" fill="none" height="38.5533" preserveAspectRatio="none" viewBox="0 0 23.5417 38.5533" width="23.5417">
                <g id="Group">
                  <path d={svgPaths.p159e1700} fill="#1F9CF0" id="Vector" />
                </g>
              </svg>
            </div>
          </div>
          <div className="absolute inset-[4.17%_4.22%_4.64%_4.12%] mix-blend-overlay" data-name="Group">
            <svg className="absolute block inset-0 size-full" fill="none" height="21.8866" preserveAspectRatio="none" viewBox="0 0 22.0001 21.8866" width="22.0001">
              <g id="Group" opacity="0.25" style={{ mixBlendMode: "overlay" }}>
                <path clipRule="evenodd" d={svgPaths.p38fd6200} fill="url(#paint0_linear_0_557)" fillRule="evenodd" id="Vector" />
              </g>
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_0_557" x1="11.0001" x2="11.0001" y1="-1.24746e-07" y2="21.8866">
                  <stop stopColor="white" />
                  <stop offset="1" stopColor="white" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Brand marks from the design, keyed by tool name so rows can be reordered. */
export const TECH_MARKS: Record<string, ComponentType> = {
  HubSpot: SymbolSvg,
  Granola: SymbolSvg1,
  Figma: SymbolSvg2,
  Claude: SymbolSvg4,
  "VS Code": LogoSvg,
};

function TechStackRow({
  label,
  count,
  max,
  first,
  last,
  animating,
}: {
  label: string;
  count: number;
  max: number;
  first: boolean;
  last: boolean;
  animating: boolean;
}) {
  const Logo = TECH_MARKS[label];
  return (
    <div
      className={`content-stretch flex items-center justify-between relative shrink-0 w-full ${last ? "pt-[12px]" : "py-[12px]"}`}
      data-name="Text"
    >
      {!last && (
        <div
          aria-hidden
          className={`absolute border-[rgba(0,0,0,0.08)] border-b border-solid inset-0 pointer-events-none ${first ? "border-t" : ""}`}
        />
      )}
      <div className="content-stretch flex gap-[32px] items-center relative shrink-0">
        {Logo ? <Logo /> : null}
        <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">
          <p className="leading-[22px]">{label}</p>
        </div>
      </div>
      <div className="content-stretch flex gap-[44px] items-center relative shrink-0 w-[288px]">
        <div className="bg-[#f5f6f6] flex-[1_0_0] h-[14px] min-w-px relative rounded-[100px]">
          <div className="content-stretch flex flex-col items-start pr-[15px] relative size-full">
            <div
              /* The transition is for a filter changing the width under it;
                 the load drives the width itself, frame by frame, so it is
                 left out of the way until the bar has arrived. */
              className={`bg-[#072929] h-[14px] relative rounded-[100px] shrink-0 ${
                animating ? "transition-none" : "transition-[width] duration-300 ease-out"
              }`}
              style={{ width: barWidth(count, max) }}
            />
          </div>
        </div>
        <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[13px] text-[rgba(47,43,61,0.7)] whitespace-nowrap">
          <p className="leading-[19px]">{shownValue(count).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

function Frame26() {
  const { techStack, isEmpty } = useSignalsAnalytics();
  const [shown, animating] = useAnimatedSlices(techStack);
  if (isEmpty) return <CardEmptyState />;
  /* Measured against whichever is larger, the figures on screen or the ones
     they are heading for. Against the target alone a shrinking bar would be
     divided by a scale smaller than itself and run past its track; against the
     moving figures alone every bar would hold its final proportion and the
     load would never appear to grow. Taking the larger of the two keeps a bar
     inside its track throughout and still lets it draw itself in. */
  const max = Math.max(largest(shown), largest(techStack));
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      {shown.map((slice, i) => (
        <TechStackRow
          key={slice.label}
          label={slice.label}
          count={slice.count}
          max={max}
          first={i === 0}
          last={i === shown.length - 1}
          animating={animating}
        />
      ))}
    </div>
  );
}

function Frame70() {
  /* Fills the card below the title so the rows stay top-aligned while the empty
   * state has real height to centre itself in. */
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-h-px relative w-full">
      <Frame71 />
      <Frame26 />
    </div>
  );
}

function Card1() {
  /* h-[347px] matches the other three analytics cards. Without it this was the
   * only content-sized card, so it collapsed in the empty state. 347px is also
   * the height it already resolved to when showing a full set of rows. */
  return (
    <div className="bg-white content-stretch flex flex-[1_0_0] flex-col gap-[18px] h-[347px] items-start min-w-px overflow-clip p-[24px] relative rounded-[12px]" data-name="Card">
      <Frame11 />
      <Frame70 />
    </div>
  );
}

function Frame76() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
      <Card />
      <Card1 />
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">{`Headquarter Location `}</p>
      </div>
      <InfoIcon />
    </div>
  );
}

function Frame90() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <Frame12 />
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[13px] text-[rgba(47,43,61,0.7)] whitespace-nowrap">
        <p className="leading-[19px]">{locationCaption(useSignalsAnalytics())}</p>
      </div>
    </div>
  );
}

/**
 * "Top 5 of 8 countries", degrading gracefully as the selection narrows.
 * Zero-count countries stay on the card, so once fewer countries have data than
 * there are rows the caption reports coverage against the full country list
 * rather than the rows on screen.
 */
function locationCaption({ locations, locationCount, locationUniverse }: SignalsAnalytics): string {
  if (locationCount === 0) return "No countries in this selection";
  if (locationCount > locations.length) {
    return `Top ${locations.length} of ${locationCount} countries`;
  }
  return `${locationCount} of ${locationUniverse} countries`;
}

function LocationRow({
  label,
  count,
  pct,
  max,
  animating,
}: {
  label: string;
  count: number;
  pct: number;
  max: number;
  animating: boolean;
}) {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-full">
      <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-center min-w-px relative">
        <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] w-[102px]">
          <p className="leading-[22px]">{label}</p>
        </div>
        <div className="bg-[#f5f6f6] content-stretch flex flex-[1_0_0] flex-col h-[14px] items-start min-w-px pr-[15px] relative rounded-[100px]">
          <div
            /* The transition is for a filter changing the width under it; the
               load drives the width itself, frame by frame, so it is left out
               of the way until the bar has arrived. */
            className={`bg-[#072929] h-[14px] relative rounded-[100px] shrink-0 ${
              animating ? "transition-none" : "transition-[width] duration-300 ease-out"
            }`}
            style={{ width: barWidth(count, max) }}
          />
        </div>
      </div>
      <div className="[word-break:break-word] content-stretch flex items-center justify-between leading-[0] not-italic relative shrink-0 text-[13px] w-[72px] whitespace-nowrap">
        <div className="flex flex-col font-['Inter',sans-serif] font-medium justify-center relative shrink-0 text-[#2f2b3d]">
          <p className="leading-[22px]">{shownValue(count).toLocaleString()}</p>
        </div>
        <div className="flex flex-col font-['Inter',sans-serif] font-normal justify-center relative shrink-0 text-[rgba(47,43,61,0.7)]">
          <p className="leading-[19px]">{shownValue(pct)}%</p>
        </div>
      </div>
    </div>
  );
}

function Frame44() {
  const { locations, isEmpty } = useSignalsAnalytics();
  const [shown, animating] = useAnimatedSlices(locations);
  if (isEmpty) return <CardEmptyState />;
  /* Measured against whichever is larger, the figures on screen or the ones
     they are heading for. Against the target alone a shrinking bar would be
     divided by a scale smaller than itself and run past its track; against the
     moving figures alone every bar would hold its final proportion and the
     load would never appear to grow. Taking the larger of the two keeps a bar
     inside its track throughout and still lets it draw itself in. */
  const max = Math.max(largest(shown), largest(locations));
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-between min-h-px relative w-full">
      {shown.map(slice => (
        <LocationRow
          key={slice.label}
          label={slice.label}
          count={slice.count}
          pct={slice.pct}
          max={max}
          animating={animating}
        />
      ))}
    </div>
  );
}

function Card2() {
  return (
    <div className="bg-white content-stretch flex flex-[1_0_0] flex-col gap-[18px] h-[347px] items-start min-w-px overflow-clip p-[24px] relative rounded-[12px]" data-name="Card">
      <Frame90 />
      <Frame44 />
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Company Size</p>
      </div>
      <InfoIcon />
    </div>
  );
}

function Frame109() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <Frame13 />
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[13px] text-[rgba(47,43,61,0.7)] whitespace-nowrap">
        <p className="leading-[19px]">By employee count</p>
      </div>
    </div>
  );
}

function CompanySizeBar({
  label,
  count,
  max,
  animating,
}: {
  label: string;
  count: number;
  max: number;
  animating: boolean;
}) {
  /* Keep a sliver visible for small-but-present buckets. */
  const fill = max > 0 && count > 0 ? Math.max((count / max) * MAX_BAR_FILL * 100, 2) : 0;
  return (
    <div className="content-stretch flex flex-col gap-[14px] h-full items-center justify-center relative shrink-0 w-[43px]">
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[12px] whitespace-nowrap">
        <p className="leading-[22px]">{shownValue(count).toLocaleString()}</p>
      </div>
      <div className="bg-[#f5f6f6] content-stretch flex flex-[1_0_0] items-end justify-center min-h-px relative rounded-[100px] w-[16px]">
        <div
          /* As with the horizontal bars: the transition belongs to a filter
             changing the height, not to the load drawing it. */
          className={`bg-[#072929] min-w-px relative rounded-[100px] w-full ${
            animating ? "transition-none" : "transition-[height] duration-300 ease-out"
          }`}
          style={{ height: `${fill}%` }}
        />
      </div>
      <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[11px] text-[rgba(47,43,61,0.7)] whitespace-nowrap">
        {label}
      </p>
    </div>
  );
}

function Frame88() {
  const { companySize, isEmpty } = useSignalsAnalytics();
  const [shown, animating] = useAnimatedSlices(companySize);
  if (isEmpty) return <CardEmptyState />;
  /* Measured against whichever is larger, the figures on screen or the ones
     they are heading for. Against the target alone a shrinking bar would be
     divided by a scale smaller than itself and run past its track; against the
     moving figures alone every bar would hold its final proportion and the
     load would never appear to grow. Taking the larger of the two keeps a bar
     inside its track throughout and still lets it draw itself in. */
  const max = Math.max(largest(shown), largest(companySize));
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-between min-h-px relative w-full">
      {shown.map(slice => (
        <CompanySizeBar
          key={slice.label}
          label={slice.label}
          count={slice.count}
          max={max}
          animating={animating}
        />
      ))}
    </div>
  );
}

function Card3() {
  return (
    <div className="bg-white content-stretch flex flex-[1_0_0] flex-col gap-[18px] h-[347px] items-start min-w-px overflow-clip p-[24px] relative rounded-[12px]" data-name="Card">
      <Frame109 />
      <Frame88 />
    </div>
  );
}

function Frame82() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
      <Card2 />
      <Card3 />
    </div>
  );
}

function Frame73() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <Row />
      <Frame76 />
      <Frame82 />
      <ProspectsCardList />
    </div>
  );
}

function Frame113() {
  return (
    /* In normal flow rather than absolutely positioned, the same way the
       Prospects page's column is, so the page's height is its content's. The
       margins are the offsets the design gave it — 371/71/84, and the 36px it
       left below the content — so the column sits exactly where it did while
       the analytics above and the prospects list below can both grow, and the
       backgrounds painted to the page's bottom edge follow them down. */
    <div className="content-stretch flex flex-col gap-[24px] items-start mb-[36px] ml-[371px] mr-[71px] mt-[84px] min-w-0 relative">
      <Frame135 />
      <Frame136 />
      <Frame73 />
    </div>
  );
}






























function Frame145() {
  return null;
}

function Document() {
  return (
    <div className="absolute inset-[11.46%_14.93%_11.83%_15.63%]" data-name="Document">
      <div className="absolute inset-[-4.07%_-4.5%]">
        <svg className="block size-full" fill="none" height="19.91" preserveAspectRatio="none" viewBox="0 0 18.165 19.91" width="18.165">
          <g id="Document">
            <path d="M12.7156 14.2236H5.4956" id="Stroke 1" stroke="#585164" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d="M12.7156 10.0371H5.4956" id="Stroke 2" stroke="#585164" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d="M8.2507 5.8603H5.4957" id="Stroke 3" stroke="#585164" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path clipRule="evenodd" d={svgPaths.p13ba500} fillRule="evenodd" id="Stroke 4" stroke="#585164" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col h-[44px] items-center justify-center px-[10px] py-[8px] relative shrink-0" data-name="Container">
      <div className="relative shrink-0 size-[24px]" data-name="Products-list">
        <Document />
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="content-stretch flex flex-col items-center py-[8px] relative shrink-0 w-full" data-name="Dashboard">
      <Container7 />
      <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">Products</p>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col h-[44px] items-center justify-center px-[10px] py-[8px] relative shrink-0" data-name="Container">
      <div className="relative shrink-0 size-[24px]" data-name="bell">
        <svg className="absolute block inset-0 size-full" fill="none" height="32" preserveAspectRatio="none" viewBox="0 0 32 32" width="32">
          <g id="Path" />
        </svg>
        <div className="absolute inset-[12.5%_16.67%_29.17%_16.67%]" data-name="Path">
          <div className="absolute inset-[-5.36%_-4.69%]">
            <svg className="block size-full" fill="none" height="15.5" preserveAspectRatio="none" viewBox="0 0 17.5001 15.5" width="17.5001">
              <path d={svgPaths.p1f816900} id="Path" stroke="#585164" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[70.83%_37.5%_12.5%_37.5%]" data-name="Path">
          <div className="absolute inset-[-18.75%_-12.5%]">
            <svg className="block size-full" fill="none" height="5.5" preserveAspectRatio="none" viewBox="0 0 7.5 5.5" width="7.5">
              <path d={svgPaths.pab7b200} id="Path" stroke="#585164" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListItem() {
  return (
    <div className="relative rounded-[6px] shrink-0 w-full" data-name="ListItem">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col items-center px-[10px] py-[8px] relative size-full">
          <Container8 />
          <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">Alerts</p>
        </div>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col h-[44px] items-center justify-center px-[10px] py-[8px] relative shrink-0" data-name="Container">
      <div className="relative shrink-0 size-[24px]" data-name="mail">
        <svg className="absolute block inset-0 size-full" fill="none" height="32" preserveAspectRatio="none" viewBox="0 0 32 32" width="32">
          <g id="Path" />
        </svg>
        <div className="absolute inset-[20.83%_12.5%] rounded-[2px]" data-name="Rectangle">
          <div aria-hidden className="absolute border-[#585164] border-[1.5px] border-solid inset-[-0.75px] pointer-events-none rounded-[2.75px]" />
        </div>
        <div className="absolute inset-[29.17%_12.5%_45.83%_12.5%]" data-name="Path">
          <div className="absolute inset-[-12.5%_-4.17%]">
            <svg className="block size-full" fill="none" height="7.50008" preserveAspectRatio="none" viewBox="0 0 19.5002 7.50008" width="19.5002">
              <path d={svgPaths.p3e5cb80} id="Path" stroke="#585164" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-center relative shrink-0">
      <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">Campaigns</p>
    </div>
  );
}

function ListItem1() {
  return (
    <div className="relative rounded-[6px] shrink-0 w-full" data-name="ListItem">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col items-center px-[10px] py-[8px] relative size-full">
          <Container9 />
          <Frame15 />
        </div>
      </div>
    </div>
  );
}

function FilePlus() {
  return (
    <div className="h-[24px] relative shrink-0 w-[25px]" data-name="file-plus-02">
      <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 25 24" width="25">
        <g id="file-plus-02">
          <path d={svgPaths.p25359600} id="Icon" stroke="#585164" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path clipRule="evenodd" d={svgPaths.p1e20c400} fillRule="evenodd" id="Path" stroke="#585164" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col h-[44px] items-center justify-center px-[10px] py-[8px] relative shrink-0" data-name="Container">
      <FilePlus />
    </div>
  );
}

function ListItem2() {
  return (
    <div className="relative rounded-[6px] shrink-0 w-full" data-name="ListItem">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col items-center px-[12px] py-[8px] relative size-full">
          <Container10 />
          <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">Promotions</p>
        </div>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col h-[44px] items-center justify-center px-[10px] py-[8px] relative shrink-0" data-name="Container">
      <div className="relative shrink-0 size-[24px]" data-name="settings">
        <svg className="absolute block inset-0 size-full" fill="none" height="32" preserveAspectRatio="none" viewBox="0 0 32 32" width="32">
          <g id="Path" />
        </svg>
        <div className="absolute inset-[12.5%]" data-name="Path">
          <div className="absolute inset-[-4.17%]">
            <svg className="block size-full" fill="none" height="19.5" preserveAspectRatio="none" viewBox="0 0 19.5 19.5" width="19.5">
              <path clipRule="evenodd" d={svgPaths.p2c6b000} fillRule="evenodd" id="Path" stroke="#585164" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[37.5%]" data-name="Oval">
          <div className="absolute inset-[-12.5%]">
            <svg className="block size-full" fill="none" height="7.5" preserveAspectRatio="none" viewBox="0 0 7.5 7.5" width="7.5">
              <circle cx="3.75" cy="3.75" id="Oval" r="3" stroke="#585164" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListItem3() {
  return (
    <div className="relative rounded-[6px] shrink-0 w-full" data-name="ListItem">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col items-center px-[12px] py-[8px] relative size-full">
          <Container11 />
          <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">Settings</p>
        </div>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col h-[44px] items-center justify-center px-[10px] py-[8px] relative shrink-0" data-name="Container">
      <div className="relative shrink-0 size-[24px]" data-name="help">
        <svg className="absolute block inset-0 size-full" fill="none" height="32" preserveAspectRatio="none" viewBox="0 0 32 32" width="32">
          <g id="Path" />
        </svg>
        <div className="absolute inset-[12.5%]" data-name="Oval">
          <div className="absolute inset-[-4.17%]">
            <svg className="block size-full" fill="none" height="19.5" preserveAspectRatio="none" viewBox="0 0 19.5 19.5" width="19.5">
              <circle cx="9.75" cy="9.75" id="Oval" r="9" stroke="#585164" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[68.77%_47.92%_27.06%_47.92%]" data-name="Path">
          <div className="absolute inset-[-25.5%_-25%]">
            <svg className="block size-full" fill="none" height="1.51" preserveAspectRatio="none" viewBox="0 0 1.5 1.51" width="1.5">
              <path d="M0.75 0.75V0.76" id="Path" stroke="#585164" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[29.05%_38.87%_43.75%_41.67%]" data-name="Path">
          <div className="absolute inset-[-11.49%_-16.06%]">
            <svg className="block size-full" fill="none" height="8.02871" preserveAspectRatio="none" viewBox="0 0 6.17136 8.02871" width="6.17136">
              <path d={svgPaths.p9988600} id="Path" stroke="#585164" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListItem4() {
  return (
    <div className="relative rounded-[6px] shrink-0 w-full" data-name="ListItem">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col items-center px-[12px] py-[8px] relative size-full">
          <Container12 />
          <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">Support</p>
        </div>
      </div>
    </div>
  );
}

function Applications() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center pb-[8px] pt-[12px] relative shrink-0 w-[63px]" data-name="Applications">
      {/* The rail Figma 221:2933 draws: five destinations in this order, with
          Buyer Intelligence second and filled as the active one. Alerts and
          Support are not in the node and so are not listed; their components
          are left defined just below, so restoring either is a single line. */}
      <Dashboard />
      <MainNavBuyerIntelligence active />
      <ListItem2 />
      <ListItem1 />
      <ListItem3 />
    </div>
  );
}

function MenuDrawer1() {
  return (
    <div className="bg-[#dde8e5] content-stretch flex flex-[1_0_0] flex-col items-center min-h-px px-[12px] relative w-[80px]" data-name="Menu Drawer">
      <Applications />
    </div>
  );
}

function MenuDrawer() {
  return (
    /* The rail fills whatever height its container has rather than the 1117px
       the design was drawn at, so it reaches the bottom of a page of any
       length instead of stopping at one page's worth of content. */
    <div className="bg-white content-stretch flex flex-col items-start min-h-full overflow-clip relative shrink-0 w-[80px]" data-name="Menu Drawer">
      <MenuDrawer1 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="h-[22px] relative shrink-0 w-[171px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" height="22" preserveAspectRatio="none" viewBox="0 0 171 22" width="171">
        <g clipPath="url(#clip0_0_432)" id="Frame">
          <path d={svgPaths.p2d988400} fill="#072929" id="Vector" />
          <path d={svgPaths.p21886fb0} fill="#072929" id="Vector_2" />
          <path d={svgPaths.p2fd5ae80} fill="#072929" id="Vector_3" />
          <path d={svgPaths.p1148fb00} fill="#072929" id="Vector_4" />
          <path d={svgPaths.p25542f00} fill="#072929" id="Vector_5" />
          <path d={svgPaths.p34da7d00} fill="#072929" id="Vector_6" />
          <path d={svgPaths.p286d3500} fill="#072929" id="Vector_7" />
          <path d={svgPaths.p1f42a880} fill="#072929" id="Vector_8" />
          <path d={svgPaths.p22fe7900} fill="#072929" id="Vector_9" />
          <path d={svgPaths.p2969f280} fill="#072929" id="Vector_10" />
          <path d={svgPaths.p6f42380} fill="#072929" id="Vector_11" />
          <path d={svgPaths.p3876fe00} fill="#072929" id="Vector_12" />
          <path d={svgPaths.p2e3661f0} fill="#072929" id="Vector_13" />
          <path d={svgPaths.pd8de700} fill="#072929" id="Vector_14" />
          <path d={svgPaths.p24cc6bf0} fill="#072929" id="Vector_15" />
          <path d={svgPaths.p10b6b780} fill="#072929" id="Vector_16" />
        </g>
        <defs>
          <clipPath id="clip0_0_432">
            <rect fill="white" height="22" width="171" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function ListItem5() {
  return (
    <div className="content-stretch flex items-center px-[24px] relative shrink-0" data-name="ListItem">
      <Frame9 />
    </div>
  );
}

function Group7() {
  return (
    <div className="absolute inset-[11.78%_0.06%_11.15%_0.12%]" data-name="Group">
      <svg className="absolute block inset-0 size-full" fill="none" height="14.6429" preserveAspectRatio="none" viewBox="0 0 18.9652 14.6429" width="18.9652">
        <g id="Group">
          <g id="Group_2">
            <path clipRule="evenodd" d={svgPaths.p3dfe4c00} fill="#FE9923" fillRule="evenodd" id="Vector" />
          </g>
          <g id="Group_3">
            <path clipRule="evenodd" d={svgPaths.p363abb80} fill="#FECD3D" fillRule="evenodd" id="Vector_2" />
          </g>
          <g id="Group_4">
            <path clipRule="evenodd" d={svgPaths.p312eda80} fill="#FEA832" fillRule="evenodd" id="Vector_3" />
          </g>
          <path d={svgPaths.p1238730} fill="#C85929" id="Vector_4" />
          <g id="Group_5">
            <path d={svgPaths.p3389d900} fill="#FEA832" id="Vector_5" />
          </g>
          <g id="Group_6">
            <path d={svgPaths.p1f15b600} fill="#FEA832" id="Vector_6" />
          </g>
          <g id="Group_7">
            <path d={svgPaths.p5c0c400} fill="#FEA832" id="Vector_7" />
          </g>
          <g id="Group_8">
            <path clipRule="evenodd" d={svgPaths.p7f940f0} fill="#FE9923" fillRule="evenodd" id="Vector_8" />
          </g>
          <g id="Group_9">
            <path clipRule="evenodd" d={svgPaths.p24766280} fill="#FECD3D" fillRule="evenodd" id="Vector_9" />
          </g>
          <g id="Group_10">
            <path clipRule="evenodd" d={svgPaths.p3670a300} fill="#FEA832" fillRule="evenodd" id="Vector_10" />
          </g>
          <path d={svgPaths.p27d26300} fill="#C85929" id="Vector_11" />
        </g>
      </svg>
    </div>
  );
}

/** The credit chip's coin in the top header; reused by the Buy More modal. */
export function Coin() {
  return (
    <div className="opacity-80 relative shrink-0 size-[19px]" data-name="coin (2) 1">
      <Group7 />
    </div>
  );
}

function Frame141() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <Coin />
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[15px] whitespace-nowrap">
        <p className="leading-[22px]">$1,000</p>
      </div>
    </div>
  );
}

function Frame58() {
  return (
    <div className="content-stretch flex items-center justify-end relative shrink-0">
      <Frame141 />
    </div>
  );
}

function Frame57() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-end px-[10px] py-[4px] relative rounded-[40px] shrink-0">
      <div aria-hidden className="absolute border border-[rgba(0,0,0,0.12)] border-solid inset-0 pointer-events-none rounded-[40px]" />
      <Frame58 />
    </div>
  );
}

function Frame140() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <Frame57 />
    </div>
  );
}

function Badge() {
  return (
    <div className="absolute left-[23px] size-[7.5px] top-[9px]" data-name="Badge">
      <div className="absolute inset-[-20%]">
        <svg className="block size-full" fill="none" height="10.5" preserveAspectRatio="none" viewBox="0 0 10.5 10.5" width="10.5">
          <g id="Badge">
            <circle cx="5.25" cy="5.25" fill="#FF4C51" id="Ellipse" r="4.5" stroke="#DBE9E5" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function UnstyledIconButton() {
  return (
    <div className="h-[38px] relative rounded-[48px] shrink-0 w-[54px]" data-name="UnstyledIconButton">
      <div className="absolute left-[8px] size-[24px] top-[8px]" data-name="bell">
        <svg className="absolute block inset-0 size-full" fill="none" height="32" preserveAspectRatio="none" viewBox="0 0 32 32" width="32">
          <g id="Path" />
        </svg>
        <div className="absolute inset-[12.5%_16.67%_29.17%_16.67%]" data-name="Path">
          <div className="absolute inset-[-5.36%_-4.69%]">
            <svg className="block size-full" fill="none" height="15.5" preserveAspectRatio="none" viewBox="0 0 17.5001 15.5" width="17.5001">
              <path d={svgPaths.p1f816900} id="Path" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[70.83%_37.5%_12.5%_37.5%]" data-name="Path">
          <div className="absolute inset-[-18.75%_-12.5%]">
            <svg className="block size-full" fill="none" height="5.5" preserveAspectRatio="none" viewBox="0 0 7.5 5.5" width="7.5">
              <path d={svgPaths.pab7b200} id="Path" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>
      <Badge />
    </div>
  );
}

function IconButton() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-[48px]" data-name="IconButton">
      <UnstyledIconButton />
    </div>
  );
}

function Frame142() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      {/* 221:3040 pairs the help mark with the bell 4px apart, and that pair
          sits 8px from the avatar. */}
      <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
        <HelpControl />
        <IconButton />
      </div>
      <div className="relative rounded-[500px] shrink-0 size-[38px]" data-name="Avatar">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[500px] size-full" src={imgAvatar} />
        <div className="flex flex-col items-center justify-center size-full">
          <div className="relative size-full" />
        </div>
      </div>
    </div>
  );
}

function Frame143() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
      <Frame140 />
      <Frame142 />
    </div>
  );
}

function ActionButton() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Action Button">
      <div className="flex flex-row items-center justify-end size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-end pr-[24px] relative size-full">
          <Frame143 />
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Navbar">
      <ListItem5 />
      <ActionButton />
    </div>
  );
}

function VerticalNavbarScroll() {
  return (
    <div className="absolute bg-[#dbe9e5] content-stretch flex flex-col items-center left-0 overflow-clip py-[8px] top-0 right-0" data-name="Vertical Navbar Scroll">
      <Navbar />
    </div>
  );
}

function Group9() {
  return (
    <div className="absolute inset-[10%_9.82%_9.75%_9.82%]">
      <svg className="absolute block inset-0 size-full" fill="none" height="25.6799" preserveAspectRatio="none" viewBox="0 0 25.716 25.6799" width="25.716">
        <g id="Group 15">
          <path d={svgPaths.p647e100} fill="#0082FF" id="Vector" />
          <path d={svgPaths.p35c0d300} fill="url(#paint0_linear_0_407)" id="Vector_2" />
          <path d={svgPaths.p19c54100} fill="url(#paint1_linear_0_407)" id="Vector_3" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_0_407" x1="19.3161" x2="14.0476" y1="6.18632" y2="11.6196">
            <stop offset="0.18" stopColor="#0050D3" />
            <stop offset="1" stopColor="#0082FF" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_0_407" x1="13.5374" x2="7.44517" y1="12.3913" y2="18.3188">
            <stop offset="0.18" stopColor="#0050D3" />
            <stop offset="1" stopColor="#0082FF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function AsanaLogo() {
  return (
    <div className="col-1 ml-0 mt-0 relative row-1 size-[32px]" data-name="asana logo">
      <Group9 />
    </div>
  );
}

function Group8() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <AsanaLogo />
    </div>
  );
}

function Logo1() {
  return (
    <div className="content-stretch flex gap-[4px] items-center leading-[0] relative shrink-0" data-name="Logo">
      <Group8 />
      <div className="content-stretch flex flex-col gap-[4px] items-start justify-center relative shrink-0">
        <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
          <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-bold justify-center relative shrink-0 text-[#2f2b3d] text-[16px] tracking-[0.25px] whitespace-nowrap">
            <p className="leading-[normal]">Jira</p>
          </div>
          <ChipBgLabelPrimary />
        </div>
        <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[13px] text-[rgba(47,43,61,0.7)] whitespace-nowrap">
          Project Management
        </p>
      </div>
    </div>
  );
}

function ChipBgLabelPrimary() {
  return (
    /* Figma 180:6768 — the plan chip, in the design's blue: the 40% wash, the
       #00beff hairline and a 9px bold label. The stroke stays on the export's
       own overlay, which draws it at the same 1px inside the same radius. */
    /* The 4px of vertical padding is split 2.7/1.3 rather than 2/2. Flex
       centres boxes, and this label's box is the em box — which reserves
       descender space (ascent 8.4, descent 2.8 at 9px Inter) that an all-caps
       word never uses, so centring the box left the letters 0.7px high. No
       line-height fixes that: the cap centre and the box centre are a fixed
       0.7px apart whatever the leading. Moving that 0.7px between the two
       paddings keeps their sum, and so the pill's 16px height, exactly as it
       was and puts equal space above and below the letters themselves. */
    <div className="bg-[rgba(228,248,255,0.4)] content-stretch flex gap-[4px] items-center justify-center min-w-[24px] pb-[1.3px] pt-[2.7px] px-[6px] relative rounded-[100px] shrink-0" data-name="chip bg-label-primary">
      {/* The chip's stroke, travelling. Position, inset, radius, the 1px
          thickness and the colour all live in .enterprise-stroke. */}
      <div aria-hidden className="enterprise-stroke" />
      <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Inter',sans-serif] font-bold justify-center leading-[0] min-w-px not-italic relative text-[#22a8d6] text-[9px] text-center">
        <p className="leading-[12px]">ENTERPRISE</p>
      </div>
    </div>
  );
}

function Frame129() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-w-px relative">
      <Logo1 />
    </div>
  );
}

function Frame69() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-w-px relative">
      <Frame129 />
      {/* Figma 171:5581 — the chevron-down asset as exported, in its own
          14px frame. */}
      <div className="relative shrink-0 size-[14px]" data-name="chevron-down">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={chevronDownGlyph} />
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="bg-[#f3f7f6] relative shrink-0 w-full" data-name="Logo">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center pb-[12px] pt-[16px] px-[16px] relative size-full">
          <Frame69 />
        </div>
      </div>
    </div>
  );
}























function Applications1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start pb-[8px] relative shrink-0 w-full" data-name="Applications">
      <BuyerIntelligenceSubNav active="signals" />
    </div>
  );
}

function MenuDrawer2() {
  return (
    <div className="bg-[#f3f7f6] flex-[1_0_0] min-h-px relative w-full" data-name="Menu Drawer">
      <div className="content-stretch flex flex-col items-start px-[12px] py-[4px] relative size-full">
        <Applications1 />
      </div>
    </div>
  );
}

function SemiDarkMenuDrawer() {
  return (
    <div className="content-stretch flex flex-col h-full items-start overflow-clip relative rounded-tl-[12px] shrink-0 w-[221px]" data-name="Semi Dark Menu Drawer">
      <Logo />
      <MenuDrawer2 />
    </div>
  );
}

function Menu() {
  return (
    <div className="absolute bottom-0 content-stretch flex items-start left-[80px] top-[54px]" data-name="Menu">
      <SemiDarkMenuDrawer />
    </div>
  );
}

export default function BuyerActivityBuyerIntentStarter() {
  return (
    <div className="bg-[#dde8e5] grow relative w-full" data-name="Buyer Activity / Buyer Intent / Starter">
      {/* First, so it paints beneath the panels rather than over them.
          The bar is 60px tall and they all begin at 54, so drawn afterwards it
          laid a 6px band of its own green across their tops — but only across
          the ones declared before it, which left the sub-nav starting six
          pixels higher than the content beside it and put a visible step
          between them. Underneath, every panel starts at the same edge. */}
      <VerticalNavbarScroll />
      <div className="absolute bg-[#fbfaf9] border-[rgba(47,43,61,0.1)] border-l border-solid border-t bottom-0 left-[301px] top-[54px] right-0" />
      <Frame113 />
      <Frame145 />
      <div className="absolute bottom-0 left-0 top-[54px] w-[80px]" data-name="Menu">
        <div className="overflow-clip rounded-[inherit] size-full">
          <div className="content-stretch flex flex-col items-start relative size-full">
            <MenuDrawer />
          </div>
        </div>
      </div>
      <Menu />
    </div>
  );
}
