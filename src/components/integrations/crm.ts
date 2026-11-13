/**
 * The two CRM connections: what each one asks for, what it writes, and how the
 * demo remembers that it is connected.
 *
 * The steps follow the research behind this page (G2, RB2B, Warmly, Common
 * Room, Apollo, Hightouch and the CRMs' own docs). Both share a spine of
 * authorize, settings, mapping, backfill and sync; Salesforce adds an
 * environment choice, a permission check and Lead or Contact routing, which
 * HubSpot has no need for. Counts are read off the demo's own prospects and
 * sessions, so what the backfill promises is what the dataset holds.
 */

import { PROSPECTS } from "@/data/prospects";
import { getActivitySessions } from "@/data/activitySessions";
import { getTriggeredSignals } from "@/data/intentSignals";

export type CrmId = "hubspot" | "salesforce";

export type StepId = "environment" | "authorize" | "settings" | "routing" | "mapping" | "backfill" | "sync";

export type WriteRule = "fill" | "overwrite";

export type Frequency = "1h" | "1d" | "1w";
export const FREQUENCY: Record<Frequency, { label: string; every: string; next: string }> = {
  "1h": { label: "Every hour", every: "every hour", next: "within the hour" },
  "1d": { label: "Once a day", every: "once a day", next: "tomorrow" },
  "1w": { label: "Once a week", every: "once a week", next: "next week" },
};

/** Which prospects are sent: every one, or only those with a revealed contact. */
export type Audience = "all" | "revealed";

export type CrmSettings = {
  /** Only buyers at or above this intent are sent. */
  minIntent: 30 | 51 | 71;
  /** Nothing is sent automatically: the person chooses buyers to send themselves. */
  manual: boolean;
  /** Who is sent. Companies always go, with their contacts where revealed. */
  audience: Audience;
  sendContacts: boolean;
  /** HubSpot: whether a revealed contact is created as a contact or a lead. Salesforce routes its own way. */
  contactAs: "contact" | "lead";
  sendActivity: boolean;
  owner: string;
  backfill: boolean;
  /** How often new activity is sent, chosen on the Finalize step (Hightouch: Schedule type). */
  frequency: Frequency;
  /** HubSpot: one rule for every standard field. Salesforce sets it per field. */
  overwrite: WriteRule;
  fieldRules: Record<string, WriteRule>;
  /** Where each new field goes: "create", or an existing field's name. */
  destinations: Record<string, string>;
  /* HubSpot */
  newCompany: "create" | "skip";
  /* Salesforce */
  env: "production" | "sandbox";
  knownAccount: "contact" | "lead" | "skip";
  noAccount: "lead" | "account" | "skip";
  accounts: "update" | "create";
  leadSource: string;
};

export const DEFAULT_SETTINGS: CrmSettings = {
  minIntent: 51,
  manual: false,
  audience: "all",
  sendContacts: true,
  contactAs: "contact",
  sendActivity: true,
  owner: "",
  backfill: true,
  frequency: "1h",
  overwrite: "fill",
  fieldRules: {},
  destinations: {},
  newCompany: "create",
  env: "production",
  knownAccount: "contact",
  noAccount: "lead",
  accounts: "update",
  leadSource: "Software Finder",
};

/* ── field mapping ── */

export type FieldRow = {
  key: string;
  /** The Buyer Intelligence field. */
  source: string;
  /** The CRM field it lands in. For a new field, the one we create. */
  dest: string;
  /** Internal name, as an admin would look it up. */
  api: string;
  kind: "mapped" | "new" | "fixed";
  type: string;
  /** Existing fields a new one can be pointed at instead of creating it. */
  alternatives?: string[];
  /** The field records are matched on (domain, email): never overwritten, so the wrong records can't merge. */
  match?: boolean;
  /** A fixed value written on every record, e.g. Lead Source. */
  value?: string;
};

export type MappingTab = { id: string; label: string; description: string; rows: FieldRow[] };

const HS_GROUP = "Software Finder";

/** The org's Lead Source picklist values (the demo's). */
export const LEAD_SOURCES = ["Software Finder", "Web", "Partner Referral", "Other"];

export const HUBSPOT_MAPPING: MappingTab[] = [
  {
    id: "companies",
    label: "Companies",
    description: "Matched on company domain. Standard properties are filled in; the Software Finder ones are created in their own group.",
    rows: [
      { key: "hs-c-name", source: "Company name", dest: "Company name", api: "name", kind: "mapped", type: "Single-line text" },
      { key: "hs-c-domain", source: "Website", dest: "Company domain name", api: "domain", kind: "mapped", type: "Single-line text", match: true },
      { key: "hs-c-industry", source: "Industry", dest: "Industry", api: "industry", kind: "mapped", type: "Dropdown select" },
      { key: "hs-c-size", source: "Employees", dest: "Number of employees", api: "numberofemployees", kind: "mapped", type: "Number" },
      { key: "hs-c-loc", source: "Location", dest: "City, Country/Region", api: "city, country", kind: "mapped", type: "Single-line text" },
      { key: "hs-c-li", source: "LinkedIn", dest: "LinkedIn company page", api: "linkedin_company_page", kind: "mapped", type: "Single-line text" },
      { key: "hs-c-score", source: "Intent score", dest: "Software Finder: Intent score", api: "softwarefinder_intent_score", kind: "new", type: "Number" },
      { key: "hs-c-level", source: "Intent level", dest: "Software Finder: Intent level", api: "softwarefinder_intent_level", kind: "new", type: "Dropdown select" },
      { key: "hs-c-signals", source: "Intent signals", dest: "Software Finder: Intent signals", api: "softwarefinder_intent_signals", kind: "new", type: "Multiple checkboxes" },
      { key: "hs-c-seen", source: "Last seen", dest: "Software Finder: Last seen", api: "softwarefinder_last_seen", kind: "new", type: "Date picker" },
      { key: "hs-c-url", source: "Buyer profile", dest: "Software Finder: Buyer profile", api: "softwarefinder_buyer_url", kind: "new", type: "Single-line text" },
    ],
  },
  {
    id: "contacts",
    label: "Contacts",
    description: "Revealed buyers, matched on email and linked to their company as its primary contact.",
    rows: [
      { key: "hs-p-first", source: "First name", dest: "First name", api: "firstname", kind: "mapped", type: "Single-line text" },
      { key: "hs-p-last", source: "Last name", dest: "Last name", api: "lastname", kind: "mapped", type: "Single-line text" },
      { key: "hs-p-email", source: "Email", dest: "Email", api: "email", kind: "mapped", type: "Single-line text", match: true },
      { key: "hs-p-phone", source: "Phone", dest: "Phone number", api: "phone", kind: "mapped", type: "Phone number" },
      { key: "hs-p-title", source: "Job title", dest: "Job title", api: "jobtitle", kind: "mapped", type: "Single-line text" },
      { key: "hs-p-company", source: "Company", dest: "Primary company", api: "association", kind: "mapped", type: "Association" },
      { key: "hs-p-revealed", source: "Revealed on", dest: "Software Finder: Revealed on", api: "softwarefinder_revealed_on", kind: "new", type: "Date picker" },
    ],
  },
];

export const SALESFORCE_MAPPING: MappingTab[] = [
  {
    id: "account",
    label: "Account",
    description: "Matched on Website domain. Standard fields are only filled when empty.",
    rows: [
      { key: "sf-a-name", source: "Company name", dest: "Account Name", api: "Name", kind: "mapped", type: "Name" },
      { key: "sf-a-site", source: "Website", dest: "Website", api: "Website", kind: "mapped", type: "URL", match: true },
      { key: "sf-a-industry", source: "Industry", dest: "Industry", api: "Industry", kind: "mapped", type: "Picklist" },
      { key: "sf-a-size", source: "Employees", dest: "Employees", api: "NumberOfEmployees", kind: "mapped", type: "Number" },
      { key: "sf-a-loc", source: "Location", dest: "Billing City, Country", api: "BillingCity, BillingCountry", kind: "mapped", type: "Address" },
      { key: "sf-a-score", source: "Intent score", dest: "Software Finder Intent Score", api: "SoftwareFinder_Intent_Score__c", kind: "new", type: "Number(3, 0)" },
      { key: "sf-a-level", source: "Intent level", dest: "Software Finder Intent Level", api: "SoftwareFinder_Intent_Level__c", kind: "new", type: "Picklist" },
      { key: "sf-a-signals", source: "Intent signals", dest: "Software Finder Intent Signals", api: "SoftwareFinder_Intent_Signals__c", kind: "new", type: "Multi-select picklist" },
      { key: "sf-a-seen", source: "Last seen", dest: "Software Finder Last Seen", api: "SoftwareFinder_Last_Seen__c", kind: "new", type: "Date" },
      { key: "sf-a-url", source: "Buyer profile", dest: "Software Finder Buyer Profile", api: "SoftwareFinder_Buyer_Profile__c", kind: "new", type: "URL" },
    ],
  },
  {
    id: "lead",
    label: "Lead",
    description: "Buyers with no matching Account. Salesforce requires a Last Name and a Company on every Lead.",
    rows: [
      { key: "sf-l-first", source: "First name", dest: "First Name", api: "FirstName", kind: "mapped", type: "Text" },
      { key: "sf-l-last", source: "Last name", dest: "Last Name", api: "LastName", kind: "mapped", type: "Text (required)" },
      { key: "sf-l-company", source: "Company name", dest: "Company", api: "Company", kind: "mapped", type: "Text (required)" },
      { key: "sf-l-email", source: "Email", dest: "Email", api: "Email", kind: "mapped", type: "Email", match: true },
      { key: "sf-l-phone", source: "Phone", dest: "Phone", api: "Phone", kind: "mapped", type: "Phone" },
      { key: "sf-l-title", source: "Job title", dest: "Title", api: "Title", kind: "mapped", type: "Text" },
      { key: "sf-l-source", source: "Fixed value", dest: "Lead Source", api: "LeadSource", kind: "fixed", type: "Picklist" },
      { key: "sf-l-score", source: "Company intent score", dest: "Software Finder Intent Score", api: "SoftwareFinder_Intent_Score__c", kind: "new", type: "Number(3, 0)" },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    description: "Buyers whose company is already an Account, added to that Account.",
    rows: [
      { key: "sf-c-first", source: "First name", dest: "First Name", api: "FirstName", kind: "mapped", type: "Text" },
      { key: "sf-c-last", source: "Last name", dest: "Last Name", api: "LastName", kind: "mapped", type: "Text (required)" },
      { key: "sf-c-email", source: "Email", dest: "Email", api: "Email", kind: "mapped", type: "Email", match: true },
      { key: "sf-c-phone", source: "Phone", dest: "Phone", api: "Phone", kind: "mapped", type: "Phone" },
      { key: "sf-c-title", source: "Job title", dest: "Title", api: "Title", kind: "mapped", type: "Text" },
      { key: "sf-c-account", source: "Company", dest: "Account", api: "AccountId", kind: "mapped", type: "Lookup(Account)" },
      { key: "sf-c-revealed", source: "Revealed on", dest: "Software Finder Revealed On", api: "SoftwareFinder_Revealed_On__c", kind: "new", type: "Date" },
      { key: "sf-c-source", source: "Fixed value", dest: "Lead Source", api: "LeadSource", kind: "fixed", type: "Picklist" },
    ],
  },
  {
    id: "task",
    label: "Task",
    description: "One completed Task per company per day, listing its signals and page visits.",
    rows: [
      { key: "sf-t-subject", source: "Signal", dest: "Subject", api: "Subject", kind: "mapped", type: "Picklist (combo)" },
      { key: "sf-t-desc", source: "Page and time spent", dest: "Comments", api: "Description", kind: "mapped", type: "Long text" },
      { key: "sf-t-date", source: "Visit date", dest: "Due Date", api: "ActivityDate", kind: "mapped", type: "Date" },
      { key: "sf-t-what", source: "Company", dest: "Related To", api: "WhatId", kind: "mapped", type: "Lookup(Account), when there is one" },
      { key: "sf-t-who", source: "Buyer", dest: "Name", api: "WhoId", kind: "mapped", type: "Lookup(Contact, Lead)" },
      { key: "sf-t-status", source: "Fixed value", dest: "Status", api: "Status", kind: "fixed", type: "Picklist", value: "Completed" },
    ],
  },
];

/* ── each CRM's page facts ── */

export type CrmInfo = {
  id: CrmId;
  name: string;
  category: string;
  blurb: string;
  steps: Array<{ id: StepId; label: string }>;
  mapping: MappingTab[];
  owners: string[];
  /** The account the demo connects to, as the CRM would name it. */
  account: (s: CrmSettings) => { name: string; detail: string };
};

export const CRMS: Record<CrmId, CrmInfo> = {
  hubspot: {
    id: "hubspot",
    name: "HubSpot",
    category: "CRM & Marketing",
    blurb: "Sync buyers, intent scores and page visits to HubSpot companies and contacts.",
    steps: [
      { id: "authorize", label: "Connect account" },
      { id: "settings", label: "Sync settings" },
      { id: "mapping", label: "Field mapping" },
      { id: "backfill", label: "Backfill" },
      { id: "sync", label: "Review and sync" },
    ],
    mapping: HUBSPOT_MAPPING,
    owners: ["No owner", "Priya Raman", "Marcus Lee", "Elena Duarte"],
    account: () => ({ name: "Atlassian", detail: "Hub ID 48210935" }),
  },
  salesforce: {
    id: "salesforce",
    name: "Salesforce",
    category: "CRM & Marketing",
    blurb: "Sync buyers, intent scores and page visits to Salesforce Accounts, Leads and Contacts.",
    steps: [
      { id: "environment", label: "Environment" },
      { id: "authorize", label: "Sign in and check access" },
      { id: "routing", label: "Records and routing" },
      { id: "mapping", label: "Field mapping" },
      { id: "backfill", label: "Backfill" },
      { id: "sync", label: "Review and sync" },
    ],
    mapping: SALESFORCE_MAPPING,
    owners: ["Use Lead assignment rules", "Priya Raman", "Marcus Lee", "Elena Duarte"],
    account: s =>
      s.env === "sandbox"
        ? { name: "Atlassian (Sandbox)", detail: "atlassian--uat.sandbox.my.salesforce.com" }
        : { name: "Atlassian", detail: "atlassian.my.salesforce.com" },
  },
};

/* ── where a field can go instead ── */

type FieldKind = "text" | "number" | "date" | "list";

/** Fields only pair with fields of the same kind, as HubSpot's own Data Sync pairs them. */
export function kindOf(type: string): FieldKind {
  if (/number/i.test(type)) return "number";
  if (/date/i.test(type)) return "date";
  if (/dropdown|picklist|checkbox/i.test(type)) return "list";
  return "text";
}

type ExistingProp = { label: string; api: string; type: string };

/** Properties the connected account already has, by object: the demo's, standing in for what the CRM's API would list. */
const EXISTING: Record<string, ExistingProp[]> = {
  "hubspot:companies": [
    { label: "Description", api: "description", type: "Multi-line text" },
    { label: "About us", api: "about_us", type: "Single-line text" },
    { label: "Website URL", api: "website", type: "Single-line text" },
    { label: "Annual revenue", api: "annualrevenue", type: "Number" },
    { label: "Intent score (legacy)", api: "intent_score_legacy", type: "Number" },
    { label: "Account score", api: "account_score", type: "Number" },
    { label: "Last activity date", api: "notes_last_updated", type: "Date picker" },
    { label: "Last engagement date", api: "hs_last_engagement", type: "Date picker" },
    { label: "Type", api: "type", type: "Dropdown select" },
    { label: "Lifecycle stage", api: "lifecyclestage", type: "Dropdown select" },
    { label: "Buying stage", api: "buying_stage", type: "Dropdown select" },
  ],
  "hubspot:contacts": [
    { label: "Mobile phone number", api: "mobilephone", type: "Phone number" },
    { label: "Job function", api: "job_function", type: "Single-line text" },
    { label: "Became a lead date", api: "hs_lifecyclestage_lead_date", type: "Date picker" },
    { label: "Last contacted", api: "notes_last_contacted", type: "Date picker" },
  ],
  "salesforce:account": [
    { label: "Description", api: "Description", type: "Long text" },
    { label: "Account Site", api: "Site", type: "Text" },
    { label: "Annual Revenue", api: "AnnualRevenue", type: "Currency" },
    { label: "Intent Score (legacy)", api: "Intent_Score__c", type: "Number(3, 0)" },
    { label: "Last Engaged Date", api: "Last_Engaged_Date__c", type: "Date" },
    { label: "Rating", api: "Rating", type: "Picklist" },
    { label: "Type", api: "Type", type: "Picklist" },
    { label: "LinkedIn URL", api: "LinkedIn_URL__c", type: "URL" },
  ],
  "salesforce:lead": [
    { label: "Lead Score", api: "Lead_Score__c", type: "Number(3, 0)" },
    { label: "Mobile", api: "MobilePhone", type: "Phone" },
    { label: "Description", api: "Description", type: "Long text" },
  ],
  "salesforce:contact": [
    { label: "Mobile", api: "MobilePhone", type: "Phone" },
    { label: "Description", api: "Description", type: "Long text" },
    { label: "Last Engaged Date", api: "Last_Engaged_Date__c", type: "Date" },
  ],
};

/** A row the person may point at another field: never a match key, a fixed value, a required field, a lookup, a Task's own fields, or a field Software Finder creates (its own property, in its own group: nothing to choose, and nothing of theirs to overwrite). */
export function canRemap(tabId: string, r: FieldRow): boolean {
  return !r.match && r.kind !== "fixed" && r.kind !== "new" && tabId !== "task" && !/required|Lookup|Association|^Name$/.test(r.type);
}

/** The automatic destination first, then the account's other fields of the same kind. "create" keeps the automatic one. */
export function destinationOptions(crm: CrmId, tabId: string, r: FieldRow): Array<{ value: string; label: string }> {
  const kind = kindOf(r.type);
  const others = (EXISTING[`${crm}:${tabId}`] ?? []).filter((p) => p.api !== r.api && (kindOf(p.type) === kind || (kind === "text" && kindOf(p.type) === "text")));
  return [{ value: "create", label: r.dest }, ...others.map((p) => ({ value: p.api, label: p.label }))];
}

/** The new fields a setup will create, after the person has pointed some at existing ones. */
export function fieldsToCreate(info: CrmInfo, s: CrmSettings): FieldRow[] {
  const seen = new Set<string>();
  return info.mapping
    .flatMap(t => t.rows.map(r => ({ t, r })))
    .filter(({ r }) => r.kind === "new" && (s.destinations[r.key] ?? "create") === "create")
    .filter(({ t, r }) => (seen.has(`${t.id}:${r.api}`) ? false : (seen.add(`${t.id}:${r.api}`), true)))
    .map(({ r }) => r);
}

/* ── what a sync would send ── */

export type SyncPreview = { companies: number; buyers: number; activity: number; signals: number };

const DAY = 864e5;

/** Read off the demo's own buyers, so the numbers agree with the rest of the app. */
export function preview(s: CrmSettings, windowDays: number | null = 30): SyncPreview {
  const now = Date.now();
  const rows = PROSPECTS.filter(p => {
    if (p.intentPct < s.minIntent) return false;
    if (s.audience === "revealed" && !p.contacts.length) return false;
    if (windowDays === null) return true;
    const t = Date.parse(p.date);
    return Number.isNaN(t) || now - t <= windowDays * DAY;
  });
  let buyers = 0;
  let activity = 0;
  let signals = 0;
  for (const p of rows) {
    buyers += p.contacts.length;
    for (const session of getActivitySessions(p.name)) activity += session.pages.length;
    signals += getTriggeredSignals(p.name).size;
  }
  return {
    companies: rows.length,
    buyers: s.sendContacts ? buyers : 0,
    activity: s.sendActivity ? activity + signals : 0,
    signals,
  };
}

/* ── the connection, as the demo remembers it ── */

/** One sync that actually ran, stored when it finishes. */
export type RunRecord = {
  at: number;
  label: string;
  companies: number;
  buyers: number;
  activity: number;
  created: number;
  updated: number;
  skipped: number;
  /** Said instead of the counts when nothing was sent, e.g. "No new activity". */
  note?: string;
  /** Why the run couldn't send anything, e.g. "Connection expired" (Hightouch lists a failed run with its error). */
  failed?: string;
};

export type Connection = {
  account: { name: string; detail: string };
  settings: CrmSettings;
  connectedAt: number;
  /** When the latest run finished; equal to connectedAt until one has. */
  lastSyncAt: number;
  /** What the first sync will send: the 30-day preview, fixed at setup. */
  result: SyncPreview & { skipped: number };
  /** False when the dialog was closed after authorizing: connected, but nothing syncs until setup is finished. */
  setupDone: boolean;
  /** The step to reopen on when setup was left part-way. */
  resumeStep?: number;
  /** Real runs, newest first. */
  runs: RunRecord[];
  /** The CRM stopped accepting the token (expired, revoked, or its admin removed). Nothing syncs until Reconnect, which keeps every setting. */
  expired?: boolean;
};

/* Held in memory, not in storage: a connection survives moving between pages,
   but every load of the demo starts with both CRMs not connected, so the
   connect flow is always there to walk through. */
const connections = new Map<CrmId, Connection>();

export function readConnection(id: CrmId): Connection | null {
  return connections.get(id) ?? null;
}

export function writeConnection(id: CrmId, c: Connection | null) {
  if (c) connections.set(id, c);
  else connections.delete(id);
}

export function intentLevel(pct: number) {
  return pct >= 71 ? "High" : pct >= 51 ? "Medium" : "Low";
}

export function timeAgo(ms: number) {
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} hr ago` : `${Math.round(h / 24)} days ago`;
}

/* ── a sync while it runs ── */

/** One sync in progress, as Hightouch shows a run: what it is doing and how far it has got. */
export type SyncRun = { label: string; unit: string; done: number; total: number; first: boolean };

/* ── the settings, one line each ── */

/** The settings, one per row on the connection page; mapping lives on the Records and fields step. */
export type SectionId = "buyers" | "records" | "mapping" | "finalize";


