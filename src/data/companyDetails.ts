import { getCompanyProfile } from "@/data/companies";
import { deriveEmail, derivePhone } from "@/data/contactIdentity";
import avatarCaleb from "@/imports/BuyerActivityBuyerIntentStarter/025345fc75e7100f8bef072c3c35641d598f915e.png";
import avatarSophia from "@/imports/BuyerActivityBuyerIntentStarter/cd81baf587a9dd9e1b0dd03b300af6b2dcd43627.png";
import avatarChloe from "@/imports/BuyerActivityBuyerIntentStarter/1d005ad055e5ad711af65c3db30f19057b89ab41.png";
import avatarAmelia from "@/imports/BuyerActivityBuyerIntentStarter/e1316db0d52da017d8dadbb3f046c242e3ae0c06.png";
import avatarJaylon from "@/imports/BuyerActivityLeads/ffebdcde90720141416a1da9597aec20a03c136b.png";
import avatarKadin from "@/imports/BuyerActivityLeads/b73fe3d0390fdfead34e26dcf9c85a169c8ae528.png";
import avatarJaydon from "@/imports/BuyerActivityLeads/c2d54489d822cc73ac687f9cb20a3c817ba0ead4.png";
import avatarElena from "@/data/assets/avatar-elena.png";
import avatarJames from "@/data/assets/avatar-james.png";
import avatarPriya from "@/data/assets/avatar-priya.png";
import avatarMarcus from "@/data/assets/avatar-marcus.png";
import avatarNadia from "@/data/assets/avatar-nadia.png";
import avatarDaniel from "@/data/assets/avatar-daniel.png";
import avatarTobias from "@/data/assets/avatar-tobias.png";
import avatarRachel from "@/data/assets/avatar-rachel.png";
import avatarFigma from "@/data/assets/avatar-figma.png";

import techSalesforce from "@/components/company/assets/tech-salesforce.svg";
import techAws from "@/components/company/assets/tech-aws.svg";
import techLinear from "@/components/company/assets/tech-linear.svg";
import techGWorkspace from "@/components/company/assets/tech-gworkspace.svg";
import techGWorkspaceMask from "@/components/company/assets/tech-gworkspace-mask.svg";
import techWordpress from "@/components/company/assets/tech-wordpress.svg";
import techTeams from "@/components/company/assets/tech-teams.png";

/**
 * Per-company content for the Company Tech Stack, Activity and Recommended
 * Contacts panels of the Company Info modal
 * (Figma nodes 23:1556, 23:1689 and 23:1841).
 */

/* ─────────────────────────── tech stack ─────────────────────────── */

/**
 * How each tool's mark is drawn. The outer box and the glyph inside it are
 * sized separately, matching the frames in the design.
 */
export type TechLogo = {
  src: string;
  /** Outer box from the design. */
  box: { w: number; h: number };
  /** Set when the glyph is masked rather than drawn edge to edge. */
  mask?: string;
  /** Set when the design rotates the mark. */
  flip?: boolean;
  clip?: boolean;
};

export const TECH_LOGOS: Record<string, TechLogo> = {
  Salesforce: { src: techSalesforce, box: { w: 34, h: 24 }, clip: true },
  AWS: { src: techAws, box: { w: 32, h: 20 } },
  Linear: { src: techLinear, box: { w: 24, h: 24 } },
  "Google Workspace": { src: techGWorkspace, box: { w: 23, h: 24 }, mask: techGWorkspaceMask, clip: true },
  "Microsoft Teams": { src: techTeams, box: { w: 23, h: 24 } },
  WordPress: { src: techWordpress, box: { w: 24, h: 24 }, flip: true },
};

export type TechEntry = { category: string; tool: keyof typeof TECH_LOGOS };

/* ─────────────────────────── activity ─────────────────────────── */

export type ActivityEntry = {
  title: string;
  /** Relative time shown on the right. */
  ago: string;
  /** Absolute timestamp shown beneath. */
  timestamp: string;
};

/* ─────────────────────── recommended contacts ─────────────────────── */

export type ContactEntry = {
  name: string;
  jobTitle: string;
  /** Both channels, on every contact — completed below where a record states
   *  only one of them. */
  phone?: string;
  email?: string;
  avatar: string;
  /** Locked contacts render behind the reveal overlay until revealed. */
  locked: boolean;
};

export type CompanyDetails = {
  techStack: TechEntry[];
  activity: ActivityEntry[];
  /** Contacts we hold a verified direct line for — phone-first disclosure. */
  verifiedContacts: ContactEntry[];
  /** Model-suggested contacts, shown with the recommended-contact pattern. */
  recommendedContacts: ContactEntry[];
};

const DETAILS: Record<string, CompanyDetails> = {
  "Alderwood Logistics": {
    /* Matches the Figma design exactly. */
    techStack: [
      { category: "CRM & Marketing", tool: "Salesforce" },
      { category: "Cloud Infrastructure", tool: "AWS" },
      { category: "Project Management", tool: "Linear" },
      { category: "Productivity", tool: "Google Workspace" },
      { category: "Collaboration", tool: "Microsoft Teams" },
      { category: "CMS & Website", tool: "WordPress" },
    ],
    activity: [
      { title: "Viewed your sponsored placement 2 times", ago: "21m ago", timestamp: "Jul 16, 2026 · 19:29" },
      { title: "Viewed your product profile 4 times", ago: "1d ago", timestamp: "Jul 16, 2026 · 19:29" },
      { title: "Compared your product with ClickUp 6 times", ago: "5d ago", timestamp: "Jul 10, 2026 · 08:38" },
      { title: "Viewed your reference page 1 time", ago: "1w ago", timestamp: "Jul 10, 2026 · 03:23" },
      { title: "Viewed your alternatives page 2 times", ago: "1w ago", timestamp: "Jul 8, 2026 · 17:08" },
      { title: "Viewed the Kanban Software category page 5 times", ago: "1w ago", timestamp: "Jul 8, 2026 · 11:29" },
      { title: "Viewed a competitor page for ClickUp 6 times", ago: "1w ago", timestamp: "Jul 8, 2026 · 10:27" },
      { title: "Viewed a article page 2 times", ago: "1w ago", timestamp: "Jul 8, 2026 · 10:27" },
      { title: "Compared your product with Asana 3 times", ago: "1w ago", timestamp: "Jul 8, 2026 · 10:27" },
      { title: "Viewed your reviews page 5 times", ago: "1w ago", timestamp: "Jul 7, 2026 · 16:55" },
    ],
    verifiedContacts: [
      { name: "Caleb Alvarez", jobTitle: "Senior Director, Operations", phone: "+1 919-555-5382", avatar: avatarCaleb, locked: true },
      { name: "Sophia Moreau", jobTitle: "Chief Product Officer", phone: "+1 919-555-4417", avatar: avatarSophia, locked: true },
    ],
    recommendedContacts: [
      { name: "Marcus Feld", jobTitle: "Director of IT", email: "marcus.feld@alderwood.ca", avatar: avatarJaylon, locked: true },
      { name: "Priya Raman", jobTitle: "Procurement Lead", email: "priya.raman@alderwood.ca", avatar: avatarAmelia, locked: true },
    ],
  },

  "Junction Freight Co": {
    techStack: [
      { category: "CRM & Marketing", tool: "Salesforce" },
      { category: "Cloud Infrastructure", tool: "AWS" },
      { category: "Project Management", tool: "Linear" },
      { category: "Collaboration", tool: "Microsoft Teams" },
    ],
    activity: [
      { title: "Compared your product with ClickUp 9 times", ago: "6m ago", timestamp: "Jul 16, 2026 · 19:44" },
      { title: "Viewed your pricing page 7 times", ago: "3h ago", timestamp: "Jul 16, 2026 · 16:12" },
      { title: "Viewed a competitor page for Asana 4 times", ago: "2d ago", timestamp: "Jul 14, 2026 · 09:51" },
      { title: "Viewed the Logistics Software category page 3 times", ago: "4d ago", timestamp: "Jul 12, 2026 · 14:07" },
      { title: "Viewed your product profile 2 times", ago: "1w ago", timestamp: "Jul 9, 2026 · 11:02" },
      { title: "Viewed your reviews page 1 time", ago: "1w ago", timestamp: "Jul 8, 2026 · 08:19" },
    ],
    verifiedContacts: [
      { name: "Chloe Lindqvist", jobTitle: "IT Operations Manager", phone: "+1 919-555-7710", avatar: avatarChloe, locked: true },
      { name: "Amelia Brooks", jobTitle: "Systems Administrator", phone: "+1 919-555-5382", avatar: avatarAmelia, locked: true },
    ],
    recommendedContacts: [
      { name: "Dominic Sayer", jobTitle: "VP Logistics", email: "dominic.sayer@junctionfreight.com", avatar: avatarKadin, locked: true },
      { name: "Nadia Whitfield", jobTitle: "Head of Procurement", email: "nadia.whitfield@junctionfreight.com", avatar: avatarSophia, locked: true },
    ],
  },

  "Brown and Caldwell": {
    techStack: [
      { category: "CRM & Marketing", tool: "Salesforce" },
      { category: "Cloud Infrastructure", tool: "AWS" },
      { category: "Productivity", tool: "Google Workspace" },
      { category: "Collaboration", tool: "Microsoft Teams" },
    ],
    activity: [
      { title: "Viewed your product profile 6 times", ago: "42m ago", timestamp: "Jul 16, 2026 · 19:08" },
      { title: "Compared your product with Asana 4 times", ago: "2d ago", timestamp: "Jul 14, 2026 · 11:35" },
      { title: "Viewed your pricing page 3 times", ago: "6d ago", timestamp: "Jul 10, 2026 · 16:22" },
      { title: "Viewed your reviews page 2 times", ago: "1w ago", timestamp: "Jul 8, 2026 · 09:44" },
    ],
    verifiedContacts: [
      { name: "Kadin Dorwart", jobTitle: "Senior Director, Operations", phone: "+1 919-555-8247", avatar: avatarKadin, locked: true },
      { name: "Renee Okafor", jobTitle: "Head of Facilities Engineering", phone: "+1 919-555-3094", avatar: avatarSophia, locked: true },
    ],
    recommendedContacts: [
      { name: "Tobias Lund", jobTitle: "Director of IT", email: "tobias.lund@brownandcaldwell.com", avatar: avatarJaydon, locked: true },
      { name: "Hannah Reyes", jobTitle: "Procurement Manager", email: "hannah.reyes@brownandcaldwell.com", avatar: avatarAmelia, locked: true },
    ],
  },

  "Beacon Learning": {
    techStack: [
      { category: "Cloud Infrastructure", tool: "AWS" },
      { category: "Productivity", tool: "Google Workspace" },
      { category: "CMS & Website", tool: "WordPress" },
    ],
    activity: [
      { title: "Viewed your product profile 3 times", ago: "2d ago", timestamp: "Jul 14, 2026 · 13:40" },
      { title: "Viewed your reference page 2 times", ago: "5d ago", timestamp: "Jul 11, 2026 · 10:16" },
      { title: "Viewed the Learning Platforms category page 1 time", ago: "1w ago", timestamp: "Jul 8, 2026 · 15:55" },
    ],
    verifiedContacts: [
      { name: "Sophia Moreau", jobTitle: "Chief Product Officer", phone: "+1 919-555-5382", avatar: avatarSophia, locked: true },
      { name: "Elias Warrick", jobTitle: "Director of Learning Operations", phone: "+1 919-555-9163", avatar: avatarCaleb, locked: true },
    ],
    recommendedContacts: [
      { name: "Maya Chandra", jobTitle: "Head of Curriculum Technology", email: "maya.chandra@beaconlearn.ca", avatar: avatarAmelia, locked: true },
      { name: "Owen Duquesne", jobTitle: "IT Manager", email: "owen.duquesne@beaconlearn.ca", avatar: avatarKadin, locked: true },
    ],
  },

  "Meridian Supply Co.": {
    techStack: [
      { category: "CRM & Marketing", tool: "Salesforce" },
      { category: "Cloud Infrastructure", tool: "AWS" },
      { category: "Collaboration", tool: "Microsoft Teams" },
    ],
    activity: [
      { title: "Viewed your pricing page 5 times", ago: "2h ago", timestamp: "Jul 18, 2026 · 09:12" },
      { title: "Compared your product with ClickUp 3 times", ago: "2d ago", timestamp: "Jul 16, 2026 · 14:38" },
      { title: "Viewed your product profile 4 times", ago: "5d ago", timestamp: "Jul 13, 2026 · 11:05" },
    ],
    verifiedContacts: [
      { name: "Elena Vasquez", jobTitle: "VP of Procurement", phone: "+1 312-555-4091", avatar: avatarElena, locked: true },
    ],
    recommendedContacts: [
      { name: "Owen Bradshaw", jobTitle: "Plant Operations Lead", email: "owen.bradshaw@meridiansupply.com", avatar: avatarNadia, locked: true },
      { name: "Ines Moreau", jobTitle: "Supply Chain Analyst", email: "ines.moreau@meridiansupply.com", avatar: avatarPriya, locked: true },
    ],
  },
  "Northvane Technologies": {
    techStack: [
      { category: "Cloud Infrastructure", tool: "AWS" },
      { category: "Project Management", tool: "Linear" },
      { category: "Productivity", tool: "Google Workspace" },
    ],
    activity: [
      { title: "Viewed your reference page 6 times", ago: "41m ago", timestamp: "Aug 02, 2026 · 16:47" },
      { title: "Viewed your alternatives page 2 times", ago: "1d ago", timestamp: "Aug 01, 2026 · 10:22" },
    ],
    verifiedContacts: [
      { name: "James Whitfield", jobTitle: "Chief Revenue Officer", phone: "+1 628-555-7320", avatar: avatarJames, locked: true },
    ],
    recommendedContacts: [
      { name: "Sofia Marchetti", jobTitle: "VP Engineering", email: "sofia.marchetti@northvane.io", avatar: avatarRachel, locked: true },
      { name: "Dominic Yates", jobTitle: "Head of Platform", email: "dominic.yates@northvane.io", avatar: avatarDaniel, locked: true },
    ],
  },
  "Bowline Freight": {
    techStack: [
      { category: "CRM & Marketing", tool: "Salesforce" },
      { category: "Collaboration", tool: "Microsoft Teams" },
      { category: "CMS & Website", tool: "WordPress" },
    ],
    activity: [
      { title: "Viewed your sponsored placement 3 times", ago: "6h ago", timestamp: "Jun 25, 2026 · 08:19" },
      { title: "Viewed the Logistics Software category page 4 times", ago: "3d ago", timestamp: "Jun 22, 2026 · 13:54" },
    ],
    verifiedContacts: [
      { name: "Callum Ridley", jobTitle: "Director of Fleet Operations", phone: "+1 704-555-8126", avatar: avatarPriya, locked: true },
    ],
    recommendedContacts: [
    ],
  },
  "Canopy Health Group": {
    techStack: [
      { category: "Productivity", tool: "Google Workspace" },
      { category: "Collaboration", tool: "Microsoft Teams" },
      { category: "Project Management", tool: "Linear" },
    ],
    activity: [
      { title: "Viewed your reviews page 4 times", ago: "19m ago", timestamp: "Aug 11, 2026 · 15:03" },
      { title: "Compared your product with Asana 2 times", ago: "4d ago", timestamp: "Aug 07, 2026 · 09:41" },
    ],
    verifiedContacts: [
      { name: "Marcus Lindgren", jobTitle: "Head of Business Dev", phone: "+1 206-555-9243", avatar: avatarMarcus, locked: true },
    ],
    recommendedContacts: [
      { name: "Rebecca Oyelaran", jobTitle: "Clinical Systems Director", email: "rebecca.oyelaran@canopyhealth.org", avatar: avatarNadia, locked: true },
      { name: "Tom Vasey", jobTitle: "IT Operations Manager", email: "tom.vasey@canopyhealth.org", avatar: avatarJames, locked: true },
    ],
  },
  "Stratos Analytics": {
    techStack: [
      { category: "Cloud Infrastructure", tool: "AWS" },
      { category: "Project Management", tool: "Linear" },
      { category: "CRM & Marketing", tool: "Salesforce" },
    ],
    activity: [
      { title: "Viewed your product profile 3 times", ago: "1d ago", timestamp: "May 30, 2026 · 12:26" },
      { title: "Viewed a competitor page for ClickUp 2 times", ago: "1w ago", timestamp: "May 24, 2026 · 17:11" },
    ],
    verifiedContacts: [
    ],
    recommendedContacts: [
      { name: "Nadia Okoro", jobTitle: "Senior Account Executive", email: "nadia.okoro@stratosanalytics.com", avatar: avatarNadia, locked: true },
      { name: "Priyanka Rao", jobTitle: "Head of Data Platform", email: "priyanka.rao@stratosanalytics.com", avatar: avatarPriya, locked: true },
      { name: "Callum Byrne", jobTitle: "Analytics Engineering Lead", email: "callum.byrne@stratosanalytics.com", avatar: avatarTobias, locked: true },
    ],
  },
  "Ironclad Construction": {
    techStack: [
      { category: "Collaboration", tool: "Microsoft Teams" },
      { category: "CMS & Website", tool: "WordPress" },
      { category: "Productivity", tool: "Google Workspace" },
    ],
    activity: [
      { title: "Viewed your pricing page 2 times", ago: "3d ago", timestamp: "Jul 03, 2026 · 10:48" },
      { title: "Viewed your reference page 1 time", ago: "1w ago", timestamp: "Jun 27, 2026 · 08:02" },
    ],
    verifiedContacts: [
      { name: "Daniel Reeves", jobTitle: "General Manager", phone: "+1 503-555-3402", avatar: avatarDaniel, locked: true },
    ],
    recommendedContacts: [
      { name: "Marta Kowalski", jobTitle: "Head of Site Operations", email: "marta.kowalski@ironcladbuilt.com", avatar: avatarRachel, locked: true },
      { name: "Greg Halloran", jobTitle: "Project Controls Manager", email: "greg.halloran@ironcladbuilt.com", avatar: avatarMarcus, locked: true },
    ],
  },
  "Summit Ridge Energy": {
    techStack: [
      { category: "Cloud Infrastructure", tool: "AWS" },
      { category: "Productivity", tool: "Google Workspace" },
    ],
    activity: [
      { title: "Viewed your product profile 2 times", ago: "2d ago", timestamp: "Jul 09, 2026 · 14:15" },
      { title: "Viewed the Renewables category page 1 time", ago: "1w ago", timestamp: "Jul 02, 2026 · 09:33" },
    ],
    verifiedContacts: [
      { name: "Tobias Engström", jobTitle: "Business Development Manager", phone: "+1 858-555-4637", avatar: avatarTobias, locked: true },
    ],
    recommendedContacts: [
      { name: "Lena Fischer", jobTitle: "Grid Systems Lead", email: "lena.fischer@summitridgeenergy.com", avatar: avatarElena, locked: true },
      { name: "Andre Costa", jobTitle: "Asset Management Director", email: "andre.costa@summitridgeenergy.com", avatar: avatarDaniel, locked: true },
    ],
  },
  "Pinehurst Media": {
    techStack: [
      { category: "CRM & Marketing", tool: "Salesforce" },
      { category: "CMS & Website", tool: "WordPress" },
    ],
    activity: [
      { title: "Viewed your reviews page 2 times", ago: "5d ago", timestamp: "Aug 21, 2026 · 11:57" },
      { title: "Viewed a article page 1 time", ago: "1w ago", timestamp: "Aug 15, 2026 · 16:20" },
    ],
    verifiedContacts: [
      { name: "Rachel Townsend", jobTitle: "Head of Client Strategy", phone: "+1 646-555-2190", avatar: avatarRachel, locked: true },
    ],
    recommendedContacts: [
      { name: "Simone Alvarez", jobTitle: "Media Operations Lead", email: "simone.alvarez@pinehurstmedia.com", avatar: avatarNadia, locked: true },
      { name: "Jonah Whitcombe", jobTitle: "Head of Ad Technology", email: "jonah.whitcombe@pinehurstmedia.com", avatar: avatarJames, locked: true },
    ],
  },

  /* ── The eleven prospects added with Figma 221:2126 ──
     They arrived as cards — a name, a logo, an industry, a date, a score and
     one contact — and never had a detail record, so their modals opened on
     empty states. Each of these is built around the contact its own card
     already shows: same name, same job title, same variant, which is what
     makes the modal read as the same person and what lets a reveal on either
     surface count for both, since the reveal store keys on company and name.
     Phone and email are left to `completeContacts`, which derives them from
     exactly the key the card derives its own from, so the two cannot disagree.
     Everything else — the stack, the activity and the further contacts — is
     new demo content, sized and worded like the records already here and
     dated around each prospect's own visited date. */

  "Apex Logistics Group": {
    techStack: [
      { category: "CRM & Marketing", tool: "Salesforce" },
      { category: "Cloud Infrastructure", tool: "AWS" },
      { category: "Project Management", tool: "Linear" },
      { category: "Collaboration", tool: "Microsoft Teams" },
    ],
    activity: [
      { title: "Compared your product with ClickUp 7 times", ago: "3h ago", timestamp: "Aug 01, 2026 · 15:41" },
      { title: "Viewed your pricing page 4 times", ago: "1d ago", timestamp: "Jul 31, 2026 · 09:18" },
      { title: "Viewed the Logistics Software category page 3 times", ago: "4d ago", timestamp: "Jul 28, 2026 · 13:52" },
      { title: "Viewed your product profile 2 times", ago: "1w ago", timestamp: "Jul 25, 2026 · 10:07" },
    ],
    verifiedContacts: [
      { name: "Carlos Mendez", jobTitle: "Regional Sales Director", avatar: avatarFigma, locked: true },
      { name: "Yusuf Demir", jobTitle: "Head of Fleet Technology", avatar: avatarCaleb, locked: true },
    ],
    recommendedContacts: [
      { name: "Ana Petrova", jobTitle: "Procurement Manager", avatar: avatarAmelia, locked: true },
      { name: "Grant Whitaker", jobTitle: "Director of IT", avatar: avatarKadin, locked: true },
    ],
  },

  "Meridian Health Systems": {
    techStack: [
      { category: "Cloud Infrastructure", tool: "AWS" },
      { category: "Productivity", tool: "Google Workspace" },
      { category: "Collaboration", tool: "Microsoft Teams" },
    ],
    activity: [
      { title: "Viewed your security overview 5 times", ago: "2h ago", timestamp: "Jul 28, 2026 · 14:26" },
      { title: "Viewed your pricing page 3 times", ago: "2d ago", timestamp: "Jul 26, 2026 · 11:03" },
      { title: "Viewed the Healthcare IT category page 2 times", ago: "6d ago", timestamp: "Jul 22, 2026 · 16:39" },
    ],
    verifiedContacts: [
      { name: "Priya Sharma", jobTitle: "VP of Procurement", avatar: avatarFigma, locked: true },
      { name: "Nathan Okonkwo", jobTitle: "Director of Clinical Systems", avatar: avatarJames, locked: true },
    ],
    recommendedContacts: [
      { name: "Ruth Vasilenko", jobTitle: "Head of Information Security", avatar: avatarSophia, locked: true },
      { name: "Isaac Bramley", jobTitle: "IT Operations Manager", avatar: avatarJaydon, locked: true },
    ],
  },

  "NovaTech Solutions": {
    techStack: [
      { category: "Cloud Infrastructure", tool: "AWS" },
      { category: "Project Management", tool: "Linear" },
      { category: "Productivity", tool: "Google Workspace" },
      { category: "CRM & Marketing", tool: "Salesforce" },
    ],
    activity: [
      { title: "Viewed your pricing page 9 times", ago: "38m ago", timestamp: "Jul 30, 2026 · 17:22" },
      { title: "Compared your product with Asana 5 times", ago: "1d ago", timestamp: "Jul 29, 2026 · 12:44" },
      { title: "Viewed your alternatives page 4 times", ago: "3d ago", timestamp: "Jul 27, 2026 · 09:31" },
      { title: "Viewed your product profile 6 times", ago: "5d ago", timestamp: "Jul 25, 2026 · 15:08" },
      { title: "Viewed your reviews page 2 times", ago: "1w ago", timestamp: "Jul 23, 2026 · 10:55" },
    ],
    verifiedContacts: [
      { name: "James Whitfield", jobTitle: "Chief Technology Officer", avatar: avatarFigma, locked: true },
      { name: "Lena Fairbairn", jobTitle: "VP Platform Engineering", avatar: avatarRachel, locked: true },
    ],
    recommendedContacts: [
      { name: "Theo Ndiaye", jobTitle: "Head of Developer Experience", avatar: avatarDaniel, locked: true },
      { name: "Marta Reinholt", jobTitle: "Director of Cloud Operations", avatar: avatarNadia, locked: true },
    ],
  },

  "Pinnacle Financial Group": {
    techStack: [
      { category: "CRM & Marketing", tool: "Salesforce" },
      { category: "Collaboration", tool: "Microsoft Teams" },
      { category: "Productivity", tool: "Google Workspace" },
    ],
    activity: [
      { title: "Viewed your compliance page 4 times", ago: "5h ago", timestamp: "Aug 02, 2026 · 13:10" },
      { title: "Viewed your product profile 3 times", ago: "2d ago", timestamp: "Jul 31, 2026 · 10:47" },
      { title: "Viewed the Financial Services category page 2 times", ago: "5d ago", timestamp: "Jul 28, 2026 · 15:33" },
    ],
    verifiedContacts: [
      { name: "Gregory Adeyemi", jobTitle: "Head of Vendor Management", avatar: avatarCaleb, locked: true },
    ],
    recommendedContacts: [
      { name: "Sarah Chen", jobTitle: "Head of Partnerships", avatar: avatarFigma, locked: true },
      { name: "Felix Barrington", jobTitle: "Director of Digital Strategy", avatar: avatarJaylon, locked: true },
    ],
  },

  "Vanguard Manufacturing": {
    techStack: [
      { category: "Cloud Infrastructure", tool: "AWS" },
      { category: "Project Management", tool: "Linear" },
      { category: "Collaboration", tool: "Microsoft Teams" },
      { category: "CMS & Website", tool: "WordPress" },
    ],
    activity: [
      { title: "Viewed your integrations page 6 times", ago: "4h ago", timestamp: "Jul 25, 2026 · 14:02" },
      { title: "Compared your product with ClickUp 3 times", ago: "3d ago", timestamp: "Jul 22, 2026 · 11:26" },
      { title: "Viewed the Industrial IoT category page 4 times", ago: "1w ago", timestamp: "Jul 18, 2026 · 09:14" },
    ],
    verifiedContacts: [
      { name: "Marcus Johnson", jobTitle: "Director of Operations", avatar: avatarFigma, locked: true },
      { name: "Ingrid Solberg", jobTitle: "Head of Plant Systems", avatar: avatarSophia, locked: true },
    ],
    recommendedContacts: [
      { name: "Peter Nowak", jobTitle: "Automation Engineering Lead", avatar: avatarJaydon, locked: true },
      { name: "Rosa Delgado", jobTitle: "Procurement Director", avatar: avatarChloe, locked: true },
    ],
  },

  "Clearview Analytics": {
    techStack: [
      { category: "Cloud Infrastructure", tool: "AWS" },
      { category: "Project Management", tool: "Linear" },
      { category: "Productivity", tool: "Google Workspace" },
    ],
    activity: [
      { title: "Viewed your API documentation 8 times", ago: "1h ago", timestamp: "Aug 03, 2026 · 16:55" },
      { title: "Viewed your pricing page 5 times", ago: "1d ago", timestamp: "Aug 02, 2026 · 10:09" },
      { title: "Compared your product with Asana 2 times", ago: "4d ago", timestamp: "Jul 30, 2026 · 13:47" },
      { title: "Viewed the Data & AI category page 3 times", ago: "1w ago", timestamp: "Jul 27, 2026 · 08:52" },
    ],
    verifiedContacts: [
      { name: "Elena Kovacs", jobTitle: "Chief Data Officer", avatar: avatarFigma, locked: true },
      { name: "Samuel Iwu", jobTitle: "Head of Data Platform", avatar: avatarKadin, locked: true },
    ],
    recommendedContacts: [
      { name: "Clara Bertrand", jobTitle: "Analytics Engineering Lead", avatar: avatarAmelia, locked: true },
      { name: "Viktor Alm", jobTitle: "Director of Machine Learning", avatar: avatarDaniel, locked: true },
    ],
  },

  "Summit Energy Corp": {
    techStack: [
      { category: "CRM & Marketing", tool: "Salesforce" },
      { category: "Cloud Infrastructure", tool: "AWS" },
      { category: "Collaboration", tool: "Microsoft Teams" },
    ],
    activity: [
      { title: "Viewed your product profile 4 times", ago: "6h ago", timestamp: "Jul 22, 2026 · 12:35" },
      { title: "Viewed your reference page 2 times", ago: "3d ago", timestamp: "Jul 19, 2026 · 15:18" },
      { title: "Viewed the Clean Energy category page 1 time", ago: "1w ago", timestamp: "Jul 15, 2026 · 09:40" },
    ],
    verifiedContacts: [
      { name: "David Park", jobTitle: "VP of Business Dev", avatar: avatarFigma, locked: true },
      { name: "Aisha Rahman", jobTitle: "Head of Grid Operations", avatar: avatarNadia, locked: true },
    ],
    recommendedContacts: [
      { name: "Callum Frost", jobTitle: "Director of Asset Management", avatar: avatarJames, locked: true },
      { name: "Bianca Ferreira", jobTitle: "Procurement Lead", avatar: avatarChloe, locked: true },
    ],
  },

  "Bridgeport Consulting": {
    techStack: [
      { category: "Productivity", tool: "Google Workspace" },
      { category: "Collaboration", tool: "Microsoft Teams" },
      { category: "CMS & Website", tool: "WordPress" },
    ],
    activity: [
      { title: "Viewed your reviews page 3 times", ago: "2h ago", timestamp: "Aug 05, 2026 · 14:48" },
      { title: "Viewed your product profile 2 times", ago: "2d ago", timestamp: "Aug 03, 2026 · 11:12" },
      { title: "Viewed a article page 4 times", ago: "6d ago", timestamp: "Jul 30, 2026 · 16:05" },
    ],
    verifiedContacts: [
      { name: "Amara Okafor", jobTitle: "Senior Partner", avatar: avatarFigma, locked: true },
      { name: "Douglas Hearne", jobTitle: "Practice Director, Technology", avatar: avatarJaylon, locked: true },
    ],
    recommendedContacts: [
      { name: "Freya Lindholm", jobTitle: "Head of Client Operations", avatar: avatarRachel, locked: true },
      { name: "Emeka Nwosu", jobTitle: "Engagement Manager", avatar: avatarJaydon, locked: true },
    ],
  },

  "Hyperion Aerospace": {
    techStack: [
      { category: "Cloud Infrastructure", tool: "AWS" },
      { category: "Project Management", tool: "Linear" },
      { category: "Collaboration", tool: "Microsoft Teams" },
    ],
    activity: [
      { title: "Viewed your security overview 3 times", ago: "7h ago", timestamp: "Jul 19, 2026 · 11:29" },
      { title: "Viewed the Defense & Aerospace category page 2 times", ago: "4d ago", timestamp: "Jul 15, 2026 · 14:53" },
      { title: "Viewed your product profile 1 time", ago: "1w ago", timestamp: "Jul 12, 2026 · 10:21" },
    ],
    verifiedContacts: [
      { name: "Robert Fischer", jobTitle: "Program Director", avatar: avatarFigma, locked: true },
      { name: "Helena Vogt", jobTitle: "Head of Systems Integration", avatar: avatarSophia, locked: true },
    ],
    recommendedContacts: [
      { name: "Arjun Malhotra", jobTitle: "Director of Avionics Software", avatar: avatarKadin, locked: true },
      { name: "Sofia Ferrante", jobTitle: "Supply Chain Manager", avatar: avatarAmelia, locked: true },
    ],
  },

  "Solaris Biotech": {
    techStack: [
      { category: "Cloud Infrastructure", tool: "AWS" },
      { category: "Productivity", tool: "Google Workspace" },
      { category: "Project Management", tool: "Linear" },
    ],
    activity: [
      { title: "Viewed your compliance page 5 times", ago: "3h ago", timestamp: "Aug 07, 2026 · 13:37" },
      { title: "Viewed your pricing page 2 times", ago: "2d ago", timestamp: "Aug 05, 2026 · 09:56" },
      { title: "Viewed the Life Sciences category page 3 times", ago: "5d ago", timestamp: "Aug 02, 2026 · 15:24" },
    ],
    verifiedContacts: [
      { name: "Hannah Reeves", jobTitle: "VP of R&D", avatar: avatarFigma, locked: true },
      { name: "Tomas Ekwueme", jobTitle: "Head of Laboratory Informatics", avatar: avatarDaniel, locked: true },
    ],
    recommendedContacts: [
      { name: "Noor Haddad", jobTitle: "Director of Clinical Data", avatar: avatarChloe, locked: true },
      { name: "Gustav Lindqvist", jobTitle: "IT Compliance Manager", avatar: avatarCaleb, locked: true },
    ],
  },

  "Onyx Cybersecurity": {
    techStack: [
      { category: "Cloud Infrastructure", tool: "AWS" },
      { category: "Project Management", tool: "Linear" },
      { category: "Collaboration", tool: "Microsoft Teams" },
    ],
    activity: [
      { title: "Viewed your security overview 7 times", ago: "4h ago", timestamp: "Jul 31, 2026 · 15:02" },
      { title: "Compared your product with ClickUp 2 times", ago: "3d ago", timestamp: "Jul 28, 2026 · 10:38" },
      { title: "Viewed your integrations page 3 times", ago: "1w ago", timestamp: "Jul 24, 2026 · 12:15" },
    ],
    verifiedContacts: [
      { name: "Dana Whitlock", jobTitle: "Director of Security Operations", avatar: avatarNadia, locked: true },
    ],
    recommendedContacts: [
      { name: "Leo Tanaka", jobTitle: "Head of Sales Engineering", avatar: avatarFigma, locked: true },
      { name: "Miriam Kaur", jobTitle: "Principal Security Architect", avatar: avatarRachel, locked: true },
    ],
  },
};

const EMPTY: CompanyDetails = {
  techStack: [],
  activity: [],
  verifiedContacts: [],
  recommendedContacts: [],
};

/**
 * Every contact, holding both channels.
 *
 * The records were authored one channel at a time — a verified contact with a
 * direct line, a recommended one with an address — and the modal now lists
 * both for everybody. Whatever a record does not state is completed from that
 * person's name and their employer's own domain, so the two always belong to
 * the same person and no entry has to be edited by hand.
 */
function completeContacts(entries: ContactEntry[], company: string): ContactEntry[] {
  const domain = getCompanyProfile(company)?.website ?? "";
  return entries.map(entry => ({
    ...entry,
    phone: entry.phone || derivePhone(`${company}:${entry.name}`),
    email: entry.email || deriveEmail(entry.name, domain),
  }));
}

/* Completed once at module load rather than on every read, so the same
   contact is never handed back with two different generated values. */
const COMPLETED: Record<string, CompanyDetails> = Object.fromEntries(
  Object.entries(DETAILS).map(([company, details]) => [
    company,
    {
      ...details,
      verifiedContacts: completeContacts(details.verifiedContacts, company),
      recommendedContacts: completeContacts(details.recommendedContacts, company),
    },
  ]),
);

export function getCompanyDetails(name: string): CompanyDetails {
  return COMPLETED[name] ?? EMPTY;
}

/**
 * What a prospect's Notes tab says about them.
 *
 * The note is composed from the prospect's own stack rather than stored as
 * prose: the tool it names is the one they run for project management, or the
 * first tool they run if they have none, and the category is that entry's own.
 * A prospect we hold no stack for has no note to show.
 */
export function getCompanyNote(name: string): { tool: string; category: string } | null {
  const { techStack } = getCompanyDetails(name);
  if (!techStack.length) return null;
  const entry = techStack.find(t => t.category === "Project Management") ?? techStack[0];
  return { tool: entry.tool, category: entry.category };
}
