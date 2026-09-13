import { asc, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { bids, sleepState } from "@/db/schema";

export type PublicBid = {
  id: number;
  productName: string;
  productUrl: string;
  amountCents: number;
  msPurchased: number;
  createdAt: string;
};

export type BabyState = {
  /** Server clock, ISO — the client offsets its own clock against this. */
  serverNow: string;

  /** Paid sleep expires at this instant. */
  sleepUntil: string | null;

  /** When the current crying period started. */
  cryingSince: string | null;

  totalBids: number;
  totalCents: number;
  totalMs: number;

  /** Highest single contribution — owns the spotlight. */
  topBid: PublicBid | null;

  /** Ranked by contribution amount, highest first. */
  leaderboard: PublicBid[];
}

function toPublicBid(row: typeof bids.$inferSelect): PublicBid {
  return {
    id: row.id,
    productName: row.productName,
    productUrl: row.productUrl,
    amountCents: row.amountCents,
    msPurchased: row.msPurchased,
    createdAt: row.createdAt.toISOString(),
  };
}

async function ensureSleepRow() {
  await db.execute(
    sql`
      INSERT INTO sleep_state (id, crying_since)
      VALUES (1, NOW())
      ON CONFLICT (id) DO NOTHING
    `
  );
}

export async function getBabyState(): Promise<BabyState> {
  await ensureSleepRow();

  const [stateRow] = await db
    .select({
      sleepUntil: sleepState.sleepUntil,
      cryingSince: sleepState.cryingSince,
    })
    .from(sleepState)
    .where(sql`${sleepState.id} = 1`)
    .limit(1);

  const [agg] = await db
    .select({
      totalBids: sql<number>`count(*)::int`,
      totalCents: sql<number>`coalesce(sum(${bids.amountCents}), 0)::int`,
      totalMs: sql<number>`coalesce(sum(${bids.msPurchased}), 0)::int`,
    })
    .from(bids);

  const topRows = await db
    .select()
    .from(bids)
    .orderBy(desc(bids.amountCents), asc(bids.createdAt))
    .limit(1);

  const leaderboardRows = await db
    .select()
    .from(bids)
    .orderBy(
      desc(bids.amountCents),
      asc(bids.createdAt),
      asc(bids.id)
    )
    .limit(15);

  return {
    serverNow: new Date().toISOString(),

    sleepUntil: stateRow?.sleepUntil
      ? stateRow.sleepUntil.toISOString()
      : null,

    cryingSince: stateRow?.cryingSince
      ? stateRow.cryingSince.toISOString()
      : null,

    totalBids: agg?.totalBids ?? 0,
    totalCents: agg?.totalCents ?? 0,
    totalMs: agg?.totalMs ?? 0,

    topBid: topRows[0] ? toPublicBid(topRows[0]) : null,

    leaderboard: leaderboardRows.map(toPublicBid),
  };
}

export type NewBidInput = {
  productName: string;
  productUrl: string;
  amountCents: number;

  /**
   * Dodo payment ID used to prevent duplicate webhook processing.
   */
  dodoPaymentId?: string;
};

/** $1 == 100 cents == 60,000 ms (1 minute) of sleep. */
export const MS_PER_CENT = 600;

export async function placeBid(
  input: NewBidInput
): Promise<{
  bid: PublicBid;
  state: BabyState;
}> {
  const ms = input.amountCents * MS_PER_CENT;

  const result = await db.transaction(async (tx) => {
    await tx.execute(
      sql`
        INSERT INTO sleep_state (id, crying_since)
        VALUES (1, NOW())
        ON CONFLICT (id) DO NOTHING
      `
    );

    /**
     * Dodo webhook idempotency.
     *
     * If this payment was already processed, no second contribution
     * is created and no additional sleep time is added.
     */
    const [bidRow] = await tx
      .insert(bids)
      .values({
        productName: input.productName,
        productUrl: input.productUrl,
        amountCents: input.amountCents,
        msPurchased: ms,
        dodoPaymentId: input.dodoPaymentId ?? null,
      })
      .onConflictDoNothing({
        target: bids.dodoPaymentId,
      })
      .returning();

    if (!bidRow && input.dodoPaymentId) {
      const [existingBid] = await tx
        .select()
        .from(bids)
        .where(
          sql`${bids.dodoPaymentId} = ${input.dodoPaymentId}`
        )
        .limit(1);

      if (!existingBid) {
        throw new Error(
          "Dodo payment was already processed but the contribution could not be found."
        );
      }

      return {
        bid: existingBid,
        inserted: false,
      };
    }

    if (!bidRow) {
      throw new Error("Failed to create contribution.");
    }

    /**
     * Payment received:
     *
     * 1. Extend sleep from max(now, current sleepUntil).
     * 2. Clear cryingSince immediately.
     *
     * This makes the baby switch from crying to sleeping.
     */
    await tx.execute(sql`
      UPDATE sleep_state
      SET
        sleep_until = GREATEST(
          COALESCE(sleep_until, NOW()),
          NOW()
        ) + (${ms} * INTERVAL '1 millisecond'),

        crying_since = NULL,

        updated_at = NOW()
      WHERE id = 1
    `);

    return {
      bid: bidRow,
      inserted: true,
    };
  });

  const state = await getBabyState();

  return {
    bid: toPublicBid(result.bid),
    state,
  };
}