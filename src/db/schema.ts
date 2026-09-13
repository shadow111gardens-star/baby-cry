import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Singleton row (id = 1) tracking the virtual baby's sleep state.
 *
 * sleepUntil:
 * - Future timestamp = baby is sleeping.
 * - NULL/past = baby is crying.
 *
 * cryingSince:
 * - Current crying period start time.
 * - NULL while sleeping.
 *
 * pausedAt:
 * - Timestamp when the shared timer was paused
 *   because no active browser was detected.
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

  pausedAt: timestamp("paused_at", {
    withTimezone: true,
  }),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

/**
 * Singleton row (id = 1) tracking browser presence.
 *
 * lastSeenAt:
 * - Last heartbeat received from an open browser.
 */
export const sitePresence = pgTable("site_presence", {
  id: integer("id").primaryKey(),

  lastSeenAt: timestamp("last_seen_at", {
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

export type SitePresenceRow = typeof sitePresence.$inferSelect;