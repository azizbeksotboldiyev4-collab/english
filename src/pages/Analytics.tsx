import { motion } from 'framer-motion';
import { BarChart3, Flame, Zap, Trophy, TrendingUp, Calendar, Target, BookOpen } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { useAuth } from '@/contexts/AuthContext';

export default function Analytics() {
  const { progress } = useProgress();
  const { user } = useAuth();

  const weekDays = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Ya'];
  const today = new Date().getDay();
  // Simulate streak calendar (last 30 days)
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return { date: d, active: i >= 30 - progress.streak };
  });

  const stats = [
    { label: 'Umumiy XP', value: progress.xp, icon: Zap, color: 'text-duo-yellow bg-duo-yellow/10' },
    { label: 'Streak', value: `${progress.streak} kun`, icon: Flame, color: 'text-duo-orange bg-duo-orange/10' },
    { label: 'Daraja', value: progress.level.toUpperCase(), icon: Trophy, color: 'text-primary bg-primary/10' },
    { label: 'Mavzular', value: progress.completedTopics.length, icon: BookOpen, color: 'text-duo-purple bg-duo-purple/10' },
  ];

  // XP per level simulation
  const xpBreakdown = [
    { label: 'Grammar', pct: 35 },
    { label: 'Vocabulary', pct: 25 },
    { label: 'Reading', pct: 20 },
    { label: 'Speaking', pct: 12 },
    { label: 'Writing', pct: 8 },
  ];

  return (
    <div className="container max-w-3xl py-4 sm:py-6 px-3 sm:px-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-duo-purple to-purple-600 shadow-lg">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">Tahlil</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">O'quv progressingiz tahlili</p>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl border border-border p-4"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color} mb-2`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Streak calendar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border border-border p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-duo-orange" />
          <h2 className="font-bold text-foreground">Streak Kalendar</h2>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map(d => (
            <div key={d} className="text-[10px] text-center text-muted-foreground font-bold">{d}</div>
          ))}
          {/* Offset for first day */}
          {Array.from({ length: (last30[0].date.getDay() + 6) % 7 }, (_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {last30.map((d, i) => (
            <div
              key={i}
              className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold ${
                d.active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {d.date.getDate()}
            </div>
          ))}
        </div>
      </motion.div>

      {/* XP breakdown */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-2xl border border-border p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-foreground">Ko'nikmalar bo'yicha progress</h2>
        </div>
        <div className="space-y-3">
          {xpBreakdown.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-foreground">{item.label}</span>
                <span className="text-muted-foreground">{item.pct}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.pct}%` }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-duo-green" />
          <h2 className="font-bold text-foreground">Tavsiyalar</h2>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <span className="text-lg">💡</span>
            <p className="text-sm text-foreground">Speaking ko'nikmangiz eng past. Kuniga 10 daqiqa speaking mashq qiling!</p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-duo-yellow/5 border border-duo-yellow/10">
            <span className="text-lg">🔥</span>
            <p className="text-sm text-foreground">Streak'ingizni yo'qotmang! Har kuni kamida 1 ta dars o'ting.</p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-duo-purple/5 border border-duo-purple/10">
            <span className="text-lg">📚</span>
            <p className="text-sm text-foreground">Yangi so'zlar o'rganing — kuniga 5 ta so'z yodlash maqsad qiling.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
