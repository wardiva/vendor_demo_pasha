import { PROSPECT_COMPANIES } from "@/data/prospects";

/**
 * The company selector inside the Signals filter's sub-panels.
 *
 * Every option is a company: "All" first, then the Prospects page's companies
 * in card order, each once and with that page's own logo. The export this
 * replaces hard-coded nine rows — a contact's name among them, and several
 * companies listed twice — so the list is built from the shared company data
 * instead, and the two surfaces can no longer drift apart.
 *
 * Geometry is the export's, unchanged: 4px padding, 34px rows, 2px gaps. That
 * keeps FilterPanel's absolutely-positioned hit targets, checkboxes and Reset
 * lined up on `rTop(i) = 4 + i * 36`.
 */
export const COMPANY_OPTION_ROWS = ["All", ...PROSPECT_COMPANIES.map(c => c.name)];

const LABEL =
  "[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap";

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[34px] relative rounded-[8px] shrink-0 w-full" data-name="Populer Plan">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[10px] py-[6px] relative size-full">
          {/* The slot FilterPanel draws its checkbox into. */}
          <div className="relative rounded-[4px] shrink-0 size-[15px]" />
          {children}
        </div>
      </div>
    </div>
  );
}

export default function CompanyOptionList() {
  return (
    <div
      /* Height is the list's own rather than the card's, so the card can
         scroll it: pinned to 100% it would be clipped to one card's worth. */
      className="content-stretch flex flex-col gap-[2px] items-start p-[4px] relative w-full"
      data-name="Company List Filters"
    >
      <Row>
        <p className={LABEL}>All</p>
      </Row>
      {PROSPECT_COMPANIES.map(company => (
        <Row key={company.name}>
          <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
            <div className="relative rounded-[6px] shrink-0 size-[20px]" data-name="Icon">
              <img
                alt=""
                className="absolute inset-0 max-w-none object-contain pointer-events-none rounded-[6px] size-full"
                src={company.logo}
              />
            </div>
            <p className={LABEL}>{company.name}</p>
          </div>
        </Row>
      ))}
    </div>
  );
}
