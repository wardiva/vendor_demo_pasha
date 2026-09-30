import { useSyncExternalStore } from "react";

/**
 * Whether the Prospects tab is locked behind Buyer Intelligence — the Locked
 * V3 design (ProspectsLockedOverlayV3) over the page — or open, showing the
 * prospects themselves.
 *
 * A review state, not an entitlement check: the product has no plans wired in,
 * so "View Plans" on the locked dialog simply opens the tab, and the review
 * control beside the page locks it again. It lives outside React because two
 * unrelated trees read it — the drawer, which puts a crown on the Prospects
 * row, and the Prospects page, which draws the lock over itself — and they
 * must never disagree. Locked by default, and remembered for the tab session
 * so a reload comes back to the same state.
 */

const KEY = "prospects-access";

let locked: boolean = (() => {
  try {
    return sessionStorage.getItem(KEY) !== "unlocked";
  } catch {
    return true;
  }
})();

const listeners = new Set<() => void>();

export function setProspectsLocked(next: boolean) {
  if (next === locked) return;
  locked = next;
  try {
    sessionStorage.setItem(KEY, next ? "locked" : "unlocked");
  } catch {
    /* Storage unavailable — the choice still holds for this session. */
  }
  listeners.forEach(fn => fn());
}

export function useProspectsLocked(): boolean {
  return useSyncExternalStore(
    fn => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => locked,
    () => true,
  );
}
