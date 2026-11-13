/**
 * Buyer Intelligence / Integrations.
 *
 * Three ways to get buyers out of Software Finder, as three cards: HubSpot and
 * Salesforce, each connected through its own setup flow, and API Access, the
 * key the page has always generated. The API key's flow is unchanged — the
 * Generate dialog with its expiration, the one-time Your API Key dialog with
 * Copy, and the key's row — and now opens from its card.
 *
 * Locked together with Prospects: the same lock state, the same frost and
 * dialog over the page, with the integration's own copy and animation.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { PageShell } from "@/imports/BuyerActivityLeads";
import IntegrationsLockedOverlay from "@/components/prospects/IntegrationsLockedOverlay";
import { useProspectsLocked } from "@/lib/prospectsAccess";
import ConnectPanel from "@/components/integrations/ConnectPanel";
import CrmPage from "@/components/integrations/CrmPage";
import ConnectionPrototypeBar from "@/components/integrations/ConnectionPrototypeBar";
import CrmLogo from "@/components/integrations/CrmLogo";
import { CRMS, fieldsToCreate, FREQUENCY, readConnection, timeAgo, writeConnection, type Connection, type CrmId, type RunRecord, type SectionId, type SyncRun } from "@/components/integrations/crm";
import {
  ArrowOutIcon,
  DocsIcon,
  CheckIcon,
  ChevronIcon,
  Chip,
  CloseIcon,
  ClockIcon,
  CopyIcon,
  DEEP,
  FONT,
  HAIR,
  INK,
  InkButton,
  KeyIcon,
  Modal,
  MONO,
  MUTED,
  OutlineButton,
  Spinner,
  SUCCESS,
  TrashIcon,
  WarnIcon,
} from "@/components/integrations/ui";

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

/** `name` is the connection's own label (the meeting's "connection pointer"), so a team can tell its keys apart. */
type ApiKey = { key: string; name: string; expiry: Expiry; createdAt: number; expiresAt: number | null };

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
function makeKey(name: string, expiry: Expiry): ApiKey {
  const bytes = new Uint8Array(28);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
  const createdAt = Date.now();
  const ms = EXPIRY_MS[expiry];
  return { key: `vpk_${hex.slice(0, 8)}_${hex.slice(8)}`, name: name.trim() || "API connection", expiry, createdAt, expiresAt: ms === null ? null : createdAt + ms };
}

/** The key as the list shows it: the prefix and first segment, the rest hidden, the tail kept. */
const mask = (key: string) => `${key.slice(0, 8)}••••••••${key.slice(-3)}`;

const formatDate = (ms: number) => new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

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

/* ── the key's dialogs ── */

function GenerateDialog({ onCancel, onGenerate }: { onCancel: () => void; onGenerate: (name: string, expiry: Expiry) => void }) {
  const [expiry, setExpiry] = useState<Expiry>("Never");
  const [busy, setBusy] = useState(false);
  return (
    <Modal title="Generate API Key" description="Use it to pull buyers into your own systems." labelledBy="integration-generate-title" onClose={onCancel}>
      <ExpirySelect value={expiry} onChange={setExpiry} />
      <div className="flex justify-end gap-[12px]">
        <OutlineButton onClick={onCancel}>Cancel</OutlineButton>
        <InkButton
          disabled={busy}
          busy={busy}
          onClick={() => {
            setBusy(true);
            /* A moment, as the real call takes one, so the key is seen to be made. */
            window.setTimeout(() => onGenerate("", expiry), 650);
          }}
        >
          {busy ? "Generating…" : "Generate API Key"}
        </InkButton>
      </div>
    </Modal>
  );
}

function KeyDialog({ apiKey, onDone }: { apiKey: ApiKey; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
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
  /*
   * The live vendor portal's RevealApiKeyModal, matched exactly: no subtitle, one
   * notice with a grey warning triangle, the whole key (wrapping, never cut off)
   * with a plain-text Copy, then the expiry with a calendar. It stays open on
   * outside click and Escape, so the key can't be dismissed before it's copied.
   */
  return (
    <Modal title="Your API Key" labelledBy="integration-key-title" onClose={onDone} width={700} dismissible={false}>
      <div className="flex flex-col gap-[8px] pt-[8px]">
        <div className="mb-[24px] flex items-center gap-[8px] rounded-[12px] p-[12px]" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden className="block shrink-0">
            <path d="M11 7.33398V10.8004" stroke="#827D8B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 14.2441L11 14.2877" stroke="#827D8B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path
              d="M4.58197 17.4165H17.4153C18.0226 17.4122 18.5884 17.1075 18.9262 16.6027C19.2639 16.0979 19.3297 15.4587 19.102 14.8956L12.5936 3.66648C12.2707 3.0829 11.6564 2.7207 10.9895 2.7207C10.3225 2.7207 9.70818 3.0829 9.3853 3.66648L2.87697 14.8956C2.65366 15.4454 2.71024 16.0692 3.02881 16.5698C3.34738 17.0705 3.88854 17.3859 4.48113 17.4165"
              stroke="#827D8B"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className={`${FONT} leading-[20px] text-[14px]`} style={{ color: "#585164" }}>
            Copy and securely store your API key before continuing. It is displayed only once
          </p>
        </div>
        <div className="flex items-center justify-between gap-[12px] rounded-[12px] bg-white px-[16px] py-[12px]" style={{ border: "1px solid rgba(0,0,0,0.1)" }}>
          <span className={`${FONT} min-w-0 break-all font-medium leading-[20px] text-[14px]`} style={{ color: INK }}>
            {apiKey.key}
          </span>
          <button
            type="button"
            onClick={copy}
            className={`${FONT} flex shrink-0 cursor-pointer items-center gap-[6px] rounded-[6px] p-[2px] font-medium leading-[20px] text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072929]`}
            style={{ color: DEEP }}
          >
            {copied ? <CheckIcon color="#599D15" size={16} /> : <CopyIcon />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="flex items-center gap-[8px]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="block shrink-0">
            <circle cx="8" cy="8" r="6" stroke="#6D6777" strokeWidth="1.5" />
            <path d="M8 5v3l2 1.33" stroke="#6D6777" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className={`${FONT} leading-[22px] text-[15px]`} style={{ color: "rgba(47,43,61,0.7)" }}>
            Expiry:{" "}
            <span style={{ color: INK }}>
              {apiKey.expiresAt === null
                ? "Never"
                : (() => {
                    /* The live format: "11 Nov 2026 at 14:05". */
                    const d = new Date(apiKey.expiresAt);
                    const day = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                    const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
                    return `${day} at ${time}`;
                  })()}
            </span>
          </p>
        </div>
      </div>
      <div className="mt-[8px] flex justify-end">
        <InkButton onClick={onDone}>Done</InkButton>
      </div>
    </Modal>
  );
}

/** The live product's delete confirmation, word for word. */
function DeleteKeyDialog({ onCancel, onDelete }: { onCancel: () => void; onDelete: () => void }) {
  return (
    <Modal title="Delete API Key" labelledBy="integration-delete-title" onClose={onCancel} width={600}>
      <p className={`${FONT} leading-[22px] text-[15px]`} style={{ color: INK }}>
        Deleting this API key will stop any integration using it. Once deleted, this change cannot be reversed.
      </p>
      <div className="flex justify-end gap-[12px]">
        <OutlineButton onClick={onCancel}>Cancel</OutlineButton>
        <button
          type="button"
          onClick={onDelete}
          className={`${FONT} flex h-[42px] shrink-0 cursor-pointer items-center justify-center rounded-[12px] px-[22px] font-medium leading-[26px] text-[15px] text-white transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c42f33] focus-visible:ring-offset-2`}
          style={{ background: "#D92D20", boxShadow: "0px 1px 6px 0px rgba(19,17,32,0.16)" }}
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}

/**
 * API Access as its own page, opened from its card as the CRMs' pages are.
 * Its content is the live product's Integration page: the "API Key
 * Management" card (key, status, created, expires, delete) and the docs strip.
 */
function ApiAccessPage({ apiKey, onBack, onGenerate, onDelete }: { apiKey: ApiKey | null; onBack: () => void; onGenerate: () => void; onDelete: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const th = `${FONT} px-[16px] py-[12px] text-left font-medium uppercase leading-[16px] text-[12px] tracking-[0.4px]`;
  const td = `${FONT} px-[16px] py-[16px] leading-[20px] text-[14px]`;
  return (
    <div className="flex w-full flex-col gap-[20px]" data-name="API Access Page">
      <nav aria-label="Breadcrumb" className={`${FONT} flex items-center gap-[6px] leading-[20px] text-[13px]`} style={{ color: MUTED }}>
        <button type="button" onClick={onBack} className="cursor-pointer rounded-[2px] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072929]" style={{ color: MUTED }}>
          Integrations
        </button>
        <span aria-hidden>›</span>
        <span aria-current="page" style={{ color: INK }}>
          API Access
        </span>
      </nav>

      <section className="flex w-full flex-col gap-[20px] rounded-[16px] bg-white p-[32px]" aria-labelledby="api-key-management">
        <div className="flex flex-wrap items-start justify-between gap-[16px]">
          <div className="flex min-w-0 items-start gap-[16px]">
            <span className="mt-[6px] shrink-0">
              <KeyIcon />
            </span>
            <div className="flex min-w-0 flex-col gap-[2px]">
              <h1 id="api-key-management" className={`${FONT} font-medium leading-[28px] text-[20px]`} style={{ color: INK }}>
                API Key Management
              </h1>
              <p className={`${FONT} leading-[22px] text-[15px]`} style={{ color: MUTED }}>
                API keys are displayed only once when generated to help keep your integration secure.
              </p>
            </div>
          </div>
          <InkButton onClick={onGenerate}>{apiKey ? "Regenerate API Key" : "Generate API Key"}</InkButton>
        </div>

        <div className="overflow-x-auto rounded-[12px]" style={{ border: `1px solid ${HAIR}` }}>
          <table className="w-full min-w-[620px] border-collapse">
            <thead>
              <tr style={{ background: "#f3f2f0" }}>
                {["Key", "Status", "Created on", "Expires on"].map(h => (
                  <th key={h} scope="col" className={th} style={{ color: MUTED }}>
                    {h}
                  </th>
                ))}
                <th scope="col" className={`${th} text-center`} style={{ color: MUTED }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {apiKey ? (
                <tr style={{ borderTop: `1px solid ${HAIR}` }}>
                  <td className={td}>
                    <code className="text-[14px]" style={{ color: INK, fontFamily: MONO }}>
                      {mask(apiKey.key)}
                    </code>
                  </td>
                  <td className={td}>
                    <Chip tone="live">Active</Chip>
                  </td>
                  <td className={td} style={{ color: INK }}>
                    {formatDate(apiKey.createdAt)}
                  </td>
                  <td className={td} style={{ color: INK }}>
                    {apiKey.expiresAt === null ? "Never" : formatDate(apiKey.expiresAt)}
                  </td>
                  <td className="px-[16px] py-[8px] text-center">
                    <button
                      type="button"
                      aria-label="Delete API key"
                      onClick={() => setDeleting(true)}
                      className="inline-flex size-[28px] cursor-pointer items-center justify-center rounded-full p-[5px] transition-colors hover:bg-[rgba(0,0,0,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072929]"
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ) : (
                <tr style={{ borderTop: `1px solid ${HAIR}` }}>
                  <td colSpan={5} className={`${td} text-center`} style={{ color: MUTED }}>
                    No API keys yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex w-full flex-wrap items-center justify-between gap-[12px] rounded-[16px] bg-white px-[24px] py-[18px]">
        <p className={`${FONT} leading-[22px] text-[15px]`} style={{ color: MUTED }}>
          New to the API? Learn how to authenticate and pull buyers into your systems.
        </p>
        <a
          href="#api-documentation"
          onClick={e => e.preventDefault()}
          className={`${FONT} inline-flex items-center gap-[6px] whitespace-nowrap rounded-[4px] font-medium leading-[20px] text-[14px] transition-colors hover:underline hover:underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072929] focus-visible:ring-offset-2`}
          style={{ color: DEEP }}
        >
          <DocsIcon />
          View API Docs
        </a>
      </div>

      {deleting && (
        <DeleteKeyDialog
          onCancel={() => setDeleting(false)}
          onDelete={() => {
            setDeleting(false);
            onDelete();
          }}
        />
      )}
    </div>
  );
}

/* ── the cards ── */

function IntegrationCard({
  icon,
  title,
  category,
  description,
  status,
  action,
  meta,
}: {
  icon: ReactNode;
  title: string;
  category: string;
  description: string;
  status?: ReactNode;
  action: ReactNode;
  meta: ReactNode;
}) {
  return (
    <article className="flex min-w-0 flex-col gap-[16px] rounded-[16px] bg-white p-[24px]" data-name="Integration Card">
      <div className="flex items-start justify-between gap-[12px]">
        <span className="flex size-[44px] shrink-0 items-center justify-center rounded-[10px]" style={{ background: "rgba(7,41,41,0.05)" }}>
          {icon}
        </span>
        {status}
      </div>
      <div className="flex flex-col gap-[2px]">
        <h2 className={`${FONT} font-medium leading-[24px] text-[16px]`} style={{ color: INK }}>
          {title}
        </h2>
        <p className={`${FONT} leading-[18px] text-[12px]`} style={{ color: MUTED }}>
          {category}
        </p>
      </div>
      <p className={`${FONT} flex-1 leading-[22px] text-[14px]`} style={{ color: MUTED }}>
        {description}
      </p>
      {/* Wraps rather than clips: on a narrow card the meta drops to its own line, never cut off mid-word. */}
      <div className="flex flex-wrap items-center justify-between gap-x-[12px] gap-y-[8px]">
        {action}
        <span className={`${FONT} whitespace-nowrap leading-[18px] text-[12px]`} style={{ color: MUTED }}>
          {meta}
        </span>
      </div>
    </article>
  );
}

function StatusChip({ children }: { children: ReactNode }) {
  return (
    <Chip tone="live">
      <span className="size-[6px] rounded-full" style={{ background: SUCCESS }} />
      {children}
    </Chip>
  );
}

/* ── the page ── */

type Dialog =
  | { kind: "none" }
  | { kind: "generate" }
  | { kind: "key" }
  | { kind: "connect"; crm: CrmId; edit: boolean; focus?: SectionId; reconnect?: boolean };

function IntegrationContent() {
  const locked = useProspectsLocked();
  const [apiKey, setApiKey] = useState<ApiKey | null>(readKey);
  const [connections, setConnections] = useState<Record<CrmId, Connection | null>>(() => ({ hubspot: readConnection("hubspot"), salesforce: readConnection("salesforce") }));
  const [dialog, setDialog] = useState<Dialog>({ kind: "none" });
  /* A connected CRM opens as its own page in this column, as Hightouch opens a
     destination: Integrations › HubSpot, with tabs. Null is the cards. */
  const [page, setPage] = useState<{ crm: CrmId } | null>(null);
  const [apiPage, setApiPage] = useState(false);
  /* Re-render once a minute so "synced 3 min ago" stays true. */
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick(t => t + 1), 60e3);
    return () => window.clearInterval(id);
  }, []);

  const generate = (name: string, expiry: Expiry) => {
    const k = makeKey(name, expiry);
    setApiKey(k);
    writeKey(k);
    setDialog({ kind: "key" });
  };
  const removeKey = () => {
    setApiKey(null);
    writeKey(null);
  };
  const saveConnection = (crm: CrmId, c: Connection | null) => {
    writeConnection(crm, c);
    setConnections(prev => ({ ...prev, [crm]: c }));
  };

  /* Syncs run here, on the page, so they keep going whichever dialog is open.
     Finishing setup opens the connection with its first run live on it, as
     Leadfeeder lands you on "Connected · Syncing"; the card shows it too, and if
     Manage is closed by the time it finishes, a toast says so. */
  const [runs, setRuns] = useState<Record<CrmId, SyncRun | null>>({ hubspot: null, salesforce: null });
  const runTimers = useRef<Partial<Record<CrmId, number>>>({});
  const [toast, setToast] = useState<{ crm: CrmId; title: string; body: string } | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const pageNow = useRef(page);
  pageNow.current = page;
  useEffect(
    () => () => {
      window.clearTimeout(toastTimer.current);
      Object.values(runTimers.current).forEach(id => window.clearInterval(id));
    },
    [],
  );
  const stopRun = (crm: CrmId) => {
    window.clearInterval(runTimers.current[crm]);
    setRuns(prev => ({ ...prev, [crm]: null }));
  };
  const startRun = (crm: CrmId, run: Omit<SyncRun, "done">, record: Omit<RunRecord, "at">) => {
    window.clearInterval(runTimers.current[crm]);
    const total = Math.max(1, run.total);
    /* Twelve ticks whatever the size, so even a small run is long enough to see. */
    let tick = 0;
    setRuns(prev => ({ ...prev, [crm]: { ...run, total, done: 0 } }));
    runTimers.current[crm] = window.setInterval(() => {
      tick += 1;
      const done = Math.floor((total * tick) / 12);
      if (tick < 12) {
        setRuns(prev => (prev[crm] ? { ...prev, [crm]: { ...prev[crm]!, done } } : prev));
        return;
      }
      stopRun(crm);
      const now = readConnection(crm);
      if (!now) return;
      const at = Date.now();
      saveConnection(crm, { ...now, lastSyncAt: at, runs: [{ ...record, at }, ...now.runs] });
      /* The corner that showed it running says it finished, wherever you are. */
      const what =
        record.note ??
        `${record.companies.toLocaleString("en-US")} ${unitFor(crm, record.companies)} synced${record.skipped ? `, ${record.skipped} skipped` : ""}`;
      setToast({ crm, title: `${CRMS[crm].name} sync finished`, body: `${what}. New activity syncs ${FREQUENCY[now.settings.frequency].every}.` });
      window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToast(null), 6000);
    }, 450);
  };
  const unitFor = (crm: CrmId, n = 2) => (crm === "hubspot" ? (n === 1 ? "company" : "companies") : n === 1 ? "Account" : "Accounts");
  const finished = (crm: CrmId, c: Connection, startSync: boolean) => {
    saveConnection(crm, c);
    setDialog({ kind: "none" });
    setPage({ crm });
    if (!startSync) return;
    const r = c.result;
    if (c.settings.backfill) {
      const created = Math.ceil(r.companies / 3);
      startRun(
        crm,
        { label: "Sending the last 30 days", unit: unitFor(crm), total: r.companies, first: true },
        { label: "First sync · last 30 days", companies: r.companies, buyers: r.buyers, activity: r.activity, created, updated: r.companies - created, skipped: r.skipped },
      );
    } else {
      const fields = crm === "hubspot" ? "properties" : "fields";
      startRun(
        crm,
        { label: `Creating Software Finder ${fields}`, unit: fields, total: fieldsToCreate(CRMS[crm], c.settings).length, first: true },
        { label: "First sync", companies: 0, buyers: 0, activity: 0, created: 0, updated: 0, skipped: 0, note: `Software Finder ${fields} created` },
      );
    }
  };
  /* After reconnecting an expired connection: everything held back while it was paused, sent at once, as Zapier replays held runs. */
  const catchUp = (crm: CrmId, c: Connection) => {
    if (c.settings.manual) return;
    const n = Math.max(3, Math.round(c.result.companies * 0.3));
    startRun(
      crm,
      { label: "Sending activity from the pause", unit: unitFor(crm), total: n, first: false },
      { label: "Catch-up after reconnect", companies: n, buyers: Math.round(n * 1.5), activity: n * 5, created: 1, updated: n - 1, skipped: 0 },
    );
  };
  const syncNow = (crm: CrmId) => {
    const n = Math.max(2, Math.round(connections[crm]!.result.companies * 0.2));
    startRun(
      crm,
      { label: "Sending new activity", unit: unitFor(crm), total: n, first: false },
      { label: "Manual sync", companies: n, buyers: Math.round(n * 1.5), activity: n * 4, created: 1, updated: n - 1, skipped: 0 },
    );
  };

  const crmCard = (crm: CrmId) => {
    const info = CRMS[crm];
    const c = connections[crm];
    return (
      <IntegrationCard
        key={crm}
        icon={<CrmLogo crm={crm} size={24} />}
        title={info.name}
        category={info.category}
        description={info.blurb}
        status={
          c && !c.setupDone ? (
            <Chip tone="warn">Setup not finished</Chip>
          ) : c?.expired ? (
            <Chip tone="warn">Reconnect needed</Chip>
          ) : c && runs[crm] ? (
            <Chip tone="wash">
              <Spinner size={10} />
              Syncing
            </Chip>
          ) : c ? (
            <StatusChip>Connected</StatusChip>
          ) : undefined
        }
        action={
          c?.setupDone ? (
            <OutlineButton size="sm" onClick={() => setPage({ crm })}>
              Manage
            </OutlineButton>
          ) : (
            <InkButton size="sm" onClick={() => setDialog({ kind: "connect", crm, edit: false })}>
              {c ? "Finish Setup" : "Connect"}
            </InkButton>
          )
        }
        meta={
          !c
            ? "Not connected"
            : !c.setupDone
              ? "Not syncing yet"
              : c.expired
                ? "Syncing paused"
              : runs[crm]
                ? `Syncing · ${runs[crm]!.done} of ${runs[crm]!.total} ${runs[crm]!.unit}`
                : c.runs.length
                  ? `Synced ${timeAgo(c.lastSyncAt)}`
                  : "Not synced yet"
        }
      />
    );
  };

  const open = dialog.kind === "connect" ? dialog.crm : null;
  const pageCrm = page && connections[page.crm]?.setupDone ? page.crm : null;

  return (
    <div
      className="content-stretch flex flex-col gap-[20px] items-start mb-[36px] ml-[371px] mr-[71px] mt-[84px] min-w-0 relative"
      /* Locked, the column is blurred here, as the Prospects page blurs its own: see Frame63. */
      style={locked ? { filter: "blur(4px)" } : undefined}
    >
      {apiPage ? (
        <ApiAccessPage apiKey={apiKey} onBack={() => setApiPage(false)} onGenerate={() => setDialog({ kind: "generate" })} onDelete={removeKey} />
      ) : pageCrm && page ? (
        <CrmPage
          crm={pageCrm}
          connection={connections[pageCrm]!}
          run={runs[pageCrm]}
          onBack={() => setPage(null)}
          onSave={settings => saveConnection(pageCrm, { ...connections[pageCrm]!, settings })}
          onSyncNow={() => syncNow(pageCrm)}
          onReconnect={() => setDialog({ kind: "connect", crm: pageCrm, edit: true, reconnect: true })}
          onDisconnect={() => {
            stopRun(pageCrm);
            saveConnection(pageCrm, null);
            setPage(null);
          }}
        />
      ) : null}
      {/* Review control: flips this connection to expired, to show the reconnect state. */}
      {!apiPage && pageCrm && page && !locked ? (
        <ConnectionPrototypeBar
          expired={!!connections[pageCrm]!.expired}
          onChange={expired => {
            const c = connections[pageCrm]!;
            if (!expired) return saveConnection(pageCrm, { ...c, expired: undefined });
            stopRun(pageCrm);
            const failedRun: RunRecord = { at: Date.now(), label: "Scheduled sync", companies: 0, buyers: 0, activity: 0, created: 0, updated: 0, skipped: 0, failed: "Connection expired" };
            saveConnection(pageCrm, { ...c, expired: true, runs: c.runs[0]?.failed ? c.runs : [failedRun, ...c.runs] });
          }}
        />
      ) : null}
      {apiPage || (pageCrm && page) ? null : (
      <>
      <div className="flex flex-col gap-[2px]">
        <p className={`${FONT} font-medium leading-[46px] text-[32px] whitespace-nowrap`} style={{ color: INK }}>
          Integrations
        </p>
        <p className={`${FONT} leading-[21px] text-[14px]`} style={{ color: MUTED }}>
          Send Software Finder buyers to your CRM, or pull them into your own systems with an API key.
        </p>
      </div>

      <div className="grid w-full grid-cols-3 gap-[16px]" data-name="Integration Cards">
        {crmCard("hubspot")}
        {crmCard("salesforce")}
        <IntegrationCard
          icon={<KeyIcon />}
          title="API Access"
          category="Data and Developer"
          description="Pull buyers and intent signals into internal systems with a secure API key."
          status={apiKey ? <StatusChip>Active</StatusChip> : undefined}
          action={
            apiKey ? (
              <OutlineButton size="sm" onClick={() => setApiPage(true)}>
                Manage
              </OutlineButton>
            ) : (
              <InkButton size="sm" onClick={() => setDialog({ kind: "generate" })}>
                Generate API Key
              </InkButton>
            )
          }
          /* The API docs live on the API card: they are no help to anyone connecting a CRM,
             so they no longer run full-width under all three cards. */
          meta={
            <span className="inline-flex items-center gap-[6px]">
              <a
                href="#api-documentation"
                onClick={e => e.preventDefault()}
                className={`${FONT} inline-flex items-center gap-[6px] whitespace-nowrap rounded-[4px] font-medium leading-[20px] text-[14px] transition-colors hover:underline hover:underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072929] focus-visible:ring-offset-2`}
                style={{ color: DEEP }}
              >
                <DocsIcon />
                View API Docs
              </a>
            </span>
          }
        />
      </div>
      </>
      )}

      {dialog.kind === "generate" && <GenerateDialog onCancel={() => setDialog({ kind: "none" })} onGenerate={generate} />}
      {dialog.kind === "key" && apiKey && <KeyDialog apiKey={apiKey} onDone={() => setDialog({ kind: "none" })} />}
      {dialog.kind === "connect" && open && (
        <ConnectPanel
          crm={open}
          existing={connections[open]}
          focus={dialog.focus}
          reconnect={dialog.reconnect}
          onClose={() => setDialog({ kind: "none" })}
          onConnected={(c, opts) => {
            if (opts) return finished(open, c, opts.syncing);
            saveConnection(open, c);
            if (dialog.reconnect && connections[open]?.expired) catchUp(open, c);
          }}
        />
      )}
      {/*
        Sync status lives in one corner, as Gmail's upload panel does: while a
        sync runs it shows which CRM, how far, and a bar, on every page; when it
        finishes, the same corner says so. Two CRMs syncing stack.
      */}
      <div className="pointer-events-none fixed bottom-[24px] right-[24px] z-[9600] flex flex-col items-end gap-[8px] [&>*]:pointer-events-auto">
        {(Object.keys(runs) as CrmId[])
          .filter(c => runs[c])
          .map(c => {
            const r = runs[c]!;
            const pct = Math.round((r.done / Math.max(1, r.total)) * 100);
            return (
              <div
                key={c}
                role="status"
                aria-live="polite"
                className="flex w-[360px] items-center gap-[12px] rounded-[12px] bg-white p-[14px] motion-safe:animate-[toast-in_200ms_cubic-bezier(0.2,0,0,1)]"
                style={{ border: `1px solid ${HAIR}`, boxShadow: "0 12px 32px -12px rgba(7,41,41,0.22)" }}
              >
                <span className="flex size-[36px] shrink-0 items-center justify-center rounded-[10px] bg-white" style={{ border: `1px solid ${HAIR}` }}>
                  <CrmLogo crm={c} size={20} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
                  <div className="flex items-baseline justify-between gap-[8px]">
                    <p className={`${FONT} truncate font-medium leading-[20px] text-[14px]`} style={{ color: INK }}>
                      {`Syncing to ${CRMS[c].name}`}
                    </p>
                    <span className={`${FONT} shrink-0 leading-[18px] text-[12px] tabular-nums`} style={{ color: MUTED }}>
                      {r.done.toLocaleString("en-US")} of {r.total.toLocaleString("en-US")} {r.unit}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={r.label}
                    aria-valuemin={0}
                    aria-valuemax={r.total}
                    aria-valuenow={r.done}
                    className="h-[4px] overflow-hidden rounded-full"
                    style={{ background: "rgba(7,41,41,0.08)" }}
                  >
                    <div className="h-full rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none" style={{ width: `${pct}%`, background: DEEP }} />
                  </div>
                </div>
              </div>
            );
          })}
        {toast && (
          <div
            role="status"
            className="flex w-[360px] items-start gap-[12px] rounded-[12px] bg-white p-[14px] motion-safe:animate-[toast-in_200ms_cubic-bezier(0.2,0,0,1)]"
            style={{ border: `1px solid ${HAIR}`, boxShadow: "0 12px 32px -12px rgba(7,41,41,0.22)" }}
          >
            <span className="mt-[1px] flex size-[20px] shrink-0 items-center justify-center rounded-full" style={{ background: SUCCESS }}>
              <CheckIcon color="#fff" size={12} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
              <p className={`${FONT} font-medium leading-[20px] text-[14px]`} style={{ color: INK }}>
                {toast.title}
              </p>
              <p className={`${FONT} leading-[19px] text-[13px]`} style={{ color: MUTED }}>
                {toast.body}
              </p>
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setToast(null)}
              className="-mr-[4px] -mt-[4px] flex size-[26px] shrink-0 cursor-pointer items-center justify-center rounded-[6px] hover:bg-[rgba(7,41,41,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072929]"
            >
              <CloseIcon />
            </button>
          </div>
        )}
        </div>


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
