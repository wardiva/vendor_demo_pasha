import { createContext, useContext, type ReactNode } from "react";
import type { ContactVariant } from "@/components/ContactTag";
import type { Prospect } from "@/data/prospects";
import type { ProspectSortKey } from "@/data/prospectSort";

/**
 * Prospects page toolbar state.
 *
 * The toolbar lives inside the imported page tree, so its search text and its
 * two menu actions reach it through context rather than being threaded down
 * through the layout frames.
 */
/** Card list, or the same prospects in the Signals page's table. */
export type ProspectsView = "cards" | "table";

export type ProspectsPageState = {
  /** What the toolbar's date control reads — a preset's name, or a custom
   *  range spelled out as "Aug 9  →  Sep 9". */
  dateLabel: string;
  /** True while the date picker is up, so the control can read as active. */
  dateOpen: boolean;
  search: string;
  setSearch: (value: string) => void;
  /** Prospects left after the applied filters and the toolbar search. */
  visibleCount: number;
  view: ProspectsView;
  setView: (view: ProspectsView) => void;
  onExport: () => void;
  onNotify: () => void;
  /* ── filter row ──
     The chips render their own state rather than being reached into through
     the DOM: how many options each group has applied, whether anything is
     applied at all, and the two ways to clear. */
  /** The prospects in the order the Sort control has them. */
  prospects: Prospect[];
  sort: ProspectSortKey;
  setSort: (key: ProspectSortKey) => void;
  signalsCount: number;
  contactsCount: number;
  intentCount: number;
  industryCount: number;
  hasFilters: boolean;
  clearSignals: () => void;
  clearContacts: () => void;
  clearIntent: () => void;
  clearIndustry: () => void;
  resetFilters: () => void;
  /** Applied contact types, so the panel reopens on the same selection. */
  contacts: ContactVariant[];
  /** Applied intent bands, by label. */
  intent: string[];
  /** Applied industries. */
  industries: string[];
  /** Which chip's menu is open, and the menu itself. */
  openFilter: string | null;
  renderFilterDropdown: (key: string) => ReactNode;
  closeFilter: () => void;
};

const ProspectsPageContext = createContext<ProspectsPageState>({
  dateLabel: "All Time",
  dateOpen: false,
  search: "",
  setSearch: () => {},
  visibleCount: 0,
  view: "cards",
  setView: () => {},
  onExport: () => {},
  onNotify: () => {},
  prospects: [],
  sort: "default",
  setSort: () => {},
  signalsCount: 0,
  contactsCount: 0,
  intentCount: 0,
  industryCount: 0,
  hasFilters: false,
  clearSignals: () => {},
  clearContacts: () => {},
  clearIntent: () => {},
  clearIndustry: () => {},
  resetFilters: () => {},
  contacts: [],
  intent: [],
  industries: [],
  openFilter: null,
  renderFilterDropdown: () => null,
  closeFilter: () => {},
});

export const ProspectsPageProvider = ProspectsPageContext.Provider;

export function useProspectsPage(): ProspectsPageState {
  return useContext(ProspectsPageContext);
}
