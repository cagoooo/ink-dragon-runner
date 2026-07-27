export interface ScoreEntry {
  name: string;
  score: number;
  date: string;
  skinId?: string;
}

const LOCAL_STORAGE_KEY = 'ink-dragon-leaderboard-v2';

export async function fetchLeaderboard(): Promise<ScoreEntry[]> {
  const isStaticHosting = window.location.hostname.includes('github.io');
  if (!isStaticHosting) {
    try {
      const res = await fetch('/api/scores');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // Ignore fetch failure and fallback to LocalStorage
    }
  }

  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  // 預設示範排行榜資料
  return [
    { name: '墨龍宗師', score: 1280, date: '2026-07-27', skinId: 'gold_dragon' },
    { name: '阿凱老師', score: 980, date: '2026-07-27', skinId: 'red_flame' },
    { name: '仙人掌克星', score: 750, date: '2026-07-26', skinId: 'cyan_sea' },
    { name: '水墨少俠', score: 520, date: '2026-07-25', skinId: 'classic' },
  ];
}

export async function submitScore(name: string, score: number, skinId: string = 'classic'): Promise<boolean> {
  const dateStr = new Date().toISOString().split('T')[0];
  const newEntry: ScoreEntry = {
    name: name.trim() || '無名俠客',
    score: Math.floor(score),
    date: dateStr,
    skinId,
  };

  const isStaticHosting = window.location.hostname.includes('github.io');
  if (!isStaticHosting) {
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
    } catch {
      // Ignore server error and update local list
    }
  }

  // 更新本地排行榜並排序取 Top 10
  const current = await fetchLeaderboard();
  const updated = [...current, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return true;
}
