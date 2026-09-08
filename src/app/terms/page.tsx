import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms — babycry",
  description:
    "The slightly-too-serious terms for a website where real payments keep a virtual baby asleep.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "01 What this is",
    paragraphs: [
      "crybaby is a live social experiment, an art project, and a small joke with a real database. A virtual baby sleeps while its timer is funded and starts crying the instant the money runs out. By using the site, you agree to these terms. If you don't agree, close the tab — the baby will cry either way.",
    ],
  },
  {
    heading: "02 Live payments & transactions",
    paragraphs: [
      'All bids are real and securely processed. When you fund the baby’s sleep, your card is charged, money moves, and the timer extends accordingly ("$1 = 1 minute of sleep"). Because funds go toward keeping the baby asleep and maintaining the experiment, all contributions are final. If you thought you bought something else, you have been outsmarted by a baby.',
    ],
  },
  {
    heading: "03 The spotlight & the leaderboard",
    list: [
      "Every accepted bid is shown publicly on the leaderboard with your submitted product name and link.",
      "The leaderboard is ranked by bid amount, highest first. Ties go to the earlier bid.",
      "Rank #1 also owns the spotlight card until a higher single bid takes it.",
      "We make no promise of traffic, impressions, clicks, conversions, or fame. This is not a formal advertising platform; it is a baby with a very short nap schedule.",
    ],
  },
  {
    heading: "04 Your submissions",
    paragraphs: [
      "Only submit a product name and link you have the legal right to use. Do not submit anything illegal, hateful, explicit, misleading, or dangerous — no scams, malware, or phishing. Links go out unvetted to every visitor, so behave. We may edit or remove any submission at any time, for any reason, without notice.",
    ],
  },
  {
    heading: "05 Fair play",
    paragraphs: [
      "Do not attack, scrape aggressively, automate spam bids, or otherwise try to break the meter, the leaderboard, or the baby. We reserve the right to rate-limit or block anything that ruins the nap for everyone else.",
    ],
  },
  {
    heading: "06 The baby",
    paragraphs: [
      "The baby is SVG code and backend logic. No infants were involved, consulted, or harmed in the making of this site. Its crying is a sound effect, its sleep is a timestamp, and its feelings cannot be hurt — which is more than we can say for yours.",
    ],
  },
  {
    heading: "07 Availability & changes",
    paragraphs: [
      "The site may go offline, reset, or change mechanics at any time without warning. Sleep balances, ranks, and spotlight positions have no persistence guarantee. We may update these terms at any time; the version posted here is the one that applies.",
    ],
  },
  {
    heading: "08 Liability",
    paragraphs: [
      "The site is provided “as is”, without warranties of any kind. We are not liable for lost profits, lost sleep, sudden crying, or any damages arising from using — or listening to — babycry.",
    ],
  },
  {
    heading: "09 Contact",
    paragraphs: [
      "Questions, support, or lullabies: reach us on X at @abhay8769.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      current="terms"
      eyebrow="The fine print"
      title="Terms of Service"
      intro="Legally speaking: real money moves, the baby exists only in code, and your contribution keeps the virtual nursery quiet."
      sections={SECTIONS}
    />
  );
}