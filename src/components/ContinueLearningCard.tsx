import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock } from 'lucide-react';
import { SAMPLE_LESSONS, LEVELS } from '@/data/lessons';
import { useProgress } from '@/hooks/useProgress';

function timeAgo(iso?: string | null) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'hozir';
  if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
  return `${Math.floor(diff / 86400)} kun oldin`;
}

export default function ContinueLearningCard() {
  const { progress } = useProgress();
  const lastId = progress.lastLessonId;
  const lesson = lastId ? SAMPLE_LESSONS.find(l => l.id === lastId) : null;
  const targetLesson = lesson || SAMPLE_LESSONS.find(l => !progress.completedTopics.includes(l.id));
  if (!targetLesson) return null;

  const level = LEVELS.find(l => l.id === targetLesson.levelId) || LEVELS[0];
  const levelTopics = SAMPLE_LESSONS.filter(l => l.levelId === level.id);
  const completedInLevel = levelTopics.filter(l => progress.completedTopics.includes(l.id)).length;
  const pct = levelTopics.length ? Math.round((completedInLevel / levelTopics.length) * 100) : 0;
  const isResume = !!lesson;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 shadow-card"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 text-xs font-medium text-primary">
            <span className="rounded-full bg-primary/15 px-2.5 py-1 uppercase">{level.name} • {level.label}</span>
            {progress.lastAccessedAt && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" /> {timeAgo(progress.lastAccessedAt)}
              </span>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-card-foreground">
            {isResume ? "Davom etish" : "O'qishni boshlang"}
          </h2>
          <p className="mt-1 font-medium text-card-foreground/90 truncate">{targetLesson.title}</p>
          <p className="text-sm text-muted-foreground truncate">{targetLesson.titleUz}</p>

          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{level.name} progress</span>
              <span className="font-semibold text-card-foreground">{completedInLevel}/{levelTopics.length} • {pct}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-gradient-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        <Link
          to={`/lesson/${targetLesson.id}`}
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-soft hover:scale-[1.03] active:scale-[0.98] transition-transform"
        >
          <Play className="h-4 w-4 fill-current" />
          {isResume ? "Davom etish" : "Boshlash"}
        </Link>
      </div>
    </motion.div>
  );
}