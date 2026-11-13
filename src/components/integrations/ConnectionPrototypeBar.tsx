/**
 * The CRM page's prototype switch: a review control, not product UI.
 *
 * Two icons pinned to the right edge of the window that flip the connection
 * between healthy and expired, so the reconnect state can be shown without
 * waiting for a real token to lapse. It sets only the connection's `expired`
 * flag; reconnecting through the product clears it the same way.
 *
 * Drawn exactly as the Prospects page's switch (ProspectsPrototypeBar): a white
 * well at radius 12 with a hairline and the floating shadow, the chosen icon on
 * a filled ink tile, the product's tooltip naming each one beside it.
 */

import { createPortal } from "react-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const OPTIONS = [
  { expired: false, label: "Connected" },
  { expired: true, label: "Connection expired (simulated)" },
] as const;

/** 16px on a 1.5 stroke: a ticked circle, and a circle with a warning mark. */
function Glyph({ expired }: { expired: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      {expired ? (
        <path d="M8 5v3.5M8 10.9v.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      ) : (
        <path d="m5.6 8.2 1.6 1.6 3.2-3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export default function ConnectionPrototypeBar({ expired, onChange }: { expired: boolean; onChange: (expired: boolean) => void }) {
  return createPortal(
    <div
      className="fixed right-[24px] top-1/2 z-[9000] flex -translate-y-1/2 flex-col gap-[2px] rounded-[12px] bg-white p-[4px]"
      data-name="Connection Prototype Switch"
      data-prototype-bar
      role="tablist"
      aria-orientation="vertical"
      aria-label="Prototype connection state"
      style={{
        border: "1px solid rgba(47,43,61,0.18)",
        boxShadow: "0px 4px 18px 0px rgba(47,43,61,0.16)",
      }}
    >
      {OPTIONS.map(o => {
        const active = o.expired === expired;
        return (
          <Tooltip key={o.label}>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={o.label}
                  onClick={() => onChange(o.expired)}
                  className={`flex size-[36px] cursor-pointer items-center justify-center rounded-[9px] transition-colors ${
                    active ? "bg-[#072929] text-white" : "text-[#2f2b3d] hover:bg-[rgba(7,41,41,0.06)]"
                  }`}
                />
              }
            >
              <Glyph expired={o.expired} />
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={14}>
              {o.label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>,
    document.body,
  );
}
