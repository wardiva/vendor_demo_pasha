import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import BuyerActivityBuyerIntentStarter from "@/imports/BuyerActivityBuyerIntentStarter/index";
import BuyerActivityLeads from "@/imports/BuyerActivityLeads/index";
import FilterPanel from "@/components/FilterPanel";
import { FIELD_ACTIVE_BORDER, FIELD_ACTIVE_SHADOW } from "@/components/filters/fieldStates";
import BuyMoreModal from "@/components/BuyMoreModal";
import NotifyRecipientsModal from "@/components/NotifyRecipientsModal";
import ContactsFilterPanel from "@/components/prospects/ContactsFilterPanel";
import IntentFilterPanel from "@/components/prospects/IntentFilterPanel";
import IndustryFilterPanel from "@/components/prospects/IndustryFilterPanel";
import { sortProspects, type ProspectSortKey } from "@/data/prospectSort";
import type { ContactVariant } from "@/components/ContactTag";
import { RevealAllowanceProvider } from "@/components/ContactRevealsMeter";
import CompanyInfoModal from "@/components/company/CompanyInfoModal";
import { REVEAL_ALLOWANCE } from "@/data/contactLeads";
import LeadsFilterPanel from "@/components/LeadsFilterPanel";
import DateRangeControl, { type DateAnchor } from "@/components/DateRangeControl";
import {
  dateSelectionLabel,
  defaultDateSelection,
  isDateWithin,
  isWithinSelection,
  type DateSelection,
} from "@/data/dateRange";
import { getCompanyProfile, type CompanyProfile } from "@/data/companies";
import { SIGNAL_ROWS, SIGNAL_ROW_HEIGHT } from "@/data/signalsRows";
import { copyText, flashCopied } from "@/components/copyAffordance";
import {
  EMPTY_LEADS_FILTERS,
  countActiveLeadsFilters,
  hasActiveLeadsFilters,
  leadVisibility,
  type LeadSignalOption,
  type LeadsFilters,
} from "@/data/leads";
import { PROSPECTS, getProspect, getProspectById } from "@/data/prospects";
import { ProspectsPageProvider, type ProspectsView } from "@/context/ProspectsPageContext";
import {
  LeadsTableProvider,
  SignalsAnalyticsProvider,
  SignalsFiltersProvider,
} from "@/context/SignalsAnalyticsContext";
import OptionDropdown from "@/components/filters/OptionDropdown";
import { FILTER_CARD_WIDE_W } from "@/components/filters/FilterPrimitives";
import { CompanyLogo, TechStackLogo } from "@/components/filters/OptionLogo";
import type { SignalsFilterKey } from "@/components/signals/SignalsFilterRow";
import {
  SIGNALS_FILTER_OPTIONS,
  applySignalsGroup,
  clearSignalsGroup,
} from "@/data/signals";
import {
  ProspectRevealProvider,
  contactId,
  type ProspectRevealState,
} from "@/context/ProspectRevealContext";
import {
  EMPTY_FILTERS,
  aggregate,
  countActiveFilters,
  filterCompanies,
  hasActiveFilters,
  type AppliedFilters,
} from "@/data/signals";

/**
 * The filters trigger, on either page.
 *
 * Matched on its idle-border slot rather than its label: the Signals page calls
 * it "Filters" and the Prospects page "Signals", and the label is a design
 * decision that should not be able to break the panel.
 */
const isFiltersControl = (el: Element) => Boolean(el.querySelector("[data-filters-idle]"));

/* ─────────────────────────── types / data ─────────────────────────── */

/** Signal summary cards, mapped to the Prospects filter they open — all four
 *  the page renders, keyed by the title each card shows. The click path is the
 *  same for each: the option goes through the page filter model, so the chip
 *  lights up with its count and the list narrows through the Prospects page's
 *  own logic. Profile and Pricing were absent while their cards were not
 *  rendered; their avatar stacks open the option of the same name. */
const SIGNAL_CARD_FILTERS: Record<string, LeadSignalOption | undefined> = {
  "Buyers in Market": "Buyers in Market",
  "Profile Signals": "Profile Signals",
  "Pricing Signals": "Pricing Signals",
  "Competitor Signals": "Competitor",
};

type Page = "signals" | "leads";

/* ─────────────────────────── main component ─────────────────────────── */

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── routing ── */
  const [page, setPage] = useState<Page>("signals");

  /* ── shared filter state ── */
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  /* The field the popover hangs from, so both the preset menu and the calendar
     can place themselves against it at their own widths. */
  const [dateAnchor, setDateAnchor] = useState<DateAnchor>({ left: 0, right: 0, bottom: 0 });
  /* Both pages open on the default custom range, so the toolbar shows real
     dates and the page is already filtered to a period on first paint. */
  const [dateSelection, setDateSelection] = useState<DateSelection>(() => defaultDateSelection());
  const dateLabel = dateSelectionLabel(dateSelection);
  const [filterPos, setFilterPos] = useState({ x: 0, y: 0 });

  /* ── leads page search ── */

  /* ── applied signals-page filters ── */
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>(EMPTY_FILTERS);
  /* Working selection, kept so closing the panel never discards it. */
  const [filterDraft, setFilterDraft] = useState<AppliedFilters>(EMPTY_FILTERS);

  /* ── applied leads-page filters ── */
  const [appliedLeadsFilters, setAppliedLeadsFilters] = useState<LeadsFilters>(EMPTY_LEADS_FILTERS);

  /* ── modals / toasts ── */
  const [buyMoreOpen, setBuyMoreOpen] = useState(false);
  /* Figma 246:1584 — the More menu opens this rather than firing a toast. */
  const [notifyOpen, setNotifyOpen] = useState(false);
  /* The Contacts filter's own dropdown, opened from its chip on the row. */
  const [contactsOpen, setContactsOpen] = useState(false);
  const [intentOpen, setIntentOpen] = useState(false);
  const [industryOpen, setIndustryOpen] = useState(false);
  /* Which Signals chip is open. */
  const [signalsChip, setSignalsChip] = useState<SignalsFilterKey | null>(null);
  /* The Sort control's order, applied to the cards and the table alike. */
  const [prospectSort, setProspectSort] = useState<ProspectSortKey>("default");
  const [companyModal, setCompanyModal] = useState<CompanyProfile | null>(null);

  /* ── prospects page toolbar ── */
  const [prospectSearch, setProspectSearch] = useState("");

  /* ── contact reveal state ── */
  /** Prospect cards whose contact section has been revealed. */
  /* Cards or the shared table — the Prospects page's own view switch. */
  const [prospectView, setProspectView] = useState<ProspectsView>("cards");
  /* Keyed by contact id, so the card and the modal share one answer.
     Seeded with the contacts the dataset ships already disclosed, which is how
     a prospect drawn without its veil in Figma opens that way. Seeding the set
     rather than running a reveal means no allowance is spent on them. */
  const [revealedContacts, setRevealedContacts] = useState<Set<string>>(
    () =>
      new Set(
        PROSPECTS.filter(p => p.contact?.revealedByDefault).map(p =>
          contactId(p.name, p.contact!.name),
        ),
      ),
  );
  const [revealsUsed, setRevealsUsed] = useState(REVEAL_ALLOWANCE.used);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  /* ── close transient UI when the page changes ── */
  useEffect(() => {
    setFilterOpen(false);
    setCompanyModal(null);
  }, [page]);

  /**
   * Opening a prospect's details.
   *
   * Every surface — the Prospects page cards and every row of the Signals page
   * table — resolves through this one call, so a prospect opens the same
   * dialog with the same tabs wherever it was clicked. Returns whether a
   * record was found, so a caller can leave the click alone when it wasn't.
   */
  const openProspectDetails = useCallback((company: string) => {
    const profile = getCompanyProfile(company);
    if (profile) setCompanyModal(profile);
    return Boolean(profile);
  }, []);

  /* ── DOM event delegation ── */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;

      /* close filter dropdown when clicking outside */
      /* A click outside the picker closes it, leaving the applied range as it
         was — the range only changes through Apply. */
      if (!target.closest("[data-date-picker]") && !target.closest("[data-date-field]")) {
        setDateOpen(false);
      }

      /* A click outside the panel closes it. Selections are untouched — the
         draft lives in App and is handed back on reopen. */
      if (!target.closest("[data-filter-panel]")) {
        const isFiltersBtn = Array.from(document.querySelectorAll('[data-name="text-field"]'))
          .some(el => el.contains(target) && isFiltersControl(el));
        if (!isFiltersBtn) setFilterOpen(false);
        if (!target.closest("[data-contacts-filter]")) setContactsOpen(false);
        if (!target.closest("[data-intent-filter]")) setIntentOpen(false);
        if (!target.closest("[data-industry-filter]")) setIndustryOpen(false);
        if (!target.closest("[data-signals-filter]")) setSignalsChip(null);
      }

      /* ── navigation: Leads / Signals in sidebar ── */
      const listItem = target.closest('[data-name="ListItem"]') as HTMLElement | null;
      if (listItem) {
        const text = listItem.textContent?.trim() ?? "";
        if (text === "Prospects" || text.startsWith("Prospects")) { setPage("leads"); e.stopPropagation(); return; }
        if (text === "Signals" || text.startsWith("Signals")) { setPage("signals"); e.stopPropagation(); return; }
        if (text.length < 40) showToast(`Navigating to ${text}…`);
        return;
      }

      /* ── Shortcuts into the Leads page ──
         "View All" above the Signals leads table, and the avatar groups on the
         summary cards. The whole group is the hit area — any avatar, the "+1"
         badge, or the gaps between them. A signal card also applies its signal
         through the page's own filter state, so the filter reads as selected
         and the count is right. */
      const friends = target.closest('[data-name="Friends"]');
      if (friends) {
        const cardTitle = friends
          .closest('[data-name="Memory Usage"]')
          ?.querySelector("p")?.textContent?.trim();
        const signal = SIGNAL_CARD_FILTERS[cardTitle ?? ""];
        if (signal) {
          const filters: LeadsFilters = {
            leads: [],
            signals: [signal],
            contacts: [],
            intent: [],
            industries: [],
          };
          setAppliedLeadsFilters(filters);
        }
        setPage("leads");
        e.stopPropagation();
        return;
      }

      const viewAll = target.closest('[data-name="btn-text-secondary btn-sm"]');
      if (viewAll) {
        setPage("leads");
        e.stopPropagation();
        return;
      }

      /* ── Date range field ── */
      const dateField = target.closest("[data-date-field]") as HTMLElement | null;
      if (dateField) {
        const rect = dateField.getBoundingClientRect();
        /* The field itself, not a resolved position: the popover shows a menu
           and a calendar of different widths, and each places itself against
           these edges. */
        setDateAnchor({ left: rect.left, right: rect.right, bottom: rect.bottom });
        setDateOpen(prev => !prev);
        e.stopPropagation();
        return;
      }

      /* ── Signals page filter chips ── */
      const signalsChipEl = target.closest("[data-signals-filter]") as HTMLElement | null;
      if (signalsChipEl) {
        const key = signalsChipEl.dataset.signalsFilter as SignalsFilterKey;
        if (target.closest("[data-clear-filter]")) {
          setAppliedFilters(prev => clearSignalsGroup(prev, key));
          e.stopPropagation();
          return;
        }
        setSignalsChip(prev => (prev === key ? null : key));
        e.stopPropagation();
        return;
      }

      /* ── Industry filter chip ── */
      const industryField = target.closest("[data-industry-filter]") as HTMLElement | null;
      if (industryField) {
        if (target.closest("[data-clear-filter]")) {
          setAppliedLeadsFilters(prev => ({ ...prev, industries: [] }));
          e.stopPropagation();
          return;
        }
        setFilterOpen(false);
        setContactsOpen(false);
        setIntentOpen(false);
        setIndustryOpen(prev => !prev);
        e.stopPropagation();
        return;
      }

      /* ── Intent Score filter chip ── */
      const intentField = target.closest("[data-intent-filter]") as HTMLElement | null;
      if (intentField) {
        if (target.closest("[data-clear-filter]")) {
          setAppliedLeadsFilters(prev => ({ ...prev, intent: [] }));
          e.stopPropagation();
          return;
        }
        setFilterOpen(false);
        setContactsOpen(false);
        setIndustryOpen(false);
        setIntentOpen(prev => !prev);
        e.stopPropagation();
        return;
      }

      /* ── Contacts filter chip ── */
      const contactsField = target.closest("[data-contacts-filter]") as HTMLElement | null;
      if (contactsField) {
        /* The clear button sits inside the chip and empties the group instead
           of opening the menu. */
        if (target.closest("[data-clear-filter]")) {
          setAppliedLeadsFilters(prev => ({ ...prev, contacts: [] }));
          e.stopPropagation();
          return;
        }
        setFilterOpen(false);
        setIntentOpen(false);
        setIndustryOpen(false);
        setContactsOpen(prev => !prev);
        e.stopPropagation();
        return;
      }

      /* ── Filters button ── */
      const filtersField = Array.from(document.querySelectorAll('[data-name="text-field"]'))
        .find(el => el.contains(target) && isFiltersControl(el));
      if (filtersField) {
        if (target.closest("[data-clear-filter]")) {
          setAppliedLeadsFilters(prev => ({ ...prev, leads: [], signals: [] }));
          e.stopPropagation();
          return;
        }
        setContactsOpen(false);
        setIntentOpen(false);
        setIndustryOpen(false);
        setFilterOpen(prev => !prev);
        e.stopPropagation();
        return;
      }

      /* ── Buy More button ── */
      if (target.closest('[data-name="Outline Button"]')) {
        setBuyMoreOpen(true);
        return;
      }

      /* ── Notify Recipients ── */
      const notifyBtn = target.closest('[data-name="nav-link-primary active"]') as HTMLElement | null;
      if (notifyBtn) { showToast("Notifications sent to 3 recipients"); return; }

      /* ── Copy the email or phone of a revealed contact ──
         The whole value copies, not just the button, and the click stops here
         so the card behind it does not open its modal. This runs before the
         card and row branches below, so it wins wherever a value sits. */
      const copyRow = target.closest("[data-copy-row]") as HTMLElement | null;
      if (copyRow) {
        const value = copyRow.getAttribute("data-copy-value") ?? "";
        if (value) {
          copyText(value).then(copied => {
            if (copied) flashCopied(copyRow);
            else showToast("Couldn't copy to clipboard");
          });
        }
        e.stopPropagation();
        return;
      }

      /* ── Reveal Contact ──
         Every reveal control runs its own React handler — the prospect cards
         through the reveal context, the modal's Recommended Contacts on their
         own state. This listener is on the capture phase, so it only has to
         keep the click off whatever sits behind the button. */
      const revealField = target.closest('[data-name="text-field"]') as HTMLElement | null;
      const revealHit =
        target.closest(".lead-reveal-btn") ||
        target.closest('[data-name="Frame Reveal"]') ||
        /* The whole of a withheld contact card is its reveal control now, not
           just the button on it, so the card counts as a reveal hit for as long
           as it is locked. Without this the press would open the Company Info
           modal from here — on the capture phase, before the card's own handler
           ever ran — and the reveal would never happen. Revealed, the class is
           gone and the card falls through to whatever its surface does with a
           click, exactly as before. */
        target.closest(".lead-contact-card.lead-card-locked") ||
        (revealField?.textContent?.trim() === "Reveal Contact" ? revealField : null) ||
        ((target as HTMLElement).textContent?.trim() === "Reveal Contact" ? target : null);
      if (revealHit) return;

      /* ── Prospects page cards ──
         Every prospect is company-level now, so the whole card opens the
         Company Info modal. Its contact section is a separate surface and
         handles its own clicks. */
      if (page === "leads") {
        const card = target.closest('[data-name="Card"]') as HTMLElement | null;
        if (card) {
          /* By the card's own prospect, not by where it sits.
             Resolving on position meant counting the cards in the page and
             reading that far into the dataset, which is only the right record
             while the page happens to be showing all of them in their original
             order. Sorted, or filtered down to what a selection matched, the
             nth card on screen is not the nth prospect — so a click opened
             some other company's details. The id travels on the card itself. */
          const id = card.dataset.prospectId;
          const prospect = id
            ? getProspectById(id)
            : getProspect(Array.from(document.querySelectorAll('[data-name="Card"]')).indexOf(card));
          if (prospect && openProspectDetails(prospect.name)) {
            e.stopPropagation();
            return;
          }
        }
      }

      /* ── Table rows ──
         The Signals prospects table handles its own row clicks through the
         table context; only the imported page's other rows reach here. */
      const row = target.closest('[data-name="Row"]') as HTMLElement | null;
      if (row) {
        return;
      }

      /* ── Lead company/person rows ── */
      const leadRow = target.closest('[data-name="Company Row"], [data-name="Lead Row"]') as HTMLElement | null;
      if (leadRow) {
        const name = leadRow.querySelector('[data-name="Text"]')?.textContent?.trim();
        if (name) showToast(`Viewing ${name}…`);
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [page, showToast, openProspectDetails]);

  /* ── Filters button: green glow + badge only when filters active ── */
  useEffect(() => {
    if (page !== "signals") return;
    const count = countActiveFilters(appliedFilters);
    /* The page renders more than one Filters control, so update every one. */
    const filterButtons = Array.from(document.querySelectorAll('[data-name="text-field"]'))
      .filter(isFiltersControl) as HTMLElement[];

    filterButtons.forEach(btn => {
      // green border div is the first child (aria-hidden absolute overlay)
      const activeEl = (btn.querySelector("[data-filters-active]") ??
        btn.querySelector("[aria-hidden]")) as HTMLElement | null;
      if (activeEl) activeEl.style.display = count > 0 ? "" : "none";
      const idleEl = btn.querySelector("[data-filters-idle]") as HTMLElement | null;
      if (idleEl) idleEl.style.display = count > 0 ? "none" : "";
      /* The drop shadow belongs to the active state only. */
      if (idleEl) btn.style.filter = count > 0 ? "drop-shadow(0px 0px 2px rgba(0,0,0,0.12))" : "";
      // badge chip is [data-name="chip bg-label-danger"]
      const badge = btn.querySelector('[data-name="chip bg-label-danger"]') as HTMLElement | null;
      if (badge) {
        badge.style.display = count > 0 ? "" : "none";
        const num = badge.querySelector("p");
        if (num) num.textContent = String(count);
      }
    });
  }, [appliedFilters, page]);

  /**
   * Every analytics card on the Signals page reads from this. Recomputed only
   * when the applied filters change, then handed down through context.
   */
  /* Every figure on the page is aggregated from the accounts the filters and
     the date range leave, so the summary cards, their trends and all four
     breakdowns move with the selected period — through the same aggregation,
     so the chart and counter animations run exactly as they did. */
  const analytics = useMemo(
    () =>
      aggregate(
        filterCompanies(appliedFilters, d => isDateWithin(d, dateSelection)),
        appliedFilters.techStack,
      ),
    [appliedFilters, dateSelection],
  );

  /* The table's full body height, so the empty state fills the same space. */
  const fullTableBodyHeight = SIGNAL_ROWS.length * SIGNAL_ROW_HEIGHT;

  /**
   * Every row opens the shared Prospect Details modal for the company it
   * belongs to — a contact-level row resolves to its employer, the same way the
   * Prospects page cards do.
   */
  const onSelectRow = useCallback(
    (id: string) => {
      const prospect = getProspectById(id);
      if (prospect) openProspectDetails(prospect.name);
    },
    [openProspectDetails],
  );

  const resetFilters = useCallback(() => {
    setAppliedFilters(EMPTY_FILTERS);
  }, []);

  /**
   * The Signals row's five chips onto the page's existing filter groups. Four
   * are their own facet; Competitor is the companies picked under that signal,
   * which is where that group already lives.
   */
  const signalsFilterValues = useMemo(
    () => ({
      activity: appliedFilters.activity as readonly string[],
      techStack: appliedFilters.techStack as readonly string[],
      location: appliedFilters.location as readonly string[],
      companySize: appliedFilters.companySize as readonly string[],
      competitor: appliedFilters.signals.competitor as readonly string[],
    }),
    [appliedFilters],
  );

  const signalsFiltersState = useMemo(
    () => ({
      counts: {
        activity: appliedFilters.activity.length,
        techStack: appliedFilters.techStack.length,
        location: appliedFilters.location.length,
        companySize: appliedFilters.companySize.length,
        competitor: appliedFilters.signals.competitor.length,
      },
      hasFilters: hasActiveFilters(appliedFilters),
      clearAll: () => {
        setAppliedFilters(EMPTY_FILTERS);
        showToast("Filters cleared");
      },
      /* The chip that owns each menu renders it, anchored to itself. */
      openChip: signalsChip,
      closeChip: () => setSignalsChip(null),
      renderDropdown: (key: string) =>
        signalsChip === key ? (
          <OptionDropdown
            options={SIGNALS_FILTER_OPTIONS[key]}
            applied={signalsFilterValues[key as SignalsFilterKey]}
            searchPlaceholder={key === "competitor" ? "Search" : undefined}
            /* Competitors is the one group that offers it. */
            includeAll={key === "competitor"}
            /* And the one whose rows carry a logo beside a company name, which
               the default card is too narrow for. */
            width={key === "competitor" ? FILTER_CARD_WIDE_W : undefined}
            icon={
              key === "techStack"
                ? tool => <TechStackLogo tool={tool} />
                : key === "competitor"
                  ? company => <CompanyLogo company={company} />
                  : undefined
            }
            onApply={values =>
              setAppliedFilters(prev => applySignalsGroup(prev, key, values))
            }
          />
        ) : null,
    }),
    [appliedFilters, showToast, signalsChip, signalsFilterValues],
  );

  /* The header's reveal allowance now renders from state via context. */
  const revealAllowance = useMemo(
    () => ({ used: revealsUsed, total: REVEAL_ALLOWANCE.total }),
    [revealsUsed],
  );

  /**
   * Contact reveals. The surface runs the loader, the burst and the unlock
   * itself; the allowance and the Buy More flow stay here, so spending a
   * reveal works exactly as it did on the contact-level cards.
   *
   * The revealed set is keyed by contact id, so a person disclosed on a
   * prospect card is already disclosed when that prospect's modal opens — and
   * revealing them there costs nothing further.
   */
  const prospectReveal = useMemo<ProspectRevealState>(
    () => ({
      revealed: revealedContacts,
      requestReveal: id => {
        /* Already disclosed — no allowance to spend. */
        if (revealedContacts.has(id)) return true;
        /* Out of allowance — the existing Buy More flow takes over. */
        if (revealsUsed >= REVEAL_ALLOWANCE.total) {
          setBuyMoreOpen(true);
          return false;
        }
        return true;
      },
      completeReveal: (id, disclosed) => {
        if (revealedContacts.has(id)) return;
        setRevealedContacts(prev => new Set(prev).add(id));
        setRevealsUsed(n => n + 1);
        showToast(disclosed ? `Contact revealed — ${disclosed}` : "Contact revealed");
      },
    }),
    [revealedContacts, revealsUsed, showToast],
  );

  /* Which prospect cards survive the applied filters and the toolbar search.
     One source for both the cards' visibility and the header's count, so the
     number beside "Prospects" can never disagree with the list below it. */
  /* The Sort control's order. Everything downstream — the cards, the table and
     the visibility map — reads this rather than PROSPECTS directly. */
  const orderedProspects = useMemo(() => sortProspects(prospectSort), [prospectSort]);

  const prospectVisibility = useMemo(() => {
    const query = prospectSearch.trim().toLowerCase();
    const rows = leadVisibility(appliedLeadsFilters);
    return Object.fromEntries(
      PROSPECTS.map((p, i) => {
        const matches =
          !query || [p.name, p.domain, p.industry].join(" ").toLowerCase().includes(query);
        /* Filters, search and the date range are all conditions on the same
           prospect, so a card shows only when it satisfies every one of them.
           The count beside the heading reads this map, so it follows. */
        return [
          p.id,
          rows[i] !== false && matches && isWithinSelection(p.date, dateSelection),
        ];
      }),
    ) as Record<string, boolean>;
  }, [appliedLeadsFilters, prospectSearch, dateSelection]);

  /**
   * The prospects the page lists — the Sort control's order, narrowed by every
   * active filter, the search and the date range.
   *
   * The card view renders this. It used to render the whole dataset and then
   * have an effect write `display: none` onto the cards the filters excluded,
   * which left nineteen cards in the page whatever was selected: the list was
   * only styled to look filtered. Nothing downstream could tell an excluded
   * card from an absent one, so a selection that matched nothing produced a
   * page of hidden cards and no empty state — the section simply went blank.
   * Building the list instead means what is rendered is what matched.
   *
   * One card per company, so a company cannot be listed twice for holding more
   * than one record — another session, visit, location or signal. The dataset
   * holds one prospect per company today, so nothing is dropped here yet.
   */
  const visibleProspects = useMemo(() => {
    const seen = new Set<string>();
    return orderedProspects.filter(p => {
      if (prospectVisibility[p.id] === false || seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });
  }, [orderedProspects, prospectVisibility]);

  /**
   * Prospects page toolbar: the search query plus the two actions that moved
   * into the More menu. Both keep the toasts the toolbar buttons used to show.
   */
  const prospectsPageState = useMemo(
    () => ({
      dateLabel,
      dateOpen,
      search: prospectSearch,
      setSearch: setProspectSearch,
      /* The list's own length, so the number beside the heading counts exactly
         the companies listed under it and the two cannot disagree. */
      visibleCount: visibleProspects.length,
      view: prospectView,
      setView: setProspectView,
      onExport: () => showToast("Export started — 8 prospects"),
      onNotify: () => setNotifyOpen(true),
      /* The filter row reads its state from here rather than being written to
         through the DOM, so a chip is active exactly when its group is. */
      prospects: visibleProspects,
      sort: prospectSort,
      setSort: setProspectSort,
      signalsCount: appliedLeadsFilters.signals.length + appliedLeadsFilters.leads.length,
      contactsCount: appliedLeadsFilters.contacts.length,
      intentCount: appliedLeadsFilters.intent.length,
      industryCount: appliedLeadsFilters.industries.length,
      contacts: appliedLeadsFilters.contacts,
      intent: appliedLeadsFilters.intent,
      industries: appliedLeadsFilters.industries,
      hasFilters: hasActiveLeadsFilters(appliedLeadsFilters),
      clearSignals: () => {
        setAppliedLeadsFilters(prev => ({ ...prev, leads: [], signals: [] }));
      },
      clearContacts: () => setAppliedLeadsFilters(prev => ({ ...prev, contacts: [] })),
      clearIntent: () => setAppliedLeadsFilters(prev => ({ ...prev, intent: [] })),
      clearIndustry: () => setAppliedLeadsFilters(prev => ({ ...prev, industries: [] })),
      /* The chip that owns each menu renders it, anchored to itself. */
      openFilter: filterOpen
        ? "signals"
        : intentOpen
          ? "intent"
          : industryOpen
            ? "industry"
            : contactsOpen
              ? "contacts"
              : null,
      closeFilter: () => {
        setFilterOpen(false);
        setIntentOpen(false);
        setIndustryOpen(false);
        setContactsOpen(false);
      },
      renderFilterDropdown: (key: string) => {
        if (key === "signals" && filterOpen) {
          return (
            <LeadsFilterPanel
              applied={appliedLeadsFilters.signals}
              onApply={signals => setAppliedLeadsFilters(prev => ({ ...prev, signals }))}
            />
          );
        }
        if (key === "intent" && intentOpen) {
          return (
            <IntentFilterPanel
              applied={appliedLeadsFilters.intent}
              onApply={(intent: string[]) => setAppliedLeadsFilters(prev => ({ ...prev, intent }))}
            />
          );
        }
        if (key === "industry" && industryOpen) {
          return (
            <IndustryFilterPanel
              applied={appliedLeadsFilters.industries}
              onApply={(industries: string[]) =>
                setAppliedLeadsFilters(prev => ({ ...prev, industries }))
              }
            />
          );
        }
        if (key === "contacts" && contactsOpen) {
          return (
            <ContactsFilterPanel
              applied={appliedLeadsFilters.contacts}
              onApply={(contacts: ContactVariant[]) =>
                setAppliedLeadsFilters(prev => ({ ...prev, contacts }))
              }
            />
          );
        }
        return null;
      },
      resetFilters: () => {
        setAppliedLeadsFilters(EMPTY_LEADS_FILTERS);
        showToast("Filters cleared");
      },
    }),
    [
      appliedLeadsFilters,
      contactsOpen,
      dateOpen,
      dateLabel,
      filterOpen,
      industryOpen,
      intentOpen,
      prospectSearch,
      prospectSort,
      prospectView,
      showToast,
      visibleProspects,
    ],
  );

  /**
   * The Prospects page's table view runs on the same table component and the
   * same context as the Signals page's, fed by this page's filtered dataset —
   * so the two views can never show a different set of prospects.
   */
  const prospectTableState = useMemo(
    () => ({
      isEmpty: Object.values(prospectVisibility).every(visible => !visible),
      onReset: () => {
        setAppliedLeadsFilters(EMPTY_LEADS_FILTERS);
        setProspectSearch("");
      },
      emptyMinHeight: PROSPECTS.length * SIGNAL_ROW_HEIGHT,
      visibility: prospectVisibility,
      onSelectRow,
      order: orderedProspects.map(p => p.id),
    }),
    [orderedProspects, prospectVisibility, onSelectRow],
  );

  /**
   * What the Signals page's prospects section runs on.
   *
   * No visibility and no empty flag: the section is not one of the surfaces the
   * page's filters narrow. Those narrow the accounts the summary figures, their
   * trends and the four breakdowns are aggregated from — `analytics` above —
   * and the prospects section lists the same companies in the same order
   * whatever is selected, so nothing about the filter state reaches it. An
   * empty visibility map is how this context spells "nothing filtered out": a
   * row is hidden only on an explicit false.
   *
   * Only the two behaviours the section actually has are passed: the click that
   * opens a prospect's details, and the reset its no-data state offers.
   */
  const leadsTableState = useMemo(
    () => ({
      isEmpty: false,
      onReset: resetFilters,
      emptyMinHeight: fullTableBodyHeight,
      visibility: {},
      onSelectRow,
    }),
    [resetFilters, fullTableBodyHeight, onSelectRow],
  );

  /**
   * The date field is static markup from the import, so it is tagged as the
   * picker's trigger here and its label is written from the applied range.
   * The three spans and their padding are the export's own, so the field's
   * layout and styling are untouched.
   */
  useEffect(() => {
    const fields = Array.from(
      document.querySelectorAll<HTMLElement>('[data-name="text-field"]'),
    ).filter(el => {
      /* Found by its arrow the first time and by its own marker after that: a
         preset's label carries no arrow, so matching on one alone would lose
         the field the moment it stopped showing a range. */
      if (el.hasAttribute("data-date-field")) return true;
      return (el.textContent ?? "").includes("→");
    });

    fields.forEach(el => {
      el.setAttribute("data-date-field", "");
      const spans = el.querySelectorAll("span");
      /* The export draws the label in three spans — start, arrow, end. The
         label is written into the first and the other two are emptied, so this
         field reads exactly what the Prospects page's own control reads: the
         two pages had been formatting the same selection separately, and only
         this one still spelled a range without its year. The markup and the
         field's size are the export's throughout. */
      if (spans.length >= 3) {
        spans[0].textContent = dateLabel;
        spans[1].textContent = "";
        spans[2].textContent = "";
      }
    });
  }, [dateSelection, dateLabel, page]);

  /**
   * The Signals date field reads as active while its calendar is up, matching
   * an open filter — the same stroke colour and the same drop shadow.
   *
   * The field is static export markup, so this is set on the element rather
   * than through a class: the stroke lives on the field's own aria-hidden
   * overlay, the shadow on the field. Only its colour and shadow are touched,
   * so the border width, radius and size are the export's throughout, and
   * clearing them restores the default exactly. The Prospects page is left
   * alone here — its date control is a React component that tracks this
   * itself, and writing to it would only be undone on the next render.
   */
  useEffect(() => {
    if (page !== "signals") return;
    const fields = Array.from(document.querySelectorAll<HTMLElement>("[data-date-field]"));
    const paint = (el: HTMLElement, on: boolean) => {
      const stroke = el.querySelector<HTMLElement>('[aria-hidden="true"]');
      if (stroke) stroke.style.borderColor = on ? FIELD_ACTIVE_BORDER : "";
      el.style.filter = on ? FIELD_ACTIVE_SHADOW : "";
    };
    fields.forEach(el => paint(el, dateOpen));
    /* Cleared on the way out, so leaving the page or closing the picker can
       never strand a field in the open treatment. */
    return () => fields.forEach(el => paint(el, false));
  }, [dateOpen, dateSelection, page]);


  /* ── page dimensions ── */
  /* Design canvas. The height is the height the page was drawn at, and it is a
     floor rather than a cap: a page whose content runs past it — the Prospects
     list, which grows with the dataset — takes the canvas down with it, so the
     surfaces painted against the canvas's bottom edge still reach the end of
     the content. */
  const dims = page === "signals" ? { w: 1440, h: 1750 } : { w: 1440, h: 1069 };

  return (
    /* Both the page and the Prospect Details modal below read reveals from
       here, so a contact disclosed on a card is disclosed in the modal too. */
    <ProspectRevealProvider value={prospectReveal}>
    <div ref={containerRef} className="relative w-full min-h-screen overflow-auto bg-[#dde8e5]">
      {/* The design is authored on a 1440px canvas. Width tracks the viewport so
          the content fills it, with minWidth holding the desktop layout intact
          below 1440 rather than letting it squeeze. */}
      <div
        style={{
          width: "100%",
          minWidth: dims.w,
          /* A floor, not a cap: the design's own height, and never shorter than
             the viewport so the content surface still reaches the bottom of the
             window. Nothing bounds it from above, so a page taller than either
             grows to its content rather than spilling out of a fixed box. */
          minHeight: `max(${dims.h}px, 100vh)`,
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Both pages show the Contact Reveals allowance in their header. */}
        <RevealAllowanceProvider value={revealAllowance}>
          {page === "signals" ? (
            <SignalsAnalyticsProvider value={analytics}>
              {/* The filter row's chips read their counts and clearing from here. */}
              <SignalsFiltersProvider value={signalsFiltersState}>
                {/* The table's empty state renders in flow inside the table itself. */}
                <LeadsTableProvider value={leadsTableState}>
                  <BuyerActivityBuyerIntentStarter />
                </LeadsTableProvider>
              </SignalsFiltersProvider>
            </SignalsAnalyticsProvider>
          ) : (
            /* The prospect cards read the reveal allowance from here rather
               than having it threaded through the imported layout frames. */
            <ProspectsPageProvider value={prospectsPageState}>
              <LeadsTableProvider value={prospectTableState}>
                <BuyerActivityLeads />
              </LeadsTableProvider>
            </ProspectsPageProvider>
          )}
        </RevealAllowanceProvider>
      </div>

      {/* ── Filter Dropdown ── */}
      {filterOpen && page === "signals" && (
        <FilterPanel
          position={filterPos}
          onClose={() => setFilterOpen(false)}
          initial={filterDraft}
          onReset={resetFilters}
          onDraftChange={setFilterDraft}
          onApply={setAppliedFilters}
        />
      )}

      {/* ── Date range ── */}
      {dateOpen && (
        <DateRangeControl
          /* Remounted per opening, so the popover always starts on the presets
             rather than wherever it was left last time. */
          key={`${page}-${dateAnchor.bottom}`}
          anchor={dateAnchor}
          align={page === "signals" ? "right" : "left"}
          selection={dateSelection}
          onSelect={setDateSelection}
          onClose={() => setDateOpen(false)}
        />
      )}

      {/* ── Company Info modal (Figma 23:1455) ── */}
      {companyModal && (
        /* Keyed by company so switching prospects remounts the modal and its
           tab selection starts from the first nav item again. */
        <CompanyInfoModal
          key={companyModal.name}
          company={companyModal}
          onClose={() => setCompanyModal(null)}
        />
      )}

      {/* Last, and at a higher z-index than the modal above: opening Buy More
         leaves Prospect Details mounted underneath — same prospect, same tab,
         same reveal state — and closing Buy More simply uncovers it. */}
      {/* Add Lead Notification Recipients (Figma 246:1584), opened from the
          More menu. Same scrim and dismissal as the Company Info dialog. */}
      {notifyOpen && (
        <NotifyRecipientsModal
          onClose={() => setNotifyOpen(false)}
          onAdd={(email, total) =>
            showToast(total === 1 ? `Added ${email}` : `Added ${email} · ${total} recipients`)
          }
          onReject={showToast}
        />
      )}

      {buyMoreOpen && <BuyMoreModal onClose={() => setBuyMoreOpen(false)} />}



      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10010] bg-[#072929] text-white px-5 py-3 rounded-xl shadow-lg text-[13px] font-['Inter',sans-serif] font-medium pointer-events-none">
          {toast}
        </div>
      )}
    </div>
    </ProspectRevealProvider>
  );
}
