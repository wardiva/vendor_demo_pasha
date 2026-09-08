import { useState } from "react";
import { COMPANY_FIELDS, type CompanyProfile } from "@/data/companies";
import { getCompanyDetails } from "@/data/companyDetails";
import CopyableValue from "@/components/CopyableValue";
import DetailModal, { type DetailTab } from "./DetailModal";
import { ContactsPanel, DetailRows, NotesPanel, TechStackPanel } from "./CompanyPanels";
import ActivitySessionsPanel from "./ActivitySessions";
import iconCompanyInfo from "./assets/icon-company-info.svg";
import iconTechStack from "./assets/icon-tech-stack.svg";
import iconActivity from "./assets/icon-activity.svg";
import iconContacts from "./assets/icon-contacts.svg";
import iconNotes from "./assets/icon-notes.svg";

/**
 * Company Info dialog — Figma node 23:1455.
 *
 * Opened from company-level rows in the Signals table and company-level cards
 * on the Leads page.
 */

const TABS: DetailTab[] = [
  /* This glyph is a 14x14 leaf inset inside its 18x18 frame (node 23:1516),
     rather than filling it like the other three. */
  { label: "Contacts", icon: iconContacts, inset: true },
  { label: "Company Information", icon: iconCompanyInfo },
  { label: "Company Tech Stack", icon: iconTechStack },
  { label: "Activity", icon: iconActivity },
];

/* Figma 181:6779 — last in the rail, and only for a prospect we hold a
   verified contact for. */
const NOTES_TAB: DetailTab = { label: "Notes", icon: iconNotes };

/**
 * The social handles copy the way a phone number or an email address does.
 *
 * They are the only fields here anyone retypes elsewhere, so they take the
 * module's one copy affordance rather than a pattern of their own: the icon
 * appears beside the value on hover, a click anywhere on the value copies
 * exactly what is displayed, and the tick is held for the same moment. All of
 * that already lives in CopyableValue and the page's copy delegate, including
 * holding the click back from anything behind it.
 */
const COPYABLE_FIELDS = new Set<keyof CompanyProfile>([
  /* The address is retyped as often as the handles are, and it is the same
     kind of value — something you take somewhere else — so it takes the same
     affordance rather than being the one row you have to select by hand. */
  "website",
  "linkedin",
  "facebook",
  "x",
  "instagram",
]);

export function CompanyInformationPanel({ company }: { company: CompanyProfile }) {
  return (
    <DetailRows
      rows={COMPANY_FIELDS.map(f => {
        const value = String(company[f.key]);
        if (!COPYABLE_FIELDS.has(f.key)) return { label: f.label, value };
        return {
          label: f.label,
          /* relative: the copy button is positioned against its own value, so
             it sits beside that value rather than the row. It is absolute, so
             revealing it adds no width and shifts nothing. lead-copy-left puts
             it before the value, which is where there is room here — these
             values run to the right edge of the row. */
          value: (
            <CopyableValue value={value} className="lead-copy-left relative">
              <p className="leading-[22px]">{value}</p>
            </CopyableValue>
          ),
        };
      })}
    />
  );
}

export default function CompanyInfoModal({
  company,
  onClose,
}: {
  company: CompanyProfile;
  onClose: () => void;
}) {
  /* Opens on the first nav item — Contacts. App keys the modal by company, so
     opening it for another prospect mounts a fresh one and lands there again. */
  const [activeTab, setActiveTab] = useState<string>(TABS[0].label);
  const details = getCompanyDetails(company.name);
  const tabs = details.verifiedContacts.length > 0 ? [...TABS, NOTES_TAB] : TABS;

  return (
    <DetailModal
      image={company.logo}
      title={company.name}
      subtitle={company.website}
      intentPct={company.intentPct}
      tabs={tabs}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onClose={onClose}
      ariaLabel={`${company.name} company information`}
    >
      {activeTab === "Contacts" ? (
        <ContactsPanel
          company={company.name}
          verified={details.verifiedContacts}
          recommended={details.recommendedContacts}
        />
      ) : activeTab === "Company Tech Stack" ? (
        <TechStackPanel entries={details.techStack} />
      ) : activeTab === "Activity" ? (
        <ActivitySessionsPanel company={company.name} />
      ) : activeTab === "Notes" ? (
        <NotesPanel company={company.name} />
      ) : (
        <CompanyInformationPanel company={company} />
      )}
    </DetailModal>
  );
}
