import svgPaths from "./svg-xklnn5x2o1";
import imgIconJpeg from "./62fcc20d40d8545e652158ad9365c64cfd17b62f.png";
import imgImage from "./31a60c48e14ab2409792068b893ad2f89fe32ee0.png";
import imgImage1 from "./cd81baf587a9dd9e1b0dd03b300af6b2dcd43627.png";
import { imgGroup } from "./svg-j9agd";

function Text() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-w-px relative" data-name="Text">
      <div className="relative rounded-[4px] shrink-0 size-[15px]">
      </div>
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">
        <p className="leading-[19px]">All</p>
      </div>
    </div>
  );
}

function PopulerPlan() {
  return (
    <div className="h-[34px] relative rounded-[8px] shrink-0 w-full" data-name="Populer Plan">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[10px] py-[6px] relative size-full">
          <Text />
        </div>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0 size-[15px]" data-name="Frame">
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 size-[15px]">
      <Frame />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-0" data-name="Group">
      <svg className="absolute block inset-0 size-full" fill="none" height="20" preserveAspectRatio="none" viewBox="0 0 20 20" width="20">
        <g id="Group">
          <path d="M20 0H0V20H20V0Z" fill="#B2C248" id="Vector" />
          <path d={svgPaths.p1ad8c300} fill="#1E1E1E" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function ClipPathGroup() {
  return (
    <div className="absolute contents inset-0" data-name="Clip path group">
      <Group />
    </div>
  );
}

function IconSvg() {
  return (
    <div className="overflow-clip relative rounded-[6px] shrink-0 size-[20px]" data-name="Icon.svg">
      <ClipPathGroup />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <IconSvg />
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">
        <p className="leading-[19px]">Alderwood Logistics</p>
      </div>
    </div>
  );
}

function PopulerPlan1() {
  return (
    <div className="h-[34px] relative rounded-[8px] shrink-0 w-full" data-name="Populer Plan">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[10px] py-[6px] relative size-full">
          <Frame1 />
          <Frame2 />
        </div>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <div className="relative rounded-[6px] shrink-0 size-[20px]" data-name="Icon.jpeg">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none rounded-[6px] size-full" src={imgIconJpeg} />
      </div>
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">
        <p className="leading-[19px]">Junction Freight Co</p>
      </div>
    </div>
  );
}

function PopulerPlan2() {
  return (
    <div className="h-[34px] relative rounded-[8px] shrink-0 w-full" data-name="Populer Plan">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[10px] py-[6px] relative size-full">
          <div className="relative rounded-[4px] shrink-0 size-[15px]">
          </div>
          <Frame3 />
        </div>
      </div>
    </div>
  );
}

function Image() {
  return (
    <div className="relative rounded-[6px] shrink-0 size-[20px]" data-name="Image">
      <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none rounded-[6px] size-full" src={imgImage} />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <Image />
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">
        <p className="leading-[19px]">Beacon Learning</p>
      </div>
    </div>
  );
}

function PopulerPlan3() {
  return (
    <div className="h-[34px] relative rounded-[8px] shrink-0 w-full" data-name="Populer Plan">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[10px] py-[6px] relative size-full">
          <div className="relative rounded-[4px] shrink-0 size-[15px]">
          </div>
          <Frame4 />
        </div>
      </div>
    </div>
  );
}

function Image1() {
  return (
    <div className="relative rounded-[6px] shrink-0 size-[20px]" data-name="Image">
      <div aria-hidden className="absolute inset-0 pointer-events-none rounded-[6px]">
        <div className="absolute bg-[#f4f2f0] inset-0 rounded-[6px]" />
        <img alt="" className="absolute max-w-none object-cover rounded-[6px] size-full" src={imgImage1} />
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <Image1 />
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">
        <p className="leading-[19px]">Sophia Moreau</p>
      </div>
    </div>
  );
}

function PopulerPlan4() {
  return (
    <div className="h-[34px] relative rounded-[8px] shrink-0 w-full" data-name="Populer Plan">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[10px] py-[6px] relative size-full">
          <div className="relative rounded-[4px] shrink-0 size-[15px]">
          </div>
          <Frame5 />
        </div>
      </div>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <div className="relative rounded-[6px] shrink-0 size-[20px]" data-name="Icon.jpeg">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none rounded-[6px] size-full" src={imgIconJpeg} />
      </div>
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">
        <p className="leading-[19px]">Junction Freight Co</p>
      </div>
    </div>
  );
}

function PopulerPlan5() {
  return (
    <div className="h-[34px] relative rounded-[8px] shrink-0 w-full" data-name="Populer Plan">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[10px] py-[6px] relative size-full">
          <div className="relative rounded-[4px] shrink-0 size-[15px]">
          </div>
          <Frame6 />
        </div>
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute inset-0" data-name="Group">
      <svg className="absolute block inset-0 size-full" fill="none" height="20" preserveAspectRatio="none" viewBox="0 0 20 20" width="20">
        <g id="Group">
          <path d="M20 0H0V20H20V0Z" fill="#B2C248" id="Vector" />
          <path d={svgPaths.p1ad8c300} fill="#1E1E1E" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function ClipPathGroup1() {
  return (
    <div className="absolute contents inset-0" data-name="Clip path group">
      <Group1 />
    </div>
  );
}

function IconSvg1() {
  return (
    <div className="overflow-clip relative rounded-[6px] shrink-0 size-[20px]" data-name="Icon.svg">
      <ClipPathGroup1 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <IconSvg1 />
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">
        <p className="leading-[19px]">Alderwood Logistics</p>
      </div>
    </div>
  );
}

function PopulerPlan6() {
  return (
    <div className="h-[34px] relative rounded-[8px] shrink-0 w-full" data-name="Populer Plan">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[10px] py-[6px] relative size-full">
          <div className="relative rounded-[4px] shrink-0 size-[15px]">
          </div>
          <Frame7 />
        </div>
      </div>
    </div>
  );
}

function Image2() {
  return (
    <div className="relative rounded-[6px] shrink-0 size-[20px]" data-name="Image">
      <div aria-hidden className="absolute inset-0 pointer-events-none rounded-[6px]">
        <div className="absolute bg-[#f4f2f0] inset-0 rounded-[6px]" />
        <img alt="" className="absolute max-w-none object-cover rounded-[6px] size-full" src={imgImage1} />
      </div>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <Image2 />
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">
        <p className="leading-[19px]">Sophia Moreau</p>
      </div>
    </div>
  );
}

function PopulerPlan7() {
  return (
    <div className="h-[34px] relative rounded-[8px] shrink-0 w-full" data-name="Populer Plan">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[10px] py-[6px] relative size-full">
          <div className="relative rounded-[4px] shrink-0 size-[15px]">
          </div>
          <Frame8 />
        </div>
      </div>
    </div>
  );
}

function Image3() {
  return (
    <div className="relative rounded-[6px] shrink-0 size-[20px]" data-name="Image">
      <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none rounded-[6px] size-full" src={imgImage} />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <Image3 />
      <div className="[word-break:break-word] flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#2f2b3d] text-[13px] whitespace-nowrap">
        <p className="leading-[19px]">Beacon Learning</p>
      </div>
    </div>
  );
}

function PopulerPlan8() {
  return (
    <div className="h-[34px] relative rounded-[8px] shrink-0 w-full" data-name="Populer Plan">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[10px] py-[6px] relative size-full">
          <div className="relative rounded-[4px] shrink-0 size-[15px]">
          </div>
          <Frame9 />
        </div>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Icon">
      <div className="relative shrink-0 size-[20px]" data-name="x">
        <svg className="absolute block inset-0 size-full" fill="none" height="32" preserveAspectRatio="none" viewBox="0 0 32 32" width="32">
          <g id="Path" />
        </svg>
        <div className="absolute inset-1/4" data-name="Path">
          <div className="absolute inset-[-7.5%]">
            <svg className="block size-full" fill="none" height="11.5" preserveAspectRatio="none" viewBox="0 0 11.5 11.5" width="11.5">
              <path d="M10.75 0.75L0.75 10.75" id="Path" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.4" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-1/4" data-name="Path">
          <div className="absolute inset-[-7.5%]">
            <svg className="block size-full" fill="none" height="11.5" preserveAspectRatio="none" viewBox="0 0 11.5 11.5" width="11.5">
              <path d="M0.75 0.75L10.75 10.75" id="Path" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.4" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function BtnIconBtnLgBtnPrimary() {
  return (
    <div className="content-stretch flex items-center p-[5px] relative rounded-[4px] shrink-0" style={{ backgroundImage: "linear-gradient(90deg, rgb(243, 242, 245) 0%, rgb(243, 242, 245) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }} data-name="btn-icon btn-lg btn-primary">
      <Icon />
    </div>
  );
}

export default function ProfileListFilters() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start p-[4px] relative size-full" data-name="Profile List Filters">
      <PopulerPlan />
      <PopulerPlan1 />
      <PopulerPlan2 />
      <PopulerPlan3 />
      <PopulerPlan4 />
      <PopulerPlan5 />
      <PopulerPlan6 />
      <PopulerPlan7 />
      <PopulerPlan8 />
      <div className="absolute drop-shadow-[0px_1px_3px_rgba(7,41,41,0.1)] left-[739px] top-[-10px]" data-name="Default-IconButton">
        <div className="flex flex-col items-center size-full">
          <div className="content-stretch flex flex-col items-center relative size-full">
            <BtnIconBtnLgBtnPrimary />
          </div>
        </div>
      </div>
    </div>
  );
}