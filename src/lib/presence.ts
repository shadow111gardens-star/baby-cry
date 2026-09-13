import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function touchPresence(): Promise<void> {
  await db.execute(sql`
    INSERT INTO site_presence (id, last_seen_at)
    VALUES (1, NOW())
    ON CONFLICT (id)
    DO UPDATE SET last_seen_at = NOW()
  `);
}