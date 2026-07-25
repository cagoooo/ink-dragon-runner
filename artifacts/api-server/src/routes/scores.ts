import { Router, type IRouter } from "express";

const router: IRouter = Router();

interface ScoreEntry {
  name: string;
  score: number;
  date: string;
}

// In-memory leaderboard — persists for the lifetime of the server process
const leaderboard: ScoreEntry[] = [];
const MAX_ENTRIES = 10;

router.get("/scores", (_req, res) => {
  res.json(leaderboard);
});

router.post("/scores", (req, res) => {
  const { name, score } = req.body as { name?: unknown; score?: unknown };

  if (typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "name must be a non-empty string" });
    return;
  }
  if (typeof score !== "number" || !Number.isFinite(score) || score < 0) {
    res.status(400).json({ error: "score must be a non-negative number" });
    return;
  }

  const entry: ScoreEntry = {
    name: name.trim().slice(0, 20),
    score: Math.floor(score),
    date: new Date().toISOString().slice(0, 10),
  };

  leaderboard.push(entry);
  leaderboard.sort((a, b) => b.score - a.score);
  if (leaderboard.length > MAX_ENTRIES) leaderboard.splice(MAX_ENTRIES);

  res.status(201).json(entry);
});

export default router;
