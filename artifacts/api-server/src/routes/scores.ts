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
    const [inserted] = await db
      .insert(leaderboardTable)
      .values(entry)
      .returning();

    // Prune to keep only top MAX_ENTRIES rows
    await db.execute(sql`
      DELETE FROM leaderboard
      WHERE id NOT IN (
        SELECT id FROM leaderboard ORDER BY score DESC LIMIT ${MAX_ENTRIES}
      )
    `);

    res.status(201).json(inserted);
  } catch (err) {
    console.error("Failed to save score:", err);
    res.status(500).json({ error: "Failed to save score" });
  }
});

export default router;
