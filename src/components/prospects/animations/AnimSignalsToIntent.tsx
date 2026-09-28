import { intentTagColor } from "@/components/IntentTag";
import {
  AnonTile,
  CARD_SHADOW,
  EASE_OUT,
  FAINT,
  FONT,
  HAIR,
  INK,
  LIME,
  LIVE,
  Logo,
  MUTED,
  SIGNAL,
  SKELETON,
  Tick,
  tr,
  useBeats,
  useCompanies,
} from "./shared";

/**
 * Animation Variation 3 — Buyer signals → Intent.
 *
 * The relationship between what a buyer does and how ready they are, drawn
 * as a climb. The panel is the product's own intent scale laid on its side —
 * the three bands, 30–50%, 51–70% and 71%+, stacked bottom to top — with a
 * gauge running up its left edge.
 *
 * Each signal lands at the height it is worth: Viewed Category Page low in
 * the first band, Viewed Product Profile in the second, Viewed Pricing high
 * in the third. The gauge rises to meet each one, so the activity reads as a
 * staircase and the reader can see that it is the pricing visit, not the
 * category browse, that makes a buyer. The account at the top keeps score as
 * it happens, and when the gauge crosses into 71%+ it stops being "Unknown
 * company" and becomes a named account, in market.
 */

/* 0 reset · 1 gauge rises to the first signal · 2 it lands · 3 rises ·
   4 lands · 5 rises · 6 lands · 7 identified · 8 fading. */
const BEATS = [0, 600, 1150, 2000, 2550, 3400, 3950, 4700, 7600] as const;
const LOOP = 8200;
const REST = 7;

const ZONE = 116;
const PLOT = ZONE * 3;
const CARD_H = 40;

const ZONES = [
  { range: "71%+", min: 71, max: 100 },
  { range: "51–70%", min: 51, max: 70 },
  { range: "30–50%", min: 30, max: 50 },
];

/** Height from the foot of the plot for a score. */
function level(score: number) {
  if (score < 30) return 0;
  const i = score >= 71 ? 2 : score >= 51 ? 1 : 0;
  const z = [ZONES[2], ZONES[1], ZONES[0]][i];
  return i * ZONE + ((score - z.min) / (z.max - z.min)) * ZONE;
}

export default function AnimSignalsToIntent() {
  const companies = useCompanies(85);
  const { beat, cycle } = useBeats(BEATS, LOOP, REST);
  if (!companies.length) return null;
  const c = companies[cycle % companies.length];

  const EVENTS = [
    { signal: SIGNAL.category, score: 38, when: "5d ago" },
    { signal: SIGNAL.profile, score: 61, when: "3d ago" },
    { signal: SIGNAL.pricing, score: c.score, when: "Today" },
  ];

  const risen = beat >= 5 ? 3 : beat >= 3 ? 2 : beat >= 1 ? 1 : 0;
  const landed = beat >= 6 ? 3 : beat >= 4 ? 2 : beat >= 2 ? 1 : 0;
  const identified = beat >= 7 && beat < 8;
  const fading = beat >= 8;
  const gauge = risen ? level(EVENTS[risen - 1].score) : 0;
  const shown = landed ? EVENTS[landed - 1].score : 0;

  return (
    <div className="relative size-full overflow-hidden" aria-hidden data-name="Animation / Signals to intent">
      <div
        className="absolute left-[28px] right-[28px] top-1/2 -translate-y-1/2"
        style={{ opacity: fading ? 0 : 1, transition: tr(["opacity"], 420, fading ? 0 : 150) }}
      >
        {/* The account being scored. */}
        <div
          className="relative flex h-[64px] items-center gap-[12px] rounded-[14px] bg-white px-[12px]"
          style={{
            boxShadow: identified ? `0 0 0 1.5px ${LIVE}, 0px 8px 24px 0px rgba(7,41,41,0.14)` : CARD_SHADOW,
            transition: tr(["box-shadow"], 400),
          }}
        >
          <span className="relative block size-[40px] shrink-0">
            <span className="absolute inset-0" style={{ opacity: identified ? 0 : 1, transition: tr(["opacity"], 320) }}>
              <AnonTile size={40} radius={10} />
            </span>
            <Logo
              src={c.logo}
              size={40}
              radius={10}
              style={{
                position: "absolute",
                inset: 0,
                opacity: identified ? 1 : 0,
                filter: identified ? "none" : "blur(6px)",
                transition: tr(["opacity", "filter"], 520),
              }}
            />
          </span>
          <span className="relative block h-[40px] min-w-0 flex-1">
            <span className="absolute inset-0 flex flex-col justify-center" style={{ opacity: identified ? 0 : 1, transition: tr(["opacity"], 300) }}>
              <span className={`${FONT} font-medium leading-[20px] text-[14px]`} style={{ color: "rgba(47,43,61,0.55)" }}>
                Unknown company
              </span>
              <span className={`${FONT} leading-[16px] text-[11.5px]`} style={{ color: FAINT }}>
                {landed ? `${landed} of 3 signals` : "No signals yet"}
              </span>
            </span>
            <span
              className="absolute inset-0 flex flex-col justify-center"
              style={{ opacity: identified ? 1 : 0, transform: identified ? "none" : "translateY(4px)", transition: tr(["opacity", "transform"], 460, 80) }}
            >
              <span className={`${FONT} truncate font-medium leading-[20px] text-[14px]`} style={{ color: INK }}>
                {c.name}
              </span>
              <span className={`${FONT} truncate leading-[16px] text-[11.5px]`} style={{ color: MUTED }}>
                {c.industry}
              </span>
            </span>
          </span>
          {/* The score, in the band's own colour, climbing as the signals land. */}
          <span
            className={`${FONT} flex h-[28px] min-w-[58px] items-center justify-center rounded-[8px] px-[8px] font-semibold leading-[18px] text-[14px] tabular-nums`}
            style={{
              background: shown ? intentTagColor(shown) : SKELETON,
              color: shown ? INK : FAINT,
              transition: tr(["background"], 400),
            }}
          >
            {shown ? `${shown}%` : "—"}
          </span>
          <span
            className={`${FONT} absolute right-[12px] top-[-10px] flex h-[20px] items-center rounded-[6px] px-[7px] font-medium leading-[14px] text-[10.5px]`}
            style={{
              background: LIME,
              color: LIVE,
              opacity: identified ? 1 : 0,
              transform: identified ? "none" : "translateY(4px) scale(0.92)",
              transition: tr(["opacity"], 300, 250) + ", " + tr(["transform"], 480, 250, EASE_OUT),
            }}
          >
            In market
          </span>
        </div>

        {/* The scale. */}
        <div className="relative mt-[20px] overflow-hidden rounded-[14px] bg-white" style={{ height: PLOT, boxShadow: CARD_SHADOW }}>
          {ZONES.map((z, i) => {
            const reached = gauge > (2 - i) * ZONE + 1;
            return (
              <div
                key={z.range}
                className="absolute left-0 right-0"
                style={{
                  top: i * ZONE,
                  height: ZONE,
                  borderTop: i ? `1px solid ${HAIR}` : "none",
                  background: reached ? intentTagColor(z.min) : "transparent",
                  transition: tr(["background"], 500),
                }}
              >
                <span
                  className={`${FONT} absolute left-[12px] top-[10px] font-medium leading-[14px] text-[10.5px] tabular-nums`}
                  style={{ color: reached ? INK : FAINT, transition: tr(["color"], 300) }}
                >
                  {z.range}
                </span>
              </div>
            );
          })}

          {/* The gauge. */}
          <span className="absolute bottom-[12px] top-[12px] w-[6px] rounded-[100px]" style={{ left: 64, background: SKELETON }} />
          <span
            className="absolute w-[6px] rounded-[100px]"
            style={{ left: 64, bottom: 12, height: Math.max(gauge - 12, 0) * ((PLOT - 24) / (PLOT - 12)), background: LIVE, transition: tr(["height"], 560, 0, EASE_OUT) }}
          />
          <span
            className="absolute size-[14px] rounded-[100px]"
            style={{
              left: 60,
              bottom: 12 + Math.max(gauge - 12, 0) * ((PLOT - 24) / (PLOT - 12)) - 7,
              background: LIME,
              boxShadow: `0 0 0 2.5px ${LIVE}`,
              opacity: risen ? 1 : 0,
              transition: tr(["bottom"], 560, 0, EASE_OUT) + ", " + tr(["opacity"], 300),
            }}
          />

          {/* The signals, each at the height it is worth. */}
          {EVENTS.map((e, i) => {
            const on = landed > i;
            const y = 12 + Math.max(level(e.score) - 12, 0) * ((PLOT - 24) / (PLOT - 12));
            const bottom = Math.min(Math.max(y - CARD_H / 2, 8), PLOT - CARD_H - 8);
            return (
              <div key={e.signal.short} className="absolute" style={{ left: 78, right: 12, bottom }}>
                <span
                  className="absolute top-1/2 h-px"
                  style={{ left: -8, width: 8, background: LIVE, opacity: on ? 0.5 : 0, transition: tr(["opacity"], 300) }}
                />
                <div
                  className="flex items-center gap-[8px] rounded-[10px] bg-white px-[10px]"
                  style={{
                    height: CARD_H,
                    boxShadow: "0 0 0 1px rgba(47,43,61,0.08), 0px 4px 12px 0px rgba(47,43,61,0.08)",
                    opacity: on ? 1 : 0,
                    transform: on ? "none" : "translateX(14px)",
                    transition: tr(["opacity"], 320) + ", " + tr(["transform"], 520, 0, EASE_OUT),
                  }}
                >
                  <Tick on={on} />
                  <span className={`${FONT} flex-1 truncate font-medium leading-[16px] text-[12px]`} style={{ color: INK }}>
                    {e.signal.label}
                  </span>
                  <span className={`${FONT} leading-[14px] text-[10.5px]`} style={{ color: FAINT }}>
                    {e.when}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
