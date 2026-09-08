import { useRef, useState, type FormEvent } from "react";
import iconClose from "@/components/company/assets/icon-close.svg";

/**
 * Add Lead Notification Recipients — Figma node 246:1584.
 *
 * Opened from the toolbar's More menu. The shell is the one every dialog in
 * Buyer Intelligence uses — a fixed full-viewport scrim with the card centred
 * in it, dismissed by the backdrop or the close control, which is how the
 * Company Info and Buy More dialogs already close — so this sits over the page
 * the same way rather than inventing an overlay of its own.
 *
 * The node is 600 x 227: 24px of padding, a 49px title block, 32px, then the
 * 98px field group. The height is left to the content, which adds up to the
 * 227 the design draws.
 */
export default function NotifyRecipientsModal({
  onClose,
  onAdd,
  onReject,
}: {
  onClose: () => void;
  /** Announced through the page's existing toast. */
  onAdd?: (email: string, total: number) => void;
  /** Whatever kept an address out, said the same way. */
  onReject?: (message: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  /* The one rule the field needs: something, an @, something with a dot after
     it. The control is a demo control, so this keeps an obvious mistake out
     rather than standing in for real validation. */
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  /* Enter and the Add button are the same action — the helper text under the
     field says so, so they run one path. */
  const add = (e?: FormEvent) => {
    e?.preventDefault();
    const value = email.trim();
    if (!valid) {
      onReject?.(value ? "Enter a valid email address" : "Enter an email address");
      inputRef.current?.focus();
      return;
    }
    if (recipients.includes(value)) {
      onReject?.(`${value} is already on the list`);
      return;
    }
    const next = [...recipients, value];
    setRecipients(next);
    setEmail("");
    inputRef.current?.focus();
    onAdd?.(value, next.length);
  };

  return (
    <div
      /* The scrim the module's dialogs share, at the layer the Company Info
         modal uses: this opens from the page, not from inside another dialog,
         so it does not need Buy More's extra level. */
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
      onClick={onClose}
    >
      {/* 246:1584 — 600 wide, 16px radius, on the design's own shadow. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add Lead Notification Recipients"
        className="bg-white content-stretch drop-shadow-[0px_4px_9px_rgba(47,43,61,0.16)] flex flex-col gap-[16px] items-start relative rounded-[16px] w-[600px]"
        onClick={e => e.stopPropagation()}
        data-name="modal-dialog"
      >
        {/* 246:1585 — 24px in on every side, and 32px between the two blocks. */}
        <div
          className="content-stretch flex flex-col gap-[32px] items-center px-[24px] py-[24px] relative shrink-0 w-full"
          data-name="modal-header"
        >
          {/* 246:1586 */}
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start justify-center not-italic relative shrink-0 text-[#2f2b3d] w-full">
            <p className="font-['Inter',sans-serif] font-medium leading-[24px] min-w-full relative shrink-0 text-[18px]">
              Add Lead Notification Recipients
            </p>
            {/* 414 wide in the node, so the sentence breaks where it draws it. */}
            <p className="font-['Inter',sans-serif] font-normal leading-[21px] opacity-80 relative shrink-0 text-[15px] w-[414px]">
              The recipients will receive an email for every new lead.
            </p>
          </div>

          {/* 246:1589 */}
          <form
            onSubmit={add}
            /* The browser's own validation would refuse the submit before this
               got a look at it — an empty or malformed address would stop at a
               native bubble and the page would say nothing. The field keeps
               type="email" for the keyboard it brings up; the checking, and the
               toast that reports it, are the page's. */
            noValidate
            className="bg-white content-stretch flex flex-col gap-[4px] items-start justify-center relative shrink-0 w-full"
            data-name="input-custome"
          >
            {/* 246:1590 */}
            <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="form-control">
              {/* 246:1591 */}
              <label
                htmlFor="notify-recipient-email"
                className="content-stretch flex items-center relative rounded-[4px] shrink-0 cursor-pointer"
                data-name="form-label"
              >
                <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[21px] not-italic relative shrink-0 text-[15px] text-[#2f2b3d] whitespace-nowrap">
                  Email address
                </p>
              </label>

              {/* 246:1593 — the field takes the row and the button its own 70. */}
              <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
                {/* 246:1594. The node draws the field on the primary stroke —
                    it is shown in its focused state — 474 x 48 with 16.5/12
                    padding on a 24px line.

                    The height is set rather than left to the padding: Figma
                    draws a stroke inside the frame, CSS adds it outside the
                    padding box, and the field came out 49.6 with the row and
                    the whole dialog carrying the difference. Fixing the box at
                    the design's 48 puts the border back inside it. */}
                <div
                  className="bg-white border border-[#072929] border-solid content-stretch drop-shadow-[0px_2px_3px_rgba(7,41,41,0.08)] flex flex-[1_0_0] gap-[10px] h-[48px] items-center min-w-px px-[16.5px] py-[12px] relative rounded-[10px]"
                  data-name="text-field"
                >
                  <input
                    id="notify-recipient-email"
                    ref={inputRef}
                    autoFocus
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    aria-label="Email address"
                    /* The caret the node draws before the placeholder is the
                       field's own, so nothing stands in for it here. */
                    className="bg-transparent border-none flex-[1_0_0] font-['Inter',sans-serif] font-normal leading-[24px] min-w-px outline-none text-[17px] text-[#2f2b3d] placeholder:text-[rgba(47,43,61,0.4)]"
                  />
                </div>

                {/* 246:1600 — 70 x 48. The width is the node's rather than the
                    label's: "Add" inside 20px of padding measures a pixel under
                    it, which would take that pixel off the field beside it. */}
                {/* Always on its filled treatment: the node draws one state for
                    this button and that is it, so an empty field dims nothing.
                    An address that cannot be added is answered by the page's
                    own toast instead, which is how every other action here
                    reports itself. */}
                <button
                  type="button"
                  onClick={() => add()}
                  className="bg-[#072929] content-stretch cursor-pointer flex flex-col items-center justify-center overflow-clip relative rounded-[10px] self-stretch shadow-[0px_2px_6px_0px_rgba(7,41,41,0.3)] shrink-0 w-[70px]"
                  data-name="Default Button"
                >
                  <span className="content-stretch flex gap-[8px] items-center justify-center overflow-clip px-[20px] py-[8px] relative shrink-0">
                    <span className="[word-break:break-word] capitalize font-['Inter',sans-serif] font-medium leading-[24px] not-italic relative shrink-0 text-[15px] text-white whitespace-nowrap">
                      Add
                    </span>
                  </span>
                </button>
              </div>
            </div>

            {/* 246:1601 */}
            <div className="content-stretch flex items-start pt-[4px] relative shrink-0 w-full" data-name="form-text">
              <p className="[word-break:break-word] font-['Inter',sans-serif] font-normal leading-[13px] not-italic relative shrink-0 text-[13px] text-[rgba(47,43,61,0.7)] whitespace-nowrap">
                Press Enter or click Add to include each address
              </p>
            </div>
          </form>
        </div>

        {/* 246:1615 — the module's own icon button, at the node's offsets. */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute content-stretch cursor-pointer flex items-center justify-center left-[558px] py-[5px] rounded-[6px] size-[24px] top-[11.5px]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgb(243, 242, 245) 0%, rgb(243, 242, 245) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)",
          }}
        >
          <img alt="" className="block max-w-none size-[15px]" src={iconClose} />
        </button>
      </div>
    </div>
  );
}
