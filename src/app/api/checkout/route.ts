import { NextResponse } from "next/server";
import { dodo } from "@/lib/dodo";
import { isValidHttpUrl, normalizeUrl } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRODUCT_ID = "pdt_0NnUbrTyrKtZRtghmGmCg";

const MIN_CENTS = 100; // $1
const MAX_CENTS = 100_000; // $1,000

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const productName =
      typeof body.productName === "string"
        ? body.productName.trim()
        : "";

    const productUrl = normalizeUrl(
      typeof body.productUrl === "string"
        ? body.productUrl
        : ""
    );

    const amountUsd =
      typeof body.amountUsd === "number"
        ? body.amountUsd
        : typeof body.amountUsd === "string"
          ? Number.parseFloat(body.amountUsd)
          : NaN;

    if (productName.length < 2 || productName.length > 60) {
      return NextResponse.json(
        {
          ok: false,
          error: "Product name must be 2–60 characters.",
        },
        { status: 400 }
      );
    }

    if (!isValidHttpUrl(productUrl)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Please enter a valid product URL.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amountUsd)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Enter a valid contribution amount.",
        },
        { status: 400 }
      );
    }

    const amountCents = Math.round(amountUsd * 100);

    if (
      amountCents < MIN_CENTS ||
      amountCents > MAX_CENTS
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Contribution must be between $1 and $1,000.",
        },
        { status: 400 }
      );
    }

    const checkout = await dodo.checkoutSessions.create({
      product_cart: [
        {
          product_id: PRODUCT_ID,
          quantity: 1,
          amount: amountCents,
        },
      ],

      metadata: {
        productId: PRODUCT_ID,
        productName,
        productUrl,
        amountCents: String(amountCents),
      },

      return_url: "https://www.babycry.lol/",
    });

    return NextResponse.json({
      ok: true,
      checkoutUrl: checkout.checkout_url,
      sessionId: checkout.session_id,
    });
  } catch (error) {
    console.error("Dodo checkout creation failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to create checkout. Please try again.",
      },
      { status: 500 }
    );
  }
}