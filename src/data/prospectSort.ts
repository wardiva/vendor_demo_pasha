import { PROSPECTS, type Prospect } from "@/data/prospects";

/**
 * The Sort control's orders.
 *
 * Every one of these reads a field the prospects data already carries, so
 * sorting is a reordering of the same records the filters work on — nothing
 * here is derived or stored separately.
 */
/**
 * "default" is the dataset's own order — the state the control starts in. It
 * is not offered in the menu: the two the menu lists are the date orders, and
 * until one is picked nothing is selected.
 */
export type ProspectSortKey = "default" | "dateDesc" | "dateAsc";

export const PROSPECT_SORTS: { key: ProspectSortKey; label: string }[] = [
  { key: "dateDesc", label: "Newest First" },
  { key: "dateAsc", label: "Oldest First" },
];

/* The card's date is the display string the data ships; Date.parse reads it
   directly, and equal dates keep their original order. */
const COMPARATORS: Record<Exclude<ProspectSortKey, "default">, (a: Prospect, b: Prospect) => number> = {
  dateDesc: (a, b) => Date.parse(b.date) - Date.parse(a.date),
  dateAsc: (a, b) => Date.parse(a.date) - Date.parse(b.date),
};

/** The prospects in the chosen order. "default" is the dataset's own order. */
export function sortProspects(key: ProspectSortKey): Prospect[] {
  if (key === "default") return PROSPECTS;
  return [...PROSPECTS].sort(COMPARATORS[key]);
}
