import { OptionFilterCard } from "@/components/filters/FilterPrimitives";
import { LEAD_SIGNAL_OPTIONS, type LeadSignalOption } from "@/data/leads";

/**
 * Prospects page Signals filter panel.
 *
 * One level: the Signals options are the panel. Ticking an option applies it
 * straight away — the card has no Apply step and no footer, so the panel holds
 * no selection of its own and simply reflects what is applied to the page.
 */

/**
 * Every option, on every host.
 *
 * Profile Signals and Pricing Signals used to be filtered out of this list
 * locally, because their cards were. The rule was sound — each card's avatar
 * stack opens the option of the same name, and an option for a card that is
 * not on screen is a dead end — but the cards are now drawn everywhere, so
 * the gate would invert it: the option would be missing on exactly the host
 * where the card sits above it asking to be clicked.
 */
const SIGNAL_OPTIONS: LeadSignalOption[] = [...LEAD_SIGNAL_OPTIONS];

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
