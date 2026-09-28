import { useEffect, useMemo, useRef, useState } from "react";
import IntentTag, { intentTagColor } from "@/components/IntentTag";
import { FONT, useCompanies, usePrefersReducedMotion, type Company } from "../shared";

/**
 * Variation 7 — Vaporize.
 *
 * One prospect at a time. A card surfaces — the company's logo, its name, its
 * category, its intent — settles, and is held long enough to read. Then it is
 * vaporised: a wave passes across it and, wherever the wave has reached, the
 * card comes apart into fine dust that lifts and drifts away on a slight
 * curl, thinning as it goes, while everything the wave has not reached stays
 * perfectly intact. When the last of it is gone there is a breath of empty
 * space, and the next prospect surfaces. Buyer Intelligence, continuously
 * surfacing who is researching you.
 *
 * The effect follows the interaction language of hiding an item in a
 * browser's distraction control: not a fade, not a scale — the element's own
 * pixels break away. So the card is drawn to a canvas, and the dust is made of
 * the card: each particle is a 2px sample of its real pixels, logo and type
 * included, released when the wave reaches it.
 */

const PW = 389;
const PH = 590;
const CARD_W = 320;
const CARD_W_7 = CARD_W;
const CARD_H = 88;
const CARD_X = Math.round((PW - CARD_W) / 2);
const CARD_Y_7 = 250;
const R = 16;

const INK = "#072929";
const TEXT = "#2f2b3d";
const MUTE = "rgba(47,43,61,0.62)";
const LIME = "#B1FA63";
/* The intent green, deep enough to read as a mark on white. */
const INTENT = "#5DBB1E";

/* One card's life, in ms. */
const APPEAR = 650;
const HOLD_END = 3300;
const SWEEP = 950; // the wave crossing the card
const LIFE = [650, 1100] as const; // a particle's flight
const GONE = HOLD_END + SWEEP + LIFE[1] + 80;
const LOOP = GONE + 450;

const STEP = 2; // particle pitch, css px

const PREFERRED = ["Meridian Supply Co.", "Summit Ridge Energy", "Ironclad Construction", "Bowline Freight"];

type Particle = {
  x: number;
  y: number;
  color: string;
  a: number;
  delay: number;
  life: number;
  vx: number;
  vy: number;
  curl: number;
  phase: number;
  size: number;
};

type Prepared = { bitmap: HTMLCanvasElement; particles: Particle[]; withLogo: boolean; tag: { x: number; y: number } | null };

/* The refined card (Variation 11) carries the product's Intent tag, measured
   from the component: 11px medium on an 18px line, 10px by 2px of padding,
   radius 6, the intentTagColor fill. The card is 20px wider than Variation
   7's, and its name half a point smaller, so every company name still fits
   beside the tag. */
const REFINED_W = 340;
const TAG = { padX: 10, padY: 2, line: 18, radius: 6, font: "500 11px Inter, sans-serif" };

/* A small deterministic random, so every loop of a card vaporises the same way. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function ellipsize(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > max) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}

/** The card, drawn at device resolution — the same card the dust is made of. */
function drawCard(company: Company, logo: HTMLImageElement | null, dpr: number, refined = false): { c: HTMLCanvasElement; tag: { x: number; y: number } | null } {
  const CARD_W = refined ? REFINED_W : CARD_W_7;
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

  /* Logo. */
  const lx = 18;
  const ly = (CARD_H - 44) / 2;
  ctx.save();
  roundRect(ctx, lx, ly, 44, 44, 11);
  ctx.clip();
  if (logo && logo.complete && logo.naturalWidth) {
    ctx.drawImage(logo, lx, ly, 44, 44);
  } else {
    ctx.fillStyle = "#eeedf0";
    ctx.fillRect(lx, ly, 44, 44);
  }
  ctx.restore();

  if (refined) {
    /* The product's Intent tag, exactly. */
    ctx.font = TAG.font;
    const label = `Intent ${company.score}%`;
    const w = Math.ceil(ctx.measureText(label).width) + TAG.padX * 2;
    const h = TAG.line + TAG.padY * 2;
    const x = CARD_W - 18 - w;
    const y = Math.round((CARD_H - h) / 2);
    roundRect(ctx, x, y, w, h, TAG.radius);
    ctx.fillStyle = intentTagColor(company.score);
    ctx.fill();
    ctx.fillStyle = TEXT;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(label, x + w / 2, y + h / 2 + 0.5);
    ctx.textAlign = "left";
    const tx = lx + 44 + 14;
    const maxW = x - tx - 12;
    ctx.textBaseline = "alphabetic";
    ctx.font = "600 14.5px Inter, sans-serif";
    ctx.fillStyle = TEXT;
    ctx.fillText(ellipsize(ctx, company.name, maxW), tx, CARD_H / 2 - 3);
    ctx.font = "400 12.5px Inter, sans-serif";
    ctx.fillStyle = MUTE;
    ctx.fillText(ellipsize(ctx, company.industry, maxW), tx, CARD_H / 2 + 15);
    return { c, tag: { x, y } };
  }

  /* Intent, right: the score as a figure, labelled beneath in the
     product's intent green. */
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  const rx = CARD_W - 20;
  ctx.font = "600 18px Inter, sans-serif";
  ctx.fillStyle = TEXT;
  ctx.fillText(`${company.score}%`, rx, CARD_H / 2 - 1);
  ctx.font = "500 11px Inter, sans-serif";
  const label = "Intent";
  const lw = ctx.measureText(label).width;
  ctx.fillStyle = MUTE;
  ctx.fillText(label, rx, CARD_H / 2 + 15);
  ctx.beginPath();
  ctx.arc(rx - lw - 7, CARD_H / 2 + 11, 3, 0, Math.PI * 2);
  ctx.fillStyle = INTENT;
  ctx.fill();
  ctx.font = "600 18px Inter, sans-serif";
  const cx = rx - Math.max(ctx.measureText(`${company.score}%`).width, lw + 13);
  ctx.textAlign = "left";

  /* Name and category. */
  const tx = lx + 44 + 14;
  const maxW = cx - tx - 14;
  ctx.textBaseline = "alphabetic";
  ctx.font = "600 15px Inter, sans-serif";
  ctx.fillStyle = TEXT;
  ctx.fillText(ellipsize(ctx, company.name, maxW), tx, CARD_H / 2 - 3);
  ctx.font = "400 12.5px Inter, sans-serif";
  ctx.fillStyle = MUTE;
  ctx.fillText(ellipsize(ctx, company.industry, maxW), tx, CARD_H / 2 + 15);
  return { c, tag: null };
}

/** The card's own pixels, as dust waiting to be released. */
function particlesOf(bitmap: HTMLCanvasElement, dpr: number, seed: number): Particle[] {
  const CARD_W = Math.round(bitmap.width / dpr);
  const ctx = bitmap.getContext("2d")!;
  const img = ctx.getImageData(0, 0, bitmap.width, bitmap.height).data;
  const rand = rng(seed * 7919 + 17);
  const out: Particle[] = [];
  for (let y = 0; y < CARD_H; y += STEP) {
    for (let x = 0; x < CARD_W; x += STEP) {
      const px = Math.min(bitmap.width - 1, Math.round((x + STEP / 2) * dpr));
      const py = Math.min(bitmap.height - 1, Math.round((y + STEP / 2) * dpr));
      const i = (py * bitmap.width + px) * 4;
      const a = img[i + 3] / 255;
      if (a < 0.08) continue;
      /* The wave: left to right, its edge ragged so it reads as matter
         breaking, not a wipe. Rows near the top go a touch earlier. */
      const edge = (x / CARD_W) * SWEEP + rand() * 170 + (y / CARD_H) * 60;
      out.push({
        x,
        y,
        color: `rgb(${img[i]},${img[i + 1]},${img[i + 2]})`,
        a,
        delay: edge,
        life: LIFE[0] + rand() * (LIFE[1] - LIFE[0]),
        /* Up and away, drifting with the wave. */
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

/**
 * `refined` is Variation 11: Variation 7 exactly, with its running count moved
 * to the top as the panel's status line and the product's Intent tag on the
 * card. Variation 7 renders with it off, unchanged.
 */
/**
 * `native` is Variation 13: Variation 11 polished. While the card is on
 * screen it is real UI — the logo an image, the name and category text, the
 * Intent tag the product component — so it is as sharp as the rest of the
 * page at any zoom or pixel ratio; the canvas takes over only at the instant
 * the vaporise begins, from a copy drawn at 2–3x so the dust is crisp too.
 * The "Prospect identified" line is gone and the count carries its type.
 */
export default function VaporCards({ refined: refinedProp = false, native = false }: { refined?: boolean; native?: boolean }) {
  const refined = refinedProp || native;
  const CARD_W = refined ? REFINED_W : CARD_W_7;
  const CARD_X = Math.round((PW - CARD_W) / 2);
  const CARD_Y = refined ? 286 : CARD_Y_7;
  const all = useCompanies(80);
  const reduced = usePrefersReducedMotion();
  const companies = useMemo(() => {
    const preferred = PREFERRED.map(n => all.find(c => c.name === n)).filter((c): c is Company => !!c);
    const rest = all.filter(c => !PREFERRED.includes(c.name));
    return [...preferred, ...rest].slice(0, 8);
  }, [all]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "hold" | "vapor" | "gap">(reduced ? "hold" : "in");
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
    let done = false;
    const ready = () => !done && setFontsReady(true);
    (document.fonts?.ready ?? Promise.resolve()).then(ready);
    return () => {
      done = true;
    };
  }, [companies]);

  useEffect(() => {
    if (!fontsReady || !companies.length) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = native ? Math.min(Math.max(window.devicePixelRatio || 1, 2), 3) : Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = PW * dpr;
    canvas.height = PH * dpr;
    const ctx = canvas.getContext("2d")!;

    /* Each card is drawn and sampled once — again only if its logo arrives
       after the first drawing. */
    const prepare = (k: number): Prepared => {
      const company = companies[k];
      const logo = logos.current.get(company.id) ?? null;
      const loaded = !!(logo && logo.complete && logo.naturalWidth);
      const hit = prepared.current.get(k);
      if (hit && (hit.withLogo || !loaded)) return hit;
      const { c: bitmap, tag } = drawCard(company, logo, dpr, refined);
      const p = { bitmap, particles: particlesOf(bitmap, dpr, k + 1), withLogo: loaded, tag };
      prepared.current.set(k, p);
      return p;
    };

    let raf = 0;
    const start = performance.now();
    let lastIndex = -1;
    let lastPhase = "";

    const frame = (now: number) => {
      /* The first frame's timestamp can fall just before `start`; never let
         time run negative. */
      const elapsed = reduced ? APPEAR + 400 : Math.max(0, now - start);
      const k = Math.floor(elapsed / LOOP);
      const t = elapsed % LOOP;
      const card = prepare(((k % companies.length) + companies.length) % companies.length);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, PW, PH);

      let ph: "in" | "hold" | "vapor" | "gap";
      if (native && t < HOLD_END) {
        /* The card on screen is the real UI; the canvas stays clear. */
        ph = t < APPEAR ? "in" : "hold";
      } else if (t < APPEAR) {
        ph = "in";
        const p = 1 - Math.pow(1 - t / APPEAR, 3);
        ctx.globalAlpha = p;
        ctx.drawImage(card.bitmap, CARD_X, CARD_Y + (1 - p) * 12, CARD_W, CARD_H);
        ctx.globalAlpha = 1;
      } else if (t < HOLD_END) {
        ph = "hold";
        ctx.drawImage(card.bitmap, CARD_X, CARD_Y, CARD_W, CARD_H);
      } else if (t < GONE) {
        ph = "vapor";
        const v = t - HOLD_END;
        /* What the wave has not reached stays the card itself — drawn from
           the crisp bitmap in runs along each row, so its type stays sharp
           right up to the ragged edge where it breaks away. */
        let runY = -1;
        let runX = -1;
        let runEnd = -1;
        const flush = () => {
          if (runX < 0) return;
          const w = runEnd - runX;
          ctx.drawImage(card.bitmap, runX * dpr, runY * dpr, w * dpr, STEP * dpr, CARD_X + runX, CARD_Y + runY, w, STEP);
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
          /* Released: a quick lift, then drift — accelerating up and away,
             curling as it goes, shrinking and thinning to nothing. */
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

      if (k !== lastIndex) {
        lastIndex = k;
        setIndex(k);
      }
      if (ph !== lastPhase) {
        lastPhase = ph;
        setPhase(ph);
      }
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsReady, companies, reduced, refined, native]);

  if (!companies.length) return null;
  /* Variation 13 counts up from 22; the earlier variations from 11. */
  const count = (native ? 22 : 11) + (index % 30);
  const current = companies[((index % companies.length) + companies.length) % companies.length];
  const tag = refined ? prepared.current.get(((index % companies.length) + companies.length) % companies.length)?.tag ?? null : null;
  const shadowOn = phase === "hold" || phase === "in";

  return (
    <div className="relative size-full overflow-hidden" aria-hidden data-name="Animation / Vaporize">
      {/* The card's shadow lives under the canvas, so the dust is only the card. */}
      <div
        className="absolute rounded-[16px]"
        style={{
          left: CARD_X,
          top: CARD_Y,
          width: CARD_W,
          height: CARD_H,
          boxShadow: "0px 1px 2px 0px rgba(7,41,41,0.05), 0px 12px 30px 0px rgba(7,41,41,0.1)",
          opacity: shadowOn ? 1 : 0,
          transition: `opacity ${shadowOn ? 500 : 380}ms cubic-bezier(0.4,0.05,0.2,1)`,
        }}
      />
      <canvas ref={canvasRef} className="absolute left-0 top-0" style={{ width: PW, height: PH }} />

      {/* The card itself, as native UI, while it is on screen (Variation 13). */}
      {native && (phase === "in" || phase === "hold") && (
        <div
          key={`card-${index}`}
          className="bi-card-in absolute flex items-center overflow-hidden rounded-[16px] bg-white"
          style={{
            left: CARD_X,
            top: CARD_Y,
            width: CARD_W,
            height: CARD_H,
            paddingLeft: 18,
            paddingRight: 18,
            gap: 14,
            boxShadow: "inset 0 0 0 1px rgba(47,43,61,0.08)",
          }}
        >
          <img alt="" src={current.logo} className="block size-[44px] shrink-0 rounded-[11px] object-cover" />
          <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
            <span className={`${FONT} truncate font-semibold leading-[18px] text-[14.5px]`} style={{ color: TEXT }}>
              {current.name}
            </span>
            <span className={`${FONT} truncate leading-[16px] text-[12.5px]`} style={{ color: MUTE }}>
              {current.industry}
            </span>
          </span>
          <IntentTag score={current.score} />
        </div>
      )}

      {/* What is happening, above the card. */}
      {!native && (
      <span
        className="absolute flex items-center gap-[8px]"
        style={{
          left: CARD_X + 2,
          top: CARD_Y - 34,
          opacity: phase === "hold" ? 1 : 0,
          transform: phase === "hold" ? "none" : "translateY(4px)",
          transition: "opacity 400ms cubic-bezier(0.4,0.05,0.2,1), transform 400ms cubic-bezier(0.4,0.05,0.2,1)",
        }}
      >
        <span className="relative block size-[6px]">
          <span className="bi-ping absolute inset-0 rounded-[100px]" style={{ background: "#6bbf1e" }} />
          <span className="absolute inset-0 rounded-[100px]" style={{ background: "#6bbf1e" }} />
        </span>
        <span className={`${FONT} font-medium leading-[16px] text-[12px]`} style={{ color: INK }}>
          Prospect identified
        </span>
        <span className={`${FONT} leading-[16px] text-[11.5px]`} style={{ color: MUTE }}>
          just now
        </span>
      </span>
      )}

      {/* While the card is held, its Intent tag is the product component itself. */}
      {refined && !native && phase === "hold" && tag && (
        <span className="absolute" style={{ left: CARD_X + tag.x, top: CARD_Y + tag.y }}>
          <IntentTag score={current.score} />
        </span>
      )}

      {/* Variation 13: the count in the removed line's type, its live dot now on the left. */}
      {native && (
        <span className="absolute left-0 right-0 flex items-center justify-center gap-[8px]" style={{ top: CARD_Y - 40 }}>
          <span className="relative block size-[6px] shrink-0">
            {/* The modal's checkmark-circle green, #B1FA63 (tokens.css --color-accent). */}
            <span className="bi-ping absolute inset-0 rounded-[100px]" style={{ background: LIME }} />
            <span className="absolute inset-0 rounded-[100px]" style={{ background: LIME }} />
          </span>
          <span className={`${FONT} font-medium leading-[16px] text-[12px] tabular-nums`} style={{ color: INK }}>
            <span key={count} className="bi-count">{count}</span> Buyers researching your category
          </span>
        </span>
      )}

      {/* The running count: at the foot in Variation 7, the status line at the top in Variation 11. */}
      {!native && (
      <span className="absolute left-0 right-0 flex justify-center" style={{ top: refined ? CARD_Y - 96 : PH - 64 }}>
        <span className="flex items-baseline gap-[6px]">
          <span key={count} className={`${FONT} bi-count font-medium leading-[20px] text-[15px] tabular-nums`} style={{ color: INK }}>
            {count}
          </span>
          <span className={`${FONT} leading-[14px] text-[11.5px]`} style={{ color: MUTE }}>
            prospects surfaced this week
          </span>
          <span className="ml-[2px] block size-[6px] self-center rounded-[100px]" style={{ background: LIME }} />
        </span>
      </span>
      )}
    </div>
  );
}
