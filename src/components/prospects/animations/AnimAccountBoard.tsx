import {
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
  tr,
  useBeats,
  useCompanies,
  type Company,
} from "./shared";

/**
 * Animation Variation 4 — Account intelligence.
 *
 * The view a sales team lives in: a ranked board of accounts, a headline
 * count of who is in market, and the spread of every account across the
 * product's three intent bands — Researching, Evaluating, In market.
 *
 * It is the one concept that shows prioritisation, which is what a rep does
 * with Buyer Intelligence every morning. An account enters at the foot of the
 * board, barely warm. Signals land on it one after another — Viewed Product
 * Profile, then Viewed Pricing — each one pinned to its row as it arrives,
 * and its intent bar lengthens and its band changes. Then it climbs: the
 * board re-ranks around it, the rows it overtakes step down, and the
 * headline ticks up one. That is the promise in a sentence — the accounts
 * worth calling rise to the top on their own.
 */

/* 0 a new account at the foot · 1 first signal · 2 second signal · 3 it
   climbs · 4 counted in market · 5 settling for the next. */
const BEATS = [0, 800, 1700, 2600, 3300, 6600] as const;
const LOOP = 7200;
const REST = 4;

const ROW_H = 50;
const ROWS = 5;

/* The three bands under the names a sales team uses for them. One colour
   each, used for the spread bar, its legend and the chips alike, so a stage
   reads the same wherever it appears: quiet grey, the brand lime, and the
   product ink for the accounts that matter. */
const STAGES = [
  { label: "Researching", min: 30, color: "#e3e1e8", text: INK },
  { label: "Evaluating", min: 51, color: "rgba(177,250,99,0.6)", text: LIVE },
  { label: "In market", min: 71, color: LIVE, text: LIME },
] as const;

const stageOf = (score: number) => (score >= 71 ? 2 : score >= 51 ? 1 : 0);

function StageChip({ score }: { score: number }) {
  const s = STAGES[stageOf(score)];
  return (
    <span
      className={`${FONT} inline-flex h-[20px] w-[74px] shrink-0 items-center justify-center rounded-[6px] font-medium leading-[14px] text-[10.5px]`}
      style={{ background: s.color, color: s.text, transition: tr(["background", "color"], 360) }}
    >
      {s.label}
    </span>
  );
}

const pick = <T,>(list: T[], i: number) => list[((i % list.length) + list.length) % list.length];

export default function AnimAccountBoard() {
  const climbers = useCompanies(85);
  const everyone = useCompanies(0);
  const { beat, cycle } = useBeats(BEATS, LOOP, REST);
  if (!climbers.length || everyone.length < ROWS + 3) return null;

  /* This loop's climber, and a board of four others spread across the bands —
     one hot account, one warm, two still evaluating — so the climb has
     somewhere to go and the stages mean something. */
  const climber = pick(climbers, cycle);
  const rest = everyone.filter(c => c.id !== climber.id).sort((a, b) => b.score - a.score);
  const n = rest.length;
  const earlier: Company[] = [
    rest[cycle % 3],
    rest[4 + (cycle % 4)],
    rest[n - 4 + (cycle % 2)],
    rest[n - 1 - (cycle % 2)],
  ];
  const climbScore = beat >= 2 ? climber.score : beat >= 1 ? 63 : 44;

  type Entry = { c: Company; score: number; climber: boolean; order: number };
  const entries: Entry[] = [
    ...earlier.map((c, i) => ({ c, score: c.score, climber: false, order: i + 1 })),
    { c: climber, score: climbScore, climber: true, order: 0 },
  ];
  /* Before it climbs, the newcomer holds the foot; after, the board is ranked. */
  const ranked =
    beat >= 3
      ? [...entries].sort((a, b) => b.score - a.score || a.order - b.order)
      : [...entries.filter(e => !e.climber).sort((a, b) => b.score - a.score || a.order - b.order), entries.find(e => e.climber)!];

  const counted = beat >= 4;
  const inMarket = 23 + (cycle % 9) + (counted ? 1 : 0);
  const spread = [41 - (cycle % 9) - (counted ? 1 : 0), 18, inMarket];
  const total = spread.reduce((a, b) => a + b, 0);

  const ping =
    beat === 1 ? SIGNAL.profile.label : beat === 2 ? SIGNAL.pricing.label : null;

  return (
    <div className="relative size-full overflow-hidden" aria-hidden data-name="Animation / Account board">
      <div
        className="absolute left-[24px] right-[24px] top-1/2 -translate-y-1/2 rounded-[16px] bg-white p-[16px]"
        style={{ boxShadow: "0px 6px 24px 0px rgba(47,43,61,0.10)" }}
      >
        {/* The headline. */}
        <div className="flex items-start justify-between">
          <span className="flex flex-col gap-[2px]">
            <span className={`${FONT} leading-[16px] text-[12px]`} style={{ color: MUTED }}>
              Accounts in market
            </span>
            <span className="flex items-center gap-[8px]">
              <span key={inMarket} className={`${FONT} bi-count font-semibold leading-[34px] text-[28px] tabular-nums`} style={{ color: INK }}>
                {inMarket}
              </span>
              <span
                className={`${FONT} flex h-[20px] items-center rounded-[6px] px-[7px] font-medium leading-[14px] text-[10.5px]`}
                style={{
                  background: LIME,
                  color: LIVE,
                  opacity: counted && beat < 5 ? 1 : 0,
                  transform: counted && beat < 5 ? "none" : "translateY(4px)",
                  transition: tr(["opacity"], 300) + ", " + tr(["transform"], 460, 0, EASE_OUT),
                }}
              >
                +1 today
              </span>
            </span>
          </span>
          <span
            className={`${FONT} flex h-[24px] items-center rounded-[7px] px-[9px] leading-[14px] text-[11px]`}
            style={{ background: "rgba(7,41,41,0.06)", color: INK }}
          >
            This week
          </span>
        </div>

        {/* Every account, by band. */}
        <div className="mt-[14px] flex h-[8px] gap-[3px] overflow-hidden rounded-[100px]">
          {STAGES.map((s, i) => (
            <span
              key={s.label}
              className="h-full rounded-[100px]"
              style={{ width: `${(spread[i] / total) * 100}%`, background: s.color, transition: tr(["width"], 600, 0, EASE_OUT) }}
            />
          ))}
        </div>
        <div className="mt-[8px] flex items-center gap-[14px]">
          {STAGES.map((s, i) => (
            <span key={s.label} className="flex items-center gap-[5px]">
              <span className="block size-[7px] rounded-[100px]" style={{ background: s.color }} />
              <span className={`${FONT} leading-[14px] text-[11px]`} style={{ color: MUTED }}>
                {s.label}
              </span>
              <span className={`${FONT} font-medium leading-[14px] text-[11px] tabular-nums`} style={{ color: INK }}>
                {spread[i]}
              </span>
            </span>
          ))}
        </div>

        {/* The board. */}
        <div className="mt-[16px] flex h-[24px] items-center border-b px-[4px]" style={{ borderColor: HAIR }}>
          <span className={`${FONT} flex-1 leading-[14px] text-[11px]`} style={{ color: FAINT }}>
            Account
          </span>
          <span className={`${FONT} w-[84px] pl-[10px] leading-[14px] text-[11px]`} style={{ color: FAINT }}>
            Stage
          </span>
          <span className={`${FONT} w-[46px] text-right leading-[14px] text-[11px]`} style={{ color: FAINT }}>
            Intent
          </span>
        </div>
        {/* The roster changes between loops; it dips out and back rather than
            swapping under the reader's eye. */}
        <div
          className="relative"
          style={{ height: ROWS * ROW_H, opacity: beat === 5 ? 0 : 1, transition: tr(["opacity"], 420, beat === 5 ? 0 : 120) }}
        >
          {ranked.map((e, rank) => {
            const lifting = e.climber && beat === 3;
            const fresh = e.climber && beat === 0;
            const hot = e.climber && beat >= 1 && beat < 5;
            return (
              <div
                key={e.c.id}
                className="absolute left-0 right-0"
                style={{
                  top: rank * ROW_H,
                  height: ROW_H,
                  zIndex: e.climber ? 2 : 1,
                  transition: tr(["top"], 700, 0, EASE_OUT),
                }}
              >
                <div
                  className={`relative flex h-full items-center gap-[10px] rounded-[10px] px-[4px] ${fresh ? "bi-feed-in" : ""}`}
                  style={{
                    background: hot ? "rgba(177,250,99,0.22)" : "#ffffff",
                    boxShadow: lifting ? "0px 8px 20px 0px rgba(7,41,41,0.16)" : "none",
                    transform: lifting ? "scale(1.02)" : "none",
                    transition: tr(["background", "box-shadow", "transform"], 420),
                  }}
                >
                  {rank > 0 && !lifting && (
                    <span className="absolute left-[4px] right-[4px] top-0 h-px" style={{ background: HAIR }} />
                  )}
                  <Logo src={e.c.logo} size={28} radius={7} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-center gap-[6px]">
                      <span className={`${FONT} truncate font-medium leading-[16px] text-[12.5px]`} style={{ color: INK }}>
                        {e.c.name}
                      </span>
                      {e.climber && (
                        <span
                          className={`${FONT} flex h-[16px] shrink-0 items-center rounded-[4px] px-[5px] font-semibold leading-[12px] text-[9.5px]`}
                          style={{
                            background: LIVE,
                            color: LIME,
                            opacity: counted && beat < 5 ? 1 : 0,
                            transition: tr(["opacity"], 300),
                          }}
                        >
                          New
                        </span>
                      )}
                    </span>
                    {/* Intent, as a bar under the name: the thing that grows. */}
                    <span className="relative mt-[6px] block h-[4px] w-full max-w-[120px] overflow-hidden rounded-[100px]" style={{ background: "#eeedf0" }}>
                      <span
                        className="absolute inset-y-0 left-0 rounded-[100px]"
                        style={{ width: `${e.score}%`, background: LIVE, transition: tr(["width"], 600, 0, EASE_OUT) }}
                      />
                    </span>
                  </span>
                  <StageChip score={e.score} />
                  <span className={`${FONT} w-[36px] text-right font-semibold leading-[16px] text-[12px] tabular-nums`} style={{ color: INK }}>
                    {`${e.score}%`}
                  </span>

                  {e.climber && ping && (
                    <span
                      key={ping}
                      className={`${FONT} bi-pop absolute right-[6px] top-[-14px] flex h-[22px] items-center gap-[6px] whitespace-nowrap rounded-[7px] px-[8px] font-medium leading-[14px] text-[10.5px]`}
                      style={{ background: LIVE, color: "#ffffff", boxShadow: "0px 4px 12px 0px rgba(7,41,41,0.25)" }}
                    >
                      <span className="block size-[6px] rounded-[100px]" style={{ background: LIME }} />
                      {ping}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
