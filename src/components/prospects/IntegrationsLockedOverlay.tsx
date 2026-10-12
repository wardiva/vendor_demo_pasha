/**
 * The locked Integrations tab.
 *
 * The same lock as the Prospects tab — the one dialog, the one frost, the one
 * "See Plans" — with the integration's own words and its own animation in the
 * gradient panel: the key generated, copied, pasted into the CRM, and the
 * prospects arriving there. Locked and unlocked together with Prospects.
 */

import { BuyerIntelligenceLockedDialog } from "./ProspectsLockedOverlayV3";
import ConnectCrm from "./animations/orbit/ConnectCrm";

const FEATURES = [
  "Generate secure keys for API integrations",
  "Sync prospects automatically to your CRM in real-time",
  "View complete prospect profile details",
  "Eliminate manual data entry",
  "Enable your team to act on prospects instantly",
  "Timely convert high intent prospects into conversions",
] as const;

export default function IntegrationsLockedOverlay() {
  return (
    <BuyerIntelligenceLockedDialog
      name="Integrations / Locked — Final"
      titleId="integrations-locked-title"
      title="Unlock Integrations"
      subtitle="Send prospect data where you need it"
      features={FEATURES}
      footnote={null}
      cta="See Plans"
    >
      <ConnectCrm />
    </BuyerIntelligenceLockedDialog>
  );
}
