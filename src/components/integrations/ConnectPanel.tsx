/**
 * Connect HubSpot / Connect Salesforce, version 2, modelled on Hightouch's
 * Create destination flow.
 *
 * - Steps down the left, ticked off as they are done.
 * - Connecting happens inside the first step: the two marks with ⇄ between
 *   them, "Authorize connection", and a Log in button. While the CRM's own
 *   window is open the card waits in place, then turns into a green
 *   "Authorization successful" banner, and only then can you continue
 *   (Hightouch: "Authorize connection to continue").
 * - Four steps, as Hightouch's sync setup has: everything about what is sent
 *   sits on one "Records and fields" step, its field mapping folded away and
 *   the rarely touched rules under "Advanced (optional)"; the last step,
 *   Finalize, is the owner and how often to sync (Hightouch: Schedule type).
 * - Every setting is already on our recommended default.
 * - No review screen: Finalize's button starts the sync, and the page opens
 *   the connection's own page with that sync running.
 * Version 1, which asks everything before it connects, stays as the comparison.
 */

import { useEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import CrmAuthWindow, { SoftwareFinderMark } from "./CrmAuthWindow"
import CrmLogo from "./CrmLogo"
import { Choice, MappingStep, SF_CHECKS, Section } from "./ConnectWizard"
import {
  CompaniesRows,
  ScheduleRows,
  sectionCopy,
} from "./SetupSections"
import {
  CRMS,
  DEFAULT_SETTINGS,
  preview,
  type Connection,
  type CrmId,
  type CrmSettings,
  type SectionId,
} from "./crm"
import {
  CheckIcon,
  CloseIcon,
  DEEP,
  DocsIcon,
  FONT,
  HAIR,
  INK,
  InkButton,
  LIME,
  MUTED,
  OutlineButton,
  PlanCheck,
  Spinner,
  SUCCESS,
  useEscape,
} from "./ui"

/* What connecting lets Software Finder do, short: the CRM's own window lists the exact access. */
const DOES: Record<CrmId, string[]> = {
  /* Neither CRM has a Configure Records step: how records land is fixed, and said here. */
  hubspot: [
    "Match buyers to your companies by website domain",
    "Add companies that aren't in HubSpot yet, and update the ones that are",
    "Add revealed contacts to their company, with no owner assigned",
    "Add buyer visits to company timelines, one event per company per day",
    "Create Software Finder properties",
  ],
  salesforce: [
    "Match buyers to your existing Accounts by Website domain",
    "Add people as Contacts on their Account, or as Leads when there's no Account",
    "Assign new Leads with your Lead assignment rules",
    "Log buyer visits as completed Tasks, one per company per day",
    "Create Software Finder fields",
  ],
}

/** Where authorizing stands, shown inside the first step. */
type Auth = "idle" | "waiting" | "checking" | "done"

/* The steps. There is no Configure Records step: how records land is fixed and listed on Authorize. */
type StepId = "auth" | Exclude<SectionId, "records">
const stepIds = (_crm: CrmId): StepId[] => ["auth", "buyers", "mapping", "finalize"]
/** Which step a setting is edited on; Records, which has no step, opens the first settings step. */
const stepOf = (crm: CrmId, id: SectionId) => Math.max(1, stepIds(crm).indexOf(id as StepId))

/** The authorize card: both marks, one line of reassurance, and the way in. Waits and succeeds in place. */
/*
 * Salesforce sends production and sandbox orgs to different sign-in pages, so
 * the environment is settled before signing in — but most teams connect
 * production, so it is a link beside the button, not a question everyone
 * answers (Census's and HubSpot's Salesforce connectors do the same).
 */
function AuthorizeCard({
  crm,
  auth,
  onAuthorize,
  env,
  onEnv,
  onDifferentOrg,
}: {
  crm: CrmId
  auth: Auth
  onAuthorize: () => void
  env?: "production" | "sandbox"
  onEnv?: (env: "production" | "sandbox") => void
  /** After signing in, to start over with another org. */
  onDifferentOrg?: () => void
}) {
  const sandbox = crm === "salesforce" && env === "sandbox"
  const name = CRMS[crm].name + (sandbox ? " sandbox" : "")
  if (auth === "done") {
    return (
      <div className="flex flex-col gap-[10px]">
      <div
        className="flex items-start gap-[10px] rounded-[12px] px-[16px] py-[14px]"
        role="status"
        style={{
          background: "#EEF9F2",
          border: "1px solid rgba(36,179,100,0.35)",
        }}
      >
        {/* 17px, centred on the 20px title line. */}
        <span
          className="mt-[1.5px] flex size-[17px] shrink-0 items-center justify-center rounded-full"
          style={{ background: SUCCESS }}
        >
          <CheckIcon color="#fff" size={10} />
        </span>
        <div className="flex flex-col gap-[2px]">
          <p
            className={`${FONT} font-medium leading-[20px] text-[14px]`}
            style={{ color: INK }}
          >
            Authorization successful
          </p>
          <p
            className={`${FONT} leading-[20px] text-[13px]`}
            style={{ color: MUTED }}
          >
            Your {CRMS[crm].name} account is now connected to Software Finder.
          </p>
        </div>
      </div>
      {onDifferentOrg && (
        <p className={`${FONT} flex flex-wrap items-center gap-x-[8px] leading-[18px] text-[13px]`} style={{ color: MUTED }}>
          {sandbox ? "Sandbox org" : "Production org"}
          <span aria-hidden>·</span>
          <button type="button" onClick={onDifferentOrg} className={`${FONT} cursor-pointer rounded-[2px] leading-[18px] text-[13px] font-medium underline decoration-[rgba(7,41,41,0.4)] underline-offset-2 hover:decoration-[#072929] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072929]`}
          style={{ color: DEEP }}>
            Use a different org
          </button>
        </p>
      )}
      </div>
    )
  }
  const busy = auth === "waiting" || auth === "checking"
  return (
    <div
      className="flex flex-col items-center gap-[14px] rounded-[12px] px-[24px] py-[28px] text-center"
      style={{ border: `1px solid ${HAIR}` }}
      role={busy ? "status" : undefined}
    >
      <div className="flex items-center gap-[14px]" aria-hidden>
        <SoftwareFinderMark size={40} />
        <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
          <path
            d="M2 5h17m0 0-3.5-3.5M19 5l-3.5 3.5M20 11H3m0 0 3.5-3.5M3 11l3.5 3.5"
            stroke="rgba(47,43,61,0.35)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span
          className="flex size-[40px] items-center justify-center rounded-full bg-white"
          style={{ border: `1px solid ${HAIR}` }}
        >
          <CrmLogo crm={crm} size={22} />
        </span>
      </div>
      <div className="flex flex-col gap-[4px]">
        <p className={`${FONT} font-medium leading-[21px] text-[15px]`} style={{ color: INK }}>
          {auth === "checking" ? "Checking access" : auth === "waiting" ? (crm === "hubspot" ? "Waiting for HubSpot" : `Signing in to ${name}`) : "Authorize connection"}
        </p>
        <p
          className={`${FONT} max-w-[460px] leading-[20px] text-[13px]`}
          style={{ color: MUTED }}
        >
          {auth === "checking"
            ? "Making sure Software Finder can read and write the records it needs."
            : auth === "waiting"
              ? crm === "hubspot"
                ? "Finish signing in and approve access in the HubSpot window."
                : "This takes a few seconds."
              : crm === "hubspot"
                ? "Software Finder needs access to your HubSpot account, approved by a Super Admin or a user with App Marketplace Access. You can revoke it at any time."
                : "Software Finder needs admin access to your Salesforce org. You can revoke it at any time."}
        </p>
      </div>
      {busy ? (
        <span className="flex h-[34px] items-center">
          <Spinner size={20} />
        </span>
      ) : (
        <button
          type="button"
          onClick={onAuthorize}
          className={`${FONT} flex h-[34px] cursor-pointer items-center gap-[8px] rounded-[8px] bg-white px-[14px] font-medium leading-[20px] text-[13px] transition-colors hover:bg-[rgba(7,41,41,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072929]`}
          style={{ color: INK, border: `1px solid ${HAIR}` }}
        >
          <CrmLogo crm={crm} size={16} />
          Sign In to {name}
        </button>
      )}
      {!busy && onEnv && (
        <p className={`${FONT} leading-[18px] text-[12px]`} style={{ color: MUTED }}>
          {sandbox ? "Sandbox org. " : "Sandbox org? "}
          <button
            type="button"
            onClick={() => onEnv(sandbox ? "production" : "sandbox")}
            className="cursor-pointer rounded-[2px] font-medium transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072929]"
            style={{ color: DEEP }}
          >
            {sandbox ? "Use production instead" : "Sign in to a sandbox"}
          </button>
        </p>
      )}
    </div>
  )
}

export default function ConnectPanel({
  crm,
  existing,
  focus,
  onClose,
  onConnected,
  reconnect = false,
  /** A saved connection: a finished setup is edited; one left part-way is resumed where it stopped. */
  /** The step to open on, when editing from one of the Settings rows. */
  /** `opts` comes only from finishing setup; `syncing` when that starts the first sync. The page then takes over.
      Closing part-way passes the connection with `setupDone: false`: nothing syncs until it is finished. */
}: {
  crm: CrmId
  existing?: Connection | null
  focus?: SectionId
  onClose: () => void
  onConnected: (c: Connection, opts?: { syncing: boolean }) => void
  /** Sign in again on a working connection: opens at Authorize, keeps every setting. */
  reconnect?: boolean
}) {
  const info = CRMS[crm]
  const editing = !!existing?.setupDone
  const resuming = !!existing && !existing.setupDone
  const [s, setS] = useState<CrmSettings>(
    () => existing?.settings ?? { ...DEFAULT_SETTINGS, owner: info.owners[0] },
  )
  const set = (p: Partial<CrmSettings>) => setS((prev) => ({ ...prev, ...p }))
  /* 0 is connecting; the rest are the settings steps for this CRM (see stepIds). */
  const [at, setAt] = useState(
    reconnect
      ? 0
      : editing
      ? stepOf(crm, focus ?? "buyers")
      : resuming
        ? (existing!.resumeStep ?? 1)
        : 0,
  )
  const [auth, setAuth] = useState<Auth>(existing && !reconnect ? "done" : "idle")
  /* The furthest step reached, so steps already visited stay ticked when you go back. */
  const [furthest, setFurthest] = useState(
    editing ? stepIds(crm).length - 1 : resuming ? (existing!.resumeStep ?? 1) : 0,
  )
  useEffect(() => setFurthest((f) => Math.max(f, at)), [at])
  /* HubSpot's own window, simulated, while it is open. */
  const [authOpen, setAuthOpen] = useState(false)
  const timers = useRef<number[]>([])
  const account = info.account(s)
  const authorized = auth === "done"
  const busy = auth === "waiting" || auth === "checking"

  useEffect(
    () => () => timers.current.forEach((id) => window.clearTimeout(id)),
    [],
  )

  /* Signing in is simulated. HubSpot opens its own window, drawn for the demo;
     Salesforce pauses for its window, then checks access. Either way the card
     waits in place and succeeds in place; the step does not move on by itself. */
  const authorize = () => {
    setAuth("waiting")
    if (crm === "hubspot") {
      setAuthOpen(true)
      return
    }
    timers.current.push(
      window.setTimeout(() => {
        setAuth("checking")
        timers.current.push(
          window.setTimeout(() => setAuth("done"), 260 * SF_CHECKS.length),
        )
      }, 1500),
    )
  }

  const connection = (setupDone: boolean): Connection => {
    const p = preview(s, 30)
    const now = Date.now()
    return {
      account,
      settings: s,
      connectedAt: reconnect ? now : (existing?.connectedAt ?? now),
      lastSyncAt: existing?.lastSyncAt ?? now,
      /* What the first sync will send; once one has run, it stays as it was. */
      result: existing?.runs.length
        ? existing.result
        : { ...p, skipped: Math.max(1, Math.round(p.companies * 0.06)) },
      setupDone,
      resumeStep: setupDone ? undefined : Math.max(1, at),
      runs: existing?.runs ?? [],
    }
  }

  /* No review: the last step finishes. The page opens the connection with its
     first sync running. Editing just saves and goes back to where it came from. */
  const save = () => {
    if (editing) {
      onConnected(connection(true))
      onClose()
    } else onConnected(connection(true), { syncing: !s.manual })
  }

  /* Closing after authorizing keeps the connection, but paused: nothing syncs and
     no run is recorded until "Start syncing" (Hightouch only creates a sync at
     Finalize). The card says "Setup not finished" and reopens here. Before
     authorizing, and while editing, closing simply leaves. */
  const close = () => {
    if (busy) return
    if (!editing && authorized) onConnected(connection(false))
    onClose()
  }
  useEscape(close)

  /* Focus: each step's title as it arrives, kept inside the dialog, returned to the card on close. */
  const headingRef = useRef<HTMLHeadingElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const opener = useRef(document.activeElement as HTMLElement | null)
  useEffect(() => {
    const el = opener.current
    return () => el?.focus?.()
  }, [])
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [at])
  const trapFocus = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return
    const items = [
      ...dialogRef.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled])",
      ),
    ]
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    if (
      e.shiftKey &&
      (document.activeElement === first ||
        document.activeElement === headingRef.current)
    ) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  /* ── the steps ── */
  /* Each step after Authorize is a Settings section by the same name, with the same line under it. */
  const copy = sectionCopy(crm)
  const ids = stepIds(crm)
  const COPY_OF = { buyers: copy.companies, mapping: copy.mapping, finalize: copy.schedule } as const
  const STEPS: Array<{ label: string; title: string; hint?: string }> = ids.map((id) =>
    id === "auth"
      ? { label: "Authorize", title: `${reconnect ? "Reconnect" : "Connect"} to ${info.name}` }
      : { label: COPY_OF[id].title, title: COPY_OF[id].title, hint: COPY_OF[id].description },
  )
  const last = at === STEPS.length - 1

  const connectBody = (
    <>
      <AuthorizeCard
        crm={crm}
        auth={auth}
        onAuthorize={authorize}
        env={s.env}
        onEnv={crm === "salesforce" ? (env) => set({ env }) : undefined}
        onDifferentOrg={crm === "salesforce" && !editing ? () => setAuth("idle") : undefined}
      />
      <Section title="Software Finder will be able to">
        <ul className="flex flex-col gap-[8px]">
          {DOES[crm].map((t) => (
            <li
              key={t}
              className={`${FONT} flex items-start gap-[8px] leading-[20px] text-[14px]`}
              style={{ color: INK }}
            >
              {/* The pricing page's tick chip. */}
              <PlanCheck />
              {t}
            </li>
          ))}
        </ul>
      </Section>
    </>
  )

  const BODY_OF: Record<StepId, ReactNode> = {
    auth: connectBody,
    buyers: <CompaniesRows crm={crm} s={s} set={set} />,
    /* Field mapping: shown in full, as Hightouch does — it is exactly what lands in the CRM. */
    mapping: <MappingStep crm={crm} s={s} set={set} quiet />,
    finalize: <ScheduleRows crm={crm} s={s} set={set} firstSync={!editing} />,
  }
  const bodies = ids.map((id) => BODY_OF[id])

  return (
    <>
      {createPortal(
        <div
          className="fixed inset-0 z-[9500] flex items-center justify-center"
          data-name="CRM Connect"
        >
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: "rgba(47,43,61,0.45)" }}
          />
          <div
            ref={dialogRef}
            onKeyDown={trapFocus}
            role="dialog"
            aria-modal="true"
            aria-labelledby="crm-connect-title"
            className="relative flex h-[min(680px,calc(100vh-48px))] w-[min(980px,calc(100vw-48px))] overflow-hidden rounded-[16px] bg-white"
            style={{ boxShadow: "0px 4px 18px 0px rgba(47,43,61,0.16)" }}
          >
            {/* The steps, ticked off as they are done. */}
            <aside
              className="flex w-[248px] shrink-0 flex-col gap-[24px] border-r px-[20px] py-[24px]"
              style={{ background: "#faf9f8", borderColor: HAIR }}
            >
              <div className="flex items-center gap-[12px]">
                <span
                  className="relative flex size-[40px] shrink-0 items-center justify-center rounded-[10px] bg-white"
                  style={{ border: `1px solid ${HAIR}` }}
                >
                  <CrmLogo crm={crm} size={22} />
                  {authorized && (
                    <span
                      aria-hidden
                      className="absolute -bottom-[4px] -right-[4px] flex size-[16px] items-center justify-center rounded-full ring-2 ring-[#faf9f8]"
                      style={{ background: SUCCESS }}
                    >
                      <CheckIcon color="#fff" size={10} />
                    </span>
                  )}
                </span>
                <div className="flex min-w-0 flex-col">
                  <span
                    className={`${FONT} font-medium leading-[21px] text-[15px]`}
                    style={{ color: INK }}
                  >
                    {/* The CRM by name; the step heading carries the action, so the two never say it twice. */}
                    {info.name}
                  </span>
                  <span
                    className={`${FONT} truncate leading-[18px] text-[12px]`}
                    style={{ color: MUTED }}
                  >
                    {info.category}
                  </span>
                </div>
              </div>
              <ol className="flex flex-col gap-[2px]">
                {STEPS.map((st, i) => {
                  const on = i === at
                  const done =
                    i === 0
                      ? authorized
                      : editing || (i <= furthest && i !== at) || i < at
                  /* Once authorized, any setup step can be revisited; connecting is behind you. */
                  const reachable = authorized && i > 0 && !on
                  return (
                    <li key={st.label}>
                      <button
                        type="button"
                        disabled={!reachable}
                        onClick={() => setAt(i)}
                        aria-current={on ? "step" : undefined}
                        className={`${FONT} flex w-full items-center gap-[10px] rounded-[8px] px-[8px] py-[7px] text-left leading-[20px] text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072929] ${
                          reachable
                            ? "cursor-pointer hover:bg-[rgba(7,41,41,0.05)]"
                            : "cursor-default"
                        }`}
                        style={{
                          background: on ? "rgba(7,41,41,0.06)" : undefined,
                          color: on || done ? INK : MUTED,
                          fontWeight: on ? 500 : 400,
                        }}
                      >
                        <span
                          className="flex size-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-medium tabular-nums"
                          style={{
                            background:
                              done && !on
                                ? LIME
                                : on
                                  ? DEEP
                                  : "rgba(47,43,61,0.07)",
                            color: on ? "#fff" : done ? DEEP : MUTED,
                          }}
                        >
                          {done ? (
                            <CheckIcon color={on ? "#fff" : DEEP} size={12} />
                          ) : (
                            i + 1
                          )}
                        </span>
                        {st.label}
                      </button>
                    </li>
                  )
                })}
              </ol>
              <a
                href="#crm-setup-guide"
                onClick={(e) => e.preventDefault()}
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
                  <h2
                    id="crm-connect-title"
                    ref={headingRef}
                    tabIndex={-1}
                    className={`${FONT} font-medium leading-[28px] text-[20px] outline-none`}
                    style={{ color: INK }}
                  >
                    {STEPS[at].title}
                  </h2>
                  {STEPS[at].hint && (
                    <p
                      className={`${FONT} leading-[20px] text-[14px]`}
                      style={{ color: MUTED }}
                    >
                      {STEPS[at].hint}
                    </p>
                  )}
                </div>
                {!busy && (
                  <button
                    type="button"
                    aria-label="Close setup"
                    onClick={close}
                    className="flex size-[28px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] transition-colors hover:bg-[rgba(7,41,41,0.06)]"
                  >
                    <CloseIcon />
                  </button>
                )}
              </header>

              <div className="flex min-h-0 flex-1 flex-col gap-[22px] overflow-y-auto px-[28px] pb-[24px] [&>*]:shrink-0">
                {bodies[at]}
              </div>

              <footer
                className="flex items-center justify-between gap-[12px] border-t px-[28px] py-[16px]"
                style={{ borderColor: HAIR }}
              >
                <div>
                  {editing ? (
                    <OutlineButton size="sm" onClick={close}>
                      Cancel
                    </OutlineButton>
                  ) : (
                    at > 0 && (
                      <OutlineButton size="sm" onClick={() => setAt(at - 1)}>
                        Back
                      </OutlineButton>
                    )
                  )}
                </div>
                <div className="flex items-center gap-[14px]">
                  {editing ? (
                    reconnect && !authorized ? null : (
                      <InkButton size="sm" onClick={save}>
                        {reconnect ? "Done" : "Save Changes"}
                      </InkButton>
                    )
                  ) : at === 0 && !authorized ? null : last ? (
                    /* No note beside it: the frequency is chosen just above, and the first sync shows its own progress. */
                    <InkButton size="sm" onClick={save}>
                      {s.manual ? "Finish Setup" : "Start Syncing"}
                    </InkButton>
                  ) : (
                    <InkButton size="sm" onClick={() => setAt(at + 1)}>
                      Continue
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
            setAuthOpen(false)
            setAuth("done")
          }}
          onCancel={() => {
            setAuthOpen(false)
            setAuth("idle")
          }}
        />
      )}
    </>
  )
}
