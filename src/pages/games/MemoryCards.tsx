import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Timer, Sparkles } from 'lucide-react';
import { GAME_CATEGORIES, CATEGORY_META, shuffle } from '@/data/gamesData';
import { useProgress } from '@/hooks/useProgress';
import { toast } from 'sonner';

type Card = { id: number; key: string; label: string; kind: 'en' | 'uz'; emoji?: string; matched: boolean };

export default function MemoryCards() {
  const { addXp } = useProgress();
  const [category, setCategory] = useState<keyof typeof GAME_CATEGORIES>('animals');
  const [pairs, setPairs] = useState(6);
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const words = useMemo(() => GAME_CATEGORIES[category], [category]);

  function newGame() {
    const chosen = shuffle(words).slice(0, pairs);
    const deck: Card[] = shuffle(
      chosen.flatMap((w, i) => [
        { id: i * 2, key: w.en, label: w.en, kind: 'en' as const, emoji: w.emoji, matched: false },
        { id: i * 2 + 1, key: w.en, label: w.uz, kind: 'uz' as const, matched: false },
      ])
    ).map((c, i) => ({ ...c, id: i }));
    setCards(deck);
    setFlipped([]);
    setMoves(0);
    setTime(0);
    setDone(false);
    setRunning(true);
  }

  useEffect(() => { newGame(); /* eslint-disable-next-line */ }, [category, pairs]);

  useEffect(() => {
    if (!running || done) return;
    const t = setTimeout(() => setTime((s) => s + 1), 1000);
    return () => clearTimeout(t);
  }, [time, running, done]);

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [a, b] = flipped;
    const ca = cards.find((c) => c.id === a);
    const cb = cards.find((c) => c.id === b);
    setMoves((m) => m + 1);
    if (ca && cb && ca.key === cb.key && ca.kind !== cb.kind) {
      setTimeout(() => {
        setCards((cs) => cs.map((c) => (c.id === a || c.id === b ? { ...c, matched: true } : c)));
        setFlipped([]);
      }, 400);
    } else {
      setTimeout(() => setFlipped([]), 700);
    }
  }, [flipped, cards]);

  useEffect(() => {
    if (cards.length && cards.every((c) => c.matched)) {
      setDone(true);
      setRunning(false);
      const bonus = Math.max(0, 90 - time);
      const xp = 30 + bonus;
      addXp(xp);
      toast.success(`🎉 Yakunlandi! +${xp} XP`);
    }
  }, [cards, time, addXp]);

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-gradient-to-br from-violet-500/20 via-background to-fuchsia-500/10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-fuchsia-500/30 blur-3xl" />
        <div className="absolute bottom-0 -left-24 h-96 w-96 rounded-full bg-violet-500/25 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Link to="/games" className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur-md px-3 py-1.5 text-sm font-bold hover:bg-card transition-colors">
            <ArrowLeft className="h-4 w-4" /> O'yinlar
          </Link>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="inline-flex items-center gap-1 rounded-full bg-card/60 border border-border/60 backdrop-blur-md px-3 py-1"><Timer className="h-3.5 w-3.5" /> {time}s</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-card/60 border border-border/60 backdrop-blur-md px-3 py-1"><Sparkles className="h-3.5 w-3.5" /> {moves}</span>
          </div>
        </div>

        <div className="mb-4 rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl p-4 shadow-card">
          <div className="flex flex-wrap gap-2 mb-2">
            {CATEGORY_META.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`text-xs font-extrabold px-3 py-1.5 rounded-full transition-all ${
                  category === c.id
                    ? `bg-gradient-to-r ${c.gradient} text-white shadow-lg`
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-bold">Juftlar:</span>
            {[4, 6, 8, 10].map((n) => (
              <button
                key={n}
                onClick={() => setPairs(n)}
                className={`px-3 py-1 rounded-full font-extrabold transition-all ${
                  pairs === n ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {n}
              </button>
            ))}
            <button onClick={newGame} className="ml-auto inline-flex items-center gap-1 rounded-full bg-card border border-border px-3 py-1 font-extrabold hover:bg-muted transition-colors">
              <RotateCcw className="h-3.5 w-3.5" /> Yangi
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 md:gap-3">
          {cards.map((c) => {
            const face = c.matched || flipped.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => {
                  if (c.matched || flipped.includes(c.id) || flipped.length === 2) return;
                  setFlipped((f) => [...f, c.id]);
                }}
                className="[perspective:800px] aspect-[3/4]"
                aria-label={face ? c.label : 'Card'}
              >
                <motion.div
                  animate={{ rotateY: face ? 180 : 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative h-full w-full [transform-style:preserve-3d]"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 shadow-elevated [backface-visibility:hidden] grid place-items-center text-white">
                    <Sparkles className="h-7 w-7 opacity-80" />
                  </div>
                  <div className={`absolute inset-0 rounded-2xl border-2 [backface-visibility:hidden] [transform:rotateY(180deg)] grid place-items-center p-2 text-center shadow-card ${
                    c.matched ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-card border-border'
                  }`}>
                    <div>
                      {c.emoji && <div className="text-2xl">{c.emoji}</div>}
                      <div className="text-sm md:text-base font-extrabold leading-tight break-words">{c.label}</div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">{c.kind}</div>
                    </div>
                  </div>
                </motion.div>
              </button>
            );
          })}
        </div>

        {done && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-3xl border border-emerald-500/40 bg-emerald-500/10 backdrop-blur-xl p-6 text-center">
            <div className="text-5xl mb-2">🎉</div>
            <div className="text-xl font-extrabold">Barcha juftlar topildi!</div>
            <div className="text-sm text-muted-foreground mt-1">{moves} harakat • {time} soniya</div>
            <button onClick={newGame} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-white font-extrabold shadow-xl hover:scale-105 transition-transform">
              <RotateCcw className="h-4 w-4" /> Yana bir bor
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}