/**
 * The Prospects page's prototype switch — a test control, not product UI.
 *
 * Two tabs, pinned to the bottom-right of the window on local hosts only, that
 * swap what the list slot shows: the real prospects, or the empty-state
 * prototype in their place. It touches nothing else — the filters, the
 * search, the date range, the count beside the heading and the data behind
 * them all carry on exactly as they do, which is the point: the empty state
 * is being looked at in the page it will live in, with everything around it
 * real.
 *
 * Fixed to the viewport rather than placed in the page, so it stays put while
 * the list scrolls under it and takes no room from the layout it is there to
 * preview. It sits beneath the modals and the toast, which are the only
 * things that should ever cover it.
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
      className="fixed bottom-[24px] right-[24px] z-[9000] flex items-center gap-[2px] rounded-[10px] bg-white p-[3px]"
      data-name="Prototype Switch"
      data-prototype-bar
      role="tablist"
      aria-label="Prototype view"
      title="Prototype view — local only"
      style={{
        border: "1px solid rgba(47,43,61,0.18)",
        boxShadow: "0px 4px 18px 0px rgba(47,43,61,0.16)",
      }}
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
