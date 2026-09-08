/**
 * Reveal mechanics shared by the Leads page contact cards and the Recommended
 * Contacts inside the Company Info modal, so both run one implementation.
 */

/** Time the button spends in its loading state before the reveal lands. */
export const REVEAL_DELAY = 850;

/**
 * Swaps the eye icon for a spinner while a reveal is processing. The label
 * stays put and the spinner occupies the icon's existing slot, so the button
 * keeps its width and nothing reflows. Returns a restore.
 *
 * The Leads card ships an inline `<svg>` eye and the modal card an `<img>`,
 * so both are accepted — svg first, matching the imported markup.
 */
export function showButtonLoader(btn: HTMLElement): () => void {
  const icon = (btn.querySelector("svg") ?? btn.querySelector("img")) as HTMLElement | null;
  const slot = icon?.parentElement as HTMLElement | undefined;
  btn.dataset.loading = "true";

  if (!icon || !slot) return () => delete btn.dataset.loading;

  const prevDisplay = icon.style.display;
  icon.style.display = "none";

  const spinner = document.createElement("span");
  spinner.className = "lead-reveal-spinner";
  slot.appendChild(spinner);

  return () => {
    spinner.remove();
    icon.style.display = prevDisplay;
    delete btn.dataset.loading;
  };
}
