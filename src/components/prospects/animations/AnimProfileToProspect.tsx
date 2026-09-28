import {
  AnonTile,
  BandBar,
  CARD_SHADOW,
  ContactStack,
  EASE_OUT,
  FAINT,
  FONT,
  HAIR,
  INK,
  IntentChip,
  LIME,
  LIVE,
  LiveDot,
  Logo,
  MUTED,
  SIGNAL,
  Tick,
  maskDomain,
  tr,
  useBeats,
  useCompanies,
} from "./shared";

/**
 * Animation Variation 1 — Your profile → Prospect.
 *
 * The cause and the effect on one screen. Above: the vendor's own profile on
 * Software Finder, its three pages — Category, Profile, Pricing. Below: the
 * prospect card Buyer Intelligence keeps on whoever is reading them.
 *
 * An unseen visitor moves through the pages. Each page they open lights up,
 * and a signal drops out of it, straight down its own channel into the card
 * beneath, where the matching signal row ticks and the intent marker climbs a
 * band. Three pages in, the card knows enough: "Unknown company" resolves
 * into a named, scored account, tagged as a new prospect, with the people
 * behind it waiting — blurred — for a reveal.
 *
 * The page, the signal and the prospect are all the product's own objects, so
 * the reader is never asked to decode a metaphor: this is literally what
 * happens to their profile's traffic.
 */

const PAGES = [
  { key: "category", label: "Category", signal: SIGNAL.category },
  { key: "profile", label: "Profile", signal: SIGNAL.profile },
  { key: "pricing", label: "Pricing", signal: SIGNAL.pricing },
] as const;

/* 0 reset · 1 Category opened · 2 its signal drops · 3 lands · 4 Profile ·
   5 drops · 6 lands · 7 Pricing · 8 drops · 9 lands · 10 identified ·
   11 filed as a prospect · 12 fading for the next visitor. */
const BEATS = [0, 500, 900, 1500, 2300, 2700, 3300, 4100, 4500, 5100, 5800, 6500, 8600] as const;
const LOOP = 9200;
const REST = 11;

function PageIcon({ page, color }: { page: (typeof PAGES)[number]["key"]; color: string }) {
  const common = { stroke: color, strokeWidth: 1.3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="block shrink-0" style={{ transition: tr(["stroke"], 300) }}>
      {page === "category" && (
        <>
          <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1.2" {...common} />
          <rect x="9" y="2.5" width="4.5" height="4.5" rx="1.2" {...common} />
          <rect x="2.5" y="9" width="4.5" height="4.5" rx="1.2" {...common} />
          <rect x="9" y="9" width="4.5" height="4.5" rx="1.2" {...common} />
        </>
      )}
      {page === "profile" && (
        <>
          <rect x="2" y="3" width="12" height="10" rx="2" {...common} />
          <circle cx="6" cy="7" r="1.5" {...common} />
          <path d="M4 10.5C4.4 9.6 5.1 9.2 6 9.2S7.6 9.6 8 10.5M9.5 6.5H12M9.5 9H11.5" {...common} />
        </>
      )}
      {page === "pricing" && (
        <>
          <path d="M8.6 2.5H13.5V7.4L7.6 13.3C7.2 13.7 6.6 13.7 6.2 13.3L2.7 9.8C2.3 9.4 2.3 8.8 2.7 8.4L8.6 2.5Z" {...common} />
          <circle cx="10.8" cy="5.2" r="0.9" {...common} />
        </>
      )}
    </svg>
  );
}

export default function AnimProfileToProspect() {
  const companies = useCompanies(85);
  const { beat, cycle } = useBeats(BEATS, LOOP, REST);
  if (!companies.length) return null;
  const c = companies[cycle % companies.length];

  /* Which page the visitor is on, which have been read, how many signals
     have landed. */
  const activePage = beat >= 1 && beat < 10 ? Math.min(Math.floor((beat - 1) / 3), 2) : -1;
  const landed = beat >= 9 ? 3 : beat >= 6 ? 2 : beat >= 3 ? 1 : 0;
  const dropping = beat === 2 || beat === 5 || beat === 8 ? (beat - 2) / 3 : -1;
  const identified = beat >= 10;
  const filed = beat >= 11 && beat < 12;
  const fading = beat >= 12;
  const visitorOn = beat >= 1 && beat < 12;
  const score = [0, 38, 61, c.score][landed];

  return (
    <div className="relative size-full overflow-hidden" aria-hidden data-name="Animation / Profile to prospect">
      <div className="absolute left-[28px] right-[28px] top-1/2 -translate-y-1/2">
        {/* The vendor's profile. */}
        <div className="rounded-[14px] bg-white p-[14px]" style={{ boxShadow: CARD_SHADOW }}>
          <div className="flex h-[30px] items-center gap-[10px]">
            <span className="flex size-[30px] shrink-0 items-center justify-center rounded-[8px]" style={{ background: LIVE }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <rect x="1" y="1" width="5" height="5" rx="1.2" fill={LIME} />
                <rect x="8" y="1" width="5" height="5" rx="1.2" fill={LIME} opacity="0.55" />
                <rect x="1" y="8" width="5" height="5" rx="1.2" fill={LIME} opacity="0.55" />
                <rect x="8" y="8" width="5" height="5" rx="1.2" fill={LIME} />
              </svg>
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className={`${FONT} font-medium leading-[16px] text-[13px]`} style={{ color: INK }}>
                Your profile
              </span>
              <span className={`${FONT} leading-[14px] text-[11px]`} style={{ color: MUTED }}>
                Software Finder
              </span>
            </span>
            <span
              className="flex h-[22px] items-center gap-[6px] rounded-[100px] px-[8px]"
              style={{
                background: "rgba(177,250,99,0.28)",
                opacity: visitorOn ? 1 : 0,
                transform: visitorOn ? "none" : "translateY(3px)",
                transition: tr(["opacity", "transform"], 360),
              }}
            >
              <LiveDot />
              <span className={`${FONT} font-medium leading-[14px] text-[11px]`} style={{ color: LIVE }}>
                1 visitor
              </span>
            </span>
          </div>

          <div className="mt-[12px] grid grid-cols-3 gap-[8px]">
            {PAGES.map((p, i) => {
              const active = i === activePage;
              const read = !active && landed > i;
              return (
                <span
                  key={p.key}
                  className="relative flex h-[34px] items-center justify-center gap-[6px] rounded-[9px]"
                  style={{
                    background: active ? LIVE : read ? "rgba(7,41,41,0.06)" : "#ffffff",
                    border: `1px solid ${active ? LIVE : HAIR}`,
                    transform: active ? "translateY(-1px)" : "none",
                    boxShadow: active ? "0px 4px 12px 0px rgba(7,41,41,0.22)" : "none",
                    transition: tr(["background", "border-color", "transform", "box-shadow"], 320),
                  }}
                >
                  <PageIcon page={p.key} color={active ? LIME : read ? LIVE : FAINT} />
                  <span
                    className={`${FONT} leading-[16px] text-[12px]`}
                    style={{
                      color: active ? "#ffffff" : read ? LIVE : MUTED,
                      fontWeight: active || read ? 500 : 400,
                      transition: tr(["color"], 300),
                    }}
                  >
                    {p.label}
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        {/* The channels: one under each page, the signal falling down its own. */}
        <div className="relative grid h-[40px] grid-cols-3 gap-[8px]">
          {PAGES.map((p, i) => (
            <span key={p.key} className="relative flex justify-center">
              <span
                className="h-full w-0"
                style={{
                  borderLeft: `1.5px dashed ${landed > i || dropping === i ? "rgba(7,41,41,0.45)" : "rgba(47,43,61,0.14)"}`,
                  transition: tr(["border-color"], 300),
                }}
              />
              {dropping === i && (
                <span
                  key={`${cycle}-${i}`}
                  className="bi-drop absolute left-1/2 top-0 -ml-[5px] block size-[10px] rounded-[100px]"
                  style={{ background: LIME, boxShadow: `0 0 0 2px ${LIVE}` }}
                />
              )}
            </span>
          ))}
        </div>

        {/* The prospect Buyer Intelligence builds. */}
        <div
          className="rounded-[14px] bg-white p-[16px]"
          style={{
            boxShadow: identified ? "0px 8px 24px 0px rgba(7,41,41,0.14)" : CARD_SHADOW,
            opacity: fading ? 0 : 1,
            transform: fading ? "translateY(6px)" : "none",
            transition: tr(["opacity", "transform"], 420, fading ? 0 : 200) + ", " + tr(["box-shadow"], 500),
          }}
        >
          <div className="flex h-[40px] items-center gap-[12px]">
            <span className="relative block size-[40px] shrink-0">
              <span className="absolute inset-0" style={{ opacity: identified ? 0 : 1, transition: tr(["opacity"], 360) }}>
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
              <span
                className="absolute inset-0 flex flex-col justify-center"
                style={{ opacity: identified ? 0 : 1, transition: tr(["opacity"], 300) }}
              >
                <span className={`${FONT} font-medium leading-[20px] text-[14px]`} style={{ color: "rgba(47,43,61,0.55)" }}>
                  Unknown company
                </span>
                <span className={`${FONT} leading-[16px] text-[11.5px] tracking-[0.5px]`} style={{ color: FAINT }}>
                  {maskDomain(c.domain)}
                </span>
              </span>
              <span
                className="absolute inset-0 flex flex-col justify-center"
                style={{
                  opacity: identified ? 1 : 0,
                  transform: identified ? "none" : "translateY(4px)",
                  transition: tr(["opacity", "transform"], 480, 80),
                }}
              >
                <span className={`${FONT} truncate font-medium leading-[20px] text-[14px]`} style={{ color: INK }}>
                  {c.name}
                </span>
                <span className={`${FONT} truncate leading-[16px] text-[11.5px]`} style={{ color: MUTED }}>
                  {c.industry}
                </span>
              </span>
            </span>
            <span
              style={{
                opacity: identified ? 1 : 0,
                transform: identified ? "scale(1)" : "scale(0.9)",
                transition: tr(["opacity"], 360, 200) + ", " + tr(["transform"], 480, 200, EASE_OUT),
              }}
            >
              <IntentChip score={c.score} />
            </span>
          </div>

          <div className="my-[14px] h-px w-full" style={{ background: HAIR }} />

          <div className="flex flex-col gap-[8px]">
            {PAGES.map((p, i) => {
              const on = landed > i;
              return (
                <div key={p.key} className="flex h-[20px] items-center gap-[8px]">
                  <Tick on={on} />
                  <span
                    className={`${FONT} flex-1 leading-[16px] text-[12px]`}
                    style={{ color: on ? INK : FAINT, fontWeight: on ? 500 : 400, transition: tr(["color"], 300) }}
                  >
                    {p.signal.label}
                  </span>
                  <span className={`${FONT} leading-[16px] text-[11px] tabular-nums`} style={{ color: on ? MUTED : "rgba(47,43,61,0.3)" }}>
                    {p.signal.range}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-[14px] flex items-center gap-[12px]">
            <span className={`${FONT} font-medium leading-[16px] text-[11.5px]`} style={{ color: INK }}>
              Intent
            </span>
            <BandBar score={Math.max(score, 30)} markerVisible={landed > 0} />
            <span
              className={`${FONT} w-[30px] text-right font-semibold leading-[16px] text-[12px] tabular-nums`}
              style={{ color: landed ? LIVE : "rgba(47,43,61,0.3)", transition: tr(["color"], 300) }}
            >
              {landed ? `${score}%` : "—"}
            </span>
          </div>

          {/* The payoff, in the reserved space at the foot so nothing above moves. */}
          <div
            className="mt-[14px] flex h-[34px] items-center justify-between border-t pt-[12px]"
            style={{
              borderColor: HAIR,
              opacity: filed || (beat >= 11 && !fading) ? 1 : 0,
              transform: filed ? "none" : "translateY(4px)",
              transition: tr(["opacity"], 360) + ", " + tr(["transform"], 520, 0, EASE_OUT),
            }}
          >
            <span
              className={`${FONT} flex h-[22px] items-center gap-[5px] rounded-[6px] px-[8px] font-medium leading-[14px] text-[11px]`}
              style={{ background: LIME, color: LIVE }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M5 1V9M1 5H9" stroke={LIVE} strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              New prospect
            </span>
            <span className="flex items-center gap-[8px]">
              <ContactStack avatars={c.avatars} />
              <span className={`${FONT} leading-[14px] text-[11px]`} style={{ color: MUTED }}>
                {`${c.avatars.length} ${c.avatars.length === 1 ? "contact" : "contacts"}`}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
