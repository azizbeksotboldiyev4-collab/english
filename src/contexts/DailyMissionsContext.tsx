import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface Mission {
  id: string;
  title: string;
  icon: string;
  xp: number;
  current: number;
  target: number;
  color: string;
}

interface DailyMissionsContextType {
  missions: Mission[];
  completedCount: number;
  totalMissions: number;
  addMissionProgress: (missionId: string, amount?: number) => void;
  claimReward: (missionId: string) => number; // returns XP
  allClaimed: string[];
}

const DEFAULT_MISSIONS: Mission[] = [
  { id: 'complete-lesson', title: '1 ta dars tugatish', icon: '📚', xp: 15, current: 0, target: 1, color: 'bg-duo-blue' },
  { id: 'learn-words', title: "5 ta yangi so'z o'rganish", icon: '🔤', xp: 20, current: 0, target: 5, color: 'bg-duo-purple' },
  { id: 'quiz-pass', title: '1 ta quizdan o\'tish', icon: '🧠', xp: 15, current: 0, target: 1, color: 'bg-duo-orange' },
  { id: 'ai-chat', title: 'AI ustoz bilan suhbat', icon: '🤖', xp: 10, current: 0, target: 1, color: 'bg-duo-green' },
];

const DailyMissionsContext = createContext<DailyMissionsContextType>({
  missions: DEFAULT_MISSIONS,
  completedCount: 0,
  totalMissions: DEFAULT_MISSIONS.length,
  addMissionProgress: () => {},
  claimReward: () => 0,
  allClaimed: [],
});

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function loadMissions(): { missions: Mission[]; claimed: string[]; date: string } {
  try {
    const raw = localStorage.getItem('linguo-daily-missions');
    if (raw) {
      const data = JSON.parse(raw);
      if (data.date === getTodayKey()) {
        return data;
      }
    }
  } catch {}
  return { missions: DEFAULT_MISSIONS, claimed: [], date: getTodayKey() };
}

function saveMissions(missions: Mission[], claimed: string[]) {
  localStorage.setItem('linguo-daily-missions', JSON.stringify({
    missions,
    claimed,
    date: getTodayKey(),
  }));
}

export function DailyMissionsProvider({ children }: { children: ReactNode }) {
  const [missions, setMissions] = useState<Mission[]>(DEFAULT_MISSIONS);
  const [claimed, setClaimed] = useState<string[]>([]);

  useEffect(() => {
    const saved = loadMissions();
    setMissions(saved.missions);
    setClaimed(saved.claimed);
  }, []);

  const addMissionProgress = useCallback((missionId: string, amount = 1) => {
    setMissions(prev => {
      const updated = prev.map(m =>
        m.id === missionId ? { ...m, current: Math.min(m.current + amount, m.target) } : m
      );
      saveMissions(updated, claimed);
      return updated;
    });
  }, [claimed]);

  const claimReward = useCallback((missionId: string): number => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.current < mission.target || claimed.includes(missionId)) return 0;
    
    const newClaimed = [...claimed, missionId];
    setClaimed(newClaimed);
    saveMissions(missions, newClaimed);
    return mission.xp;
  }, [missions, claimed]);

  const completedCount = missions.filter(m => m.current >= m.target).length;

  return (
    <DailyMissionsContext.Provider value={{
      missions,
      completedCount,
      totalMissions: missions.length,
      addMissionProgress,
      claimReward,
      allClaimed: claimed,
    }}>
      {children}
    </DailyMissionsContext.Provider>
  );
}

export const useDailyMissions = () => useContext(DailyMissionsContext);
