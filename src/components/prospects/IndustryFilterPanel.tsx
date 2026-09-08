import { OptionFilterCard } from "@/components/filters/FilterPrimitives";
import { INDUSTRY_FILTER_OPTIONS } from "@/data/leads";

/**
 * The Industry filter's dropdown.
 *
 * Ticking an industry applies it straight away — no Apply step and no footer,
 * so the panel holds no selection of its own. The options are read off the
 * prospects themselves, and the card's search narrows the list without
 * touching what is selected.
 */
export default function IndustryFilterPanel({
  onApply,
  applied,
}: {
  onApply: (industries: string[]) => void;
  /** The industries currently applied to the page. */
  applied: string[];
}) {
  const selected = new Set(applied);
  const toggle = (label: string) => {
    const next = new Set(selected);
    next.has(label) ? next.delete(label) : next.add(label);
    onApply([...next]);
  };

  return (
    /* Positioned by the chip that owns it, so it moves with the row. */
    <div data-filter-panel="" onClick={e => e.stopPropagation()}>
      <OptionFilterCard
        options={INDUSTRY_FILTER_OPTIONS.map(label => ({ label }))}
        includeAll={false}
        searchPlaceholder="Search industries"
        selected={selected}
        onToggle={toggle}
      />
    </div>
  );
}
