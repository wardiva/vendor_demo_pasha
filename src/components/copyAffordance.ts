/**
 * Clipboard helpers behind the copy control on an email or phone value.
 *
 * The control itself is rendered by CopyableValue; this module only performs
 * the copy and confirms it. Both glyphs are already in the DOM, so confirming
 * is a class toggle rather than a rewrite of the button's contents.
 */

/**
 * Copies a value, falling back to a hidden textarea when the async clipboard
 * is unavailable — it is rejected when the document is not focused. Returns
 * whether the copy actually landed, so success is never reported falsely.
 */
export async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.top = "0";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied;
  } catch {
    return false;
  }
}

/** How long the tick stays up before the copy glyph returns. */
const COPIED_HOLD = 1200;

/** Shows the tick briefly after a successful copy. */
export function flashCopied(row: HTMLElement) {
  const btn = row.querySelector<HTMLElement>(".lead-copy-btn");
  if (!btn) return;
  btn.classList.add("is-copied");
  window.setTimeout(() => btn.classList.remove("is-copied"), COPIED_HOLD);
}
