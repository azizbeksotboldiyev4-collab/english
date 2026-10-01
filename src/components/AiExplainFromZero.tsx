import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Sparkles, Loader2, RefreshCw, ArrowRight, ArrowLeft, Volume2, Pause, Play,
  Copy, Check, Shuffle, Plus, Trophy, BookOpen, AlertTriangle, MapPin,
  ListChecks, Target, Gauge, X, Clock, Lightbulb, Globe2, Bot, ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useProgress } from '@/hooks/useProgress';

interface Props {
  lessonId: string;
  title: string;
  titleUz?: string;
  levelId?: string;
  category?: string;
  baseExplanation?: string;
}

type Mode = 'beginner' | 'standard' | 'advanced';

interface Plan {
  intro: { title: string; simple: string; analogy: string; realLife: string; emoji: string };
  usage: { emoji: string; title: string; desc: string; example: string }[];
  formulas: { type: string; formula: string; example: string; note: string }[];
  examples: { en: string; uz: string; note?: string }[];
  scenarios: { emoji: string; place: string; dialog: { en: string; uz: string }[] }[];
  mistakes: { wrong: string; right: string; why: string }[];
  quiz: { question: string; options: string[]; correctIndex: number; explanation?: string }[];
  vocab: { word: string; ipa?: string; uz: string; example?: string }[];
  summary: { learned: string[]; keyPoints: string[]; tip: string };
}

const MODES: { id: Mode; label: string; dot: string }[] = [
  { id: 'beginner', label: 'Boshlang\u2019ich', dot: 'bg-emerald-500' },
  { id: 'standard', label: 'Standart', dot: 'bg-sky-500' },
  { id: 'advanced', label: 'Yuqori', dot: 'bg-violet-500' },
];

const STEPS = [
  { key: 'intro', label: 'Kirish', icon: Sparkles },
  { key: 'usage', label: 'Qachon?', icon: Target },
  { key: 'formula', label: 'Formula', icon: ListChecks },
  { key: 'examples', label: 'Misollar', icon: BookOpen },
  { key: 'real', label: 'Real hayot', icon: MapPin },
  { key: 'mistakes', label: 'Xatolar', icon: AlertTriangle },
  { key: 'quiz', label: 'Mini test', icon: Trophy },
] as const;

const cacheKey = (id: string, mode: Mode) => `ai-lesson-plan:${id}:${mode}`;

/* ---------------- Speech helpers ---------------- */
function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const rateRef = useRef(1);
  rateRef.current = rate;
  const lastRef = useRef<string>('');

  useEffect(() => () => { try { window.speechSynthesis?.cancel(); } catch { /* noop */ } }, []);

  const speak = (text: string, lang = 'en-US') => {
    if (!('speechSynthesis' in window)) { toast.error('Brauzeringiz ovozni qo\u2019llamaydi'); return; }
    window.speechSynthesis.cancel();
    lastRef.current = text;
    const u = new SpeechSynthesisUtterance(text.slice(0, 900));
    u.lang = lang;
    u.rate = rateRef.current;
    u.onend = () => { setSpeaking(false); setPaused(false); };
    u.onerror = () => { setSpeaking(false); setPaused(false); };
    setSpeaking(true); setPaused(false);
    window.speechSynthesis.speak(u);
  };
  const toggle = () => {
    if (!('speechSynthesis' in window)) return;
    if (window.speechSynthesis.paused) { window.speechSynthesis.resume(); setPaused(false); }
    else { window.speechSynthesis.pause(); setPaused(true); }
  };
  const stop = () => { try { window.speechSynthesis.cancel(); } catch { /* noop */ } setSpeaking(false); setPaused(false); };
  const replay = (lang = 'en-US') => { if (lastRef.current) speak(lastRef.current, lang); };
  return { speak, toggle, stop, replay, speaking, paused, rate, setRate };
}

/* ---------------- Clickable words ---------------- */
function ClickableText({ text, onWord, className }: { text: string; onWord: (w: string) => void; className?: string }) {
  return (
    <span className={className}>
      {text.split(/(\s+)/).map((chunk, i) =>
        /^\s+$/.test(chunk) || !/[a-zA-Z]/.test(chunk) ? (
          <span key={i}>{chunk}</span>
        ) : (
          <button
            key={i}
            type="button"
            onClick={() => onWord(chunk.replace(/[^a-zA-Z'-]/g, ''))}
            className="rounded-sm decoration-dotted underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            {chunk}
          </button>
        )
      )}
    </span>
  );
}

/* ---------------- Reusable presentational pieces ---------------- */
const CARD = 'rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl shadow-card';

function LessonHeader({
  category, title, titleUz, step, total, progressPct, remainingMin, mode, setMode, onRegenerate, loading,
}: {
  category?: string; title: string; titleUz?: string; step: number; total: number;
  progressPct: number; remainingMin: number; mode: Mode; setMode: (m: Mode) => void;
  onRegenerate: () => void; loading: boolean;
}) {
  return (
    <header className={`${CARD} relative overflow-hidden p-5 sm:p-7`}>
      <div className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-[-6rem] h-56 w-56 rounded-full bg-info/10 blur-3xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> {category || 'Grammatika'}
          </span>
          <h2 className="mt-3 truncate text-2xl font-extrabold tracking-tight text-card-foreground sm:text-3xl">
            {titleUz || title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{titleUz ? title : 'AI bilan noldan o\u2019rganish'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-2xl border border-border/60 bg-background/40 px-3 py-2 text-xs font-bold text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> ~{remainingMin} daq
          </div>
          <div className="relative">
            <select
              value={mode}
              onChange={e => setMode(e.target.value as Mode)}
              aria-label="Tushuntirish uslubi"
              className="appearance-none rounded-2xl border border-border/60 bg-background/40 px-3 py-2 pr-8 text-xs font-bold text-foreground transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {MODES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
          <button
            onClick={onRegenerate}
            disabled={loading}
            title="Boshqacha tushuntir"
            aria-label="Boshqacha tushuntir"
            className="rounded-2xl border border-border/60 bg-background/40 p-2.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="relative mt-6">
        <div className="mb-2 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
          <span>{step + 1} / {total} — {STEPS[step].label}</span>
          <span className="text-primary">{progressPct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
          <motion.div
            className="h-full rounded-full bg-gradient-primary"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 22 }}
          />
        </div>
      </div>
    </header>
  );
}

function LessonSteps({ step, maxStep, onGo }: { step: number; maxStep: number; onGo: (i: number) => void }) {
  return (
    <nav aria-label="Dars bosqichlari" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {STEPS.map((s, i) => {
        const active = i === step;
        const done = i < step;
        const locked = i > maxStep;
        return (
          <button
            key={s.key}
            onClick={() => !locked && onGo(i)}
            disabled={locked}
            aria-current={active ? 'step' : undefined}
            className={`group flex shrink-0 items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
              active
                ? 'border-transparent bg-gradient-primary shadow-elevated'
                : locked
                  ? 'border-border/40 bg-card/40 opacity-50'
                  : 'border-border/60 bg-card/60 hover:-translate-y-0.5 hover:border-primary/40'
            }`}
          >
            <span className={`flex h-7 w-7 items-center justify-center rounded-xl text-[12px] font-extrabold ${
              active ? 'bg-white/20 text-primary-foreground'
                : done ? 'bg-success/15 text-success'
                : 'bg-muted/70 text-muted-foreground'
            }`}>
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={`whitespace-nowrap text-xs font-bold ${
              active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
            }`}>
              {s.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function ExplanationCard({ title, icon, children, tone = 'primary' }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; tone?: 'primary' | 'muted' | 'info';
}) {
  const tones = {
    primary: 'border-primary/25 bg-primary/[0.07]',
    info: 'border-info/25 bg-info/[0.07]',
    muted: 'border-border/60 bg-background/40',
  } as const;
  return (
    <section className={`rounded-3xl border p-5 transition-colors sm:p-6 ${tones[tone]}`}>
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-background/60 text-primary">{icon}</span>
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-card-foreground">{title}</h3>
      </div>
      <div className="space-y-3 text-[15px] leading-relaxed text-card-foreground/90">{children}</div>
    </section>
  );
}

function AiUstozPanel({
  step, loading, onUnderstood, onRephrase, onMoreExamples, onSimplify, onPractice, onListen,
  speech, stepText,
}: {
  step: number; loading: boolean;
  onUnderstood: () => void; onRephrase: () => void; onMoreExamples: () => void;
  onSimplify: () => void; onPractice: () => void; onListen: () => void;
  speech: ReturnType<typeof useSpeech>; stepText: string;
}) {
  const actions = [
    { label: 'Tushundim', icon: '✓', onClick: onUnderstood, primary: true },
    { label: 'Boshqacha tushuntir', icon: '↻', onClick: onRephrase },
    { label: 'Ko\u2019proq misol', icon: '💡', onClick: onMoreExamples },
    { label: 'Boshlang\u2019ich uslub', icon: '🎓', onClick: onSimplify },
    { label: 'Mashq ber', icon: '🎯', onClick: onPractice },
  ];
  return (
    <div className={`${CARD} relative overflow-hidden p-5`}>
      <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative flex items-center gap-3">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-primary shadow-soft">
          <Bot className="h-5 w-5 text-primary-foreground" />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-success" />
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-extrabold text-card-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Ustoz
          </p>
          <p className="text-[11px] text-muted-foreground">Sizning shaxsiy ustozingiz</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[10px] font-bold text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> Online
        </span>
      </div>

      <div className="relative mt-4 rounded-2xl border border-border/50 bg-background/40 p-4">
        <p className="text-sm font-bold text-card-foreground">Salom! 👋</p>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
          Hozir <span className="font-bold text-primary">{STEPS[step].label}</span> bosqichidasiz. Men mavzuni sodda va
          tushunarli qilib tushuntiraman — istalgan savolingizni bering.
        </p>
      </div>

      <div className="relative mt-3 grid grid-cols-2 gap-2">
        <Button onClick={onUnderstood} className="rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
          <Play className="mr-1.5 h-4 w-4" /> Davom
        </Button>
        <Button variant="outline" onClick={onListen} className="rounded-2xl">
          <Volume2 className="mr-1.5 h-4 w-4" /> Tinglash
        </Button>
      </div>

      {/* audio controls */}
      <div className="relative mt-3 flex flex-wrap items-center gap-1.5 rounded-2xl border border-border/50 bg-background/30 p-2">
        <button
          onClick={speech.toggle}
          disabled={!speech.speaking}
          className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground transition-colors hover:text-primary disabled:opacity-40"
        >
          {speech.paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />} {speech.paused ? 'Davom' : 'Pauza'}
        </button>
        <button
          onClick={() => speech.replay()}
          className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground transition-colors hover:text-primary"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Qayta
        </button>
        <div className="ml-auto inline-flex items-center gap-1">
          <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
          {[0.75, 1, 1.25].map(r => (
            <button
              key={r}
              onClick={() => speech.setRate(r)}
              className={`rounded-lg px-2 py-1 text-[11px] font-bold transition-colors ${
                speech.rate === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              {r}x
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-5">
        <p className="text-sm font-extrabold text-card-foreground">Tushundingizmi?</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Siz uchun kerakli yordamni tanlang:</p>
        <div className="mt-3 space-y-2">
          {actions.map(a => (
            <button
              key={a.label}
              onClick={a.onClick}
              disabled={loading}
              className={`flex w-full items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 text-left text-[13px] font-bold transition-all duration-200 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                a.primary
                  ? 'border-success/30 bg-success/10 text-success hover:bg-success/15'
                  : 'border-border/60 bg-background/40 text-muted-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <span className="text-base leading-none">{a.icon}</span> {a.label}
              {loading && <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin" />}
            </button>
          ))}
        </div>
      </div>

      <p className="relative mt-4 line-clamp-2 text-[11px] text-muted-foreground/70">🔊 {stepText.slice(0, 90)}…</p>
    </div>
  );
}

function LessonNavigation({ step, total, onPrev, onNext }: {
  step: number; total: number; onPrev: () => void; onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-3xl border border-border/60 bg-card/60 p-3 backdrop-blur-xl">
      <Button variant="outline" disabled={step === 0} onClick={onPrev} className="rounded-2xl">
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Orqaga
      </Button>
      <span className="hidden text-xs font-bold text-muted-foreground sm:block">{step + 1} / {total}</span>
      {step < total - 1 && (
        <Button onClick={onNext} className="rounded-2xl bg-gradient-primary px-6 text-primary-foreground shadow-elevated transition-transform hover:-translate-y-0.5">
          Keyingi <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

/* ---------------- Component ---------------- */
export default function AiExplainFromZero({ lessonId, title, titleUz, levelId, category, baseExplanation }: Props) {
  const [mode, setMode] = useState<Mode>('standard');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [extraExamples, setExtraExamples] = useState<Plan['examples']>([]);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [copied, setCopied] = useState<number | null>(null);
  const [word, setWord] = useState<{ word: string; uz?: string; ipa?: string; example?: string } | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [xpGiven, setXpGiven] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const speech = useSpeech();
  const { addXp } = useProgress();
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPlan(null); setStep(0); setMaxStep(0); setAnswers({}); setFinished(false);
    setExtraExamples([]); setXpGiven(false);
    try {
      const raw = localStorage.getItem(cacheKey(lessonId, mode));
      if (raw) setPlan(JSON.parse(raw));
    } catch { /* noop */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, mode]);

  const fetchPlan = async (variant?: string) => {
    if (loading) return;
    setLoading(true);
    speech.stop();
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/explain-lesson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${anon}` },
        body: JSON.stringify({ title, titleUz, levelId, category, baseExplanation, mode, variant }),
      });
      if (!res.ok) {
        let msg = 'AI tushuntirishda xatolik';
        try { const j = await res.json(); msg = j.error || msg; } catch { /* noop */ }
        throw new Error(msg);
      }
      const data = (await res.json()) as Plan;
      if (!data?.intro) throw new Error('AI javobi to\u2019liq emas');
      setPlan(data); setStep(0); setMaxStep(0); setAnswers({}); setFinished(false); setExtraExamples([]); setXpGiven(false);
      try { localStorage.setItem(cacheKey(lessonId, mode), JSON.stringify(data)); } catch { /* noop */ }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    } finally {
      setLoading(false);
    }
  };

  const moreExamples = async () => {
    if (!plan || loading) return;
    setLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/explain-lesson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${anon}` },
        body: JSON.stringify({ title, titleUz, levelId, category, baseExplanation, mode, variant: `yangi-misollar-${Date.now()}` }),
      });
      if (!res.ok) throw new Error('Qo\u2019shimcha misollar olinmadi');
      const data = (await res.json()) as Plan;
      setExtraExamples(prev => [...prev, ...(data.examples || []).slice(0, 6)]);
      toast.success('Yangi misollar qo\u2019shildi');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xatolik');
    } finally { setLoading(false); }
  };

  const allExamples = useMemo(() => {
    const list = [...(plan?.examples || []), ...extraExamples];
    if (!shuffleSeed) return list;
    return [...list].sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, extraExamples, shuffleSeed]);

  const openWord = (w: string) => {
    if (!w) return;
    const found = plan?.vocab?.find(v => v.word.toLowerCase() === w.toLowerCase());
    setWord({ word: w, uz: found?.uz, ipa: found?.ipa, example: found?.example });
    speech.speak(w);
  };

  const goto = (i: number) => {
    speech.stop();
    setStep(i);
    setMaxStep(m => Math.max(m, i));
    setAiOpen(false);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const quizScore = plan ? plan.quiz.filter((q, i) => answers[i] === q.correctIndex).length : 0;

  const finishQuiz = () => {
    if (!plan) return;
    setFinished(true);
    const pct = Math.round((quizScore / plan.quiz.length) * 100);
    if (pct >= 60) {
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors: ['#7C5CFC', '#35D07F', '#a78bfa'] });
    }
    if (!xpGiven) {
      addXp(10 + quizScore * 4);
      setXpGiven(true);
    }
  };

  const progressPct = plan ? Math.round(((finished ? STEPS.length : step) / STEPS.length) * 100) : 0;
  const remainingMin = plan ? Math.max(1, (STEPS.length - step) * 2) : 14;

  /* ---------- Empty state ---------- */
  if (!plan) {
    return (
      <div className={`${CARD} relative overflow-hidden p-6 sm:p-8`}>
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary shadow-soft">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-extrabold text-card-foreground">AI Noldan Tushuntir</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Mavzu 7 bosqichli interaktiv darsga aylanadi: kirish, qachon ishlatiladi, formula, misollar, real hayot,
              xatolar va mini test.
            </p>
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap gap-2">
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all ${
                mode === m.id ? 'border-primary bg-primary/10 text-primary' : 'border-border/60 text-muted-foreground hover:border-primary/40'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${m.dot}`} /> {m.label}
            </button>
          ))}
        </div>

        <Button onClick={() => fetchPlan()} disabled={loading} className="relative mt-5 w-full rounded-2xl bg-gradient-primary px-6 text-primary-foreground shadow-elevated sm:w-auto">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {loading ? 'AI darsni tayyorlamoqda...' : 'Noldan o\u2019rganishni boshlash'}
        </Button>

        {loading && (
          <div className="relative mt-5 space-y-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-3 animate-pulse rounded-full bg-muted/60" style={{ width: `${90 - i * 18}%` }} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const stepText = stepAudio(plan, step);

  const aiPanel = (
    <AiUstozPanel
      step={step}
      loading={loading}
      speech={speech}
      stepText={stepText}
      onListen={() => speech.speak(stepText, 'en-US')}
      onUnderstood={() => goto(Math.min(step + 1, STEPS.length - 1))}
      onRephrase={() => fetchPlan(`boshqacha-${Date.now()}`)}
      onMoreExamples={() => { goto(3); moreExamples(); }}
      onSimplify={() => setMode('beginner')}
      onPractice={() => goto(STEPS.length - 1)}
    />
  );

  return (
    <div ref={topRef} className="space-y-4">
      <LessonHeader
        category={category}
        title={title}
        titleUz={titleUz}
        step={step}
        total={STEPS.length}
        progressPct={progressPct}
        remainingMin={remainingMin}
        mode={mode}
        setMode={setMode}
        loading={loading}
        onRegenerate={() => fetchPlan(`qayta-${Date.now()}`)}
      />

      <LessonSteps step={step} maxStep={maxStep} onGo={goto} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main lesson area */}
        <div className="space-y-4">
          <div className={`${CARD} p-5 sm:p-6`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${step}-${finished}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {finished ? (
                  <CompletionView plan={plan} score={quizScore} onReview={() => { setFinished(false); setAnswers({}); goto(0); }} />
                ) : step === 0 ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{plan.intro.emoji || '🎯'}</div>
                      <h3 className="text-xl font-extrabold tracking-tight text-card-foreground sm:text-2xl">{plan.intro.title}</h3>
                    </div>
                    <p className="text-[15px] leading-relaxed text-card-foreground/90">{plan.intro.simple}</p>

                    <ExplanationCard title="Oddiy qilib aytganda" icon={<Lightbulb className="h-4 w-4" />} tone="primary">
                      <p>{plan.intro.analogy}</p>
                    </ExplanationCard>

                    <ExplanationCard title="Real hayotda" icon={<Globe2 className="h-4 w-4" />} tone="muted">
                      <p>{plan.intro.realLife}</p>
                    </ExplanationCard>
                  </>
                ) : step === 1 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(plan.usage || []).map((u, i) => (
                      <motion.div key={i} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                        className="rounded-3xl border border-border/60 bg-background/40 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card">
                        <div className="mb-1.5 text-2xl">{u.emoji}</div>
                        <p className="font-bold text-card-foreground">{u.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{u.desc}</p>
                        <p className="mt-3 rounded-2xl bg-primary/10 p-3 text-sm font-medium text-primary">
                          <ClickableText text={u.example} onWord={openWord} />
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : step === 2 ? (
                  <div className="space-y-3">
                    {(plan.formulas || []).map((f, i) => (
                      <div key={i} className="rounded-3xl border border-primary/25 bg-primary/[0.07] p-5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-lg bg-primary/15 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-primary">{f.type}</span>
                          <button
                            onClick={() => { navigator.clipboard?.writeText(f.formula); setCopied(i); setTimeout(() => setCopied(null), 1500); }}
                            className="text-muted-foreground transition-colors hover:text-primary"
                            title="Nusxalash"
                            aria-label="Formulani nusxalash"
                          >
                            {copied === i ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="mt-3 break-words rounded-2xl bg-background/50 p-3 font-mono text-sm font-bold text-card-foreground">{f.formula}</p>
                        <p className="mt-2 text-sm text-card-foreground/85"><ClickableText text={f.example} onWord={openWord} /></p>
                        {f.note && <p className="mt-1 text-xs text-muted-foreground">{f.note}</p>}
                      </div>
                    ))}
                  </div>
                ) : step === 3 ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setShuffleSeed(s => s + 1)} className="inline-flex items-center gap-1.5 rounded-2xl border border-border/60 px-3.5 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                        <Shuffle className="h-3.5 w-3.5" /> Aralashtirish
                      </button>
                      <button onClick={moreExamples} disabled={loading} className="inline-flex items-center gap-1.5 rounded-2xl bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50">
                        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Yana misol
                      </button>
                    </div>
                    {allExamples.map((ex, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-3xl border border-border/60 bg-background/40 p-4 transition-colors hover:border-primary/30">
                        <button onClick={() => speech.speak(ex.en)} aria-label="Tinglash" className="shrink-0 rounded-2xl bg-primary/10 p-2.5 text-primary transition-colors hover:bg-primary/20">
                          <Volume2 className="h-4 w-4" />
                        </button>
                        <div className="min-w-0">
                          <p className="font-medium text-card-foreground"><ClickableText text={ex.en} onWord={openWord} /></p>
                          <p className="mt-0.5 text-sm text-muted-foreground">→ {ex.uz}</p>
                          {ex.note && <p className="mt-1 text-xs text-muted-foreground/80">{ex.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : step === 4 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(plan.scenarios || []).map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="rounded-3xl border border-border/60 bg-background/40 p-5">
                        <p className="mb-3 font-bold text-card-foreground">{s.emoji} {s.place}</p>
                        <div className="space-y-2">
                          {(s.dialog || []).map((d, j) => (
                            <div key={j} className="rounded-2xl bg-primary/[0.07] p-3">
                              <div className="flex items-start gap-2">
                                <button onClick={() => speech.speak(d.en)} aria-label="Tinglash" className="mt-0.5 shrink-0 text-primary"><Volume2 className="h-3.5 w-3.5" /></button>
                                <div>
                                  <p className="text-sm text-card-foreground"><ClickableText text={d.en} onWord={openWord} /></p>
                                  <p className="text-xs text-muted-foreground">{d.uz}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : step === 5 ? (
                  <div className="space-y-3">
                    {(plan.mistakes || []).map((m, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                        className="rounded-3xl border border-border/60 bg-background/40 p-5">
                        <p className="text-sm font-medium text-destructive line-through">❌ {m.wrong}</p>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07 + 0.2 }}
                          className="mt-1 text-sm font-bold text-success">✅ {m.right}</motion.p>
                        <p className="mt-2 text-xs text-muted-foreground">💬 {m.why}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <QuizView plan={plan} answers={answers} setAnswers={setAnswers} onFinish={finishQuiz} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {!finished && (
            <LessonNavigation
              step={step}
              total={STEPS.length}
              onPrev={() => goto(Math.max(0, step - 1))}
              onNext={() => goto(Math.min(STEPS.length - 1, step + 1))}
            />
          )}
        </div>

        {/* AI Ustoz — desktop */}
        {!finished && (
          <aside className="hidden xl:block">
            <div className="sticky top-4">{aiPanel}</div>
          </aside>
        )}
      </div>

      {/* AI Ustoz — mobile bottom sheet */}
      {!finished && (
        <div className="xl:hidden">
          <button
            onClick={() => setAiOpen(true)}
            className="flex w-full items-center gap-3 rounded-3xl border border-primary/25 bg-primary/10 px-4 py-3 text-left transition-colors hover:bg-primary/15"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-primary">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-extrabold text-card-foreground">AI Ustoz</span>
              <span className="block text-[11px] text-muted-foreground">Yordam kerakmi? Bosing</span>
            </span>
            <ChevronDown className="ml-auto h-4 w-4 rotate-180 text-primary" />
          </button>

          <AnimatePresence>
            {aiOpen && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm"
                onClick={() => setAiOpen(false)}
              >
                <motion.div
                  initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                  transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                  onClick={e => e.stopPropagation()}
                  className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-background p-3"
                >
                  <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
                  {aiPanel}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Vocabulary popup */}
      <AnimatePresence>
        {word && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
            onClick={() => setWord(null)}>
            <motion.div initial={{ y: 30, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl border border-primary/25 bg-card p-5 shadow-elevated">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xl font-extrabold text-card-foreground">{word.word}</p>
                  {word.ipa && <p className="text-sm text-muted-foreground">/{word.ipa.replace(/[/]/g, '')}/</p>}
                </div>
                <button onClick={() => setWord(null)} aria-label="Yopish" className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <button onClick={() => speech.speak(word.word)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                <Volume2 className="h-3.5 w-3.5" /> Talaffuz
              </button>
              <p className="mt-3 text-sm text-card-foreground/90">
                {word.uz ? `🇺🇿 ${word.uz}` : 'Tarjima lug\u2019atda topilmadi — talaffuzni tinglang.'}
              </p>
              {word.example && <p className="mt-2 rounded-xl bg-muted/40 p-3 text-sm text-card-foreground/80">{word.example}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function stepAudio(plan: Plan, step: number): string {
  switch (step) {
    case 0: return `${plan.intro.simple} ${plan.intro.analogy}`;
    case 1: return (plan.usage || []).map(u => `${u.title}. ${u.example}`).join('. ');
    case 2: return (plan.formulas || []).map(f => `${f.type}: ${f.example}`).join('. ');
    case 3: return (plan.examples || []).slice(0, 8).map(e => e.en).join('. ');
    case 4: return (plan.scenarios || []).flatMap(s => (s.dialog || []).map(d => d.en)).slice(0, 8).join('. ');
    case 5: return (plan.mistakes || []).map(m => `Correct: ${m.right}`).join('. ');
    default: return (plan.quiz || []).map(q => q.question).join('. ');
  }
}

/* ---------------- Quiz ---------------- */
function QuizView({ plan, answers, setAnswers, onFinish }: {
  plan: Plan; answers: Record<number, number>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  onFinish: () => void;
}) {
  const quiz = plan.quiz || [];
  const allAnswered = quiz.length > 0 && quiz.every((_, i) => answers[i] !== undefined);
  if (quiz.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Bu dars uchun test hozircha mavjud emas.</p>;
  }
  return (
    <div className="space-y-4">
      {quiz.map((q, qi) => {
        const picked = answers[qi];
        return (
          <div key={qi} className="rounded-3xl border border-border/60 bg-background/40 p-5">
            <p className="mb-3 font-bold text-card-foreground">{qi + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                let cls = 'border-border/60 hover:border-primary/40 hover:-translate-y-0.5';
                if (picked !== undefined) {
                  if (oi === q.correctIndex) cls = 'border-success/50 bg-success/10 text-success';
                  else if (oi === picked) cls = 'border-destructive/50 bg-destructive/10 text-destructive';
                  else cls = 'border-border/40 opacity-50';
                }
                return (
                  <button key={oi} disabled={picked !== undefined}
                    onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))}
                    className={`w-full rounded-2xl border p-3.5 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${cls}`}>
                    {String.fromCharCode(65 + oi)}. {opt}
                  </button>
                );
              })}
            </div>
            {picked !== undefined && q.explanation && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 rounded-2xl bg-muted/40 p-3 text-sm text-card-foreground/80">💬 {q.explanation}</motion.p>
            )}
          </div>
        );
      })}
      <Button disabled={!allAnswered} onClick={onFinish} className="w-full rounded-2xl bg-gradient-primary text-primary-foreground shadow-elevated">
        <Trophy className="mr-2 h-4 w-4" /> Yakunlash
      </Button>
    </div>
  );
}

/* ---------------- Completion ---------------- */
function CompletionView({ plan, score, onReview }: { plan: Plan; score: number; onReview: () => void }) {
  const total = (plan.quiz || []).length || 1;
  const pct = Math.round((score / total) * 100);
  const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;
  return (
    <div className="space-y-4">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/15 to-success/10 p-6 text-center">
        <div className="mb-2 text-5xl">{pct >= 60 ? '🎉' : '💪'}</div>
        <h3 className="text-2xl font-extrabold text-card-foreground">{score}/{total} — {pct}%</h3>
        <div className="mt-2 text-2xl">{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
        <p className="mt-2 text-sm font-bold text-primary">+{10 + score * 4} XP</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {pct >= 70 ? 'Ajoyib! Keyingi mavzuga o\u2019tishga tayyorsiz.' : 'Yaxshi urinish — mavzuni bir bor takrorlashni tavsiya qilamiz.'}
        </p>
      </motion.div>

      <div className="rounded-3xl border border-border/60 bg-background/40 p-5">
        <p className="mb-2 font-bold text-card-foreground">📚 Nimalarni o'rgandingiz</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-card-foreground/85">
          {(plan.summary?.learned || []).map((l, i) => <li key={i}>{l}</li>)}
        </ul>
      </div>

      {(plan.summary?.keyPoints || []).length > 0 && (
        <div className="rounded-3xl border border-primary/25 bg-primary/[0.07] p-5">
          <p className="mb-2 font-bold text-primary">🧩 Asosiy qoidalar</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-card-foreground/85">
            {plan.summary.keyPoints.map((k, i) => <li key={i}>{k}</li>)}
          </ul>
        </div>
      )}

      {(plan.vocab || []).length > 0 && (
        <div className="rounded-3xl border border-border/60 bg-background/40 p-5">
          <p className="mb-2 font-bold text-card-foreground">🗂 O'rganilgan so'zlar</p>
          <div className="flex flex-wrap gap-2">
            {plan.vocab.map((v, i) => (
              <span key={i} className="rounded-xl bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {v.word} — {v.uz}
              </span>
            ))}
          </div>
        </div>
      )}

      {plan.summary?.tip && (
        <p className="rounded-3xl bg-muted/40 p-4 text-sm text-card-foreground/85">💡 {plan.summary.tip}</p>
      )}

      <Button variant="outline" onClick={onReview} className="w-full rounded-2xl">
        <RefreshCw className="mr-2 h-4 w-4" /> Darsni takrorlash
      </Button>
    </div>
  );
}
