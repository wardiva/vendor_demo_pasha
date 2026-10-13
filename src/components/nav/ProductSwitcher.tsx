/**
 * The drawer's product switcher: the product card at the top of the drawer
 * (logo, name, plan chip, category, chevron) as a button that opens the list
 * of the vendor's products, with "Add new product" beneath a hairline.
 *
 * Drawn in the product's own popover language — a white card at radius 12
 * with a hairline and the floating shadow, 36px rows at radius 8 with the ink
 * hover wash, the section label in the muted ink — and portaled to the body,
 * since the drawer clips its own overflow.
 */

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const INK = "#2f2b3d";
const MUTED = "rgba(47,43,61,0.7)";
const DEEP = "#072929";
const HAIR = "rgba(47,43,61,0.1)";
const FONT = "font-['Inter',sans-serif]";

type Product = { name: string; category: string };

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="block shrink-0">
      <path d="m3.5 8.5 3 3 6-6.5" stroke={DEEP} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="block shrink-0">
      <path d="M8 3.75v8.5M3.75 8h8.5" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function ProductSwitcher({
  logo,
  product,
  children,
}: {
  /** The product's logo, drawn at its own size; scaled into the row's 28px tile. */
  logo: ReactNode;
  product: Product;
  /** The trigger's face: the drawer's product card as it already draws it. */
  children: (open: boolean) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [at, setAt] = useState<{ left: number; top: number; width: number } | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  const place = () => {
    const r = trigger.current?.getBoundingClientRect();
    if (r) setAt({ left: r.left + 8, top: r.bottom + 4, width: Math.max(280, r.width - 16) });
  };

  useLayoutEffect(() => {
    if (open) place();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menu.current?.contains(t) && !trigger.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (open) menu.current?.querySelector<HTMLButtonElement>("[role=menuitemradio]")?.focus();
  }, [open, at]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${product.name}, ${product.category}. Switch product`}
        onClick={() => setOpen(o => !o)}
        className="-m-[6px] block w-[calc(100%+12px)] cursor-pointer rounded-[10px] p-[6px] text-left transition-colors hover:bg-[rgba(7,41,41,0.05)]"
        data-product-switcher
      >
        {children(open)}
      </button>
      {open &&
        at &&
        createPortal(
          <div
            ref={menu}
            role="menu"
            aria-label="Products"
            className="fixed z-[8500] flex flex-col rounded-[12px] bg-white py-[6px]"
            style={{ left: at.left, top: at.top, width: at.width, border: `1px solid ${HAIR}`, boxShadow: "0px 4px 18px 0px rgba(47,43,61,0.16)" }}
            data-name="Product Switcher"
          >
            <p className={`${FONT} px-[16px] pb-[4px] pt-[6px] font-medium leading-[16px] text-[12px] tracking-[0.2px]`} style={{ color: "rgba(47,43,61,0.6)" }}>
              Products (1)
            </p>
            <div className="px-[6px]">
              <button
                type="button"
                role="menuitemradio"
                aria-checked="true"
                onClick={() => setOpen(false)}
                className="flex h-[44px] w-full cursor-pointer items-center gap-[10px] rounded-[8px] px-[10px] text-left transition-colors hover:bg-[rgba(7,41,41,0.06)] focus-visible:bg-[rgba(7,41,41,0.06)] focus-visible:outline-none"
              >
                <span className="relative block size-[28px] shrink-0 overflow-hidden">
                  <span className="absolute left-0 top-0 block origin-top-left" style={{ transform: "scale(0.875)" }}>
                    {logo}
                  </span>
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className={`${FONT} truncate font-medium leading-[20px] text-[14px]`} style={{ color: INK }}>
                    {product.name}
                  </span>
                  <span className={`${FONT} truncate leading-[16px] text-[12px]`} style={{ color: MUTED }}>
                    {product.category}
                  </span>
                </span>
                <CheckIcon />
              </button>
            </div>
            <span aria-hidden className="my-[6px] block h-px w-full" style={{ background: HAIR }} />
            <div className="px-[6px]">
              <button
                type="button"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex h-[40px] w-full cursor-pointer items-center gap-[10px] rounded-[8px] px-[10px] text-left transition-colors hover:bg-[rgba(7,41,41,0.06)] focus-visible:bg-[rgba(7,41,41,0.06)] focus-visible:outline-none"
              >
                <PlusIcon />
                <span className={`${FONT} font-normal leading-[20px] text-[14px]`} style={{ color: INK }}>
                  Add new product
                </span>
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
