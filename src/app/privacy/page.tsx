import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy — babycry",
  description:
    "What babycry collects about you (almost nothing) and what it does with it (show it to everyone, on purpose).",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "01 The short version",
    paragraphs: [
      "We collect almost nothing, we don't track you, and the only thing we deliberately share is the bid and payment details you publicly placed — because that's the entire point of the site.",
    ],
  },
  {
    heading: "02 What we collect",
    list: [
      "Product name — the text you type into the bid form.",
      "Product link — the URL you submit with your bid.",
      "Bid amount & time — how much you actually paid and when the timer extended.",
      "Payment transaction records — securely handled and processed via our payment provider (Stripe); we do not store full raw credit card numbers on our servers.",
      "Basic server logs — standard technical records (IP address, browser, timestamp) kept briefly by the hosting infrastructure for security and debugging.",
    ],
  },
  {
    heading: "03 What we never collect",
    list: [
      "No saved credit card numbers or banking passwords — payments are handled securely through Stripe.",
      "No user accounts, passwords, or registration forms — there is no sign-up required.",
      "No tracking cookies, third-party analytics beacons, or advertising pixels.",
      "No location data beyond what standard server logs imply.",
    ],
  },
  {
    heading: "04 What is public by design",
    paragraphs: [
      "Your product name, product link, and bid amount are shown publicly in the leaderboard — and the highest bid is featured on the spotlight card — for as long as the site keeps them. Do not bid on behalf of products you wouldn't want attached to a crying baby.",
    ],
  },
  {
    heading: "05 Cookies & local storage",
    paragraphs: [
      "The site does not set any tracking cookies. Preferences like the sound toggle live in your browser's memory only and vanish when you close the tab — we forget you instantly, like a baby with a new shiny object.",
    ],
  },
  {
    heading: "06 Third-party content & payments",
    paragraphs: [
      "The crying sound effect comes from freesoundslibrary.com (CC BY 4.0) and the lullaby from mixkit.co (Mixkit License). Audio files are hosted locally. Payments are processed securely via Stripe (refer to Stripe's privacy policy for their data handling). External product links in the leaderboard lead to sites we don't control — their privacy policies apply there.",
    ],
  },
  {
    heading: "07 Data retention & deletion",
    paragraphs: [
      "Bids and live database records are stored until the site resets or we clean the nursery. If you want your submission removed, message us on X at @babycry and we'll delete it — no forms, no waiting period, no guilt trip.",
    ],
  },
  {
    heading: "08 Children",
    paragraphs: [
      "Ironically, this site about a baby is not directed at children under 13. If you are a baby and you are reading this, please stop crying.",
    ],
  },
  {
    heading: "09 Changes & contact",
    paragraphs: [
      "We may update this policy; the version posted here is current. Privacy questions go to @abhay8769 on X.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      current="privacy"
      eyebrow="Your data, or the lack of it"
      title="Privacy Policy"
      intro="The most honest privacy policy on the internet: there's barely any data to write one about."
      sections={SECTIONS}
    />
  );
}