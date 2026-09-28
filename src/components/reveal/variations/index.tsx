import ContactStack, { ContactStackModal } from "@/components/reveal/ContactStack";
import { useRevealVariation } from "@/context/RevealVariationContext";
import VariationCurrent from "./VariationCurrent";
import Variation1CompanyUnlock from "./Variation1CompanyUnlock";
import Variation2Grouped from "./Variation2Grouped";
import Variation3Deck from "./Variation3Deck";
import Variation4Expandable from "./Variation4Expandable";
import Variation5RolesFirst from "./Variation5RolesFirst";
import Variation6Banner from "./Variation6Banner";
import Variation7Browse from "./Variation7Browse";
import Variation8Selector from "./Variation8Selector";
import Variation10DeckInteractive from "./Variation10DeckInteractive";
import Variation11LeftStack from "./Variation11LeftStack";
import Variation12Fan from "./Variation12Fan";
import Variation13Rail from "./Variation13Rail";
import StackStyleVariation, { type StackStyle } from "./stackStyles";
import RefinedStackVariation, { type RefinedStack } from "./stackRefined";

/** The eight finished stacks, keyed as the switch names them. */
const REFINED: Record<string, RefinedStack> = {
  r1: "sage",
  r2: "teal",
  r3: "lime",
  r4: "outline",
  r5: "elevated",
  r6: "gradient",
  r7: "tabs",
  r8: "staircase",
};
import type { RevealPanelProps } from "./parts";

/** The eight stack studies, keyed as the switch names them. */
const STACK_STUDIES: Record<string, StackStyle> = {
  s1: "colored",
  s2: "spine",
  s3: "elevated",
  s4: "fanned",
  s5: "stepped",
  s6: "underlay",
  s7: "fold",
  s8: "rail",
};

/**
 * The company's contacts, drawn by whichever concept is selected.
 *
 * Every surface that offers a reveal renders this and nothing else, so the
 * Signals cards, the Prospects cards and the Prospect Details modal are always
 * showing the same concept as each other — which is the only way a comparison
 * between concepts means anything.
 *
 * The panels differ in arrangement alone. All of them read the same company
 * reveal state, spend the same single reveal, and run the same loader and burst,
 * so switching between them changes what is on screen and never what is true.
 */
export default function CompanyContactsReveal(props: RevealPanelProps) {
  const variation = useRevealVariation();
  /* A company with nobody identified has no panel at all, as before. */
  if (!props.contacts.length) return null;

  /* The finalised design, on both of its surfaces: the prospect row from
     1:50, 3:52, 0:1817 and 3:53, and the Prospect Details modal from 5:133. */
  if (variation === "final") {
    return props.layout === "card" ? (
      <ContactStack company={props.company} contacts={props.contacts} />
    ) : (
      <ContactStackModal company={props.company} contacts={props.contacts} />
    );
  }

  const refined = REFINED[variation];
  if (refined) return <RefinedStackVariation {...props} kind={refined} />;

  const study = STACK_STUDIES[variation];
  if (study) return <StackStyleVariation {...props} style={study} />;

  switch (variation) {
    case "current":
      return <VariationCurrent {...props} />;
    case "v2":
      return <Variation2Grouped {...props} />;
    case "v3":
      return <Variation3Deck {...props} />;
    case "v4":
      return <Variation4Expandable {...props} />;
    case "v5":
      return <Variation5RolesFirst {...props} />;
    case "v6":
      return <Variation6Banner {...props} />;
    case "v7":
      return <Variation7Browse {...props} />;
    case "v8":
      return <Variation8Selector {...props} />;
    case "v10":
      return <Variation10DeckInteractive {...props} />;
    case "v11":
      return <Variation11LeftStack {...props} />;
    case "v12":
      return <Variation12Fan {...props} />;
    case "v13":
      return <Variation13Rail {...props} />;
    case "v1":
    default:
      return <Variation1CompanyUnlock {...props} />;
  }
}

export type { RevealPanelProps };
