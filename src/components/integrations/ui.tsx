/**
 * The Integrations page's own controls and marks, shared by the API key flow,
 * the CRM connect flow and the Manage view, so every dialog on the page speaks
 * one language: the ink and outline buttons, the frosted dialog, the 1.5 stroke
 * icons in the page's ink.
 */

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

export const INK = "#2f2b3d";
export const DEEP = "#072929";
export const MUTED = "rgba(47,43,61,0.7)";
export const FAINT = "rgba(47,43,61,0.45)";
export const HAIR = "rgba(47,43,61,0.1)";
export const WASH = "rgba(7,41,41,0.06)";
export const MINT = "#C3FFC9";
/** The brand's limelight green. */
export const LIME = "#B1FA63";
export const SUCCESS = "#24b364";
export const DANGER = "#ff4c51";
export const FONT = "font-['Inter',sans-serif]";
export const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/* ── icons ── */

export function KeyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="block">
      <circle cx="8" cy="15" r="4" stroke={INK} strokeWidth="1.5" />
      <path d="M10.8 12.2 19 4M16 7l2.5 2.5M13.5 9.5 16 12" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden className="block">
      <path d="M10 5.5c-1.4-1.2-3.4-1.6-6.5-1.5v11c3.1-.1 5.1.3 6.5 1.5 1.4-1.2 3.4-1.6 6.5-1.5V4c-3.1-.1-5.1.3-6.5 1.5Zm0 0v11" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/** A small document mark that takes the link's colour, for "View … Docs" links (Hightouch's pattern). */
export function DocsIcon() {
  return (
    /* The same open book as the API docs strip (BookIcon), at 15.2px in the link's colour; 1.6 on the 20 grid keeps its line weight. */
    <svg width="15.2" height="15.2" viewBox="0 0 20 20" fill="none" aria-hidden className="block shrink-0">
      <path d="M10 5.5c-1.4-1.2-3.4-1.6-6.5-1.5v11c3.1-.1 5.1.3 6.5 1.5 1.4-1.2 3.4-1.6 6.5-1.5V4c-3.1-.1-5.1.3-6.5 1.5Zm0 0v11" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="block">
      <path d="M4 10 10 4M5.5 4H10v4.5" stroke={DEEP} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowRightIcon({ color = FAINT }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="block shrink-0">
      <path d="M2.5 7h9M8 3.5 11.5 7 8 10.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="block transition-transform" style={{ transform: open ? "rotate(180deg)" : undefined }}>
      <path d="m4 6 4 4 4-4" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({ color = DEEP, size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden className="block shrink-0">
      <path d="m3.5 8.5 3 3 6-6.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="block">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke={DEEP} strokeWidth="1.4" />
      <path d="M10.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" stroke={DEEP} strokeWidth="1.4" />
    </svg>
  );
}

export function WarnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="block shrink-0">
      <path d="M8 2.2 14.3 13H1.7L8 2.2Z" stroke="#b7791f" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 6.3v3.2M8 11.4v.1" stroke="#b7791f" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="block shrink-0">
      <circle cx="8" cy="8" r="6" stroke={MUTED} strokeWidth="1.4" />
      <path d="M8 7.2v3.6M8 5.2v.1" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="block shrink-0">
      <circle cx="8" cy="8" r="6" stroke={MUTED} strokeWidth="1.4" />
      <path d="M8 4.8V8l2.2 1.4" stroke={MUTED} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** The vendor portal's delete icon, from its API key table: 18px, drawn on a 22 grid. */
export function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden className="block">
      <path d="M3.66797 6.41732H18.3346" stroke="#2F2B3D" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.16536 10.084V15.584" stroke="#2F2B3D" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.8333 10.084V15.584" stroke="#2F2B3D" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.58203 6.41602L5.4987 17.416C5.4987 18.4285 6.31951 19.2493 7.33203 19.2493H14.6654C15.6779 19.2493 16.4987 18.4285 16.4987 17.416L17.4154 6.41602" stroke="#2F2B3D" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.25 6.41667V3.66667C8.25 3.16041 8.66041 2.75 9.16667 2.75H12.8333C13.3396 2.75 13.75 3.16041 13.75 3.66667V6.41667" stroke="#2F2B3D" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The pricing page's tick chip, copied from its export (.feat .tick and #i-tick): an 18px chip,
    2px pad, 6px radius, a 1px drop, and the filled 14px tick glyph. */
export function PlanCheck() {
  return (
    <span aria-hidden className="mt-[1px] block size-[18px] shrink-0 rounded-[6px] p-[2px]" style={{ background: "rgba(7,41,41,0.06)", color: "rgba(7,41,41,0.62)" }}>
      <svg viewBox="0 0 14 14" width="14" height="14" className="block">
        <path
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.2649 3.07601C11.4991 3.22236 11.5703 3.53084 11.4239 3.76501L8.27903 8.79686L8.26603 8.81766C7.96584 9.29798 7.72247 9.68737 7.50209 9.9779C7.27756 10.2739 7.03718 10.5228 6.72175 10.6676C6.24572 10.8861 5.70298 10.9091 5.21014 10.7318C4.88356 10.6142 4.62295 10.3867 4.37412 10.1108C4.1299 9.83997 3.85439 9.47262 3.51455 9.01949L3.49983 8.99986L2.59994 7.80001C2.43425 7.57909 2.47902 7.26569 2.69994 7.10001C2.92085 6.93432 3.23425 6.97909 3.39994 7.20001L4.29983 8.39986C4.65789 8.87728 4.90647 9.2079 5.11672 9.44102C5.32588 9.67294 5.45274 9.75629 5.54875 9.79084C5.79517 9.87952 6.06655 9.868 6.30456 9.75874C6.3973 9.71616 6.51663 9.62236 6.70538 9.37354C6.8951 9.12343 7.11474 8.77292 7.43103 8.26686L10.5759 3.23501C10.7223 3.00084 11.0308 2.92965 11.2649 3.07601Z"
        />
      </svg>
    </span>
  );
}

export function PencilIcon({ color = MUTED }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="block">
      <path d="M10.6 2.9a1.5 1.5 0 0 1 2.1 0l.4.4a1.5 1.5 0 0 1 0 2.1L6 12.5 2.8 13.2l.7-3.2 7.1-7.1ZM9.5 4l2.5 2.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A square icon-only button, for row actions like edit. Always labelled for screen readers. */
export function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-[30px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] transition-colors hover:bg-[rgba(7,41,41,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#072929]"
    >
      {children}
    </button>
  );
}

export function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="block">
      <path d="m4 4 8 8M12 4l-8 8" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Spinner({ size = 16, color = DEEP }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden className="block shrink-0 animate-spin motion-reduce:animate-none">
      <circle cx="8" cy="8" r="6" stroke={HAIR} strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ── controls ── */

/** The ink button: the locked dialog's View Plans, without the arrow. */
export function InkButton({
  children,
  onClick,
  disabled,
  busy,
  size = "md",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  busy?: boolean;
  size?: "md" | "sm";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={busy || undefined}
      className={`${FONT} flex shrink-0 cursor-pointer items-center justify-center gap-[8px] font-medium text-white transition-colors disabled:cursor-default ${
        size === "sm" ? "h-[36px] rounded-[10px] px-[16px] text-[14px] leading-[20px]" : "h-[40px] rounded-[10px] px-[20px] text-[15px] leading-[24px]"
      }`}
      style={{ background: disabled ? "rgba(7,41,41,0.45)" : DEEP, boxShadow: "none" }}
    >
      {children}
    </button>
  );
}

/** The outline button, as Buy More draws it. */
export function OutlineButton({ children, onClick, size = "md", tone = "default" }: { children: ReactNode; onClick?: () => void; size?: "md" | "sm"; tone?: "default" | "danger" }) {
  const color = tone === "danger" ? "#c42f33" : DEEP;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${FONT} relative flex shrink-0 cursor-pointer items-center justify-center gap-[8px] font-medium transition-colors hover:bg-[rgba(7,41,41,0.04)] ${
        size === "sm" ? "h-[36px] rounded-[10px] px-[16px] text-[14px] leading-[20px]" : "h-[40px] rounded-[10px] px-[20px] text-[15px] leading-[24px]"
      }`}
      style={{ color, border: `1px solid ${tone === "danger" ? "rgba(196,47,51,0.4)" : size === "sm" ? HAIR : DEEP}` }}
    >
      {children}
    </button>
  );
}

/** A small status chip on the Intent tag's own shape. */
export function Chip({ children, tone = "mint" }: { children: ReactNode; tone?: "mint" | "live" | "blue" | "wash" | "warn" | "danger" }) {
  const tones = {
    mint: { background: MINT, color: DEEP },
    /* The vendor portal's Active chip (ui-chip--tonal ui-chip--primary): lime at 32%. */
    live: { background: "rgba(177,250,99,0.32)", color: DEEP },
    blue: { background: "#E0F0FF", color: "#0058B5" },
    wash: { background: WASH, color: DEEP },
    warn: { background: "#FDF3E2", color: "#8A5300" },
    danger: { background: "#FFE5E6", color: "#B4262A" },
  } as const;
  return (
    <span className={`${FONT} inline-flex shrink-0 items-center gap-[5px] whitespace-nowrap rounded-[6px] px-[8px] py-[1px] font-medium leading-[18px] ${tone === "live" ? "text-[12px]" : "text-[11px]"}`} style={tones[tone]}>
      {children}
    </span>
  );
}

/** Closes on Escape, the way every dialog on this page does. */
export function useEscape(onClose: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
}

/** A dialog over the page: the frost, and a white card at the product's radius. */
export function Modal({
  title,
  description,
  labelledBy,
  onClose,
  children,
  width = 560,
  dismissible = true,
}: {
  title: ReactNode;
  description?: ReactNode;
  labelledBy: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  /** False: only the close button and the dialog's own actions close it, not Escape or a click outside. */
  dismissible?: boolean;
}) {
  useEscape(dismissible ? onClose : () => {});
  return createPortal(
    <div className="fixed inset-0 z-[9500] flex items-center justify-center" data-name="Integration Dialog">
      <button type="button" aria-label="Close" tabIndex={dismissible ? undefined : -1} onClick={dismissible ? onClose : undefined} className="absolute inset-0 cursor-default" style={{ background: "rgba(47,43,61,0.45)" }} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="relative flex max-h-[calc(100vh-48px)] max-w-[calc(100vw-48px)] flex-col gap-[24px] overflow-y-auto rounded-[16px] bg-white p-[24px]"
        style={{ width, boxShadow: "0px 4px 18px 0px rgba(47,43,61,0.16)" }}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-[12px] top-[12px] flex size-[28px] cursor-pointer items-center justify-center rounded-[8px] transition-colors hover:bg-[rgba(7,41,41,0.06)]"
        >
          <CloseIcon />
        </button>
        <div className="flex flex-col gap-[6px] pr-[28px]">
          <h2 id={labelledBy} className={`${FONT} font-medium leading-[28px] text-[20px]`} style={{ color: INK }}>
            {title}
          </h2>
          {description && (
            <p className={`${FONT} leading-[21px] text-[14px]`} style={{ color: MUTED }}>
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
