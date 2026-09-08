import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import ContactTag, { type ContactVariant } from "@/components/ContactTag";
import CopyableValue from "@/components/CopyableValue";
import LinkedInMark from "@/components/LinkedInMark";
import MailIcon from "@/components/MailIcon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import PhoneIcon from "@/components/PhoneIcon";
import avatarUnrevealed from "./assets/avatar-unrevealed.svg";
import avatarUnrevealedModal from "./assets/avatar-unrevealed-modal.svg";

/**
 * The unrevealed contact card — Figma 133:1183, in one place.
 *
 * Every surface that previews a contact behind the veil renders this: the
 * Prospects card's panel and the Prospect Details modal's Verified and
 * Recommended cards. Only the shell's width and which value the card discloses
 * differ between them, so those are props and everything else — the tinted
 * fill, the height, the avatar, the type scale, the tag pinned to the
 * top-right and the gaps — is fixed here. The two arrangements are sized
 * separately: 59px with a 35px avatar on the prospect card, 75px with a 50x54
 * one in the modal.
 *
 * The card is presentation only. Each host keeps its own reveal state machine
 * and passes the button in through `reveal`, so the loader, the confetti, the
 * credit spend and the revealed-state store are untouched by this component.
 * The locked/revealed classes it applies are the existing ones, so the veil and
 * the hover stroke behave exactly as before.
 */
/**
 * A contact mark with its value on hover — the shadcn Tooltip, wrapped once so
 * the phone and the envelope use it identically.
 *
 * The mark is handed to `TooltipTrigger` through `render`, so the trigger
 * becomes the existing control rather than adding a button around it: the copy
 * row keeps its own element, its `[data-copy-row]` marker and its size, and
 * clicking it still copies.
 *
 * Without a value there is no tooltip at all — the mark renders alone. That is
 * what withholds a veiled contact's number: the card passes nothing while it
 * is locked, so there is no content to hover out of it.
 */
function ValueTooltip({
  value,
  children,
  className = "flex relative shrink-0",
}: {
  value?: string;
  children: ReactNode;
  /** The trigger's own box, so it can flex where the layout needs it to. */
  className?: string;
}) {
  if (!value) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger render={<span className={className} />}>{children}</TooltipTrigger>
      <TooltipContent>
        <p>{value}</p>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * A contact mark whose tooltip carries the value and the way to copy it.
 *
 * The prospect card is too small to spell a number out, let alone put a button
 * beside it, so the mark opens a tooltip that holds both: the value in full —
 * the whole address, whatever the card has room to show — and the copy control
 * after it. The mark itself only opens this; it no longer copies on click.
 *
 * The control is the module's own `[data-copy-row]`, so the clipboard call, the
 * failure toast and the tick held after a copy are the ones every other value
 * uses; only where the button sits is different, and that is CSS.
 *
 * Showing and hiding is `HoverCopyTooltip`'s below: the mark and the popup are
 * the only two things that hold it open, and it goes as soon as the pointer is
 * off both.
 */

/**
 * How long the tooltip survives the pointer leaving, so the gap between the
 * mark and the popup can be crossed on the way to the copy control. Short
 * enough that leaving for anywhere else reads as closing at once.
 */
const TOOLTIP_GRACE = 120;

function CopyTooltip({ value, children }: { value?: string; children: ReactNode }) {
  /* Withheld while the contact is: a veiled card's marks are still drawn, and a
     tooltip over them would hand back the very thing the reveal is for. */
  if (!value) return <>{children}</>;
  return <HoverCopyTooltip value={value}>{children}</HoverCopyTooltip>;
}

/**
 * A tooltip that is open exactly while the pointer is on its mark or in it.
 *
 * Visibility is held here rather than left to the library, and it is held as
 * one thing: whether the pointer is currently over either of the two surfaces
 * that should show it. Nothing else is consulted. Copying in particular sets
 * no state here at all — the tick is the copy control's own business, and a
 * copy that is still showing its tick has no say in whether the tooltip is up.
 * Leaving both surfaces closes it whatever the tick is doing.
 *
 * That separation is the fix. Left to the library, a copy re-rendered the card
 * underneath the open popup and its hover tracking lost the pointer, so the
 * tooltip could sit open over a card nothing was pointing at.
 *
 * The two flags are refs, not state: they are read inside event handlers that
 * outlive the render they were bound in, and only the derived answer needs to
 * re-render anything.
 */
function HoverCopyTooltip({ value, children }: { value: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const overMark = useRef(false);
  const overPopup = useRef(false);
  const closeTimer = useRef<number | undefined>(undefined);

  /* One place decides, from the two flags, every time either changes. Stable,
     so the listeners bound below never go stale. */
  const sync = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    if (overMark.current || overPopup.current) setOpen(true);
    else closeTimer.current = window.setTimeout(() => setOpen(false), TOOLTIP_GRACE);
  }, []);

  /**
   * Binds a surface's pointer listeners the moment React attaches it.
   *
   * A callback ref rather than an effect: the popup is portalled and mounts a
   * tick after the render that opened it, so an effect keyed on `open` ran
   * while its ref was still empty and the popup was never listened to at all —
   * the pointer could travel into it and the tooltip closed underneath.
   *
   * Native `pointerenter`/`pointerleave` on elements this component owns: the
   * library's `render` merges its own handling onto the trigger and its popup
   * forwards no props, so handlers passed to either are dropped. Neither event
   * bubbles, so each surface reports its own box and nothing else on the card
   * can reach them. Detaching clears the flag — a surface that no longer exists
   * cannot be under the pointer.
   */
  const bound = useRef<Record<string, { node: HTMLElement; enter: () => void; leave: () => void } | null>>({
    mark: null,
    popup: null,
  });

  const attach = (key: "mark" | "popup", flag: { current: boolean }) => (node: HTMLSpanElement | null) => {
    const prev = bound.current[key];
    if (prev) {
      prev.node.removeEventListener("pointerenter", prev.enter);
      prev.node.removeEventListener("pointerleave", prev.leave);
      bound.current[key] = null;
    }
    if (node) {
      const enter = () => {
        flag.current = true;
        sync();
      };
      const leave = () => {
        flag.current = false;
        sync();
      };
      node.addEventListener("pointerenter", enter);
      node.addEventListener("pointerleave", leave);
      bound.current[key] = { node, enter, leave };
    } else if (flag.current) {
      flag.current = false;
      sync();
    }
  };

  const markRef = useCallback(attach("mark", overMark), [sync]);
  const popupRef = useCallback(attach("popup", overPopup), [sync]);

  /* A card can be filtered away or a page changed with the pointer still on the
     mark, so nothing is left pending on an unmounted tooltip. */
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  return (
    <span ref={markRef} className="flex relative shrink-0">
      {/* Fully controlled. The library is watching a trigger the pointer never
          technically enters — the wrapper above is what it crosses — so its own
          open and close requests describe a state that is not the real one and
          are ignored. */}
      <Tooltip open={open} onOpenChange={() => {}}>
        <TooltipTrigger render={<span className="flex" />}>{children}</TooltipTrigger>
        <TooltipContent>
          {/* Pushed out over the popup's own padding, so the whole popup counts
              as inside and crossing its edge does not start a close the moment
              before the pointer reaches the control. */}
          <span ref={popupRef} className="-mx-[12px] -my-[6px] flex px-[12px] py-[6px]">
            <CopyableValue value={value} className="lead-copy-tip">
              <span>{value}</span>
            </CopyableValue>
          </span>
        </TooltipContent>
      </Tooltip>
    </span>
  );
}

export default function ContactPreviewCard({
  variant,
  avatar,
  name,
  jobTitle,
  value,
  valueIcon,
  phone,
  email,
  locked,
  settled,
  reveal,
  layout = "prospect",
  className = "",
}: {
  variant: ContactVariant;
  avatar: string;
  name: string;
  jobTitle: string;
  /**
   * The phone number or email address this card discloses, spelled out beside
   * its mark. The modal's arrangement only.
   */
  value?: string | undefined;
  valueIcon?: ReactNode;
  /**
   * Figma 219:1028 sets no number or address on the prospect card at all: the
   * phone and envelope marks stand in for them on one line with the job title.
   * The phone still copies the number it stands for — the mark is the control
   * now that there is no value to hover.
   */
  phone?: string;
  email?: string;
  locked: boolean;
  /** True once the reveal's fade has finished and the card is an ordinary one. */
  settled: boolean;
  /** The host's Reveal Contact control, rendered while locked. */
  reveal?: ReactNode;
  /**
   * Which arrangement the card takes. "prospect" is the Prospects page panel
   * (Figma 133:1183); "modal" is the Prospect Details modal's Contacts section
   * (Figma 237:3484), which sets the contact out differently — a 50x54 avatar,
   * a larger name, and three lines: the name, the job title, then the number
   * and the address. The shell, the fill, the veil and the hover stroke are the
   * same in both.
   */
  layout?: "prospect" | "modal";
  className?: string;
}) {
  const modal = layout === "modal";
  /* Figma 237:3484 — in the modal the contact sits on a white card inside the
     tinted one, which is left showing as a 2px frame. The node draws both of
     its containers that way, 237:3640 veiled and 237:3560 disclosed, so the
     frame is the card rather than a state of it: revealing a contact lifts the
     frost and moves nothing. */
  const framed = modal;

  /**
   * A click anywhere on a withheld card reveals it.
   *
   * The reveal itself is the host's — the prospect cards run it through the
   * reveal context, the modal's contacts on their own state — and it reaches
   * this component already built, as the button in `reveal`. So the card does
   * not reimplement any of it: it forwards the click to that button, and every
   * part of the flow stays the one already written. The loader still appears in
   * the button because it is the button being pressed; the burst is still
   * measured from the button's own box, so it launches from the same place it
   * always did; the credit spend, the persistence and the transition are all
   * the host's untouched.
   *
   * A press that landed on the button is left alone — it is already on its way
   * to the same handler, and forwarding it again would be the double-trigger.
   * A second press while one is in flight is stopped by the host's own pending
   * guard, which is what has always kept a double-click from spending twice.
   */
  const revealFromCard = (e: ReactMouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest(".lead-reveal-btn")) return;
    /* The card sits inside surfaces that open a modal on click. While it is
       withheld, this press means "reveal" and nothing behind it should act. */
    e.stopPropagation();
    e.currentTarget.querySelector<HTMLButtonElement>(".lead-reveal-btn")?.click();
  };

  return (
    <div
      data-name="Contact Card"
      /* Locked only. A revealed card keeps whatever click behaviour its host
         gives it — the phone, the address, the mark and the row beneath are
         all reached exactly as before. */
      onClick={locked ? revealFromCard : undefined}
      /* No stroke — the design distinguishes this panel by its tinted fill
         alone, in both the locked and revealed states.

         The fill is the design's 60% tint painted over an opaque white of its
         own rather than left transparent. The composite is identical either
         way on the Prospects page, where the card already sits on a white
         prospect card — but in a modal every ancestor is transparent, so
         without this the veil's backdrop-filter samples past them to the
         modal's scrim and the frost reads grey. Carrying its own base makes
         the card blur the same surface wherever it is rendered. */
      /* 75px in the modal — 237:3560's own height, a 71px inner card inside the
         2px frame; 59px on the prospect card, which is the height Figma
         219:1015 gives it. */
      className={`lead-contact-card bg-white bg-[linear-gradient(rgba(244,242,240,0.6),rgba(244,242,240,0.6))] content-stretch flex items-center relative rounded-[12px] shrink-0 ${
        modal ? "h-[75px]" : "h-[59px]"
      } ${framed ? "lead-card-framed p-[2px]" : "px-[12px] py-[8px]"} ${className} ${
        locked
          ? /* The pointer is on the same condition as the click handler above,
               not written alongside it: a card says it can be pressed exactly
               while pressing it does something. Revealed, the handler comes off
               and so does this, and the card takes whatever cursor its surface
               gives it. */
            "lead-card-locked cursor-pointer"
          : `lead-card-revealed ${settled ? "lead-card-settled" : ""}`
      }`}
    >
      {/* Hover stroke — masked to the card's border. Locked cards only: the
          element is unmounted the moment the contact is revealed, so a revealed
          card is static on hover. */}
      {locked && <span aria-hidden className="lead-glow-stroke" />}

      {modal ? (
        /* Figma 237:3484 — the modal's Contacts section: the contact set out on
           the white inner card of 237:3560, three lines deep. */
        <div
          className={`content-stretch flex flex-[1_0_0] gap-[12px] items-start min-w-0 relative ${
            framed ? "bg-white h-full px-[10px] py-[4px] rounded-[10px]" : ""
          }`}
        >
          {/* 237:3562 — the portrait sits 4px below the inner card's own
              padding, which is what drops it level with the name rather than
              with the top of the text column. */}
          <div className="content-stretch flex items-center pt-[4px] relative shrink-0">
            {/* The two are stacked in the one box and cross: the placeholder is
                held past the reveal so it has something to fade out of, and the
                photograph fades in over it. Both fill the slot absolutely, so
                its size and position never change and nothing beside it moves.
                `settled` is the host's own signal that the reveal has finished,
                so it is what retires the placeholder. */}
            <div className="h-[54px] relative rounded-[8px] shrink-0 w-[50px]" data-name="Image">
              {(locked || !settled) ? (
                /* Figma 289:1192 — a withheld contact in the modal shows the
                   placeholder rather than their photograph. The node draws it
                   as a squircle in the card's own ink at two fifths of its
                   weight, with the head and shoulders over it, which is the
                   rounded shape this avatar takes here rather than the circle
                   the prospect card's placeholder uses.

                   It carries no z-index, so it stays under the card's veil and
                   is frosted along with everything else the veil covers — the
                   same blur the avatar has while withheld. Only the tag and the
                   Reveal control are lifted above it.

                   `object-cover` rather than a stretch: the node is 54 square
                   and this slot is 50 x 54, so the art is scaled to the slot's
                   height and centred, losing 2px a side off a symmetric shape
                   instead of being squashed 4px narrower. */
                <img
                  alt=""
                  aria-hidden={!locked}
                  className={`absolute inset-0 max-w-none object-cover pointer-events-none rounded-[8px] size-full transition-[opacity] duration-[240ms] ease-out ${
                    locked ? "opacity-100" : "opacity-0"
                  }`}
                  src={avatarUnrevealedModal}
                />
              ) : null}
              {!locked && (
                /* The design backs the avatar with the ash-white fill, so a
                   portrait that has not loaded still reads as a tile rather
                   than a hole. */
                <div
                  aria-hidden
                  className={`absolute inset-0 pointer-events-none rounded-[8px] ${settled ? "" : "lead-avatar-in"}`}
                >
                  <div className="absolute bg-[#f4f2f0] inset-0 rounded-[8px]" />
                  <img alt="" className="absolute max-w-none object-cover rounded-[8px] size-full" src={avatar} />
                </div>
              )}
            </div>
          </div>

          {/* 237:3564 — three lines, and no gap between the name and the pair
              below it: 237:3565 is 20 tall and 237:3572 starts at 20. */}
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-name="Text">
            {/* 237:3565. The tag is the only thing this line runs alongside —
                it ends at 23 and the title below starts at 26 — so this is the
                only line that reserves room for it: 62px for the shorter
                Verified pinned at 385, 101px for Recommended at 346. */}
            <div
              className={`content-stretch flex items-start relative shrink-0 w-full ${
                variant === "verified" ? "pr-[62px]" : "pr-[101px]"
              }`}
            >
              <div className="content-stretch flex gap-[4px] items-center min-w-px relative shrink">
                <p className="[word-break:break-word] font-['Inter',sans-serif] font-medium leading-[20px] not-italic overflow-hidden relative shrink text-[#2f2b3d] text-[14px] text-ellipsis whitespace-nowrap">
                  {name}
                </p>
                <LinkedInMark size={14} />
              </div>
            </div>

            {/* 237:3572 — the job title and the two channels, a pixel apart. */}
            <div className="content-stretch flex flex-col gap-px items-start min-w-px relative w-full">
              {/* 237:3573 — its own line now, which is what gives the number and
                  the address the whole of the one below. */}
              <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[21px] max-w-full not-italic overflow-hidden relative shrink-0 text-[12px] text-[rgba(47,43,61,0.7)] text-ellipsis whitespace-nowrap">
                {jobTitle}
              </p>

              {/* 237:3574 — the number then the address. The node sets them 24
                  apart; 12 is what this pair takes here, and the address keeps
                  the difference. Both copy through the same delegate and both
                  are held behind the same veil until the contact is
                  disclosed. */}
              <div className="content-stretch flex gap-[12px] items-center min-w-px relative w-full">
                {/* 237:3575. The number takes exactly the width it needs and is
                    never cut: a half-shown phone number is no use to anybody. */}
                {(phone ?? value) && (
                  <div
                    className="content-stretch flex items-center relative shrink-0"
                    data-name="Row"
                    data-no-row-hover
                  >
                    <CopyableValue
                      value={phone ?? value}
                      className="lead-copy-inline content-stretch flex gap-[4px] items-center relative"
                    >
                      <PhoneIcon size={15} />
                      <p className="font-['Inter',sans-serif] font-normal leading-[21px] not-italic relative shrink-0 text-[12px] text-[rgba(47,43,61,0.7)] whitespace-nowrap">
                        {phone ?? value}
                      </p>
                    </CopyableValue>
                  </div>
                )}

                {/* 237:3581. The design's address fits its line outright and is
                    drawn at its natural width. Ours are longer than the one it
                    was drawn with, so this takes the rest of the line and
                    ellipsises at a point the design never reaches — resting on
                    it reads the whole address out in the tooltip. */}
                {email && (
                  <ValueTooltip value={email} className="flex flex-1 min-w-[76px] relative">
                    <div
                      className="content-stretch flex items-center min-w-0 relative w-full"
                      data-name="Row"
                      data-no-row-hover
                    >
                      <CopyableValue
                        value={email}
                        className="lead-copy-inline content-stretch flex gap-[4px] items-center min-w-0 relative"
                      >
                        <MailIcon size={15} />
                        <p className="font-['Inter',sans-serif] font-normal leading-[21px] min-w-0 not-italic overflow-hidden relative text-[12px] text-[rgba(47,43,61,0.7)] text-ellipsis whitespace-nowrap">
                          {email}
                        </p>
                      </CopyableValue>
                    </div>
                  </ValueTooltip>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Figma 219:1016 — the whole contact on two lines: the name with its
           mark, then the job title with the phone and envelope beside it. */
        <div className="content-stretch flex flex-[1_0_0] gap-[16px] h-[59px] items-center min-w-px relative" data-name="Populer Plan">
          <div className="content-stretch flex flex-[1_0_0] gap-[10px] items-center min-w-px relative">
            {/* Figma 288:1183 — a withheld contact shows the placeholder, not
                their photograph behind frost. The node is a 35x35 vector in the
                card's own ink: the head and shoulders at two fifths of its
                weight over a circle at two fifths of that again. It is drawn at
                the avatar's existing box and needs no radius of its own, being
                already a circle, and no object-fit, being already square.

                It carries no z-index, so it stays under the card's veil and is
                frosted with everything else the veil covers — the same blur the
                avatar has always had while withheld. Only the tag and the
                Reveal control are lifted above it.

                Revealed, the photograph renders exactly as it always has. */}
            {/* The two are stacked in the one box and cross: the placeholder is
                held past the reveal so it has something to fade out of, and the
                photograph fades in over it. Both fill the slot absolutely, so
                its size and position never change and nothing beside it moves.
                `settled` is the host's own signal that the reveal has finished,
                so it is what retires the placeholder. */}
            <div className="relative rounded-[100px] shrink-0 size-[35px]" data-name="Image">
              {(locked || !settled) && (
                <img
                  alt=""
                  aria-hidden={!locked}
                  className={`absolute block inset-0 max-w-none size-full transition-[opacity] duration-[240ms] ease-out ${
                    locked ? "opacity-100" : "opacity-0"
                  }`}
                  src={avatarUnrevealed}
                />
              )}
              {!locked && (
                <img
                  alt=""
                  className={`absolute inset-0 max-w-none object-cover pointer-events-none rounded-[100px] size-full ${
                    settled ? "" : "lead-avatar-in"
                  }`}
                  src={avatar}
                />
              )}
            </div>

            {/* min-w-px so a long name or title ellipsises inside the panel
                rather than pushing the row past the card's edge. */}
            <div className="content-stretch flex flex-col gap-px items-start min-w-px relative shrink" data-name="Text">
              <div className="content-stretch flex gap-[4px] items-center max-w-full relative shrink-0">
                <p className="[word-break:break-word] font-['Inter',sans-serif] font-medium leading-[22px] overflow-hidden relative shrink text-[#2f2b3d] text-[13px] text-ellipsis whitespace-nowrap">
                  {name}
                </p>
                <LinkedInMark size={14} />
              </div>

              <div className="content-stretch flex gap-[14px] items-center max-w-full relative shrink-0">
                <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[20px] not-italic overflow-hidden relative shrink text-[12px] text-[rgba(47,43,61,0.7)] text-ellipsis whitespace-nowrap">
                  {jobTitle}
                </p>

                {/* data-no-row-hover: the export names this "Row", which would
                    otherwise match the selectable leads-table hover rule and
                    wash the marks in the table's lime tint. Nothing here is
                    selectable but the phone, which copies. */}
                <div
                  className="content-stretch flex gap-[16px] items-center relative shrink-0"
                  data-name="Row"
                  data-no-row-hover
                >
                  {/* The number is no longer written out, so the mark itself is
                      the copy control — same [data-copy-row] delegate, same
                      tick, just filling the mark's own box — and resting on it
                      reads the value out in a label.

                      Withheld while the contact is: a veiled card's marks are
                      still drawn, and a tooltip over them would hand back the
                      very thing the reveal is for. */}
                  {/* The mark does both: resting on it opens the tooltip that
                      spells the value out and carries its own copy control,
                      and pressing the mark copies straight away without going
                      through it. `lead-copy-icon` is what makes the mark the
                      control — the button fills the mark's own box, stands
                      aside while the mark is hovered, and comes back as the
                      tick for the moment a copy is held. The press is the
                      module's `[data-copy-row]` delegate, which is also what
                      keeps it off the card behind. Withheld while the contact
                      is: a veiled mark carries no value, so there is nothing
                      to copy out of it and nothing to hover. */}
                  <CopyTooltip value={locked ? undefined : phone}>
                    <CopyableValue
                      value={locked ? undefined : phone}
                      className="lead-copy-icon relative shrink-0 size-[15px]"
                    >
                      <PhoneIcon size={15} />
                    </CopyableValue>
                  </CopyTooltip>
                  <CopyTooltip value={locked ? undefined : email}>
                    <CopyableValue
                      value={locked ? undefined : email}
                      className="lead-copy-icon relative shrink-0 size-[15px]"
                    >
                      <MailIcon size={15} />
                    </CopyableValue>
                  </CopyTooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* The tag is pinned to the card in both designs; the modal sets it out
          at the offsets Figma gives it, with an 11px mark and an 11px label. */}
      {modal ? (
        <ContactTag
          variant={variant}
          size={11}
          labelSize={11}
          className={`absolute gap-[4px] top-[10px] ${variant === "verified" ? "left-[385px]" : "left-[346px]"}`}
        />
      ) : (
        /* The status says most while the contact is still withheld — it is the
           one thing a veiled card tells you about what is behind the veil — so
           the word is there to be read then, and goes once the contact itself
           is on screen to say it. Figma 115:4505 and 115:4569 draw the tag it
           reads as: the 11px mark, 4px, then Inter regular 11/20 in the primary
           ink, on no fill and no stroke. Revealed, 219:1037's mark alone.

           Both states are pinned by the same right edge 8px in from the panel's
           top-right corner, so the tag contracts to its mark in place and
           nothing else on the card moves. z-3 keeps it above the veil, which is
           what leaves the word sharp over blurred contact information.

           The top offset is the tag's, but what should read as 8px in from the
           corner is the mark. The tag is 22 tall in both states — the word's
           line box, not the 11px mark, and the collapsed word keeps it — and
           the mark rides its centre. So the offset is lifted by exactly the
           half-difference the centring adds, (22 - 11) / 2, which puts the mark
           8 from the top to match the 8 it already has from the right.

           One value for both states, so the mark holds that position whether
           the word is beside it or not: the tag has nothing left to move
           vertically, and the change of state is the word closing and nothing
           else. */
        <ContactTag
          variant={variant}
          showLabel={locked}
          className="absolute right-[8px] top-[2.5px]"
        />
      )}

      {/* Locked state: the shared veil (.lead-card-locked::before) frosts the
          avatar, name, job title and value in one layer. The tag and the reveal
          control both sit at z-3, above it, and are the only elements that stay
          sharp. */}
      {reveal}
    </div>
  );
}
