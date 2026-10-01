import { motion } from 'framer-motion';
import { useProgress } from '@/hooks/useProgress';

const DAY_LABELS = ['Ya', 'Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha'];

export default function WeeklyActivityChart() {
  const { progress } = useProgress();
  const weekly = progress.weeklyActivity || {};

  const days: { date: string; count: number; label: string; isToday: boolean }[] = [];
  const todayStr = new Date().toISOString().slice(0, 10);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    days.push({
      date: key,
      count: weekly[key] || 0,
      label: DAY_LABELS[d.getDay()],
      isToday: key === todayStr,
    });
  }
  const max = Math.max(1, ...days.map(d => d.count));
  const total = days.reduce((s, d) => s + d.count, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-card-foreground">Haftalik faollik</h2>
        <span className="text-xs text-muted-foreground">{total} dars / 7 kun</span>
      </div>
      <div className="flex items-end justify-between gap-2 h-28">
        {days.map((d, i) => {
          const h = d.count > 0 ? Math.max(8, (d.count / max) * 100) : 4;
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="relative w-full flex-1 flex items-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className={`w-full rounded-md ${
                    d.count > 0
                      ? d.isToday
                        ? 'bg-gradient-primary shadow-soft'
                        : 'bg-primary/60'
                      : 'bg-muted'
                  }`}
                  title={`${d.count} dars`}
                />
              </div>
              <span className={`text-[10px] font-medium ${d.isToday ? 'text-primary' : 'text-muted-foreground'}`}>{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}