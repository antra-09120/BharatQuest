import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const heritageCache = pgTable("heritage_cache", {
  cacheKey: text("cache_key").primaryKey(),
  payload: jsonb("payload").notNull().$type<unknown>(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});