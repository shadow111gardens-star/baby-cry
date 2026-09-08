import { NextResponse } from "next/server";
import { getBabyState, placeBid } from "@/lib/state";
import { isValidHttpUrl, normalizeUrl } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_CENTS = 1; // $0.01 == 36 seconds of sleep
const MAX_CENTS = 100_000; // $1,000

type FieldErrors = {
  productName?: string;
  productUrl?: string;
  amountUsd?: string;
  form?: string;
};

export async function GET() {
  const state = await getBabyState();
  return NextResponse.json(state, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, errors: { form: "Invalid request body." } },
      { status: 400 }
    );
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const productName = typeof raw.productName === "string" ? raw.productName.trim() : "";
  const productUrl = normalizeUrl(typeof raw.productUrl === "string" ? raw.productUrl : "");
  const amountUsd =
    typeof raw.amountUsd === "number"
      ? raw.amountUsd
      : typeof raw.amountUsd === "string"
        ? Number.parseFloat(raw.amountUsd)
        : NaN;

  const errors: FieldErrors = {};

  if (productName.length < 2 || productName.length > 60) {
    errors.productName = "Give it a name — 2 to 60 characters.";
  }
  if (!isValidHttpUrl(productUrl)) {
    errors.productUrl = "Needs a valid link, e.g. https://yourproduct.com.";
  }
  if (!Number.isFinite(amountUsd)) {
    errors.amountUsd = "Enter an amount in dollars.";
  }

  const amountCents = Number.isFinite(amountUsd) ? Math.round(amountUsd * 100) : 0;
  if (Number.isFinite(amountUsd) && (amountCents < MIN_CENTS || amountCents > MAX_CENTS)) {
    errors.amountUsd = "Between $0.01 and $1,000.00.";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  try {
    const { bid, state } = await placeBid({
      productName,
      productUrl,
      amountCents,
    });
    return NextResponse.json({ ok: true, bid, state });
  } catch (error) {
    console.error("Failed to place bid:", error);
    return NextResponse.json(
      { ok: false, errors: { form: "The nursery hiccuped. Try again." } },
      { status: 500 }
    );
  }
}
