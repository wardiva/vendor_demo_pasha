function Slide() {
  return (
    <div className="absolute content-stretch flex items-center left-0 px-[8px] py-[9px] rounded-[10px] top-0" data-name="Slide">
      <div className="bg-[#072929] h-[18px] relative rounded-[500px] shadow-[0px_2px_6px_0px_rgba(0,66,75,0.3)] shrink-0 w-[30px]" data-name="Slide" />
    </div>
  );
}

function Knob() {
  return (
    <div className="absolute left-[13px] size-[32px] top-[2px]" data-name="Knob">
      <svg className="absolute block inset-0 size-full" fill="none" height="32" preserveAspectRatio="none" viewBox="0 0 32 32" width="32">
        <g id="Knob">
          <g filter="url(#filter0_d_0_10)" id="Knob_2">
            <circle cx="16" cy="16" fill="white" r="7" />
          </g>
        </g>
        <defs>
          <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="26" id="filter0_d_0_10" width="26" x="3" y="4">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
            <feOffset dy="1" />
            <feGaussianBlur stdDeviation="3" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.184314 0 0 0 0 0.168627 0 0 0 0 0.239216 0 0 0 0.1 0" />
            <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_0_10" />
            <feBlend in="SourceGraphic" in2="effect1_dropShadow_0_10" mode="normal" result="shape" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

function FormCheckInput() {
  return (
    <div className="h-[36px] relative shrink-0 w-[48px]" data-name="form-check-input">
      <Slide />
      <Knob />
    </div>
  );
}

export default function Switch() {
  return (
    <div className="relative size-full" data-name="Switch">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center relative size-full">
          <FormCheckInput />
        </div>
      </div>
    </div>
  );
}