import { OptionFilterCard } from "@/components/filters/FilterPrimitives";
import { INTENT_FILTER_OPTIONS } from "@/data/leads";

/**
 * The Intent Score filter's dropdown.
 *
 * Ticking a band applies it straight away — the card has no Apply step and no
 * footer, so the panel holds no selection of its own: what is checked is what
 * is applied, read back from the page each render. The bands are the ones the
 * Intent tag already colours by.
 */
const LABELS = INTENT_FILTER_OPTIONS.map(o => o.label);

export default function IntentFilterPanel({
  onApply,
  applied,
}: {
  onApply: (intent: string[]) => void;
  /** The bands currently applied to the page. */
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
        options={LABELS.map(label => ({ label }))}
        includeAll={false}
        selected={selected}
        onToggle={toggle}
      />
    </div>
  );
}
