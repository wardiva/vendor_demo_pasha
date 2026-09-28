import { useSyncExternalStore } from "react";

/**
 * Whether the Prospects tab is open to this account, or locked behind a plan.
 *
 * A review state, not an entitlement check: the product has no plans wired in
 * yet, so this decides which of the two designs the Prospects tab shows —
 * the working page, or the locked one from Figma 61:1394 — and nothing more.
 *
 * It lives outside React because two unrelated trees read it: the drawer, which
 * puts a crown on the Prospects row, and the Prospects page, which draws the
 * lock over itself. Both subscribe here, so they can never disagree about
 * which state the tab is in.
 *
 * Unlocked by default, so nothing about the shipped page changes until someone
 * asks to see the lock. Remembered for the tab session, so a reload while
 * reviewing comes back where it was.
 */

/* "locked-v2" is the locked design (Figma 64:7354). The first locked design,
   "locked" (Figma 61:1394), has been retired; a session that still remembers
   it opens unlocked. */
export type ProspectsAccess = "unlocked" | "locked-v2";

const KEY = "prospects-access";

let current: ProspectsAccess = (() => {
  try {
    const saved = sessionStorage.getItem(KEY);
    return saved === "locked-v2" ? saved : "unlocked";
  } catch {
    return "unlocked";
  }
})();

const listeners = new Set<() => void>();

export function setProspectsAccess(next: ProspectsAccess) {
  if (next === current) return;
  current = next;
  try {
    sessionStorage.setItem(KEY, next);
  } catch {
    /* Storage unavailable — the choice still holds for this session. */
  }
  listeners.forEach(fn => fn());
}

export function useProspectsAccess(): ProspectsAccess {
  return useSyncExternalStore(
    fn => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => current,
    () => "unlocked",
  );
}

export const useProspectsLocked = () => useProspectsAccess() !== "unlocked";

/**
 * Which animation the Locked V2 dialog plays in its right-hand panel — the
 * final animation ("o15") by default, or one of the variations kept beside it
 * in the history for comparison. Remembered for the tab session, like the lock.
 */
export type LockedAnimation = "o15" | "o13" | "o14" | "a5" | "o6" | "o1";

const ANIM_KEY = "locked-v2-animation";
const ANIMS: readonly LockedAnimation[] = ["o15", "o13", "o14", "a5", "o6", "o1"];

let animation: LockedAnimation = (() => {
  try {
    const saved = sessionStorage.getItem(ANIM_KEY) as LockedAnimation | null;
    return saved && ANIMS.includes(saved) ? saved : "o15";
  } catch {
    return "o15";
  }
})();

const animListeners = new Set<() => void>();

export function setLockedAnimation(next: LockedAnimation) {
  if (next === animation) return;
  animation = next;
  try {
    sessionStorage.setItem(ANIM_KEY, next);
  } catch {
    /* Storage unavailable — the choice still holds for this session. */
  }
  animListeners.forEach(fn => fn());
}

export function useLockedAnimation(): LockedAnimation {
  return useSyncExternalStore(
    fn => {
      animListeners.add(fn);
      return () => animListeners.delete(fn);
    },
    () => animation,
    () => "o15",
  );
}
