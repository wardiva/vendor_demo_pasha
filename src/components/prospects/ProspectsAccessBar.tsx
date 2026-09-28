import { setProspectsAccess, useProspectsAccess, type ProspectsAccess } from "@/lib/prospectsAccess";

/**
 * The review switch for the Prospects tab's two designs — a test control, not
 * product UI.
 *
 * Built to the values of the Prospects page's own prototype switch so the two
 * read as one family of controls: the same white well, hairline border and
 * floating shadow, the same filled #072929 tab for the active choice. It sits
 * on the bottom edge, between the two version-history panels' corners, where
 * nothing else is fixed.
 *
 * Unlike that switch it is shown on every host. A review control that exists
 * only on localhost is invisible on the deployed link, which is the one place
 * a reviewer opens — this project learned that once already.
 *
 * It is also shown on every page, not just Prospects: the crown on the
 * Prospects row is part of the locked design and appears from Signals too, so
 * the switch that governs it has to be reachable from there.
 */

const OPTIONS: ReadonlyArray<{ key: ProspectsAccess; label: string }> = [
  { key: "unlocked", label: "Unlocked" },
  { key: "locked-v2", label: "Locked V2" },
];

export default function ProspectsAccessBar() {
  const access = useProspectsAccess();
  return (
    <div
      className="fixed bottom-[24px] left-1/2 z-[9000] flex -translate-x-1/2 items-center gap-[2px] rounded-[10px] bg-white p-[3px]"
      data-name="Prospects Access Switch"
      role="tablist"
      aria-label="Prospects tab access"
      title="Prospects tab — review switch"
      style={{
        border: "1px solid rgba(47,43,61,0.18)",
        boxShadow: "0px 4px 18px 0px rgba(47,43,61,0.16)",
      }}
    >
      <span className="px-[10px] font-['Inter',sans-serif] text-[12px] leading-[28px] text-[rgba(47,43,61,0.7)]">
        Prospects
      </span>
      {OPTIONS.map(o => {
        const active = o.key === access;
        return (
          <button
            key={o.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setProspectsAccess(o.key)}
            className={`cursor-pointer rounded-[7px] px-[12px] font-['Inter',sans-serif] text-[13px] leading-[28px] transition-colors ${
              active
                ? "bg-[#072929] font-medium text-white"
                : "font-normal text-[#2f2b3d] hover:bg-[rgba(7,41,41,0.06)]"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
