import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * The dropdown a filter chip hangs off itself, with its open and close motion.
 *
 * The menu is anchored to the chip exactly as before — 6px below its box and
 * left-aligned with it. What this adds is the transition: it arrives faded out
 * and a few pixels high, settles into place, and on close runs the same move in
 * reverse before it leaves the DOM. Nothing scales and nothing overshoots; the
 * whole thing is over in under a fifth of a second.
 *
 * Keeping the exit means the menu has to outlive the page's open flag, so the
 * last one handed over is held on to and played out with.
 */

/** Enter and exit both run at this length; the transition classes match it. */
export const MENU_MOTION_MS = 190;

const MOTION =
  "transition duration-[190ms] ease-out motion-reduce:transition-none will-change-[opacity,transform]";
const OPEN = "opacity-100 translate-y-0";
const CLOSED = "opacity-0 -translate-y-[6px] pointer-events-none";

export default function AnchoredMenu({
  open,
  className = "absolute left-0 top-[calc(100%+6px)] z-[9999]",
  children,
}: {
  /** True while this menu is the open one. */
  open: boolean;
  /** Where the menu sits against its trigger. */
  className?: string;
  /** The menu itself. Callers may hand over null once they have closed it. */
  children?: ReactNode;
}) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const nodeRef = useRef<HTMLDivElement | null>(null);

  /* The pages render a menu only while their own flag is set, so the last one
     seen is what the exit is played with. */
  const held = useRef<ReactNode>(null);
  if (open && children) held.current = children;

  /* Reading a layout box settles the closed values before the class flips, or
     the browser would see one style and there would be nothing to animate. */
  const attach = useCallback((node: HTMLDivElement | null) => {
    nodeRef.current = node;
    if (!node) return;
    void node.offsetHeight;
    setShown(true);
  }, []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      /* Re-opened before the exit finished: the node never left, so it is
         turned around from wherever it had faded to. */
      if (nodeRef.current) setShown(true);
      return;
    }
    setShown(false);
    const timer = window.setTimeout(() => setMounted(false), MENU_MOTION_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  const content = open ? children : held.current;
  if (!mounted || !content) return null;

  return (
    <div className={className}>
      <div ref={attach} className={`${MOTION} ${shown && open ? OPEN : CLOSED}`}>
        {content}
      </div>
    </div>
  );
}
