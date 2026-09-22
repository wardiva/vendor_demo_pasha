import { useState } from "react";
import {
  REVEAL_EXPERIENCES,
  REVEAL_EXPERIENCE_LABELS,
  useRevealExperience,
} from "@/context/RevealExperienceContext";
import { COMPANY_REVEAL_PLANS, type CompanyRevealPlan } from "@/context/CompanyRevealContext";

/**
 * The Contact Reveal comparison switch — a test control, not product UI.
 *
 * Fixed to the viewport, bottom-left, so it never collides with the
 * Prospects page's own prototype tabs (bottom-right). Picking an experience
 * swaps the reveal presentation everywhere it appears — Signals cards,
 * Prospects cards, and the Prospect Details modal's Contacts tab all read the
 * same selection, which is what lets the eight concepts be compared on the
 * same data instead of eight separate demos.
 *
 * "Current" is the original per-contact experience, preserved exactly as it
 * shipped. It is the default, so nothing about the product's existing
 * behaviour changes unless this switch is touched.
 */
export default function RevealExperienceSwitcher() {
  const { experience, setExperience, plan, setPlan, simulateNoReveals, setSimulateNoReveals } =
    useRevealExperience();
  const [open, setOpen] = useState(false);

  return (
    <div
      className="fixed bottom-[24px] left-[24px] z-[9000] flex flex-col items-start gap-[8px]"
      data-name="Reveal Experience Switch"
      data-prototype-bar
    >
      {open && (
        <div
          className="flex w-[280px] flex-col gap-[10px] rounded-[12px] bg-white p-[12px] font-['Inter',sans-serif]"
          style={{ border: "1px solid rgba(47,43,61,0.14)", boxShadow: "0px 8px 28px 0px rgba(47,43,61,0.2)" }}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-[rgba(47,43,61,0.5)]">
            Contact reveal experience
          </p>
          <div className="flex flex-col gap-[2px]">
            {REVEAL_EXPERIENCES.map(key => {
              const active = key === experience;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setExperience(key)}
                  className={`cursor-pointer rounded-[7px] px-[10px] py-[6px] text-left text-[12px] leading-[16px] transition-colors ${
                    active
                      ? "bg-[#072929] font-medium text-white"
                      : "font-normal text-[#2f2b3d] hover:bg-[rgba(7,41,41,0.06)]"
                  }`}
                >
                  {REVEAL_EXPERIENCE_LABELS[key]}
                </button>
              );
            })}
          </div>

          <div className="mt-[2px] flex items-center justify-between border-t border-[rgba(47,43,61,0.1)] pt-[10px]">
            <span className="text-[11px] text-[rgba(47,43,61,0.6)]">Plan</span>
            <select
              value={plan}
              onChange={e => setPlan(e.target.value as CompanyRevealPlan)}
              className="cursor-pointer rounded-[6px] border border-[rgba(47,43,61,0.18)] bg-white px-[6px] py-[3px] text-[12px] text-[#2f2b3d]"
            >
              {Object.entries(COMPANY_REVEAL_PLANS).map(([name, total]) => (
                <option key={name} value={name}>
                  {name} · {total}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-[8px]">
            <span className="text-[11px] text-[rgba(47,43,61,0.6)]">Simulate 0 reveals left</span>
            <input
              type="checkbox"
              checked={simulateNoReveals}
              onChange={e => setSimulateNoReveals(e.target.checked)}
              className="cursor-pointer"
            />
          </label>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="cursor-pointer rounded-[10px] bg-white px-[12px] py-[8px] font-['Inter',sans-serif] text-[13px] font-medium text-[#072929]"
        style={{ border: "1px solid rgba(47,43,61,0.18)", boxShadow: "0px 4px 18px 0px rgba(47,43,61,0.16)" }}
        title="Contact reveal experience — local only"
      >
        Reveal UX: {REVEAL_EXPERIENCE_LABELS[experience]}
      </button>
    </div>
  );
}
