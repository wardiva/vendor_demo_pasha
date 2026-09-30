import { setLockedAnimation, useLockedAnimation } from "@/lib/prospectsAccess";
import { LOCKED_ANIMATIONS } from "./animations";
import VariationHistory from "./VariationHistory";

/**
 * The version history for the Locked V2 dialog's animation — a review
 * control, not product UI. Only while Locked V2 shows.
 */
export default function LockedAnimationBar() {
  const current = useLockedAnimation();
  return (
    <VariationHistory
      title="History — Variations of Locked V2 Animation"
      label="Locked V2 animation"
      items={LOCKED_ANIMATIONS}
      current={current}
      onSelect={setLockedAnimation}
      storageKey="locked-animation-bar"
      marker="data-locked-animation-bar"
    />
  );
}
