import { motion } from 'framer-motion';
import { useProgress } from '@/hooks/useProgress';
import { LEVELS, SAMPLE_LESSONS } from '@/data/lessons';
import { Link } from 'react-router-dom';
import { Flame, Zap, Trophy, BookOpen, ArrowRight, Target, Headphones, Mic, Bot, Sparkles, Gamepad2, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ContinueLearningCard from '@/components/ContinueLearningCard';
import LevelProgressList from '@/components/LevelProgressList';
import WeeklyActivityChart from '@/components/WeeklyActivityChart';
import { Skeleton } from '@/components/ui/skeleton';

const stats = [
  { icon: Flame, label: "Streak", getValue: (p: any) => `${p.streak} kun`, gradient: 'from-orange-500 to-red-500' },
  { icon: Zap, label: "XP", getValue: (p: any) => p.xp, gradient: 'from-primary to-accent' },
  { icon: Trophy, label: "Daraja", getValue: (p: any) => p.level.toUpperCase(), gradient: 'from-amber-500 to-orange-500' },
  { icon: BookOpen, label: "Mavzular", getValue: (p: any) => p.completedTopics.length, gradient: 'from-emerald-500 to-teal-500' },
];

export default function Dashboard() {
  const { progress, loading } = useProgress();
  const { user } = useAuth();
  const currentLevel = LEVELS.find(l => l.id === progress.level) || LEVELS[0];
  const userName = user?.user_metadata?.full_name || 'O\'rganuvchi';

  const completedLevels = LEVELS.filter(lvl => {
    const topics = SAMPLE_LESSONS.filter(l => l.levelId === lvl.id);
    return topics.length > 0 && topics.every(t => progress.completedTopics.includes(t.id));
  }).length;

  return (
    <div className="container py-8 md:py-12 space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Xush kelibsiz, {userName}! 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Davom eting — har bir qadam sizi maqsadga yaqinlashtiradi
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5">
          <Target className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Daraja: <strong>{currentLevel.name} — {currentLevel.label}</strong>
          </span>
        </div>
      </motion.div>

      {/* Continue learning */}
      {loading ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : (
        <ContinueLearningCard />
      )}

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="rounded-xl border border-border bg-card p-4 hover:shadow-card transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${s.gradient}`}>
                <s.icon className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold text-card-foreground">{s.getValue(progress)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick access */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/listening">
          <div className="rounded-xl border border-border bg-card p-5 hover:shadow-card transition-all duration-200 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Headphones className="h-5 w-5 text-info" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-card-foreground">Listening Practice</h3>
              <p className="text-xs text-muted-foreground">Eshitib yozish mashqlari</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Link>
        <Link to="/speaking">
          <div className="rounded-xl border border-border bg-card p-5 hover:shadow-card transition-all duration-200 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Mic className="h-5 w-5 text-success" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-card-foreground">Speaking Practice</h3>
              <p className="text-xs text-muted-foreground">Mikrofon + AI tahlil</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Link>
        <Link to="/yordamchi-ustoz">
          <div className="rounded-xl border border-border bg-card p-5 hover:shadow-card transition-all duration-200 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-card-foreground">AI Ustoz</h3>
              <p className="text-xs text-muted-foreground">Aqlli yordamchi</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LevelProgressList />
        <WeeklyActivityChart />
      </div>

      {/* Platform features */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Nega Azizbek EDU</p>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mt-1">Bitta platforma — to'liq natija</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Sparkles, title: "Smart Lessons", desc: "A1 dan C1 gacha AI bilan moslashuvchan darslar", accent: 'text-primary bg-primary/10' },
            { icon: Bot, title: "AI Feedback", desc: "Talaffuz va grammatikani jonli AI tahlil qiladi", accent: 'text-accent bg-accent/10' },
            { icon: Gamepad2, title: "Gamification", desc: "XP, streak va o'yinlar orqali motivatsiya", accent: 'text-primary bg-primary/10' },
            { icon: TrendingUp, title: "Progress Tracking", desc: "Har bir qadam real statistikada ko'rinadi", accent: 'text-accent bg-accent/10' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card hover:shadow-elevated hover:border-primary/30 transition-all duration-200"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${f.accent}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-bold text-card-foreground">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {completedLevels > 0 && (
        <div className="rounded-xl border border-success/20 bg-success/5 p-4 text-sm text-success">
          🎓 {completedLevels} ta daraja tugatdingiz — sertifikat olishga tayyorsiz!
        </div>
      )}
    </div>
  );
}
