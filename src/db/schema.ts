import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Singleton row (id = 1) tracking the virtual baby's sleep and crying state.
 *
 * sleepUntil:
 * - Future timestamp = baby is sleeping.
 * - NULL/past = baby is crying.
 *
 * cryingSince:
 * - Timestamp when the current crying period started.
 * - NULL while the baby is sleeping.
 *
 * $1 == 100 cents == 60,000 ms (1 minute) of sleep.
 */
export const sleepState = pgTable("sleep_state", {
  id: integer("id").primaryKey(),

  sleepUntil: timestamp("sleep_until", {
    withTimezone: true,
  }),

  cryingSince: timestamp("crying_since", {
    withTimezone: true,
  }),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),

  productName: text("product_name").notNull(),

  productUrl: text("product_url").notNull(),

  amountCents: integer("amount_cents").notNull(),

  msPurchased: integer("ms_purchased").notNull(),

  /**
   * Dodo payment ID used for webhook idempotency.
   * Existing rows can remain NULL.
   * New Dodo-paid contributions store the payment ID here.
   */
  dodoPaymentId: text("dodo_payment_id").unique(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export type BidRow = typeof bids.$inferSelect;
export type SleepStateRow = typeof sleepState.$inferSelect;