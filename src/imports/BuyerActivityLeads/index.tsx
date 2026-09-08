import chevronDownGlyph from "@/components/nav/assets/icon-chevron-down.svg";
import BuyerIntelligenceSubNav, { MainNavBuyerIntelligence } from "@/components/nav/BuyerIntelligenceNav";
import ContactRevealsMeter from "@/components/ContactRevealsMeter";
import svgPaths from "./svg-ry772luhk7";
import ProspectCard from "@/components/prospects/ProspectCard";
import ProspectsToolbar from "@/components/prospects/ProspectsToolbar";
import ProspectsTable from "@/components/signals/ProspectsTable";
import { useProspectsPage } from "@/context/ProspectsPageContext";
import { useLeadsTable } from "@/context/SignalsAnalyticsContext";
import LeadsTableEmptyState from "@/components/LeadsTableEmptyState";
import imgAvatar from "./148b1a6d07c50cdb128bc8e19f77df73c62e2be8.png";
import { imgGroup, imgGroup1 } from "./svg-9f9zr";
import { HelpControl } from "@/components/HelpIcon";
import InfoIcon from "@/components/InfoIcon";

/** Counts the prospects actually listed below it, filters and search included. */
function ChipBgLabelSuccess() {
  const { visibleCount } = useProspectsPage();
  return (
    <div className="bg-[#eeedf0] content-stretch flex gap-[4px] items-center justify-center min-w-[24px] px-[6px] py-px relative rounded-[500px] shrink-0" data-name="chip bg-label-success">
      {/* min-w-[24px] makes the pill wider than a single digit needs, and this
          box is flex-1, so it stretches to the full 12px of content width. Left
          aligned, the digit then sat 1.9px left of the pill's centre — 6px of
          padding on one side against 9.8px on the other. Centring the text in
          the box it already occupies leaves the pill, its padding and the
          type untouched. */}
      <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] min-w-px not-italic relative text-[#2f2b3d] text-[13px] text-center">
        <p className="leading-[20px]">{visibleCount}</p>
      </div>
    </div>
  );
}

/* Figma 221:2039 — the title, its info mark and the count.
   The node is two groups rather than one row: 221:2040 holds the title and the
   mark 6px apart, and the chip sits beside that group at 8px. So the mark
   belongs to the title it explains and the count is what stands apart from
   both, which is the reading the nesting gives. */
function Frame125() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      {/* 221:2040 */}
      <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
        <p className="[word-break:break-word] font-['Inter',sans-serif] font-medium leading-[46px] not-italic relative shrink-0 text-[#2f2b3d] text-[24px] whitespace-nowrap">Prospects</p>
        {/* 221:2042, on the same correction as the chip below — both marks read
            against the capitals, so both are lifted by the same 3px and stay
            level with each other. */}
        <span className="content-stretch flex items-center relative shrink-0 -translate-y-[3px]">
          <InfoIcon />
        </span>
      </div>
      {/* items-center centres the chip on the title's line box, and that box
          runs from the ascender to the descender of "Prospects" — so the chip
          landed 3px below the centre of the capitals it reads against. The
          descender is worth (asc - desc)/2 - capHeight/2 = 3px here, and this
          takes it back. A transform, so nothing about the chip's size, the
          gaps or the row's height changes. */}
      <div className="min-w-[24px] relative shrink-0 -translate-y-[3px]" data-name="Chip">
        <div className="flex flex-col items-center justify-center min-w-[inherit] size-full">
          <div className="content-stretch flex flex-col items-center justify-center min-w-[inherit] relative size-full">
            <ChipBgLabelSuccess />
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame126() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
      <Frame125 />
      <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[13px] text-[rgba(47,43,61,0.7)] text-center whitespace-nowrap">
        <span className="leading-[22px]">{`Companies `}</span>
        <span className="font-['Inter',sans-serif] font-medium leading-[22px] text-[#072929]">478</span>
        <span className="leading-[22px]">/600</span>
      </p>
    </div>
  );
}

function Frame123() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0">
      <Frame126 />
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

function Frame44() {
  return (
    <div className="content-stretch flex gap-[8px] h-full items-center relative shrink-0">
      <ContactRevealsMeter />
      <OutlineButton />
    </div>
  );
}

function Frame43() {
  return (
    <div className="content-stretch flex h-[34px] items-center relative shrink-0">
      <Frame44 />
    </div>
  );
}

function Frame124() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <Frame43 />
    </div>
  );
}

function Frame62() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <Frame123 />
      <Frame124 />
    </div>
  );
}















/**
 * The prospect list, in whichever view the toolbar's switch has selected.
 *
 * Both views read the same filtered dataset — the cards are this list, which
 * the page has already narrowed by every active filter, the search and the
 * date range; the table reads the same answer as the visibility handed to it
 * through the table context. So switching views never changes which prospects
 * are listed.
 *
 * The cards are what matched, rather than the whole dataset with the
 * non-matches styled out of sight: a card is in the page exactly when its
 * company is in the count above it.
 */
function Frame78() {
  const { view, prospects } = useProspectsPage();
  /* The same reset the table's own no-results state offers, from the same
     place, so the two views answer an empty result identically. */
  const { onReset } = useLeadsTable();
  if (view === "table") {
    /* The Signals page's table, reused whole. Its own title row is dropped
       here because the page already carries the "Prospects" heading. */
    return <ProspectsTable showHeader={false} />;
  }
  /* Nothing matched. The cards this replaces are the only white surfaces in
     the list, so the state keeps one — the same panel, padding and treatment
     the Signals page's card list gives it. */
  if (prospects.length === 0) {
    return (
      <div className="bg-white overflow-hidden py-[115px] relative rounded-[12px] shrink-0 w-full">
        <LeadsTableEmptyState onReset={onReset} />
      </div>
    );
  }
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
      {prospects.map(prospect => (
        <ProspectCard key={prospect.id} prospect={prospect} />
      ))}
    </div>
  );
}

function Frame79() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
      <ProspectsToolbar />
      <Frame78 />
    </div>
  );
}

function Frame63() {
  return (
    /* In normal flow rather than absolutely positioned, so the list's height is
       the page's height. The margins are the offsets the design gave it —
       371/71/84, and the 36px it left below the content — so the column sits
       exactly where it did, but the page now grows as prospects are added to
       it and the backgrounds painted to its bottom edge follow. */
    <div className="content-stretch flex flex-col gap-[20px] items-start mb-[36px] ml-[371px] mr-[71px] mt-[84px] min-w-0 relative">
      <Frame62 />
      <Frame79 />
    </div>
  );
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

function Container() {
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
      <Container />
      <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">Products</p>
    </div>
  );
}

function Container1() {
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
          <Container1 />
          <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">Alerts</p>
        </div>
      </div>
    </div>
  );
}

function Container2() {
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

function Frame28() {
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
          <Container2 />
          <Frame28 />
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

function Container3() {
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
          <Container3 />
          <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">Promotions</p>
        </div>
      </div>
    </div>
  );
}

function Container4() {
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
          <Container4 />
          <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">Settings</p>
        </div>
      </div>
    </div>
  );
}

function Container5() {
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
          <Container5 />
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

function Frame27() {
  return (
    <div className="h-[22px] relative shrink-0 w-[171px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" height="22" preserveAspectRatio="none" viewBox="0 0 171 22" width="171">
        <g clipPath="url(#clip0_0_596)" id="Frame">
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
          <clipPath id="clip0_0_596">
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
      <Frame27 />
    </div>
  );
}

function Group6() {
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

function Coin() {
  return (
    <div className="opacity-80 relative shrink-0 size-[19px]" data-name="coin (2) 1">
      <Group6 />
    </div>
  );
}

function Frame119() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <Coin />
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[15px] whitespace-nowrap">
        <p className="leading-[22px]">$1,000</p>
      </div>
    </div>
  );
}

function Frame46() {
  return (
    <div className="content-stretch flex items-center justify-end relative shrink-0">
      <Frame119 />
    </div>
  );
}

function Frame45() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-end px-[10px] py-[4px] relative rounded-[40px] shrink-0">
      <div aria-hidden className="absolute border border-[rgba(0,0,0,0.12)] border-solid inset-0 pointer-events-none rounded-[40px]" />
      <Frame46 />
    </div>
  );
}

function Frame118() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <Frame45 />
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

function Frame120() {
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

function Frame117() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
      <Frame118 />
      <Frame120 />
    </div>
  );
}

function ActionButton() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Action Button">
      <div className="flex flex-row items-center justify-end size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-end pr-[24px] relative size-full">
          <Frame117 />
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

function Group8() {
  return (
    <div className="absolute inset-[10%_9.82%_9.75%_9.82%]">
      <svg className="absolute block inset-0 size-full" fill="none" height="25.6799" preserveAspectRatio="none" viewBox="0 0 25.716 25.6799" width="25.716">
        <g id="Group 15">
          <path d={svgPaths.p647e100} fill="#0082FF" id="Vector" />
          <path d={svgPaths.p35c0d300} fill="url(#paint0_linear_0_387)" id="Vector_2" />
          <path d={svgPaths.p19c54100} fill="url(#paint1_linear_0_387)" id="Vector_3" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_0_387" x1="19.3161" x2="14.0476" y1="6.18632" y2="11.6196">
            <stop offset="0.18" stopColor="#0050D3" />
            <stop offset="1" stopColor="#0082FF" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_0_387" x1="13.5374" x2="7.44517" y1="12.3913" y2="18.3188">
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
      <Group8 />
    </div>
  );
}

function Group7() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <AsanaLogo />
    </div>
  );
}

function Logo1() {
  return (
    <div className="content-stretch flex gap-[4px] items-center leading-[0] relative shrink-0" data-name="Logo">
      <Group7 />
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

function Frame61() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-w-px relative">
      <Logo1 />
    </div>
  );
}

function Frame56() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-w-px relative">
      <Frame61 />
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
          <Frame56 />
        </div>
      </div>
    </div>
  );
}























function Applications1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start pb-[8px] relative shrink-0 w-full" data-name="Applications">
      <BuyerIntelligenceSubNav active="prospects" />
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

export default function BuyerActivityLeads() {
  return (
    <div className="bg-[#dde8e5] grow relative w-full" data-name="Buyer Activity / Leads">
      {/* First, so it paints beneath the panels rather than over them.
          The bar is 60px tall and they all begin at 54, so drawn afterwards it
          laid a 6px band of its own green across their tops — but only across
          the ones declared before it, which left the sub-nav starting six
          pixels higher than the content beside it and put a visible step
          between them. Underneath, every panel starts at the same edge. */}
      <VerticalNavbarScroll />
      <div className="absolute bg-[#fbfaf9] border-[rgba(47,43,61,0.1)] border-l border-solid border-t bottom-0 left-[301px] top-[54px] right-0" />
      <Frame63 />
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