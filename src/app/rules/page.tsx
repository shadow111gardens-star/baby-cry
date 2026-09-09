import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Rules — baby.cry",
  description:
    "The official rules of the virtual experience: how the sleep meter, animations, contributions, and sponsor leaderboard work.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "01 Rule one — contributions add virtual sleep time",
    list: [
      "$1 adds exactly 1 hour to the virtual sleep timer. Always.",
      "Smaller contributions scale linearly: $0.10 = 6 minutes, $0.50 = 30 minutes.",
      "Every cent adds 36 seconds of virtual sleep time. $1 = 100 cents = 3,600 seconds = 1 hour.",
      "The conversion applies only to the virtual timer displayed on the website.",
    ],
  },
  {
    heading: "02 Rule two — the virtual meter always runs",
    list: [
      "Virtual sleep time counts down in real time, second by second, even when nobody is watching.",
      "New contributions are added to the remaining time — if the virtual baby is sleeping, the contribution extends the timer from its current expiry.",
      "If the timer reaches zero, a new contribution starts the timer again from the moment it is processed.",
      "There is no pause button for the virtual timer.",
    ],
  },
  {
    heading: "03 Rule three — zero means the crying animation starts",
    paragraphs: [
      "When the virtual timer reaches 00:00, the virtual baby wakes and the website switches to its crying animation. Visitors with sound enabled may hear the site's crying sound effect. The animation changes again when additional virtual sleep time is added.",
    ],
  },
  {
    heading: "04 Rule four — the leaderboard ranks contributions",
    list: [
      "Rank is decided by individual contribution amount, highest first — not by total spent or loyalty.",
      "Tie on amount? The earlier contribution keeps the higher rank. Time is the tiebreaker.",
      "The leaderboard shows the top 15 qualifying contributions.",
      "Ranks update live for every visitor as contributions are processed.",
    ],
  },
  {
    heading: "05 Rule five — rank #1 gets the spotlight",
    list: [
      "The highest qualifying contribution's product name and public link appear on the featured sponsor card next to the leaderboard.",
      "Any qualifying contribution larger than the current top contribution may take the featured sponsor position immediately.",
      "Sponsor placement provides promotional visibility on the babycry website but does not guarantee traffic, impressions, clicks, conversions, sales, or fame.",
    ],
  },
  {
    heading: "06 Rule six — keep it clean",
    list: [
      "Product names and links must be legal, safe for work, and yours to share.",
      "No scams, malware, phishing, hate, spam, fraudulent content, or other harmful material — violators may be removed.",
      "Removed submissions lose their leaderboard and sponsor placement. Refunds are handled according to applicable law and our payment provider's policies.",
    ],
  },
  {
    heading: "07 Rule seven — the baby is virtual",
    paragraphs: [
      "The baby is SVG. The payment is real. The sleep is a digital timestamp. The crying is a sound effect. The timer, reactions, rankings, and sponsor placements are entirely simulated software functionality.",
      "Contributions do not affect any real baby, child, person, animal, physical service, or real-world outcome. Everything happens inside the virtual experience.",
    ],
  },
];

export default function RulesPage() {
  return (
    <LegalPage
      current="rules"
      eyebrow="How the nursery works"
      title="The Rules"
      intro="Seven rules, one virtual baby, zero confusion. Read them once and you'll know exactly how the sleep meter, contributions, and sponsor leaderboard work."
      sections={SECTIONS}
    />
  );
}