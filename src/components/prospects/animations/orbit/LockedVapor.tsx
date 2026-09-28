import { useEffect, useMemo, useRef, useState } from "react";
import IntentTag, { intentTagColor } from "@/components/IntentTag";
import { FONT, useCompanies, usePrefersReducedMotion, type Company } from "../shared";
import { ellipsize, rng, roundRect } from "./VaporCards";

/**
 * Variation 9 — Locked prospects.
 *
 * Variation 7's vaporise, told as the locked experience it sits inside.
 *
 * At the top, the state the reader is actually in: "No buyers researching
 * your category" — over a small monitoring ring whose arc keeps sweeping, so
 * the empty state reads as a system watching, not a system idle. From it a
 * dotted line runs down to where prospects surface, and each time one is
 * detected a pulse travels down the line and a card rises from the small
 * stack of hidden prospects waiting behind it.
 *
 * The card is a real prospect card, locked: the logo is there but softened,
 * the company's name and category are there but blurred — a deliberate,
 * full-resolution blur, not a pixelated screenshot — with a lock beside them.
 * The intent score is not obscured: it is the product's own Intent tag, the
 * one thing the plan lets you see. Then the card vaporises — its own pixels,
 * blurred name and all, break away on the wave and drift off — and the next
 * hidden prospect comes forward.
 *
 * So the whole panel says one thing: there are buyers here; unlock to see
 * who they are.
 */

const PW = 389;
const PH = 590;
const CARD_W = 300;
const CARD_H = 88;
const CARD_X = Math.round((PW - CARD_W) / 2);
const CARD_Y = 320;
const R = 16;
const PEEK = 9;

const STATUS_Y = 166;
const LINE_TOP = 254;
const LINE_BOTTOM = CARD_Y - 10;

const INK = "#072929";
const TEXT = "#2f2b3d";
const MUTE = "rgba(47,43,61,0.62)";
const HAIR = "rgba(7,41,41,0.14)";

/* The product's Intent tag, measured: 11px medium on an 18px line, 10px by
   2px of padding, radius 6. The canvas copy (which vaporises) and the DOM
   tag (the real component, shown while the card is held) are the same box. */
const TAG = { padX: 10, padY: 2, line: 18, radius: 6, font: "500 11px Inter, sans-serif" };

/* One card's life, in ms. */
const PULSE = [0, 420] as const;
const APPEAR = [380, 1000] as const;
const HOLD_END = 3500;
const SWEEP = 950;
const LIFE = [650, 1100] as const;
const GONE = HOLD_END + SWEEP + LIFE[1] + 80;
const LOOP = GONE + 380;
const STEP = 2;

const PREFERRED = ["Meridian Supply Co.", "Summit Ridge Energy", "Ironclad Construction", "Bowline Freight"];

type Particle = { x: number; y: number; color: string; a: number; delay: number; life: number; vx: number; vy: number; curl: number; phase: number; size: number };
type Prepared = { bitmap: HTMLCanvasElement; particles: Particle[]; withLogo: boolean; tag: { x: number; y: number } };

/** Where the Intent tag sits on the card — shared by the canvas copy and the DOM tag. */
function tagBox(ctx: CanvasRenderingContext2D, score: number) {
  ctx.font = TAG.font;
  const w = Math.ceil(ctx.measureText(`Intent ${score}%`).width) + TAG.padX * 2;
  const h = TAG.line + TAG.padY * 2;
  return { x: CARD_W - 18 - w, y: Math.round((CARD_H - h) / 2), w, h };
}

function drawCard(company: Company, logo: HTMLImageElement | null, dpr: number) {
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

  const tag = tagBox(ctx, company.score);

  /* The logo: present, softened — a company, not yet which one. */
  const lx = 18;
  const ly = (CARD_H - 44) / 2;
  ctx.save();
  roundRect(ctx, lx, ly, 44, 44, 11);
  ctx.clip();
  if (logo && logo.complete && logo.naturalWidth) {
    ctx.filter = "blur(2.2px) saturate(0.85)";
    ctx.drawImage(logo, lx - 3, ly - 3, 50, 50);
    ctx.filter = "none";
  } else {
    ctx.fillStyle = "#eeedf0";
    ctx.fillRect(lx, ly, 44, 44);
  }
  ctx.restore();

  /* Name and category, drawn then blurred at full resolution on their own
     layer, so the obscuring is soft and even — the shape of real words,
     none of the reading. */
  const tx = lx + 44 + 14;
  const maxW = tag.x - tx - 30;
  const layer = document.createElement("canvas");
  layer.width = c.width;
  layer.height = c.height;
  const lctx = layer.getContext("2d")!;
  lctx.scale(dpr, dpr);
  lctx.textBaseline = "alphabetic";
  lctx.font = "600 15px Inter, sans-serif";
  lctx.fillStyle = TEXT;
  const name = ellipsize(lctx, company.name, maxW);
  lctx.fillText(name, tx, CARD_H / 2 - 3);
  const nameW = lctx.measureText(name).width;
  lctx.font = "400 12.5px Inter, sans-serif";
  lctx.fillStyle = MUTE;
  lctx.fillText(ellipsize(lctx, company.industry, maxW), tx, CARD_H / 2 + 15);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.filter = `blur(${(4.2 * dpr).toFixed(1)}px)`;
  ctx.drawImage(layer, 0, 0);
  ctx.filter = "none";
  ctx.restore();

  /* A small lock after the name: obscured on purpose. */
  const kx = Math.min(tx + nameW + 10, tag.x - 22);
  const ky = CARD_H / 2 - 15;
  ctx.save();
  ctx.translate(kx, ky);
  ctx.strokeStyle = "rgba(7,41,41,0.55)";
  ctx.fillStyle = "rgba(7,41,41,0.55)";
  ctx.lineWidth = 1.3;
  roundRect(ctx, 0.5, 5.5, 11, 8, 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(2.8, 5.5);
  ctx.lineTo(2.8, 3.8);
  ctx.arc(6, 3.8, 3.2, Math.PI, 0);
  ctx.lineTo(9.2, 5.5);
  ctx.stroke();
  ctx.restore();

  /* The product's Intent tag, exactly — the one thing left unobscured. */
  roundRect(ctx, tag.x, tag.y, tag.w, tag.h, TAG.radius);
  ctx.fillStyle = intentTagColor(company.score);
  ctx.fill();
  ctx.font = TAG.font;
  ctx.fillStyle = TEXT;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(`Intent ${company.score}%`, tag.x + tag.w / 2, tag.y + tag.h / 2 + 0.5);
  ctx.textAlign = "left";

  return { c, tag: { x: tag.x, y: tag.y } };
}

function particlesOf(bitmap: HTMLCanvasElement, dpr: number, seed: number): Particle[] {
  const img = bitmap.getContext("2d")!.getImageData(0, 0, bitmap.width, bitmap.height).data;
  const rand = rng(seed * 7919 + 53);
  const out: Particle[] = [];
  for (let y = 0; y < CARD_H; y += STEP) {
    for (let x = 0; x < CARD_W; x += STEP) {
      const px = Math.min(bitmap.width - 1, Math.round((x + STEP / 2) * dpr));
      const py = Math.min(bitmap.height - 1, Math.round((y + STEP / 2) * dpr));
      const i = (py * bitmap.width + px) * 4;
      const a = img[i + 3] / 255;
      if (a < 0.08) continue;
      out.push({
        x,
        y,
        color: `rgb(${img[i]},${img[i + 1]},${img[i + 2]})`,
        a,
        delay: (x / CARD_W) * SWEEP + rand() * 170 + (y / CARD_H) * 60,
        life: LIFE[0] + rand() * (LIFE[1] - LIFE[0]),
        vx: 18 + rand() * 46,
        vy: -(34 + rand() * 70),
        curl: 6 + rand() * 12,
        phase: rand() * Math.PI * 2,
        size: STEP * (0.8 + rand() * 0.5),
      });
    }
  }
  return out;
}

export default function LockedVapor() {
  const all = useCompanies(80);
  const reduced = usePrefersReducedMotion();
  const companies = useMemo(() => {
    const preferred = PREFERRED.map(n => all.find(c => c.name === n)).filter((c): c is Company => !!c);
    return [...preferred, ...all.filter(c => !PREFERRED.includes(c.name))].slice(0, 8);
  }, [all]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"pulse" | "in" | "hold" | "vapor" | "gap">(reduced ? "hold" : "pulse");
  const [tagAt, setTagAt] = useState<{ x: number; y: number } | null>(null);
  const logos = useRef(new Map<string, HTMLImageElement>());
  const prepared = useRef(new Map<number, Prepared>());
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    companies.forEach(c => {
      if (logos.current.has(c.id)) return;
      const im = new Image();
      im.src = c.logo;
      logos.current.set(c.id, im);
    });
    let live = true;
    (document.fonts?.ready ?? Promise.resolve()).then(() => live && setFontsReady(true));
    return () => {
      live = false;
    };
  }, [companies]);

  useEffect(() => {
    if (!fontsReady || !companies.length) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = PW * dpr;
    canvas.height = PH * dpr;
    const ctx = canvas.getContext("2d")!;
    const n = companies.length;

    const prepare = (k: number): Prepared => {
      const company = companies[k];
      const logo = logos.current.get(company.id) ?? null;
      const loaded = !!(logo && logo.complete && logo.naturalWidth);
      const hit = prepared.current.get(k);
      if (hit && (hit.withLogo || !loaded)) return hit;
      const { c, tag } = drawCard(company, logo, dpr);
      const p = { bitmap: c, particles: particlesOf(c, dpr, k + 1), withLogo: loaded, tag };
      prepared.current.set(k, p);
      return p;
    };

    let raf = 0;
    const start = performance.now();
    let lastK = -1;
    let lastPhase = "";

    const frame = (now: number) => {
      const elapsed = reduced ? APPEAR[1] + 400 : Math.max(0, now - start);
      const k = Math.floor(elapsed / LOOP);
      const t = elapsed % LOOP;
      const idx = ((k % n) + n) % n;
      const card = prepare(idx);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, PW, PH);

      let ph: "pulse" | "in" | "hold" | "vapor" | "gap";
      if (t < APPEAR[0]) {
        ph = "pulse";
      } else if (t < APPEAR[1]) {
        ph = "in";
        const p = 1 - Math.pow(1 - (t - APPEAR[0]) / (APPEAR[1] - APPEAR[0]), 3);
        ctx.globalAlpha = p;
        ctx.drawImage(card.bitmap, CARD_X, CARD_Y + (1 - p) * PEEK, CARD_W, CARD_H);
        ctx.globalAlpha = 1;
      } else if (t < HOLD_END) {
        ph = "hold";
        ctx.drawImage(card.bitmap, CARD_X, CARD_Y, CARD_W, CARD_H);
      } else if (t < GONE) {
        ph = "vapor";
        const v = t - HOLD_END;
        /* The part the wave has not reached stays the card, crisp. */
        let runY = -1;
        let runX = -1;
        let runEnd = -1;
        const flush = () => {
          if (runX < 0) return;
          ctx.drawImage(card.bitmap, runX * dpr, runY * dpr, (runEnd - runX) * dpr, STEP * dpr, CARD_X + runX, CARD_Y + runY, runEnd - runX, STEP);
          runX = -1;
        };
        for (const q of card.particles) {
          if (q.y !== runY) {
            flush();
            runY = q.y;
          }
          if (v - q.delay <= 0) {
            if (runX >= 0 && q.x === runEnd) runEnd = q.x + STEP;
            else {
              flush();
              runY = q.y;
              runX = q.x;
              runEnd = q.x + STEP;
            }
          } else flush();
        }
        flush();
        for (const q of card.particles) {
          const local = v - q.delay;
          if (local <= 0) continue;
          const p = local / q.life;
          if (p >= 1) continue;
          const s = local / 1000;
          const ease = s * (0.55 + 0.9 * p);
          const x = CARD_X + q.x + q.vx * ease + Math.sin(q.phase + p * 5) * q.curl * p;
          const y = CARD_Y + q.y + q.vy * ease - 16 * p * p;
          const size = q.size * (1 - 0.7 * p);
          ctx.globalAlpha = q.a * Math.pow(1 - p, 1.6);
          ctx.fillStyle = q.color;
          ctx.fillRect(x, y, size, size);
        }
        ctx.globalAlpha = 1;
      } else {
        ph = "gap";
      }

      if (k !== lastK) {
        lastK = k;
        setIndex(idx);
        setTagAt(card.tag);
      }
      if (ph !== lastPhase) {
        lastPhase = ph;
        setPhase(ph);
      }
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [fontsReady, companies, reduced]);

  if (!companies.length) return null;
  const company = companies[index] ?? companies[0];
  const cardUp = phase === "in" || phase === "hold";
  const pulseKey = `pulse-${index}-${phase === "pulse" ? "on" : "off"}`;

  return (
    <div className="relative size-full overflow-hidden" aria-hidden data-name="Animation / Locked prospects">
      {/* The state the reader is in, and the system still watching. */}
      <div className="absolute left-0 right-0 flex flex-col items-center gap-[14px]" style={{ top: STATUS_Y }}>
        <span className="relative block size-[34px]">
          <span className="absolute inset-0 rounded-[100px]" style={{ boxShadow: `inset 0 0 0 1.5px ${HAIR}` }} />
          <svg className="bi-sweep absolute inset-0" width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden>
            <path d="M17 1.75A15.25 15.25 0 0 1 32.25 17" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="absolute left-1/2 top-1/2 -ml-[3px] -mt-[3px] block size-[6px]">
            <span className="bi-ping absolute inset-0 rounded-[100px]" style={{ background: INK }} />
            <span className="absolute inset-0 rounded-[100px]" style={{ background: INK }} />
          </span>
        </span>
        <span className={`${FONT} text-center font-semibold leading-[22px] text-[16px]`} style={{ color: INK }}>
          No buyers researching your category
        </span>
      </div>

      {/* The line from the watching state down to where prospects surface. */}
      <span
        className="absolute w-0"
        style={{ left: PW / 2, top: LINE_TOP, height: LINE_BOTTOM - LINE_TOP, borderLeft: "1.5px dashed rgba(7,41,41,0.2)" }}
      />
      {phase === "pulse" && !reduced && (
        <span
          key={pulseKey}
          className="bi-detect absolute block size-[8px] rounded-[100px]"
          style={{ left: PW / 2 - 3.25, top: LINE_TOP, background: INK, ["--travel" as string]: `${LINE_BOTTOM - LINE_TOP - 8}px` }}
        />
      )}

      {/* The hidden prospects waiting behind the one surfaced. */}
      {[2, 1].map(d => (
        <span
          key={d}
          className="absolute rounded-[16px] bg-white"
          style={{
            left: CARD_X + d * 8,
            width: CARD_W - d * 16,
            top: CARD_Y + CARD_H - 30 + d * PEEK,
            height: 30,
            boxShadow: `0 0 0 1px rgba(47,43,61,0.06), 0px ${4 + d * 2}px 14px 0px rgba(7,41,41,0.06)`,
            /* Only ever seen as edges under a surfaced card. */
            opacity: phase === "hold" ? 1 - d * 0.28 : 0,
            transition: `opacity ${phase === "hold" ? 360 : 200}ms cubic-bezier(0.4,0.05,0.2,1)`,
          }}
        />
      ))}

      {/* The surfaced card's shadow, under the canvas so the dust is only the card. */}
      <div
        className="absolute rounded-[16px]"
        style={{
          left: CARD_X,
          top: CARD_Y,
          width: CARD_W,
          height: CARD_H,
          boxShadow: "0px 1px 2px 0px rgba(7,41,41,0.05), 0px 12px 30px 0px rgba(7,41,41,0.1)",
          opacity: cardUp ? 1 : 0,
          transition: `opacity ${cardUp ? 500 : 380}ms cubic-bezier(0.4,0.05,0.2,1)`,
        }}
      />
      <canvas ref={canvasRef} className="absolute left-0 top-0" style={{ width: PW, height: PH }} />

      {/* While the card is held, its Intent tag is the product component itself. */}
      {phase === "hold" && tagAt && (
        <span className="absolute" style={{ left: CARD_X + tagAt.x, top: CARD_Y + tagAt.y }}>
          <IntentTag score={company.score} />
        </span>
      )}
    </div>
  );
}
