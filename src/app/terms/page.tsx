import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms — babycry - bidding your saas",
  description:
    "The terms for an interactive digital experience where voluntary contributions add time to a virtual sleep timer and provide promotional placement.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "01 What this is",
    paragraphs: [
      "crybaby is a live social experiment, digital art project, and interactive entertainment experience built around a virtual baby and a sleep timer. The virtual baby, sleep timer, sounds, animations, leaderboard, and sponsor placements exist entirely within the website. No real baby, child, person, animal, or physical service is involved. By using the site, you agree to these terms.",
    ],
  },
  {
    heading: "02 Payments & transactions",
    paragraphs: [
      'All contributions are real payments processed securely by our payment provider. When you make a contribution, the corresponding amount is added to the virtual sleep timer according to the conversion displayed on the website. The current conversion is "$1 = 1 hour of virtual sleep time." Contributions are voluntary purchases supporting the digital experience and associated promotional placement. They do not purchase, control, or affect any real-world person, child, animal, service, or physical outcome. All completed contributions are final except where a refund is required by applicable law or our payment provider’s policies.',
    ],
  },
  {
    heading: "03 The sponsors & the leaderboard",
    list: [
      "Every accepted contribution may be displayed publicly on the leaderboard together with the product name and public link submitted by the contributor.",
      "The leaderboard is ranked by contribution amount, highest first. Ties go to the earlier contribution.",
      "The highest qualifying contribution may receive the featured sponsor position until another qualifying contribution takes the position.",
      "Sponsor placement does not guarantee traffic, impressions, clicks, conversions, sales, or any other business result.",
    ],
  },
  {
    heading: "04 Your submissions",
    paragraphs: [
      "Only submit a product name and public URL that you have the legal right to use. Do not submit illegal, hateful, explicit, misleading, fraudulent, malicious, or dangerous content, including scams, malware, phishing, or other harmful material. We may review, edit, reject, or remove any submission at any time.",
    ],
  },
  {
    heading: "05 Fair play",
    paragraphs: [
      "Do not attempt to abuse, disrupt, manipulate, scrape aggressively, automate spam submissions, or otherwise interfere with the website, payment system, leaderboard, or virtual timer. We may rate-limit, suspend, or block activity that violates these terms or negatively affects the experience for other users.",
    ],
  },
  {
    heading: "06 The virtual baby",
    paragraphs: [
      "The baby is a digital character created using SVG graphics, animations, audio, and backend logic. Its crying is a sound effect, its sleep is a digital timer value, and its behavior is simulated software functionality. No real child or infant is involved in the operation of the service.",
    ],
  },
  {
    heading: "07 Availability & changes",
    paragraphs: [
      "The website may become unavailable, reset, or change its mechanics at any time. Timer values, leaderboard rankings, sponsor positions, and other digital states may change or reset. We may update these terms from time to time. The latest version published on this page will apply to future use of the service.",
    ],
  },
  {
    heading: "08 Liability",
    paragraphs: [
      "The service is provided “as is” without warranties of any kind, to the extent permitted by applicable law. We are not responsible for indirect losses, lost profits, lost opportunities, interruptions, or other damages arising from use of the service, except where liability cannot legally be excluded.",
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
      intro="Legally speaking: real money moves, the baby exists only in code, and your contribution supports the virtual sleep experience."
      sections={SECTIONS}
    />
  );
}