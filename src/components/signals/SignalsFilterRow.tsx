import FilterChip from "@/components/filters/FilterChip";
import { useSignalsFilters } from "@/context/SignalsAnalyticsContext";

/**
 * The Signals page's filter row — Figma 163:4949.
 *
 * The five chips the design lists, then the clear-all that only appears once
 * something is applied. Each chip maps onto a group the page's filter model
 * already has, so the options and the filtering are the existing ones: Activity
 * Level, Tech Stack, Location and Company Size read their own facets, and
 * Competitor is the companies picked under that signal.
 *
 * The chip is the same component the Prospects row renders, and the dropdowns
 * apply on the tick, so both pages behave identically.
 */
export const SIGNALS_FILTER_CHIPS = [
  { key: "activity", label: "Activity Level" },
  { key: "techStack", label: "Tech Stack" },
  { key: "location", label: "Location" },
  { key: "companySize", label: "Company Size" },
  { key: "competitor", label: "Competitors" },
] as const;

export type SignalsFilterKey = (typeof SIGNALS_FILTER_CHIPS)[number]["key"];

export default function SignalsFilterRow() {
  const { counts, hasFilters, clearAll, openChip, renderDropdown, closeChip } = useSignalsFilters();
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      {SIGNALS_FILTER_CHIPS.map(chip => (
        <FilterChip
          key={chip.key}
          label={chip.label}
          count={counts[chip.key]}
          marker={{ "data-signals-filter": chip.key }}
          /* Each chip anchors its own menu, so a scroll moves the two
             together rather than leaving it over the cards below. */
          open={openChip === chip.key}
          dropdown={renderDropdown(chip.key)}
          onDismiss={closeChip}
        />
      ))}
      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="[word-break:break-word] cursor-pointer font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
