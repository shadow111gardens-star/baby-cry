import { Webhooks } from "@polar-sh/nextjs";
import { placeBid } from "@/lib/state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRODUCT_ID = "d30560fd-c40a-4bcf-971e-d8400fb3a12a";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  onOrderPaid: async (payload) => {
    const order = payload.data;

    const metadata = order.metadata ?? {};

    const productId =
      typeof metadata.productId === "string"
        ? metadata.productId
        : "";

    if (productId !== PRODUCT_ID) {
      console.warn(
        "Ignoring order for unexpected product:",
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
        "Polar order is missing bid metadata:",
        order.id
      );
      return;
    }

    const amountCents = Number(order.totalAmount);

    if (
      !Number.isSafeInteger(amountCents) ||
      amountCents < 100
    ) {
      console.error(
        "Polar order has invalid payment amount:",
        order.id,
        order.totalAmount
      );
      return;
    }

    await placeBid({
      productName,
      productUrl,
      amountCents,
    });

    console.log(
      `Cry Baby bid created from paid Polar order ${order.id}: ${amountCents} cents`
    );
  },
});