import Link from "next/link";
import { ArrowLeft, Baby as BabyIcon } from "lucide-react";
import SiteFooter from "./SiteFooter";

const STARS = Array.from({ length: 34 }, (_, i) => ({
  left: (i * 37.13 + 11) % 100,
  top: (i * 53.77 + 7) % 100,
  size: 1 + ((i * 7) % 3),
  dur: 2.2 + ((i * 13) % 40) / 10,
  del: ((i * 29) % 50) / 10,
}));

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
};

type PageKey = "terms" | "privacy" | "rules";

const SIBLINGS: { key: PageKey; label: string; href: string }[] = [
  { key: "terms", label: "Terms", href: "/terms" },
  { key: "privacy", label: "Privacy", href: "/privacy" },
  { key: "rules", label: "Rules", href: "/rules" },
];

export default function LegalPage({
  current,
  eyebrow,
  title,
  intro,
  sections,
}: {
  current: PageKey;
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="app relative min-h-screen" data-state="sleeping">
      <div className="sky sky--night" aria-hidden />
      <div className="stars" aria-hidden>
        {STARS.map((s, i) => (
          <span
            key={i}
            className="star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              ["--dur" as string]: `${s.dur}s`,
              ["--del" as string]: `${s.del}s`,
            }}
          />
        ))}
      </div>
      <div className="celestial" aria-hidden>
        <span className="crater" style={{ left: "26%", top: "46%", width: "18%", height: "18%" }} />
        <span className="crater" style={{ left: "58%", top: "24%", width: "12%", height: "12%" }} />
        <span className="crater" style={{ left: "52%", top: "62%", width: "9%", height: "9%" }} />
      </div>
      <div className="noise" aria-hidden />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[color-mix(in_srgb,var(--bg-deep)_72%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-[#1c1405] shadow-lg shadow-black/30">
              <BabyIcon className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              baby<span className="text-gradient">.cry</span>
            </span>
          </Link>
          <Link href="/" className="btn-ghost !px-4 !py-2 text-xs sm:text-sm">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="max-[420px]:hidden">Back to the nursery</span>
            <span className="min-[420px]:hidden">Nursery</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-4 pt-24 pb-14 sm:px-6 sm:pt-28">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          {intro}
        </p>
        <span className="chip mt-5">Last updated — September 2026</span>

        <div className="glass mt-8 rounded-[1.5rem] p-5 min-[420px]:p-7 sm:rounded-[2rem] sm:p-10">
          <div className="space-y-8 sm:space-y-9">
            {sections.map((s, i) => (
              <section key={s.heading}>
                <h2 className="flex items-baseline gap-3">
                  <span className="digits font-display flex-none text-sm font-semibold text-[var(--accent-2)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-lg font-semibold tracking-tight sm:text-xl">
                    {s.heading}
                  </span>
                </h2>
                {s.paragraphs?.map((p, j) => (
                  <p key={j} className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                    {p}
                  </p>
                ))}
                {s.list && (
                  <ul className="legal-list">
                    {s.list.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>

        <nav className="glass mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 rounded-2xl px-4 py-4 text-xs" aria-label="More pages">
          <span className="text-[var(--faint)]">Keep reading:</span>
          {SIBLINGS.map((s, i) => (
            <span key={s.key} className="flex items-center gap-2">
              {i > 0 && (
                <span className="text-[var(--faint)]" aria-hidden>
                  ·
                </span>
              )}
              {s.key === current ? (
                <span className="font-semibold text-[var(--accent-2)]" aria-current="page">
                  {s.label}
                </span>
              ) : (
                <Link href={s.href} className="text-[var(--muted)] transition hover:text-white">
                  {s.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </main>

      <SiteFooter />
    </div>
  );
}
