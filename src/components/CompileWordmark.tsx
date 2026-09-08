import { useEffect, useMemo, useState } from "react";

type Letter = {
  char: string;
  tx: number;
  ty: number;
  color: string;
  ax: number;
  kx: number;
  px: number;
  ay: number;
  ky: number;
  py: number;
  rotFrom?: number;
  rotTo?: number;
  durMs?: number;
};

const P2 = Math.PI / 2;

/**
 * Each glyph is a Lissajous curve, not a drawn path:
 *   x(t) = 100 + ax * cos(kx * t + px)
 *   y(t) = 100 + ay * cos(ky * t + py)
 * sampled over t = 0..2PI in `steps` segments, centred in a 200x200 box.
 */
const LETTERS: Letter[] = [
  { char: "C", tx: -4, ty: 4, color: "#F76D18", ax: 84.64, kx: 2, px: (5 * Math.PI) / 6, ay: 91.71, ky: 1, py: -P2 },
  { char: "O", tx: 114, ty: 4, color: "#2C9F28", ax: 91.84, kx: 1, px: (5 * Math.PI) / 6, ay: 91.71, ky: 1, py: -P2 },
  { char: "M", tx: 268, ty: 4, color: "#A88D02", ax: 89.91, kx: 1, px: -P2, ay: 89.91, ky: 2, py: -P2 },
  { char: "P", tx: 434, ty: -2, color: "#8C89E7", ax: 91.89, kx: 2, px: 0, ay: 76.42, ky: 3, py: -P2, rotFrom: 0, rotTo: -30, durMs: 1065 },
  { char: "I", tx: 520, ty: 0, color: "#26251E", ax: 89.91, kx: 1, px: P2, ay: 89.91, ky: 1, py: -P2 },
  { char: "L", tx: 637, ty: 22, color: "#916031", ax: 88.24, kx: 1, px: -Math.PI / 6, ay: 75.52, ky: 2, py: -P2, rotFrom: -81, rotTo: -121, durMs: 1299 },
  { char: "E", tx: 773, ty: 4, color: "#2268FF", ax: 90.08, kx: 3, px: 0, ay: 89.91, ky: 1, py: -P2 },
];

function lissajous(l: Letter, steps = 500) {
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = (2 * Math.PI * i) / steps;
    const x = 100 + l.ax * Math.cos(l.kx * t + l.px);
    const y = 100 + l.ay * Math.cos(l.ky * t + l.py);
    d += `${i === 0 ? "M" : " L"}${x.toFixed(2)},${y.toFixed(2)}`;
  }
  return d;
}

export default function CompileWordmark({ delayMs = 2500 }: { delayMs?: number }) {
  const paths = useMemo(() => LETTERS.map((l) => lissajous(l)), []);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSettled(true);
      return;
    }
    const id = window.setTimeout(() => setSettled(true), delayMs);
    return () => window.clearTimeout(id);
  }, [delayMs]);

  return (
    <svg viewBox="0 0 977 200" fill="none" className="w-full stroke-[4px] md:stroke-[3px] lg:stroke-[2px]">
      {LETTERS.map((l, i) => {
        const angle = settled ? l.rotTo ?? 0 : l.rotFrom ?? l.rotTo ?? 0;
        return (
          <g key={l.char} transform={`translate(${l.tx}, ${l.ty})`}>
            <g
              style={{
                transformOrigin: "100px 100px",
                transform: `rotate(${angle}deg)`,
                transition: l.durMs ? `transform ${l.durMs}ms cubic-bezier(0.33, 1, 0.68, 1)` : undefined,
                willChange: "transform",
              }}
            >
              <path d={paths[i]} stroke={l.color} vectorEffect="non-scaling-stroke" />
            </g>
          </g>
        );
      })}
    </svg>
  );
}
