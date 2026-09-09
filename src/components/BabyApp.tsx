"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlarmClock,
  ArrowRight,
  Baby as BabyIcon,
  BedDouble,
  CheckCircle2,
  Coins,
  Crown,
  ExternalLink,
  Medal,
  Megaphone,
  MoonStar,
  Sparkles,
  Timer,
  TrendingUp,
  Volume2,
  VolumeX,
} from "lucide-react";
import Baby from "./Baby";
import BidModal from "./BidModal";
import SiteFooter from "./SiteFooter";
import { useNurseryAudio } from "./useNurseryAudio";
import {
  domainOf,
  formatHMS,
  formatMoney,
  sleepLabel,
  timeAgo,
} from "@/lib/format";
import type { BabyState, PublicBid } from "@/lib/state";

/* deterministic star field — no Math.random, so SSR matches client */
const STARS = Array.from({ length: 48 }, (_, i) => ({
  left: (i * 37.13 + 11) % 100,
  top: (i * 53.77 + 7) % 100,
  size: 1 + ((i * 7) % 3),
  dur: 2.2 + ((i * 13) % 40) / 10,
  del: ((i * 29) % 50) / 10,
}));

export default function BabyApp({ initial }: { initial: BabyState }) {
  const [sync, setSync] = useState(() => ({
    data: initial,
    at: Date.now(),
  }));

  const [mounted, setMounted] = useState(false);
  const [nowMs, setNowMs] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [toast, setToast] = useState<{ id: number; msg: string } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/state", { cache: "no-store" });

      if (res.ok) {
        const data = (await res.json()) as BabyState;
        setSync({ data, at: Date.now() });
      }
    } catch {
      /* keep last known state */
    }
  }, []);

  /* ticking clock */
  useEffect(() => {
    setMounted(true);
    setNowMs(Date.now());

    const t = setInterval(() => {
      setNowMs(Date.now());
    }, 250);

    return () => clearInterval(t);
  }, []);

  /* live sync — poll + refresh when tab becomes visible */
  useEffect(() => {
    const t = setInterval(refresh, 8000);

    const onVis = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };

    document.addEventListener("visibilitychange", onVis);

    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refresh]);

  /* toast auto-dismiss */
  useEffect(() => {
    if (!toast) return;

    const t = setTimeout(() => {
      setToast(null);
    }, 4500);

    return () => clearTimeout(t);
  }, [toast]);

  const data = sync.data;

  const offsetMs = new Date(data.serverNow).getTime() - sync.at;

  const serverNowMs = mounted
    ? nowMs + offsetMs
    : new Date(data.serverNow).getTime();

  const sleepUntilMs = data.sleepUntil
    ? new Date(data.sleepUntil).getTime()
    : null;

  const remainingMs =
    sleepUntilMs === null ? 0 : sleepUntilMs - serverNowMs;

  const sleeping = remainingMs > 0;
  const hadFunds = sleepUntilMs !== null;

  const awakeMs =
    !sleeping && hadFunds
      ? serverNowMs - (sleepUntilMs as number)
      : 0;

  const { unlockAudio } = useNurseryAudio(
    soundOn,
    mounted && !sleeping
  );

  const showToast = useCallback((msg: string) => {
    setToast({
      id: Date.now(),
      msg,
    });
  }, []);

  const handleBidSuccess = useCallback(
    (
      state: BabyState,
      msAdded: number,
      tookSpotlight: boolean
    ) => {
      setSync({
        data: state,
        at: Date.now(),
      });

      setModalOpen(false);

      showToast(
        tookSpotlight
          ? `+${sleepLabel(
              msAdded
            )} funded — spotlight secured. Sleep tight, advertiser.`
          : `+${sleepLabel(
              msAdded
            )} of silence funded. The baby approves.`
      );
    },
    [showToast]
  );

  return (
    <div
      className="app relative min-h-screen overflow-x-hidden"
      data-state={sleeping ? "sleeping" : "crying"}
    >
      <div className="sky sky--night" aria-hidden />
      <div className="sky sky--alarm" aria-hidden />

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
        <span
          className="crater"
          style={{
            left: "26%",
            top: "46%",
            width: "18%",
            height: "18%",
          }}
        />
        <span
          className="crater"
          style={{
            left: "58%",
            top: "24%",
            width: "12%",
            height: "12%",
          }}
        />
        <span
          className="crater"
          style={{
            left: "52%",
            top: "62%",
            width: "9%",
            height: "9%",
          }}
        />
      </div>

      <div className="noise" aria-hidden />

      {/* ------------------------------ nav ------------------------------ */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[color-mix(in_srgb,var(--bg-deep)_78%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:px-6">
          {/* brand */}
          <a
            href="#top"
            className="flex min-w-0 shrink-0 items-center gap-2.5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-[#1c1405] shadow-lg shadow-black/30">
              <BabyIcon
                className="h-5 w-5"
                strokeWidth={2.4}
              />
            </span>

            <span className="font-display text-base font-semibold tracking-tight xs:text-lg">
              baby<span className="text-gradient">.cry</span>
            </span>
          </a>

          {/* controls */}
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
            {/* status */}
            <div
              aria-live="polite"
              className={`chip shrink-0 font-semibold uppercase tracking-[0.16em] sm:tracking-widest ${
                sleeping
                  ? "text-[var(--good)]"
                  : "text-[var(--danger)]"
              }`}
            >
              <span className="status-dot">
                <span />
              </span>

              <span className="hidden min-[430px]:inline">
                {sleeping ? "Sleeping" : "Crying"}
              </span>
            </div>

            {/* sound */}
            <button
              type="button"
              onClick={() => {
                if (!soundOn) {
                  void unlockAudio();
                }

                setSoundOn((v) => !v);
              }}
              aria-pressed={soundOn}
              title={
                soundOn
                  ? "Mute the baby"
                  : "Baby sounds — real cry when awake, lullaby when asleep"
              }
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${
                soundOn
                  ? "border-[var(--accent-2)]/50 bg-[color-mix(in_srgb,var(--accent-2)_16%,transparent)] text-[var(--accent-2)]"
                  : "border-white/12 bg-white/5 text-[var(--muted)] hover:bg-white/10"
              }`}
            >
              {soundOn ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </button>

            {/* mobile CTA */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              aria-label="Fund the nap"
              className="btn-primary !h-9 !rounded-full !p-2.5 sm:hidden"
            >
              <Coins className="h-4 w-4" />
            </button>

            {/* desktop CTA */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn-primary hidden !px-5 !py-2.5 text-sm sm:inline-flex"
            >
              <Coins className="h-4 w-4" />
              Fund the nap
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------ hero ------------------------------ */}
      <main
        id="top"
        className="relative z-10 mx-auto w-full max-w-6xl px-3 pt-20 sm:px-6 sm:pt-28"
      >
        <section className="grid items-stretch gap-5 sm:gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* stage */}
          <div
            className={`glass relative overflow-hidden rounded-[1.5rem] p-4 transition-colors duration-1000 xs:p-5 sm:rounded-[2rem] sm:p-10 ${
              sleeping ? "" : "border-[var(--accent-2)]/40"
            }`}
          >
            <div className="halo" aria-hidden />

            <div className="relative flex flex-wrap items-center justify-between gap-2 sm:gap-3">
              <p className="eyebrow">
                {sleeping
                  ? "Nursery — live"
                  : "Nursery — code red"}
              </p>

              <span className="chip max-w-full">
                {sleeping ? (
                  <>
                    <MoonStar className="h-3.5 w-3.5 shrink-0 text-[var(--good)]" />
                    <span className="truncate">
                      breathing steadily — do not disturb
                    </span>
                  </>
                ) : (
                  <>
                    <AlarmClock className="h-3.5 w-3.5 shrink-0 text-[var(--danger)]" />
                    <span className="truncate">
                      screaming at ~96 dB (unverified)
                    </span>
                  </>
                )}
              </span>
            </div>

            <div className="relative mx-auto mt-1 w-full max-w-[min(430px,92vw)] sm:mt-2">
              <Baby />
            </div>

            <div className="relative flex items-end justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] sm:text-[11px] sm:tracking-[0.22em]">
                  {sleeping
                    ? "silence tank"
                    : "tank status"}
                </p>

                <p className="digits mt-1 text-lg font-semibold sm:text-2xl">
                  {sleeping ? (
                    formatHMS(remainingMs)
                  ) : (
                    <span className="text-[var(--danger)]">
                      EMPTY
                    </span>
                  )}
                </p>
              </div>

              <p className="max-w-[55%] text-right text-[11px] leading-relaxed text-[var(--faint)] sm:max-w-[46%] sm:text-xs">
                {sleeping
                  ? "the nap continues until the very last paid second"
                  : "the baby stopped sleeping the moment the money did"}
              </p>
            </div>
          </div>

          {/* control panel */}
          <div className="flex min-w-0 flex-col justify-center gap-5 py-1 sm:gap-6 sm:py-2 lg:py-6 lg:pl-4">
            <div>
              <p className="eyebrow">
                <Sparkles className="h-3.5 w-3.5 text-[var(--accent-2)]" />
                A virtual social experience — support keeps the baby sleeping.
              </p>

              <h1 className="font-display mt-3 text-[2.65rem] font-semibold leading-[0.98] tracking-tight min-[430px]:text-5xl sm:mt-4 sm:text-6xl xl:text-[4.4rem]">
                Keep the Virtual baby{" "}
                <span className="text-gradient">
                  {sleeping ? "asleep" : "sleeping"}
                </span>
                .
              </h1>

              <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)] min-[430px]:text-base sm:text-lg">
                A virtual baby runs on the community sleep meter Every{" "}
                <strong className="font-semibold text-white">
                  $1 adds exactly 1 minute virtual sleep timer.
                </strong>{" "}
                of sleep. When the tank hits zero, it screams —
                and thetop sponsor’s product&apos;s product owns the
                spotlight.
              </p>
            </div>

            {/* countdown */}
            <div className="glass rounded-2xl p-4 xs:rounded-3xl xs:p-5 sm:p-6">
              <p className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--muted)] sm:text-[11px] sm:tracking-[0.22em]">
                {sleeping ? (
                  <>
                    <Timer className="h-3.5 w-3.5 shrink-0 text-[var(--good)]" />
                    sleep remaining
                  </>
                ) : hadFunds ? (
                  <>
                    <AlarmClock className="h-3.5 w-3.5 shrink-0 text-[var(--danger)]" />
                    awake — funds ran out
                  </>
                ) : (
                  <>
                    <AlarmClock className="h-3.5 w-3.5 shrink-0 text-[var(--danger)]" />
                    awake — the meter has never been fed
                  </>
                )}
              </p>

              <p
                className={`digits font-display mt-2 break-words text-[2.9rem] font-semibold leading-none tracking-tight min-[430px]:text-5xl sm:text-7xl ${
                  sleeping ? "" : "text-[var(--danger)]"
                }`}
              >
                {sleeping
                  ? formatHMS(remainingMs)
                  : hadFunds
                    ? formatHMS(awakeMs)
                    : "00:00:00"}
              </p>

              <p className="mt-2 text-[11px] leading-relaxed text-[var(--faint)] sm:text-xs">
                {sleeping
                  ? `$1 = 1 minute · ${formatMoney(
                      1
                    )} keeps it down until ${formatHMS(
                      remainingMs + 60_000
                    )}`
                  : "each new bid silences it instantly and starts the clock again"}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex w-full flex-col gap-2.5 min-[430px]:flex-row min-[430px]:items-center sm:gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="btn-primary w-full min-[430px]:w-auto"
              >
                <Coins className="h-4.5 w-4.5 shrink-0" />
                <span className="truncate">
                  {sleeping
                    ? "Add sleep — $1/min"
                    : "Add sleep time"}
                </span>
              </button>

              <a
                href="#sponsors"
                className="btn-ghost w-full justify-center min-[430px]:w-auto"
              >
                See the spotlight
                <ArrowRight className="h-4 w-4 shrink-0" />
              </a>
            </div>

            <p className="-mt-2 text-xs leading-relaxed text-[var(--faint)]">
              Secure live payments. Every bid extends the baby's
              sleep in real-time.
            </p>

            {/* stats */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              <div className="glass min-w-0 rounded-xl p-3 xs:rounded-2xl xs:p-4">
                <Timer className="h-4 w-4 text-[var(--accent)]" />

                <p className="digits mt-2 truncate text-base font-semibold min-[430px]:text-lg sm:text-xl">
                  {sleepLabel(data.totalMs)}
                </p>

                <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-[var(--faint)] min-[430px]:text-[10px] sm:text-[11px] sm:tracking-wider">
                  total funded
                </p>
              </div>

              <div className="glass min-w-0 rounded-xl p-3 xs:rounded-2xl xs:p-4">
                <TrendingUp className="h-4 w-4 text-[var(--accent)]" />

                <p className="digits mt-2 truncate text-base font-semibold min-[430px]:text-lg sm:text-xl">
                  {data.totalBids}
                </p>

                <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-[var(--faint)] min-[430px]:text-[10px] sm:text-[11px] sm:tracking-wider">
                  bids placed
                </p>
              </div>

              <div className="glass min-w-0 rounded-xl p-3 xs:rounded-2xl xs:p-4">
                <Crown className="h-4 w-4 text-[var(--accent-2)]" />

                <p className="digits mt-2 truncate text-base font-semibold min-[430px]:text-lg sm:text-xl">
                  {data.topBid
                    ? formatMoney(data.topBid.amountCents)
                    : "—"}
                </p>

                <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-[var(--faint)] min-[430px]:text-[10px] sm:text-[11px] sm:tracking-wider">
                  top bid
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ------------------------------ marquee ------------------------------ */}
      <div
        className="marquee relative z-10 mt-10 overflow-hidden sm:mt-14"
        aria-hidden
      >
        <div className="marquee-track font-display text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)] sm:text-sm sm:tracking-[0.3em]">
          {[0, 1].map((half) => (
            <span key={half}>
              <span>BABYCRY</span>
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent-2)]" />
              <span>$1 = 1 minute of sleep</span>
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent-2)]" />
              <span>WHEN THE TIMER HITS ZERO, THE BABY CRIES</span>
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent-2)]" />
              <span>Top sponsor's product takes the spotlight</span>
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent-2)]" />
              <span>BABY IS HUNGRY</span>
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent-2)]" />
            </span>
          ))}
        </div>
      </div>

      {/* ------------------------------ sponsors ------------------------------ */}
      <section
        id="sponsors"
        className="relative z-10 mx-auto w-full max-w-6xl scroll-mt-20 px-3 py-12 sm:scroll-mt-24 sm:px-6 sm:py-20"
      >
        <div className="mb-7 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="eyebrow">Sponsors</p>

            <h2 className="font-display mt-3 text-3xl font-semibold leading-tight tracking-tight min-[430px]:text-4xl sm:text-5xl">
              The{" "}
              <span className="text-gradient">
                spotlight
              </span>{" "}
              &amp; the leaderboard
            </h2>
          </div>

          <p className="max-w-xs text-sm leading-relaxed text-[var(--muted)]">
            Ranked purely by bid amount — pay more, climb
            higher. Rank #1&apos;s product owns the spotlight
            card.
          </p>
        </div>

        <div className="grid min-w-0 gap-5 sm:gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          {/* spotlight */}
          {data.topBid ? (
            <SpotlightCard
              bid={data.topBid}
              nowMs={serverNowMs}
              onOutbid={() => setModalOpen(true)}
            />
          ) : (
            <div className="glass relative flex flex-col items-start overflow-hidden rounded-[1.5rem] p-6 xs:p-7 sm:rounded-[2rem] sm:p-10">
              <Crown className="absolute -top-8 -right-8 h-32 w-32 rotate-12 opacity-[0.06] sm:h-40 sm:w-40" />

              <p className="eyebrow">
                <Crown className="h-3.5 w-3.5 text-[var(--accent-2)]" />
                Top sponsor — spotlight
              </p>

              <h3 className="font-display mt-4 text-2xl font-semibold leading-tight sm:text-4xl">
                This seat is empty.
              </h3>

              <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
                Be the first sponsor to get featured here. Add your brand and showcase your product to everyone.
                you the inaugural sponsor.
              </p>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="btn-primary mt-6"
              >
                <Crown className="h-4 w-4" />
                Become the top sponsor — $1
              </button>
            </div>
          )}

          {/* leaderboard */}
          <div className="glass min-w-0 rounded-[1.5rem] p-4 xs:p-5 sm:rounded-[2rem] sm:p-6">
            <div className="flex min-w-0 items-center justify-between gap-2 px-1 pb-3 sm:px-2">
              <p className="eyebrow min-w-0">
                <Medal className="h-3.5 w-3.5 shrink-0 text-[var(--accent-2)]" />
                <span className="truncate">
                  Leaderboard — by amount
                </span>
              </p>

              <span className="chip digits shrink-0">
                {data.totalBids} total
              </span>
            </div>

            {data.leaderboard.length === 0 ? (
              <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 px-4 text-center">
                <BedDouble className="h-6 w-6 text-[var(--faint)]" />

                <p className="text-sm text-[var(--muted)]">
                  No contributions yet.
                </p>

                <p className="max-w-[240px] text-xs text-[var(--faint)]">
                  Be the first to support the baby's sleep.
                </p>
              </div>
            ) : (
              <ul className="nice-scroll max-h-[430px] space-y-1 overflow-y-auto pr-1">
                {data.leaderboard.map((bid, i) => (
                  <li key={bid.id}>
                    <a
                      href={bid.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bid-row group flex min-w-0 items-center gap-2.5 px-1.5 py-2.5 sm:gap-3 sm:px-3"
                    >
                      <RankBadge rank={i + 1} />

                      <span className="min-w-0 grow">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span className="truncate text-sm font-semibold text-white group-hover:underline">
                            {bid.productName}
                          </span>

                          <ExternalLink className="h-3 w-3 flex-none text-[var(--faint)] transition group-hover:text-[var(--accent-2)]" />
                        </span>

                        <span className="mt-0.5 block truncate text-xs text-[var(--faint)]">
                          {domainOf(bid.productUrl)}
                        </span>
                      </span>

                      <span className="flex-none text-right">
                        <span
                          className={`digits block text-sm font-semibold ${
                            i === 0
                              ? "text-[var(--accent-2)]"
                              : "text-white"
                          }`}
                        >
                          {formatMoney(bid.amountCents)}
                        </span>

                        <span className="block text-[10px] text-[var(--muted)] sm:text-[11px]">
                          +{sleepLabel(bid.msPurchased)} ·{" "}
                          {timeAgo(
                            bid.createdAt,
                            serverNowMs
                          )}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------ how it works ------------------------------ */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-3 pb-14 sm:px-6 sm:pb-20">
        <p className="eyebrow mb-7 sm:mb-8">
          The rules of the nursery
        </p>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {[
            {
              n: "01",
              icon: Coins,
              title: "Add to the sleep meter",
              body: "Every $1 adds 1 minute to the virtual sleep timer. Smaller amounts scale accordingly.",
            },
            {
              n: "02",
              icon: BedDouble,
              title: "Sleep while funded",
              body: "The baby stays asleep while the timer has time. When it hits zero, the crying starts again. Add more time to keep it sleeping.",
            },
            {
              n: "03",
              icon: Megaphone,
              title: "Top sponsor gets spotlight",
              body: "The highest single contribution gets featured — product name and live link, visible to everyone visiting the site.",
            },
          ].map((c) => (
            <div
              key={c.n}
              className="glass group relative min-w-0 overflow-hidden rounded-[1.5rem] p-5 transition-transform duration-300 hover:-translate-y-1 xs:p-7 sm:rounded-[2rem]"
            >
              <span className="font-display absolute -top-3 right-3 select-none text-[4.5rem] font-bold leading-none text-white/[0.045] sm:-top-4 sm:right-4 sm:text-[5.5rem]">
                {c.n}
              </span>

              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)]/25 to-[var(--accent-2)]/25 text-[var(--accent-2)]">
                <c.icon className="h-5 w-5" />
              </span>

              <h3 className="font-display mt-5 text-xl font-semibold">
                {c.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------ footer ------------------------------ */}
      <SiteFooter />

      {/* ------------------------------ modal & toast ------------------------------ */}
      <BidModal
        open={modalOpen}
        topCents={
          data.topBid ? data.topBid.amountCents : null
        }
        onClose={() => setModalOpen(false)}
        onSuccess={handleBidSuccess}
      />

      {toast && (
        <div
          key={toast.id}
          role="status"
          className="toast glass fixed left-1/2 z-[110] flex w-[calc(100%-1.5rem)] max-w-[92vw] -translate-x-1/2 items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium shadow-2xl shadow-black/50 sm:w-auto sm:px-5 sm:py-3.5"
        >
          <CheckCircle2 className="h-4.5 w-4.5 flex-none text-[var(--good)]" />
          <span className="min-w-0">
            {toast.msg}
          </span>
        </div>
      )}
    </div>
  );
}

function SpotlightCard({
  bid,
  nowMs,
  onOutbid,
}: {
  bid: PublicBid;
  nowMs: number;
  onOutbid: () => void;
}) {
  return (
    <div className="glass relative flex min-w-0 flex-col overflow-hidden rounded-[1.5rem] p-6 xs:p-7 sm:rounded-[2rem] sm:p-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(420px 260px at 85% -10%, color-mix(in srgb, var(--accent-2) 16%, transparent), transparent 70%)",
        }}
        aria-hidden
      />

      <Crown className="absolute -top-8 -right-8 h-36 w-36 rotate-12 text-[var(--accent-2)] opacity-[0.08] sm:h-44 sm:w-44" />

      <p className="eyebrow relative">
        <Crown className="h-3.5 w-3.5 text-[var(--accent-2)]" />
        Top sponsor — spotlight
      </p>

      <a
        href={bid.productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative mt-4 inline-flex min-w-0 max-w-full flex-wrap items-center gap-3"
      >
        <h3 className="font-display max-w-full break-words text-3xl font-semibold leading-tight tracking-tight group-hover:underline sm:text-5xl">
          {bid.productName}
        </h3>
      </a>

      <a
        href={bid.productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="chip relative mt-4 w-fit max-w-full min-w-0 transition hover:border-[var(--accent-2)]/50 hover:text-white"
      >
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[var(--accent-2)]" />

        <span className="truncate">
          {domainOf(bid.productUrl)}
        </span>
      </a>

      <div className="relative mt-7 grid grid-cols-3 gap-2 border-t border-white/10 pt-5 xs:mt-8 xs:gap-3 xs:pt-6">
        <div className="min-w-0">
          <p className="digits truncate text-base font-semibold text-[var(--accent-2)] xs:text-lg sm:text-2xl">
            {formatMoney(bid.amountCents)}
          </p>

          <p className="mt-1 text-[9px] uppercase tracking-[0.1em] text-[var(--faint)] xs:text-[10px] sm:text-[11px] sm:tracking-wider">
            winning bid
          </p>
        </div>

        <div className="min-w-0">
          <p className="digits truncate text-base font-semibold xs:text-lg sm:text-2xl">
            +{sleepLabel(bid.msPurchased)}
          </p>

          <p className="mt-1 text-[9px] uppercase tracking-[0.1em] text-[var(--faint)] xs:text-[10px] sm:text-[11px] sm:tracking-wider">
            sleep bought
          </p>
        </div>

        <div className="min-w-0">
          <p className="digits truncate text-base font-semibold xs:text-lg sm:text-2xl">
            {timeAgo(bid.createdAt, nowMs)}
          </p>

          <p className="mt-1 text-[9px] uppercase tracking-[0.1em] text-[var(--faint)] xs:text-[10px] sm:text-[11px] sm:tracking-wider">
            placed
          </p>
        </div>
      </div>

      <div className="relative mt-7 flex flex-col items-start gap-3 xs:mt-8 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onOutbid}
          className="btn-ghost w-full sm:w-auto"
        >
          <Crown className="h-4 w-4 text-[var(--accent-2)]" />
          Outbid them
        </button>

        <p className="text-xs leading-relaxed text-[var(--faint)]">
          any single bid above{" "}
          {formatMoney(bid.amountCents)} steals this card
        </p>
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span
        className="flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-2)] to-[var(--accent)] text-[#241308] shadow-md shadow-black/40"
        title="Rank #1 — owns the spotlight"
      >
        <Crown className="h-4 w-4" strokeWidth={2.5} />
      </span>
    );
  }

  if (rank === 2) {
    return (
      <span className="digits flex h-8 w-8 flex-none items-center justify-center rounded-xl border border-slate-200/30 bg-slate-200/10 text-xs font-bold text-slate-200">
        2
      </span>
    );
  }

  if (rank === 3) {
    return (
      <span className="digits flex h-8 w-8 flex-none items-center justify-center rounded-xl border border-[#cd7f32]/40 bg-[#cd7f32]/10 text-xs font-bold text-[#dda06b]">
        3
      </span>
    );
  }

  return (
    <span className="digits flex h-8 w-8 flex-none items-center justify-center text-xs font-semibold text-[var(--faint)]">
      #{rank}
    </span>
  );
}