import { useEffect, useId, useRef, useState } from "react";
import svgPaths from "@/imports/BuyerActivityLeads/svg-ry772luhk7";
import avatarElena from "@/data/assets/avatar-elena.png";
import avatarJames from "@/data/assets/avatar-james.png";
import avatarMarcus from "@/data/assets/avatar-marcus.png";
import avatarDaniel from "@/data/assets/avatar-daniel.png";
import "./ProspectsEmptyState.css";

/**
 * The Prospects page's empty state — "Buyer pulled into Jira", handoff
 * option 6a (design_handoff_prospects_empty_state).
 *
 * Shown in place of the prospect list when a vendor has no prospects yet. A
 * 14-second loop tells how a prospect comes to exist: buyers browse Software
 * Finder on the outer ring, one opens the Jira page and lights up, is pulled
 * in ring by ring and touches down on the product, a qualifying ring runs
 * round the pair, and the two lift off as one chip into Jira's prospect tray —
 * the slot fills, the count ticks 0 → 1, and an Assigned tag pops. Under it,
 * the heading and subline the handoff carries.
 *
 * The stage is the reference's 640 x 400, element for element and pixel for
 * pixel; the README's timing table is the keyframes in the stylesheet beside
 * this file. Two substitutions, both the README's own instruction: the buyers
 * are the module's in-house avatars rather than pravatar placeholders, and the
 * Jira mark is the vector the sidebar already draws rather than a CDN icon.
 * The copy takes the app's own ink and type, which are the tokens the slate
 * values stand in for.
 *
 * Decorative throughout: the stage is aria-hidden and the heading and subline
 * are the accessible content. Under prefers-reduced-motion the loop is parked
 * on its final frame — see the stylesheet.
 */

/* The stage's own size. Everything inside is positioned against these. */
const STAGE_W = 640;
const STAGE_H = 400;

/** The Jira mark, at any size, from the paths the sidebar's product header draws. */
function JiraMark({ size }: { size: number }) {
  /* Gradient ids are document-global; several marks on one stage need their own. */
  const id = useId();
  const g0 = `${id}-g0`;
  const g1 = `${id}-g1`;
  return (
    <svg
      aria-hidden
      className="block"
      fill="none"
      height={size}
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 25.716 25.6799"
      width={size}
    >
      <path d={svgPaths.p647e100} fill="#0082FF" />
      <path d={svgPaths.p35c0d300} fill={`url(#${g0})`} />
      <path d={svgPaths.p19c54100} fill={`url(#${g1})`} />
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id={g0} x1="19.3161" x2="14.0476" y1="6.18632" y2="11.6196">
          <stop offset="0.18" stopColor="#0050D3" />
          <stop offset="1" stopColor="#0082FF" />
        </linearGradient>
        <linearGradient gradientUnits="userSpaceOnUse" id={g1} x1="13.5374" x2="7.44517" y1="12.3913" y2="18.3188">
          <stop offset="0.18" stopColor="#0050D3" />
          <stop offset="1" stopColor="#0082FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** A round photo, the size the slot asks for. */
function Avatar({ src, size }: { src: string; size: number }) {
  return (
    <img
      alt=""
      className="block rounded-full object-cover"
      height={size}
      src={src}
      style={{ width: size, height: size }}
      width={size}
    />
  );
}

/**
 * One of the three faded buyers on the outer ring. A zero-size pivot at the
 * planet's centre turns; a child pushed out by the radius carries the avatar;
 * the avatar turns back so the photo and its tag stay upright.
 */
function BackgroundBuyer({ angle, avatar, tag }: { angle: number; avatar: string; tag: string }) {
  const a = { "--a": `${angle}deg` } as React.CSSProperties;
  return (
    <div className="absolute" data-pes="sat" style={{ left: 320, top: 172, width: 0, height: 0, ...a }}>
      <div className="absolute" style={{ left: -14, top: -14, width: 28, height: 28, transform: "translateX(150px)" }}>
        <div className="absolute inset-0" data-pes="sat-counter" style={a}>
          <div className="absolute inset-0 rounded-full" style={{ boxShadow: "0 0 0 2px #fff", opacity: 0.38, filter: "grayscale(1)" }}>
            <Avatar size={28} src={avatar} />
          </div>
          <div
            className="absolute whitespace-nowrap rounded-[5px] font-['Inter',sans-serif] font-medium"
            style={{
              left: 34, top: 5, height: 18, padding: "0 7px", background: "#f1f4f8",
              fontSize: 9.5, lineHeight: "18px", color: "#8a94a6", opacity: 0.8,
            }}
          >
            {tag}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The 640 x 400 loop, scaled to fit whatever width it is given. */
function Stage() {
  /* The stage never reflows — the README is explicit. If the column is
     narrower than 640 it is scaled down as one picture, so the aspect and
     every internal distance hold. Measured rather than derived in CSS: a
     unitless length ratio in calc() is not something every engine will do. */
  const host = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / STAGE_W));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      aria-hidden
      className="relative w-full overflow-hidden rounded-[12px]"
      ref={host}
      style={{ maxWidth: STAGE_W, height: STAGE_H * scale }}
    >
      {/* No fill of its own: the reference drew a white-to-#f7f8fa radial
          behind the stage, which on the panel's white read as a grey card
          inside a white one. Dropped by request, so the loop plays straight
          on the panel. */}
      <div
        className="pes-stage absolute left-0 top-0"
        style={{
          width: STAGE_W, height: STAGE_H,
          transform: `scale(${scale})`, transformOrigin: "0 0",
        }}
      >
        <div className="absolute inset-0" data-pes="loop">
          {/* Orbit rings and the glow field, all centred on C = (320, 172). */}
          <div className="absolute rounded-full" style={{ left: 170, top: 22, width: 300, height: 300, border: "1.5px dashed #e3e7ec" }} />
          <div className="absolute rounded-full" style={{ left: 224, top: 76, width: 192, height: 192, border: "1.5px dashed #e9edf1" }} />
          <div className="absolute rounded-full" style={{ left: 200, top: 52, width: 240, height: 240, background: "radial-gradient(circle, rgba(37,99,235,.06), transparent 70%)" }} />

          {/* Three buyers browsing other categories, faded, on the outer ring. */}
          <BackgroundBuyer angle={40} avatar={avatarJames} tag="CRM" />
          <BackgroundBuyer angle={150} avatar={avatarMarcus} tag="Payroll" />
          <BackgroundBuyer angle={225} avatar={avatarDaniel} tag="Analytics" />

          {/* Jira: a 64px tile at the centre. Takes a halo while qualifying. */}
          <div
            className="absolute flex items-center justify-center bg-white"
            data-pes="surface"
            style={{ left: 288, top: 140, width: 64, height: 64, borderRadius: 17 }}
          >
            <JiraMark size={35} />
          </div>

          {/* The focus buyer's rig: fades out in place once the chip lifts. */}
          <div className="absolute inset-0" data-pes="hide-buyer">
            <div className="absolute" data-pes="spin" style={{ left: 320, top: 172, width: 0, height: 0 }}>
              {/* Tether, from the centre out to the buyer; rotates with it. */}
              <div
                className="absolute"
                data-pes="tether"
                style={{
                  left: 0, top: -1, height: 2, borderRadius: 1,
                  background: "linear-gradient(90deg, rgba(37,99,235,0), rgba(37,99,235,.55))",
                  transformOrigin: "left center",
                }}
              />
              {/* Pushed out by the current orbit radius, and turned back upright. */}
              <div className="absolute" data-pes="radius" style={{ left: -20, top: -20, width: 40, height: 40 }}>
                <div className="absolute inset-0" data-pes="counter-spin">
                  <div
                    className="absolute inset-0 rounded-full"
                    data-pes="wake"
                    style={{ boxShadow: "0 0 0 2.5px #fff, 0 8px 18px rgba(16,24,40,.2)" }}
                  >
                    <Avatar size={40} src={avatarElena} />
                  </div>
                  {/* "Project mgmt" — bare text, no pill — goes as the buyer wakes. */}
                  <div
                    className="absolute whitespace-nowrap font-['Inter',sans-serif] font-medium"
                    data-pes="chip-out"
                    style={{ left: 46, top: 11, height: 18, fontSize: 9.5, lineHeight: "18px", color: "#8a94a6" }}
                  >
                    Project mgmt
                  </div>
                  {/* …and the Jira label springs in where it was. */}
                  <div
                    className="absolute flex items-center whitespace-nowrap"
                    data-pes="chip-in"
                    style={{ left: 44, top: 8, height: 24, gap: 6 }}
                  >
                    <JiraMark size={13} />
                    <span className="font-['Inter',sans-serif] font-semibold" style={{ fontSize: 11, lineHeight: 1, color: "#2f2b3d" }}>
                      Jira
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Qualifying ring: r = 76 around (350, 172), a 28/72 dash, rotating. */}
          <svg className="absolute" data-pes="qualify" height="180" style={{ left: 260, top: 82 }} viewBox="0 0 180 180" width="180">
            <circle cx="90" cy="90" fill="none" pathLength="100" r="76" stroke="#2563eb" strokeDasharray="28 72" strokeLinecap="round" strokeWidth="2" />
          </svg>

          {/* Lift-off chip: buyer + Jira as one pill, from the landing spot to the tray. */}
          <div
            className="absolute flex items-center whitespace-nowrap bg-white"
            data-pes="lift"
            style={{
              left: 362, top: 154, height: 36, padding: "0 9px 0 3px", borderRadius: 999, gap: 7,
              boxShadow: "0 0 0 1px #e2e6eb, 0 10px 24px rgba(16,24,40,.16)",
            }}
          >
            <div className="overflow-hidden rounded-full" style={{ width: 30, height: 30 }}>
              <Avatar size={30} src={avatarElena} />
            </div>
            <JiraMark size={14} />
          </div>

          {/* The prospect tray: Jira's tile, three slots, and the count. */}
          <div
            className="absolute box-border flex items-center bg-white"
            data-pes="tray"
            style={{
              left: 190, top: 340, width: 260, height: 48, borderRadius: 14, gap: 10,
              padding: "0 14px 0 10px", border: "1px solid #e6e9ee",
            }}
          >
            <div
              className="relative flex flex-none items-center justify-center bg-white"
              style={{ width: 28, height: 28, borderRadius: 7, boxShadow: "0 1px 3px rgba(16,24,40,.14)" }}
            >
              <JiraMark size={15} />
            </div>
            {/* First slot: the dashed placeholder gives way to the arriving buyer. */}
            <div className="relative flex-none" style={{ width: 30, height: 30 }}>
              <div className="absolute inset-0 rounded-full" data-pes="slot-dash" style={{ border: "1.5px dashed #cbd5e1" }} />
              <div className="absolute inset-0 overflow-hidden rounded-full" data-pes="slot-in" style={{ boxShadow: "0 0 0 2px #fff" }}>
                <Avatar size={30} src={avatarElena} />
              </div>
            </div>
            <div className="box-border flex-none rounded-full" style={{ width: 30, height: 30, border: "1.5px dashed #e3e7ec" }} />
            <div className="box-border flex-none rounded-full" style={{ width: 30, height: 30, border: "1.5px dashed #eceff3" }} />
            {/* Counter: a two-line stack slides up inside a 20px window, 0 → 1. */}
            <div className="ml-auto">
              <div
                className="overflow-hidden font-semibold"
                style={{ height: 20, fontSize: 14, lineHeight: "20px", fontFamily: "ui-monospace, Menlo, monospace", color: "#94a3b8" }}
              >
                <div data-pes="count">
                  <div>0</div>
                  <div style={{ color: "#0f766e" }}>1</div>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned — pops in last, over the tray. */}
          <div
            className="absolute whitespace-nowrap font-['Inter',sans-serif] font-semibold text-white"
            data-pes="assigned"
            style={{
              left: 258, top: 318, height: 22, padding: "0 9px", borderRadius: 999, background: "#0f766e",
              fontSize: 10.5, lineHeight: "22px", letterSpacing: "0.02em",
              boxShadow: "0 6px 14px rgba(15,118,110,.28)",
            }}
          >
            Assigned
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProspectsEmptyState() {
  return (
    /* The handoff's panel: white, a hairline, 16 radius, a whisper of shadow,
       the stage and the copy stacked 20px apart. */
    <div
      className="flex w-full flex-col items-center bg-white"
      data-name="Prospects Empty State"
      style={{
        gap: 20, padding: "40px 24px 48px", borderRadius: 16,
        border: "1px solid #eef0f3", boxShadow: "0 1px 2px rgba(16,24,40,.05)",
      }}
    >
      <Stage />
      <div className="flex flex-col items-center text-center" style={{ gap: 7, maxWidth: 520 }}>
        <h2 className="m-0 font-['Inter',sans-serif] font-semibold text-[#2f2b3d]" style={{ fontSize: 24, lineHeight: 1.3 }}>
          No Prospects Found
        </h2>
        <p className="m-0 font-['Inter',sans-serif] font-normal text-[rgba(47,43,61,0.7)]" style={{ fontSize: 15, lineHeight: 1.5, textWrap: "pretty" }}>
          Prospects appear here once buyers engage with your profile or similar products.
        </p>
      </div>
    </div>
  );
}
