import { Webhooks } from "@dodopayments/nextjs";
import { placeBid } from "@/lib/state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRODUCT_ID = "pdt_0NnUbrTyrKtZRtghmGmCg";

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,

  onPaymentSucceeded: async (payload) => {
    const payment = payload.data;

    const metadata = payment.metadata ?? {};

    const productId =
      typeof metadata.productId === "string"
        ? metadata.productId
        : "";

    if (productId !== PRODUCT_ID) {
      console.warn(
        "Ignoring Dodo payment for unexpected product:",
        productId
      );
      return;
    }

    const productName =
      typeof metadata.productName === "string"
        ? metadata.productName.trim()
        : "";

    const productUrl =
      typeof metadata.productUrl === "string"
        ? metadata.productUrl.trim()
        : "";

    if (!productName || !productUrl) {
      console.error(
        "Dodo payment is missing product metadata:",
        payment.payment_id
      );
      return;
    }

    const amountCents = Number(payment.total_amount);

    if (
      !Number.isSafeInteger(amountCents) ||
      amountCents < 100 ||
      amountCents > 100_000
    ) {
      console.error(
        "Dodo payment has invalid payment amount:",
        payment.payment_id,
        payment.total_amount
      );
      return;
    }

    await placeBid({
      productName,
      productUrl,
      amountCents,
      dodoPaymentId: payment.payment_id,
    });

    console.log(
      `babycry contribution created from Dodo payment ${payment.payment_id}: ${amountCents} cents`
    );
  },
});