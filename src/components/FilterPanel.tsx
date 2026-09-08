import { useState, useRef, useEffect } from "react";
import {
  FILTER_CARD_GAP,
  OptionFilterCard,
  isAllSelected,
  makeToggle,
} from "@/components/filters/FilterPrimitives";
import {
  COMPANY_SIZES,
  EMPTY_FILTERS,
  FILTERABLE_LOCATIONS,
  SIGNAL_FILTER_KINDS,
  TECH_STACK,
  type ActivityLevel,
  type AppliedFilters,
  type CompanySize,
  type SignalFilterKind,
  type Tech,
} from "@/data/signals";
import FiltersMain from "@/imports/Filters/index";
import ActivityLevelFilters from "@/imports/ActivityLevelFilters/index";
import SignalsFilters from "@/imports/SignalsFilters/index";
import CompanyOptionList, { COMPANY_OPTION_ROWS } from "@/components/filters/CompanyOptionList";

/* 5 rows × 34px + 4 gaps × 2px + 4px top pad + 4px bottom pad = 186px */
const FILTERS_W = 220, FILTERS_H = 186;
const ACTIVITY_W = 220, ACTIVITY_H = 150;
/* Two rows now: 4px top pad + 2 x 34px + 2px gap + 4px bottom pad = 78px */
const SIGNALS_W = 200, SIGNALS_H = 78;
const PROFILE_W = 240, PROFILE_H = 330;

/* Row geometry: 4px top padding, 34px row height, 2px gap */
const rTop = (i: number) => 4 + i * 36;

/* Invisible click target overlaid on each row */
function RowHit({
  index,
  onClick,
  onMouseEnter,
}: {
  index: number;
  onClick: () => void;
  onMouseEnter?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className="absolute left-0 right-0 cursor-pointer rounded-[8px] z-[2] transition-colors hover:bg-black/[0.03]"
      style={{ top: rTop(index), height: 34 }}
    />
  );
}

/* Dynamic checkbox overlaid on top of the static import checkbox */
function CheckboxOverlay({ index, checked }: { index: number; checked: boolean }) {
  return (
    <div
      className="absolute pointer-events-none z-[3]"
      style={{ top: rTop(index) + 9, left: 10, width: 15, height: 15 }}
    >
      {checked ? (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <rect width="15" height="15" rx="4" fill="#072929" />
          <path d="M3 7.5L6 10.5L12 4.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <rect width="15" height="15" rx="4" fill="white" />
          <rect x="0.5" y="0.5" width="14" height="14" rx="3.5" stroke="rgba(47,43,61,0.18)" />
        </svg>
      )}
    </div>
  );
}

/* "Reset" text action on the right side of the All row */
function RowResetButton({ index, onClick, visible }: { index: number; onClick: () => void; visible: boolean }) {
  if (!visible) return null;
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      className="absolute z-[4] flex items-center cursor-pointer font-['Inter',sans-serif] text-[11px] font-normal text-[#072929]/50 hover:text-[#072929] transition-colors"
      style={{ top: rTop(index), height: 34, right: 10 }}
    >
      Reset
    </button>
  );
}

/* Tech Stack brand logos */
function TechLogo({ name }: { name: string }) {
  const logos: Record<string, React.ReactNode> = {
    HubSpot: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="8" fill="#FF7A59" />
        <circle cx="9.5" cy="6.5" r="2" fill="white" />
        <path d="M7.5 6.5V11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 9.5h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    Granola: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect width="16" height="16" rx="4" fill="#1A1A1A" />
        <path d="M4 8.5C4 6.015 6.015 4 8.5 4C9.742 4 10.868 4.502 11.686 5.314L10 7C9.6 6.6 9.08 6.357 8.5 6.357C7.315 6.357 6.357 7.315 6.357 8.5C6.357 9.685 7.315 10.643 8.5 10.643C9.08 10.643 9.6 10.4 10 10L11.686 11.686C10.868 12.498 9.742 13 8.5 13C6.015 13 4 10.985 4 8.5Z" fill="white" />
        <path d="M10 8.5H13" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    Figma: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="4" y="2" width="4" height="4" rx="2" fill="#F24E1E" />
        <rect x="8" y="2" width="4" height="4" rx="2" fill="#FF7262" />
        <rect x="4" y="6" width="4" height="4" rx="2" fill="#A259FF" />
        <rect x="4" y="10" width="4" height="4" rx="2" fill="#0ACF83" />
        <circle cx="10" cy="8" r="2" fill="#1ABCFE" />
      </svg>
    ),
    Claude: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect width="16" height="16" rx="4" fill="#CC785C" />
        <path d="M5 11.5L8 4.5L11 11.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.2 9H9.8" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    "VS Code": (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect width="16" height="16" rx="4" fill="#007ACC" />
        <path d="M3 5.5L7 8L3 10.5V5.5Z" fill="white" />
        <path d="M7 5.5L13 3V13L7 10.5V5.5Z" fill="white" />
        <path d="M7 8L13 5.5" stroke="#007ACC" strokeWidth="0.5" />
        <path d="M7 8L13 10.5" stroke="#007ACC" strokeWidth="0.5" />
      </svg>
    ),
  };
  return <>{logos[name] ?? null}</>;
}

/* Selected-count badge — matches the ChipBgLabelDanger1 design from the Filters button */
function CountBadge({ index, count }: { index: number; count: number }) {
  if (count === 0) return null;
  return (
    <div
      className="absolute pointer-events-none z-[3] flex items-center justify-center"
      style={{ top: rTop(index), height: 34, right: 34 }}
    >
      <div className="bg-[rgba(177,250,99,0.32)] flex items-center justify-center p-[4px] rounded-[6px] size-[18px]">
        <span className="text-[11px] font-['Inter',sans-serif] font-semibold text-[#072929] leading-[16px]">
          {count}
        </span>
      </div>
    </div>
  );
}

interface FilterPanelProps {
  position: { x: number; y: number };
  onClose: () => void;
  onApply: (filters: AppliedFilters) => void;
  onReset?: () => void;
  /** Fires whenever the working selection changes, so it survives a close. */
  onDraftChange?: (filters: AppliedFilters) => void;
  /** Currently applied filters, so reopening the panel restores the selection. */
  initial?: AppliedFilters;
}

export default function FilterPanel({ position, onClose, onApply, onReset, onDraftChange, initial }: FilterPanelProps) {
  type RightPanel = null | "activity" | "techstack" | "location" | "companysize" | "signals";
  const [rightPanel, setRightPanel] = useState<RightPanel>(null);
  const [signalSub, setSignalSub] = useState<null | SignalFilterKind>(null);
  const seed = initial ?? EMPTY_FILTERS;
  const [activitySel, setActivitySel] = useState<Set<string>>(() => new Set(seed.activity));
  const [techStackSel, setTechStackSel] = useState<Set<string>>(() => new Set(seed.techStack));
  const [locationSel, setLocationSel] = useState<Set<string>>(() => new Set(seed.location));
  const [companySizeSel, setCompanySizeSel] = useState<Set<string>>(() => new Set(seed.companySize));
  const [buyersSel, setBuyersSel] = useState<Set<string>>(() => new Set(seed.signals.buyersInMarket));
  const [competitorSel, setCompetitorSel] = useState<Set<string>>(() => new Set(seed.signals.competitor));

  const TECH_STACK_OPTIONS = [...TECH_STACK];
  const LOCATION_OPTIONS = [...FILTERABLE_LOCATIONS];
  const COMPANY_SIZE_OPTIONS = [...COMPANY_SIZES];


  /* Delayed close so the cursor can travel from parent to child panel */
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => { setRightPanel(null); setSignalSub(null); }, 150);
  };
  const openPanel = (panel: Exclude<RightPanel, null>) => { cancelClose(); setRightPanel(panel); setSignalSub(null); };
  const closePanel = () => { cancelClose(); setRightPanel(null); setSignalSub(null); };
  const openSignalSub = (sub: SignalFilterKind) => { cancelClose(); setSignalSub(sub); };

  const ACTIVITY_ROWS = ["All", "Low", "Medium", "High"] as const;
  const ACTIVITY_VALUES = ACTIVITY_ROWS.filter(v => v !== "All");
  /* Same order as the sub-panel's rows, so the overlays line up by index. */
  const SIGNAL_ROWS = SIGNAL_FILTER_KINDS;
  /* Every option is a distinct company, so the rows and the values "All"
     works off are the same list minus its first entry. */
  const COMPANY_ROWS = COMPANY_OPTION_ROWS;
  const COMPANY_VALUES = COMPANY_ROWS.filter(c => c !== "All");

  const toggleActivity = makeToggle(setActivitySel, ACTIVITY_VALUES);

  const subSel = signalSub === "buyersInMarket" ? buyersSel : competitorSel;
  const setSubSel = signalSub === "buyersInMarket" ? setBuyersSel : setCompetitorSel;
  const totalSignalSel = buyersSel.size + competitorSel.size;

  const toggleCompany = makeToggle(setSubSel, COMPANY_VALUES);

  /* Mirror the working selection up to the page. Reopening seeds from it, so a
     click outside keeps everything the user had picked but not yet applied. */
  useEffect(() => {
    onDraftChange?.({
      activity: [...activitySel] as ActivityLevel[],
      techStack: [...techStackSel] as Tech[],
      location: [...locationSel],
      companySize: [...companySizeSel] as CompanySize[],
      signals: {
        buyersInMarket: [...buyersSel],
        competitor: [...competitorSel],
      },
    });
  }, [activitySel, techStackSel, locationSel, companySizeSel, buyersSel, competitorSel, onDraftChange]);


  return (
    <div
      className="fixed z-[9999]"
      data-filter-panel=""
      style={{ left: position.x, top: position.y }}
      onClick={e => e.stopPropagation()}
    >
      <div
        style={{ display: "flex", gap: FILTER_CARD_GAP, alignItems: "flex-start" }}
        onMouseLeave={scheduleClose}
        onMouseEnter={cancelClose}
      >
        {/* ── Main Filters panel — card styling owned here so Reset shares the same card ── */}
        <div
          className="bg-white rounded-[12px] shadow-[0px_4px_18px_0px_rgba(47,43,61,0.16)] overflow-hidden"
          style={{ width: FILTERS_W, display: "flex", flexDirection: "column" }}
        >
          {/* FiltersMain in fixed-height inner container with overlays */}
          <div style={{ height: FILTERS_H, position: "relative", overflow: "hidden" }}>
            <FiltersMain />

            {/* Activity Level (row 0) — hover or click opens sub-panel */}
            <RowHit
              index={0}
              onClick={() => { setRightPanel(p => p === "activity" ? null : "activity"); setSignalSub(null); }}
              onMouseEnter={() => openPanel("activity")}
            />
            <CountBadge index={0} count={activitySel.size} />

            {/* Tech Stack (row 1) */}
            <RowHit index={1} onClick={() => { setRightPanel(p => p === "techstack" ? null : "techstack"); setSignalSub(null); }} onMouseEnter={() => openPanel("techstack")} />
            <CountBadge index={1} count={techStackSel.size} />

            {/* Headquarter Location (row 2) */}
            <RowHit index={2} onClick={() => { setRightPanel(p => p === "location" ? null : "location"); setSignalSub(null); }} onMouseEnter={() => openPanel("location")} />
            <CountBadge index={2} count={locationSel.size} />

            {/* Company Size (row 3) */}
            <RowHit index={3} onClick={() => { setRightPanel(p => p === "companysize" ? null : "companysize"); setSignalSub(null); }} onMouseEnter={() => openPanel("companysize")} />
            <CountBadge index={3} count={companySizeSel.size} />

            {/* Signals (row 4) — hover or click opens sub-panel */}
            <RowHit
              index={4}
              onClick={() => { setRightPanel(p => p === "signals" ? null : "signals"); setSignalSub(null); }}
              onMouseEnter={() => openPanel("signals")}
            />
            <CountBadge index={4} count={totalSignalSel} />
          </div>

          {/* Bottom actions — always visible */}
          <div>
              <div style={{ height: 1, background: "rgba(47,43,61,0.06)", margin: "0 10px" }} />
            <div className="flex items-center justify-between px-[14px] py-[8px] gap-[8px]">
              <button
                onClick={() => {
                  setActivitySel(new Set()); setTechStackSel(new Set()); setLocationSel(new Set());
                  setCompanySizeSel(new Set()); setBuyersSel(new Set()); setCompetitorSel(new Set());
                  setRightPanel(null); setSignalSub(null);
                  onReset?.();
                }}
                className="cursor-pointer font-['Inter',sans-serif] text-[11px] font-normal text-[#072929]/50 hover:text-[#072929] transition-colors"
              >
                Reset All
              </button>
              <button
                onClick={() => {
                  onApply({
                    activity: [...activitySel] as ActivityLevel[],
                    techStack: [...techStackSel] as Tech[],
                    location: [...locationSel],
                    companySize: [...companySizeSel] as CompanySize[],
                    signals: {
                      buyersInMarket: [...buyersSel],
                      competitor: [...competitorSel],
                    },
                  });
                  onClose();
                }}
                className="flex items-center justify-center px-[12px] rounded-[8px] cursor-pointer font-['Inter',sans-serif] text-[12px] font-medium text-white bg-[#072929] hover:bg-[#0a3a3a] transition-colors"
                style={{ height: 30 }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* ── Activity Level sub-panel ── */}
        {rightPanel === "activity" && (
          <div
            className="bg-white rounded-[12px] shadow-[0px_4px_18px_0px_rgba(47,43,61,0.16)] overflow-hidden flex flex-col"
            style={{ width: ACTIVITY_W }}
            onMouseEnter={cancelClose}
          >
            <div style={{ height: ACTIVITY_H, position: "relative", overflow: "hidden" }}>
              <ActivityLevelFilters />
              {ACTIVITY_ROWS.map((val, i) => (
                <RowHit key={val} index={i} onClick={() => toggleActivity(val)} />
              ))}
              {ACTIVITY_ROWS.map((val, i) => (
                <CheckboxOverlay
                  key={`cb-${val}`}
                  index={i}
                  checked={val === "All" ? isAllSelected(activitySel, ACTIVITY_VALUES) : activitySel.has(val)}
                />
              ))}
              <RowResetButton index={0} onClick={() => setActivitySel(new Set())} visible={activitySel.size > 0} />
            </div>
          </div>
        )}

        {/* ── Tech Stack sub-panel ── */}
        {rightPanel === "techstack" && (
          <OptionFilterCard
            options={TECH_STACK_OPTIONS.map(label => ({ label, icon: <TechLogo name={label} /> }))}
            selected={techStackSel}
            onToggle={makeToggle(setTechStackSel, TECH_STACK_OPTIONS)}
            onReset={() => setTechStackSel(new Set())}
            onMouseEnter={cancelClose}
          />
        )}

        {/* ── Headquarter Location sub-panel ── */}
        {rightPanel === "location" && (
          <OptionFilterCard
            options={LOCATION_OPTIONS.map(label => ({ label }))}
            selected={locationSel}
            onToggle={makeToggle(setLocationSel, LOCATION_OPTIONS)}
            onReset={() => setLocationSel(new Set())}
            onMouseEnter={cancelClose}
          />
        )}

        {/* ── Company Size sub-panel ── */}
        {rightPanel === "companysize" && (
          <OptionFilterCard
            options={COMPANY_SIZE_OPTIONS.map(label => ({ label }))}
            selected={companySizeSel}
            onToggle={makeToggle(setCompanySizeSel, COMPANY_SIZE_OPTIONS)}
            onReset={() => setCompanySizeSel(new Set())}
            onMouseEnter={cancelClose}
          />
        )}

        {/* ── Signals sub-panel ── */}
        {rightPanel === "signals" && (
          <div style={{ display: "flex", gap: FILTER_CARD_GAP, alignItems: "flex-start" }} onMouseEnter={cancelClose}>
            <div
              className="bg-white rounded-[12px] shadow-[0px_4px_18px_0px_rgba(47,43,61,0.16)] overflow-hidden flex flex-col"
              style={{ width: SIGNALS_W }}
            >
              {/* Header row: "Signals" label + conditional Reset */}
              <div className="flex items-center justify-between px-[14px] shrink-0" style={{ height: 34 }}>
                <span className="font-['Inter',sans-serif] font-normal text-[#2f2b3d] text-[13px] leading-[19px]">Signals</span>
                {totalSignalSel > 0 && (
                  <button
                    onClick={() => { setBuyersSel(new Set()); setCompetitorSel(new Set()); }}
                    className="font-['Inter',sans-serif] text-[11px] font-normal text-[#072929]/50 hover:text-[#072929] transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div style={{ height: 1, background: "rgba(47,43,61,0.06)", margin: "0 14px" }} />
              <div style={{ height: SIGNALS_H, position: "relative", overflow: "hidden" }}>
                <SignalsFilters />
                {SIGNAL_ROWS.map((val, i) => (
                  <RowHit
                    key={val}
                    index={i}
                    onClick={() => setSignalSub(s => s === val ? null : val)}
                    onMouseEnter={() => openSignalSub(val)}
                  />
                ))}
                <CountBadge index={0} count={buyersSel.size} />
                <CountBadge index={1} count={competitorSel.size} />
              </div>
            </div>

            {signalSub && (
              <div
                className="bg-white rounded-[12px] shadow-[0px_4px_18px_0px_rgba(47,43,61,0.16)] overflow-hidden flex flex-col"
                style={{ width: PROFILE_W }}
                onMouseEnter={cancelClose}
              >
                {/* The same list, and the same defect: twenty companies do not
                    fit the card, and clipping them put the later ones out of
                    reach entirely. It scrolls instead, on the menus' own bar,
                    and its overlays are positioned inside the scroller so they
                    travel with the rows they belong to. */}
                <div className="filter-option-scroll" style={{ maxHeight: PROFILE_H, position: "relative" }}>
                  <CompanyOptionList />
                  {COMPANY_ROWS.map((_c, i) => (
                    <RowHit key={`hit-${i}`} index={i} onClick={() => toggleCompany(COMPANY_ROWS[i])} />
                  ))}
                  {COMPANY_ROWS.map((company, i) => (
                    <CheckboxOverlay
                      key={`cb-${i}`}
                      index={i}
                      checked={company === "All" ? isAllSelected(subSel, COMPANY_VALUES) : subSel.has(company)}
                    />
                  ))}
                  <RowResetButton index={0} onClick={() => setSubSel(new Set())} visible={subSel.size > 0} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
