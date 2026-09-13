import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Singleton row (id = 1) tracking when the baby's paid sleep expires.
 * Every contribution extends `sleepUntil` from max(now, previousSleepUntil).
 * $1 == 100 cents == 60,000 ms (1 minute) of sleep.
 */
export const sleepState = pgTable("sleep_state", {
  id: integer("id").primaryKey(),
  sleepUntil: timestamp("sleep_until", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
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

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type BidRow = typeof bids.$inferSelect;
export type SleepStateRow = typeof sleepState.$inferSelect;