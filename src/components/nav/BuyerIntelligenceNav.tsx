/**
 * The Buyer Intelligence navigation, in one place for both pages.
 *
 * Buyer Intelligence is a top-level module: it sits in the main rail, and the
 * secondary drawer below it lists only the module's own pages. Both page
 * imports render these, so the two sidebars cannot drift apart the way their
 * copied markup used to.
 *
 * Everything here is lifted verbatim from the imported sidebars — the same
 * sizes, spacing, type and active treatment — with the state that used to be
 * baked into each copy now driven by props.
 */

import type { CSSProperties, ReactNode } from "react";
import iconSignals from "./assets/icon-signals.svg";
import iconProspects from "./assets/icon-prospects.svg";

/** Which module page the user is on; drives both navs' active state. */
export type BuyerIntelligencePage = "signals" | "prospects" | "integrations";

/* Path data copied from the page imports' svg modules, so this component does
   not depend on either of them. */
const USER_SEARCH_TAIL = "M5.5 19.25V17.4167C5.5 15.3916 7.14162 13.75 9.16667 13.75H10.0833";
const PLUG_BODY = "M0.75 0.75H9.91667V6.25C9.91667 7.76878 8.68545 9 7.16667 9H3.5C1.98122 9 0.75 7.76878 0.75 6.25V0.75";
const PLUG_LEAD = "M0.75 0.75V2.58333C0.75 3.59586 1.57081 4.41667 2.58333 4.41667H5.33333";

/* The main rail draws its active item white-on-#072929 and everything else in
   this grey, exactly as the rail's other icons do. */
const IDLE = "#585164";
const ACTIVE = "#072929";

function UserSearchIcon({ stroke }: { stroke: string }) {
  return (
    <svg className="absolute block inset-0 size-full" fill="none" height="22" preserveAspectRatio="none" viewBox="0 0 22 22" width="22">
      <g id="user-search">
        <circle cx="11" cy="6.41667" id="Oval" r="3.66667" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d={USER_SEARCH_TAIL} id="Path_2" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <g id="Group 1261156444">
          <path d="M12 19.5V16.75" id="Vector" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M15.668 19.5V14" id="Vector_2" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M19.332 19.5V19.51" id="Vector_3" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </g>
    </svg>
  );
}

/**
 * Buyer Intelligence in the main rail — the same icon the module used in the
 * secondary drawer, in the rail's own 24px slot and 44px pill.
 *
 * The label is the one place this item cannot behave like its neighbours:
 * theirs are single words that fit the 63px column, so they carry
 * whitespace-nowrap. Two words at the same 13px do not fit, so this one wraps
 * and centres instead. Font, weight, colour and line height are unchanged.
 */
export function MainNavBuyerIntelligence({ active }: { active: boolean }) {
  const icon = (
    <div className="relative shrink-0 size-[24px]" data-name="user-search">
      <UserSearchIcon stroke={active ? "white" : IDLE} />
    </div>
  );
  const label = (
    /* No word-break here, unlike the rail's other labels: at 13px
       "Intelligence" is wider than the 63px column and break-word split it
       across two lines mid-word. Left whole it wraps after "Buyer" and the
       second line sits centred, still inside the 80px drawer. */
    <p className="font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] text-center">
      Buyer Intelligence
    </p>
  );

  /* The rail's active item: a filled pill around the icon. */
  if (active) {
    return (
      <div className="content-stretch flex flex-col items-center py-[8px] relative shrink-0 w-full" data-name="ListItem">
        <div className="bg-[#072929] content-stretch flex flex-col h-[44px] items-start justify-center px-[10px] py-[8px] relative rounded-[12px] shrink-0" data-name="Container">
          {icon}
        </div>
        {label}
      </div>
    );
  }

  return (
    <div className="relative rounded-[6px] shrink-0 w-full" data-name="ListItem">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col items-center px-[10px] py-[8px] relative size-full">
          <div className="content-stretch flex flex-col h-[44px] items-center justify-center px-[10px] py-[8px] relative shrink-0" data-name="Container">
            {icon}
          </div>
          {label}
        </div>
      </div>
    </div>
  );
}

/**
 * Signals and Prospects — Figma 125:732, rendered from the icons exported
 * from that node.
 *
 * Figma ships each glyph with its state's colour baked into the stroke:
 * Signals is drawn inactive (#585164) and Prospects active (#072929), so
 * neither file alone covers both rows. The asset is used as a mask instead of
 * an <img>, which keeps the exported vector exactly as Figma drew it while the
 * colour comes from the state — the same two values the drawer already uses.
 *
 * The nested insets are Figma's own: the outer box positions the glyph in the
 * 22px slot, the inner one is the bleed its stroke needs.
 */
function NavIcon({ src, active, inset, bleed }: { src: string; active: boolean; inset: string; bleed: string }) {
  const mask: CSSProperties = {
    /* Quoted: the build inlines these SVGs as data URIs whose attributes use
       single quotes, which an unquoted url() cannot carry. */
    WebkitMaskImage: `url("${src}")`,
    maskImage: `url("${src}")`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    backgroundColor: active ? ACTIVE : IDLE,
  };
  return (
    <div className="relative shrink-0 size-[22px]" data-name="nav-icon">
      <div className={`absolute ${inset}`}>
        <div className={`absolute ${bleed}`} style={mask} />
      </div>
    </div>
  );
}

function SignalsIcon({ active }: { active: boolean }) {
  return <NavIcon src={iconSignals} active={active} inset="inset-[27.27%_21.29%_27.27%_18.18%]" bleed="inset-[-8.25%_-6.2%]" />;
}

function ProspectsIcon({ active }: { active: boolean }) {
  return <NavIcon src={iconProspects} active={active} inset="inset-[22.73%_18.18%_18.18%_22.73%]" bleed="inset-[-5.77%]" />;
}

function PlugIcon({ stroke }: { stroke: string }) {
  return (
    <div className="relative shrink-0 size-[22px]" data-name="plug">
      <svg className="absolute block inset-0 size-full" fill="none" height="32" preserveAspectRatio="none" viewBox="0 0 32 32" width="32">
        <g id="Path" />
      </svg>
      <div className="absolute inset-[29.17%_29.17%_33.33%_29.17%]" data-name="Path">
        <div className="absolute inset-[-9.09%_-8.18%]">
          <svg className="block size-full" fill="none" height="9.75" preserveAspectRatio="none" viewBox="0 0 10.6667 9.75" width="10.6667">
            <path d={PLUG_BODY} id="Path" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[12.5%_60.42%_70.83%_35.42%]" data-name="Path">
        <div className="absolute inset-[-20.45%_-31.82%]">
          <svg className="block size-full" fill="none" height="5.16667" preserveAspectRatio="none" viewBox="0 0 1.5 5.16667" width="1.5">
            <path d="M0.75 0.75V4.41667" id="Path" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[12.5%_35.42%_70.83%_60.42%]" data-name="Path">
        <div className="absolute inset-[-20.45%_-31.82%]">
          <svg className="block size-full" fill="none" height="5.16667" preserveAspectRatio="none" viewBox="0 0 1.5 5.16667" width="1.5">
            <path d="M0.75 0.75V4.41667" id="Path" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[16.67%] left-1/2 right-[29.17%] top-[66.67%]" data-name="Path">
        <div className="absolute inset-[-20.45%_-16.36%]">
          <svg className="block size-full" fill="none" height="5.16667" preserveAspectRatio="none" viewBox="0 0 6.08333 5.16667" width="6.08333">
            <path d={PLUG_LEAD} id="Path" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/**
 * One drawer row. The active treatment is the drawer's own: the row takes the
 * 16%-alpha fill and the label switches to #072929, which is what Prospects
 * already looked like when it was the selected child.
 */
function NavRow({ label, active, icon }: { label: string; active: boolean; icon: ReactNode }) {
  return (
    <div
      className={`content-stretch flex items-center px-[12px] py-[8px] relative rounded-[6px] shrink-0 w-full${
        active ? " bg-[rgba(7,41,41,0.16)]" : ""
      }`}
      data-name="ListItem"
    >
      <div className="content-stretch flex flex-[1_0_0] items-center justify-between min-w-px relative">
        <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
          {icon}
          <p
            className={`[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[21px] not-italic relative shrink-0 text-[15px] whitespace-nowrap ${
              active ? "text-[#072929]" : "text-[#2f2b3d]"
            }`}
          >
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * The secondary drawer's contents: the module's three pages and nothing else.
 * Buyer Intelligence itself is no longer listed here — it is the main rail's
 * active item instead — so these rows sit at the top level of the drawer.
 */
export default function BuyerIntelligenceSubNav({ active }: { active: BuyerIntelligencePage }) {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-full" data-name="Applications">
      <NavRow label="Signals" active={active === "signals"} icon={<SignalsIcon active={active === "signals"} />} />
      <NavRow label="Prospects" active={active === "prospects"} icon={<ProspectsIcon active={active === "prospects"} />} />
      <NavRow
        label="Integrations"
        active={active === "integrations"}
        icon={<PlugIcon stroke={active === "integrations" ? ACTIVE : IDLE} />}
      />
    </div>
  );
}
