// Local-first game store. Designed so a backend sync can be added later
// by swapping load/save implementations.

export interface PronAttempt {
  date: string;      // YYYY-MM-DD
  score: number;     // 0-100
  target: string;
  said: string;
}

export interface GameStoreData {
  pronAttempts: PronAttempt[];
  coins: number;
  achievements: string[];
  completedNodes: string[];   // `${levelId}:${taskId}`
  defeatedBosses: string[];   // levelId
  history: { at: string; game: string; xp: number }[];
}

const KEY = 'azizbek-games-store';

const EMPTY: GameStoreData = {
  pronAttempts: [],
  coins: 0,
  achievements: [],
  completedNodes: [],
  defeatedBosses: [],
  history: [],
};

export function loadStore(): GameStoreData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY };
  }
}

export function saveStore(data: GameStoreData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('games-store-updated'));
  } catch (e) {
    console.error('gameStore save failed', e);
  }
}

export function updateStore(fn: (d: GameStoreData) => GameStoreData) {
  const next = fn(loadStore());
  saveStore(next);
  return next;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export const ACHIEVEMENTS: { id: string; label: string; emoji: string; desc: string }[] = [
  { id: 'first-victory', label: 'First Victory', emoji: '🏆', desc: 'Birinchi bossni yengish' },
  { id: 'streak-7', label: '7 Day Streak', emoji: '🔥', desc: '7 kun ketma-ket mashq' },
  { id: 'pron-master', label: 'Pronunciation Master', emoji: '🎤', desc: '90+ ball olish' },
  { id: 'grammar-explorer', label: 'Grammar Explorer', emoji: '📚', desc: '5 ta grammar topshirig\u2018i' },
  { id: 'adventure-starter', label: 'Adventure Starter', emoji: '🗺️', desc: 'Sarguzashtni boshlash' },
  { id: 'english-master', label: 'English Master', emoji: '👑', desc: 'Barcha bosslarni yengish' },
];

export function grantAchievement(id: string): boolean {
  const s = loadStore();
  if (s.achievements.includes(id)) return false;
  saveStore({ ...s, achievements: [...s.achievements, id] });
  return true;
}

export function logGame(game: string, xp: number, coins = 0) {
  updateStore((d) => ({
    ...d,
    coins: d.coins + coins,
    history: [{ at: new Date().toISOString(), game, xp }, ...d.history].slice(0, 100),
  }));
}

// Levenshtein-based pronunciation scoring
export function scorePronunciation(target: string, said: string) {
  const norm = (s: string) =>
    s.toLowerCase().replace(/[^a-z\s']/g, ' ').replace(/\s+/g, ' ').trim();
  const t = norm(target).split(' ').filter(Boolean);
  const u = norm(said).split(' ').filter(Boolean);
  const wrongWords: string[] = [];
  let matched = 0;
  const pool = [...u];
  for (const w of t) {
    const idx = pool.findIndex((x) => similar(x, w) >= 0.8);
    if (idx >= 0) {
      matched += similar(pool[idx], w);
      pool.splice(idx, 1);
    } else {
      wrongWords.push(w);
    }
  }
  const score = t.length ? Math.round((matched / t.length) * 100) : 0;
  return { score: Math.max(0, Math.min(100, score)), wrongWords };
}

function similar(a: string, b: string) {
  if (a === b) return 1;
  const d = lev(a, b);
  return 1 - d / Math.max(a.length, b.length, 1);
}

function lev(a: string, b: string) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
  return dp[m][n];
}

export function scoreLabel(score: number) {
  if (score >= 90) return { label: 'Excellent', tone: 'from-emerald-500 to-teal-500' };
  if (score >= 75) return { label: 'Very Good', tone: 'from-sky-500 to-blue-500' };
  if (score >= 50) return { label: 'Good', tone: 'from-amber-500 to-orange-500' };
  return { label: 'Try Again', tone: 'from-rose-500 to-red-500' };
}
