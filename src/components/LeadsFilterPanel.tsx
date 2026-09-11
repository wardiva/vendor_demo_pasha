import { OptionFilterCard } from "@/components/filters/FilterPrimitives";
import { LEAD_SIGNAL_OPTIONS, type LeadSignalOption } from "@/data/leads";
import { IS_LOCAL } from "@/lib/environment";

/**
 * Prospects page Signals filter panel.
 *
 * One level: the Signals options are the panel. Ticking an option applies it
 * straight away — the card has no Apply step and no footer, so the panel holds
 * no selection of its own and simply reflects what is applied to the page.
 */

/**
 * The two page-signal options travel with their cards. On the Signals page,
 * Profile Signals and Pricing Signals are held back on local hosts; each of
 * those cards' avatar stacks opens the option of the same name here, and an
 * option for a card that is not on screen is a dead end. So the same gate
 * takes the two options off this list locally and leaves them on the
 * deployment, where the cards are. Nothing is removed beneath: the options
 * stay in LEAD_SIGNAL_OPTIONS and their matching rule stays in `leads`, so a
 * selection arriving from a card on the deployment still filters as before.
 */
const HELD_LOCALLY: readonly LeadSignalOption[] = ["Profile Signals", "Pricing Signals"];

const SIGNAL_OPTIONS: LeadSignalOption[] = LEAD_SIGNAL_OPTIONS.filter(
  option => !(IS_LOCAL && HELD_LOCALLY.includes(option)),
);

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
