import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { LEVELS, SAMPLE_LESSONS, CATEGORIES } from '@/data/lessons';
import { useProgress } from '@/hooks/useProgress';
import { ArrowLeft, ArrowRight, CheckCircle2, Award, Sparkles, Clock, Pin, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Certificate from '@/components/Certificate';

export default function LevelDetail() {
  const { levelId } = useParams<{ levelId: string }>();
  const { progress } = useProgress();
  const [showCert, setShowCert] = useState(false);
  const level = LEVELS.find(l => l.id === levelId);
  const lessons = SAMPLE_LESSONS.filter(l => l.levelId === levelId);
  const completedCount = lessons.filter(l => progress.completedTopics.includes(l.id)).length;
  const allDone = lessons.length > 0 && completedCount === lessons.length;

  const difficultyByLevel: Record<string, { label: string; cls: string }> = {
    a1: { label: 'Beginner', cls: 'bg-duo-green/15 text-duo-green border-duo-green/30' },
    a2: { label: 'Beginner+', cls: 'bg-duo-blue/15 text-duo-blue border-duo-blue/30' },
    b1: { label: 'Intermediate', cls: 'bg-duo-yellow/15 text-duo-yellow border-duo-yellow/30' },
    b2: { label: 'Upper-Int', cls: 'bg-duo-orange/15 text-duo-orange border-duo-orange/30' },
    c1: { label: 'Advanced', cls: 'bg-duo-purple/15 text-duo-purple border-duo-purple/30' },
  };
  const difficulty = difficultyByLevel[level?.id ?? 'a1'] ?? difficultyByLevel.a1;

  const categorySummary: Record<string, string> = {
    grammar: "Grammatika qoidalari, gap tuzilishi va to'g'ri yozish ko'nikmalari.",
    speaking: "Talaffuz, ravonlik va kundalik suhbatda ishonchli gapirish.",
    listening: "Tabiiy ingliz nutqini tushunish va eshitish ko'nikmalari.",
    vocabulary: "Yangi so'zlar, iboralar va ularni kontekstda qo'llash.",
    reading: "Matnlarni tushunish va asosiy fikrni ajratish.",
    writing: "Aniq va tushunarli yozish ko'nikmalari.",
  };

  const { data: customLessons = [] } = useQuery({
    queryKey: ['custom-lessons', levelId],
    queryFn: async () => {
      const { data } = await supabase.from('custom_lessons').select('*').eq('level_id', levelId!).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!levelId,
  });

  if (!level) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Daraja topilmadi</p>
      </div>
    );
  }

  const availableCats = CATEGORIES.filter(c => lessons.some(l => l.category === c.id));
  const defaultTab = customLessons.length > 0 ? 'new' : (availableCats[0]?.id ?? 'grammar');

  return (
    <div className="container py-8 md:py-12">
      <Link to="/levels" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Darajalar
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {level.name} — {level.label}
          </h1>
          <p className="text-muted-foreground mt-1">{level.description}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {completedCount}/{lessons.length} mavzu o'tildi
          </p>
        </div>
        {allDone && (
          <Button onClick={() => setShowCert(true)} className="gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-soft">
            <Award className="h-5 w-5" />
            Sertifikatni olish
          </Button>
        )}
      </motion.div>

      <div className="mt-8">
        <Tabs defaultValue={defaultTab} className="w-full">
          <div className="-mx-4 px-4 overflow-x-auto scrollbar-none">
            <TabsList className="inline-flex h-auto w-max gap-2 bg-muted/50 p-1.5 rounded-2xl">
              {customLessons.length > 0 && (
                <TabsTrigger
                  value="new"
                  className="rounded-xl px-4 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-foreground font-semibold text-sm gap-2"
                >
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="hidden sm:inline">Yangi</span>
                  <span className="sm:hidden">New</span>
                  <span className="ml-1 text-xs opacity-70">({customLessons.length})</span>
                </TabsTrigger>
              )}
              {availableCats.map((cat, i) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="rounded-xl px-4 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-foreground font-semibold text-sm gap-2 whitespace-nowrap"
                >
                  <span>{cat.icon}</span>
                  <span>Modul {i + 1}: {cat.label}</span>
                  <span className="ml-1 text-xs opacity-70">
                    ({lessons.filter(l => l.category === cat.id).length})
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {customLessons.length > 0 && (
            <TabsContent value="new">
              <AnimatePresence mode="wait">
                <motion.div
                  key="new"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="mt-6 space-y-4"
                >
                  <div className="glass rounded-2xl p-5 border border-amber-500/30">
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                      <Sparkles className="h-4 w-4" /> Yangi darslar
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Admin tomonidan qo'shilgan yangi mavzular shu yerda paydo bo'ladi.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {customLessons.map((lesson: any) => (
                      <Link key={lesson.id} to={`/db-lesson/${lesson.id}`}>
                        <div className="flex items-center justify-between rounded-2xl p-4 glass hover:shadow-card transition-all hover:-translate-y-0.5 border border-amber-500/30">
                          <div className="flex items-center gap-3">
                            <Pin className="h-4 w-4 text-amber-500 shrink-0" />
                            <div>
                              <p className="text-sm font-semibold text-card-foreground">{lesson.title_uz || lesson.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {lesson.category} {(lesson.quiz as any[])?.length ? `• ${(lesson.quiz as any[]).length} savol` : ''}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </TabsContent>
          )}

          {availableCats.map((cat, i) => {
            const catLessons = lessons.filter(l => l.category === cat.id);
            const catDone = catLessons.filter(l => progress.completedTopics.includes(l.id)).length;
            const pct = Math.round((catDone / catLessons.length) * 100);
            return (
              <TabsContent key={cat.id} value={cat.id}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="mt-6 space-y-5"
                  >
                    {/* Module summary */}
                    <div className="glass rounded-2xl p-5 border border-border/60">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                            {cat.icon}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-primary uppercase tracking-wide">Modul {i + 1}</p>
                            <h2 className="text-lg font-extrabold text-foreground">{cat.label}</h2>
                          </div>
                        </div>
                        <Badge variant="outline" className={`${difficulty.cls} border font-semibold`}>
                          {difficulty.label}
                        </Badge>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5" /> Nimani o'rganasiz:
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          {categorySummary[cat.id] ?? "Ushbu modul orqali yangi ko'nikmalarni o'zlashtirasiz."}
                        </p>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-foreground">{catDone}/{catLessons.length} dars · {pct}%</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    </div>

                    {/* Lessons list */}
                    <div className="space-y-3">
                      {catLessons.map((lesson, idx) => {
                        const done = progress.completedTopics.includes(lesson.id);
                        return (
                          <motion.div
                            key={lesson.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                          >
                            <Link to={`/lesson/${lesson.id}`}>
                              <div className={`flex items-center justify-between gap-3 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 border ${
                                done ? 'glass border-primary/30 bg-primary/5' : 'glass border-border/60 hover:shadow-card hover:border-primary/30'
                              }`}>
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  {done ? (
                                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                                  ) : (
                                    <Pin className="h-5 w-5 text-muted-foreground shrink-0" />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-card-foreground truncate">
                                      {idx + 1}. {lesson.titleUz}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">{lesson.title}</p>
                                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                                      <span className="inline-flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> ~10 daqiqa
                                      </span>
                                      <Badge variant="outline" className={`${difficulty.cls} border text-[10px] py-0 px-1.5 font-semibold`}>
                                        {difficulty.label}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                              </div>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      <AnimatePresence>
        {showCert && <Certificate level={level} onClose={() => setShowCert(false)} />}
      </AnimatePresence>
    </div>
  );
}
