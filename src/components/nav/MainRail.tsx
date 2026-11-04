/**
 * The Vendor Portal's main rail, as the portal now draws it: Profiles, Buyer
 * Intelligence (with its NEW tag), Promotions, Review Campaigns, Billing and
 * Settings. Icons, sizes and rhythm come from the Vendor Portal Sign Up
 * artifact's shell, which was measured on vpr-dev: 12px labels, about 26px
 * from each label to the next item's icon, the active item a #072929 square
 * around a white icon. The square is 44px and every item keeps that tile, so
 * selecting one never moves the others.
 *
 * Both page imports render this, so the rail cannot drift between pages.
 */

import type { CSSProperties } from "react";
import { useNavSelection } from "./navSelection";
import railProfiles from "./assets/portal/rail-profiles.svg";
import railBi from "./assets/portal/rail-bi.svg";
import railPromotions from "./assets/portal/rail-promotions.svg";
import railCampaigns from "./assets/portal/rail-campaigns.svg";
import railBilling from "./assets/portal/rail-billing.svg";
import railSettings from "./assets/portal/rail-settings.svg";

type Fit = { left: number; top: number; width: number; height: number };

export type NavItem = { label: string };
export type NavModule = {
  label: string;
  icon: string;
  /** Where the glyph sits in the 23px slot: the source SVGs differ in size, so each is placed to read as one optical size. */
  fit: Fit;
  isNew?: boolean;
  items: NavItem[];
};

/** The portal's navigation: each rail module and the pages its side nav lists. */
export const NAV: NavModule[] = [
  {
    label: "Profiles",
    icon: railProfiles,
    fit: { left: 3.2, top: 2.41, width: 17.37, height: 18.28 },
    items: [{ label: "Profile Management" }, { label: "Reviews" }, { label: "Analytics" }, { label: "Badges" }],
  },
  {
    label: "Buyer Intelligence",
    icon: railBi,
    fit: { left: -2.2, top: -0.78, width: 24.27, height: 24.27 },
    isNew: true,
    items: [{ label: "Signals" }, { label: "Buyers" }, { label: "Integrations" }],
  },
  {
    label: "Promotions",
    icon: railPromotions,
    fit: { left: -0.92, top: 0.53, width: 22.85, height: 21.94 },
    items: [{ label: "Placements" }, { label: "CPC" }],
  },
  {
    label: "Review Campaigns",
    icon: railCampaigns,
    fit: { left: -0.06, top: -0.06, width: 23.12, height: 23.12 },
    items: [{ label: "Review Campaign" }, { label: "Contacts" }, { label: "Rewards" }],
  },
  { label: "Billing", icon: railBilling, fit: { left: -0.86, top: -0.86, width: 24.72, height: 24.72 }, items: [] },
  { label: "Settings", icon: railSettings, fit: { left: -0.82, top: -0.82, width: 24.64, height: 24.64 }, items: [] },
];

const IDLE = "#585164";

/* The exported glyphs carry their stroke colour, so they are drawn as masks
   and filled from the state instead: white on the active square, grey otherwise. */
function RailIcon({ src, fit, active }: { src: string; fit: Fit; active: boolean }) {
  const mask: CSSProperties = {
    position: "absolute",
    left: fit.left,
    top: fit.top,
    width: fit.width,
    height: fit.height,
    WebkitMaskImage: `url("${src}")`,
    maskImage: `url("${src}")`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    backgroundColor: active ? "#ffffff" : IDLE,
  };
  return (
    <span className="relative flex size-[23px]" aria-hidden>
      <span style={mask} />
    </span>
  );
}

/* The NEW tag: a 32x15 pill with a short dark stroke running round its
   outline, one lap every 2.4s (still under reduced motion). */
function NewPill() {
  return (
    <span className="rail-newpill absolute left-[6px] top-[-8px] z-[2] flex h-[15px] w-[32px] items-center justify-center rounded-[6px] bg-[rgb(187,201,199)]" aria-hidden>
      <svg className="absolute inset-0 h-[15px] w-[32px] overflow-visible" viewBox="0 0 32 15" preserveAspectRatio="none">
        <path
          d="M 6.75 0.75 L 25.25 0.75 Q 31.25 0.75 31.25 6.75 L 31.25 8.25 Q 31.25 14.25 25.25 14.25 L 6.75 14.25 Q 0.75 14.25 0.75 8.25 L 0.75 6.75 Q 0.75 0.75 6.75 0.75 Z"
          fill="none"
          stroke="#072929"
          strokeWidth="1.5"
          strokeDasharray="10 68"
          strokeDashoffset="-13.57"
        />
      </svg>
      <span className="relative font-['Inter',sans-serif] text-[8px] font-extrabold leading-[8px] text-[#072929]">NEW</span>
    </span>
  );
}

/* Every item keeps the same 44px tile whether or not it is selected, so the
   selected square appears in place and nothing below it moves when the
   selection changes. The NEW tag straddles the tile's top edge, 3.5px above
   the icon, and its item keeps 8px of headroom for it. */
function RailItem({ module, active }: { module: NavModule; active: boolean }) {
  return (
    <div
      className={`flex flex-col items-center rounded-xl cursor-pointer${module.isNew ? " pt-[8px]" : ""}`}
      data-name="ListItem"
      data-label={module.label}
      data-module={module.label}
      aria-current={active ? "page" : undefined}
    >
      <div className="relative flex size-[44px] items-center justify-center rounded-[12px]">
        {active && <span className="absolute inset-0 rounded-[12px] bg-[#072929]" />}
        {module.isNew && <NewPill />}
        <RailIcon src={module.icon} fit={module.fit} active={active} />
      </div>
      <p className="mt-[4px] max-w-[65px] text-center font-['Inter',sans-serif] text-[12px] font-normal leading-[18px] text-[rgb(75,85,99)]">
        {module.label}
      </p>
    </div>
  );
}

export default function MainRail({ active }: { active?: string }) {
  /* The selected module comes from App, so a click on any module selects it. */
  const selected = useNavSelection().module;
  const current = active ?? selected;
  return (
    /* 12px from each label to the next tile, plus the tile's own 10.5px around
       its icon, keeps the visible label-to-icon rhythm near the portal's 26px. */
    <div className="flex w-full flex-col items-center gap-[12px] pb-[8px] pt-[12px]" data-name="Applications">
      {NAV.map(m => (
        <RailItem key={m.label} module={m} active={m.label === current} />
      ))}
    </div>
  );
}
