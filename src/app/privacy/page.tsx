import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy — babycry",
  description:
    "What babycry collects about you and how that information is used to operate the interactive digital experience.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "01 The short version",
    paragraphs: [
      "We collect only the information needed to operate the babycry website, process contributions, display sponsor information, and maintain the service. We do not require user accounts or passwords.",
    ],
  },
  {
    heading: "02 What we collect",
    list: [
      "Product name — the text you submit through the sponsor form.",
      "Product link — the public URL you submit with your contribution.",
      "Contribution amount & time — the amount contributed and the time the contribution was made.",
      "Payment transaction records — securely handled and processed by our third-party payment provider. We do not store full raw credit card numbers on our servers.",
      "Basic server logs — standard technical information such as IP address, browser type, timestamp, and request information may be temporarily processed by our hosting infrastructure for security, reliability, and debugging.",
    ],
  },
  {
    heading: "03 What we do not collect",
    list: [
      "We do not store full credit card numbers or banking passwords on our servers.",
      "We do not require user accounts, passwords, or registration forms.",
      "We do not intentionally use tracking cookies, advertising pixels, or third-party analytics beacons.",
      "We do not intentionally collect precise location information.",
    ],
  },
  {
    heading: "04 What is public by design",
    paragraphs: [
      "If you submit a product name and public product link, that information may be displayed publicly on the website together with your contribution amount and leaderboard position. Featured sponsor information may also be displayed prominently on the site.",
      "Only submit information that you are comfortable making publicly available. We are not responsible for information that you voluntarily submit for public display.",
    ],
  },
  {
    heading: "05 Cookies & local storage",
    paragraphs: [
      "The site does not intentionally use tracking cookies. Preferences such as the sound toggle may be stored locally in your browser. This local storage is used only to provide basic website functionality and preferences.",
    ],
  },
  {
    heading: "06 Third-party content & payments",
    paragraphs: [
      "The crying sound effect comes from freesoundslibrary.com (CC BY 4.0) and the lullaby from mixkit.co (Mixkit License). Audio files are hosted locally.",
      "Payments are processed securely by our third-party payment provider. We do not receive or store full raw payment card details on our servers. The payment provider may collect and process information according to its own privacy policy and terms.",
      "External product links displayed on the website lead to websites and services that we do not control. Once you leave babycry, the privacy practices of the destination website apply.",
    ],
  },
  {
    heading: "07 Data retention & deletion",
    paragraphs: [
      "Sponsor submissions and related website records may be retained for as long as they are needed to operate the service, maintain the leaderboard, comply with legal obligations, resolve disputes, or maintain security.",
      "If you want a publicly displayed sponsor submission removed, message us on X at @babycry and provide enough information for us to identify the submission. We may remove or modify eligible submissions where appropriate.",
    ],
  },
  {
    heading: "08 Children",
    paragraphs: [
      "babycry is an interactive digital entertainment service and is not directed toward children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided personal information to us, please contact us so we can review and remove it where appropriate.",
    ],
  },
  {
    heading: "09 Changes & contact",
    paragraphs: [
      "We may update this Privacy Policy from time to time to reflect changes to the service, technology, or legal requirements. The latest version published on this page will apply from its effective date.",
      "Privacy questions or data-related requests can be sent to us on X at @abhay8769.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      current="privacy"
      eyebrow="Your data, or the lack of it"
      title="Privacy Policy"
      intro="We collect only the information needed to operate the interactive experience, process contributions, and display sponsor information."
      sections={SECTIONS}
    />
  );
}