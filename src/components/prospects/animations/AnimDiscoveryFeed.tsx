import {
  AnonTile,
  EASE_OUT,
  FAINT,
  FONT,
  INK,
  IntentChip,
  LIME,
  LIVE,
  LiveDot,
  Logo,
  MUTED,
  SIGNAL,
  tr,
  useBeats,
  useCompanies,
  type Company,
} from "./shared";
import { intentTagColor } from "@/components/IntentTag";

/**
 * Animation Variation 2 — Prospect discovery.
 *
 * The raw material first: a live feed of visits to your profile, every one
 * of them anonymous. "Unknown company · Viewed Category Page." "Unknown
 * company · Viewed Reviews." That is what a vendor sees without Buyer
 * Intelligence — traffic, not buyers.
 *
 * Then the product does its work in the open. Three of the visits, scattered
 * down the feed among the noise, are recognised as the same visitor: a rail
 * joins them and they are tagged "Same visitor". They fold into one another —
 * three rows of noise becoming one row of meaning — and that row resolves into
 * a named company with an intent score and a Prospect tag. The visits nobody
 * could tie to anything stay grey. The feed keeps flowing, the prospect is
 * carried down it, and the next one starts to form at the top.
 *
 * Discovery is shown as a separation of signal from noise, which is what the
 * product actually does, rather than as a spotlight or a reveal.
 */

/* 0 first visit · 1 an unrelated visit · 2 second visit · 3 third visit ·
   4 the three are linked · 5 they fold into one · 6 identified. */
const BEATS = [0, 1100, 2200, 3300, 4200, 5000, 5600] as const;
const LOOP = 8000;
const REST = 6;

const ANON_H = 56;
const PROSPECT_H = 84;
const GAP = 8;

type Row =
  | { key: string; kind: "anon"; signal: { label: string; range: string; min: number }; linked: boolean; collapsed: boolean; fresh: boolean }
  | { key: string; kind: "prospect"; company: Company; latest: boolean };

const pick = <T,>(list: T[], i: number) => list[((i % list.length) + list.length) % list.length];

const NOISE = [
  { ...SIGNAL.reviews, min: 51 },
  { ...SIGNAL.alternatives, min: 51 },
  { ...SIGNAL.category, min: 30 },
];

function BandChip({ range, min }: { range: string; min: number }) {
  return (
    <span
      className={`${FONT} inline-flex h-[20px] shrink-0 items-center rounded-[6px] px-[7px] font-medium leading-[14px] text-[10.5px] tabular-nums`}
      style={{ background: intentTagColor(min), color: INK }}
    >
      {range}
    </span>
  );
}

function AnonRow({ row }: { row: Extract<Row, { kind: "anon" }> }) {
  return (
    <div
      className={`flex h-full items-center gap-[10px] overflow-hidden rounded-[12px] bg-white px-[12px] ${row.fresh ? "bi-feed-in" : ""}`}
      style={{
        boxShadow: row.linked ? `0 0 0 1.5px ${LIVE}` : "0 0 0 1px rgba(47,43,61,0.06)",
        transition: tr(["box-shadow"], 300),
      }}
    >
      <span
        className="block shrink-0 rounded-[9px]"
        style={{ boxShadow: row.linked ? `0 0 0 2px ${LIME}` : "none", transition: tr(["box-shadow"], 300) }}
      >
        <AnonTile size={32} radius={8} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={`${FONT} font-medium leading-[18px] text-[13px]`} style={{ color: "rgba(47,43,61,0.6)" }}>
          Unknown company
        </span>
        <span className={`${FONT} truncate leading-[16px] text-[11.5px]`} style={{ color: MUTED }}>
          {row.signal.label}
        </span>
      </span>
      <span className="relative flex h-[20px] items-center justify-end">
        <span style={{ opacity: row.linked ? 0 : 1, transition: tr(["opacity"], 240) }}>
          <BandChip range={row.signal.range} min={row.signal.min} />
        </span>
        <span
          className={`${FONT} absolute right-0 flex h-[20px] items-center whitespace-nowrap rounded-[6px] px-[7px] font-medium leading-[14px] text-[10.5px]`}
          style={{
            background: LIVE,
            color: LIME,
            opacity: row.linked ? 1 : 0,
            transform: row.linked ? "none" : "translateX(4px)",
            transition: tr(["opacity", "transform"], 300),
          }}
        >
          Same visitor
        </span>
      </span>
    </div>
  );
}

function ProspectRow({ company, latest }: { company: Company; latest: boolean }) {
  /* Only the prospect just found carries the ink outline; the ones the feed
     has already carried down settle to the same hairline as everything else. */
  return (
    <div
      className="bi-resolve flex h-full flex-col justify-center gap-[10px] overflow-hidden rounded-[12px] bg-white px-[12px]"
      style={{
        boxShadow: latest ? `0 0 0 1.5px ${LIVE}, 0px 8px 20px 0px rgba(7,41,41,0.12)` : "0 0 0 1px rgba(47,43,61,0.08)",
        transition: tr(["box-shadow"], 500),
      }}
    >
      <span className="flex items-center gap-[10px]">
        <Logo src={company.logo} size={32} radius={8} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className={`${FONT} truncate font-medium leading-[18px] text-[13px]`} style={{ color: INK }}>
            {company.name}
          </span>
          <span className={`${FONT} truncate leading-[16px] text-[11.5px]`} style={{ color: MUTED }}>
            {company.industry}
          </span>
        </span>
        <IntentChip score={company.score} />
      </span>
      <span className="flex items-center gap-[5px]">
        {[SIGNAL.category, SIGNAL.profile, SIGNAL.pricing].map(s => (
          <span
            key={s.short}
            className={`${FONT} flex h-[20px] items-center gap-[4px] rounded-[6px] px-[6px] leading-[14px] text-[10.5px]`}
            style={{ background: "rgba(7,41,41,0.06)", color: INK }}
          >
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M2 5.2L4.1 7.2L8 3.2" stroke={LIVE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {s.short}
          </span>
        ))}
        <span
          className={`${FONT} ml-auto flex h-[20px] items-center rounded-[6px] px-[7px] font-medium leading-[14px] text-[10.5px]`}
          style={{ background: LIME, color: LIVE }}
        >
          Prospect
        </span>
      </span>
    </div>
  );
}

export default function AnimDiscoveryFeed() {
  const prospects = useCompanies(85);
  const { beat, cycle } = useBeats(BEATS, LOOP, REST);
  if (!prospects.length) return null;

  /* This loop's visitor, and the rows the feed is holding, newest first. */
  const at = (k: number) => pick(prospects, k);
  const rows: Row[] = [];
  const cur = cycle;
  const linked = beat === 4;
  const merged = beat >= 5;
  if (beat >= 3) {
    rows.push(
      beat >= 6
        ? { key: `${cur}-e4`, kind: "prospect", company: at(cur), latest: true }
        : { key: `${cur}-e4`, kind: "anon", signal: { ...SIGNAL.pricing, min: 71 }, linked: linked || merged, collapsed: false, fresh: beat === 3 },
    );
  }
  if (beat >= 2) {
    rows.push({ key: `${cur}-e3`, kind: "anon", signal: { ...SIGNAL.profile, min: 51 }, linked: linked || merged, collapsed: merged, fresh: beat === 2 });
  }
  if (beat >= 1) {
    rows.push({ key: `${cur}-e2`, kind: "anon", signal: pick(NOISE, cur), linked: false, collapsed: false, fresh: beat === 1 });
  }
  rows.push({ key: `${cur}-e1`, kind: "anon", signal: { ...SIGNAL.category, min: 30 }, linked: linked || merged, collapsed: merged, fresh: beat === 0 });
  /* What the earlier loops left behind: their prospect and their stray visit. */
  for (let k = 1; k <= 3; k++) {
    rows.push({ key: `${cur - k}-e4`, kind: "prospect", company: at(cur - k), latest: false });
    rows.push({ key: `${cur - k}-e2`, kind: "anon", signal: pick(NOISE, cur - k), linked: false, collapsed: false, fresh: false });
  }

  /* Lay the rows out; collapsed rows take no room and fold into the row above them. */
  let y = 0;
  const placed = rows.map(r => {
    const collapsed = r.kind === "anon" && r.collapsed;
    const h = collapsed ? 0 : r.kind === "prospect" ? PROSPECT_H : ANON_H;
    const top = y;
    y += h + (collapsed ? 0 : GAP);
    return { r, top, h, collapsed };
  });

  /* Where the folded visits go: into the visit that completed the picture. */
  const anchorTop = placed.find(p => p.r.key === `${cur}-e4`)?.top ?? 0;

  /* The rail joining the linked visits, from the first to the last of them. */
  const links = placed.filter(p => p.r.kind === "anon" && p.r.linked && p.r.key.startsWith(`${cur}-`));
  const railTop = links.length ? links[0].top + ANON_H / 2 : 0;
  const railBottom = links.length ? links[links.length - 1].top + (links[links.length - 1].collapsed ? 0 : ANON_H / 2) : 0;
  const railOn = links.length > 1 && beat === 4;

  return (
    <div className="relative size-full overflow-hidden" aria-hidden data-name="Animation / Discovery feed">
      <div className="absolute left-[28px] right-[28px] top-[28px] flex h-[24px] items-center gap-[8px]">
        <LiveDot />
        <span className={`${FONT} flex-1 font-medium leading-[18px] text-[13px]`} style={{ color: INK }}>
          Live activity on your profile
        </span>
        <span className={`${FONT} leading-[14px] text-[11px]`} style={{ color: FAINT }}>
          Today
        </span>
      </div>

      <div
        className="absolute bottom-0 left-[10px] right-[10px] top-[66px]"
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, #000 78%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, #000 78%, transparent 100%)",
        }}
      >
        {placed.map(({ r, top, h, collapsed }) => (
          <div
            key={r.key}
            className="absolute left-[18px] right-[18px]"
            style={{
              top: (collapsed ? anchorTop : top) + 2,
              height: collapsed ? ANON_H : h,
              opacity: collapsed ? 0 : 1,
              transform: collapsed ? "scale(0.96)" : "none",
              transition:
                tr(["top", "height"], 560, 0, EASE_OUT) + ", " + tr(["opacity", "transform"], 380),
              zIndex: collapsed ? 0 : 1,
            }}
          >
            {r.kind === "anon" ? <AnonRow row={r} /> : <ProspectRow company={r.company} latest={r.latest} />}
          </div>
        ))}

        <span
          className="absolute left-[4px] w-[2px] rounded-[2px]"
          style={{
            top: railTop + 2,
            height: Math.max(railBottom - railTop, 0),
            background: LIVE,
            opacity: railOn ? 1 : 0,
            transformOrigin: "top",
            transform: railOn ? "scaleY(1)" : "scaleY(0)",
            transition: tr(["transform"], 480, 0, EASE_OUT) + ", " + tr(["opacity"], 300),
          }}
        />
        {links.map(l => (
          <span
            key={`dot-${l.r.key}`}
            className="absolute left-[1px] size-[8px] rounded-[100px]"
            style={{
              top: l.top + ANON_H / 2 - 2,
              background: LIME,
              boxShadow: `0 0 0 2px ${LIVE}`,
              opacity: railOn ? 1 : 0,
              transition: tr(["opacity"], 300),
            }}
          />
        ))}
      </div>
    </div>
  );
}
