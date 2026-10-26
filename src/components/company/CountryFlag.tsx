import flagCA from "@/components/company/assets/flags/ca.svg";
import flagGB from "@/components/company/assets/flags/gb.svg";
import flagIE from "@/components/company/assets/flags/ie.svg";
import flagIN from "@/components/company/assets/flags/in.svg";
import flagNG from "@/components/company/assets/flags/ng.svg";
import flagUS from "@/components/company/assets/flags/us.svg";

/**
 * A country's round flag, as the vendor portal draws it (`sf-country-flag`):
 * 16px square, round, never shrinking, with the country's code as its
 * accessible name ("US flag"). The flags are the portal's own 24px artwork,
 * scaled down, for the countries the demo's sessions come from.
 */

const FLAGS: Record<string, { code: string; src: string }> = {
  "United States": { code: "US", src: flagUS },
  US: { code: "US", src: flagUS },
  USA: { code: "US", src: flagUS },
  Canada: { code: "CA", src: flagCA },
  "United Kingdom": { code: "GB", src: flagGB },
  UK: { code: "GB", src: flagGB },
  Nigeria: { code: "NG", src: flagNG },
  India: { code: "IN", src: flagIN },
  Ireland: { code: "IE", src: flagIE },
};

export default function CountryFlag({ country, size = 16 }: { country: string; size?: number }) {
  const flag = FLAGS[country.trim()];
  /* No artwork for a country: nothing, rather than a broken image. */
  if (!flag) return null;
  return (
    <img
      src={flag.src}
      alt=""
      role="img"
      aria-label={`${flag.code} flag`}
      width={size}
      height={size}
      className="inline-block shrink-0 rounded-full object-contain"
      style={{ width: size, height: size }}
      data-testid="activity-session-country-flag"
    />
  );
}
