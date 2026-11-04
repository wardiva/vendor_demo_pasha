/**
 * Which rail module and side-nav page are selected. App owns it; the rail and
 * the side nav read it, so both draw the same selection on every page.
 *
 * Buyer Intelligence's own pages (Signals, Buyers, Integrations) are real
 * pages and keep being chosen by App's `page`; every other module's pages are
 * placeholders, shown as an empty page.
 */

import { createContext, useContext } from "react";

export const BUYER_INTELLIGENCE = "Buyer Intelligence";

export type NavSelection = { module: string; item: string };

const NavSelectionContext = createContext<NavSelection>({ module: BUYER_INTELLIGENCE, item: "" });

export const NavSelectionProvider = NavSelectionContext.Provider;

export function useNavSelection(): NavSelection {
  return useContext(NavSelectionContext);
}
