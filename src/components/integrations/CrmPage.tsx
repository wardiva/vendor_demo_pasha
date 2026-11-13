/**
 * A connected CRM's own page. The header answers "is it working?" (status,
 * last synced, Sync now). Below it, three tabs, as Hightouch turns its setup
 * steps into tabs on the sync it created:
 * - Syncs: what was sent, one fact per cell, a run in progress shown live.
 * - Settings: the setup's own questions, edited in place, then the account and
 *   Disconnect. Reconnect appears only once the connection has expired: a banner
 *   above the tabs, and beside Disconnect in the account card.
 * - Field mapping: the mapping table, edited in place.
 * Edits are held as a draft across both editable tabs; a bar offers Save or
 * Discard only while something has changed. Nothing reopens the setup dialog.
 */

import { useEffect, useState, type ReactNode } from "react"
import CrmLogo from "./CrmLogo"
import { MappingStep } from "./ConnectWizard"
import {
  CRMS,
  FREQUENCY,
  timeAgo,
  type Connection,
  type CrmId,
  type CrmSettings,
  type SyncRun,
} from "./crm"
import {
  CardTitle,
  CompaniesRows,
  ScheduleRows,
  SettingsCard,
  sectionCopy,
} from "./SetupSections"
import {
  CheckIcon,
  Chip,
  DEEP,
  FONT,
  HAIR,
  INK,
  InkButton,
  MUTED,
  OutlineButton,
  Spinner,
  SUCCESS,
} from "./ui"

type Tab = "syncs" | "settings" | "mapping"

const fmt = (n: number) => n.toLocaleString("en-US")
const formatDate = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
const formatStart = (ms: number) => {
  const d = new Date(ms)
  const today = new Date().toDateString() === d.toDateString()
  return `${
    today ? "Today" : formatDate(ms)
  } · ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
}

const AMBER = "#d99a2b"
const FAILED = "#D92D20"

export default function CrmPage({
  crm,
  connection,
  run,
  onBack,
  onSave,
  onSyncNow,
  onDisconnect,
  onReconnect,
  /** The sync running now, if one is. */
  /** Saves edited settings onto the connection; they apply from the next sync. */
}: {
  crm: CrmId
  connection: Connection
  run: SyncRun | null
  onBack: () => void
  onSave: (settings: CrmSettings) => void
  onSyncNow: () => void
  onDisconnect: () => void
  /** Signs in again, keeping every setting and mapping: for an expired token or a different admin. */
  onReconnect: () => void
}) {
  const info = CRMS[crm]
  const [confirming, setConfirming] = useState(false)
  const [tab, setTab] = useState<Tab>("syncs")
  const s = connection.settings
  /* The draft both editable tabs share; it follows the saved settings until something is changed. */
  const [draft, setDraft] = useState<CrmSettings>(s)
  const [saved, setSaved] = useState(false)
  useEffect(() => setDraft(s), [s])
  useEffect(() => {
    if (!saved) return
    const id = window.setTimeout(() => setSaved(false), 2400)
    return () => window.clearTimeout(id)
  }, [saved])
  const set = (p: Partial<CrmSettings>) =>
    setDraft((prev) => ({ ...prev, ...p }))
  const dirty = JSON.stringify(draft) !== JSON.stringify(s)
  const save = () => {
    onSave(draft)
    setSaved(true)
  }
  const manual = s.manual
  const expired = !!connection.expired
  const hs = crm === "hubspot"
  const nouns = hs
    ? ["Companies", "Contacts", "Activity"]
    : ["Accounts", "Leads and Contacts", "Tasks"]

  /* Every run that really happened, newest first, as stored when it finished. */
  const runs = connection.runs
  const anySkipped = runs.some((r) => r.skipped > 0)

  const pct = run ? Math.round((run.done / Math.max(1, run.total)) * 100) : 0
  const th = `${FONT} px-[16px] py-[10px] text-left font-medium uppercase leading-[18px] text-[12px] tracking-[0.4px]`
  const td = `${FONT} px-[16px] py-[13px] leading-[20px] text-[14px]`
  const num = `${td} tabular-nums`
  const dot = (color: string) => (
    <span
      className="size-[7px] shrink-0 rounded-full"
      style={{ background: color }}
    />
  )

  /* One fact per cell, as Hightouch lists runs: when, which sync, the counts, and the result at the end. */
  const syncs =
    !runs.length ? (
      <p
        className={`${FONT} rounded-[12px] bg-white py-[24px] text-center leading-[20px] text-[13px]`}
        style={{ color: MUTED, border: `1px solid ${HAIR}` }}
      >
        {manual
          ? "Nothing is sent automatically. Send buyers from Prospects and each send shows here."
          : run
            ? "Your first sync is running. It shows here when it finishes."
            : `No syncs yet. The first one runs ${FREQUENCY[s.frequency].next}, or select Sync now.`}
      </p>
    ) : (
      <div className="flex flex-col gap-[10px]">
        <div
          className="overflow-x-auto rounded-[12px] bg-white"
          style={{ border: `1px solid ${HAIR}` }}
        >
          <table className="w-full min-w-[680px] border-collapse">
            <thead>
              <tr
                style={{
                  background: "#f3f2f0",
                  borderBottom: `1px solid ${HAIR}`,
                }}
              >
                {["When", "Sync", nouns[0], nouns[1], nouns[2], "Result"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={th}
                      style={{ color: MUTED }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {/* Only finished runs: a run in progress shows in the bottom-right panel, and lands here when it finishes. */}
              {runs.map((row, i) => (
                <tr
                  key={row.at}
                  style={{
                    borderTop: i ? `1px solid ${HAIR}` : undefined,
                  }}
                >
                  <td
                    className={`${td} whitespace-nowrap`}
                    style={{ color: INK }}
                  >
                    {formatStart(row.at)}
                  </td>
                  <td className={td} style={{ color: INK }}>
                    {row.label}
                  </td>
                  <td
                    className={num}
                    style={{ color: row.failed ? MUTED : INK }}
                    title={
                      row.companies
                        ? `${row.created} new · ${row.updated} updated`
                        : undefined
                    }
                  >
                    {row.failed ? "–" : fmt(row.companies)}
                  </td>
                  <td className={num} style={{ color: row.failed ? MUTED : INK }}>
                    {row.failed ? "–" : fmt(row.buyers)}
                  </td>
                  <td className={num} style={{ color: row.failed ? MUTED : INK }}>
                    {row.failed ? "–" : fmt(row.activity)}
                  </td>
                  <td className={td}>
                    <span
                      className="flex items-center gap-[8px] whitespace-nowrap"
                      style={{ color: INK }}
                    >
                      {row.failed ? (
                        <>
                          {dot(FAILED)}
                          Failed
                          <span style={{ color: MUTED }}>· {row.failed}</span>
                        </>
                      ) : row.note ? (
                        <>
                          {dot(SUCCESS)}
                          {row.note}
                        </>
                      ) : row.companies || row.skipped ? (
                        <>
                          {dot(SUCCESS)}
                          Done
                          {row.skipped > 0 && (
                            <span
                              tabIndex={0}
                              className="cursor-help rounded-[2px] underline decoration-dotted decoration-[rgba(47,43,61,0.35)] underline-offset-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072929]"
                              style={{ color: MUTED }}
                              title={`No website domain in Software Finder yet, so ${row.skipped === 1 ? "it can't" : "they can't"} be matched ${hs ? "in HubSpot" : "to a Salesforce Account"}. ${row.skipped === 1 ? "It syncs" : "They sync"} once one is found.`}
                            >
                              · {row.skipped} {hs ? (row.skipped === 1 ? "company" : "companies") : row.skipped === 1 ? "Account" : "Accounts"} skipped
                            </span>
                          )}
                        </>
                      ) : (
                        <span style={{ color: MUTED }}>Nothing new</span>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )

  /*
   * A section: its name and one line on what it covers sit above a single white
   * card; inside, one setting per row divided by hairlines (Linear, GitHub,
   * Vercel, Hightouch all separate settings this way). One card per section,
   * nothing boxed inside it.
   */
  /* Each section's name above its card; the cards run the page's full width, edge to edge with the header and tabs above. */
  /* Each section is one card with its name as the card's first row, inside it rather than floating above. */
  /* Linear's settings: a plain heading, the card 12px below it, generous space between sections. */
  const section = (title: string, tip: string | undefined, body: ReactNode) => (
    <section aria-label={title}>
      <CardTitle.Provider value={{ title, tip }}>{body}</CardTitle.Provider>
    </section>
  )
  /* One sentence each, behind the heading's ⓘ: what the section decides. */
  const tips = hs
    ? {
        companies: "Which companies sync to HubSpot, based on their intent score and contacts.",
        records: "How companies and contacts are created, owned and updated in HubSpot.",
        schedule: "How often new buyer activity syncs to HubSpot.",
        connection: "The HubSpot account Software Finder syncs to.",
      }
    : {
        companies: "Which companies sync to Salesforce, based on their intent score and contacts.",
        records: "How Accounts, Leads and Contacts are created, owned and updated in Salesforce.",
        schedule: "How often new buyer activity syncs to Salesforce.",
        connection: "The Salesforce org Software Finder syncs to.",
      }

  const copy = sectionCopy(crm)
  const settings = (
    <div className="flex w-full flex-col gap-[16px]">
      {section(
        copy.companies.title,
        tips.companies,
        <CompaniesRows crm={crm} s={draft} set={set} inCard />,
      )}
      {/* No Configure Records card: how records land is fixed, and listed when connecting. */}
      {section(
        copy.schedule.title,
        tips.schedule,
        <ScheduleRows crm={crm} s={draft} set={set} />,
      )}
      {/* Last, apart from the rest: the account, and the one destructive action, confirmed in place. */}
      {section(
        "Connection",
        tips.connection,
        <SettingsCard>
          {confirming ? (
            <div
              className="-mx-[8px] my-[8px] flex flex-wrap items-center justify-between gap-x-[24px] gap-y-[12px] rounded-[8px] px-[12px] py-[12px]"
              style={{ background: "#FFF5F5" }}
            >
              <p
                className={`${FONT} min-w-[220px] flex-1 leading-[20px] text-[14px]`}
                style={{ color: INK }}
              >
                <b className="font-medium">Disconnect {info.name}?</b> New
                activity stops syncing. Everything already in {info.name} stays
                there.
              </p>
              <div className="flex shrink-0 gap-[8px]">
                <OutlineButton size="sm" onClick={() => setConfirming(false)}>
                  Cancel
                </OutlineButton>
                <OutlineButton size="sm" tone="danger" onClick={onDisconnect}>
                  Disconnect {info.name}
                </OutlineButton>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-x-[24px] gap-y-[10px] py-[14px]">
              <span className="flex min-w-[220px] flex-1 flex-col gap-[2px]">
                <span
                  className={`${FONT} font-medium leading-[20px] text-[14px]`}
                  style={{ color: INK }}
                >
                  {connection.account.name}
                </span>
                <span
                  className={`${FONT} leading-[18px] text-[13px]`}
                  style={{ color: MUTED }}
                >
                  {connection.account.detail} ·{" "}
                  {expired ? (
                    <span style={{ color: "#8A5300" }}>Connection expired</span>
                  ) : (
                    <>connected by you on {formatDate(connection.connectedAt)}</>
                  )}
                </span>
              </span>
              <div className="flex shrink-0 gap-[8px]">
                {/* Only when it's needed: a healthy connection has nothing to reconnect. */}
                {expired && (
                  <OutlineButton size="sm" onClick={onReconnect}>
                    Reconnect
                  </OutlineButton>
                )}
                <OutlineButton
                  size="sm"
                  tone="danger"
                  onClick={() => setConfirming(true)}
                >
                  Disconnect
                </OutlineButton>
              </div>
            </div>
          )}
        </SettingsCard>,
      )}
    </div>
  )

  const mapping = (
    <div className="flex w-full flex-col gap-[16px]">
      <MappingStep crm={crm} s={draft} set={set} quiet onPage />
    </div>
  )


  return (
    <div className="flex w-full flex-col gap-[20px]" data-name="CRM Page">
      <nav
        aria-label="Breadcrumb"
        className={`${FONT} flex items-center gap-[6px] leading-[20px] text-[13px]`}
        style={{ color: MUTED }}
      >
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer rounded-[2px] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072929]"
          style={{ color: MUTED }}
        >
          Integrations
        </button>
        <span aria-hidden>›</span>
        <span aria-current="page" style={{ color: INK }}>
          {info.name}
        </span>
      </nav>

      <header className="flex items-start justify-between gap-[16px]">
        <div className="flex min-w-0 items-center gap-[14px]">
          <span
            className="flex size-[48px] shrink-0 items-center justify-center rounded-[12px] bg-white"
            style={{ border: `1px solid ${HAIR}` }}
          >
            <CrmLogo crm={crm} size={26} />
          </span>
          <div className="flex min-w-0 flex-col gap-[4px]">
            <div className="flex items-center gap-[10px]">
              <h1
                className={`${FONT} font-medium leading-[40px] text-[32px]`}
                style={{ color: INK }}
              >
                {info.name}
              </h1>
              {expired ? (
                <Chip tone="warn">Reconnect needed</Chip>
              ) : run ? (
                <Chip tone="wash">
                  <Spinner size={10} />
                  Syncing
                </Chip>
              ) : (
                <Chip tone="live">
                  <span
                    className="size-[6px] rounded-full"
                    style={{ background: SUCCESS }}
                  />
                  Connected
                </Chip>
              )}
            </div>
            {/* One line: is it working, and when does it next run. */}
            <p
              className={`${FONT} truncate leading-[20px] text-[13px]`}
              style={{ color: MUTED }}
              role="status"
              aria-live="polite"
            >
              {expired
                ? `Syncing paused · last synced ${timeAgo(connection.lastSyncAt)}`
                : run
                ? run.first
                  ? "First sync running"
                  : "Syncing now"
                : manual
                  ? "Sends only when you choose"
                  : runs.length
                    ? `Last synced ${timeAgo(connection.lastSyncAt)} · next ${FREQUENCY[s.frequency].next}`
                    : "Not synced yet"}
            </p>
          </div>
        </div>
        {!manual && /* The page's one primary action. */
        (
          <InkButton
            size="sm"
            onClick={onSyncNow}
            disabled={!!run || expired}
            busy={!!run}
          >
            {run ? (
              <>
                <Spinner size={12} color="#fff" />
                Syncing…
              </>
            ) : (
              "Sync Now"
            )}
          </InkButton>
        )}
      </header>

      {/* The one place Reconnect leads: only once the CRM has stopped accepting the connection. */}
      {expired && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-x-[24px] gap-y-[12px] rounded-[12px] px-[20px] py-[14px]"
          style={{ background: "#FDF3E2" }}
        >
          <div className="flex min-w-[260px] flex-1 items-start gap-[10px]">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden className="block shrink-0">
                <path d="M11 7.33398V10.8004" stroke="#8A5300" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M11 14.2441L11 14.2877" stroke="#8A5300" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path
                  d="M4.58197 17.4165H17.4153C18.0226 17.4122 18.5884 17.1075 18.9262 16.6027C19.2639 16.0979 19.3297 15.4587 19.102 14.8956L12.5936 3.66648C12.2707 3.0829 11.6564 2.7207 10.9895 2.7207C10.3225 2.7207 9.70818 3.0829 9.3853 3.66648L2.87697 14.8956C2.65366 15.4454 2.71024 16.0692 3.02881 16.5698C3.34738 17.0705 3.88854 17.3859 4.48113 17.4165"
                  stroke="#8A5300"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            <div className={`${FONT} flex flex-col gap-[2px] leading-[20px] text-[14px]`}>
              <p style={{ color: INK }}>
                <b className="font-medium">{info.name} connection expired.</b>{" "}
                This usually happens when the person who connected it leaves or loses admin access.
              </p>
              <p style={{ color: MUTED }}>
                Reconnect as {hs ? "a HubSpot Super Admin" : "a Salesforce admin"}. Activity from the pause syncs straight away, and your settings are kept.
              </p>
            </div>
          </div>
          <InkButton size="sm" onClick={onReconnect}>
            Reconnect
          </InkButton>
        </div>
      )}

      <div
        role="tablist"
        aria-label={`${info.name} connection`}
        className="-mb-[4px] flex gap-[24px] border-b"
        style={{ borderColor: HAIR }}
      >
        {([
          ["syncs", "Sync Log"],
          ["settings", "Settings"],
          ["mapping", "Field Mapping"],
        ] as Array<[Tab, string]>).map(([id, label]) => {
          const on = id === tab
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`crm-tab-${id}`}
              aria-selected={on}
              aria-controls={`crm-panel-${id}`}
              onClick={() => setTab(id)}
              className={`${FONT} -mb-px cursor-pointer border-b-2 pb-[10px] leading-[22px] text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072929]`}
              style={{
                borderColor: on ? DEEP : "transparent",
                color: on ? INK : MUTED,
                fontWeight: on ? 700 : 400,
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={`crm-panel-${tab}`}
        aria-labelledby={`crm-tab-${tab}`}
        className={dirty || saved ? "pb-[72px]" : undefined}
      >
        {tab === "syncs" ? syncs : tab === "settings" ? settings : mapping}
      </div>

      {/* Only while something has changed (Hightouch's Save changes bar); then a brief "Saved". */}
      {(dirty || saved) && (
        <div
          className="sticky bottom-[16px] z-10 flex items-center justify-between gap-[16px] rounded-[12px] bg-white px-[16px] py-[10px]"
          style={{
            border: `1px solid ${HAIR}`,
            boxShadow: "0 8px 24px -12px rgba(7,41,41,0.25)",
          }}
          role="status"
          aria-live="polite"
        >
          {dirty ? (
            <>
              <p
                className={`${FONT} leading-[20px] text-[14px]`}
                style={{ color: INK }}
              >
                Unsaved changes <span style={{ color: MUTED }}>· they apply from the next sync</span>
              </p>
              <div className="flex gap-[8px]">
                <OutlineButton size="sm" onClick={() => setDraft(s)}>
                  Discard
                </OutlineButton>
                <InkButton size="sm" onClick={save}>
                  Save Changes
                </InkButton>
              </div>
            </>
          ) : (
            <p
              className={`${FONT} flex items-center gap-[8px] leading-[20px] text-[14px]`}
              style={{ color: INK }}
            >
              <CheckIcon color={SUCCESS} />
              Changes saved
            </p>
          )}
        </div>
      )}
    </div>
  )
}
