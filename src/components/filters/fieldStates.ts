/**
 * The two treatments a toolbar field takes, in one place.
 *
 * The filter chips defined these, and the Search, Date Range and Sort controls
 * now read the same two strings, so "the styling a filter uses when it is open"
 * is literally the same declaration rather than a copy that can drift.
 *
 * What each means is the caller's business: a chip lights up when it has a
 * selection or its menu is open, Sort when an order is applied or its menu is
 * open, Search while the cursor is in it, Date Range while the calendar is up.
 */
export const FIELD_ACTIVE =
  "border border-[#b1fa63] border-solid drop-shadow-[0px_0px_2px_rgba(0,0,0,0.12)]";

export const FIELD_IDLE = "border border-[rgba(47,43,61,0.18)] border-solid";

/** The treatment for a field that is lit or not. */
export const fieldState = (lit: boolean) => (lit ? FIELD_ACTIVE : FIELD_IDLE);

/**
 * The same two values FIELD_ACTIVE sets, for markup that cannot take a class —
 * the Signals page's date field is static export markup styled from App. Keep
 * these in step with FIELD_ACTIVE above.
 */
export const FIELD_ACTIVE_BORDER = "#b1fa63";
export const FIELD_ACTIVE_SHADOW = "drop-shadow(0px 0px 2px rgba(0,0,0,0.12))";
