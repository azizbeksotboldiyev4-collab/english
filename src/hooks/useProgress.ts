import { useState, useCallback, useEffect, createContext, useContext, ReactNode, createElement } from 'react';
import { UserProgress } from '@/data/lessons';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ExtendedProgress extends UserProgress {
  lastLessonId?: string | null;
  lastLevelId?: string | null;
  lastAccessedAt?: string | null;
  weeklyActivity?: Record<string, number>;
}

const DEFAULT_PROGRESS: ExtendedProgress = {
  level: 'a1',
  xp: 0,
  streak: 3,
  completedTopics: [],
  quizScores: {},
  badges: ['first-login'],
  lastLessonId: null,
  lastLevelId: null,
  lastAccessedAt: null,
  weeklyActivity: {},
};

function isValidProgress(data: unknown): data is UserProgress {
  if (!data || typeof data !== 'object') return false;
  const p = data as Record<string, unknown>;
  return (
    typeof p.level === 'string' &&
    typeof p.xp === 'number' && p.xp >= 0 &&
    typeof p.streak === 'number' && p.streak >= 0 &&
    Array.isArray(p.completedTopics) &&
    p.completedTopics.every((t: unknown) => typeof t === 'string') &&
    typeof p.quizScores === 'object' && p.quizScores !== null &&
    Array.isArray(p.badges) &&
    p.badges.every((b: unknown) => typeof b === 'string')
  );
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function diffDays(a: string, b: string) {
  const da = new Date(a + 'T00:00:00Z').getTime();
  const db = new Date(b + 'T00:00:00Z').getTime();
  return Math.round((db - da) / 86400000);
}

interface ProgressContextValue {
  progress: ExtendedProgress;
  loading: boolean;
  addXp: (amount: number) => void;
  completeTopic: (topicId: string, score: number) => void;
  openLesson: (lessonId: string, levelId?: string) => void;
  setCurrentLevel: (levelId: string) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function useProgressInternal(): ProgressContextValue {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ExtendedProgress>(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState(true);

  // Load from localStorage first (instant), then sync from Supabase
  useEffect(() => {
    try {
      const saved = localStorage.getItem('linguo-progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (isValidProgress(parsed)) setProgress({ ...DEFAULT_PROGRESS, ...parsed });
      }
    } catch {}
    setLoading(false);
  }, []);

  // Load from Supabase when user logs in
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled || !data) return;
      setProgress(prev => ({
        ...prev,
        level: data.current_level || prev.level,
        xp: data.xp ?? prev.xp,
        streak: data.streak ?? prev.streak,
        completedTopics: data.completed_topics || prev.completedTopics,
        quizScores: (data.quiz_scores as Record<string, number>) || prev.quizScores,
        badges: data.badges || prev.badges,
        lastLessonId: (data as any).last_lesson_id ?? null,
        lastLevelId: (data as any).last_level_id ?? null,
        lastAccessedAt: (data as any).last_accessed_at ?? null,
        weeklyActivity: ((data as any).weekly_activity as Record<string, number>) || {},
      }));
    })();

    // Realtime
    const channel = supabase
      .channel(`progress-${user.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_progress', filter: `user_id=eq.${user.id}` }, (payload) => {
        const d: any = payload.new;
        setProgress(prev => ({
          ...prev,
          xp: d.xp ?? prev.xp,
          streak: d.streak ?? prev.streak,
          completedTopics: d.completed_topics || prev.completedTopics,
          quizScores: d.quiz_scores || prev.quizScores,
          lastLessonId: d.last_lesson_id ?? prev.lastLessonId,
          lastLevelId: d.last_level_id ?? prev.lastLevelId,
          lastAccessedAt: d.last_accessed_at ?? prev.lastAccessedAt,
          weeklyActivity: d.weekly_activity || prev.weeklyActivity,
        }));
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user]);

  const persist = useCallback(async (p: ExtendedProgress, dbPatch?: Record<string, unknown>) => {
    setProgress(p);
    try {
      localStorage.setItem('linguo-progress', JSON.stringify(p));
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
    if (!user) return;
    const payload = {
      user_id: user.id,
      current_level: p.level,
      xp: p.xp,
      streak: p.streak,
      completed_topics: p.completedTopics,
      quiz_scores: p.quizScores as any,
      badges: p.badges,
      last_lesson_id: p.lastLessonId ?? null,
      last_level_id: p.lastLevelId ?? null,
      last_accessed_at: p.lastAccessedAt ?? null,
      weekly_activity: (p.weeklyActivity || {}) as any,
      ...dbPatch,
    } as any;
    const { error } = await supabase
      .from('user_progress')
      .upsert(payload, { onConflict: 'user_id' });
    if (error) console.error('Failed to sync progress to DB:', error);
  }, [user]);

  const addXp = useCallback((amount: number) => {
    persist({ ...progress, xp: progress.xp + amount });
  }, [progress, persist]);

  const completeTopic = useCallback((topicId: string, score: number) => {
    const updated: ExtendedProgress = {
      ...progress,
      completedTopics: [...new Set([...progress.completedTopics, topicId])],
      quizScores: { ...progress.quizScores, [topicId]: score },
      xp: progress.xp + Math.round(score * 10),
    };
    persist(updated);
  }, [progress, persist]);

  const openLesson = useCallback((lessonId: string, levelId?: string) => {
    const now = new Date().toISOString();
    const today = todayStr();
    const prevDate = (progress as any).lastStreakDate || progress.lastAccessedAt?.slice(0, 10);
    let newStreak = progress.streak;
    if (prevDate !== today) {
      if (prevDate && diffDays(prevDate, today) === 1) {
        newStreak = progress.streak + 1;
        toast.success(`Streak +1! 🔥 ${newStreak} kun ketma-ket`);
      } else if (!prevDate || diffDays(prevDate, today) > 1) {
        newStreak = 1;
      }
    }
    const weekly = { ...(progress.weeklyActivity || {}) };
    weekly[today] = (weekly[today] || 0) + 1;
    // keep only last 14 days
    const cutoff = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
    Object.keys(weekly).forEach(k => { if (k < cutoff) delete weekly[k]; });

    const updated: ExtendedProgress = {
      ...progress,
      streak: newStreak,
      lastLessonId: lessonId,
      lastLevelId: levelId || progress.lastLevelId,
      lastAccessedAt: now,
      weeklyActivity: weekly,
    };
    persist(updated, { last_streak_date: today });
  }, [progress, persist]);

  const setCurrentLevel = useCallback((levelId: string) => {
    if (progress.level === levelId && progress.lastLevelId === levelId) return;
    persist({ ...progress, level: levelId, lastLevelId: levelId });
  }, [progress, persist]);

  return { progress, loading, addXp, completeTopic, openLesson, setCurrentLevel };
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const value = useProgressInternal();
  return createElement(ProgressContext.Provider, { value }, children);
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (ctx) return ctx;
  // Fallback: standalone usage (e.g. outside provider)
  return {
    progress: DEFAULT_PROGRESS,
    loading: false,
    addXp: () => {},
    completeTopic: () => {},
    openLesson: () => {},
    setCurrentLevel: () => {},
  };
}
