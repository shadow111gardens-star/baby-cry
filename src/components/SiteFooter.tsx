import Link from "next/link";
import XLogo from "./XLogo";

const linkCls = "transition text-[var(--muted)] hover:text-white";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 border-t border-white/5 py-7">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center text-xs sm:flex-row sm:justify-between sm:px-6 sm:text-left">
        <p className="text-[var(--faint)]">
          <span className="font-display font-semibold text-[var(--muted)]">
            © {year} @babycry
          </span>{" "}
          — all rights reserved.
        </p>

        <nav className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2" aria-label="Footer">
          <Link href="/terms" className={linkCls}>
            Terms
          </Link>
          <span className="text-[var(--faint)]" aria-hidden>·</span>
          <Link href="/privacy" className={linkCls}>
            Privacy
          </Link>
          <span className="text-[var(--faint)]" aria-hidden>·</span>
          <Link href="/rules" className={linkCls}>
            Rules
          </Link>
          <a
            href="https://x.com/abhay8769"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="@babycry on X"
            title="@babycry on X"
            className="ml-1.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/5 text-[var(--muted)] transition hover:border-white/30 hover:bg-white/10 hover:text-white"
          >
            <XLogo className="h-3.5 w-3.5" />
          </a>
        </nav>

         <p className="mx-auto mt-4 max-w-3xl text-center text-[10px] leading-relaxed text-[var(--faint)] sm:text-left">
          Disclaimer: babycry is an independent interactive software experiment.
          Payments are real and non-refundable. By submitting a product name and
          URL, you authorize us to display that information publicly on the
          leaderboard and spotlight. babycry does not guarantee traffic, clicks,
          sales, or business results.
        </p>
      </div>
    </footer>
  );
}
