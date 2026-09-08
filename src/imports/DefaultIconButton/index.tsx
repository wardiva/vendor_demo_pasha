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
              <path d="M10.75 0.75L0.75 10.75" id="Path" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-1/4" data-name="Path">
          <div className="absolute inset-[-7.5%]">
            <svg className="block size-full" fill="none" height="11.5" preserveAspectRatio="none" viewBox="0 0 11.5 11.5" width="11.5">
              <path d="M0.75 0.75L10.75 10.75" id="Path" stroke="#2F2B3D" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function BtnIconBtnLgBtnPrimary() {
  return (
    <div className="content-stretch flex items-center p-[5px] relative rounded-[6px] shrink-0" style={{ backgroundImage: "linear-gradient(90deg, rgb(243, 242, 245) 0%, rgb(243, 242, 245) 100%), linear-gradient(90deg, rgb(248, 247, 250) 0%, rgb(248, 247, 250) 100%)" }} data-name="btn-icon btn-lg btn-primary">
      <Icon />
    </div>
  );
}

export default function DefaultIconButton() {
  return (
    <div className="content-stretch flex flex-col items-center relative size-full" data-name="Default-IconButton">
      <BtnIconBtnLgBtnPrimary />
    </div>
  );
}