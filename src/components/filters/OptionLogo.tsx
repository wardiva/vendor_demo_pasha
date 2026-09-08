import type { ComponentType } from "react";
import { TECH_MARKS } from "@/imports/BuyerActivityBuyerIntentStarter/index";
import { PROSPECT_COMPANIES } from "@/data/prospects";

/**
 * The marks a filter option can carry — Figma 165:5377, which puts a 20px
 * logo on a 6px radius between the checkbox and the label.
 *
 * Both come from data the pages already render: the tech marks are the very
 * components the Signals page's Buyers Tech Stack card draws, and the company
 * logos are the Prospects cards' own. Nothing here is a new asset.
 */
const BOX = "relative rounded-[6px] shrink-0 size-[20px]";

/** The brand marks are drawn at 24px; this seats one in the design's 20px box. */
const SCALE = 20 / 24;

export function TechStackLogo({ tool }: { tool: string }) {
  const Mark = (TECH_MARKS as Record<string, ComponentType | undefined>)[tool];
  if (!Mark) return null;
  return (
    <span className={`${BOX} overflow-clip`} data-name="tech-logo">
      <span
        className="absolute left-1/2 top-1/2"
        style={{ transform: `translate(-50%, -50%) scale(${SCALE})` }}
      >
        <Mark />
      </span>
    </span>
  );
}

const COMPANY_LOGOS: Record<string, string> = Object.fromEntries(
  PROSPECT_COMPANIES.map(c => [c.name, c.logo]),
);

export function CompanyLogo({ company }: { company: string }) {
  const src = COMPANY_LOGOS[company];
  if (!src) return null;
  return (
    <span className={BOX} data-name="company-logo">
      <img
        alt=""
        className="absolute inset-0 max-w-none object-contain pointer-events-none rounded-[6px] size-full"
        src={src}
      />
    </span>
  );
}
