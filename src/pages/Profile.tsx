import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Flame, Zap, Trophy, BookOpen, Star, Crown, Sparkles, Pencil,
  Check, X, Calendar, Clock, Award, Lock, Headphones, Mic,
  Settings as SettingsIcon, GraduationCap, ArrowRight, Brain,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/hooks/useProgress';
import { supabase } from '@/integrations/supabase/client';
import { LEVELS, SAMPLE_LESSONS } from '@/data/lessons';
import { toast } from 'sonner';

const LEVEL_ORDER = ['a1', 'a2', 'b1', 'b2', 'c1'];
const LEVEL_META: Record<string, { label: string; gradient: string; ring: string }> = {
  a1: { label: 'A1 Beginner', gradient: 'from-emerald-400 to-teal-500', ring: 'ring-emerald-400/40' },
  a2: { label: 'A2 Elementary', gradient: 'from-sky-400 to-blue-500', ring: 'ring-sky-400/40' },
  b1: { label: 'B1 Intermediate', gradient: 'from-violet-400 to-fuchsia-500', ring: 'ring-violet-400/40' },
  b2: { label: 'B2 Upper-Int.', gradient: 'from-orange-400 to-rose-500', ring: 'ring-orange-400/40' },
  c1: { label: 'C1 Advanced', gradient: 'from-amber-300 to-yellow-500', ring: 'ring-amber-300/40' },
};

const ALL_BADGES = [
  { id: 'first-login', name: 'First Step', icon: Sparkles, desc: 'Tizimga birinchi kirish' },
  { id: 'first-lesson', name: 'First Lesson', icon: BookOpen, desc: 'Birinchi darsni tugating' },
  { id: 'streak-7', name: '7-Day Streak', icon: Flame, desc: '7 kun ketma-ket', requireStreak: 7 },
  { id: 'streak-30', name: '30-Day Streak', icon: Flame, desc: '30 kun ketma-ket', requireStreak: 30 },
  { id: 'xp-500', name: 'Rising Star', icon: Star, desc: '500 XP yig\'ing', requireXp: 500 },
  { id: 'xp-2000', name: 'Grammar Master', icon: Award, desc: '2000 XP yig\'ing', requireXp: 2000 },
  { id: 'quiz-master', name: 'Quiz Master', icon: Brain, desc: "10 ta quizdan o'ting" },
  { id: 'champion', name: 'Champion', icon: Crown, desc: 'C1 darajaga yetishing', requireLevel: 'c1' },
];

function getActivityHeatmap(completedTopics: string[]) {
  // Pseudo-deterministic heatmap based on topic count for last 12 weeks (84 days)
  const days = 84;
  const seed = completedTopics.length || 1;
  const arr: number[] = [];
  for (let i = 0; i < days; i++) {
    const v = Math.abs(Math.sin((i + 1) * seed * 0.37)) * 4;
    arr.push(i < days - 30 && Math.random() < 0.2 ? 0 : Math.floor(v));
  }
  return arr;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const { progress } = useProgress();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'O\'rganuvchi';
  const userAvatar = user?.user_metadata?.avatar_url || '';
  const userEmail = user?.email || '';
  const joinDate = user?.created_at ? new Date(user.created_at) : new Date();

  useEffect(() => { setName(userName); }, [userName]);

  const totalTopics = SAMPLE_LESSONS.length;
  const completed = progress.completedTopics.length;
  const overallPct = totalTopics > 0 ? Math.round((completed / totalTopics) * 100) : 0;

  const currentLevelIdx = Math.max(0, LEVEL_ORDER.indexOf(progress.level));
  const currentLevel = LEVEL_META[progress.level] ?? LEVEL_META.a1;

  const heatmap = useMemo(() => getActivityHeatmap(progress.completedTopics), [progress.completedTopics]);

  const stats = [
    { icon: BookOpen, label: 'Darslar', value: completed, sub: `/ ${totalTopics}`, glow: 'from-emerald-400/30 to-emerald-400/0' },
    { icon: Brain, label: 'Quizlar', value: Math.min(completed * 2, 50), sub: 'topshirilgan', glow: 'from-cyan-400/30 to-cyan-400/0' },
    { icon: Zap, label: 'XP', value: progress.xp, sub: 'ball', glow: 'from-amber-400/30 to-amber-400/0' },
    { icon: Flame, label: 'Streak', value: progress.streak, sub: 'kun', glow: 'from-orange-400/30 to-orange-400/0' },
  ];

  const unlockedBadges = new Set<string>(progress.badges);
  ALL_BADGES.forEach(b => {
    if (b.requireStreak && progress.streak >= b.requireStreak) unlockedBadges.add(b.id);
    if (b.requireXp && progress.xp >= b.requireXp) unlockedBadges.add(b.id);
    if (b.requireLevel && progress.level === b.requireLevel) unlockedBadges.add(b.id);
    if (b.id === 'first-lesson' && completed > 0) unlockedBadges.add(b.id);
  });

  const recentActivity = SAMPLE_LESSONS
    .filter(l => progress.completedTopics.includes(l.id))
    .slice(-5)
    .reverse();

  const handleSaveName = async () => {
    if (!name.trim() || !user) return;
    setSaving(true);
    try {
      await supabase.auth.updateUser({ data: { full_name: name.trim() } });
      await supabase.from('profiles').update({ full_name: name.trim() }).eq('user_id', user.id);
      toast.success('Ism yangilandi');
      setEditing(false);
    } catch (e: any) {
      toast.error('Saqlashda xato');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (!confirm('Profilingizdan chiqishni xohlaysizmi?')) return;
    setLoggingOut(true);
    try {
      await signOut();
      toast.success('Tizimdan chiqildi');
    } catch {
      toast.error('Chiqishda xatolik');
    } finally {
      setLoggingOut(false);
    }
  };

  // Ring math
  const ringSize = 220;
  const stroke = 14;
  const r = (ringSize - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-background text-foreground">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-40 -right-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative container mx-auto max-w-6xl px-4 py-8 md:py-12 space-y-8">
        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl glass-strong p-6 md:p-8 shadow-card"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.12),transparent_60%)]" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar with glow */}
            <div className="relative shrink-0">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-1.5 rounded-full opacity-80 blur-[2px]"
                style={{ background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))' }}
              />
              <div className="relative h-28 w-28 rounded-full overflow-hidden border-4 border-background bg-card flex items-center justify-center">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl font-extrabold text-primary">{userName.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {editing ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={60}
                      className="rounded-lg bg-muted border border-border px-3 py-1.5 text-lg font-bold text-foreground outline-none focus:border-primary"
                    />
                    <button onClick={handleSaveName} disabled={saving} className="rounded-lg bg-primary text-primary-foreground p-2 hover:opacity-90"><Check className="h-4 w-4" /></button>
                    <button onClick={() => { setEditing(false); setName(userName); }} className="rounded-lg bg-muted p-2 text-foreground"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                      {userName}
                    </h1>
                    {user && (
                      <button onClick={() => setEditing(true)} className="rounded-lg p-1.5 text-muted-foreground hover:text-primary hover:bg-muted transition-colors" title="Tahrirlash">
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{userEmail || 'Mehmon'}</p>

              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${currentLevel.gradient} px-3 py-1 text-xs font-bold text-white shadow-soft`}>
                  <Trophy className="h-3.5 w-3.5" /> {currentLevel.label}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" /> {joinDate.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })} dan
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-duo-orange/10 border border-duo-orange/30 px-3 py-1 text-xs font-bold text-duo-orange">
                  <Flame className="h-3.5 w-3.5" /> {progress.streak} kun streak
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-info/10 border border-info/30 px-3 py-1 text-xs font-bold text-info">
                  <Clock className="h-3.5 w-3.5" /> {Math.max(1, completed * 12)} daqiqa
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* STATS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="group relative overflow-hidden rounded-2xl glass p-4 hover:border-primary/40 transition-colors shadow-card"
            >
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl group-hover:scale-110 transition-transform" />
              <div className="relative">
                <s.icon className="h-5 w-5 text-primary" />
                <p className="mt-3 text-3xl font-extrabold text-foreground tabular-nums">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label} <span className="opacity-70">{s.sub}</span></p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* RING + LEVEL PROGRESS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl glass p-6 flex flex-col items-center justify-center shadow-card"
          >
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-4">Umumiy Progress</h3>
            <div className="relative">
              <svg width={ringSize} height={ringSize} className="-rotate-90">
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
                <circle cx={ringSize/2} cy={ringSize/2} r={r} stroke="hsl(var(--muted))" strokeWidth={stroke} fill="none" />
                <motion.circle
                  cx={ringSize/2} cy={ringSize/2} r={r}
                  stroke="url(#ringGrad)" strokeWidth={stroke} fill="none" strokeLinecap="round"
                  strokeDasharray={c}
                  initial={{ strokeDashoffset: c }}
                  animate={{ strokeDashoffset: c - (overallPct/100)*c }}
                  transition={{ duration: 1.4, ease: 'easeOut' }}
                  style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.5))' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-extrabold text-gradient-primary tabular-nums">{overallPct}%</span>
                <span className="text-xs text-muted-foreground mt-1">tugatildi</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground text-center">{completed} / {totalTopics} dars</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 rounded-2xl glass p-6 shadow-card"
          >
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-4">Daraja Yo'li</h3>
            <div className="relative">
              <div className="absolute left-4 right-4 top-5 h-1 bg-muted rounded-full" />
              <div
                className="absolute left-4 top-5 h-1 rounded-full bg-gradient-primary"
                style={{ width: `calc(${(currentLevelIdx / (LEVEL_ORDER.length - 1)) * 100}% - 0.5rem)` }}
              />
              <div className="relative flex justify-between">
                {LEVEL_ORDER.map((lv, i) => {
                  const meta = LEVEL_META[lv];
                  const reached = i <= currentLevelIdx;
                  const isCurrent = i === currentLevelIdx;
                  return (
                    <div key={lv} className="flex flex-col items-center gap-2">
                      <div className={`relative h-10 w-10 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${reached ? `bg-gradient-to-br ${meta.gradient} text-white ring-4 ${meta.ring}` : 'bg-muted text-muted-foreground border border-border'} ${isCurrent ? 'scale-110' : ''}`}>
                        {lv.toUpperCase()}
                        {isCurrent && (
                          <motion.span
                            className="absolute inset-0 rounded-full ring-2 ring-primary"
                            animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0, 0.8] }}
                            transition={{ duration: 1.8, repeat: Infinity }}
                          />
                        )}
                      </div>
                      <span className={`text-[10px] md:text-xs font-semibold ${reached ? 'text-foreground' : 'text-muted-foreground'}`}>{meta.label.split(' ')[1]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Heatmap */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Haftalik Faollik</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span>Kam</span>
                  {[0,1,2,3,4].map(v => (
                    <span key={v} className="h-3 w-3 rounded-sm" style={{ background: v === 0 ? 'hsl(var(--muted))' : `hsl(var(--primary) / ${0.18 + v*0.18})` }} />
                  ))}
                  <span>Ko'p</span>
                </div>
              </div>
              <div className="grid grid-flow-col grid-rows-7 gap-[3px] md:gap-1 overflow-x-auto">
                {heatmap.map((v, i) => (
                  <div
                    key={i}
                    className="h-3 w-3 md:h-3.5 md:w-3.5 rounded-sm"
                    style={{ background: v === 0 ? 'hsl(var(--muted))' : `hsl(var(--primary) / ${0.18 + v*0.18})` }}
                    title={`${v} faollik`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* ACHIEVEMENTS */}
        <motion.section
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl glass p-6 shadow-card"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-extrabold text-foreground">Yutuqlar</h3>
              <p className="text-xs text-muted-foreground">{unlockedBadges.size} / {ALL_BADGES.length} ochildi</p>
            </div>
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {ALL_BADGES.map((b) => {
              const unlocked = unlockedBadges.has(b.id);
              const Icon = b.icon;
              return (
                <div
                  key={b.id}
                  className={`relative overflow-hidden rounded-xl border p-3 transition-all ${unlocked ? 'border-primary/40 bg-gradient-to-br from-primary/10 to-accent/5' : 'border-border bg-muted/40 grayscale opacity-60'}`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${unlocked ? 'bg-gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {unlocked ? <Icon className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                  </div>
                  <p className="mt-2 text-sm font-bold text-foreground">{b.name}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* RECENT + QUICK */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 rounded-2xl glass p-6 shadow-card">
            <h3 className="text-lg font-extrabold text-foreground mb-4">So'nggi faoliyat</h3>
            {recentActivity.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                Hali tugatilgan dars yo'q. <Link to="/levels" className="text-primary font-bold hover:underline">Boshlash</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((l) => (
                  <Link key={l.id} to={`/lesson/${l.id}`} className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3 hover:border-primary/40 hover:bg-muted transition-all">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 text-lg">
                      {l.category === 'grammar' ? '📝' : l.category === 'vocabulary' ? '📚' : l.category === 'speaking' ? '🗣️' : '📖'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{l.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{l.titleUz}</p>
                    </div>
                    <span className="text-[10px] font-bold text-primary">✓</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Link to="/levels" className="group flex items-center gap-3 rounded-2xl glass p-4 hover:border-primary/40 transition-all shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground"><GraduationCap className="h-5 w-5" /></div>
              <div className="flex-1"><p className="text-sm font-bold text-foreground">Darslarni davom et</p><p className="text-xs text-muted-foreground">Keyingi mavzu</p></div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
            <Link to="/listening" className="group flex items-center gap-3 rounded-2xl glass p-4 hover:border-info/40 transition-all shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info"><Headphones className="h-5 w-5" /></div>
              <div className="flex-1"><p className="text-sm font-bold text-foreground">Listening</p><p className="text-xs text-muted-foreground">Eshitish mashqi</p></div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-all" />
            </Link>
            <Link to="/speaking" className="group flex items-center gap-3 rounded-2xl glass p-4 hover:border-primary/40 transition-all shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Mic className="h-5 w-5" /></div>
              <div className="flex-1"><p className="text-sm font-bold text-foreground">Speaking</p><p className="text-xs text-muted-foreground">Mikrofon mashqi</p></div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-all" />
            </Link>
            <button
              onClick={handleSignOut}
              disabled={loggingOut}
              className="group flex items-center gap-3 rounded-2xl glass p-4 w-full text-left hover:border-destructive/40 transition-all shadow-card"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <LogOut className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">Chiqish</p>
                <p className="text-xs text-muted-foreground">Tizimdan chiqish</p>
              </div>
              {loggingOut ? (
                <span className="h-4 w-4 rounded-full border-2 border-destructive/30 border-t-destructive animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-destructive group-hover:translate-x-1 transition-all" />
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}