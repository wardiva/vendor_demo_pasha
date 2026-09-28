import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { FONT, maskDomain, useCompanies, type Company } from "../shared";
import { easeInOut, easeOut, lerp, seg, useLoopClock } from "./kit";
import { ellipsize, rng, roundRect } from "./VaporCards";

/**
 * Variation 8 — Detection flow.
 *
 * One story on one spine. A vertical timeline runs down the panel through
 * three steps — Researching your category, Activity detected, Prospect
 * identified — and a single company travels it.
 *
 * It arrives at the top as an anonymous card, laid out exactly like a
 * prospect card — tile, name, domain, intent — but with nothing known: a
 * building for a logo, "Unknown company", a masked domain, a dash for
 * intent. The signals it produces tick in at the middle step and the spine
 * fills to meet them. A cursor comes to the card and presses it, and the card
 * vaporises — but its dust does not blow away. It flows down the spine, past
 * the signals that identified it, changing colour as it goes, and lands where
 * the prospect card belongs, re-forming left to right into the company
 * itself: its logo, its name, its intent. The previous prospect steps back to
 * make room, the last step turns lime, and the cursor comes to rest on the
 * new intent score.
 *
 * The vaporise is the transition, so the two cards are visibly the same
 * thing before and after: unknown, then known.
 */

const PW = 389;
const PH = 590;
const SPINE_X = 34;
const CARD_X = 58;
const CARD_W = 306;
const CARD_H = 84;
const R = 14;

const S1 = 112; // step centres
const S2 = 268;
const S3 = 362;
const CARD1_Y = 130;
const CHIPS_Y = 284;
const CARD2_Y = 380;
const PEEK = 10;

const INK = "#072929";
const TEXT = "#2f2b3d";
const MUTE = "rgba(47,43,61,0.62)";
const FAINT = "rgba(47,43,61,0.4)";
const LIME = "#B1FA63";
const INTENT = "#5DBB1E";
const HAIR = "rgba(7,41,41,0.12)";

/* One loop, in ms. */
const T = {
  surface: [0, 600] as const,
  spine1: [600, 950] as const,
  chips: [750, 1200, 1650] as const,
  cursorIn: [1650, 2150] as const,
  press: [2150, 2330] as const,
  release: 2330,
  sweep: 650,
  flight: [850, 1250] as const,
  stepBack: [2750, 3250] as const,
  formed: 4250,
  cursorDown: [2450, 3900] as const,
  fadeChips: [5900, 6350] as const,
};
const LOOP = 6600;
const REST = 5200;
const STEP = 2;

const GRAB = { x: CARD_X + CARD_W - 78, y: CARD1_Y + 46 };
const REST_AT = { x: CARD_X + CARD_W - 34, y: CARD2_Y + 58 };

const SIGNALS = ["Category", "Profile", "Pricing"];

type Particle = {
  x: number;
  y: number;
  a: number;
  delay: number;
  flight: number;
  arc: number;
  lift: number;
  colors: string[];
};

type Prepared = { anon: HTMLCanvasElement; known: HTMLCanvasElement; particles: Particle[]; withLogo: boolean };

function canvasOf(dpr: number) {
  const c = document.createElement("canvas");
  c.width = Math.round(CARD_W * dpr);
  c.height = Math.round(CARD_H * dpr);
  const ctx = c.getContext("2d")!;
  ctx.scale(dpr, dpr);
  roundRect(ctx, 0.5, 0.5, CARD_W - 1, CARD_H - 1, R);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "rgba(47,43,61,0.08)";
  ctx.lineWidth = 1;
  ctx.stroke();
  return { c, ctx };
}

/** The intent column, right: a figure over a dotted label. */
function intentColumn(ctx: CanvasRenderingContext2D, value: string, known: boolean) {
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  const rx = CARD_W - 18;
  ctx.font = "600 17px Inter, sans-serif";
  ctx.fillStyle = known ? TEXT : "rgba(47,43,61,0.3)";
  ctx.fillText(value, rx, CARD_H / 2 - 1);
  ctx.font = "500 11px Inter, sans-serif";
  const lw = ctx.measureText("Intent").width;
  ctx.fillStyle = known ? MUTE : FAINT;
  ctx.fillText("Intent", rx, CARD_H / 2 + 15);
  ctx.beginPath();
  ctx.arc(rx - lw - 7, CARD_H / 2 + 11, 3, 0, Math.PI * 2);
  ctx.fillStyle = known ? INTENT : "rgba(47,43,61,0.2)";
  ctx.fill();
  ctx.font = "600 17px Inter, sans-serif";
  const w = Math.max(ctx.measureText(value).width, lw + 13);
  ctx.textAlign = "left";
  return rx - w;
}

function drawAnon(company: Company, dpr: number) {
  const { c, ctx } = canvasOf(dpr);
  const lx = 16;
  const ly = (CARD_H - 44) / 2;
  roundRect(ctx, lx, ly, 44, 44, 11);
  ctx.fillStyle = "#eeedf0";
  ctx.fill();
  /* A building, drawn small: nothing known but that it is a company. */
  ctx.save();
  ctx.translate(lx + 11, ly + 11);
  ctx.scale(22 / 16, 22 / 16);
  ctx.strokeStyle = "rgba(47,43,61,0.45)";
  ctx.lineWidth = 1.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke(new Path2D("M3 14V3.5C3 2.95 3.45 2.5 4 2.5H9C9.55 2.5 10 2.95 10 3.5V14M10 6.5H12C12.55 6.5 13 6.95 13 7.5V14M1.75 14H14.25M5.5 5.5H7.5M5.5 8H7.5M5.5 10.5H7.5"));
  ctx.restore();
  const cx = intentColumn(ctx, "—", false);
  const tx = lx + 44 + 14;
  const maxW = cx - tx - 12;
  ctx.textBaseline = "alphabetic";
  ctx.font = "600 14px Inter, sans-serif";
  ctx.fillStyle = "rgba(47,43,61,0.5)";
  ctx.fillText("Unknown company", tx, CARD_H / 2 - 3);
  ctx.font = "400 12px Inter, sans-serif";
  ctx.fillStyle = FAINT;
  ctx.fillText(ellipsize(ctx, maskDomain(company.domain), maxW), tx, CARD_H / 2 + 15);
  return c;
}

function drawKnown(company: Company, logo: HTMLImageElement | null, dpr: number) {
  const { c, ctx } = canvasOf(dpr);
  const lx = 16;
  const ly = (CARD_H - 44) / 2;
  ctx.save();
  roundRect(ctx, lx, ly, 44, 44, 11);
  ctx.clip();
  if (logo && logo.complete && logo.naturalWidth) ctx.drawImage(logo, lx, ly, 44, 44);
  else {
    ctx.fillStyle = "#eeedf0";
    ctx.fillRect(lx, ly, 44, 44);
  }
  ctx.restore();
  const cx = intentColumn(ctx, `${company.score}%`, true);
  const tx = lx + 44 + 14;
  const maxW = cx - tx - 12;
  ctx.textBaseline = "alphabetic";
  ctx.font = "600 14px Inter, sans-serif";
  ctx.fillStyle = TEXT;
  ctx.fillText(ellipsize(ctx, company.name, maxW), tx, CARD_H / 2 - 3);
  ctx.font = "400 12px Inter, sans-serif";
  ctx.fillStyle = MUTE;
  ctx.fillText(ellipsize(ctx, company.industry, maxW), tx, CARD_H / 2 + 15);
  return c;
}

/** The anonymous card's pixels as dust, each carrying the colour it will become. */
function particlesOf(anon: HTMLCanvasElement, known: HTMLCanvasElement, dpr: number, seed: number): Particle[] {
  const a = anon.getContext("2d")!.getImageData(0, 0, anon.width, anon.height).data;
  const k = known.getContext("2d")!.getImageData(0, 0, known.width, known.height).data;
  const rand = rng(seed * 7919 + 31);
  const out: Particle[] = [];
  for (let y = 0; y < CARD_H; y += STEP) {
    for (let x = 0; x < CARD_W; x += STEP) {
      const px = Math.min(anon.width - 1, Math.round((x + STEP / 2) * dpr));
      const py = Math.min(anon.height - 1, Math.round((y + STEP / 2) * dpr));
      const i = (py * anon.width + px) * 4;
      const alpha = a[i + 3] / 255;
      if (alpha < 0.08) continue;
      /* Five stops from what it was to what it becomes. */
      const colors = [0, 0.25, 0.5, 0.75, 1].map(m => {
        const r = Math.round(lerp(a[i], k[i], m));
        const g = Math.round(lerp(a[i + 1], k[i + 1], m));
        const b = Math.round(lerp(a[i + 2], k[i + 2], m));
        return `rgb(${r},${g},${b})`;
      });
      out.push({
        x,
        y,
        a: alpha,
        delay: (x / CARD_W) * T.sweep + rand() * 140 + (y / CARD_H) * 50,
        flight: T.flight[0] + rand() * (T.flight[1] - T.flight[0]),
        arc: 14 + rand() * 30,
        lift: 6 + rand() * 14,
        colors,
      });
    }
  }
  return out;
}

const PREFERRED = ["Meridian Supply Co.", "Summit Ridge Energy", "Ironclad Construction", "Bowline Freight"];

function Cursor({ x, y, pressed, visible }: { x: number; y: number; pressed: number; visible: number }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden
      className="absolute"
      style={{
        left: x - 3,
        top: y - 2,
        zIndex: 40,
        opacity: visible,
        transform: `scale(${(1 - 0.1 * pressed).toFixed(3)})`,
        transformOrigin: "3px 2px",
        filter: "drop-shadow(0px 3px 5px rgba(7,41,41,0.28))",
      }}
    >
      <path d="M3.5 2.5L3.5 17.2L7.4 13.6L10.1 19.6L12.9 18.4L10.3 12.5L15.6 12.3L3.5 2.5Z" fill={INK} stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function StepDot({ y, state }: { y: number; state: "idle" | "on" | "done" }) {
  return (
    <span
      className="absolute flex items-center justify-center rounded-[100px]"
      style={{
        left: SPINE_X - 7,
        top: y - 7,
        width: 14,
        height: 14,
        background: state === "done" ? LIME : state === "on" ? INK : "#f5f6f6",
        boxShadow: state === "idle" ? `inset 0 0 0 1.5px ${HAIR}` : state === "done" ? `0 0 0 3px #f5f6f6` : `0 0 0 3px #f5f6f6`,
        transition: "background 300ms, box-shadow 300ms",
        zIndex: 2,
      }}
    >
      {state === "done" && (
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M2 5.2L4.1 7.2L8 3.2" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

export default function DetectionFlow() {
  const all = useCompanies(80);
  const companies = useMemo(() => {
    const preferred = PREFERRED.map(n => all.find(c => c.name === n)).filter((c): c is Company => !!c);
    return [...preferred, ...all.filter(c => !PREFERRED.includes(c.name))].slice(0, 8);
  }, [all]);
  const { t, cycle, reduced } = useLoopClock(LOOP, REST);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logos = useRef(new Map<string, HTMLImageElement>());
  const cache = useRef(new Map<number, Prepared>());
  const [ready, setReady] = useState(false);
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  const n = companies.length;
  const at = (k: number) => ((k % n) + n) % n;

  useEffect(() => {
    companies.forEach(c => {
      if (logos.current.has(c.id)) return;
      const im = new Image();
      im.src = c.logo;
      logos.current.set(c.id, im);
    });
    let live = true;
    (document.fonts?.ready ?? Promise.resolve()).then(() => live && setReady(true));
    return () => {
      live = false;
    };
  }, [companies]);

  const prepare = (k: number): Prepared => {
    const company = companies[k];
    const logo = logos.current.get(company.id) ?? null;
    const loaded = !!(logo && logo.complete && logo.naturalWidth);
    const hit = cache.current.get(k);
    if (hit && (hit.withLogo || !loaded)) return hit;
    const anon = drawAnon(company, dpr);
    const known = drawKnown(company, logo, dpr);
    const p = { anon, known, particles: particlesOf(anon, known, dpr, k + 1), withLogo: loaded };
    cache.current.set(k, p);
    return p;
  };

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ready || !n) return;
    if (canvas.width !== PW * dpr) {
      canvas.width = PW * dpr;
      canvas.height = PH * dpr;
    }
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, PW, PH);

    const cur = prepare(at(cycle));
    const prev = prepare(at(cycle - 1));

    const shadow = (on: number) => {
      ctx.shadowColor = `rgba(7,41,41,${(0.1 * on).toFixed(3)})`;
      ctx.shadowBlur = 24 * on;
      ctx.shadowOffsetY = 10 * on;
    };
    const noShadow = () => {
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    };
    const drawAt = (img: HTMLCanvasElement, x: number, y: number, scale: number, alpha: number, sh: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      shadow(sh);
      const w = CARD_W * scale;
      const h = CARD_H * scale;
      ctx.drawImage(img, x + (CARD_W - w) / 2, y + (CARD_H - h), w, h);
      ctx.restore();
    };

    /* The prospects stack. Cards behind the top one are blank — only their
       edges show — so as the previous prospect steps back to make room it
       clears to a blank card, and the new one forms over a clean surface. */
    const blankAt = (y: number, scale: number, sh: number, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      shadow(sh);
      const w = CARD_W * scale;
      const h = CARD_H * scale;
      roundRect(ctx, CARD_X + (CARD_W - w) / 2, y + (CARD_H - h), w, h, R * scale);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      noShadow();
      ctx.strokeStyle = "rgba(47,43,61,0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    };
    const back = easeInOut(seg(t, T.stepBack[0], T.stepBack[1]));
    /* Always two edges behind the top card: the deepest recedes out of
       sight as a new card joins the front, so the stack never pops. */
    blankAt(CARD2_Y + PEEK * (2 + back), 1 - 0.05 * (2 + back), 0.3, 1 - back);
    blankAt(CARD2_Y + PEEK * (1 + back), 1 - 0.05 * (1 + back), 0.5);
    blankAt(CARD2_Y + PEEK * back, 1 - 0.05 * back, 1);
    drawAt(prev.known, CARD_X, CARD2_Y + PEEK * back, 1 - 0.05 * back, 1 - back, 0);

    const v = t - T.release;
    const surfacing = easeOut(seg(t, T.surface[0], T.surface[1]));
    const pressed = seg(t, T.press[0], T.press[0] + 90) * (1 - seg(t, T.release - 40, T.release + 40));

    if (v < 0) {
      /* The anonymous card, whole. */
      const s = 1 - 0.015 * pressed;
      drawAt(cur.anon, CARD_X, CARD1_Y + (1 - surfacing) * 12, s, surfacing, surfacing);
    } else {
      noShadow();
      /* What the wave has not reached stays the card, crisp; what the dust
         has reached below is the prospect, crisp. Both drawn in runs. */
      const runs = (img: HTMLCanvasElement, oy: number, keep: (q: Particle) => boolean) => {
        let ry = -1;
        let rx = -1;
        let re = -1;
        const flush = () => {
          if (rx < 0) return;
          ctx.drawImage(img, rx * dpr, ry * dpr, (re - rx) * dpr, STEP * dpr, CARD_X + rx, oy + ry, re - rx, STEP);
          rx = -1;
        };
        for (const q of cur.particles) {
          if (q.y !== ry) {
            flush();
            ry = q.y;
          }
          if (keep(q)) {
            if (rx >= 0 && q.x === re) re = q.x + STEP;
            else {
              flush();
              ry = q.y;
              rx = q.x;
              re = q.x + STEP;
            }
          } else flush();
        }
        flush();
      };
      const landedAll = v > T.sweep + 140 + 50 + T.flight[1];
      if (!landedAll) runs(cur.anon, CARD1_Y, q => v - q.delay <= 0);
      if (landedAll) {
        const settle = easeOut(seg(t, T.formed, T.formed + 500));
        drawAt(cur.known, CARD_X, CARD2_Y, 1, 1, settle);
      } else {
        runs(cur.known, CARD2_Y, q => v - q.delay >= q.flight);
        /* The dust in flight: down the spine, arcing out and back, turning
           from what it was into what it becomes. */
        const dy = CARD2_Y - CARD1_Y;
        for (const q of cur.particles) {
          const local = v - q.delay;
          if (local <= 0 || local >= q.flight) continue;
          const p = local / q.flight;
          const e = easeInOut(p);
          const x = CARD_X + q.x + Math.sin(p * Math.PI) * q.arc;
          const y = CARD1_Y + q.y + dy * e - Math.sin(Math.min(p * 2.2, 1) * Math.PI) * q.lift;
          const mid = Math.sin(p * Math.PI);
          ctx.globalAlpha = q.a * (1 - 0.55 * mid);
          ctx.fillStyle = q.colors[Math.min(4, Math.floor(p * 5))];
          const size = STEP * (1 - 0.35 * mid);
          ctx.fillRect(x, y, size, size);
        }
        ctx.globalAlpha = 1;
      }
    }
  });

  if (!n) return null;

  /* The spine: filled to the detection step as signals arrive, then down to
     the prospect as the dust travels. */
  const toS2 = easeInOut(seg(t, T.spine1[0], T.spine1[1]));
  const toS3 = easeInOut(seg(t, T.release + 200, T.formed - 200));
  const fade = seg(t, T.fadeChips[0], T.fadeChips[1]);
  const fillTo = lerp(S1, lerp(S2, S3, toS3), toS2);
  const chipsOn = T.chips.map(c => easeOut(seg(t, c, c + 280)) * (1 - fade));
  const formed = t >= T.formed;
  const count = 11 + (cycle % 30) + (formed ? 1 : 0);

  /* The cursor: in from the prospect it last rested on, press, then down with the dust. */
  let cx = REST_AT.x;
  let cy = REST_AT.y;
  if (t >= T.cursorIn[0] && t < T.cursorDown[0]) {
    const p = easeInOut(seg(t, T.cursorIn[0], T.cursorIn[1]));
    cx = lerp(REST_AT.x, GRAB.x, p) + Math.sin(p * Math.PI) * 30;
    cy = lerp(REST_AT.y, GRAB.y, p);
  } else if (t >= T.cursorDown[0]) {
    const p = easeInOut(seg(t, T.cursorDown[0], T.cursorDown[1]));
    cx = lerp(GRAB.x, REST_AT.x, p) + Math.sin(p * Math.PI) * 26;
    cy = lerp(GRAB.y, REST_AT.y, p);
  }
  const pressed = seg(t, T.press[0], T.press[0] + 90) * (1 - seg(t, T.release - 40, T.release + 40));

  return (
    <div className="relative size-full overflow-hidden" aria-hidden data-name="Animation / Detection flow">
      {/* The spine. */}
      <span className="absolute w-[2px] rounded-[2px]" style={{ left: SPINE_X - 1, top: S1, height: S3 - S1, background: HAIR }} />
      <span
        className="absolute w-[2px] rounded-[2px]"
        style={{ left: SPINE_X - 1, top: S1, height: Math.max(0, fillTo - S1), background: INK, opacity: 1 - fade }}
      />
      <StepDot y={S1} state={t >= T.surface[1] - 200 ? "on" : "idle"} />
      <StepDot y={S2} state={t >= T.chips[0] && fade < 1 ? "on" : "idle"} />
      <StepDot y={S3} state={formed || t < T.release ? "done" : "on"} />

      {/* Step 1. */}
      <span className="absolute flex items-baseline justify-between" style={{ left: CARD_X, right: PW - CARD_X - CARD_W, top: S1 - 9 }}>
        <span className={`${FONT} font-medium leading-[18px] text-[12.5px]`} style={{ color: INK }}>
          Researching your category
        </span>
        <span className={`${FONT} leading-[14px] text-[11px]`} style={{ color: MUTE }}>
          Project Management
        </span>
      </span>

      {/* Step 2, and the signals it detected. */}
      <span className="absolute flex items-baseline justify-between" style={{ left: CARD_X, right: PW - CARD_X - CARD_W, top: S2 - 9 }}>
        <span className={`${FONT} font-medium leading-[18px] text-[12.5px]`} style={{ color: t >= T.chips[0] && fade < 1 ? INK : FAINT, transition: "color 300ms" }}>
          Activity detected
        </span>
      </span>
      <span className="absolute flex items-center gap-[6px]" style={{ left: CARD_X, top: CHIPS_Y }}>
        {SIGNALS.map((s, i) => (
          <span
            key={s}
            className={`${FONT} flex h-[24px] items-center gap-[5px] whitespace-nowrap rounded-[7px] bg-white px-[8px] leading-[14px] text-[11px]`}
            style={{
              color: INK,
              boxShadow: `0 0 0 1px ${HAIR}`,
              opacity: chipsOn[i],
              transform: `translateY(${((1 - chipsOn[i]) * 4).toFixed(1)}px)`,
            }}
          >
            <span className="flex size-[12px] items-center justify-center rounded-[100px]" style={{ background: LIME }}>
              <svg width="7" height="7" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M2 5.2L4.1 7.2L8 3.2" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {s}
          </span>
        ))}
      </span>

      {/* Step 3. */}
      <span className="absolute flex items-baseline justify-between" style={{ left: CARD_X, right: PW - CARD_X - CARD_W, top: S3 - 9 }}>
        <span className={`${FONT} font-medium leading-[18px] text-[12.5px]`} style={{ color: INK }}>
          Prospect identified
        </span>
        <span className="flex items-baseline gap-[5px]">
          <span key={count} className={`${FONT} bi-count font-medium leading-[16px] text-[13px] tabular-nums`} style={{ color: INK }}>
            {count}
          </span>
          <span className={`${FONT} leading-[14px] text-[11px]`} style={{ color: MUTE }}>
            this week
          </span>
        </span>
      </span>

      {/* The top step between companies: still listening. */}
      <span
        className="absolute flex items-center justify-center gap-[8px] rounded-[14px]"
        style={{
          left: CARD_X,
          top: CARD1_Y,
          width: CARD_W,
          height: CARD_H,
          opacity: seg(t, T.release + T.sweep + 300, T.release + T.sweep + 700) * (1 - seg(t, LOOP - 380, LOOP - 60)),
          outline: `1.5px dashed rgba(7,41,41,0.22)`,
          outlineOffset: -1.5,
        }}
      >
        <span className="relative block size-[6px]">
          <span className="bi-ping absolute inset-0 rounded-[100px]" style={{ background: INK }} />
          <span className="absolute inset-0 rounded-[100px]" style={{ background: INK }} />
        </span>
        <span className={`${FONT} leading-[16px] text-[12px]`} style={{ color: MUTE }}>
          Listening for the next company…
        </span>
      </span>

      <canvas ref={canvasRef} className="absolute left-0 top-0" style={{ width: PW, height: PH, zIndex: 3 }} />
      {!reduced && <Cursor x={cx} y={cy} pressed={pressed} visible={1} />}
    </div>
  );
}
