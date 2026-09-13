import { asc, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { bids, sleepState, sitePresence } from "@/db/schema";

export type PublicBid = {
  id: number;
  productName: string;
  productUrl: string;
  amountCents: number;
  msPurchased: number;
  createdAt: string;
};

export type BabyState = {
  /** Server clock, ISO. */
  serverNow: string;

  /** Sleep timer end time while active. */
  sleepUntil: string | null;

  /** Start time of the current crying period. */
  cryingSince: string | null;

  /** True while the timer is paused because no browser is active. */
  timerPaused: boolean;

  totalBids: number;
  totalCents: number;
  totalMs: number;

  topBid: PublicBid | null;
  leaderboard: PublicBid[];
};

const PRESENCE_TIMEOUT_MS = 15_000;

/**
 * $1 = 100 cents = 60,000 ms = 1 minute.
 * Therefore:
 * $0.01 = 600 ms
 * $0.10 = 6 seconds
 * $0.50 = 30 seconds
 * $1.00 = 60 seconds
 */
export const MS_PER_CENT = 600;

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

async function ensureRows() {
  await db.execute(sql`
    INSERT INTO sleep_state (
      id,
      crying_since,
      paused_at
    )
    VALUES (
      1,
      NOW(),
      NULL
    )
    ON CONFLICT (id) DO NOTHING
  `);

  await db.execute(sql`
    INSERT INTO site_presence (
      id,
      last_seen_at
    )
    VALUES (
      1,
      NOW()
    )
    ON CONFLICT (id) DO NOTHING
  `);
}

async function getPresence() {
  const [row] = await db
    .select({
      lastSeenAt: sitePresence.lastSeenAt,
    })
    .from(sitePresence)
    .where(sql`${sitePresence.id} = 1`)
    .limit(1);

  return row?.lastSeenAt ?? null;
}

/**
 * Synchronizes the server-side timer with browser presence.
 *
 * Active browser:
 * - timer runs normally
 * - paused timer resumes
 *
 * No active browser:
 * - timer freezes
 * - time after the last heartbeat is not counted
 */
async function syncTimerPresence() {
  const [state] = await db
    .select({
      sleepUntil: sleepState.sleepUntil,
      cryingSince: sleepState.cryingSince,
      pausedAt: sleepState.pausedAt,
      updatedAt: sleepState.updatedAt,
    })
    .from(sleepState)
    .where(sql`${sleepState.id} = 1`)
    .limit(1);

  if (!state) {
    return;
  }

  const lastSeenAt = await getPresence();

  const now = new Date();

  const presenceAge = lastSeenAt
    ? now.getTime() - lastSeenAt.getTime()
    : Number.POSITIVE_INFINITY;

  const browserActive =
    presenceAge <= PRESENCE_TIMEOUT_MS;

  /*
   * Browser is active.
   *
   * If the timer was previously paused because
   * there was no active browser, resume it now.
   */
  if (browserActive && state.pausedAt) {
    const pausedAtMs = state.pausedAt.getTime();

    /*
     * Resume sleep timer.
     */
    if (state.sleepUntil) {
      const remainingMs = Math.max(
        0,
        state.sleepUntil.getTime() - pausedAtMs
      );

      /*
       * Sleep time still remains.
       */
      if (remainingMs > 0) {
        await db.execute(sql`
          UPDATE sleep_state
          SET
            sleep_until =
              NOW()
              + (${remainingMs} * INTERVAL '1 millisecond'),

            paused_at = NULL,

            updated_at = NOW()

          WHERE id = 1
        `);

        return;
      }

      /*
       * Sleep had already expired while paused.
       *
       * Start a new crying period.
       */
      await db.execute(sql`
        UPDATE sleep_state
        SET
          sleep_until = NULL,

          crying_since = NOW(),

          paused_at = NULL,

          updated_at = NOW()

        WHERE id = 1
      `);

      return;
    }

    /*
     * Resume crying timer.
     */
    if (state.cryingSince) {
      const cryingElapsedMs = Math.max(
        0,
        pausedAtMs -
          state.cryingSince.getTime()
      );

      await db.execute(sql`
        UPDATE sleep_state
        SET
          crying_since =
            NOW()
            - (${cryingElapsedMs} * INTERVAL '1 millisecond'),

          paused_at = NULL,

          updated_at = NOW()

        WHERE id = 1
      `);
    }

    return;
  }

  /*
   * Browser is inactive.
   *
   * Freeze the timer from the LAST heartbeat,
   * not from NOW.
   *
   * This means closing the browser stops the timer
   * instead of allowing it to continue running.
   */
  if (
    !browserActive &&
    lastSeenAt &&
    !state.pausedAt
  ) {
    const lastSeenMs =
      lastSeenAt.getTime();

    /*
     * Freeze sleep timer.
     */
    if (state.sleepUntil) {
      const remainingMs = Math.max(
        0,
        state.sleepUntil.getTime() -
          lastSeenMs
      );

      await db.execute(sql`
        UPDATE sleep_state
        SET
          sleep_until =
            NOW()
            + (${remainingMs} * INTERVAL '1 millisecond'),

          paused_at = NOW(),

          updated_at = NOW()

        WHERE id = 1
      `);

      return;
    }

    /*
     * Freeze crying timer.
     */
    if (state.cryingSince) {
      const cryingElapsedMs = Math.max(
        0,
        lastSeenMs -
          state.cryingSince.getTime()
      );

      await db.execute(sql`
        UPDATE sleep_state
        SET
          crying_since =
            NOW()
            - (${cryingElapsedMs} * INTERVAL '1 millisecond'),

          paused_at = NOW(),

          updated_at = NOW()

        WHERE id = 1
      `);
    }
  }
}

export async function getBabyState(): Promise<BabyState> {
  await ensureRows();

  /*
   * Sync timer with browser presence
   * before returning state to the frontend.
   */
  await syncTimerPresence();

  const [stateRow] = await db
    .select({
      sleepUntil: sleepState.sleepUntil,
      cryingSince: sleepState.cryingSince,
      pausedAt: sleepState.pausedAt,
    })
    .from(sleepState)
    .where(sql`${sleepState.id} = 1`)
    .limit(1);

  const [agg] = await db
    .select({
      totalBids: sql<number>`
        count(*)::int
      `,

      totalCents: sql<number>`
        coalesce(
          sum(${bids.amountCents}),
          0
        )::int
      `,

      totalMs: sql<number>`
        coalesce(
          sum(${bids.msPurchased}),
          0
        )::int
      `,
    })
    .from(bids);

  const topRows = await db
    .select()
    .from(bids)
    .orderBy(
      desc(bids.amountCents),
      asc(bids.createdAt)
    )
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

    timerPaused:
      Boolean(stateRow?.pausedAt),

    totalBids:
      agg?.totalBids ?? 0,

    totalCents:
      agg?.totalCents ?? 0,

    totalMs:
      agg?.totalMs ?? 0,

    topBid: topRows[0]
      ? toPublicBid(topRows[0])
      : null,

    leaderboard:
      leaderboardRows.map(toPublicBid),
  };
}

export type NewBidInput = {
  productName: string;
  productUrl: string;
  amountCents: number;

  /**
   * Dodo payment ID.
   * Used for webhook idempotency.
   */
  dodoPaymentId?: string;
};

export async function placeBid(
  input: NewBidInput
): Promise<{
  bid: PublicBid;
  state: BabyState;
}> {
  /*
   * $1 = 100 cents
   * 1 cent = 600 ms
   *
   * Example:
   * $1   -> 60,000 ms
   * $5   -> 300,000 ms
   */
  const ms =
    input.amountCents * MS_PER_CENT;

  const result = await db.transaction(
    async (tx) => {
      /*
       * Make sure the shared sleep row exists.
       */
      await tx.execute(sql`
        INSERT INTO sleep_state (
          id,
          crying_since,
          paused_at
        )
        VALUES (
          1,
          NOW(),
          NULL
        )
        ON CONFLICT (id) DO NOTHING
      `);

      /*
       * Prevent duplicate processing of
       * the same Dodo payment webhook.
       */
      const [bidRow] = await tx
        .insert(bids)
        .values({
          productName:
            input.productName,

          productUrl:
            input.productUrl,

          amountCents:
            input.amountCents,

          msPurchased:
            ms,

          dodoPaymentId:
            input.dodoPaymentId ?? null,
        })
        .onConflictDoNothing({
          target: bids.dodoPaymentId,
        })
        .returning();

      /*
       * Same Dodo payment was already processed.
       */
      if (
        !bidRow &&
        input.dodoPaymentId
      ) {
        const [existingBid] =
          await tx
            .select()
            .from(bids)
            .where(
              sql`
                ${bids.dodoPaymentId}
                =
                ${input.dodoPaymentId}
              `
            )
            .limit(1);

        if (!existingBid) {
          throw new Error(
            "Dodo payment was already processed but the contribution could not be found."
          );
        }

        return {
          bid: existingBid,
        };
      }

      if (!bidRow) {
        throw new Error(
          "Failed to create contribution."
        );
      }

      /*
       * Successful contribution:
       *
       * 1. Add purchased sleep time.
       * 2. Stop crying.
       * 3. Remove paused state.
       *
       * IMPORTANT:
       * GREATEST() makes sure a new contribution
       * adds time from NOW when the baby is crying,
       * or extends the current sleep timer when already sleeping.
       */
      await tx.execute(sql`
        UPDATE sleep_state
        SET
          sleep_until =
            GREATEST(
              COALESCE(
                sleep_until,
                NOW()
              ),
              NOW()
            )
            + (${ms} * INTERVAL '1 millisecond'),

          crying_since = NULL,

          paused_at = NULL,

          updated_at = NOW()

        WHERE id = 1
      `);

      return {
        bid: bidRow,
      };
    }
  );

  /*
   * Fetch the latest shared state after
   * inserting the contribution.
   */
  const state =
    await getBabyState();

  return {
    bid: toPublicBid(result.bid),
    state,
  };
}