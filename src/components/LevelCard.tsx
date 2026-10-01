import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LEVELS, SAMPLE_LESSONS } from '@/data/lessons';
import { useProgress } from '@/hooks/useProgress';
import { ArrowRight, BookOpen, Layers, Lock, Star } from 'lucide-react';

export const LEVEL_THEME: Record<string, { grad: string; text: string; ring: string; soft: string }> = {
  a1: { grad: 'from-emerald-500 to-lime-400', text: 'text-emerald-400', ring: 'border-emerald-500/30', soft: 'bg-emerald-500/10' },
  a2: { grad: 'from-sky-500 to-cyan-400', text: 'text-sky-400', ring: 'border-sky-500/30', soft: 'bg-sky-500/10' },
  b1: { grad: 'from-amber-500 to-orange-400', text: 'text-amber-400', ring: 'border-amber-500/30', soft: 'bg-amber-500/10' },
  b2: { grad: 'from-violet-500 to-pink-500', text: 'text-violet-400', ring: 'border-violet-500/30', soft: 'bg-violet-500/10' },
  c1: { grad: 'from-rose-500 to-red-400', text: 'text-rose-400', ring: 'border-rose-500/30', soft: 'bg-rose-500/10' },
};

const LEVEL_COPY: Record<string, { title: string; desc: string }> = {
  a1: {
    title: 'Noldan boshlash',
    desc: "Ingliz tilining asoslari: salomlashish, tanishtirish, kundalik iboralar va oddiy gaplar tuzish.",
  },
  a2: { title: 'Elementar', desc: "Kundalik mavzular: oila, xaridlar, sayohat va oddiy suhbatlar." },
  b1: { title: "O'rta daraja", desc: "Fikr bildirish, tajriba haqida gapirish va erkin muloqot qilish." },
  b2: { title: "Yuqori o'rta", desc: "Murakkab mavzular, munozara va tahliliy fikrlash ko'nikmalari." },
  c1: { title: "Ilg'or", desc: "Professional va akademik ingliz tili, nozik ma'no farqlari." },
};

export default function LevelCard({ level }: { level: typeof LEVELS[0] }) {
  const { progress } = useProgress();
  const theme = LEVEL_THEME[level.id] ?? LEVEL_THEME.a1;
  const copy = LEVEL_COPY[level.id] ?? { title: level.label, desc: level.description };

  const lessons = SAMPLE_LESSONS.filter(l => l.levelId === level.id);
  const topicCount = new Set(lessons.map(l => l.category)).size;
  const done = lessons.filter(l => progress.completedTopics.includes(l.id)).length;
  const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
  const available = lessons.length > 0;
  const isActive = progress.level === level.id;

  const Wrapper = available ? Link : ('div' as any);

  return (
    <motion.div whileHover={available ? { y: -4 } : undefined} transition={{ type: 'spring', stiffness: 320, damping: 24 }} className="h-full">
      <Wrapper
        {...(available ? { to: `/levels/${level.id}` } : {})}
        className={`group relative flex h-full flex-col overflow-hidden rounded-[22px] border ${theme.ring} bg-card p-6 shadow-card transition-all duration-300 ${
          available ? 'cursor-pointer hover:shadow-elevated' : 'cursor-not-allowed opacity-70'
        }`}
      >
        {/* 3D level letters */}
        <span
          aria-hidden
          className={`pointer-events-none absolute -right-2 -top-4 select-none bg-gradient-to-br ${theme.grad} bg-clip-text text-[86px] font-black leading-none tracking-tighter text-transparent opacity-[0.13] transition-opacity duration-300 group-hover:opacity-20`}
        >
          {level.name}
        </span>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-lg bg-gradient-to-r ${theme.grad} px-2.5 py-1 text-xs font-black text-background`}>
            {level.name}
          </span>
          {level.id === 'a1' && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] font-bold text-amber-400">
              <Star className="h-3 w-3 fill-current" /> Eng yaxshi boshlanish
            </span>
          )}
          {isActive && available && level.id !== 'a1' && (
            <span className="text-[11px] font-semibold text-primary">● Joriy</span>
          )}
        </div>

        <h3 className="mt-3 text-lg font-bold text-card-foreground">{copy.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{copy.desc}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> {lessons.length} ta dars
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> {topicCount} ta mavzu
          </span>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs font-semibold">
            <span className="text-muted-foreground">{done} / {lessons.length} dars</span>
            <span className={theme.text}>{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${theme.grad}`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="mt-5 pt-1">
          {available ? (
            <span
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${theme.grad} px-4 py-2.5 text-sm font-bold text-background transition-transform duration-200 group-hover:scale-[1.02]`}
            >
              {done > 0 ? 'Davom etish' : 'Boshlash'} <ArrowRight className="h-4 w-4" />
            </span>
          ) : (
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-sm font-semibold text-muted-foreground">
              <Lock className="h-4 w-4" /> Keyin ochiladi
            </span>
          )}
        </div>
      </Wrapper>
    </motion.div>
  );
}
