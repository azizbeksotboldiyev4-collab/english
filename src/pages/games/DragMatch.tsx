import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Star, Sparkles } from 'lucide-react';
import { GAME_CATEGORIES, CATEGORY_META, shuffle } from '@/data/gamesData';
import { useProgress } from '@/hooks/useProgress';
import { toast } from 'sonner';

export default function DragMatch() {
  const { addXp } = useProgress();
  const [category, setCategory] = useState<keyof typeof GAME_CATEGORIES>('food');
  const [round, setRound] = useState(0);
  const words = useMemo(() => shuffle(GAME_CATEGORIES[category]).slice(0, 6), [category, round]);
  const [uzOrder, setUzOrder] = useState<string[]>([]);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [wrongPulse, setWrongPulse] = useState<string | null>(null);
  const [stars, setStars] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => {
    setUzOrder(shuffle(words.map((w) => w.uz)));
    setMatches({});
    setMistakes(0);
    setStars(0);
  }, [words]);

  const done = Object.keys(matches).length === words.length && words.length > 0;

  useEffect(() => {
    if (!done) return;
    const s = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    setStars(s);
    const xp = 20 + s * 10;
    addXp(xp);
    toast.success(`+${xp} XP • ${s}⭐`);
  }, [done, mistakes, addXp]);

  function drop(uz: string) {
    if (!dragging) return;
    const word = words.find((w) => w.en === dragging);
    if (!word) return;
    if (word.uz === uz) {
      setMatches((m) => ({ ...m, [word.en]: uz }));
    } else {
      setWrongPulse(uz);
      setMistakes((n) => n + 1);
      setTimeout(() => setWrongPulse(null), 500);
    }
    setDragging(null);
  }

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-gradient-to-br from-emerald-500/15 via-background to-cyan-500/10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-emerald-500/25 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Link to="/games" className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur-md px-3 py-1.5 text-sm font-bold hover:bg-card transition-colors">
            <ArrowLeft className="h-4 w-4" /> O'yinlar
          </Link>
          <button onClick={() => setRound((r) => r + 1)} className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur-md px-3 py-1.5 text-sm font-bold hover:bg-card transition-colors">
            <RotateCcw className="h-4 w-4" /> Aralashtir
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {CATEGORY_META.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`text-xs font-extrabold px-3 py-1.5 rounded-full transition-all ${
                category === c.id
                  ? `bg-gradient-to-r ${c.gradient} text-white shadow-lg`
                  : 'bg-card/60 border border-border/60 text-muted-foreground hover:bg-card'
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">English</div>
            {words.map((w) => {
              const matched = matches[w.en];
              return (
                <motion.div
                  key={w.en}
                  layout
                  draggable={!matched}
                  onDragStart={() => setDragging(w.en)}
                  onDragEnd={() => setDragging(null)}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDragging((d) => (d === w.en ? null : w.en))}
                  className={`cursor-grab active:cursor-grabbing rounded-2xl p-4 text-center font-extrabold text-lg select-none border-2 transition-all ${
                    matched
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-muted-foreground line-through opacity-70'
                      : dragging === w.en
                      ? 'bg-primary/20 border-primary shadow-elevated scale-105'
                      : 'bg-card border-border shadow-card hover:border-primary hover:-translate-y-0.5'
                  }`}
                >
                  {w.emoji && <span className="mr-2">{w.emoji}</span>}
                  {w.en}
                </motion.div>
              );
            })}
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">O'zbekcha</div>
            {uzOrder.map((uz) => {
              const matchedEn = Object.entries(matches).find(([, v]) => v === uz)?.[0];
              const wrong = wrongPulse === uz;
              return (
                <div
                  key={uz}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => drop(uz)}
                  onClick={() => drop(uz)}
                  className={`rounded-2xl p-4 text-center font-extrabold text-lg border-2 border-dashed transition-all ${
                    matchedEn
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-700 dark:text-emerald-300'
                      : wrong
                      ? 'bg-rose-500/20 border-rose-500/60 animate-shake'
                      : 'bg-card/40 border-border text-muted-foreground hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  {uz}
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {done && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 rounded-3xl border border-emerald-500/40 bg-emerald-500/10 backdrop-blur-xl p-6 text-center">
              <div className="text-5xl mb-2">🎉</div>
              <div className="text-xl font-extrabold">Zo'r! Barcha juftlar mos keldi</div>
              <div className="mt-2 flex items-center justify-center gap-1">
                {[1, 2, 3].map((n) => (
                  <Star key={n} className={`h-6 w-6 ${n <= stars ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}`} />
                ))}
              </div>
              <button onClick={() => setRound((r) => r + 1)} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-white font-extrabold shadow-xl hover:scale-105 transition-transform">
                <Sparkles className="h-4 w-4" /> Keyingi bosqich
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}