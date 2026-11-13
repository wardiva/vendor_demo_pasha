/**
 * The HubSpot window that Connect opens, simulated for the demo.
 *
 * A real connect hands off to HubSpot's own pages in a pop-up; this draws that
 * hand-off as a window over the dialog so the flow can be walked end to end:
 * HubSpot's opening screen (create an account or sign in), the account picker,
 * the list of what Software Finder can access, then Connect app, which drops
 * the person back into our dialog connected. It never asks for a password, and
 * says in its own footer that it is a simulation.
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import svgPaths from "@/imports/BuyerActivityLeads/svg-ry772luhk7";
import CrmLogo from "./CrmLogo";
import { CRMS, DEFAULT_SETTINGS } from "./crm";
import { CloseIcon, FONT, Spinner, useEscape } from "./ui";

const HS_INK = "#33475b";
const HS_MUTED = "#516f90";
const HS_TEAL = "#03565a";
const HS_LINE = "#cbd6e2";

type Screen = "start" | "account" | "review" | "connecting";

/* Software Finder's mark, lifted from the header logo's own paths. */
export function SoftwareFinderMark({ size }: { size: number }) {
  return (
    <span className="flex shrink-0 items-center justify-center rounded-full" style={{ width: size, height: size, background: "#072929" }}>
      <svg width={size * 0.36} height={size * 0.46} viewBox="0 0 17 22" fill="none" aria-hidden>
        <path d={svgPaths.p24cc6bf0} fill="#B1FA63" />
        <path d={svgPaths.p10b6b780} fill="#B1FA63" />
      </svg>
    </span>
  );
}

function Handshake({ size }: { size: number }) {
  return (
    <div className="flex items-center justify-center gap-[18px]" aria-hidden>
      <SoftwareFinderMark size={size} />
      <span className="flex gap-[7px]">
        {[0, 1, 2].map(i => (
          <span key={i} className="size-[8px] rounded-full" style={{ background: "#8a2c0d" }} />
        ))}
      </span>
      <CrmLogo crm="hubspot" size={size * 0.9} />
    </div>
  );
}

const PillButton = ({ children, onClick, filled, disabled }: { children: string; onClick: () => void; filled?: boolean; disabled?: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`${FONT} h-[44px] w-full cursor-pointer rounded-full px-[20px] font-semibold text-[14px] transition-opacity disabled:cursor-default disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
    style={filled ? { background: HS_TEAL, color: "#fff" } : { background: "#fff", color: HS_INK, border: `1px solid ${HS_INK}` }}
  >
    {children}
  </button>
);

const ACCESS = [
  ["company", "View properties and other details about companies."],
  ["company", "Create, delete, or make changes to companies."],
  ["company", "Create, delete, or make changes to property settings for companies."],
  ["contact", "View properties and other details about contacts."],
  ["contact", "Create, delete, or make changes to contacts."],
  ["contact", "Create, delete, or make changes to property settings for contacts."],
  ["timeline", "Add events to the timelines of companies and contacts."],
] as const;

function AccessIcon({ kind }: { kind: (typeof ACCESS)[number][0] }) {
  const common = { stroke: HS_MUTED, strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden className="mt-[1px] shrink-0">
      {kind === "company" && <path d="M3 15.5V3.5h7v12M10 7h5v8.5M5.5 6.5h2M5.5 9.5h2M5.5 12.5h2M12.5 10h0M12.5 12.5h0M2 15.5h14" {...common} />}
      {kind === "contact" && (
        <>
          <rect x="3" y="2.5" width="12" height="13" rx="1.5" {...common} />
          <circle cx="9" cy="7.5" r="2" {...common} />
          <path d="M5.8 12.8c.6-1.5 1.8-2.3 3.2-2.3s2.6.8 3.2 2.3" {...common} />
        </>
      )}
      {kind === "timeline" && <path d="M4 3v12M4 5.5h9M4 9h6M4 12.5h8" {...common} />}
    </svg>
  );
}

export default function CrmAuthWindow({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const account = CRMS.hubspot.account(DEFAULT_SETTINGS);
  const [screen, setScreen] = useState<Screen>("start");
  const [picked, setPicked] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useEscape(() => {
    if (screen !== "connecting") onCancel();
  });

  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>("h1, h2")?.focus({ preventScroll: true });
  }, [screen]);

  const approve = () => {
    setScreen("connecting");
    window.setTimeout(onDone, 900);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9700] flex items-center justify-center p-[24px]" data-name="HubSpot Window">
      <div aria-hidden className="absolute inset-0" style={{ background: "rgba(20,24,30,0.28)" }} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="HubSpot"
        className="relative flex h-[min(620px,calc(100vh-48px))] w-[min(880px,calc(100vw-48px))] flex-col overflow-hidden rounded-[10px] bg-white"
        style={{ boxShadow: "0 18px 50px rgba(20,24,30,0.28), 0 2px 8px rgba(20,24,30,0.12)" }}
      >
        {/* The pop-up's own bar, so it reads as HubSpot's window rather than ours. */}
        <div className="flex h-[40px] shrink-0 items-center justify-between px-[14px]" style={{ background: "#2d3e50" }}>
          <span className={`${FONT} flex items-center gap-[8px] font-semibold text-[13px] text-white`}>
            <CrmLogo crm="hubspot" size={16} />
            HubSpot
          </span>
          {screen !== "connecting" && (
            <button type="button" aria-label="Close HubSpot window" onClick={onCancel} className="flex size-[26px] cursor-pointer items-center justify-center rounded-[6px] hover:bg-white/10">
              <span className="invert">
                <CloseIcon />
              </span>
            </button>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {screen === "start" && (
            <div className="m-auto flex w-full max-w-[420px] flex-col items-center gap-[28px] px-[24px] py-[32px] text-center">
              <Handshake size={84} />
              <h1 tabIndex={-1} className={`${FONT} m-0 font-normal leading-[32px] text-[24px] outline-none`} style={{ color: HS_INK }}>
                Connecting your <b className="font-semibold">Software Finder account</b> to <b className="font-semibold">HubSpot</b>
              </h1>
              <div className="flex w-full flex-col gap-[14px]">
                <PillButton filled onClick={() => setScreen("account")}>
                  Create a new HubSpot account
                </PillButton>
                <PillButton onClick={() => setScreen("account")}>Sign in to your HubSpot account</PillButton>
              </div>
            </div>
          )}

          {screen === "account" && (
            <div className="m-auto flex w-full max-w-[560px] flex-col items-center gap-[22px] px-[24px] py-[28px]">
              <Handshake size={56} />
              <h1 tabIndex={-1} className={`${FONT} m-0 font-normal leading-[28px] text-[20px] outline-none`} style={{ color: HS_INK }}>
                Connecting <b className="font-semibold">Software Finder</b> to <b className="font-semibold">HubSpot</b>
              </h1>
              <div className="flex w-full flex-col gap-[16px] rounded-[10px] p-[24px]" style={{ border: `1px solid ${HS_LINE}` }}>
                <div className="flex flex-col gap-[2px] border-b pb-[16px]" style={{ borderColor: HS_LINE }}>
                  <span className={`${FONT} font-medium text-[17px]`} style={{ color: HS_INK }}>
                    Software Finder Buyer Intelligence
                  </span>
                  <span className={`${FONT} text-[13px]`} style={{ color: HS_MUTED }}>
                    by softwarefinder.com
                  </span>
                </div>
                <h2 tabIndex={-1} className={`${FONT} m-0 font-medium text-[16px] outline-none`} style={{ color: HS_INK }}>
                  Choose an account
                </h2>
                <div role="radiogroup" aria-label="HubSpot accounts" className="flex flex-col">
                  <div className={`${FONT} grid grid-cols-[1fr_1fr] border-b px-[12px] pb-[8px] text-[12px]`} style={{ color: HS_MUTED, borderColor: HS_INK }}>
                    <span>Name</span>
                    <span>Details</span>
                  </div>
                  <label className="grid cursor-pointer grid-cols-[1fr_1fr] items-center px-[12px] py-[12px]" style={{ background: picked ? "#f5f8fa" : undefined }}>
                    <span className={`${FONT} flex items-center gap-[10px] text-[14px]`} style={{ color: HS_INK }}>
                      <input type="radio" name="hs-account" checked={picked} onChange={() => setPicked(true)} className="size-[16px] accent-[#33475b]" />
                      {account.name}
                    </span>
                    <span className={`${FONT} flex flex-col text-[13px]`} style={{ color: HS_INK }}>
                      atlassian.com
                      <span style={{ color: HS_MUTED }}>{account.detail.replace("Hub ID ", "")}</span>
                    </span>
                  </label>
                </div>
                <div className="w-[180px]">
                  <PillButton filled disabled={!picked} onClick={() => setScreen("review")}>
                    Choose Account
                  </PillButton>
                </div>
              </div>
            </div>
          )}

          {(screen === "review" || screen === "connecting") && (
            <div className="grid flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-[32px] px-[32px] py-[28px]">
              <div className="flex flex-col gap-[14px]">
                <div className="self-start">
                  <Handshake size={56} />
                </div>
                <h1 tabIndex={-1} className={`${FONT} m-0 font-normal leading-[30px] text-[22px] outline-none`} style={{ color: HS_INK }}>
                  Connecting <b className="font-semibold">Software Finder</b> to <b className="font-semibold">HubSpot</b>
                </h1>
                <p className={`${FONT} m-0 text-[13px]`} style={{ color: HS_MUTED }}>
                  by <span style={{ color: HS_TEAL }}>softwarefinder.com</span> · {account.name} ({account.detail.replace("Hub ID ", "")})
                </p>
              </div>
              <div className="flex min-w-0 flex-col gap-[14px]">
                <p className={`${FONT} m-0 text-[15px]`} style={{ color: HS_INK }}>
                  Review what <b className="font-semibold">Software Finder</b> can access in your HubSpot account.
                </p>
                <p className={`${FONT} m-0 font-semibold text-[14px]`} style={{ color: HS_INK }}>
                  Required <span className="font-normal" style={{ color: HS_MUTED }}>({ACCESS.length})</span>
                </p>
                <ul className="m-0 flex list-none flex-col p-0">
                  {ACCESS.map(([kind, text]) => (
                    <li key={text} className={`${FONT} flex items-start gap-[10px] border-b py-[9px] text-[13px] leading-[19px]`} style={{ color: HS_INK, borderColor: "#eaf0f6" }}>
                      <AccessIcon kind={kind} />
                      {text}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-[12px] pt-[6px]">
                  <div className="w-[160px]">
                    {screen === "connecting" ? (
                      <span className={`${FONT} flex h-[44px] items-center justify-center gap-[8px] rounded-full font-semibold text-[14px] text-white`} style={{ background: HS_TEAL }} role="status">
                        <Spinner size={14} color="#fff" />
                        Connecting
                      </span>
                    ) : (
                      <PillButton filled onClick={approve}>
                        Connect app
                      </PillButton>
                    )}
                  </div>
                  {screen === "review" && (
                    <button type="button" onClick={onCancel} className={`${FONT} cursor-pointer font-semibold text-[14px] underline-offset-2 hover:underline`} style={{ color: HS_TEAL }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <p className={`${FONT} m-0 shrink-0 border-t py-[8px] text-center text-[11px]`} style={{ color: HS_MUTED, borderColor: "#eaf0f6" }}>
          Simulated HubSpot sign-in for this demo. No HubSpot account is used.
        </p>
      </div>
    </div>,
    document.body,
  );
}
