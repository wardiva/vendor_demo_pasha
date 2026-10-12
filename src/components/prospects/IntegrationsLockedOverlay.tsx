/**
 * The locked Integrations tab.
 *
 * The same lock as the Prospects tab — the one dialog, the one frost, the one
 * "View Plans" — with the integration's own words and its own animation in the
 * gradient panel: the key generated, copied, pasted into the CRM, and the
 * prospects arriving there. Locked and unlocked together with Prospects.
 */

import { BuyerIntelligenceLockedDialog } from "./ProspectsLockedOverlayV3";
import ConnectCrm from "./animations/orbit/ConnectCrm";

/** Eight lines, as the Prospects dialog has, so the two dialogs stand the same height. */
const FEATURES = [
  "Secure API key generation",
  "Prospects synced to your CRM in real time",
  "Company-level buyer intent contacts*",
  "Buyer intent score on every prospect",
  "Key expiration and rotation controls",
  "Webhooks and polling endpoints",
  "CSV export and API integration",
  "Full API documentation and support",
] as const;

export default function IntegrationsLockedOverlay() {
  return (
    <BuyerIntelligenceLockedDialog
      name="Integrations / Locked — Final"
      titleId="integrations-locked-title"
      title="Unlock Integrations"
      subtitle="Sync your prospects straight into your CRM."
      features={FEATURES}
    >
      <ConnectCrm />
    </BuyerIntelligenceLockedDialog>
  );
}
