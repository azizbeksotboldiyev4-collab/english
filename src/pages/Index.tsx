import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Mic, Headphones, BookOpen, PenLine, Sparkles, GraduationCap,
  Flame, Trophy, Target, Twitter, Instagram, Youtube, Github,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/hooks/useProgress';

const BRAND = {
  primary: '#6C63FF',
  secondary: '#8B5CF6',
  accent: '#FF7A59',
  bg: '#F8FAFC',
};

const nav = [
  { label: 'Home', to: '/' },
  { label: 'Courses', to: '/levels' },
  { label: 'AI Tutor', to: '/yordamchi-ustoz' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
];

const stats = [
  { value: '20K+', label: 'Students' },
  { value: '500+', label: 'Lessons' },
  { value: '95%', label: 'Success Rate' },
  { value: '24/7', label: 'AI Practice' },
];

const features = [
  { icon: Headphones, title: 'Listening', desc: 'Train your ear with native audio, podcasts and adaptive dictation.', gradient: 'from-[#6C63FF] to-[#8B5CF6]' },
  { icon: Mic, title: 'Speaking', desc: 'Real-time voice AI that corrects pronunciation and fluency instantly.', gradient: 'from-[#FF7A59] to-[#F43F5E]' },
  { icon: BookOpen, title: 'Reading', desc: 'Curated articles, stories and comprehension powered by AI insights.', gradient: 'from-[#0EA5E9] to-[#6C63FF]' },
  { icon: PenLine, title: 'Writing', desc: 'Instant essay feedback with grammar, tone and clarity scoring.', gradient: 'from-[#8B5CF6] to-[#EC4899]' },
  { icon: Sparkles, title: 'Vocabulary', desc: 'Spaced-repetition decks that adapt to how your brain remembers.', gradient: 'from-[#10B981] to-[#0EA5E9]' },
  { icon: GraduationCap, title: 'Grammar', desc: 'Structured A1 → C1 grammar with clear rules and live practice.', gradient: 'from-[#F59E0B] to-[#FF7A59]' },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <div className="relative h-9 w-9 rounded-2xl bg-gradient-to-br from-[#6C63FF] via-[#8B5CF6] to-[#FF7A59] shadow-[0_8px_24px_-6px_rgba(108,99,255,0.55)]">
        <div className="absolute inset-[3px] rounded-[13px] bg-white/15 backdrop-blur-sm" />
        <span className="absolute inset-0 grid place-items-center text-white font-bold text-sm tracking-tight">A</span>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-semibold tracking-tight text-slate-900 dark:text-white text-[15px]">Azizbek EDU</span>
        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase">AI English</span>
      </div>
    </Link>
  );
}

function Nav() {
  return (
    <div className="sticky top-3 z-40 mx-auto max-w-6xl px-4">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/70 dark:bg-slate-900/60 dark:border-white/10 backdrop-blur-xl px-4 py-2.5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.15)]">
        <Logo />
        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              className="px-3 py-1.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5 transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white px-4 py-2 text-sm font-semibold text-white dark:text-slate-900 hover:opacity-90 transition-opacity shadow-sm"
        >
          Login
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative h-[420px] md:h-[520px] w-full">
      {/* backdrop blooms */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-8 right-10 h-72 w-72 rounded-full bg-[#6C63FF]/30 blur-3xl" />
        <div className="absolute bottom-4 left-4 h-64 w-64 rounded-full bg-[#FF7A59]/25 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8B5CF6]/30 blur-3xl" />
      </div>

      {/* Big glass sphere */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute right-6 top-10 h-64 w-64 rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.9), rgba(255,255,255,0.15) 40%, rgba(139,92,246,0.35) 70%, rgba(108,99,255,0.55) 100%)',
          boxShadow: '0 40px 80px -20px rgba(108,99,255,0.55), inset 0 0 40px rgba(255,255,255,0.35)',
        }}
      >
        <div className="absolute inset-0 rounded-full border border-white/40" />
      </motion.div>

      {/* Small accent sphere */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-8 bottom-16 h-24 w-24 rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #ffffff, #FFB199 55%, #FF7A59 100%)',
          boxShadow: '0 20px 40px -10px rgba(255,122,89,0.6)',
        }}
      />

      {/* Floating ring 1 */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#6C63FF]/30"
        style={{ borderStyle: 'dashed' }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#8B5CF6]/20"
      />

      {/* Glass card — mini widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="absolute bottom-6 right-2 md:right-8 w-[240px] rounded-2xl border border-white/60 bg-white/70 dark:bg-slate-900/60 dark:border-white/10 backdrop-blur-xl p-4 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25)]"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] grid place-items-center shadow-[0_8px_20px_-6px_rgba(108,99,255,0.55)]">
            <Mic className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-900 dark:text-white">AI Voice Coach</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Live pronunciation feedback</p>
          </div>
        </div>
        <div className="mt-3 flex items-end gap-1 h-8">
          {[8, 14, 22, 30, 18, 24, 12, 20, 28, 16, 10, 18].map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: [h, h + 8, h] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.08 }}
              className="flex-1 rounded-full bg-gradient-to-t from-[#6C63FF] to-[#FF7A59]"
              style={{ height: h }}
            />
          ))}
        </div>
      </motion.div>

      {/* Floating micro tag */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-6 left-2 md:left-6 rounded-full border border-white/70 bg-white/80 dark:bg-slate-900/60 dark:border-white/10 backdrop-blur-xl px-3 py-1.5 shadow-sm flex items-center gap-1.5"
      >
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">GPT-powered · Real-time</span>
      </motion.div>
    </div>
  );
}

function DashboardPreview({ xp, streak }: { xp: number; streak: number }) {
  const percent = Math.min(100, ((xp % 500) / 500) * 100) || 62;
  const c = 2 * Math.PI * 44;
  const off = c - (percent / 100) * c;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className="relative rounded-3xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl p-6 md:p-8 shadow-[0_30px_80px_-30px_rgba(108,99,255,0.35)]"
    >
      <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-[#6C63FF]/25 blur-2xl" />
      <div className="absolute -bottom-8 -right-6 h-32 w-32 rounded-full bg-[#FF7A59]/25 blur-2xl" />

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Progress ring */}
        <div className="col-span-1 rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 p-5 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Daily Progress</p>
          <div className="relative mt-3">
            <svg width={120} height={120} className="-rotate-90">
              <circle cx={60} cy={60} r={44} strokeWidth={10} className="fill-none stroke-slate-100 dark:stroke-white/10" />
              <motion.circle
                cx={60} cy={60} r={44} strokeWidth={10}
                strokeLinecap="round"
                stroke="url(#pgrad)"
                strokeDasharray={c}
                initial={{ strokeDashoffset: c }}
                whileInView={{ strokeDashoffset: off }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="fill-none"
              />
              <defs>
                <linearGradient id="pgrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6C63FF" />
                  <stop offset="100%" stopColor="#FF7A59" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round(percent)}%</p>
                <p className="text-[10px] text-slate-500">of goal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle stats */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] grid place-items-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current Lesson</p>
            </div>
            <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">B1 · Past Perfect</p>
            <div className="mt-3 h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
              <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6]" />
            </div>
            <p className="mt-2 text-[10px] text-slate-500">6 of 8 sections completed</p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#FF7A59] to-[#F43F5E] grid place-items-center">
                <Flame className="h-4 w-4 text-white" />
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Weekly Streak</p>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{streak || 12}<span className="text-sm font-medium text-slate-500 ml-1">days</span></p>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className={`h-6 flex-1 rounded-md ${i < 5 ? 'bg-gradient-to-b from-[#FF7A59] to-[#F43F5E]' : 'bg-slate-100 dark:bg-white/10'}`} />
              ))}
            </div>
          </div>

          <div className="col-span-2 rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#10B981] to-[#0EA5E9] grid place-items-center">
                  <Trophy className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Learning Statistics</p>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">+18% this week</span>
            </div>
            <div className="mt-4 flex items-end gap-1.5 h-16">
              {[40, 55, 30, 70, 65, 85, 60].map((h, i) => (
                <div key={i} className="flex-1 rounded-lg bg-gradient-to-t from-[#6C63FF]/80 to-[#8B5CF6]/40" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-slate-400">
              {['M','T','W','T','F','S','S'].map((d,i)=>(<span key={i}>{d}</span>))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Index() {
  const { user } = useAuth();
  const { progress } = useProgress();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-['Inter',system-ui,sans-serif] text-slate-900 dark:text-slate-100">
      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-20 h-[500px] w-[500px] rounded-full bg-[#6C63FF]/15 blur-3xl" />
        <div className="absolute top-40 -right-20 h-[500px] w-[500px] rounded-full bg-[#FF7A59]/10 blur-3xl" />
      </div>

      <div className="pt-4">
        <Nav />
      </div>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-5 pt-14 md:pt-20 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur px-3 py-1.5 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6C63FF] animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 tracking-wide">New · GPT-4 powered speaking mode</span>
            </div>

            <h1 className="mt-5 text-[42px] md:text-[64px] leading-[1.05] font-bold tracking-tight">
              Learn English.
              <br />
              <span className="bg-gradient-to-r from-[#6C63FF] via-[#8B5CF6] to-[#FF7A59] bg-clip-text text-transparent">
                Build Your Future.
              </span>
            </h1>

            <p className="mt-5 text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              Practice speaking, listening, grammar and vocabulary with AI-powered lessons designed to make you fluent — faster than you thought possible.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to={user ? '/dashboard' : '/login'}
                className="group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_15px_40px_-10px_rgba(108,99,255,0.6)] hover:shadow-[0_20px_50px_-10px_rgba(108,99,255,0.75)] transition-all hover:-translate-y-0.5"
              >
                <span className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                Start Learning
                <ArrowRight className="h-4 w-4 relative transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/voice-chat"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur px-6 py-3.5 text-sm font-semibold text-slate-900 dark:text-white hover:bg-white transition-colors"
              >
                <Mic className="h-4 w-4 text-[#FF7A59]" />
                Try AI Speaking
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex -space-x-2">
                {['#6C63FF','#8B5CF6','#FF7A59','#0EA5E9'].map((c,i)=>(
                  <div key={i} className="h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-950" style={{background:c}} />
                ))}
              </div>
              <span><span className="font-semibold text-slate-900 dark:text-white">20,000+</span> learners already fluent</span>
            </div>
          </motion.div>

          <HeroVisual />
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 backdrop-blur px-5 py-6 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#FF7A59] bg-clip-text text-transparent">{s.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-[#6C63FF] uppercase tracking-widest">Everything you need</p>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">One platform. Every skill.</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">From your first word to advanced fluency — every core skill lives in one elegant place, powered by AI.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group relative rounded-3xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl p-6 hover:-translate-y-1 hover:shadow-[0_25px_60px_-20px_rgba(108,99,255,0.35)] transition-all duration-300"
            >
              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${f.gradient} grid place-items-center shadow-[0_10px_25px_-8px_rgba(108,99,255,0.5)] group-hover:scale-110 transition-transform`}>
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              <div className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#6C63FF] opacity-0 group-hover:opacity-100 transition-opacity">
                Explore <ArrowRight className="h-3 w-3" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-2">
            <p className="text-xs font-semibold text-[#FF7A59] uppercase tracking-widest">Your control center</p>
            <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">A dashboard that motivates.</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              Track progress, streaks and skill growth at a glance. Beautiful data that keeps you coming back.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {['Real-time progress rings','Daily streak tracker','Personalized next lesson','AI-generated weekly insights'].map((t) => (
                <li key={t} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Target className="h-4 w-4 text-[#6C63FF]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-3">
            <DashboardPreview xp={progress.xp} streak={progress.streak} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="relative overflow-hidden rounded-[32px] p-10 md:p-16 text-center text-white"
          style={{ background: 'linear-gradient(135deg,#6C63FF 0%,#8B5CF6 50%,#FF7A59 100%)' }}>
          <div className="absolute -top-20 -left-10 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Start your English journey today.</h2>
            <p className="mt-4 text-white/85 max-w-xl mx-auto">Join thousands of learners becoming fluent with AI. No credit card required.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to={user ? '/dashboard' : '/login'} className="rounded-2xl bg-white text-slate-900 px-6 py-3.5 text-sm font-semibold shadow-lg hover:scale-[1.02] active:scale-95 transition-transform">
                Get Started Free
              </Link>
              <Link to="/levels" className="rounded-2xl border border-white/40 bg-white/10 backdrop-blur px-6 py-3.5 text-sm font-semibold hover:bg-white/20 transition-colors">
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mx-auto max-w-6xl px-5 pt-12 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 max-w-sm">Premium AI-powered English learning for the next generation of global professionals.</p>
            <div className="mt-5 flex items-center gap-2">
              {[Twitter, Instagram, Youtube, Github].map((Icon, i) => (
                <a key={i} href="#" className="h-9 w-9 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 grid place-items-center text-slate-500 hover:text-[#6C63FF] hover:border-[#6C63FF]/40 transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {[
            { title: 'Product', links: ['Courses', 'AI Tutor', 'Pricing', 'Roadmap'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
            { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-900 dark:text-white">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Azizbek EDU. All rights reserved.</p>
          <p className="text-xs text-slate-500">Made with care for future polyglots.</p>
        </div>
      </footer>
    </div>
  );
}
