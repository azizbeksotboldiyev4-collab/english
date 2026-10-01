import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LEVELS, SAMPLE_LESSONS } from '@/data/lessons';
import { useProgress } from '@/hooks/useProgress';
import { Award, ArrowRight } from 'lucide-react';

export default function LevelProgressList() {
  const { progress } = useProgress();

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h2 className="text-lg font-bold text-card-foreground">Darajalar bo'yicha progress</h2>
      <div className="space-y-3">
        {LEVELS.map((level, idx) => {
          const topics = SAMPLE_LESSONS.filter(l => l.levelId === level.id);
          const done = topics.filter(l => progress.completedTopics.includes(l.id)).length;
          const pct = topics.length ? Math.round((done / topics.length) * 100) : 0;
          const isComplete = pct === 100 && topics.length > 0;

          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl border border-border bg-background p-3.5"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-sm font-bold text-primary-foreground">
                    {level.name}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-card-foreground text-sm">{level.label}</p>
                    <p className="text-xs text-muted-foreground">{done}/{topics.length} mavzu</p>
                  </div>
                </div>
                {isComplete ? (
                  <Link
                    to={`/certificate/${level.id}`}
                    className="flex items-center gap-1.5 rounded-xl bg-success/10 border border-success/20 px-3 py-1.5 text-xs font-semibold text-success hover:bg-success/15 transition-colors"
                  >
                    <Award className="h-3.5 w-3.5" /> Sertifikat
                  </Link>
                ) : (
                  <span className="text-sm font-bold text-card-foreground tabular-nums">{pct}%</span>
                )}
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${isComplete ? 'bg-success' : 'bg-gradient-primary'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
      <Link to="/levels" className="flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:underline pt-1">
        Barcha darajalar <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}