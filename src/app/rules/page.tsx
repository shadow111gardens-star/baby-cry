import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Rules — baby.cry",
  description:
    "The official rules of the nursery: how the meter, the sleep, the crying, and the leaderboard work.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "01 Rule one — money is sleep",
    list: [
      "$1 buys exactly 1 minute of baby sleep. Always.",
      "Smaller bids scale linearly: $0.10 = 6 seconds, $0.50 = 30 seconds.",
      "Every cent buys 600 milliseconds. $1 = 100 cents = 60,000 ms = 1 minute. The math is not negotiable.",
    ],
  },
  {
    heading: "02 Rule two — the meter always runs",
    list: [
      "Paid sleep counts down in real time, second by second, even when nobody is watching.",
      "New bids stack on top of remaining time — if the baby is asleep, your bid extends the nap from its current expiry.",
      "If the tank is empty, your bid starts fresh from the moment it lands.",
      "There is no pause button. Babies respect no schedule.",
    ],
  },
  {
    heading: "03 Rule three — zero means crying",
    paragraphs: [
      "The instant the meter hits 00:00, the baby wakes and starts crying: the whole site flips to red alert, and anyone with sound enabled hears the wail. It stops only when a new bid lands.",
    ],
  },
  {
    heading: "04 Rule four — the leaderboard ranks amounts",
    list: [
      "Rank is decided by single-bid amount, highest first — not by total spent, not by loyalty.",
      "Tie on amount? The earlier bid keeps the higher rank. Speed is the tiebreaker.",
      "The leaderboard shows the top 15 bids.",
      "Ranks update live for every visitor as bids land.",
    ],
  },
  {
    heading: "05 Rule five — rank #1 takes the spotlight",
    list: [
      "The highest single bid's product name and link appear on the spotlight card next to the leaderboard.",
      "Any single bid larger than the current top bid steals the spotlight immediately.",
      "Losing the spotlight costs nothing emotionally, we are told. It feels like a lot.",
    ],
  },
  {
    heading: "06 Rule six — keep it clean",
    list: [
      "Product names and links must be legal, safe for work, and yours to share.",
      "No scams, malware, phishing, hate, or spam — violators are removed without ceremony.",
      "Removed bids keep no rank, no spotlight, and — because all bids are final — no refund either.",
    ],
  },
  {
    heading: "07 Rule seven — the baby is not real",
    paragraphs: [
      "The baby is SVG. The money is real. The sleep is a timestamp. The only real things on this site are the sound of crying and your competitive urge to be rank #1. Spend accordingly.",
    ],
  },
];

export default function RulesPage() {
  return (
    <LegalPage
      current="rules"
      eyebrow="How the nursery works"
      title="The Rules"
      intro="Seven rules, one baby, zero mercy. Read them once and you'll know more than 99% of bidders."
      sections={SECTIONS}
    />
  );
}