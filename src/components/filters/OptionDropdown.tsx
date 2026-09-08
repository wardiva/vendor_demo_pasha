import type { ReactNode } from "react";
import { isAllSelected, OptionFilterCard } from "@/components/filters/FilterPrimitives";

/**
 * A filter chip's dropdown, in the pattern the Prospects page established:
 * a list of values with no Apply step. Ticking a value applies it immediately,
 * so the card holds no selection of its own and simply reflects what is
 * applied to the page.
 *
 * A group may ask for an "All" row, which the card puts directly under the
 * search field. It is not a value of its own: it is ticked exactly when every
 * value is, so picking the last one by hand ticks it and clearing any one
 * unticks it, and ticking it applies the whole list while unticking it clears
 * the group.
 */
export default function OptionDropdown({
  options,
  applied,
  onApply,
  searchPlaceholder,
  icon,
  includeAll = false,
  width,
}: {
  /** The values this filter offers, from the page's own data. */
  options: readonly string[];
  /** The values currently applied to the page. */
  applied: readonly string[];
  onApply: (values: string[]) => void;
  /** Set to put a search field above a long list. */
  searchPlaceholder?: string;
  /** A mark to draw beside an option, by option label. */
  icon?: (option: string) => ReactNode;
  /** Set to offer an "All" row above the values. */
  includeAll?: boolean;
  /** Omit for the card's default; set where the rows need more room. */
  width?: number;
}) {
  const selected = new Set(applied);
  const toggle = (label: string) => {
    /* "All" is the whole list either way — on applies every value, off leaves
       the group with none. */
    if (includeAll && label === "All") {
      onApply(isAllSelected(selected, options) ? [] : [...options]);
      return;
    }
    const next = new Set(selected);
    next.has(label) ? next.delete(label) : next.add(label);
    onApply([...next]);
  };

  return (
    /* Positioned by the chip that owns it, so it moves with the row. */
    <div data-filter-panel="" onClick={e => e.stopPropagation()}>
      <OptionFilterCard
        options={options.map(label => ({ label, icon: icon?.(label) }))}
        includeAll={includeAll}
        searchPlaceholder={searchPlaceholder}
        selected={selected}
        onToggle={toggle}
        {...(width ? { width } : {})}
      />
    </div>
  );
}
