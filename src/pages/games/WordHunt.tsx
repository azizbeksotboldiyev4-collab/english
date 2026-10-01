import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lightbulb, RotateCcw, Timer, Trophy, Sparkles } from 'lucide-react';
import { GAME_CATEGORIES, CATEGORY_META, shuffle } from '@/data/gamesData';
import { useProgress } from '@/hooks/useProgress';
import { toast } from 'sonner';

type Diff = 'easy' | 'medium' | 'hard';
const DIFF_CFG: Record<Diff, { size: number; count: number; time: number }> = {
  easy: { size: 8, count: 5, time: 180 },
  medium: { size: 10, count: 7, time: 150 },
  hard: { size: 12, count: 9, time: 120 },
};

type Placed = { word: string; cells: number[] };

function buildGrid(words: string[], size: number): { grid: string[]; placed: Placed[] } {
  const cells: string[] = Array(size * size).fill('');
  const placed: Placed[] = [];
  const dirs = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: -1, dc: 1 },
  ];
  const sorted = [...words].sort((a, b) => b.length - a.length);

  for (const w of sorted) {
    if (w.length > size) continue;
    let ok = false;
    for (let tries = 0; tries < 200 && !ok; tries++) {
      const d = dirs[Math.floor(Math.random() * dirs.length)];
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      const endR = r + d.dr * (w.length - 1);
      const endC = c + d.dc * (w.length - 1);
      if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;
      const idxs: number[] = [];
      let fits = true;
      for (let i = 0; i < w.length; i++) {
        const rr = r + d.dr * i;
        const cc = c + d.dc * i;
        const idx = rr * size + cc;
        const cur = cells[idx];
        const ch = w[i].toUpperCase();
        if (cur && cur !== ch) { fits = false; break; }
        idxs.push(idx);
      }
      if (!fits) continue;
      idxs.forEach((idx, i) => { cells[idx] = w[i].toUpperCase(); });
      placed.push({ word: w.toUpperCase(), cells: idxs });
      ok = true;
    }
  }
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < cells.length; i++) if (!cells[i]) cells[i] = alpha[Math.floor(Math.random() * 26)];
  return { grid: cells, placed };
}

export default function WordHunt() {
  const { addXp } = useProgress();
  const [category, setCategory] = useState<keyof typeof GAME_CATEGORIES>('animals');
  const [difficulty, setDifficulty] = useState<Diff>('easy');
  const [round, setRound] = useState(0);
  const cfg = DIFF_CFG[difficulty];

  const { grid, placed, targets } = useMemo(() => {
    const wordList = shuffle(GAME_CATEGORIES[category])
      .map((w) => w.en.replace(/[^a-zA-Z]/g, ''))
      .filter((w) => w.length >= 3 && w.length <= cfg.size)
      .slice(0, cfg.count);
    const { grid, placed } = buildGrid(wordList, cfg.size);
    return { grid, placed, targets: placed.map((p) => p.word) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, difficulty, round]);

  const [selected, setSelected] = useState<number[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [found2, setFound2] = useState<Set<number>>(new Set());
  const [time, setTime] = useState(cfg.time);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hintCell, setHintCell] = useState<number | null>(null);
  const dragging = useRef(false);

  useEffect(() => {
    setSelected([]); setFound([]); setFound2(new Set()); setTime(cfg.time);
    setRunning(true); setScore(0); setCombo(0); setHintCell(null);
  }, [round, category, difficulty, cfg.time]);

  useEffect(() => {
    if (!running || time <= 0) { if (time <= 0) { setRunning(false); toast('⏰ Vaqt tugadi'); } return; }
    const t = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [time, running]);

  useEffect(() => {
    if (found.length && found.length === targets.length) {
      setRunning(false);
      const xp = 30 + found.length * 8 + Math.max(0, time);
      addXp(xp);
      toast.success(`🏆 Barcha so'zlar topildi! +${xp} XP`);
    }
  }, [found, targets, time, addXp]);

  function commit() {
    if (selected.length < 2) { setSelected([]); return; }
    const letters = selected.map((i) => grid[i]).join('');
    const rev = letters.split('').reverse().join('');
    const match = placed.find((p) => (p.word === letters || p.word === rev) && !found.includes(p.word));
    if (match) {
      setFound((f) => [...f, match.word]);
      setFound2((s) => { const n = new Set(s); match.cells.forEach((c) => n.add(c)); return n; });
      setCombo((c) => c + 1);
      setScore((s) => s + 20 + Math.min(combo, 5) * 5);
    } else {
      setCombo(0);
    }
    setSelected([]);
  }

  function useHint() {
    const remaining = placed.filter((p) => !found.includes(p.word));
    if (!remaining.length) return;
    const first = remaining[0].cells[0];
    setHintCell(first);
    setScore((s) => Math.max(0, s - 5));
    setTimeout(() => setHintCell(null), 1500);
  }

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-gradient-to-br from-amber-500/15 via-background to-rose-500/10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-amber-500/25 blur-3xl" />
        <div className="absolute bottom-0 -right-24 h-96 w-96 rounded-full bg-rose-500/25 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Link to="/games" className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur-md px-3 py-1.5 text-sm font-bold hover:bg-card transition-colors">
            <ArrowLeft className="h-4 w-4" /> O'yinlar
          </Link>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="inline-flex items-center gap-1 rounded-full bg-card/60 border border-border/60 backdrop-blur-md px-3 py-1"><Timer className="h-3.5 w-3.5" /> {time}s</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-card/60 border border-border/60 backdrop-blur-md px-3 py-1"><Trophy className="h-3.5 w-3.5" /> {score}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white px-3 py-1"><Sparkles className="h-3.5 w-3.5" /> x{combo}</span>
          </div>
        </div>

        <div className="mb-4 rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl p-4 shadow-card space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_META.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`text-xs font-extrabold px-3 py-1.5 rounded-full transition-all ${
                  category === c.id ? `bg-gradient-to-r ${c.gradient} text-white shadow-lg` : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs">
            {(['easy', 'medium', 'hard'] as Diff[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1 rounded-full font-extrabold uppercase transition-all ${
                  difficulty === d ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {d === 'easy' ? 'Oson' : d === 'medium' ? "O'rta" : 'Qiyin'}
              </button>
            ))}
            <button onClick={useHint} className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 px-3 py-1 font-extrabold hover:bg-amber-500/30 transition-colors">
              <Lightbulb className="h-3.5 w-3.5" /> Maslahat
            </button>
            <button onClick={() => setRound((r) => r + 1)} className="inline-flex items-center gap-1 rounded-full bg-card border border-border px-3 py-1 font-extrabold hover:bg-muted transition-colors">
              <RotateCcw className="h-3.5 w-3.5" /> Yangi
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <div
            className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl p-3 md:p-4 shadow-elevated select-none"
            onMouseUp={() => { dragging.current = false; commit(); }}
            onMouseLeave={() => { if (dragging.current) { dragging.current = false; commit(); } }}
            onTouchEnd={() => { dragging.current = false; commit(); }}
          >
            <div
              className="grid gap-1 md:gap-1.5"
              style={{ gridTemplateColumns: `repeat(${cfg.size}, minmax(0, 1fr))` }}
            >
              {grid.map((ch, i) => {
                const isSel = selected.includes(i);
                const isFound = found2.has(i);
                const isHint = hintCell === i;
                return (
                  <button
                    key={i}
                    onMouseDown={() => { dragging.current = true; setSelected([i]); }}
                    onMouseEnter={() => { if (dragging.current) setSelected((s) => (s.includes(i) ? s : [...s, i])); }}
                    onTouchStart={() => { dragging.current = true; setSelected([i]); }}
                    className={`aspect-square rounded-lg md:rounded-xl grid place-items-center font-extrabold text-sm md:text-base transition-all ${
                      isFound ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg' :
                      isSel ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white scale-95 shadow-inner' :
                      isHint ? 'bg-amber-500/40 ring-2 ring-amber-500 text-foreground' :
                      'bg-background hover:bg-muted text-foreground'
                    }`}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl p-4 shadow-card">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Topilishi kerak</div>
            <div className="space-y-1.5">
              {targets.map((w) => {
                const done = found.includes(w);
                return (
                  <div key={w} className={`px-3 py-1.5 rounded-lg font-extrabold text-sm transition-colors ${
                    done ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 line-through' : 'bg-muted text-foreground'
                  }`}>
                    {w}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Topildi: <span className="font-extrabold text-foreground">{found.length}/{targets.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}