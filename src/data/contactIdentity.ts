/**
 * Contact details completed from what a record already carries.
 *
 * The dataset grew up disclosing one channel per contact — a verified contact
 * had a phone and no email, an AI-recommended one an email and no phone — and
 * the cards and the modal now show both for everybody. Rather than hand-write
 * a second value onto forty-odd records, each is derived from the record's own
 * name and its company's own domain, so every contact has both, the two always
 * agree with the person they belong to, and a prospect added later is complete
 * the moment it is added.
 *
 * An explicit value on a record always wins; these only fill a gap.
 */

/** "Tobias Engström" -> "tobias.engstrom". Accents folded, so the address is
 *  writable — and every separator collapses to the single dot the existing
 *  addresses in this dataset use. */
export function emailSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "");
}

/** "Elena Vasquez" at "meridiansupply.com" -> "elena.vasquez@meridiansupply.com". */
export function deriveEmail(name: string, domain: string): string {
  const host = (domain || "").trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!name || !host) return "";
  return `${emailSlug(name)}@${host}`;
}

/* The area codes already in the dataset, so a generated number sits in the
   same range as the ones that were written by hand. */
const AREA_CODES = [
  "212", "206", "312", "503", "510", "628", "646", "704", "737", "858", "917", "919",
];

/** A stable number for a name — the same input always gives the same line. */
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * A direct line in the dataset's own shape: "+1 XXX-555-NNNN".
 *
 * 555 is the range reserved for fiction, which is what every number written
 * into this dataset by hand already uses, so a derived one cannot collide with
 * a real subscriber.
 */
export function derivePhone(seed: string): string {
  if (!seed) return "";
  const h = hash(seed);
  const area = AREA_CODES[h % AREA_CODES.length];
  const line = String(h % 10000).padStart(4, "0");
  return `+1 ${area}-555-${line}`;
}
