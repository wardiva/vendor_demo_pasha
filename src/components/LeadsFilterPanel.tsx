import { OptionFilterCard } from "@/components/filters/FilterPrimitives";
import { LEAD_SIGNAL_OPTIONS, type LeadSignalOption } from "@/data/leads";

/**
 * Prospects page Signals filter panel.
 *
 * One level: the Signals options are the panel. Ticking an option applies it
 * straight away — the card has no Apply step and no footer, so the panel holds
 * no selection of its own and simply reflects what is applied to the page.
 */
const SIGNAL_OPTIONS = [...LEAD_SIGNAL_OPTIONS];

export default function LeadsFilterPanel({
  onApply,
  applied,
}: {
  onApply: (signals: LeadSignalOption[]) => void;
  /** The signal options currently applied to the page. */
  applied: LeadSignalOption[];
}) {
  const selected = new Set<string>(applied);
  const toggle = (label: string) => {
    const next = new Set(selected);
    next.has(label) ? next.delete(label) : next.add(label);
    onApply([...next] as LeadSignalOption[]);
  };

  return (
    /* Positioned by the chip that owns it, so it moves with the row. */
    <div data-filter-panel="" onClick={e => e.stopPropagation()}>
      <OptionFilterCard
        options={SIGNAL_OPTIONS.map(label => ({ label }))}
        includeAll={false}
        selected={selected}
        onToggle={toggle}
      />
    </div>
  );
}
