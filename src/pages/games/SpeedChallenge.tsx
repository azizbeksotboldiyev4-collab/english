import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, Trophy, RotateCcw, Timer, Flame } from 'lucide-react';
import { GAME_CATEGORIES, shuffle, GameWord } from '@/data/gamesData';
import { useProgress } from '@/hooks/useProgress';
import { toast } from 'sonner';

type Q = { word: GameWord; options: string[]; correct: string };

function makeQuestions(pool: GameWord[], count = 60): Q[] {
  const arr = shuffle(pool);
  return Array.from({ length: count }, (_, i) => {
    const word = arr[i % arr.length];
    const wrongs = shuffle(pool.filter((w) => w.uz !== word.uz)).slice(0, 3).map((w) => w.uz);
    return {
      word,
      options: shuffle([word.uz, ...wrongs]),
      correct: word.uz,
    };
  });
}

export default function SpeedChallenge() {
  const { addXp } = useProgress();
  const pool = useMemo(() => Object.values(GAME_CATEGORIES).flat(), []);
  const [state, setState] = useState<'idle' | 'playing' | 'done'>('idle');
  const [questions, setQuestions] = useState<Q[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [time, setTime] = useState(60);
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);
  const highRef = useRef<number>(Number(localStorage.getItem('speed-high') || 0));

  useEffect(() => {
    if (state !== 'playing') return;
    if (time <= 0) {
      finish();
      return;
    }
    const t = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [state, time]);

  function start() {
    setQuestions(makeQuestions(pool, 80));
    setIndex(0);
    setScore(0);
    setCorrect(0);
    setWrong(0);
    setCombo(0);
    setMaxCombo(0);
    setTime(60);
    setState('playing');
  }

  function finish() {
    setState('done');
    if (score > highRef.current) {
      highRef.current = score;
      localStorage.setItem('speed-high', String(score));
      toast.success('🎉 Yangi rekord!');
    }
    const xp = Math.max(10, Math.round(score / 5));
    addXp(xp);
  }

  function answer(opt: string) {
    const q = questions[index];
    if (!q) return;
    if (opt === q.correct) {
      const mult = 1 + Math.min(combo, 5) * 0.2;
      const gained = Math.round(10 * mult);
      setScore((s) => s + gained);
      setCorrect((c) => c + 1);
      setCombo((c) => {
        const nc = c + 1;
        setMaxCombo((m) => Math.max(m, nc));
        return nc;
      });
      setFlash('ok');
    } else {
      setWrong((w) => w + 1);
      setCombo(0);
      setFlash('bad');
    }
    setTimeout(() => setFlash(null), 180);
    setIndex((i) => i + 1);
  }

  const q = questions[index];
  const accuracy = correct + wrong ? Math.round((correct / (correct + wrong)) * 100) : 0;

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-gradient-to-br from-amber-500/20 via-background to-orange-500/10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-amber-400/30 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link to="/games" className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur-md px-3 py-1.5 text-sm font-bold hover:bg-card transition-colors">
            <ArrowLeft className="h-4 w-4" /> O'yinlar
          </Link>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Rekord: <span className="text-foreground">{highRef.current}</span>
          </div>
        </div>

        {state === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl p-8 text-center shadow-elevated">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl mb-4">
              <Zap className="h-10 w-10" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold">Speed Challenge</h1>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              60 soniya ichida iloji boricha ko'proq savolga to'g'ri javob bering. Ketma-ket to'g'ri javoblar ballni oshiradi.
            </p>
            <button onClick={start} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 text-white font-extrabold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
              <Zap className="h-5 w-5" /> Boshlash
            </button>
          </motion.div>
        )}

        {state === 'playing' && q && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <StatChip icon={Timer} label="Vaqt" value={`${time}s`} tone={time <= 10 ? 'danger' : 'default'} />
              <StatChip icon={Trophy} label="Ball" value={String(score)} />
              <StatChip icon={Flame} label="Combo" value={`x${combo}`} tone={combo >= 3 ? 'hot' : 'default'} />
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div className="h-full bg-gradient-to-r from-amber-400 to-orange-500" animate={{ width: `${(time / 60) * 100}%` }} transition={{ ease: 'linear' }} />
            </div>

            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`relative rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl p-6 md:p-10 text-center shadow-elevated transition-colors ${
                flash === 'ok' ? 'ring-4 ring-emerald-500/60' : flash === 'bad' ? 'ring-4 ring-rose-500/60 animate-shake' : ''
              }`}
            >
              <div className="text-6xl mb-2">{q.word.emoji}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tarjimasi qanday?</div>
              <div className="mt-1 text-4xl md:text-5xl font-extrabold tracking-tight">{q.word.en}</div>
            </motion.div>

            <div className="grid grid-cols-2 gap-3">
              {q.options.map((o) => (
                <motion.button
                  key={o}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => answer(o)}
                  className="rounded-2xl border-2 border-border bg-card/80 backdrop-blur-md px-4 py-4 text-base font-extrabold text-foreground hover:border-amber-500 hover:bg-amber-500/10 transition-all shadow-card"
                >
                  {o}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {state === 'done' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl p-8 text-center shadow-elevated">
            <div className="text-6xl mb-3">🏆</div>
            <h2 className="text-3xl font-extrabold">Yakun!</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <ResultTile label="Ball" value={score} />
              <ResultTile label="Aniqlik" value={`${accuracy}%`} />
              <ResultTile label="To'g'ri" value={correct} />
              <ResultTile label="Max combo" value={`x${maxCombo}`} />
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={start} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-white font-extrabold shadow-xl hover:scale-105 transition-transform">
                <RotateCcw className="h-4 w-4" /> Qayta o'ynash
              </button>
              <Link to="/games" className="inline-flex items-center gap-2 rounded-2xl border-2 border-border bg-card px-6 py-3 font-extrabold hover:bg-muted transition-colors">
                O'yinlar
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatChip({ icon: Icon, label, value, tone = 'default' }: { icon: any; label: string; value: string; tone?: 'default' | 'hot' | 'danger' }) {
  const cls =
    tone === 'hot' ? 'from-rose-500 to-orange-500 text-white' :
    tone === 'danger' ? 'from-red-500 to-rose-600 text-white' :
    'from-card/80 to-card/80 text-foreground';
  return (
    <div className={`rounded-2xl border border-border/60 bg-gradient-to-br ${cls} backdrop-blur-md p-3 flex items-center gap-2 shadow-card`}>
      <Icon className="h-4 w-4" />
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</div>
        <div className="text-lg font-extrabold leading-tight truncate">{value}</div>
      </div>
    </div>
  );
}

function ResultTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-2xl font-extrabold">{value}</div>
    </div>
  );
}