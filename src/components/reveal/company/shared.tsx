import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useCompanyReveal, useCompanyRevealAllowance } from "@/context/CompanyRevealContext";
import { REVEAL_DELAY } from "@/components/reveal/revealMechanics";
import { fireConfettiFrom } from "@/components/reveal/confetti";
import type { RevealContact } from "@/data/companyReveal";
import revealEye from "@/components/company/assets/contact-reveal-eye.svg";

/**
 * Building blocks shared by the seven company-reveal concepts.
 *
 * Every concept spends the same way — one reveal for the company, whatever
 * contacts it discloses — so the spend itself lives once, here, and each
 * concept only differs in how it presents the "N contacts available" state
 * and the "revealed" state around that one action.
 */

/** Runs the shared reveal flow for a company: the allowance check, the
 *  loading delay, the confetti burst and the credit spend. */
export function useCompanyRevealFlow(companyKey: string, contacts: RevealContact[]) {
  const { revealedCompanies, requestReveal, completeReveal } = useCompanyReveal();
  const { used, total } = useCompanyRevealAllowance();
  const isRevealed = revealedCompanies.has(companyKey);
  const [settled, setSettled] = useState(isRevealed);
  const [loading, setLoading] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const pending = useRef(false);
  const timers = useRef<number[]>([]);
  const hasBalance = isRevealed || used < total;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const revealAll = (e: MouseEvent) => {
    e.stopPropagation();
    if (pending.current || isRevealed) return;
    if (!requestReveal(companyKey)) return;
    pending.current = true;
    setLoading(true);

    const origin = btnRef.current?.getBoundingClientRect();
    timers.current.push(
      window.setTimeout(() => {
        pending.current = false;
        setLoading(false);
        if (origin) fireConfettiFrom(origin);
        completeReveal(
          companyKey,
          contacts.map(c => c.id),
        );
        timers.current.push(window.setTimeout(() => setSettled(true), 520));
      }, REVEAL_DELAY),
    );
  };

  return { isRevealed, settled, loading, hasBalance, revealAll, btnRef, remaining: Math.max(total - used, 0) };
}

/** "3 contacts available", "2 contacts available", "1 contact available". */
export function contactCountLabel(count: number, revealed = false): string {
  const noun = count === 1 ? "contact" : "contacts";
  return revealed ? `${count} ${noun} revealed` : `${count} ${noun} available`;
}

/** Muted, small — the line that makes the company-level cost explicit before
 *  the action is taken. */
export function RevealCostNote({ className = "" }: { className?: string }) {
  return (
    <p
      className={`[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[16px] not-italic text-[11px] text-[rgba(47,43,61,0.55)] ${className}`}
    >
      Uses 1 contact reveal
    </p>
  );
}

const SPINNER = (
  <span
    aria-hidden
    className="inline-block shrink-0 rounded-full"
    style={{
      width: 12,
      height: 12,
      border: "2px solid rgba(255,255,255,0.35)",
      borderTopColor: "currentColor",
      animation: "lead-reveal-spin 1s linear infinite",
    }}
  />
);

/**
 * The one primary action every concept builds its own frame around: "Reveal
 * all N contacts", styled and sized per concept but sharing the same click
 * contract, loading state and out-of-balance treatment.
 */
export function RevealAllButton({
  btnRef,
  count,
  loading,
  hasBalance,
  onClick,
  className = "",
  size = "md",
}: {
  btnRef: React.RefObject<HTMLButtonElement | null>;
  count: number;
  loading: boolean;
  hasBalance: boolean;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  const label = hasBalance ? (count > 1 ? `Reveal all ${count} contacts` : "Reveal contact") : "Get more reveals";
  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      data-loading={loading || undefined}
      className={`lead-reveal-btn cursor-pointer inline-flex items-center justify-center gap-[6px] rounded-[6px] font-['Inter',sans-serif] font-medium whitespace-nowrap transition-colors ${
        size === "sm" ? "px-[10px] py-[6px] text-[11px]" : "px-[14px] py-[8px] text-[12px]"
      } ${
        hasBalance
          ? "bg-[#072929] text-white hover:bg-[#0b3a3a]"
          : "bg-[rgba(7,41,41,0.08)] text-[#072929]"
      } ${className}`}
    >
      {loading ? (
        SPINNER
      ) : (
        <span className="relative shrink-0 size-[12px]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={revealEye} style={{ filter: hasBalance ? "invert(1) brightness(2)" : "none" }} />
        </span>
      )}
      <span>{loading ? "Revealing…" : label}</span>
    </button>
  );
}

/** Overlapping circular avatars — locked ones blurred, revealed ones sharp. */
export function ContactAvatarStack({
  contacts,
  revealed,
  size = 28,
}: {
  contacts: RevealContact[];
  revealed: boolean;
  size?: number;
}) {
  return (
    <div className="flex items-center" style={{ paddingRight: 4 }}>
      {contacts.map((c, i) => (
        <div
          key={c.id}
          className="relative shrink-0 rounded-full ring-2 ring-white overflow-hidden"
          style={{ width: size, height: size, marginLeft: i === 0 ? 0 : -Math.round(size * 0.32), zIndex: contacts.length - i }}
        >
          <img
            alt=""
            src={c.avatar}
            className="absolute inset-0 size-full object-cover"
            style={revealed ? undefined : { filter: "blur(3px) saturate(0.6)" }}
          />
          {!revealed && <span className="absolute inset-0 bg-[rgba(7,41,41,0.22)]" />}
        </div>
      ))}
    </div>
  );
}

/** A single blurred line — stands in for a name or title before reveal. */
export function BlurBar({ w, h = 8 }: { w: number; h?: number }) {
  return (
    <span
      aria-hidden
      className="inline-block rounded-full bg-[rgba(47,43,61,0.16)]"
      style={{ width: w, height: h }}
    />
  );
}

/** Shown beside the action once the plan's company reveals are spent. */
export function OutOfRevealsNote({ className = "" }: { className?: string }) {
  return (
    <p
      className={`[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[16px] not-italic text-[11px] text-[#FF4C51] ${className}`}
    >
      No company reveals left
    </p>
  );
}

export function CompanyRevealCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-[12px] bg-white bg-[linear-gradient(rgba(244,242,240,0.6),rgba(244,242,240,0.6))] ${className}`}
    >
      {children}
    </div>
  );
}
