/**
 * Buyer Intelligence / Integrations.
 *
 * The page a buyer connects their CRM from: one API key, generated here and
 * pasted into the CRM, through which Buyer Intelligence's prospects flow into
 * it. Built from the recorded flow — the API Key Management card, the Generate
 * dialog with its expiration, the one-time Your API Key dialog with Copy, and
 * the key's row afterwards — in the Prospects page's own shell and language.
 *
 * Locked together with Prospects: the same lock state, the same frost and
 * dialog over the page, with the integration's own copy and animation.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { PageShell } from "@/imports/BuyerActivityLeads";
import IntegrationsLockedOverlay from "@/components/prospects/IntegrationsLockedOverlay";
import ProspectsPrototypeBar from "@/components/prospects/ProspectsPrototypeBar";
import { useProspectsLocked } from "@/lib/prospectsAccess";

const INK = "#2f2b3d";
const DEEP = "#072929";
const MUTED = "rgba(47,43,61,0.7)";
const HAIR = "rgba(47,43,61,0.1)";
const FONT = "font-['Inter',sans-serif]";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/* ── the key ── */

const EXPIRIES = ["Never", "1 hour", "1 day", "7 days", "30 days", "90 days"] as const;
type Expiry = (typeof EXPIRIES)[number];
const EXPIRY_MS: Record<Expiry, number | null> = {
  Never: null,
  "1 hour": 3600e3,
  "1 day": 864e5,
  "7 days": 7 * 864e5,
  "30 days": 30 * 864e5,
  "90 days": 90 * 864e5,
};

type ApiKey = { key: string; expiry: Expiry; createdAt: number; expiresAt: number | null };

const STORE = "integration-api-key";

function readKey(): ApiKey | null {
  try {
    const raw = sessionStorage.getItem(STORE);
    return raw ? (JSON.parse(raw) as ApiKey) : null;
  } catch {
    return null;
  }
}

function writeKey(k: ApiKey | null) {
  try {
    if (k) sessionStorage.setItem(STORE, JSON.stringify(k));
    else sessionStorage.removeItem(STORE);
  } catch {
    /* Storage unavailable — the key still holds for this session. */
  }
}

/** A vendor prospect key: the prefix, then 56 hex characters from the browser's own randomness. */
function makeKey(expiry: Expiry): ApiKey {
  const bytes = new Uint8Array(28);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
  const createdAt = Date.now();
  const ms = EXPIRY_MS[expiry];
  return { key: `vpk_${hex.slice(0, 8)}_${hex.slice(8)}`, expiry, createdAt, expiresAt: ms === null ? null : createdAt + ms };
}

/** The key as the list shows it: the prefix and first segment, the rest hidden, the tail kept. */
const mask = (key: string) => `${key.slice(0, 8)}••••••••${key.slice(-3)}`;

const formatDate = (ms: number) => new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/* ── icons, 1.5 stroke in the page's ink ── */

function KeyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="block">
      <circle cx="8" cy="15" r="4" stroke={INK} strokeWidth="1.5" />
      <path d="M10.8 12.2 19 4M16 7l2.5 2.5M13.5 9.5 16 12" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden className="block">
      <path d="M10 5.5c-1.4-1.2-3.4-1.6-6.5-1.5v11c3.1-.1 5.1.3 6.5 1.5 1.4-1.2 3.4-1.6 6.5-1.5V4c-3.1-.1-5.1.3-6.5 1.5Zm0 0v11" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="block">
      <path d="M4 10 10 4M5.5 4H10v4.5" stroke={DEEP} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="block transition-transform" style={{ transform: open ? "rotate(180deg)" : undefined }}>
      <path d="m4 6 4 4 4-4" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ color = DEEP, size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden className="block">
      <path d="m3.5 8.5 3 3 6-6.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="block">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke={DEEP} strokeWidth="1.4" />
      <path d="M10.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" stroke={DEEP} strokeWidth="1.4" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="block shrink-0">
      <path d="M8 2.2 14.3 13H1.7L8 2.2Z" stroke="#b7791f" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 6.3v3.2M8 11.4v.1" stroke="#b7791f" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="block shrink-0">
      <circle cx="8" cy="8" r="6" stroke={MUTED} strokeWidth="1.4" />
      <path d="M8 4.8V8l2.2 1.4" stroke={MUTED} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="block">
      <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5M6.8 7v4M9.2 7v4" stroke={MUTED} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="block">
      <path d="m4 4 8 8M12 4l-8 8" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── controls, in the page's own language ── */

/** The ink button: the locked dialog's View Plans, without the arrow. */
function InkButton({ children, onClick, disabled, busy }: { children: string; onClick?: () => void; disabled?: boolean; busy?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={busy || undefined}
      className={`${FONT} flex h-[42px] cursor-pointer items-center justify-center rounded-[12px] px-[22px] font-medium leading-[26px] text-[15px] text-white transition-colors disabled:cursor-default`}
      style={{ background: disabled ? "rgba(7,41,41,0.45)" : DEEP, boxShadow: "0px 1px 6px 0px rgba(19,17,32,0.16)" }}
    >
      {children}
    </button>
  );
}

/** The outline button, as Buy More draws it. */
function OutlineButton({ children, onClick }: { children: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${FONT} relative flex h-[42px] cursor-pointer items-center justify-center rounded-[12px] px-[22px] font-medium leading-[26px] text-[15px] transition-colors hover:bg-[rgba(7,41,41,0.04)]`}
      style={{ color: DEEP, border: `1px solid ${DEEP}` }}
    >
      {children}
    </button>
  );
}

/** A dialog over the page: the frost, and a white card at the product's radius. */
function Modal({ title, description, labelledBy, onClose, children }: { title: string; description: string; labelledBy: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return createPortal(
    <div className="fixed inset-0 z-[8000] flex items-center justify-center" data-name="Integration Dialog">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(47,43,61,0.45)" }} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="relative flex w-[560px] max-w-[calc(100vw-48px)] flex-col gap-[24px] rounded-[16px] bg-white p-[24px]"
        style={{ boxShadow: "0px 4px 18px 0px rgba(47,43,61,0.16)" }}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-[12px] top-[12px] flex size-[28px] cursor-pointer items-center justify-center rounded-[8px] transition-colors hover:bg-[rgba(7,41,41,0.06)]"
        >
          <CloseIcon />
        </button>
        <div className="flex flex-col gap-[6px] pr-[28px]">
          <h2 id={labelledBy} className={`${FONT} font-medium leading-[28px] text-[20px]`} style={{ color: INK }}>
            {title}
          </h2>
          <p className={`${FONT} leading-[21px] text-[14px]`} style={{ color: MUTED }}>
            {description}
          </p>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

/** The expiration: a field that opens the six choices beneath it, the current one ticked. */
function ExpirySelect({ value, onChange }: { value: Expiry; onChange: (v: Expiry) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);
  return (
    <div ref={root} className="relative flex flex-col gap-[8px]">
      <span id="integration-expiry-label" className={`${FONT} leading-[20px] text-[14px]`} style={{ color: INK }}>
        Expiration
      </span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby="integration-expiry-label"
        onClick={() => setOpen(o => !o)}
        className={`${FONT} flex h-[44px] w-full cursor-pointer items-center justify-between rounded-[10px] px-[14px] text-left leading-[20px] text-[14px]`}
        style={{ color: INK, border: `1px solid ${open ? "rgba(7,41,41,0.5)" : HAIR}` }}
      >
        {value}
        <ChevronIcon open={open} />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-labelledby="integration-expiry-label"
          className="absolute left-0 right-0 top-full z-10 mt-[6px] flex flex-col gap-[2px] rounded-[10px] bg-white p-[4px]"
          style={{ border: `1px solid ${HAIR}`, boxShadow: "0px 4px 18px 0px rgba(47,43,61,0.16)" }}
        >
          {EXPIRIES.map(e => {
            const selected = e === value;
            return (
              <li key={e} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(e);
                    setOpen(false);
                  }}
                  className={`${FONT} flex h-[36px] w-full cursor-pointer items-center justify-between rounded-[8px] px-[10px] text-left leading-[20px] text-[14px] transition-colors hover:bg-[rgba(7,41,41,0.06)]`}
                  style={{ color: INK, background: selected ? "rgba(7,41,41,0.06)" : undefined }}
                >
                  {e}
                  {selected && <CheckIcon />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ── the dialogs ── */

function GenerateDialog({ onCancel, onGenerate }: { onCancel: () => void; onGenerate: (expiry: Expiry) => void }) {
  const [expiry, setExpiry] = useState<Expiry>("Never");
  const [busy, setBusy] = useState(false);
  return (
    <Modal title="Generate API Key" description="Create a secure key to connect buyers to your CRM." labelledBy="integration-generate-title" onClose={onCancel}>
      <ExpirySelect value={expiry} onChange={setExpiry} />
      <div className="flex justify-end gap-[12px]">
        <OutlineButton onClick={onCancel}>Cancel</OutlineButton>
        <InkButton
          disabled={busy}
          busy={busy}
          onClick={() => {
            setBusy(true);
            /* A moment, as the real call takes one, so the key is seen to be made. */
            window.setTimeout(() => onGenerate(expiry), 650);
          }}
        >
          {busy ? "Generating…" : "Generate"}
        </InkButton>
      </div>
    </Modal>
  );
}

function KeyDialog({ apiKey, onDone }: { apiKey: ApiKey; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey.key);
    } catch {
      /* Clipboard refused — the key is still on screen to select. */
    }
    setCopied(true);
  };
  return (
    <Modal title="Your API Key" description="Copy and securely store your API key before continuing. It is displayed only once." labelledBy="integration-key-title" onClose={onDone}>
      <div className="flex flex-col gap-[12px]">
        <div className="flex items-center gap-[8px] rounded-[10px] px-[12px] py-[10px]" style={{ background: "rgba(183,121,31,0.08)" }}>
          <WarnIcon />
          <span className={`${FONT} leading-[20px] text-[13px]`} style={{ color: INK }}>
            This key grants access to your buyers. Keep it secret, and rotate it if it is ever exposed.
          </span>
        </div>
        <div className="flex items-center gap-[12px] rounded-[10px] px-[14px] py-[10px]" style={{ border: `1px solid ${HAIR}` }}>
          <code className="min-w-0 flex-1 truncate leading-[20px] text-[13px]" style={{ color: INK, fontFamily: MONO }}>
            {apiKey.key}
          </code>
          <button
            type="button"
            onClick={copy}
            className={`${FONT} flex h-[32px] shrink-0 cursor-pointer items-center gap-[6px] rounded-[8px] px-[10px] font-medium leading-[20px] text-[13px] transition-colors hover:bg-[rgba(7,41,41,0.06)]`}
            style={{ color: DEEP, border: `1px solid ${HAIR}` }}
          >
            {copied ? <CheckIcon color="#599D15" size={14} /> : <CopyIcon />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <span className={`${FONT} flex items-center gap-[6px] leading-[18px] text-[13px]`} style={{ color: MUTED }}>
          <ClockIcon />
          Expiry: {apiKey.expiresAt === null ? "Never" : formatDate(apiKey.expiresAt)}
        </span>
      </div>
      <div className="flex justify-end">
        <InkButton onClick={onDone}>Done</InkButton>
      </div>
    </Modal>
  );
}

/* ── the page ── */

/** The key's row: the list the product keeps of it, with its status and dates. */
function KeyTable({ apiKey, onDelete }: { apiKey: ApiKey; onDelete: () => void }) {
  const head = `${FONT} font-medium uppercase leading-[16px] text-[11px] tracking-[0.6px]`;
  const cell = `${FONT} leading-[20px] text-[13px]`;
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr style={{ borderBottom: `1px solid ${HAIR}` }}>
          <th scope="col" className={`${head} pb-[10px] text-left`} style={{ color: MUTED }}>
            Key
          </th>
          <th scope="col" className={`${head} pb-[10px] text-left`} style={{ color: MUTED }}>
            Status
          </th>
          <th scope="col" className={`${head} pb-[10px] text-left`} style={{ color: MUTED }}>
            Created on
          </th>
          <th scope="col" className={`${head} pb-[10px] text-left`} style={{ color: MUTED }}>
            Expires on
          </th>
          <th scope="col" className={`${head} pb-[10px] text-right`} style={{ color: MUTED }}>
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="pt-[12px]">
            <code className="leading-[20px] text-[13px]" style={{ color: INK, fontFamily: MONO }}>
              {mask(apiKey.key)}
            </code>
          </td>
          <td className="pt-[12px]">
            <span className={`${FONT} inline-flex min-w-[24px] items-center justify-center rounded-[6px] px-[10px] py-[2px] font-medium leading-[18px] text-[11px]`} style={{ background: "#C3FFC9", color: DEEP }}>
              Active
            </span>
          </td>
          <td className={`${cell} pt-[12px]`} style={{ color: INK }}>
            {formatDate(apiKey.createdAt)}
          </td>
          <td className={`${cell} pt-[12px]`} style={{ color: INK }}>
            {apiKey.expiresAt === null ? "Never" : formatDate(apiKey.expiresAt)}
          </td>
          <td className="pt-[12px] text-right">
            <button
              type="button"
              aria-label="Delete API key"
              onClick={onDelete}
              className="inline-flex size-[28px] cursor-pointer items-center justify-center rounded-[8px] transition-colors hover:bg-[rgba(7,41,41,0.06)]"
            >
              <TrashIcon />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function IntegrationContent() {
  const locked = useProspectsLocked();
  const [apiKey, setApiKey] = useState<ApiKey | null>(readKey);
  const [dialog, setDialog] = useState<"none" | "generate" | "key">("none");

  const generate = (expiry: Expiry) => {
    const k = makeKey(expiry);
    setApiKey(k);
    writeKey(k);
    setDialog("key");
  };
  const remove = () => {
    setApiKey(null);
    writeKey(null);
  };

  return (
    <div
      className="content-stretch flex flex-col gap-[20px] items-start mb-[36px] ml-[371px] mr-[71px] mt-[84px] min-w-0 relative"
      /* Locked, the column is blurred here, as the Prospects page blurs its own: see Frame63. */
      style={locked ? { filter: "blur(4px)" } : undefined}
    >
      <div className="flex flex-col gap-[2px]">
        <p className={`${FONT} font-medium leading-[46px] text-[24px] whitespace-nowrap`} style={{ color: INK }}>
          Integration
        </p>
        <p className={`${FONT} leading-[21px] text-[14px]`} style={{ color: MUTED }}>
          Connect Software Finder buyers directly to your CRM or internal systems using a secure API key.
        </p>
      </div>

      <section className="flex w-full flex-col gap-[20px] rounded-[12px] bg-white p-[24px]" style={{ border: `1px solid ${HAIR}` }} aria-labelledby="integration-api-key-title">
        <div className="flex items-start justify-between gap-[24px]">
          <div className="flex items-start gap-[16px]">
            <span className="flex size-[40px] shrink-0 items-center justify-center rounded-[10px]" style={{ background: "rgba(7,41,41,0.06)" }}>
              <KeyIcon />
            </span>
            <div className="flex flex-col gap-[4px] pt-[4px]">
              <h2 id="integration-api-key-title" className={`${FONT} font-medium leading-[26px] text-[18px]`} style={{ color: INK }}>
                API Key Management
              </h2>
              <p className={`${FONT} leading-[21px] text-[14px]`} style={{ color: MUTED }}>
                {apiKey ? "API keys are displayed only once when generated to help keep your integration secure." : "Generate a key to authenticate requests and pull your buyers into your own system."}
              </p>
            </div>
          </div>
          <InkButton onClick={() => setDialog("generate")}>{apiKey ? "Regenerate API Key" : "Generate API Key"}</InkButton>
        </div>
        {apiKey && <KeyTable apiKey={apiKey} onDelete={remove} />}
      </section>

      <div className="flex w-full items-center justify-between gap-[24px] rounded-[12px] bg-white px-[24px] py-[16px]" style={{ border: `1px solid ${HAIR}` }}>
        <span className="flex items-center gap-[12px]">
          <BookIcon />
          <span className={`${FONT} leading-[21px] text-[14px]`} style={{ color: INK }}>
            New to the API? Learn how to authenticate and sync buyers into your CRM.
          </span>
        </span>
        <a
          href="#api-documentation"
          onClick={e => e.preventDefault()}
          className={`${FONT} flex shrink-0 items-center gap-[6px] font-medium leading-[21px] text-[14px]`}
          style={{ color: DEEP }}
        >
          View API Documentation
          <ArrowOutIcon />
        </a>
      </div>

      {dialog === "generate" && <GenerateDialog onCancel={() => setDialog("none")} onGenerate={generate} />}
      {dialog === "key" && apiKey && <KeyDialog apiKey={apiKey} onDone={() => setDialog("none")} />}

      {/* The review control, with only its lock here: the Prospects / Empty state
          switch has nothing to switch on this page. */}
      <ProspectsPrototypeBar lockOnly />
    </div>
  );
}

export default function BuyerActivityIntegrations() {
  const locked = useProspectsLocked();
  return (
    <PageShell name="Buyer Activity / Integrations" active="integrations" locked={locked} lock={<IntegrationsLockedOverlay />}>
      <IntegrationContent />
    </PageShell>
  );
}
