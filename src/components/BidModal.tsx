/*"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  Check,
  Crown,
  Link2,
  Loader2,
  MoonStar,
  Tag,
  X,
} from "lucide-react";
import type { BabyState } from "@/lib/state";
import { formatMoney, sleepLabel } from "@/lib/format";

const PRESETS = [1, 5, 10, 25];

type FieldErrors = {
  productName?: string;
  productUrl?: string;
  amountUsd?: string;
  form?: string;
};

export default function BidModal({
  open,
  topCents,
  onClose,
  onSuccess,
}: {
  open: boolean;
  topCents: number | null;
  onClose: () => void;
  onSuccess: (state: BabyState, msAdded: number, tookSpotlight: boolean) => void;
}) {
  const [productName, setProductName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [amount, setAmount] = useState("5");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  // reset every time it opens
  useEffect(() => {
    if (open) {
      setProductName("");
      setProductUrl("");
      setAmount("5");
      setErrors({});
      setPending(false);
    }
  }, [open]);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    },
    [onClose, pending]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onKey]);

  const cents = useMemo(() => {
    const parsed = Number.parseFloat(amount.replace(",", "."));
    return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
  }, [amount]);

  const ms = cents * 600;
  const wouldTakeSpotlight = cents > 0 && (topCents === null || cents > topCents);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setErrors({});
    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          productUrl,
          amountUsd: cents / 100,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrors(data.errors ?? { form: "Something went wrong. Try again." });
        setPending(false);
        return;
      }
      setPending(false);
      onSuccess(data.state as BabyState, data.bid.msPurchased as number, wouldTakeSpotlight);
    } catch {
      setErrors({ form: "Network hiccup — try again." });
      setPending(false);
    }
  }

  return (
    <div
      //className="modal-overlay fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-4 sm:items-center"
      onClick={pending ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Place a bid to extend the baby's sleep"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        //className="modal-panel glass w-full max-w-md rounded-3xl p-6 shadow-2xl shadow-black/50 sm:p-7"
        className="modal-panel w-full max-w-md rounded-3xl border border-white/10 bg-[#160f15]/95 p-6 shadow-2xl shadow-black/60 backdrop-blur-xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">
              <MoonStar className="h-3.5 w-3.5 text-gradient" strokeWidth={2.4} />
              Buy silence
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight">
              Bid for baby sleep
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
              $1 = 1 minute. Your product takes the feed — outbid everyone and
              it takes the spotlight.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label="Close"
            className="rounded-full border border-white/10 bg-white/5 p-2 text-[var(--muted)] transition hover:bg-white/12 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="bm-name" className="field-label mb-2">
              <Tag className="h-3.5 w-3.5" /> Product name
            </label>
            <input
              id="bm-name"
              autoFocus
              className="field-input"
              placeholder="NapStack 3000"
              value={productName}
              maxLength={60}
              onChange={(e) => setProductName(e.target.value)}
            />
            {errors.productName && (
              <p className="mt-1.5 text-xs text-rose-300">{errors.productName}</p>
            )}
          </div>

          <div>
            <label htmlFor="bm-url" className="field-label mb-2">
              <Link2 className="h-3.5 w-3.5" /> Product link
            </label>
            <input
              id="bm-url"
              className="field-input"
              placeholder="https://yourproduct.com"
              inputMode="url"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
            />
            {errors.productUrl && (
              <p className="mt-1.5 text-xs text-rose-300">{errors.productUrl}</p>
            )}
          </div>

          <div>
            <label htmlFor="bm-amount" className="field-label mb-2">
              <BadgeDollarSign className="h-3.5 w-3.5" /> Bid amount
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(String(p))}
                  className={`preset-chip ${cents === p * 100 ? "active" : ""}`}
                >
                  ${p}
                </button>
              ))}
            </div>
            <div className="field-input mt-2 flex items-center px-4">
  <span className="shrink-0 text-sm font-semibold text-[var(--muted)]">
    $
  </span>

  <input
    id="bm-amount"
    className="min-w-0 flex-1 border-0 bg-transparent p-0 pl-2 text-sm font-medium text-white outline-none focus:ring-0"
    placeholder="5.00"
    inputMode="decimal"
    value={amount}
    onChange={(e) => {
      const v = e.target.value;
      if (/^\d{0,6}([.,]\d{0,2})?$/.test(v) || v === "") {
        setAmount(v);
      }
    }}
  />

  <span className="ml-3 shrink-0 text-xs text-[var(--faint)]">
    = {cents > 0 ? sleepLabel(ms) : "0s"} of sleep
  </span>
</div>
            {errors.amountUsd && (
              <p className="mt-1.5 text-xs text-rose-300">{errors.amountUsd}</p>
            )}
          </div>

          {wouldTakeSpotlight && (
            <div className="flex items-center gap-2.5 rounded-xl border border-[var(--accent-2)]/35 bg-[color-mix(in_srgb,var(--accent-2)_12%,transparent)] px-3.5 py-2.5 text-xs font-medium text-[var(--accent-2)]">
              <Crown className="h-4 w-4 shrink-0" />
              This bid would steal the sponsor spotlight.
            </div>
          )}
          {!wouldTakeSpotlight && cents > 0 && topCents !== null && (
            <p className="text-xs text-[var(--faint)]">
              Spotlight needs more than {formatMoney(topCents)} in a single bid.
            </p>
          )}

          {errors.form && (
            <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200">
              {errors.form}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button type="button" className="btn-ghost flex-none" onClick={onClose} disabled={pending}>
            Cancel
          </button>
          <button type="submit" className="btn-primary grow" disabled={pending || cents < 1}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" strokeWidth={3} />
            )}
            {pending
              ? "Feeding the meter…"
              : `Feed the meter — ${formatMoney(Math.max(cents, 0))}`}
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-[var(--faint)]">
          Secure live checkout via Polar. All bids are final and real money keeps the baby asleep.
        </p>
      </form>
    </div>
  );
}*/

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  Check,
  Crown,
  Link2,
  Loader2,
  MoonStar,
  Tag,
  X,
} from "lucide-react";
import type { BabyState } from "@/lib/state";
import { formatMoney, sleepLabel } from "@/lib/format";

const PRESETS = [1, 5, 10, 25];

type FieldErrors = {
  productName?: string;
  productUrl?: string;
  amountUsd?: string;
  form?: string;
};

export default function BidModal({
  open,
  topCents,
  onClose,
  onSuccess,
}: {
  open: boolean;
  topCents: number | null;
  onClose: () => void;
  onSuccess: (
    state: BabyState,
    msAdded: number,
    tookSpotlight: boolean
  ) => void;
}) {
  const [productName, setProductName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [amount, setAmount] = useState("5");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  // Reset every time the modal opens.
  useEffect(() => {
    if (open) {
      setProductName("");
      setProductUrl("");
      setAmount("5");
      setErrors({});
      setPending(false);
    }
  }, [open]);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) {
        onClose();
      }
    },
    [onClose, pending]
  );

  useEffect(() => {
    if (!open) return;

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onKey]);

  const cents = useMemo(() => {
    const parsed = Number.parseFloat(amount.replace(",", "."));
    return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
  }, [amount]);

  const ms = cents * 600;

  const wouldTakeSpotlight =
    cents > 0 && (topCents === null || cents > topCents);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (pending) return;

    setPending(true);
    setErrors({});

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName,
          productUrl,
          amountUsd: cents / 100,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrors({
          form: data.error ?? "Unable to start checkout. Try again.",
        });
        setPending(false);
        return;
      }

      // Redirect directly to Polar checkout.
      window.location.href = data.checkoutUrl;
    } catch {
      setErrors({
        form: "Network hiccup — try again.",
      });
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-4 sm:items-center"
      onClick={pending ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Place a bid to extend the baby's sleep"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="modal-panel w-full max-w-md rounded-3xl border border-white/10 bg-[#160f15]/95 p-6 shadow-2xl shadow-black/60 backdrop-blur-xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">
              <MoonStar
                className="h-3.5 w-3.5 text-gradient"
                strokeWidth={2.4}
              />
              Buy silence
            </p>

            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight">
              Bid for baby sleep
            </h2>

            <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
              $1 = 1 minute. Your product takes the feed — outbid everyone and
              it takes the spotlight.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label="Close"
            className="rounded-full border border-white/10 bg-white/5 p-2 text-[var(--muted)] transition hover:bg-white/12 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="bm-name" className="field-label mb-2">
              <Tag className="h-3.5 w-3.5" />
              Product name
            </label>

            <input
              id="bm-name"
              autoFocus
              className="field-input"
              placeholder="NapStack 3000"
              value={productName}
              maxLength={60}
              onChange={(e) => setProductName(e.target.value)}
            />

            {errors.productName && (
              <p className="mt-1.5 text-xs text-rose-300">
                {errors.productName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="bm-url" className="field-label mb-2">
              <Link2 className="h-3.5 w-3.5" />
              Product link
            </label>

            <input
              id="bm-url"
              className="field-input"
              placeholder="https://yourproduct.com"
              inputMode="url"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
            />

            {errors.productUrl && (
              <p className="mt-1.5 text-xs text-rose-300">
                {errors.productUrl}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="bm-amount" className="field-label mb-2">
              <BadgeDollarSign className="h-3.5 w-3.5" />
              Bid amount
            </label>

            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(String(p))}
                  className={`preset-chip ${
                    cents === p * 100 ? "active" : ""
                  }`}
                >
                  ${p}
                </button>
              ))}
            </div>

            <div className="field-input mt-2 flex items-center px-4">
              <span className="shrink-0 text-sm font-semibold text-[var(--muted)]">
                $
              </span>

              <input
                id="bm-amount"
                className="min-w-0 flex-1 border-0 bg-transparent p-0 pl-2 text-sm font-medium text-white outline-none focus:ring-0"
                placeholder="5.00"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  const v = e.target.value;

                  if (
                    /^\d{0,6}([.,]\d{0,2})?$/.test(v) ||
                    v === ""
                  ) {
                    setAmount(v);
                  }
                }}
              />

              <span className="ml-3 shrink-0 text-xs text-[var(--faint)]">
                = {cents > 0 ? sleepLabel(ms) : "0s"} of sleep
              </span>
            </div>

            {errors.amountUsd && (
              <p className="mt-1.5 text-xs text-rose-300">
                {errors.amountUsd}
              </p>
            )}
          </div>

          {wouldTakeSpotlight && (
            <div className="flex items-center gap-2.5 rounded-xl border border-[var(--accent-2)]/35 bg-[color-mix(in_srgb,var(--accent-2)_12%,transparent)] px-3.5 py-2.5 text-xs font-medium text-[var(--accent-2)]">
              <Crown className="h-4 w-4 shrink-0" />
              This bid would steal the sponsor spotlight.
            </div>
          )}

          {!wouldTakeSpotlight &&
            cents > 0 &&
            topCents !== null && (
              <p className="text-xs text-[var(--faint)]">
                Spotlight needs more than {formatMoney(topCents)} in a
                single bid.
              </p>
            )}

          {errors.form && (
            <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200">
              {errors.form}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            className="btn-ghost flex-none"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn-primary grow"
            disabled={pending || cents < 100}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" strokeWidth={3} />
            )}

            {pending
              ? "Opening checkout…"
              : `Feed the meter — ${formatMoney(Math.max(cents, 0))}`}
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-[var(--faint)]">
          Secure live checkout via Polar. All bids are final and real money
          keeps the baby asleep.
        </p>
      </form>
    </div>
  );
}
