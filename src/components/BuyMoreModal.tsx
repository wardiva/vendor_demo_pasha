import { useState } from "react";
import DefaultIconButton from "@/imports/DefaultIconButton-1/index";
import Switch from "@/imports/Switch/index";
import { Coin } from "@/imports/BuyerActivityBuyerIntentStarter/index";
import InfoIcon from "@/components/InfoIcon";

const AVAILABLE_CREDITS = 550;

const OPTIONS = [
  { label: "$500",   subLabel: "25 Contacts",  contacts: 25,  price: 500  },
  { label: "$750",   subLabel: "50 Contacts",  contacts: 50,  price: 750  },
  { label: "$1,000", subLabel: "100 Contacts", contacts: 100, price: 1000 },
] as const;

export default function BuyMoreModal({ onClose }: { onClose: () => void }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [useCredits, setUseCredits]   = useState(true);

  const opt = OPTIONS[selectedIdx];
  const contacts: number = opt.contacts;
  const purchaseAmount: number = opt.price;

  const creditsApplied = useCredits ? Math.min(AVAILABLE_CREDITS, purchaseAmount) : 0;
  const totalPayable   = Math.max(0, purchaseAmount - creditsApplied);

  const ctaLabel = contacts > 0
    ? `Buy ${contacts} Contact Reveals`
    : "Buy Contact Reveals";

  return (
    <div
      /* One layer above the detail modals (z-9999): Buy More can be opened
         from inside Prospect Details — by its own button or by a reveal that
         runs out of allowance — and has to stack on top of it, with this
         overlay dimming the modal underneath so it reads as inactive. The
         overlay is the full viewport and the dialog is centred in it, so the
         dialog is centred on the viewport rather than on whatever is below. */
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-[16px] shadow-[0px_4px_9px_rgba(47,43,61,0.16)] flex flex-col"
        /* 584 keeps "100 Contacts" on one line: content is 584 - 48 padding
           - 36 gaps = 500, so each of the four cards is 125 wide and its
           inner box 93 — clear of the 87 the longest label needs. Everything
           inside is flex/flex-1, so the extra width flows through to every
           section rather than leaving a gutter. */
        style={{ width: 584 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer z-10"
          style={{ top: 12, right: 12 }}
          aria-label="Close"
        >
          <DefaultIconButton />
        </button>

        {/* ── Body ── */}
        <div className="flex flex-col gap-[24px] px-[24px] py-[40px]">
          {/* Title */}
          <div className="flex flex-col gap-[12px]">
            <p className="font-['Inter',sans-serif] font-medium leading-[32px] text-[24px] text-[#2f2b3d]">
              Need More Contact Reveals?
            </p>
            <p className="font-['Inter',sans-serif] font-normal leading-[21px] text-[15px] text-[#2f2b3d] opacity-80">
              Choose how many additional contacts you want to reveal. You can always buy more later.
            </p>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[12px]">

              {/* Option cards */}
              <div className="flex gap-[12px]">
                {OPTIONS.map((o, i) => (
                  <button
                    key={o.label}
                    onClick={() => setSelectedIdx(i)}
                    className={`flex-1 flex flex-col gap-[12px] items-start px-[16px] py-[12px] rounded-[12px] text-left transition-all cursor-pointer bg-[#f4f2f0] ${
                      selectedIdx === i
                        ? /* The selected stroke is 1.2px; the ring is drawn
                             outside the box, so the card's own size, padding
                             and radius are unaffected by its weight. */
                          "ring-[1.2px] ring-[#072929]"
                        : "hover:ring-1 hover:ring-[rgba(7,41,41,0.25)]"
                    }`}
                  >
                    <p className="font-['Inter',sans-serif] font-medium leading-[24px] text-[#2f2b3d] whitespace-nowrap text-[18px]">
                      {o.label}
                    </p>
                    <p className="font-['Inter',sans-serif] font-normal leading-[20px] text-[14px] text-[#2f2b3d]">
                      {o.subLabel}
                    </p>
                  </button>
                ))}
              </div>


              {/* Credits card */}
              <div className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.12)] overflow-hidden">
                {/* Available credits */}
                <div className="flex items-center justify-between px-[20px] py-[12px] border-b border-[rgba(0,0,0,0.12)]">
                  <div className="flex items-center gap-[4px]">
                    <span className="font-['Inter',sans-serif] font-normal text-[15px] text-[rgba(47,43,61,0.7)] whitespace-nowrap">
                      Available Credits
                    </span>
                    <InfoIcon />
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <Coin />
                    <span className="font-['Inter',sans-serif] font-bold text-[18px] text-[#2f2b3d]">
                      ${AVAILABLE_CREDITS.toLocaleString()}
                    </span>
                  </div>
                </div>
                {/* Toggle row */}
                <div className="flex items-center gap-[8px] px-[20px] py-[10px]">
                  <span className="flex-1 font-['Inter',sans-serif] font-normal text-[15px] text-[#2f2b3d]">
                    Use my credits for this purchase
                  </span>
                  <button
                    role="switch"
                    aria-checked={useCredits}
                    onClick={() => setUseCredits(v => !v)}
                    className="relative shrink-0 cursor-pointer"
                    style={{
                      width: 48,
                      height: 36,
                      transform: useCredits ? "none" : "scaleX(-1)",
                      opacity: useCredits ? 1 : 0.45,
                      transition: "transform 0.2s, opacity 0.2s",
                    }}
                  >
                    <Switch />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-[#f4f2f0] rounded-[12px]">
                <div className="px-[20px]">
                  <div className="flex items-center justify-between py-[10px] border-b border-[rgba(0,0,0,0.07)]">
                    <span className="font-['Inter',sans-serif] font-normal text-[15px] text-[#2f2b3d]">Contact Reveals</span>
                    <span className="font-['Inter',sans-serif] font-medium text-[15px] text-[#2f2b3d]">
                      {contacts > 0 ? `${contacts} Contacts` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-[10px] border-b border-[rgba(0,0,0,0.07)]">
                    <span className="font-['Inter',sans-serif] font-normal text-[15px] text-[#2f2b3d]">Purchase Amount</span>
                    <span className="font-['Inter',sans-serif] font-medium text-[15px] text-[#2f2b3d]">
                      {purchaseAmount > 0 ? `$${purchaseAmount.toLocaleString()}` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-[10px] border-b border-[rgba(0,0,0,0.12)]">
                    <span className="font-['Inter',sans-serif] font-normal text-[15px] text-[#2f2b3d]">Credits Applied</span>
                    <span className="font-['Inter',sans-serif] font-medium text-[15px] text-[#2f2b3d]">
                      {creditsApplied > 0 ? `-$${creditsApplied.toLocaleString()}` : "$0"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between px-[20px] py-[12px]">
                  <span className="font-['Inter',sans-serif] font-medium text-[15px] text-[#2f2b3d]">Total Payable</span>
                  <span className="font-['Inter',sans-serif] font-medium text-[17px] text-[#2f2b3d]">
                    ${totalPayable.toLocaleString()}
                  </span>
                </div>
              </div>

            </div>

            <p className="font-['Inter',sans-serif] font-normal leading-[21px] text-[15px] text-[#2f2b3d] opacity-80">
              Your additional contact reveals will be available immediately after purchase.
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex gap-[16px] px-[24px] pb-[40px]">
          <button
            onClick={onClose}
            className="flex-1 py-[10px] rounded-[10px] border border-[#072929] font-['Inter',sans-serif] font-medium text-[15px] text-[#072929] cursor-pointer hover:bg-[rgba(7,41,41,0.04)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            disabled={contacts === 0}
            className="flex-1 py-[10px] rounded-[10px] bg-[#072929] shadow-[0px_2px_6px_0px_rgba(7,41,41,0.3)] font-['Inter',sans-serif] font-medium text-[15px] text-white cursor-pointer hover:bg-[#0a3838] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
