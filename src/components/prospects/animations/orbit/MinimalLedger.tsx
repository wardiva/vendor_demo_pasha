import { FONT, IntentChip, useCompanies } from "../shared";
import { easeInOut, easeOut, easeOutBack, lerp, pick, seg, useLoopClock } from "./kit";
import { INK, INK_FAINT, INK_SOFT, LIME, MUTE, Monogram } from "./MinimalField";

/**
 * Variation 1 — Original Background, minimal: the ledger.
 *
 * The same story set as a page rather than a diagram. Your category sits at
 * the top, the anchor. Beneath it, one quiet row of hollow circles: the
 * companies researching it. Signals rise from a company to your category as
 * single ink points, filling its circle a third at a time; full, it turns
 * lime and is written into the ledger at the foot — a ruled, typographic list
 * of identified prospects, newest first.
 *
 * The three parts read top to bottom in the order the product works:
 * category, activity, prospects.
 */

const PW = 389;
const CX = PW / 2;
const LABEL_Y = 62;
const CORE_Y = 170;
const ROW_Y = 314;
const COLS = 6;
const ROW_X = (i: number) => 56 + i * ((PW - 112) / (COLS - 1));
const LOOP = 7600;
const REST = 4800;
const ORDER = [2, 4, 1, 5, 0, 3];
const SIGNALS = [
  { at: 600, label: "Category" },
  { at: 1450, label: "Profile" },
  { at: 2300, label: "Pricing" },
];
const TRAVEL = 640;
const IDENTIFY = 3100;
const WRITE = 5000;
const LEDGER_Y = 404;
const ROW_H = 40;

export default function MinimalLedger() {
  const prospects = useCompanies(80);
  const { t, cycle, now } = useLoopClock(LOOP, REST);
  if (prospects.length < 6) return null;

  const col = ORDER[cycle % ORDER.length];
  const target = pick(prospects, cycle + 3);
  const x = ROW_X(col);
  const fill = SIGNALS.reduce((p, s, i) => Math.max(p, (i + easeOut(seg(t, s.at + TRAVEL - 80, s.at + TRAVEL + 320))) / 3), 0);
  const known = easeOutBack(seg(t, IDENTIFY, IDENTIFY + 520));
  const caption = seg(t, IDENTIFY + 250, IDENTIFY + 600) * (1 - seg(t, WRITE - 200, WRITE + 200));
  const written = t >= WRITE;
  const rows = [...(written ? [target] : []), ...[1, 2, 3].map(k => pick(prospects, cycle + 3 - k))].slice(0, 3);

  return (
    <div className="relative size-full overflow-hidden" aria-hidden data-name="Animation / Minimal ledger">
      {/* Your category. */}
      <span className="absolute flex size-[64px] items-center justify-center rounded-[100px]" style={{ left: CX - 32, top: CORE_Y - 32, background: INK }}>
        {SIGNALS.map(s =>
          t >= s.at + TRAVEL && t < s.at + TRAVEL + 900 ? (
            <span key={s.label} className="bi-ring absolute inset-0 rounded-[100px]" style={{ boxShadow: `0 0 0 1px ${INK}`, animationDelay: "0ms" }} />
          ) : null,
        )}
        <svg width="19" height="19" viewBox="0 0 14 14" fill="none" aria-hidden>
          <rect x="1" y="1" width="5" height="5" rx="1.2" fill={LIME} />
          <rect x="8" y="1" width="5" height="5" rx="1.2" fill="#f5f6f6" opacity="0.5" />
          <rect x="1" y="8" width="5" height="5" rx="1.2" fill="#f5f6f6" opacity="0.5" />
          <rect x="8" y="8" width="5" height="5" rx="1.2" fill={LIME} />
        </svg>
      </span>
      {/* Named above the disc, so the signals rising into it cross nothing. */}
      <span className="absolute flex -translate-x-1/2 flex-col items-center" style={{ left: CX, top: LABEL_Y }}>
        <span className={`${FONT} leading-[14px] text-[11px]`} style={{ color: MUTE }}>
          Your category
        </span>
        <span className={`${FONT} whitespace-nowrap font-medium leading-[20px] text-[14px]`} style={{ color: INK }}>
          Project Management
        </span>
      </span>

      {/* The signals rising. */}
      <svg className="absolute inset-0" width={PW} height="100%" aria-hidden>
        {SIGNALS.map(s => {
          if (t < s.at || t > s.at + TRAVEL + 700) return null;
          const go = easeInOut(seg(t, s.at, s.at + TRAVEL));
          const from = { x, y: ROW_Y - 14 };
          const to = { x: CX + (x - CX) * 0.14, y: CORE_Y + 35 };
          const at = { x: lerp(from.x, to.x, go), y: lerp(from.y, to.y, go) };
          const fade = 1 - seg(t, s.at + TRAVEL, s.at + TRAVEL + 700);
          return (
            <g key={s.label}>
              <line x1={from.x} y1={from.y} x2={at.x} y2={at.y} stroke={INK} strokeWidth="1" opacity={0.22 * fade} />
              {go < 1 && <circle cx={at.x} cy={at.y} r="3" fill={INK} />}
            </g>
          );
        })}
      </svg>

      {/* The row of companies. */}
      {Array.from({ length: COLS }).map((_, i) => {
        const cx = ROW_X(i);
        if (i === col) {
          const size = lerp(22, 30, known);
          return (
            <span key={`c-${i}-${cycle}`} className="absolute" style={{ left: cx, top: ROW_Y }}>
              <span
                className="absolute block rounded-[100px]"
                style={{
                  width: size,
                  height: size,
                  marginLeft: -size / 2,
                  marginTop: -size / 2,
                  background: `conic-gradient(${INK} 0turn ${fill.toFixed(3)}turn, transparent ${fill.toFixed(3)}turn 1turn)`,
                  boxShadow: `inset 0 0 0 1.5px ${INK}`,
                  opacity: 1 - known,
                }}
              />
              {known > 0 && <Monogram company={target} size={size} style={{ left: 0, top: 0, opacity: Math.min(known * 1.4, 1) }} />}
            </span>
          );
        }
        const breathe = 0.7 + 0.3 * Math.sin(now / 1400 + i * 1.3);
        return (
          <span
            key={`c-${i}`}
            className="absolute block size-[22px] rounded-[100px]"
            style={{ left: cx - 11, top: ROW_Y - 11, boxShadow: `inset 0 0 0 1.5px ${INK_SOFT}`, opacity: breathe }}
          />
        );
      })}

      {/* The signal, named under the row as it leaves. */}
      {SIGNALS.map(s => {
        const on = seg(t, s.at, s.at + 200) * (1 - seg(t, s.at + 780, s.at + 960));
        if (on <= 0) return null;
        return (
          <span
            key={s.label}
            className={`${FONT} absolute -translate-x-1/2 whitespace-nowrap leading-[14px] text-[11px]`}
            style={{ left: Math.min(Math.max(x, 44), PW - 44), top: ROW_Y + 20, color: MUTE, opacity: on }}
          >
            {`Viewed ${s.label.toLowerCase()}`}
          </span>
        );
      })}
      {caption > 0 && (
        <span
          className={`${FONT} absolute -translate-x-1/2 whitespace-nowrap font-medium leading-[14px] text-[11.5px]`}
          style={{ left: Math.min(Math.max(x, 70), PW - 70), top: ROW_Y + 22, color: INK, opacity: caption }}
        >
          {target.name}
        </span>
      )}

      {/* The ledger. */}
      <div className="absolute left-[32px] right-[32px]" style={{ top: LEDGER_Y }}>
        <div className="flex items-baseline justify-between pb-[8px]" style={{ borderBottom: `1px solid ${INK_FAINT}` }}>
          <span className={`${FONT} font-medium leading-[16px] text-[12px]`} style={{ color: INK }}>
            Identified prospects
          </span>
          <span className={`${FONT} leading-[14px] text-[11px] tabular-nums`} style={{ color: MUTE }}>
            {`${11 + (cycle % 30) + (written ? 1 : 0)} this week`}
          </span>
        </div>
        {rows.map((c, i) => (
          <div
            key={`${c.id}-${i === 0 && written ? "new" : i}`}
            className={`relative flex items-center gap-[10px] ${i === 0 && written ? "bi-feed-in" : ""}`}
            style={{ height: ROW_H, borderBottom: i < rows.length - 1 ? `1px solid ${INK_FAINT}` : "none" }}
          >
            <span className="relative block size-[22px] shrink-0">
              <Monogram company={c} size={22} style={{ left: 11, top: 11 }} />
            </span>
            <span className={`${FONT} min-w-0 flex-1 truncate leading-[16px] text-[12.5px]`} style={{ color: INK }}>
              {c.name}
            </span>
            <IntentChip score={c.score} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
