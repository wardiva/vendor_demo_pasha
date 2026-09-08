import { OptionFilterCard } from "@/components/filters/FilterPrimitives";
import { CONTACT_FILTER_OPTIONS } from "@/data/leads";
import type { ContactVariant } from "@/components/ContactTag";

/**
 * The Contacts filter's dropdown.
 *
 * Ticking a type applies it straight away — no Apply step and no footer, so
 * the panel holds no selection of its own and simply reflects what is applied
 * to the page. The options are the two contact types the prospects data
 * already carries.
 */
export default function ContactsFilterPanel({
  onApply,
  applied,
}: {
  onApply: (contacts: ContactVariant[]) => void;
  /** The contact types currently applied to the page. */
  applied: ContactVariant[];
}) {
  const byLabel = (label: string) =>
    CONTACT_FILTER_OPTIONS.find(o => o.label === label)?.value as ContactVariant;
  const selected = new Set(
    CONTACT_FILTER_OPTIONS.filter(o => applied.includes(o.value)).map(o => o.label),
  );
  const toggle = (label: string) => {
    const next = new Set(selected);
    next.has(label) ? next.delete(label) : next.add(label);
    onApply([...next].map(byLabel));
  };

  return (
    /* Positioned by the chip that owns it, so it moves with the row. */
    <div data-filter-panel="" onClick={e => e.stopPropagation()}>
      <OptionFilterCard
        options={CONTACT_FILTER_OPTIONS.map(o => ({ label: o.label }))}
        includeAll={false}
        selected={selected}
        onToggle={toggle}
      />
    </div>
  );
}
