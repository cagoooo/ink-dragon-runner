import { Router, type IRouter } from "express";
import { db, leaderboardTable } from "@workspace/db";
import { desc, sql } from "drizzle-orm";

const router: IRouter = Router();

const MAX_ENTRIES = 10;

router.get("/scores", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(leaderboardTable)
      .orderBy(desc(leaderboardTable.score))
      .limit(MAX_ENTRIES);
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch scores:", err);
    res.status(500).json({ error: "Failed to fetch scores" });
  }
});

router.post("/scores", async (req, res) => {
  const { name, score } = req.body as { name?: unknown; score?: unknown };

  if (typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "name must be a non-empty string" });
    return;
  }
  if (typeof score !== "number" || !Number.isFinite(score) || score < 0) {
    res.status(400).json({ error: "score must be a non-negative number" });
    return;
  }

  const entry = {
    name: name.trim().slice(0, 20),
    score: Math.floor(score),
    date: new Date().toISOString().slice(0, 10),
  };

  try {
    const inserted = await db.transaction(async (tx) => {
      // Acquire an exclusive advisory lock for the duration of this transaction.
      // All concurrent writers will queue here, preventing stale-snapshot races
      // where two transactions each see a different top-10 and prune too few rows.
      await tx.execute(sql`SELECT pg_advisory_xact_lock(1234567890)`);

      const [row] = await tx
        .insert(leaderboardTable)
        .values(entry)
        .returning();

      // Prune to keep only top MAX_ENTRIES rows — safe because the advisory lock
      // above guarantees no other writer can run this section concurrently.
      await tx.execute(sql`
        DELETE FROM leaderboard
        WHERE id NOT IN (
          SELECT id FROM leaderboard ORDER BY score DESC LIMIT ${MAX_ENTRIES}
        )
      `);

      return row;
    });

    res.status(201).json(inserted);
  } catch (err) {
    console.error("Failed to save score:", err);
    res.status(500).json({ error: "Failed to save score" });
  }
});

export default router;
