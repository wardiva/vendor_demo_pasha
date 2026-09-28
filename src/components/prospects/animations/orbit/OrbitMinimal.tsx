import MinimalField from "./MinimalField";
import MinimalLedger from "./MinimalLedger";
import ProspectCards from "./ProspectCards";

/**
 * Variation 1 — Original Background.
 *
 * The current direction is prospect cards and a cursor (ProspectCards). The
 * earlier minimal directions are kept for comparison; a review session can
 * switch with `v1-direction` in session storage: carry · flick · ledger · field.
 */
export default function OrbitMinimal() {
  let d = "carry";
  try {
    d = sessionStorage.getItem("v1-direction") ?? "carry";
  } catch {
    /* Storage unavailable — the default direction stands. */
  }
  if (d === "ledger") return <MinimalLedger />;
  if (d === "field") return <MinimalField />;
  return <ProspectCards mode={d === "flick" ? "flick" : "carry"} />;
}
