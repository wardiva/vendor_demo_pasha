import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_ANALYTICS, type SignalsAnalytics } from "@/data/signals";

/**
 * The Signals page is a deeply nested tree generated from the Figma import, so
 * the analytics cards read their data from context rather than having props
 * threaded through a dozen intermediate layout frames.
 *
 * Defaults to the unfiltered aggregate, which keeps the imported page usable
 * on its own (e.g. in isolation or a snapshot) without a provider.
 */
const SignalsAnalyticsContext = createContext<SignalsAnalytics>(DEFAULT_ANALYTICS);

export const SignalsAnalyticsProvider = SignalsAnalyticsContext.Provider;

export function useSignalsAnalytics(): SignalsAnalytics {
  return useContext(SignalsAnalyticsContext);
}

/* ─────────────────────── filter row ─────────────────────── */

/**
 * The Signals filter row's state. The chips render their own active state and
 * count from here rather than being reached into through the DOM, and clearing
 * runs back through the page's existing filter state.
 */
export type SignalsFiltersState = {
  counts: {
    activity: number;
    techStack: number;
    location: number;
    companySize: number;
    competitor: number;
  };
  hasFilters: boolean;
  clearAll: () => void;
  /** Which chip's menu is open, and the menu itself. */
  openChip: string | null;
  renderDropdown: (key: string) => ReactNode;
  closeChip: () => void;
};

const EMPTY_COUNTS = {
  activity: 0,
  techStack: 0,
  location: 0,
  companySize: 0,
  competitor: 0,
};

const SignalsFiltersContext = createContext<SignalsFiltersState>({
  counts: EMPTY_COUNTS,
  hasFilters: false,
  clearAll: () => {},
  openChip: null,
  renderDropdown: () => null,
  closeChip: () => {},
});

export const SignalsFiltersProvider = SignalsFiltersContext.Provider;

export function useSignalsFilters(): SignalsFiltersState {
  return useContext(SignalsFiltersContext);
}

/* ─────────────────────── leads table ─────────────────────── */

export type LeadsTableState = {
  /** True when the applied filters match none of the table's rows. */
  isEmpty: boolean;
  onReset: () => void;
  /** Default body height, so the no-results state holds the table's full size. */
  emptyMinHeight?: number;
  /** Which rows survive the applied filters, in row order. */
  visibility: Record<string, boolean>;
  /** Opens the Company or Contact detail modal for a row. */
  onSelectRow: (id: string) => void;
  /** Row ids in display order; omitted, the table keeps the dataset's own. */
  order?: string[];
};

const LeadsTableContext = createContext<LeadsTableState>({
  isEmpty: false,
  onReset: () => {},
  emptyMinHeight: 0,
  /* Empty means "nothing filtered out" — the table reads a row as hidden only
     on an explicit false, so the imported page still renders on its own. */
  visibility: {},
  onSelectRow: () => {},
});

export const LeadsTableProvider = LeadsTableContext.Provider;

export function useLeadsTable(): LeadsTableState {
  return useContext(LeadsTableContext);
}
