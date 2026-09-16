/**
 * The Prospects page's prototype switch — a test control, not product UI.
 *
 * Sits between the toolbar and the list on local hosts only, and swaps what
 * the list slot shows: the real prospects, or the empty-state prototype in
 * their place. It touches nothing else — the filters, the search, the date
 * range, the count beside the heading and the data behind them all carry on
 * exactly as they do, which is the point: the empty state is being looked at
 * in the page it will live in, with everything around it real.
 *
 * Drawn to read as what it is. The dashed amber frame and the PROTOTYPE tag
 * are not the design system's; they are there so the strip can never be
 * mistaken for a shipped control, and so a screenshot taken with it up says
 * so.
 */

export type ProspectsPrototypeView = "prospects" | "empty";

const OPTIONS: ReadonlyArray<{ key: ProspectsPrototypeView; label: string }> = [
  { key: "prospects", label: "Prospects" },
  { key: "empty", label: "Empty state" },
];

export default function ProspectsPrototypeBar({
  view,
  onChange,
}: {
  view: ProspectsPrototypeView;
  onChange: (view: ProspectsPrototypeView) => void;
}) {
  return (
    <div
      className="flex w-full items-center gap-[12px] rounded-[10px] px-[12px]"
      data-name="Prototype Bar"
      data-prototype-bar
      role="group"
      aria-label="Prototype view"
      style={{
        height: 42,
        border: "1.5px dashed #e0a100",
        background: "rgba(255, 196, 0, 0.06)",
      }}
    >
      <span
        className="font-['Inter',sans-serif] font-bold text-[#7a5800]"
        style={{ fontSize: 10.5, letterSpacing: "0.08em", lineHeight: "16px" }}
      >
        PROTOTYPE
      </span>
      <span className="font-['Inter',sans-serif] text-[13px] leading-[20px] text-[rgba(47,43,61,0.7)]">
        Preview the list slot as
      </span>

      {/* Segmented control: two tabs, the active one filled. */}
      <div
        className="flex items-center gap-[2px] rounded-[8px] bg-white p-[2px]"
        role="tablist"
        style={{ border: "1px solid rgba(47,43,61,0.18)" }}
      >
        {OPTIONS.map(o => {
          const active = o.key === view;
          return (
            <button
              key={o.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(o.key)}
              className={`cursor-pointer rounded-[6px] px-[10px] font-['Inter',sans-serif] text-[13px] leading-[24px] transition-colors ${
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

      <span className="ml-auto font-['Inter',sans-serif] text-[12px] leading-[18px] text-[rgba(47,43,61,0.55)]">
        Local only · data and filters untouched
      </span>
    </div>
  );
}
