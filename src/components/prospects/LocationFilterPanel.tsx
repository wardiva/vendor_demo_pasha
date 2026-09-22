import { OptionFilterCard } from "@/components/filters/FilterPrimitives";
import { LOCATION_FILTER_OPTIONS } from "@/data/leads";

/**
 * The Location filter's dropdown.
 *
 * Built exactly as the Industry filter is: ticking a location applies it
 * straight away — no Apply step and no footer, so the panel holds no
 * selection of its own. The options are the headquarters the prospects'
 * own profiles state, and the card's search narrows the list without
 * touching what is selected.
 */
export default function LocationFilterPanel({
  onApply,
  applied,
}: {
  onApply: (locations: string[]) => void;
  /** The locations currently applied to the page. */
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
        options={LOCATION_FILTER_OPTIONS.map(label => ({ label }))}
        includeAll={false}
        searchPlaceholder="Search locations"
        selected={selected}
        onToggle={toggle}
      />
    </div>
  );
}
