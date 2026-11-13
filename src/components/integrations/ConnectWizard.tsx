/**
 * Connect HubSpot / Connect Salesforce: one dialog, steps down the left.
 *
 * The order and the defaults come from the research behind this page. Every
 * product authorizes first and checks the admin can install; the settings are
 * written as the situations they handle, with the safe choice marked
 * Recommended (RB2B, G2); mapping keeps the fields we fill apart from the
 * fields we create (G2, Warmly); history is an explicit choice with a preview
 * (Clearbit, HubSpot's own Buyer Intent); and the first sync is something you
 * can watch (HubSpot Data Sync). Salesforce adds the environment, the
 * permission check and Lead or Contact routing.
 *
 * Signing in is simulated: a short wait stands in for the CRM's own window.
 * The demo does not draw HubSpot's or Salesforce's screens.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import CrmAuthWindow, { SoftwareFinderMark } from "./CrmAuthWindow";
import CrmLogo from "./CrmLogo";
import {
  CRMS,
  DEFAULT_SETTINGS,
  fieldsToCreate,
  canRemap,
  destinationOptions,
  LEAD_SOURCES,
  preview,
  type Connection,
  type CrmId,
  type CrmSettings,
  type FieldRow,
  type StepId,
  type WriteRule,
} from "./crm";
import {
  ArrowRightIcon,
  CheckIcon,
  DocsIcon,
  Chip,
  CloseIcon,
  DEEP,
  FAINT,
  FONT,
  HAIR,
  InfoIcon,
  INK,
  InkButton,
  MONO,
  MUTED,
  OutlineButton,
  Spinner,
  SUCCESS,
  useEscape,
  LIME,
  WASH,
} from "./ui";

/* ── small building blocks ── */

export function Section({ title, hint, children }: { title: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-[10px]">
      <div className="flex flex-col gap-[2px]">
        <h3 className={`${FONT} font-medium leading-[21px] text-[14px]`} style={{ color: INK }}>
          {title}
        </h3>
        {hint && (
          <p className={`${FONT} leading-[19px] text-[13px]`} style={{ color: MUTED }}>
            {hint}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

type Option<T extends string> = { value: T; label: string; hint?: string; recommended?: boolean; meta?: string };

/** A rule written as the situation it handles, one choice per row. */
export function Choice<T extends string>({ name, options, value, onChange }: { name: string; options: Option<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" className="flex flex-col gap-[6px]">
      {options.map(o => {
        const on = o.value === value;
        return (
          <label
            key={o.value}
            className="flex cursor-pointer items-start gap-[10px] rounded-[10px] px-[12px] py-[10px] transition-colors"
            style={{ border: `1px solid ${on ? "rgba(7,41,41,0.45)" : HAIR}`, background: on ? "rgba(7,41,41,0.03)" : "#fff" }}
          >
            <input type="radio" name={name} checked={on} onChange={() => onChange(o.value)} className="peer sr-only" />
            <span
              aria-hidden
              className="mt-[3px] size-[14px] shrink-0 rounded-full transition-[border-width] peer-focus-visible:ring-2 peer-focus-visible:ring-[#072929] peer-focus-visible:ring-offset-2"
              style={{ border: on ? `4px solid ${DEEP}` : `1.5px solid ${FAINT}` }}
            />
            <span className="flex min-w-0 flex-1 flex-col gap-[1px]">
              <span className={`${FONT} flex flex-wrap items-center gap-[8px] leading-[20px] text-[14px]`} style={{ color: INK }}>
                {o.label}
                {o.recommended && <Chip tone="wash">Recommended</Chip>}
              </span>
              {o.hint && (
                <span className={`${FONT} leading-[18px] text-[12px]`} style={{ color: MUTED }}>
                  {o.hint}
                </span>
              )}
            </span>
            {o.meta && (
              <span className={`${FONT} shrink-0 leading-[20px] text-[12px] tabular-nums`} style={{ color: MUTED }}>
                {o.meta}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}

export function Toggle({ checked, onChange, label, hint, disabled }: { checked: boolean; onChange?: (v: boolean) => void; label: string; hint?: string; disabled?: boolean }) {
  return (
    <label className={`flex items-start gap-[10px] ${disabled ? "cursor-default" : "cursor-pointer"}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={e => onChange?.(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className="mt-[3px] flex size-[16px] shrink-0 items-center justify-center rounded-[4px] peer-focus-visible:ring-2 peer-focus-visible:ring-[#072929] peer-focus-visible:ring-offset-2"
        style={{ background: checked ? (disabled ? "rgba(7,41,41,0.45)" : DEEP) : "#fff", border: checked ? "none" : `1.5px solid ${FAINT}` }}
      >
        {checked && <CheckIcon color="#fff" size={12} />}
      </span>
      <span className="flex min-w-0 flex-col gap-[1px]">
        <span className={`${FONT} leading-[20px] text-[14px]`} style={{ color: INK }}>
          {label}
        </span>
        {hint && (
          <span className={`${FONT} leading-[18px] text-[12px]`} style={{ color: MUTED }}>
            {hint}
          </span>
        )}
      </span>
    </label>
  );
}

/**
 * The app's own dropdown, as the API key's Expiration field draws it: a field that opens a white menu
 * beneath it, rows that tint on hover, and a check on the chosen one. Replaces the native <select>,
 * whose OS menu did not match anything else here.
 *
 * The menu is portalled and fixed to the field, so a dialog's scroll area cannot clip it; it opens
 * upward when there is no room below. Arrow keys move, Enter picks, Escape closes the menu without
 * closing the dialog, and Tab or a click outside closes it.
 */
export function Select({ value, onChange, options, label, width }: { value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }>; label: string; width?: number }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{ left: number; width: number; top?: number; bottom?: number } | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLUListElement>(null);
  const id = useMemo(() => `select-${Math.random().toString(36).slice(2, 9)}`, []);
  const current = options.find(o => o.value === value) ?? options[0];

  const place = () => {
    const r = button.current?.getBoundingClientRect();
    if (!r) return;
    const height = Math.min(240, options.length * 36 + 8);
    const below = window.innerHeight - r.bottom;
    const w = Math.max(r.width, 200);
    setPos(below < height + 12 && r.top > below ? { left: r.left, width: w, bottom: window.innerHeight - r.top + 6 } : { left: r.left, width: w, top: r.bottom + 6 });
  };
  const show = () => {
    place();
    setActive(Math.max(0, options.findIndex(o => o.value === value)));
    setOpen(true);
  };
  const choose = (v: string) => {
    onChange(v);
    setOpen(false);
    button.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!button.current?.contains(t) && !menu.current?.contains(t)) setOpen(false);
    };
    /* Capture, so Escape closes this menu before the dialog's own Escape handler sees it. */
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        button.current?.focus();
      }
    };
    /* A scroll inside the dialog moves the field; follow it rather than float away. */
    const onScroll = (e: Event) => {
      if (!menu.current?.contains(e.target as Node)) place();
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", place);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) menu.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const onButtonKey = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      show();
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(i => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(i => Math.max(0, i - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(options[active].value);
    } else if (e.key === "Tab") setOpen(false);
  };

  return (
    <span className="relative inline-flex min-w-0" style={{ width }}>
      <button
        ref={button}
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onButtonKey}
        className={`${FONT} flex h-[34px] w-full min-w-0 cursor-pointer items-center justify-between gap-[8px] rounded-[8px] bg-white pl-[10px] pr-[9px] text-left leading-[20px] text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072929]`}
        style={{ color: INK, border: `1px solid ${open ? "rgba(7,41,41,0.5)" : HAIR}` }}
      >
        <span className="truncate">{current?.label}</span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="block shrink-0 transition-transform" style={{ transform: open ? "rotate(180deg)" : undefined }}>
          <path d="m4 6 4 4 4-4" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open &&
        pos &&
        createPortal(
          <ul
            ref={menu}
            id={id}
            role="listbox"
            aria-label={label}
            className="fixed z-[9700] flex max-h-[240px] flex-col gap-[2px] overflow-y-auto rounded-[10px] bg-white p-[4px]"
            style={{ left: pos.left, top: pos.top, bottom: pos.bottom, width: pos.width, border: `1px solid ${HAIR}`, boxShadow: "0px 4px 18px 0px rgba(47,43,61,0.16)" }}
          >
            {options.map((o, i) => {
              const selected = o.value === value;
              return (
                <li
                  key={o.value}
                  id={`${id}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => choose(o.value)}
                  className={`${FONT} flex min-h-[36px] cursor-pointer items-center justify-between gap-[10px] rounded-[8px] px-[10px] py-[8px] leading-[20px] text-[13px]`}
                  style={{ color: INK, background: i === active || selected ? "rgba(7,41,41,0.06)" : undefined }}
                >
                  <span>{o.label}</span>
                  {selected && <CheckIcon />}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </span>
  );
}

export function Callout({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "success" }) {
  return (
    <div
      className={`${FONT} flex items-start gap-[10px] rounded-[10px] px-[12px] py-[10px] leading-[19px] text-[13px]`}
      style={{ background: tone === "success" ? "rgba(36,179,100,0.08)" : WASH, color: INK }}
    >
      {tone === "success" ? <CheckIcon color={SUCCESS} /> : <InfoIcon />}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export const fmt = (n: number) => n.toLocaleString("en-US");

/* ── steps ── */

function EnvironmentStep({ s, set }: { s: CrmSettings; set: (p: Partial<CrmSettings>) => void }) {
  return (
    <>
      <Section title="Which Salesforce do you want to connect?" hint="Each environment has its own sign-in, so choose before you log in.">
        <Choice
          name="sf-env"
          value={s.env}
          onChange={env => set({ env })}
          options={[
            { value: "production", label: "Production", hint: "Your live org, at login.salesforce.com." },
            { value: "sandbox", label: "Sandbox", hint: "A test copy, at test.salesforce.com. Good for trying the setup before production." },
          ]}
        />
      </Section>
      <Section title="Before you start">
        <ul className="flex flex-col gap-[8px]">
          {[
            ["A Salesforce edition with API access", "Enterprise, Unlimited, Performance or Developer. Professional needs the API add-on."],
            ["A Salesforce system administrator", "Needed to approve the Software Finder app and create its fields."],
            ["A dedicated integration user (recommended)", "So the sync keeps running if the person who connected it leaves."],
          ].map(([t, h]) => (
            <li key={t} className="flex items-start gap-[10px]">
              <span className="mt-[2px]">
                <CheckIcon color={MUTED} />
              </span>
              <span className="flex flex-col">
                <span className={`${FONT} leading-[20px] text-[14px]`} style={{ color: INK }}>
                  {t}
                </span>
                <span className={`${FONT} leading-[18px] text-[12px]`} style={{ color: MUTED }}>
                  {h}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

export const SF_CHECKS = [
  "API access is enabled",
  "Software Finder app is approved in your org",
  "Read and edit Accounts",
  "Read, create and edit Leads",
  "Read, create and edit Contacts",
  "Create Tasks",
  "Create custom fields",
];

export const HS_DOES = [
  "Read companies and contacts, to match buyers you already have",
  "Create and update companies and contacts",
  "Create a Software Finder property group",
  "Add intent signals and page visits to company timelines",
];

export const SF_DOES = [
  "Read Accounts, Leads and Contacts, to match buyers you already have",
  "Create and update Leads, Contacts and Accounts",
  "Create Software Finder custom fields",
  "Log intent signals and page visits as Tasks",
];

function AuthorizeStep({
  crm,
  s,
  auth,
  checks,
  onReset,
}: {
  crm: CrmId;
  s: CrmSettings;
  auth: "idle" | "waiting" | "done";
  checks: number;
  onReset: () => void;
}) {
  const info = CRMS[crm];
  const account = info.account(s);
  const [copied, setCopied] = useState(false);
  const askAdmin = async () => {
    try {
      await navigator.clipboard.writeText(`Please connect ${info.name} to Software Finder: Integrations › ${info.name} › Connect.`);
    } catch {
      /* Clipboard refused: the confirmation still shows. */
    }
    setCopied(true);
  };

  return (
    <>
      <Section title="Software Finder will be able to">
        <ul className="flex flex-col gap-[8px]">
          {(crm === "hubspot" ? HS_DOES : SF_DOES).map(t => (
            <li key={t} className={`${FONT} flex items-start gap-[10px] leading-[20px] text-[14px]`} style={{ color: INK }}>
              <span className="mt-[2px]">
                <CheckIcon />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </Section>

      {crm === "hubspot" && (
        <Callout>
          You need to be a <b className="font-medium">Super Admin</b> or have <b className="font-medium">App Marketplace access</b> in HubSpot to connect.{" "}
          <button type="button" onClick={askAdmin} className="cursor-pointer font-medium underline underline-offset-2" style={{ color: DEEP }}>
            {copied ? "Message copied for your admin" : "Not an admin? Copy a message for one"}
          </button>
        </Callout>
      )}

      <div className="rounded-[12px] p-[16px]" style={{ border: `1px solid ${HAIR}` }}>
        {/* What happens when they press the footer's button. The button itself
            lives in the footer, so the step has one primary action, not two. */}
        {auth === "idle" && (
          <div className="flex items-center gap-[12px]">
            <span className="flex size-[40px] shrink-0 items-center justify-center rounded-[10px]" style={{ background: WASH }}>
              <CrmLogo crm={crm} size={22} />
            </span>
            <p className={`${FONT} leading-[20px] text-[14px]`} style={{ color: MUTED }}>
              {crm === "hubspot"
                ? "HubSpot opens in a new window, where you choose the account and approve access. You'll come straight back here."
                : `Salesforce opens in a new window at ${s.env === "sandbox" ? "test" : "login"}.salesforce.com. You'll come straight back here.`}
            </p>
          </div>
        )}
        {auth === "waiting" && (
          <div className="flex items-center gap-[12px]" role="status">
            <Spinner />
            <p className={`${FONT} leading-[20px] text-[14px]`} style={{ color: INK }}>
              Waiting for {info.name}. {crm === "hubspot" ? "Choose your account and approve access in the HubSpot window." : "Sign in and allow access in the Salesforce window."}
            </p>
          </div>
        )}
        {auth === "done" && (
          <div className="flex flex-col gap-[14px]">
            <div className="flex items-center justify-between gap-[12px]">
              <div className="flex items-center gap-[12px]">
                <span className="flex size-[40px] items-center justify-center rounded-[10px]" style={{ background: WASH }}>
                  <CrmLogo crm={crm} size={22} />
                </span>
                <div className="flex flex-col">
                  <span className={`${FONT} flex items-center gap-[8px] font-medium leading-[20px] text-[14px]`} style={{ color: INK }}>
                    {account.name} <Chip>Authorized</Chip>
                  </span>
                  <span className={`${FONT} leading-[18px] text-[12px]`} style={{ color: MUTED }}>
                    {account.detail}
                  </span>
                </div>
              </div>
              <button type="button" onClick={onReset} className={`${FONT} cursor-pointer font-medium leading-[20px] text-[13px] underline-offset-2 hover:underline`} style={{ color: DEEP }}>
                Use a different account
              </button>
            </div>
            {crm === "salesforce" && (
              <div className="flex flex-col gap-[2px] border-t pt-[12px]" style={{ borderColor: HAIR }} aria-live="polite">
                <p className={`${FONT} pb-[6px] font-medium leading-[20px] text-[13px]`} style={{ color: INK }}>
                  {checks >= SF_CHECKS.length ? "Access looks good" : "Checking access"}
                </p>
                {SF_CHECKS.map((c, i) => (
                  <div key={c} className="flex items-center justify-between gap-[12px] py-[4px]">
                    <span className={`${FONT} leading-[20px] text-[13px]`} style={{ color: i < checks ? INK : MUTED }}>
                      {c}
                    </span>
                    {i < checks ? <Chip>Passed</Chip> : i === checks ? <Spinner size={14} /> : <span className={`${FONT} text-[12px]`} style={{ color: FAINT }}>Waiting</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export function MinIntent({ s, set }: { s: CrmSettings; set: (p: Partial<CrmSettings>) => void }) {
  const counts = useMemo(() => ({ 30: preview({ ...s, minIntent: 30 }, null).companies, 51: preview({ ...s, minIntent: 51 }, null).companies, 71: preview({ ...s, minIntent: 71 }, null).companies }), [s]);
  return (
    <Section title="Which buyers should be sent?" hint="Buyers below this intent stay in Software Finder.">
      <Choice
        name="min-intent"
        value={String(s.minIntent) as "30" | "51" | "71"}
        onChange={v => set({ minIntent: Number(v) as 30 | 51 | 71 })}
        options={[
          { value: "71", label: "High intent only (71% and up)", meta: `${counts[71]} companies today` },
          { value: "51", label: "Medium and high intent (51% and up)", recommended: true, meta: `${counts[51]} companies today` },
          { value: "30", label: "Every buyer (30% and up)", meta: `${counts[30]} companies today` },
        ]}
      />
    </Section>
  );
}

export function Owner({ crm, s, set }: { crm: CrmId; s: CrmSettings; set: (p: Partial<CrmSettings>) => void }) {
  const owners = CRMS[crm].owners;
  return (
    <Section title={crm === "hubspot" ? "Who owns new companies and contacts?" : "Who owns new Leads and Accounts?"} hint="Records that already exist keep their owner.">
      <Select label="Owner" value={s.owner || owners[0]} onChange={owner => set({ owner })} options={owners.map(o => ({ value: o, label: o }))} width={340} />
    </Section>
  );
}

function Matching({ crm }: { crm: CrmId }) {
  const rows = crm === "hubspot" ? [["Companies", "Company domain name"], ["Buyers", "Email"]] : [["Accounts", "Website domain"], ["Leads and Contacts", "Email"]];
  return (
    <Section title="How records are matched" hint="So a buyer you already have is updated, never duplicated.">
      <div className="flex flex-col gap-[6px]">
        {rows.map(([a, b]) => (
          <div key={a} className={`${FONT} flex items-center gap-[10px] leading-[20px] text-[13px]`} style={{ color: INK }}>
            <span className="w-[150px] shrink-0">{a}</span>
            <ArrowRightIcon />
            <span>
              {b} <span style={{ color: MUTED }}>(www and paths ignored)</span>
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function HubSpotSettingsStep({ s, set }: { s: CrmSettings; set: (p: Partial<CrmSettings>) => void }) {
  return (
    <>
      <Section title="What to send">
        <div className="flex flex-col gap-[10px]">
          <Toggle checked disabled label="Companies, with their intent score and signals" hint="Always on: everything else hangs off the company." />
          <Toggle checked={s.sendContacts} onChange={sendContacts => set({ sendContacts })} label="Revealed buyers, as contacts on their company" />
          <Toggle checked={s.sendActivity} onChange={sendActivity => set({ sendActivity })} label="Intent signals and page visits, on the company timeline" hint="Each one shows the page, time spent and when." />
        </div>
      </Section>
      <Matching crm="hubspot" />
      <Section title="If a buyer's company isn't in HubSpot yet">
        <Choice
          name="hs-new-company"
          value={s.newCompany}
          onChange={newCompany => set({ newCompany })}
          options={[
            { value: "create", label: "Create the company", recommended: true },
            { value: "skip", label: "Skip it, and only update companies already in HubSpot" },
          ]}
        />
      </Section>
      <MinIntent s={s} set={set} />
      <Section title="If a HubSpot property already has a value">
        <Choice
          name="hs-overwrite"
          value={s.overwrite}
          onChange={overwrite => set({ overwrite })}
          options={[
            { value: "fill", label: "Only fill empty properties", recommended: true, hint: "Software Finder properties still update on every sync." },
            { value: "overwrite", label: "Always overwrite with Software Finder data" },
          ]}
        />
      </Section>
      <Owner crm="hubspot" s={s} set={set} />
    </>
  );
}

function SalesforceRoutingStep({ s, set }: { s: CrmSettings; set: (p: Partial<CrmSettings>) => void }) {
  return (
    <>
      <Matching crm="salesforce" />
      <Section title="When the buyer's company is already an Account">
        <Choice
          name="sf-known"
          value={s.knownAccount}
          onChange={knownAccount => set({ knownAccount })}
          options={[
            { value: "contact", label: "Add the buyer as a Contact on that Account", recommended: true },
            { value: "lead", label: "Create a Lead instead" },
            { value: "skip", label: "Skip the buyer" },
          ]}
        />
      </Section>
      <Section title="When there's no matching Account">
        <Choice
          name="sf-none"
          value={s.noAccount}
          onChange={noAccount => set({ noAccount })}
          options={[
            { value: "lead", label: "Create a Lead", recommended: true, hint: "Your team qualifies it before it becomes an Account." },
            { value: "account", label: "Create an Account and a Contact on it" },
            { value: "skip", label: "Skip the buyer" },
          ]}
        />
      </Section>
      <Section title="Accounts">
        <Choice
          name="sf-accounts"
          value={s.accounts}
          onChange={accounts => set({ accounts })}
          options={[
            { value: "update", label: "Update Accounts that already exist", recommended: true, hint: "Intent score and signals are added to Accounts you have." },
            { value: "create", label: "Also create Accounts for new companies" },
          ]}
        />
      </Section>
      <Section title="Activity">
        <Toggle checked={s.sendActivity} onChange={sendActivity => set({ sendActivity })} label="Log intent signals and page visits as completed Tasks on the Account" />
      </Section>
      <MinIntent s={s} set={set} />
      <Owner crm="salesforce" s={s} set={set} />
    </>
  );
}

/*
 * Field mapping, as Hightouch lays it out: each mapping is a pair of field
 * boxes — Software Finder's field on the left, the CRM's on the right — joined
 * by an arrow. Match keys, mapped fields and new fields are grouped, so no row
 * needs a tag to say which it is (only New is called out). What happens to a
 * value the CRM already has sits behind a quiet gear, Hightouch's field options.
 */
/*
 * One grid for the whole table, rows as subgrids: the source column is as wide
 * as its longest name, so the arrow sits the same distance from the source text
 * as from the CRM field, and every column is as wide as its longest entry with
 * the leftover width shared equally between them (space-between), so the gaps
 * stay equal and the table uses its full width: source, arrow, CRM field, status.
 */
const COLS = "max-content 14px max-content max-content";

/** `quiet` drops the explanatory lines, for flows whose step already says them. */
/** `onPage`: on the connected page's off-white ground, a borderless white card like the Settings tab's; in the white setup panel it keeps a hairline border. */
export function MappingStep({ crm, s, set, quiet, onPage }: { crm: CrmId; s: CrmSettings; set: (p: Partial<CrmSettings>) => void; quiet?: boolean; onPage?: boolean }) {
  const info = CRMS[crm];
  const [tab, setTab] = useState(info.mapping[0].id);
  const current = info.mapping.find(t => t.id === tab) ?? info.mapping[0];
  const all = info.mapping.flatMap(t => t.rows);
  const mapped = all.filter(r => r.kind !== "new").length + all.filter(r => r.kind === "new" && (s.destinations[r.key] ?? "create") !== "create").length;
  const toCreate = fieldsToCreate(info, s);
  const crmLabel = crm === "hubspot" ? "HubSpot property" : "Salesforce field";


  return (
    <>
      {!quiet && (
        <p className={`${FONT} leading-[20px] text-[13px]`} style={{ color: MUTED }}>
          {crm === "hubspot" ? "New properties are created in a “Software Finder” group, so they're easy to find." : "New fields are created with access for admins and the integration user."}
        </p>
      )}

      {/* An iOS-style segmented control, not a second row of underline tabs: it switches the view inside this section, the page tabs above switch sections. */}
      <div role="tablist" aria-label="Records" className="grid auto-cols-fr grid-flow-col self-start rounded-[9px] p-[1px]" style={{ background: "rgba(7,41,41,0.06)" }}>
        {info.mapping.map(t => {
          const on = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setTab(t.id)}
              className={`${FONT} h-[32px] cursor-pointer rounded-[8px] px-[16px] font-medium leading-[20px] text-[13px] transition-[background-color,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072929] motion-reduce:transition-none`}
              style={{ color: on ? INK : MUTED, background: on ? "#fff" : "transparent", boxShadow: on ? "0 1px 2px rgba(7,41,41,0.12), 0 1px 1px rgba(7,41,41,0.04)" : "none" }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {!quiet && (
        <p className={`${FONT} -mt-[8px] leading-[19px] text-[13px]`} style={{ color: MUTED }}>
          {current.description}
        </p>
      )}

      {/*
        One light table per object: the Software Finder field, the CRM field it
        lands in, and its status — Match key, Mapped, or New (Hightouch's pairs,
        Eugen Eşanu's table, Common Room's pre-mapped defaults). Match keys
        first, new fields last.
      */}
      <div className="grid justify-between gap-x-[24px] overflow-hidden rounded-[12px] bg-white" style={{ gridTemplateColumns: COLS, border: `1px solid ${HAIR}` }}>
        <div
          className={`${FONT} col-span-full grid grid-cols-subgrid items-center px-[20px] py-[12px] font-medium uppercase leading-[16px] text-[12px] tracking-[0.4px]`}
          style={{ color: MUTED, background: "#f3f2f0", borderBottom: `1px solid ${HAIR}` }}
        >
          <span>Software Finder</span>
          <span />
          <span className="pl-[11px]">{crmLabel}</span>
          <span>Status</span>
        </div>
        {[...current.rows.filter(r => r.match), ...current.rows.filter(r => !r.match && r.kind !== "new"), ...current.rows.filter(r => r.kind === "new")].map((r, i) => (
          <div
            key={r.key}
            className="col-span-full grid min-h-[52px] grid-cols-subgrid items-center px-[20px] py-[8px]"
            style={{ borderTop: i ? `1px solid ${HAIR}` : undefined }}
          >
            {r.kind === "fixed" && r.api === "LeadSource" ? (
              <div className="flex min-w-0 [&>span]:w-[180px]">
                <Select label={`${r.dest} value`} value={s.leadSource || LEAD_SOURCES[0]} onChange={leadSource => set({ leadSource })} options={LEAD_SOURCES.map(v => ({ value: v, label: v }))} />
              </div>
            ) : (
              <span className={`${FONT} truncate leading-[20px] text-[14px]`} style={{ color: INK }} title={r.kind === "fixed" ? "The same value on every record" : r.source}>
                {r.kind === "fixed" ? `“${r.value}”` : r.source}
              </span>
            )}
            <ArrowRightIcon />
            {canRemap(current.id, r) ? (
              /* Automatic by default; the person can point it at a field they already have, of the same kind. */
              <span className="flex min-w-0">
                <Select
                  label={`${crmLabel} for ${r.source}`}
                  value={s.destinations[r.key] ?? "create"}
                  onChange={(v) => set({ destinations: { ...s.destinations, [r.key]: v } })}
                  options={destinationOptions(crm, current.id, r).filter(
                    /* One field per property: what another row already writes to is not offered twice. */
                    (o) => o.value === "create" || o.value === s.destinations[r.key] || !current.rows.some((x) => x.key !== r.key && s.destinations[x.key] === o.value),
                  )}
                  width={280}
                />
              </span>
            ) : (
              <span className={`${FONT} min-w-0 truncate pl-[11px] leading-[20px] text-[14px]`} style={{ color: INK }} title={`${r.dest} · ${r.api} · ${r.type}`}>
                {r.dest}
              </span>
            )}
            <span className="flex">
              {r.match ? (
                <span className={`${FONT} inline-flex h-[22px] items-center rounded-[6px] px-[8px] font-medium leading-[16px] text-[12px]`} style={{ color: INK, boxShadow: `inset 0 0 0 1px ${HAIR}` }}>
                  Match key
                </span>
              ) : r.kind === "new" && (s.destinations[r.key] ?? "create") === "create" ? (
                <Chip tone="blue">New</Chip>
              ) : (
                <Chip tone="wash">Mapped</Chip>
              )}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function BackfillStep({ crm, s, set }: { crm: CrmId; s: CrmSettings; set: (p: Partial<CrmSettings>) => void }) {
  const p = preview(s, 30);
  const calls = Math.ceil((p.companies + p.buyers + p.activity) * 1.4);
  return (
    <>
      <Section title="Send what buyers did before you connected?" hint="New activity syncs every hour either way.">
        <div className="flex flex-col gap-[8px]">
          {[true, false].map(on => {
            const active = s.backfill === on;
            return (
              <label
                key={String(on)}
                className="flex cursor-pointer flex-col gap-[12px] rounded-[12px] p-[16px] transition-colors"
                style={{ border: `1px solid ${active ? "rgba(7,41,41,0.45)" : HAIR}`, background: active ? "rgba(7,41,41,0.03)" : "#fff" }}
              >
                <span className="flex items-start gap-[10px]">
                  <input type="radio" name="backfill" checked={active} onChange={() => set({ backfill: on })} className="peer sr-only" />
                  <span
                    aria-hidden
                    className="mt-[3px] size-[14px] shrink-0 rounded-full peer-focus-visible:ring-2 peer-focus-visible:ring-[#072929] peer-focus-visible:ring-offset-2"
                    style={{ border: active ? `4px solid ${DEEP}` : `1.5px solid ${FAINT}` }}
                  />
                  <span className="flex flex-col gap-[1px]">
                    <span className={`${FONT} flex items-center gap-[8px] font-medium leading-[20px] text-[14px]`} style={{ color: INK }}>
                      {on ? "Backfill the last 30 days" : "Only send new activity from now on"}
                      {on && <Chip tone="wash">Recommended</Chip>}
                    </span>
                    <span className={`${FONT} leading-[18px] text-[12px]`} style={{ color: MUTED }}>
                      {on ? `Buyers at ${s.minIntent}% intent and up, from the last 30 days.` : "You can run a backfill later from Manage."}
                    </span>
                  </span>
                </span>
                {on && (
                  <span className="ml-[24px] grid grid-cols-3 gap-[8px]">
                    {[
                      [crm === "hubspot" ? "Companies" : "Accounts", p.companies],
                      [crm === "hubspot" ? "Contacts" : "Leads and Contacts", p.buyers],
                      [crm === "hubspot" ? "Timeline events" : "Tasks", p.activity],
                    ].map(([label, n]) => (
                      <span key={String(label)} className="flex flex-col rounded-[10px] bg-white px-[12px] py-[8px]" style={{ border: `1px solid ${HAIR}` }}>
                        <span className={`${FONT} font-medium leading-[26px] text-[18px] tabular-nums`} style={{ color: INK }}>
                          {fmt(Number(n))}
                        </span>
                        <span className={`${FONT} leading-[16px] text-[12px]`} style={{ color: MUTED }}>
                          {label}
                        </span>
                      </span>
                    ))}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </Section>
      {crm === "salesforce" && s.backfill && (
        <Callout>
          The backfill uses about <b className="font-medium">{fmt(calls)} API calls</b>, a small share of your org's daily limit (100,000 on Enterprise). Ongoing syncs use the Bulk API.
        </Callout>
      )}
    </>
  );
}

/* ── review and sync ── */

type Phase = { label: string; total: number };

export function phasesFor(crm: CrmId, s: CrmSettings): Phase[] {
  const info = CRMS[crm];
  const p = preview(s, 30);
  const create = fieldsToCreate(info, s).length;
  const out: Phase[] = [{ label: crm === "hubspot" ? "Creating Software Finder properties" : "Creating Software Finder custom fields", total: create }];
  if (s.backfill && !s.manual) {
    out.push({ label: crm === "hubspot" ? "Companies" : "Accounts", total: p.companies });
    if (p.buyers) out.push({ label: crm === "hubspot" ? "Contacts" : "Leads and Contacts", total: p.buyers });
    if (p.activity) out.push({ label: crm === "hubspot" ? "Timeline events" : "Tasks", total: p.activity });
  }
  return out;
}

export function ReviewRows({ crm, s }: { crm: CrmId; s: CrmSettings }) {
  const info = CRMS[crm];
  const account = info.account(s);
  const create = fieldsToCreate(info, s).length;
  const owner = s.owner || info.owners[0];
  const rows: Array<[string, string]> =
    crm === "hubspot"
      ? [
          ["Account", `${account.name} · ${account.detail}`],
          ["Sends", ["Companies", s.sendContacts && "contacts", s.sendActivity && "timeline activity"].filter(Boolean).join(", ")],
          ["New companies", s.newCompany === "create" ? "Created" : "Skipped, existing companies only"],
          ["Buyers", s.manual ? "Only buyers you choose" : `${s.minIntent}% intent and up`],
          ["Existing values", s.overwrite === "fill" ? "Only empty properties are filled" : "Overwritten"],
          ["Owner", owner],
          ["Fields", `${create} new properties in the “Software Finder” group`],
          ["Backfill", s.backfill ? "Last 30 days" : "None, new activity only"],
        ]
      : [
          ["Org", `${account.name} · ${account.detail}`],
          ["Known Account", { contact: "Buyer added as a Contact", lead: "Buyer created as a Lead", skip: "Buyer skipped" }[s.knownAccount]],
          ["No Account", { lead: "Buyer created as a Lead", account: "Account and Contact created", skip: "Buyer skipped" }[s.noAccount]],
          ["Accounts", s.accounts === "update" ? "Existing Accounts updated" : "Existing updated, new ones created"],
          ["Buyers", s.manual ? "Only buyers you choose" : `${s.minIntent}% intent and up`],
          ["Lead Source", s.leadSource || "Not set"],
          ["Owner", owner],
          ["Fields", `${create} new custom fields`],
          ["Backfill", s.backfill ? "Last 30 days" : "None, new activity only"],
        ];
  return (
    <dl className="overflow-hidden rounded-[12px]" style={{ border: `1px solid ${HAIR}` }}>
      {rows.map(([k, v], i) => (
        <div key={k} className={`grid grid-cols-[160px_minmax(0,1fr)] gap-[12px] px-[14px] py-[9px] ${i ? "border-t" : ""}`} style={{ borderColor: HAIR }}>
          <dt className={`${FONT} leading-[20px] text-[13px]`} style={{ color: MUTED }}>
            {k}
          </dt>
          <dd className={`${FONT} m-0 leading-[20px] text-[13px]`} style={{ color: INK }}>
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function SyncProgress({ phases, done }: { phases: Phase[]; done: number[] }) {
  return (
    <div className="flex flex-col gap-[14px]" role="status" aria-live="polite">
      {phases.map((p, i) => {
        const n = done[i] ?? 0;
        const complete = n >= p.total;
        const started = i === 0 || (done[i - 1] ?? 0) >= phases[i - 1].total;
        return (
          <div key={p.label} className="flex flex-col gap-[6px]">
            <div className="flex items-center justify-between gap-[12px]">
              <span className={`${FONT} flex items-center gap-[8px] leading-[20px] text-[14px]`} style={{ color: started ? INK : MUTED }}>
                {complete ? <CheckIcon color={SUCCESS} /> : started ? <Spinner size={14} /> : <span className="size-[16px]" />}
                {p.label}
              </span>
              <span className={`${FONT} leading-[20px] text-[13px] tabular-nums`} style={{ color: MUTED }}>
                {fmt(Math.min(n, p.total))} of {fmt(p.total)}
              </span>
            </div>
            <div className="h-[6px] overflow-hidden rounded-full" style={{ background: WASH }}>
              <div className="h-full rounded-full transition-[width] duration-150 ease-linear" style={{ width: `${p.total ? (Math.min(n, p.total) / p.total) * 100 : 100}%`, background: complete ? SUCCESS : DEEP }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── the dialog ── */

export default function ConnectWizard({
  crm,
  existing,
  onClose,
  onConnected,
}: {
  crm: CrmId;
  /** Set when editing a live connection: sign-in is skipped and the flow opens on the settings. */
  existing?: Connection | null;
  onClose: () => void;
  onConnected: (c: Connection) => void;
}) {
  const info = CRMS[crm];
  const editing = !!existing;
  const [s, setS] = useState<CrmSettings>(() => existing?.settings ?? { ...DEFAULT_SETTINGS, owner: info.owners[0] });
  const set = (p: Partial<CrmSettings>) => setS(prev => ({ ...prev, ...p }));
  const firstStep = editing ? info.steps.findIndex(st => st.id === (crm === "hubspot" ? "settings" : "routing")) : 0;
  const [step, setStep] = useState(firstStep);
  const [auth, setAuth] = useState<"idle" | "waiting" | "done">(editing ? "done" : "idle");
  const [checks, setChecks] = useState(editing ? SF_CHECKS.length : 0);
  const [run, setRun] = useState<"review" | "running" | "done">("review");
  const [phaseDone, setPhaseDone] = useState<number[]>([]);
  const phases = useMemo(() => phasesFor(crm, s), [crm, s]);
  const timer = useRef<number | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const current: StepId = info.steps[step].id;

  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current);
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
    setLeaving(false);
  }, [step]);

  /* Sign-in: a pause for the CRM's own window, then, for Salesforce, the access checks one by one. */
  const [authOpen, setAuthOpen] = useState(false);
  const authorize = () => {
    setAuth("waiting");
    if (crm === "hubspot") {
      setAuthOpen(true);
      return;
    }
    window.setTimeout(() => {
      setAuth("done");
      if (crm === "salesforce") {
        let n = 0;
        const id = window.setInterval(() => {
          n += 1;
          setChecks(n);
          if (n >= SF_CHECKS.length) window.clearInterval(id);
        }, 260);
      }
    }, 1500);
  };

  const ready = current === "authorize" ? auth === "done" && (crm === "hubspot" || checks >= SF_CHECKS.length) : true;

  const finish = () => {
    const p = preview(s, 30);
    const now = Date.now();
    const result = existing ? existing.result : { ...p, skipped: Math.max(1, Math.round(p.companies * 0.06)) };
    onConnected({
      account: info.account(s),
      settings: s,
      connectedAt: existing?.connectedAt ?? now,
      lastSyncAt: existing?.lastSyncAt ?? now,
      /* Editing changes what happens next, not what already ran. */
      result,
      setupDone: true,
      /* Version 1 runs its first sync inside the wizard, so it arrives with that run recorded. */
      runs: existing
        ? existing.runs
        : [
            {
              at: now,
              label: s.backfill ? "First sync · last 30 days" : "First sync",
              companies: s.backfill ? result.companies : 0,
              buyers: s.backfill ? result.buyers : 0,
              activity: s.backfill ? result.activity : 0,
              created: s.backfill ? Math.ceil(result.companies / 3) : 0,
              updated: s.backfill ? result.companies - Math.ceil(result.companies / 3) : 0,
              skipped: s.backfill ? result.skipped : 0,
              note: s.backfill ? undefined : "Software Finder fields created",
            },
          ],
    });
  };

  const startSync = () => {
    if (editing) {
      finish();
      return;
    }
    setRun("running");
    const totals = phases.map(p => p.total);
    let i = 0;
    const counts = totals.map(() => 0);
    /* About a second a phase, whatever its size. */
    timer.current = window.setInterval(() => {
      if (i >= totals.length) {
        if (timer.current) window.clearInterval(timer.current);
        setRun("done");
        return;
      }
      const stepBy = Math.max(1, Math.ceil(totals[i] / 14));
      counts[i] = Math.min(totals[i], counts[i] + stepBy);
      if (counts[i] >= totals[i]) i += 1;
      setPhaseDone([...counts]);
    }, 70);
  };

  /* Progress worth protecting: a sign-in, or any step past the first; when
     editing, any change to the saved settings. */
  const [leaving, setLeaving] = useState(false);
  const progressed = editing ? JSON.stringify(s) !== JSON.stringify(existing?.settings) : auth !== "idle" || step > 0;
  const close = () => {
    if (run === "running" || auth === "waiting") return;
    if (run === "done") {
      finish();
      onClose();
      return;
    }
    if (leaving) {
      setLeaving(false);
      return;
    }
    if (progressed) {
      setLeaving(true);
      return;
    }
    onClose();
  };
  useEscape(close);

  /* Keyboard and screen readers: each step's title takes focus as it arrives,
     focus stays inside the dialog, and it goes back to the card's button on close. */
  const headingRef = useRef<HTMLHeadingElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  /* Read during the first render, before the title takes focus, so it is the card's button. */
  const opener = useRef(document.activeElement as HTMLElement | null);
  useEffect(() => {
    const el = opener.current;
    return () => el?.focus?.();
  }, []);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [step, run]);
  const trapFocus = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const items = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === headingRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const isLast = step === info.steps.length - 1;
  const titles: Record<StepId, [string, string]> = {
    environment: ["Choose your Salesforce environment", "Connect your live org, or try the setup in a sandbox first."],
    authorize: [crm === "hubspot" ? "Connect your HubSpot account" : "Sign in to Salesforce", crm === "hubspot" ? "Approve access in HubSpot, then choose what to sync." : "Approve access, then we'll check the permissions the sync needs."],
    settings: ["Sync settings", "Choose what goes to HubSpot and what happens to records you already have."],
    routing: ["Records and routing", "Choose where each buyer lands in Salesforce."],
    mapping: ["Field mapping", `Check where each Software Finder field lands in ${info.name}. New fields are created for you.`],
    backfill: ["Backfill", "Choose whether to send recent history along with new activity."],
    sync:
      run === "done"
        ? [`${info.name} is connected`, s.backfill ? "Your last 30 days are in, and new activity will keep syncing every hour." : "New activity will sync every hour."]
        : run === "running"
          ? [`Syncing to ${info.name}`, "This takes a moment. You can leave this open."]
          : [editing ? "Review changes" : "Review and sync", editing ? "Your changes apply from the next sync." : "Check your choices, then start the first sync."],
  };

  return (
    <>
    {createPortal(
    <div className="fixed inset-0 z-[9500] flex items-center justify-center" data-name="CRM Connect">
      <div aria-hidden className="absolute inset-0" style={{ background: "rgba(47,43,61,0.45)" }} />
      <div
        ref={dialogRef}
        onKeyDown={trapFocus}
        role="dialog"
        aria-modal="true"
        aria-labelledby="crm-connect-title"
        className="relative flex h-[min(720px,calc(100vh-48px))] w-[min(1000px,calc(100vw-48px))] overflow-hidden rounded-[16px] bg-white"
        style={{ boxShadow: "0px 4px 18px 0px rgba(47,43,61,0.16)" }}
      >
        {/* The steps. */}
        <aside className="flex w-[264px] shrink-0 flex-col gap-[24px] border-r px-[20px] py-[24px]" style={{ background: "#faf9f8", borderColor: HAIR }}>
          <div className="flex items-center gap-[12px]">
            <span className="flex size-[40px] items-center justify-center rounded-[10px] bg-white" style={{ border: `1px solid ${HAIR}` }}>
              <CrmLogo crm={crm} size={22} />
            </span>
            <div className="flex flex-col">
              <span className={`${FONT} font-medium leading-[21px] text-[15px]`} style={{ color: INK }}>
                {editing ? `Edit ${info.name}` : `Connect ${info.name}`}
              </span>
              <span className={`${FONT} leading-[18px] text-[12px]`} style={{ color: MUTED }}>
                {info.category}
              </span>
            </div>
          </div>
          <ol className="flex flex-col gap-[2px]">
            {info.steps.map((st, i) => {
              const done = i < step || (isLast && run === "done");
              const on = i === step;
              const reachable = i < step && run === "review" && (!editing || i >= firstStep);
              return (
                <li key={st.id}>
                  <button
                    type="button"
                    disabled={!reachable}
                    onClick={() => setStep(i)}
                    aria-current={on ? "step" : undefined}
                    className={`${FONT} flex w-full items-center gap-[10px] rounded-[8px] px-[8px] py-[7px] text-left leading-[20px] text-[13px] transition-colors ${reachable ? "cursor-pointer hover:bg-[rgba(7,41,41,0.05)]" : "cursor-default"}`}
                    style={{ background: on ? "rgba(7,41,41,0.06)" : undefined, color: on ? INK : done ? INK : MUTED, fontWeight: on ? 500 : 400 }}
                  >
                    {/* Filled marks, no outlines: the current step in the primary
                        green, a finished one in the brand's limelight green, the
                        rest a quiet wash. */}
                    <span
                      className="flex size-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-medium tabular-nums"
                      style={{ background: on ? DEEP : done ? LIME : "rgba(47,43,61,0.07)", color: on ? "#fff" : done ? DEEP : MUTED }}
                    >
                      {done && !on ? <CheckIcon color={DEEP} size={12} /> : i + 1}
                    </span>
                    {st.label}
                  </button>
                </li>
              );
            })}
          </ol>
          <a
            href="#crm-setup-guide"
            onClick={e => e.preventDefault()}
            className={`${FONT} mt-auto inline-flex items-center gap-[6px] self-start whitespace-nowrap rounded-[4px] font-medium leading-[20px] text-[13px] transition-colors hover:underline hover:underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072929] focus-visible:ring-offset-2`}
            style={{ color: DEEP }}
          >
            <DocsIcon />
            View {info.name} Docs
          </a>
        </aside>

        {/* The step. */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-start justify-between gap-[16px] px-[28px] pb-[16px] pt-[24px]">
            <div className="flex flex-col gap-[4px]">
              <h2 id="crm-connect-title" ref={headingRef} tabIndex={-1} className={`${FONT} font-medium leading-[28px] text-[20px] outline-none`} style={{ color: INK }}>
                {titles[current][0]}
              </h2>
              <p className={`${FONT} leading-[20px] text-[14px]`} style={{ color: MUTED }}>
                {titles[current][1]}
              </p>
            </div>
            {run !== "running" && (
              <button
                type="button"
                aria-label="Close"
                onClick={close}
                className="flex size-[28px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] transition-colors hover:bg-[rgba(7,41,41,0.06)]"
              >
                <CloseIcon />
              </button>
            )}
          </header>

          <div ref={bodyRef} className="flex min-h-0 flex-1 flex-col gap-[24px] overflow-y-auto px-[28px] pb-[24px] [&>*]:shrink-0">
            {current === "environment" && <EnvironmentStep s={s} set={set} />}
            {current === "authorize" && (
              <AuthorizeStep
                crm={crm}
                s={s}
                auth={auth}
                checks={checks}
                onReset={() => {
                  setAuth("idle");
                  setChecks(0);
                }}
              />
            )}
            {current === "settings" && <HubSpotSettingsStep s={s} set={set} />}
            {current === "routing" && <SalesforceRoutingStep s={s} set={set} />}
            {current === "mapping" && <MappingStep crm={crm} s={s} set={set} />}
            {current === "backfill" && <BackfillStep crm={crm} s={s} set={set} />}
            {current === "sync" && (run === "review" ? <ReviewRows crm={crm} s={s} /> : <SyncProgress phases={phases} done={phaseDone} />)}
            {current === "sync" && run === "done" && (
              <Callout tone="success">
                {crm === "hubspot" ? (
                  <>
                    To see intent activity on a record, open its activity timeline and turn on the <b className="font-medium">Software Finder</b> filter. Each person does this once.
                  </>
                ) : (
                  <>
                    Add the <b className="font-medium">SF</b> fields to your Account and Lead page layouts so your team sees them on records.
                  </>
                )}
              </Callout>
            )}
          </div>

          <footer className="flex items-center justify-between gap-[12px] border-t px-[28px] py-[16px]" style={{ borderColor: HAIR }}>
            <div>
              {step > firstStep && run === "review" && (
                <OutlineButton size="sm" onClick={() => setStep(step - 1)}>
                  Back
                </OutlineButton>
              )}
            </div>
            <div className="flex items-center gap-[12px]">
              {leaving ? (
                /* Closing after progress asks first, in place, rather than throwing the setup away. */
                <>
                  <span className={`${FONT} leading-[20px] text-[13px]`} style={{ color: INK }} role="alert">
                    {editing ? "Leave without saving your changes?" : `Leave setup? Nothing has been sent to ${info.name} yet.`}
                  </span>
                  <OutlineButton size="sm" onClick={() => setLeaving(false)}>
                    Keep setting up
                  </OutlineButton>
                  <InkButton size="sm" onClick={onClose}>
                    Leave
                  </InkButton>
                </>
              ) : current === "authorize" && auth !== "done" ? (
                <InkButton size="sm" disabled={auth === "waiting"} busy={auth === "waiting"} onClick={authorize}>
                  {auth === "waiting" ? (
                    <>
                      <Spinner size={14} color="#fff" />
                      Waiting for {info.name}
                    </>
                  ) : crm === "hubspot" ? (
                    "Continue to HubSpot"
                  ) : (
                    "Sign in to Salesforce"
                  )}
                </InkButton>
              ) : (
                <>
                  {current === "authorize" && !ready && (
                    <span className={`${FONT} text-[13px]`} style={{ color: MUTED }}>
                      Checking access…
                    </span>
                  )}
                  {!isLast && (
                    <InkButton size="sm" disabled={!ready} onClick={() => setStep(step + 1)}>
                      Continue
                    </InkButton>
                  )}
                </>
              )}
              {isLast && run === "review" && (
                <InkButton size="sm" onClick={startSync}>
                  {editing ? "Save changes" : s.backfill ? "Start sync" : "Connect"}
                </InkButton>
              )}
              {isLast && run === "running" && (
                <InkButton size="sm" disabled busy>
                  <Spinner size={14} color="#fff" />
                  Syncing
                </InkButton>
              )}
              {isLast && run === "done" && (
                <InkButton
                  size="sm"
                  onClick={() => {
                    finish();
                    onClose();
                  }}
                >
                  Done
                </InkButton>
              )}
            </div>
          </footer>
        </div>
      </div>
    </div>,
    document.body,
  )}
    {authOpen && (
      <CrmAuthWindow
        onDone={() => {
          setAuthOpen(false);
          setAuth("done");
        }}
        onCancel={() => {
          setAuthOpen(false);
          setAuth("idle");
        }}
      />
    )}
    </>
  );
}
