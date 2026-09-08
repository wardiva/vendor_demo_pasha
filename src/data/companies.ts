/**
 * Company profiles shown in the Company Info modal (Figma node 23:1455).
 *
 * Keyed by the company name as it appears in the Signals table and the Leads
 * cards, so clicking either surface resolves to the same record.
 */

import logoJunction from "@/imports/BuyerActivityLeads/427aaa8b0db90cd6684da21101da5b5555816989.png";
import logoAlderwood from "@/imports/BuyerActivityLeads/8ac012c74f3a29c3e97514d02615275c87dc7516.png";
import logoBeacon from "@/imports/BuyerActivityLeads/7a2e22d285e7673f4b5c5b7a6fa882c0ea285a08.png";
import logoMeridian from "@/data/assets/logo-meridian.png";
import logoNorthvane from "@/data/assets/logo-northvane.png";
import logoBowline from "@/data/assets/logo-bowline.png";
import logoCanopy from "@/data/assets/logo-canopy.png";
import logoStratos from "@/data/assets/logo-stratos.png";
import logoIronclad from "@/data/assets/logo-ironclad.png";
import logoSummitRidge from "@/data/assets/logo-summitridge.png";
import logoPinehurst from "@/data/assets/logo-pinehurst.png";
/* The eleven companies added from Figma 221:2126 — their marks as the node
   exports them, downloaded rather than linked, since the export URLs expire. */
import logoApex from "@/data/assets/logo-apex.png";
import logoMeridianHealth from "@/data/assets/logo-meridianhealth.png";
import logoNovatech from "@/data/assets/logo-novatech.png";
import logoPinnacle from "@/data/assets/logo-pinnacle.png";
import logoVanguard from "@/data/assets/logo-vanguard.png";
import logoClearview from "@/data/assets/logo-clearview.png";
import logoSummitEnergy from "@/data/assets/logo-summitenergy.png";
import logoBridgeport from "@/data/assets/logo-bridgeport.png";
import logoHyperion from "@/data/assets/logo-hyperion.png";
import logoSolaris from "@/data/assets/logo-solaris.png";
import logoOnyx from "@/data/assets/logo-onyx.png";

export type CompanyProfile = {
  name: string;
  /** Same logo asset the Leads cards use, so both surfaces stay consistent. */
  logo: string;
  website: string;
  industry: string;
  headquarters: string;
  employeeCount: string;
  revenue: string;
  linkedin: string;
  facebook: string;
  x: string;
  instagram: string;
  /** Intent score, rendered by the shared IntentBar in the modal header. */
  intentPct: number;
};

/** Row order matches the modal's Company Information table. */
/**
 * The Company Information rows, in the order and under the names Figma
 * 250:1965 gives them: Location rather than Headquarters, Employees rather
 * than Employee Count, and the four social rows as LinkedIn, X, Instagram,
 * Facebook. The keys are the record own, so only what the row is called and
 * where it sits has changed - no company data moves.
 */
export const COMPANY_FIELDS: Array<{ label: string; key: keyof CompanyProfile }> = [
  { label: "Company Name", key: "name" },
  { label: "Website", key: "website" },
  { label: "Industry", key: "industry" },
  { label: "Location", key: "headquarters" },
  { label: "Employees", key: "employeeCount" },
  { label: "Revenue", key: "revenue" },
  { label: "LinkedIn", key: "linkedin" },
  { label: "X", key: "x" },
  { label: "Instagram", key: "instagram" },
  { label: "Facebook", key: "facebook" },
];

/**
 * A field the source has no value for.
 *
 * The Company Information table renders every row it is given, so a company we
 * hold no headquarters or revenue for says so rather than leaving the row
 * blank, which reads as a rendering fault instead of missing data.
 */
const UNKNOWN = "—";

const PROFILES: CompanyProfile[] = [
  {
    /* Values taken verbatim from the Figma design. */
    name: "Alderwood Logistics",
    logo: logoAlderwood,
    website: "alderwood.ca",
    industry: "Information Technology",
    headquarters: "Calgary, Canada",
    employeeCount: "201-1K",
    revenue: "$50M-$250M",
    linkedin: "linkedin.com/alderwood-logistics",
    facebook: "facebook.com/alderlogistics",
    x: "@alderwoodlogi",
    instagram: "@alderwoodlogistics",
    intentPct: 65,
  },
  {
    /* Location and size follow this company's record in the Signals dataset. */
    name: "Junction Freight Co",
    logo: logoJunction,
    website: "junctionfreight.com",
    industry: "Information Technology",
    headquarters: "London, United Kingdom",
    employeeCount: "1K-5K",
    revenue: "$250M-$500M",
    linkedin: "linkedin.com/junction-freight",
    facebook: "facebook.com/junctionfreight",
    x: "@junctionfreight",
    instagram: "@junctionfreightco",
    intentPct: 62,
  },
  {
    /* Employer of the contact-level leads; reached through the Contact Info
       modal rather than a company row, so it has no company card of its own. */
    name: "Brown and Caldwell",
    logo: logoAlderwood,
    website: "brownandcaldwell.com",
    industry: "Information Technology",
    headquarters: "Walnut Creek, United States",
    employeeCount: "201-1K",
    revenue: "$50M-$250M",
    linkedin: "linkedin.com/brown-and-caldwell",
    facebook: "facebook.com/brownandcaldwell",
    x: "@browncaldwell",
    instagram: "@brownandcaldwell",
    intentPct: 68,
  },
  {
    name: "Beacon Learning",
    logo: logoBeacon,
    website: "beaconlearn.ca",
    industry: "Information Technology",
    headquarters: "Austin, United States",
    employeeCount: "1-50",
    revenue: "$10M-$50M",
    linkedin: "linkedin.com/beacon-learning",
    facebook: "facebook.com/beaconlearn",
    x: "@beaconlearn",
    instagram: "@beaconlearning",
    intentPct: 32,
  },

  /* ── Prospects page cards (Figma 60:352) ──
     Name, website, industry and intent score are the design's. Headquarters
     follows each contact's area code; employee count and revenue use the bands
     the rest of the app displays, and the social handles follow the domain. */
  {
    name: "Meridian Supply Co.",
    logo: logoMeridian,
    website: "meridiansupply.com",
    industry: "Manufacturing",
    headquarters: "Chicago, United States",
    employeeCount: "201-1K",
    revenue: "$50M-$250M",
    linkedin: "linkedin.com/meridian-supply",
    facebook: "facebook.com/meridiansupply",
    x: "@meridiansupply",
    instagram: "@meridiansupplyco",
    intentPct: 80,
  },
  {
    name: "Northvane Technologies",
    logo: logoNorthvane,
    website: "northvane.io",
    industry: "Cloud Infrastructure",
    headquarters: "San Francisco, United States",
    employeeCount: "201-1K",
    revenue: "$50M-$250M",
    linkedin: "linkedin.com/northvane",
    facebook: "facebook.com/northvane",
    x: "@northvane",
    instagram: "@northvanetech",
    intentPct: 75,
  },
  {
    name: "Bowline Freight",
    logo: logoBowline,
    website: "bowlinefreight.com",
    industry: "Logistics & Shipping",
    headquarters: "Atlanta, United States",
    employeeCount: "201-1K",
    revenue: "$50M-$250M",
    linkedin: "linkedin.com/bowline-freight",
    facebook: "facebook.com/bowlinefreight",
    x: "@bowlinefreight",
    instagram: "@bowlinefreight",
    intentPct: 65,
  },
  {
    name: "Canopy Health Group",
    logo: logoCanopy,
    website: "canopyhealth.org",
    industry: "Healthcare Services",
    headquarters: "Seattle, United States",
    employeeCount: "201-1K",
    revenue: "$50M-$250M",
    linkedin: "linkedin.com/canopy-health",
    facebook: "facebook.com/canopyhealth",
    x: "@canopyhealth",
    instagram: "@canopyhealthgroup",
    intentPct: 62,
  },
  {
    name: "Stratos Analytics",
    logo: logoStratos,
    website: "stratosanalytics.com",
    industry: "Data & Analytics",
    headquarters: "New York, United States",
    employeeCount: "201-1K",
    revenue: "$50M-$250M",
    linkedin: "linkedin.com/stratos-analytics",
    facebook: "facebook.com/stratosanalytics",
    x: "@stratosdata",
    instagram: "@stratosanalytics",
    intentPct: 52,
  },
  {
    name: "Ironclad Construction",
    logo: logoIronclad,
    website: "ironcladbuilt.com",
    industry: "Construction",
    headquarters: "Portland, United States",
    employeeCount: "201-1K",
    revenue: "$50M-$250M",
    linkedin: "linkedin.com/ironclad-construction",
    facebook: "facebook.com/ironcladbuilt",
    x: "@ironcladbuilt",
    instagram: "@ironcladbuilt",
    intentPct: 50,
  },
  {
    name: "Summit Ridge Energy",
    logo: logoSummitRidge,
    website: "summitridgeenergy.com",
    industry: "Renewable Energy",
    headquarters: "San Diego, United States",
    employeeCount: "201-1K",
    revenue: "$50M-$250M",
    linkedin: "linkedin.com/summit-ridge-energy",
    facebook: "facebook.com/summitridgeenergy",
    x: "@summitridgenrg",
    instagram: "@summitridgeenergy",
    intentPct: 40,
  },
  {
    name: "Pinehurst Media",
    logo: logoPinehurst,
    website: "pinehurstmedia.com",
    industry: "Digital Advertising",
    headquarters: "New York, United States",
    employeeCount: "201-1K",
    revenue: "$50M-$250M",
    linkedin: "linkedin.com/pinehurst-media",
    facebook: "facebook.com/pinehurstmedia",
    x: "@pinehurstmedia",
    instagram: "@pinehurstmedia",
    intentPct: 32,
  },
  /* ─────────────── Added from Figma 221:2126 ───────────────
     Name, logo, industry and intent score are the node's. The node carries no
     headquarters, size, revenue or social handles for these companies, and
     none are invented here: those rows read as unknown until real values
     exist. The website is the one derived field — the company's own name,
     lowercased with its corporate suffix dropped — so the Prospects table and
     the modal have a domain to show rather than a blank. */
  {
    name: "Apex Logistics Group",
    logo: logoApex,
    website: "apexlogistics.com",
    industry: "Supply Chain",
    headquarters: UNKNOWN,
    employeeCount: UNKNOWN,
    revenue: UNKNOWN,
    linkedin: UNKNOWN,
    facebook: UNKNOWN,
    x: UNKNOWN,
    instagram: UNKNOWN,
    intentPct: 85,
  },
  {
    name: "Meridian Health Systems",
    logo: logoMeridianHealth,
    website: "meridianhealth.com",
    industry: "Healthcare IT",
    headquarters: UNKNOWN,
    employeeCount: UNKNOWN,
    revenue: UNKNOWN,
    linkedin: UNKNOWN,
    facebook: UNKNOWN,
    x: UNKNOWN,
    instagram: UNKNOWN,
    intentPct: 70,
  },
  {
    name: "NovaTech Solutions",
    logo: logoNovatech,
    website: "novatech.com",
    industry: "Cloud Infrastructure",
    headquarters: UNKNOWN,
    employeeCount: UNKNOWN,
    revenue: UNKNOWN,
    linkedin: UNKNOWN,
    facebook: UNKNOWN,
    x: UNKNOWN,
    instagram: UNKNOWN,
    intentPct: 91,
  },
  {
    name: "Pinnacle Financial Group",
    logo: logoPinnacle,
    website: "pinnaclefinancial.com",
    industry: "Financial Services",
    headquarters: UNKNOWN,
    employeeCount: UNKNOWN,
    revenue: UNKNOWN,
    linkedin: UNKNOWN,
    facebook: UNKNOWN,
    x: UNKNOWN,
    instagram: UNKNOWN,
    intentPct: 68,
  },
  {
    name: "Vanguard Manufacturing",
    logo: logoVanguard,
    website: "vanguardmanufacturing.com",
    industry: "Industrial IoT",
    headquarters: UNKNOWN,
    employeeCount: UNKNOWN,
    revenue: UNKNOWN,
    linkedin: UNKNOWN,
    facebook: UNKNOWN,
    x: UNKNOWN,
    instagram: UNKNOWN,
    intentPct: 79,
  },
  {
    name: "Clearview Analytics",
    logo: logoClearview,
    website: "clearviewanalytics.com",
    industry: "Data & AI",
    headquarters: UNKNOWN,
    employeeCount: UNKNOWN,
    revenue: UNKNOWN,
    linkedin: UNKNOWN,
    facebook: UNKNOWN,
    x: UNKNOWN,
    instagram: UNKNOWN,
    intentPct: 88,
  },
  {
    name: "Summit Energy Corp",
    logo: logoSummitEnergy,
    website: "summitenergy.com",
    industry: "Clean Energy",
    headquarters: UNKNOWN,
    employeeCount: UNKNOWN,
    revenue: UNKNOWN,
    linkedin: UNKNOWN,
    facebook: UNKNOWN,
    x: UNKNOWN,
    instagram: UNKNOWN,
    intentPct: 64,
  },
  {
    name: "Bridgeport Consulting",
    logo: logoBridgeport,
    website: "bridgeportconsulting.com",
    industry: "Management Consulting",
    headquarters: UNKNOWN,
    employeeCount: UNKNOWN,
    revenue: UNKNOWN,
    linkedin: UNKNOWN,
    facebook: UNKNOWN,
    x: UNKNOWN,
    instagram: UNKNOWN,
    intentPct: 50,
  },
  {
    name: "Hyperion Aerospace",
    logo: logoHyperion,
    website: "hyperionaerospace.com",
    industry: "Defense & Aerospace",
    headquarters: UNKNOWN,
    employeeCount: UNKNOWN,
    revenue: UNKNOWN,
    linkedin: UNKNOWN,
    facebook: UNKNOWN,
    x: UNKNOWN,
    instagram: UNKNOWN,
    intentPct: 44,
  },
  {
    name: "Solaris Biotech",
    logo: logoSolaris,
    website: "solarisbiotech.com",
    industry: "Life Sciences",
    headquarters: UNKNOWN,
    employeeCount: UNKNOWN,
    revenue: UNKNOWN,
    linkedin: UNKNOWN,
    facebook: UNKNOWN,
    x: UNKNOWN,
    instagram: UNKNOWN,
    intentPct: 56,
  },
  {
    /* The node repeats the company name in this card's industry slot, which
       reads as a copy-paste slip rather than a value; the category the name
       states is used instead. */
    name: "Onyx Cybersecurity",
    logo: logoOnyx,
    website: "onyxcybersecurity.com",
    industry: "Cybersecurity",
    headquarters: UNKNOWN,
    employeeCount: UNKNOWN,
    revenue: UNKNOWN,
    linkedin: UNKNOWN,
    facebook: UNKNOWN,
    x: UNKNOWN,
    instagram: UNKNOWN,
    intentPct: 61,
  },
];


const BY_NAME = new Map(PROFILES.map(p => [p.name, p]));

/** Returns the profile for a company name, or null for contact-level leads. */
export function getCompanyProfile(name: string | null | undefined): CompanyProfile | null {
  if (!name) return null;
  return BY_NAME.get(name.trim()) ?? null;
}

export function isCompanyName(name: string | null | undefined): boolean {
  return getCompanyProfile(name) !== null;
}
