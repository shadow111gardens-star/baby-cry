import { NextResponse } from "next/server";
import { polar } from "@/lib/polar";
import { isValidHttpUrl, normalizeUrl } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRODUCT_ID = "d30560fd-c40a-4bcf-971e-d8400fb3a12a";
const MIN_CENTS = 100;
const MAX_CENTS = 100_000;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const productName =
      typeof body.productName === "string" ? body.productName.trim() : "";

    const productUrl = normalizeUrl(
      typeof body.productUrl === "string" ? body.productUrl : ""
    );

    const amountUsd =
      typeof body.amountUsd === "number"
        ? body.amountUsd
        : typeof body.amountUsd === "string"
          ? Number.parseFloat(body.amountUsd)
          : NaN;

    if (productName.length < 2 || productName.length > 60) {
      return NextResponse.json(
        { ok: false, error: "Product name must be 2–60 characters." },
        { status: 400 }
      );
    }

    if (!isValidHttpUrl(productUrl)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid product URL." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amountUsd)) {
      return NextResponse.json(
        { ok: false, error: "Enter a valid bid amount." },
        { status: 400 }
      );
    }

    const amountCents = Math.round(amountUsd * 100);

    if (amountCents < MIN_CENTS || amountCents > MAX_CENTS) {
      return NextResponse.json(
        { ok: false, error: "Bid must be between $1 and $1,000." },
        { status: 400 }
      );
    }

    const checkout = await polar.checkouts.create({
      products: [PRODUCT_ID],

      prices: {
        [PRODUCT_ID]: [
          {
            amountType: "custom",
            priceCurrency: "usd",
            minimumAmount: amountCents,
          },
        ],
      },

      metadata: {
         productId: PRODUCT_ID,
        productName,
        productUrl,
        amountCents,
      },

      successUrl:
        "https://www.babycry.lol/?payment=success&checkout_id={CHECKOUT_ID}",

      returnUrl: "https://www.babycry.lol/",
    });

    return NextResponse.json({
      ok: true,
      checkoutUrl: checkout.url,
    });
  } catch (error) {
    console.error("Polar checkout creation failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to create checkout. Please try again.",
      },
      { status: 500 }
    );
  }
}