import svgPaths from "./svg-75mzorxvwa";

/**
 * The Signals sub-panel's row list.
 *
 * The three rows the export shipped were identical but for their label, so
 * they are one component driven by SIGNAL_FILTER_ROWS. FilterPanel overlays its
 * hit targets and count badges by index, so the order here is the order there.
 */
export const SIGNAL_FILTER_ROWS = ["Buyers in Market", "Competitor"] as const;

function Row({ label }: { label: string }) {
  return (
    <div className="h-[34px] relative rounded-[8px] shrink-0 w-full" data-name="Populer Plan">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[10px] py-[6px] relative size-full">
          <div className="content-stretch flex flex-[1_0_0] items-center justify-between min-w-px relative" data-name="Text">
            <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">
              <p className="leading-[19px]">{label}</p>
            </div>
            <div className="flex items-center justify-center relative shrink-0 size-[14px]">
              <div className="-rotate-90 flex-none">
                <div className="relative size-[14px]" data-name="chevron-down">
                  <svg className="absolute block inset-0 size-full" fill="none" height="32" preserveAspectRatio="none" viewBox="0 0 32 32" width="32">
                    <g id="Path" />
                  </svg>
                  <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Path">
                    <div className="absolute inset-[-21.43%_-10.71%]">
                      <svg className="block size-full" fill="none" height="5" preserveAspectRatio="none" viewBox="0 0 8.5 5" width="8.5">
                        <path d={svgPaths.p14f49900} id="Path" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Icon">
      <div className="relative shrink-0 size-[20px]" data-name="x">
        <svg className="absolute block inset-0 size-full" fill="none" height="32" preserveAspectRatio="none" viewBox="0 0 32 32" width="32">
          <g id="Path" />
        </svg>
        <div className="absolute inset-1/4" data-name="Path">
          <div className="absolute inset-[-7.5%]">
            <svg className="block size-full" fill="none" height="11.5" preserveAspectRatio="none" viewBox="0 0 11.5 11.5" width="11.5">
              <path d="M10.75 0.75L0.75 10.75" id="Path" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.4" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-1/4" data-name="Path">
          <div className="absolute inset-[-7.5%]">
            <svg className="block size-full" fill="none" height="11.5" preserveAspectRatio="none" viewBox="0 0 11.5 11.5" width="11.5">
              <path d="M0.75 0.75L10.75 10.75" id="Path" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.4" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function BtnIconBtnLgBtnPrimary() {
  return (
    <div className="content-stretch flex items-center p-[5px] relative rounded-[4px] shrink-0" style={{ backgroundImage: "linear-gradient(90deg, rgb(243, 242, 245) 0%, rgb(243, 242, 245) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }} data-name="btn-icon btn-lg btn-primary">
      <Icon />
    </div>
  );
}

export default function SignalsFilters() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start p-[4px] relative size-full" data-name="Signals Filters">
      {SIGNAL_FILTER_ROWS.map(label => (
        <Row key={label} label={label} />
      ))}
      <div className="absolute drop-shadow-[0px_1px_3px_rgba(7,41,41,0.1)] left-[739px] top-[-10px]" data-name="Default-IconButton">
        <div className="flex flex-col items-center size-full">
          <div className="content-stretch flex flex-col items-center relative size-full">
            <BtnIconBtnLgBtnPrimary />
          </div>
        </div>
      </div>
    </div>
  );
}
