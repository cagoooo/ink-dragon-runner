import { pgTable, serial, text, integer, date } from "drizzle-orm/pg-core";

export const leaderboardTable = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  score: integer("score").notNull(),
  date: date("date").notNull(),
});

export type LeaderboardEntry = typeof leaderboardTable.$inferSelect;
export type InsertLeaderboardEntry = typeof leaderboardTable.$inferInsert;
