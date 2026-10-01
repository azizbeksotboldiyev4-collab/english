import { motion } from 'framer-motion';
import { useDailyMissions } from '@/contexts/DailyMissionsContext';
import { useProgress } from '@/hooks/useProgress';
import { Target, Zap, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DailyMissionsPanel() {
  const { missions, completedCount, totalMissions, claimReward, allClaimed } = useDailyMissions();
  const { addXp } = useProgress();

  const handleClaim = (missionId: string) => {
    const xp = claimReward(missionId);
    if (xp > 0) {
      addXp(xp);
      toast.success(`+${xp} XP olindi! 🎉`);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
          <Target className="h-5 w-5 text-duo-blue" />
          Kunlik vazifalar
        </h2>
        <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {completedCount}/{totalMissions}
        </span>
      </div>

      {missions.map((m, i) => {
        const isDone = m.current >= m.target;
        const isClaimed = allClaimed.includes(m.id);

        return (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`flex items-center gap-4 bg-card rounded-2xl border p-4 transition-all ${
              isClaimed ? 'border-primary/20 bg-primary/5 opacity-70' : 'border-border hover:shadow-card'
            }`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
              isDone ? 'bg-primary/10' : m.color + ' text-primary-foreground'
            }`}>
              {isClaimed ? <CheckCircle2 className="h-5 w-5 text-primary" /> : m.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${isClaimed ? 'text-muted-foreground line-through' : 'text-card-foreground'}`}>
                {m.title}
              </p>
              <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${isDone ? 'bg-primary' : m.color} transition-all duration-500`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(m.current / m.target) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{m.current}/{m.target}</p>
            </div>
            {isDone && !isClaimed ? (
              <button
                onClick={() => handleClaim(m.id)}
                className="btn-duo bg-duo-yellow px-3 py-1.5 text-xs font-extrabold"
                style={{ boxShadow: '0 3px 0 0 hsl(38, 80%, 40%)', color: 'hsl(30, 80%, 18%)' }}
              >
                +{m.xp} XP
              </button>
            ) : (
              <div className="flex items-center gap-1 text-duo-yellow">
                <Zap className="h-4 w-4" />
                <span className="text-xs font-extrabold">+{m.xp}</span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
