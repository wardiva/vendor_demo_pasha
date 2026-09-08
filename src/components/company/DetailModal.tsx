import type { ReactNode } from "react";
import IntentTag from "@/components/IntentTag";
import iconClose from "./assets/icon-close.svg";

/**
 * Shared chrome for the Company Info (Figma 23:1455) and Contact Info
 * (Figma 33:2071) dialogs — 754 x 638, a 76px header, a 254px tab rail and a
 * 500px detail column. Both use the Buyer Contact Details overlay: click the
 * backdrop or the close icon to dismiss.
 */

export type DetailTab = {
  label: string;
  icon: string;
  /** True when the glyph is a leaf inset inside its 18x18 frame. */
  inset?: boolean;
};

/**
 * Tab glyphs are exported per state with their colour baked in (#072929 active,
 * #585164 inactive). Drawing them as a mask filled with currentColor keeps the
 * exported geometry while letting the colour follow the tab's own state.
 */
export function TabIcon({ icon, inset }: { icon: string; inset?: boolean }) {
  const mask = {
    maskImage: `url("${icon}")`,
    WebkitMaskImage: `url("${icon}")`,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
    maskSize: "contain",
    WebkitMaskSize: "contain",
    backgroundColor: "currentColor",
  } as const;

  return (
    <div className="relative shrink-0 size-[18px]">
      {inset ? (
        <div className="absolute inset-[11.11%_15.56%_15.56%_11.11%]">
          <div className="absolute inset-[-4.55%]" style={mask} />
        </div>
      ) : (
        <div className="absolute inset-0" style={mask} />
      )}
    </div>
  );
}

export default function DetailModal({
  image,
  imageRounded = "rounded-[8px]",
  title,
  subtitle,
  intentPct,
  tabs,
  activeTab,
  onSelectTab,
  onClose,
  ariaLabel,
  children,
}: {
  image: string;
  imageRounded?: string;
  title: string;
  subtitle: string;
  intentPct: number;
  tabs: DetailTab[];
  activeTab: string;
  onSelectTab: (label: string) => void;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="drop-shadow-[0px_4px_9px_rgba(47,43,61,0.16)] flex flex-col items-start overflow-clip rounded-[16px] w-[754px] max-h-[calc(100vh-48px)]"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        <div className="bg-white flex flex-col items-start rounded-[16px] shrink-0 w-full min-h-px">
          {/* ── modal-header ── */}
          <div className="border-[rgba(0,0,0,0.08)] border-b border-solid flex flex-col items-start h-[76px] justify-center px-[24px] shrink-0 w-full">
            <div className="flex gap-[16px] items-start justify-end relative shrink-0 w-full">
              <div className="flex flex-[1_0_0] items-center min-w-px relative">
                <div className="flex gap-[12px] items-center relative shrink-0">
                  <div className={`relative shrink-0 size-[40px] ${imageRounded}`}>
                    <div aria-hidden className={`absolute inset-0 pointer-events-none ${imageRounded}`}>
                      <div className={`absolute bg-[#f4f2f0] inset-0 ${imageRounded}`} />
                      <img
                        alt=""
                        className={`absolute max-w-none object-cover size-full ${imageRounded}`}
                        src={image}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-start relative shrink-0">
                    <div className="flex gap-[12px] items-center relative shrink-0">
                      <p className="[word-break:break-word] font-['Inter',sans-serif] font-medium leading-[24px] not-italic text-[16px] text-[#2f2b3d] whitespace-nowrap">
                        {title}
                      </p>
                      {/* The same tag the Prospects cards and the tables
                          render — one component, so a company's intent reads
                          identically wherever it appears. */}
                      <IntentTag score={intentPct} />
                    </div>
                    <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[20px] not-italic text-[13px] text-[rgba(47,43,61,0.7)] whitespace-nowrap">
                      {subtitle}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex items-center justify-center py-[5px] relative rounded-[6px] shrink-0 size-[24px] cursor-pointer"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, rgb(243, 242, 245) 0%, rgb(243, 242, 245) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)",
                }}
              >
                <img alt="" className="block max-w-none size-[15px]" src={iconClose} />
              </button>
            </div>
          </div>

          {/* ── body: tab rail + detail panel ──
              Fixed height holds the dialog at its designed 638px on every tab;
              longer panels scroll inside the detail column. */}
          <div className="flex items-start relative shrink-0 w-full h-[562px]">
            <div className="flex flex-[1_0_0] h-full items-start min-w-px relative">
              {/* Figma 236:3310 — the rail is 254 wide with a uniform 16px pad,
                  which is what puts each 222px nav-link at x=16. The left pad
                  was 24, so every link sat 8px in from the rest of the column
                  and ran 8px narrow. Uniform now, and the tab labels line up
                  with the 16px the rail is inset by at its top. */}
              <div className="border-[rgba(0,0,0,0.08)] border-r border-solid flex flex-col gap-[2px] h-full items-start p-[16px] relative shrink-0 w-[254px]">
                {tabs.map(tab => {
                  const active = tab.label === activeTab;
                  return (
                    <button
                      key={tab.label}
                      onClick={() => onSelectTab(tab.label)}
                      className={`flex gap-[8px] items-center px-[12px] relative rounded-[6px] shrink-0 w-full text-left cursor-pointer transition-colors ${
                        active
                          ? "bg-[rgba(7,41,41,0.16)] text-[#072929]"
                          : "text-[rgba(47,43,61,0.7)] hover:bg-[rgba(7,41,41,0.06)]"
                      }`}
                    >
                      <TabIcon icon={tab.icon} inset={tab.inset} />
                      <div className="flex flex-[1_0_0] gap-[6px] items-center min-w-px py-[8px] relative">
                        <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[21px] not-italic text-[14px] text-center whitespace-nowrap">
                          {tab.label}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* The one gap between a tab's heading and whatever it opens
                  with, so every tab sits the same distance under its own
                  title rather than each panel deciding for itself. */}
              <div className="[word-break:break-word] flex flex-[1_0_0] flex-col gap-[20px] h-full items-start min-w-px not-italic px-[24px] py-[16px] relative whitespace-nowrap overflow-y-auto">
                <p className="font-['Inter',sans-serif] font-medium leading-[22px] shrink-0 text-[#2f2b3d] text-[16px]">
                  {activeTab}
                </p>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
