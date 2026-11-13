/**
 * The sync settings, written once and shown the same way in two places: as
 * the steps of the connect dialog, and as the sections of a connected CRM's
 * Settings tab. Same names, same order, same rows, same controls — what you
 * set up is exactly what you find later (Hightouch's Configuration and
 * Schedule tabs edit the same choices its setup asked).
 *
 * Each section is one card of rows: what the setting is on the left, its
 * control on the right, rows divided by a hairline (Linear's and GitHub's
 * settings rows). On/off settings are switches; lists of options are
 * dropdowns, so nothing is a box inside a box.
 */

import { createContext, useContext, useState, type ReactNode } from "react"
import { Select } from "./ConnectWizard"
import {
  CRMS,
  FREQUENCY,
  type Audience,
  type CrmId,
  type CrmSettings,
  type Frequency,
} from "./crm"
import { DEEP, FONT, HAIR, INK, MUTED } from "./ui"

type Props = {
  crm: CrmId
  s: CrmSettings
  set: (p: Partial<CrmSettings>) => void
}

/** One name per section, used for the setup step and the Settings section alike. A line under it only when it says something the name doesn't. */
export function sectionCopy(crm: CrmId): Record<"companies" | "records" | "mapping" | "schedule", { title: string; description?: string }> {
  const hs = crm === "hubspot"
  return {
    companies: { title: "Filter Companies" },
    records: { title: "Configure Records" },
    mapping: {
      title: "Field Mapping",
      description: hs
        ? "Standard properties are only filled when empty. New ones go in a “Software Finder” group."
        : "Standard fields are only filled when empty. New Software Finder fields are created for you.",
    },
    schedule: { title: "Schedule" },
  }
}

/* Salesforce's two routing questions, folded into the three combinations people actually pick. */
type Route = "standard" | "leads" | "existing"
const ROUTES: Record<Route, Pick<CrmSettings, "knownAccount" | "noAccount">> = {
  standard: { knownAccount: "contact", noAccount: "lead" },
  leads: { knownAccount: "lead", noAccount: "lead" },
  existing: { knownAccount: "contact", noAccount: "skip" },
}
const routeOf = (s: CrmSettings): Route =>
  s.knownAccount === "lead"
    ? "leads"
    : s.noAccount === "skip"
      ? "existing"
      : "standard"
const ROUTE_HINT: Record<Route, string> = {
  standard: "Contacts on an existing Account; Leads when there's no Account.",
  leads: "Leads, even when the company is already an Account.",
  existing: "Contacts only. Contacts with no Account are skipped.",
}
/* When new Accounts are created every company has one, so "Leads when there is no Account" cannot happen: the choice is only Contacts or Leads. */
const ROUTE_HINT_CREATE = {
  standard: "Contacts on the company's Account.",
  leads: "Leads, even when the company is already an Account.",
}

const ROW =
  "flex flex-wrap items-center justify-between gap-x-[24px] gap-y-[10px] py-[14px]"
const SELECT_W = 264

/** A section's single card: rows inside, divided by hairlines. */
/**
 * A section's name, when the card should carry it as its first row (the
 * connected page's Settings tab, as Hightouch titles its configuration cards).
 * In the setup panel the step's heading already names the card, so it is unset.
 */
export const CardTitle = createContext<{ title: string; tip?: string } | undefined>(undefined)

/*
 * Linear's settings card: dividers inset from the edges, not ruled across.
 * On the connected page (off-white) it is a plain white fill with no border;
 * in the setup panel (itself white) it keeps a hairline so it still reads as
 * one group.
 */
export function SettingsCard({ children }: { children: ReactNode }) {
  const card = useContext(CardTitle)
  if (card)
    return (
      <div className="flex flex-col rounded-[12px] bg-white px-[24px] pb-[10px] pt-[22px]">
        {/* The portal's card heading: the name, then an ⓘ that says what the section covers (Profile Management's "Video ⓘ"). */}
        <h2 className={`${FONT} flex items-center gap-[8px] font-medium leading-[28px] text-[20px]`} style={{ color: INK }}>
          {card.title}
          {card.tip && <Hint text={card.tip} />}
        </h2>
        <div className="flex flex-col divide-y divide-[rgba(47,43,61,0.08)]">{children}</div>
      </div>
    )
  return (
    <div
      className="flex flex-col divide-y divide-[rgba(47,43,61,0.08)] rounded-[16px] bg-white px-[20px]"
      style={{ border: `1px solid ${HAIR}` }}
    >
      {children}
    </div>
  )
}

/*
 * An explanation behind a small ⓘ: shown on hover or keyboard focus, silent
 * otherwise (Linear's, Notion's and Slack's settings keep rows to a label).
 * A button inside the row's label, so clicking it never flips the switch.
 */
function Hint({ text }: { text: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-flex align-middle" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        aria-label={typeof text === "string" ? text : "More information"}
        onClick={(e) => e.preventDefault()}
        className="flex size-[20px] cursor-help items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072929]"
      >
        {/* The vendor portal's info icon, exactly (Profile Management, "Video ⓘ"). */}
        <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden className="block">
          <circle cx="11" cy="11" r="8.25" stroke="#2F2B3D" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 7.33333H11.0092" stroke="#2F2B3D" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10.0833 11H11V14.6667H11.9166" stroke="#2F2B3D" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {/* The portal's tooltip: white, a light border, beside the icon and centred on it. */}
      <span
        role="tooltip"
        className={`${FONT} pointer-events-none absolute left-full top-1/2 z-30 ml-[12px] w-max max-w-[400px] -translate-y-1/2 rounded-[10px] bg-white px-[16px] py-[10px] text-left font-normal leading-[22px] text-[15px] transition-opacity duration-150 motion-reduce:transition-none`}
        style={{ color: INK, border: "1px solid rgba(47,43,61,0.12)", boxShadow: "0 4px 18px rgba(47,43,61,0.08)", opacity: open ? 1 : 0 }}
      >
        {text}
      </span>
    </span>
  )
}

function RowText({ label, hint }: { label: string; hint?: ReactNode }) {
  return (
    <span className="flex min-w-[220px] flex-1 flex-col gap-[2px]">
      <span
        className={`${FONT} font-medium leading-[22px] text-[15px]`}
        style={{ color: INK }}
      >
        {label}
      </span>
      {hint && (
        <span
          className={`${FONT} leading-[20px] text-[14px]`}
          style={{ color: MUTED }}
        >
          {hint}
        </span>
      )}
    </span>
  )
}

function SelectRow({
  label,
  hint,
  value,
  onChange,
  options,
}: {
  label: string
  hint?: ReactNode
  value: string
  onChange: (v: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <div className={ROW}>
      <RowText label={label} hint={hint} />
      <div className="shrink-0">
        <Select
          label={label}
          value={value}
          onChange={onChange}
          options={options}
          width={SELECT_W}
        />
      </div>
    </div>
  )
}

/*
 * Two controls, by what the setting is:
 * - SwitchRow, a toggle at the row's end, turns an ongoing feature on or off
 *   (creating records, logging visits): it states what keeps happening.
 * - CheckRow, a box before the label, picks what's included or a one-time
 *   choice (companies with no revealed contacts, the 30-day start).
 * The whole row is the label in both, so the target is the row.
 */
function SwitchRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: ReactNode
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className={`${ROW} cursor-pointer`}>
      <RowText label={label} hint={hint} />
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="relative h-[18px] w-[32px] shrink-0 rounded-full transition-colors duration-150 motion-reduce:transition-none peer-focus-visible:ring-2 peer-focus-visible:ring-[#072929] peer-focus-visible:ring-offset-2"
        style={{ background: checked ? DEEP : "rgba(47,43,61,0.2)" }}
      >
        <span
          className="absolute left-[2px] top-[2px] size-[14px] rounded-full bg-white transition-transform duration-150 ease-out motion-reduce:transition-none"
          style={{
            transform: checked ? "translateX(14px)" : "none",
            boxShadow: "0 1px 2px rgba(7,41,41,0.25)",
          }}
        />
      </span>
    </label>
  )
}

/*
 * A box before the label, for what's included or a one-time choice. Each label
 * reads as a full yes/no on its own, so an empty box needs no explanation.
 */
function CheckRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: ReactNode
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-[12px] py-[14px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="mt-[3px] flex size-[16px] shrink-0 items-center justify-center rounded-[4px] transition-colors duration-150 motion-reduce:transition-none peer-focus-visible:ring-2 peer-focus-visible:ring-[#072929] peer-focus-visible:ring-offset-2"
        style={
          checked
            ? { background: DEEP }
            : { background: "#fff", boxShadow: "inset 0 0 0 1px rgba(47,43,61,0.28)" }
        }
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5.2 4.1 7.3 8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <RowText label={label} hint={hint} />
    </label>
  )
}

/**
 * Which companies sync. In setup the checkbox sits under the card, adding to the
 * score; on the Settings tab (`inCard`) it's a row inside the Filter Companies
 * card, so the section reads as one card like the others there.
 */
export function CompaniesRows({ s, set, inCard = false }: Props & { inCard?: boolean }) {
  const contactsRow = (
    <CheckRow
      label="Also sync companies with no revealed contacts"
      checked={s.audience !== "revealed"}
      onChange={(on) =>
        set({ audience: (on ? "all" : "revealed") as Audience })
      }
    />
  )
  return (
    <div className="flex flex-col gap-[4px]">
      <SettingsCard>
        <SelectRow
          label="Minimum intent score"
          hint="We recommend 51% and up."
          value={String(s.minIntent)}
          onChange={(v) =>
            set({ manual: false, minIntent: Number(v) as 30 | 51 | 71 })
          }
          options={[
            { value: "71", label: "71% and up · High" },
            { value: "51", label: "51% and up · Medium and high" },
            { value: "30", label: "30% and up · All" },
          ]}
        />
        {inCard && contactsRow}
      </SettingsCard>
      {!inCard && contactsRow}
    </div>
  )
}

/** How they land in the CRM: create or only update, what people become (Salesforce), who owns them, and visits. */
export function RecordsRows({ crm, s, set }: Props) {
  const hs = crm === "hubspot"
  const owners = CRMS[crm].owners
  return (
    <SettingsCard>
      {/* The match key is said here, where it explains what "existing" means. */}
      {/* Salesforce has no create-Accounts switch: Accounts are only matched and updated, and "Send revealed contacts as" says where people go when there's no Account. */}
      {hs && (
        <SwitchRow
          label="Add companies that aren't in HubSpot yet"
          hint="Companies already in HubSpot are always updated. We find them by website domain."
          checked={s.newCompany === "create"}
          onChange={(on) => set({ newCompany: on ? "create" : "skip" })}
        />
      )}
      {!hs && (
        <SelectRow
          label="Send revealed contacts as"
          hint={
            s.accounts === "create"
              ? ROUTE_HINT_CREATE[routeOf(s) === "leads" ? "leads" : "standard"]
              : ROUTE_HINT[routeOf(s)]
          }
          value={
            s.accounts === "create" && routeOf(s) === "existing"
              ? "standard"
              : routeOf(s)
          }
          onChange={(r) => set(ROUTES[(r as Route)])}
          options={
            s.accounts === "create"
              ? [
                  { value: "standard", label: "Contacts" },
                  { value: "leads", label: "Leads" },
                ]
              : [
                  { value: "standard", label: "Contacts, or Leads" },
                  { value: "leads", label: "Leads" },
                  { value: "existing", label: "Contacts only" },
                ]
          }
        />
      )}
      <SelectRow
        label="Owner of new records"
        hint="Existing records keep their owner."
        value={owners.includes(s.owner) ? s.owner : owners[0]}
        onChange={(owner) => set({ owner })}
        options={owners.map((o) => ({ value: o, label: o }))}
      />
      <SwitchRow
        label={
          hs ? "Add buyer visits to the company timeline" : "Log buyer visits as Tasks"
        }
        hint={
          hs
            ? "One event per company per day, listing the pages they viewed on Software Finder."
            : "One completed Task per company per day on the Account or Lead, listing the pages viewed."
        }
        checked={s.sendActivity}
        onChange={(sendActivity) => set({ sendActivity })}
      />
    </SettingsCard>
  )
}

/** How often it runs. `firstSync` adds the one-time 30-day start, which only means something before the first run. */
export function ScheduleRows({
  s,
  set,
  firstSync = false,
}: Props & { firstSync?: boolean }) {
  /* As on Filter Companies: the setting in the card, the checkbox that adds to it just below. */
  return (
    <div className="flex flex-col gap-[4px]">
      <SettingsCard>
        <SelectRow
          label="Sync frequency"
          value={s.frequency}
          onChange={(v) => set({ frequency: v as Frequency })}
          options={(["1h", "1d", "1w"] as Frequency[]).map((f) => ({
            value: f,
            label: FREQUENCY[f].label,
          }))}
        />
      </SettingsCard>
      {firstSync && (
        <CheckRow
          label="Start with the last 30 days of buyer intent"
          checked={s.backfill}
          onChange={(backfill) => set({ backfill })}
        />
      )}
    </div>
  )
}
