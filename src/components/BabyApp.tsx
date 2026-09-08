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
  const [sync, setSync] = useState(() => ({ data: initial, at: Date.now() }));
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
    const t = setInterval(() => setNowMs(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  /* live sync — poll + refresh when tab becomes visible */
  useEffect(() => {
    const t = setInterval(refresh, 8000);
    const onVis = () => {
      if (document.visibilityState === "visible") void refresh();
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
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const data = sync.data;
  const offsetMs = new Date(data.serverNow).getTime() - sync.at;
  const serverNowMs = mounted
    ? nowMs + offsetMs
    : new Date(data.serverNow).getTime();
  const sleepUntilMs = data.sleepUntil ? new Date(data.sleepUntil).getTime() : null;
  const remainingMs = sleepUntilMs === null ? 0 : sleepUntilMs - serverNowMs;
  const sleeping = remainingMs > 0;
  const hadFunds = sleepUntilMs !== null;
  const awakeMs = !sleeping && hadFunds ? serverNowMs - (sleepUntilMs as number) : 0;

  //useNurseryAudio(soundOn, mounted && !sleeping);

  const { unlockAudio } = useNurseryAudio(
  soundOn,
  mounted && !sleeping
);

  const showToast = useCallback((msg: string) => {
    setToast({ id: Date.now(), msg });
  }, []);

  const handleBidSuccess = useCallback(
    (state: BabyState, msAdded: number, tookSpotlight: boolean) => {
      setSync({ data: state, at: Date.now() });
      setModalOpen(false);
      showToast(
        tookSpotlight
          ? `+${sleepLabel(msAdded)} funded — spotlight secured. Sleep tight, advertiser.`
          : `+${sleepLabel(msAdded)} of silence funded. The baby approves.`
      );
    },
    [showToast]
  );

  return (
    <div className="app relative min-h-screen" data-state={sleeping ? "sleeping" : "crying"}>
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
        <span className="crater" style={{ left: "26%", top: "46%", width: "18%", height: "18%" }} />
        <span className="crater" style={{ left: "58%", top: "24%", width: "12%", height: "12%" }} />
        <span className="crater" style={{ left: "52%", top: "62%", width: "9%", height: "9%" }} />
      </div>
      <div className="noise" aria-hidden />

      {/* ------------------------------ nav ------------------------------ */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[color-mix(in_srgb,var(--bg-deep)_72%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-[#1c1405] shadow-lg shadow-black/30">
              <BabyIcon className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              shhh<span className="text-gradient">.baby</span>
            </span>
          </a>

          <div className="flex items-center gap-2 sm:gap-3">
            <div
              aria-live="polite"
              className={`chip font-semibold uppercase tracking-widest ${
                sleeping ? "text-[var(--good)]" : "text-[var(--danger)]"
              }`}
            >
              <span className="status-dot">
                <span />
              </span>
              <span className="max-[420px]:hidden">{sleeping ? "Sleeping" : "Crying"}</span>
            </div>

            <button
              type="button"
              //onClick={() => setSoundOn((v) => !v)}

               onClick={() => {
                  if (!soundOn) {
                  void unlockAudio();
                  }

            setSoundOn((v) => !v);
          }}
              aria-pressed={soundOn}
              title={soundOn ? "Mute the baby" : "Baby sounds — real cry when awake, lullaby when asleep"}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                soundOn
                  ? "border-[var(--accent-2)]/50 bg-[color-mix(in_srgb,var(--accent-2)_16%,transparent)] text-[var(--accent-2)]"
                  : "border-white/12 bg-white/5 text-[var(--muted)] hover:bg-white/10"
              }`}
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              aria-label="Fund the nap"
              className="btn-primary !rounded-full !p-2.5 sm:hidden"
            >
              <Coins className="h-4 w-4" />
            </button>
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
      <main id="top" className="relative z-10 mx-auto max-w-6xl px-4 pt-24 sm:px-6 sm:pt-28">
        <section className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* stage */}
          <div
            className={`glass relative overflow-hidden rounded-[2rem] p-6 transition-colors duration-1000 sm:p-10 ${
              sleeping ? "" : "border-[var(--accent-2)]/40"
            }`}
          >
            <div className="halo" aria-hidden />
            <div className="relative flex items-center justify-between gap-3">
              <p className="eyebrow">
                {sleeping ? "Nursery — live" : "Nursery — code red"}
              </p>
              <span className="chip">
                {sleeping ? (
                  <>
                    <MoonStar className="h-3.5 w-3.5 text-[var(--good)]" />
                    breathing steadily — do not disturb
                  </>
                ) : (
                  <>
                    <AlarmClock className="h-3.5 w-3.5 text-[var(--danger)]" />
                    screaming at ~96 dB (unverified)
                  </>
                )}
              </span>
            </div>

            <div className="relative mx-auto mt-2 w-full max-w-[min(430px,86vw)]">
              <Baby />
            </div>

            <div className="relative flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  {sleeping ? "silence tank" : "tank status"}
                </p>
                <p className="digits mt-1 text-xl font-semibold sm:text-2xl">
                  {sleeping ? (
                    formatHMS(remainingMs)
                  ) : (
                    <span className="text-[var(--danger)]">EMPTY</span>
                  )}
                </p>
              </div>
              <p className="max-w-[46%] text-right text-xs leading-relaxed text-[var(--faint)]">
                {sleeping
                  ? "the nap continues until the very last paid second"
                  : "the baby stopped sleeping the moment the money did"}
              </p>
            </div>
          </div>

          {/* control panel */}
          <div className="flex flex-col justify-center gap-6 py-2 lg:py-6 lg:pl-4">
            <div>
              <p className="eyebrow">
                <Sparkles className="h-3.5 w-3.5 text-[var(--accent-2)]" />
                A live social experiment — silence is for sale
              </p>
              <h1 className="font-display mt-4 text-4xl min-[420px]:text-5xl leading-[1.02] font-semibold tracking-tight sm:text-6xl xl:text-[4.4rem]">
                Keep the baby{" "}
                <span className="text-gradient">
                  {sleeping ? "asleep" : "quiet"}
                </span>
                .
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--muted)] sm:text-lg">
                An extremely real baby runs on money. Every{" "}
                <strong className="font-semibold text-white">$1 buys exactly 1 minute</strong>{" "}
                of sleep. When the tank hits zero, it screams — and the biggest
                bidder&apos;s product owns the spotlight.
              </p>
            </div>

            {/* countdown */}
            <div className="glass rounded-3xl p-5 sm:p-6">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                {sleeping ? (
                  <>
                    <Timer className="h-3.5 w-3.5 text-[var(--good)]" /> sleep remaining
                  </>
                ) : hadFunds ? (
                  <>
                    <AlarmClock className="h-3.5 w-3.5 text-[var(--danger)]" /> awake — funds ran out
                  </>
                ) : (
                  <>
                    <AlarmClock className="h-3.5 w-3.5 text-[var(--danger)]" /> awake — the meter has never been fed
                  </>
                )}
              </p>
              <p
                className={`digits font-display mt-2 text-5xl min-[420px]:text-6xl font-semibold tracking-tight sm:text-7xl ${
                  sleeping ? "" : "text-[var(--danger)]"
                }`}
              >
                {sleeping
                  ? formatHMS(remainingMs)
                  : hadFunds
                    ? formatHMS(awakeMs)
                    : "00:00:00"}
              </p>
              <p className="mt-2 text-xs text-[var(--faint)]">
                {sleeping
                  ? `$1 = 1 minute · ${formatMoney(1)} keeps it down until ${formatHMS(remainingMs + 60_000)}`
                  : "each new bid silences it instantly and starts the clock again"}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => setModalOpen(true)} className="btn-primary">
                <Coins className="h-4.5 w-4.5" />
                {sleeping ? "Add sleep — $1/min" : "Emergency bid — stop the crying"}
              </button>
              <a href="#sponsors" className="btn-ghost">
                See the spotlight
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <p className="-mt-3 text-xs text-[var(--faint)]">
              Secure live payments. Every bid extends the baby's sleep in real-time.
            </p>

            {/* stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="glass rounded-2xl p-4">
                <Timer className="h-4 w-4 text-[var(--accent)]" />
                <p className="digits mt-2 text-lg font-semibold sm:text-xl">
                  {sleepLabel(data.totalMs)}
                </p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wider text-[var(--faint)]">
                  total funded
                </p>
              </div>
              <div className="glass rounded-2xl p-4">
                <TrendingUp className="h-4 w-4 text-[var(--accent)]" />
                <p className="digits mt-2 text-lg font-semibold sm:text-xl">{data.totalBids}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wider text-[var(--faint)]">
                  bids placed
                </p>
              </div>
              <div className="glass rounded-2xl p-4">
                <Crown className="h-4 w-4 text-[var(--accent-2)]" />
                <p className="digits mt-2 text-lg font-semibold sm:text-xl">
                  {data.topBid ? formatMoney(data.topBid.amountCents) : "—"}
                </p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wider text-[var(--faint)]">
                  top bid
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ------------------------------ marquee ------------------------------ */}
      <div className="marquee relative z-10 mt-14" aria-hidden>
        <div className="marquee-track font-display text-sm font-medium uppercase tracking-[0.3em] text-[var(--muted)]">
          {[0, 1].map((half) => (
            <span key={half}>
              <span>BABYCRY</span> 
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent-2)]" />
              <span>$1 = 1 minute of silence</span>
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent-2)]" />
              <span>When the meter dies, the baby cries</span>
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent-2)]" />
              <span>Top bid takes the spotlight</span>
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent-2)]" />
              <span>BABY IS HUNGRY FOR ACTUAL CASH</span>
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent-2)]" />
            </span>
          ))}
        </div>
      </div>

      {/* ------------------------------ sponsors ------------------------------ */}
      <section id="sponsors" className="relative z-10 mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Sponsors</p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
              The <span className="text-gradient">spotlight</span> &amp; the leaderboard
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-[var(--muted)]">
            Ranked purely by bid amount — pay more, climb higher. Rank #1&apos;s
            product owns the spotlight card.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          {/* spotlight */}
          {data.topBid ? (
            <SpotlightCard bid={data.topBid} nowMs={serverNowMs} onOutbid={() => setModalOpen(true)} />
          ) : (
            <div className="glass relative flex flex-col items-start overflow-hidden rounded-[2rem] p-8 sm:p-10">
              <Crown className="absolute -top-8 -right-8 h-40 w-40 rotate-12 opacity-[0.06]" />
              <p className="eyebrow">
                <Crown className="h-3.5 w-3.5 text-[var(--accent-2)]" /> Top bidder — spotlight
              </p>
              <h3 className="font-display mt-4 text-3xl font-semibold sm:text-4xl">
                This seat is empty.
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
                The baby is livid and nobody&apos;s product is up here. Historic
                opportunity — any bid makes you the inaugural sponsor.
              </p>
              <button type="button" onClick={() => setModalOpen(true)} className="btn-primary mt-6">
                <Crown className="h-4 w-4" />
                Claim the throne — $1
              </button>
            </div>
          )}

          {/* leaderboard */}
          <div className="glass rounded-[2rem] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 px-2 pb-3">
              <p className="eyebrow">
                <Medal className="h-3.5 w-3.5 text-[var(--accent-2)]" /> Leaderboard — by amount
              </p>
              <span className="chip digits">{data.totalBids} total</span>
            </div>
            {data.leaderboard.length === 0 ? (
              <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 text-center">
                <BedDouble className="h-6 w-6 text-[var(--faint)]" />
                <p className="text-sm text-[var(--muted)]">No bids yet.</p>
                <p className="max-w-[240px] text-xs text-[var(--faint)]">
                  Be the first name the baby dreams about.
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
                      className="bid-row group flex items-center gap-3 px-2.5 py-2.5 sm:px-3"
                    >
                      <RankBadge rank={i + 1} />
                      <span className="min-w-0 grow">
                        <span className="flex items-center gap-1.5">
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
                            i === 0 ? "text-[var(--accent-2)]" : "text-white"
                          }`}
                        >
                          {formatMoney(bid.amountCents)}
                        </span>
                        <span className="block text-[11px] text-[var(--muted)]">
                          +{sleepLabel(bid.msPurchased)} · {timeAgo(bid.createdAt, serverNowMs)}
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
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <p className="eyebrow mb-8">The rules of the nursery</p>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              n: "01",
              icon: Coins,
              title: "Feed the meter",
              body: "$1 buys exactly one minute of sleep. $0.10 buys six seconds. The baby does not negotiate.",
            },
            {
              n: "02",
              icon: BedDouble,
              title: "Silence while funded",
              body: "The second the tank hits zero the wailing resumes. Top up before expiry and the nap never breaks.",
            },
            {
              n: "03",
              icon: Megaphone,
              title: "Top bid gets famous",
              body: "The biggest single bid owns the spotlight — product name and live link, seen by everyone checking on a screaming baby.",
            },
          ].map((c) => (
            <div key={c.n} className="glass group relative overflow-hidden rounded-[2rem] p-7 transition-transform duration-300 hover:-translate-y-1">
              <span className="font-display absolute -top-4 right-4 text-[5.5rem] leading-none font-bold text-white/[0.045] select-none">
                {c.n}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)]/25 to-[var(--accent-2)]/25 text-[var(--accent-2)]">
                <c.icon className="h-5 w-5" />
              </span>
              <h3 className="font-display mt-5 text-xl font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------ footer ------------------------------ */}
      <SiteFooter />

      {/* ------------------------------ modal & toast ------------------------------ */}
      <BidModal
        open={modalOpen}
        topCents={data.topBid ? data.topBid.amountCents : null}
        onClose={() => setModalOpen(false)}
        onSuccess={handleBidSuccess}
      />

      {toast && (
        <div
          key={toast.id}
          role="status"
          className="toast glass fixed left-1/2 z-[110] flex max-w-[92vw] items-center gap-2.5 rounded-2xl px-5 py-3.5 text-sm font-medium shadow-2xl shadow-black/50"
        >
          <CheckCircle2 className="h-4.5 w-4.5 flex-none text-[var(--good)]" />
          {toast.msg}
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
    <div className="glass relative flex flex-col overflow-hidden rounded-[2rem] p-8 sm:p-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(420px 260px at 85% -10%, color-mix(in srgb, var(--accent-2) 16%, transparent), transparent 70%)",
        }}
        aria-hidden
      />
      <Crown className="absolute -top-8 -right-8 h-44 w-44 rotate-12 text-[var(--accent-2)] opacity-[0.08]" />

      <p className="eyebrow relative">
        <Crown className="h-3.5 w-3.5 text-[var(--accent-2)]" /> Top bidder — spotlight
      </p>

      <a
        href={bid.productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative mt-4 inline-flex flex-wrap items-center gap-3"
      >
        <h3 className="font-display text-4xl leading-tight font-semibold tracking-tight group-hover:underline sm:text-5xl">
          {bid.productName}
        </h3>
      </a>
      <a
        href={bid.productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="chip relative mt-4 w-fit transition hover:border-[var(--accent-2)]/50 hover:text-white"
      >
        <ExternalLink className="h-3.5 w-3.5 text-[var(--accent-2)]" />
        {domainOf(bid.productUrl)}
      </a>

      <div className="relative mt-8 grid grid-cols-3 gap-2 border-t border-white/10 pt-6 sm:gap-3">
        <div>
          <p className="digits text-lg font-semibold text-[var(--accent-2)] sm:text-2xl">
            {formatMoney(bid.amountCents)}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-wider text-[var(--faint)]">winning bid</p>
        </div>
        <div>
          <p className="digits text-lg font-semibold sm:text-2xl">+{sleepLabel(bid.msPurchased)}</p>
          <p className="mt-1 text-[11px] uppercase tracking-wider text-[var(--faint)]">sleep bought</p>
        </div>
        <div>
          <p className="digits text-lg font-semibold sm:text-2xl">{timeAgo(bid.createdAt, nowMs)}</p>
          <p className="mt-1 text-[11px] uppercase tracking-wider text-[var(--faint)]">placed</p>
        </div>
      </div>

      <div className="relative mt-8 flex flex-wrap items-center gap-3">
        <button type="button" onClick={onOutbid} className="btn-ghost">
          <Crown className="h-4 w-4 text-[var(--accent-2)]" />
          Outbid them
        </button>
          <p className="text-xs text-[var(--faint)]">
          any single bid above {formatMoney(bid.amountCents)} steals this card
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
