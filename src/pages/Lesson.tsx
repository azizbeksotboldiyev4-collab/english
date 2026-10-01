import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SAMPLE_LESSONS } from '@/data/lessons';
import type { QuizQuestion } from '@/data/lessons';
import { useProgress } from '@/hooks/useProgress';
import { useHearts } from '@/contexts/HeartsContext';
import { useDailyMissions } from '@/contexts/DailyMissionsContext';
import { ArrowLeft, ArrowRight, CheckCircle2, BookOpen, Brain, Bot, Headphones, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import LessonAiChat from '@/components/LessonAiChat';
import ListeningPractice from '@/components/ListeningPractice';
import AiExplainFromZero from '@/components/AiExplainFromZero';
import HeartsDisplay from '@/components/HeartsDisplay';
import NoHeartsModal from '@/components/NoHeartsModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type TabType = 'lesson' | 'listening' | 'quiz' | 'ai';

export default function Lesson() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { progress, openLesson } = useProgress();
  const lesson = SAMPLE_LESSONS.find(l => l.id === id);

  const [tab, setTab] = useState<TabType>('lesson');
  const [aiQuiz, setAiQuiz] = useState<QuizQuestion[] | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (lesson) openLesson(lesson.id, lesson.levelId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  // Load cached AI content for this lesson
  useEffect(() => {
    if (!lesson) return;
    setAiQuiz(null);
    setAiExplanation(null);
    try {
      const raw = localStorage.getItem(`ai-quiz:${lesson.id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          setAiQuiz(parsed.questions);
          setAiExplanation(parsed.lessonExplanation || null);
        }
      }
    } catch {}
  }, [lesson?.id]);

  const generateAi = async (force = false) => {
    if (!lesson || aiLoading) return;
    if (!force && aiQuiz && aiQuiz.length > 0) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: {
          lessonId: lesson.id,
          title: lesson.title,
          titleUz: lesson.titleUz,
          levelId: lesson.levelId,
          category: lesson.category,
          explanation: lesson.content.explanation,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const questions: QuizQuestion[] = data?.questions || [];
      if (questions.length < 5) throw new Error('AI yetarli savol qaytarmadi');
      setAiQuiz(questions);
      setAiExplanation(data.lessonExplanation || null);
      localStorage.setItem(`ai-quiz:${lesson.id}`, JSON.stringify({
        questions,
        lessonExplanation: data.lessonExplanation || '',
        ts: Date.now(),
      }));
      toast.success('AI yangi quiz tayyorladi!');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'AI quiz yaratishda xato');
    } finally {
      setAiLoading(false);
    }
  };

  if (!lesson) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Dars topilmadi</p>
        <Button variant="outline" className="mt-4 rounded-2xl" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Orqaga
        </Button>
      </div>
    );
  }

  const isCompleted = progress.completedTopics.includes(lesson.id);

  const hasListening = !!(lesson.content.listeningItems && lesson.content.listeningItems.length > 0);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'lesson', label: 'Dars', icon: <BookOpen className="h-4 w-4" /> },
    ...(hasListening ? [{ id: 'listening' as TabType, label: 'Tinglash', icon: <Headphones className="h-4 w-4" /> }] : []),
    { id: 'quiz', label: 'Quiz', icon: <Brain className="h-4 w-4" /> },
    { id: 'ai', label: 'AI Ustoz', icon: <Bot className="h-4 w-4" /> },
  ];

  return (
    <div className="container max-w-3xl py-8 md:py-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Orqaga
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-block rounded-xl bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">
            {lesson.category.charAt(0).toUpperCase() + lesson.category.slice(1)}
          </span>
          {isCompleted && (
            <span className="flex items-center gap-1 text-xs font-medium text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" /> O'tildi
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{lesson.title}</h1>
        <p className="text-muted-foreground mt-1">{lesson.titleUz}</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mt-8 mb-6 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              tab === t.id ? 'bg-gradient-primary text-primary-foreground shadow-soft' : 'glass text-foreground hover:shadow-card'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'lesson' ? (
        <LessonContent
          lesson={lesson}
          aiExplanation={aiExplanation}
          onStartQuiz={() => setTab(hasListening ? 'listening' : 'quiz')}
        />
      ) : tab === 'listening' && hasListening ? (
        <ListeningPractice items={lesson.content.listeningItems!} lessonTitle={lesson.title} />
      ) : tab === 'quiz' ? (
        <QuizSection
          lesson={lesson}
          aiQuiz={aiQuiz}
          aiLoading={aiLoading}
          onGenerate={() => generateAi(false)}
          onRegenerate={() => generateAi(true)}
        />
      ) : (
        <LessonAiChat lesson={lesson} />
      )}
    </div>
  );
}

function LessonContent({ lesson, aiExplanation, onStartQuiz }: { lesson: typeof SAMPLE_LESSONS[0]; aiExplanation: string | null; onStartQuiz: () => void }) {
  const { content } = lesson;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <section className="rounded-2xl glass p-6 shadow-card">
        <h2 className="text-lg font-bold text-card-foreground mb-4">📝 Tushuntirish</h2>
        <div className="prose prose-sm max-w-none text-card-foreground/90 whitespace-pre-line leading-relaxed">
          {content.explanation}
        </div>
      </section>

      <AiExplainFromZero
        lessonId={lesson.id}
        title={lesson.title}
        titleUz={lesson.titleUz}
        levelId={lesson.levelId}
        category={lesson.category}
        baseExplanation={lesson.content.explanation}
      />

      {aiExplanation && (
        <section className="rounded-2xl glass p-6 shadow-card border border-primary/20">
          <h2 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> AI batafsil tushuntirish
          </h2>
          <div className="prose prose-sm max-w-none text-card-foreground/90 whitespace-pre-line leading-relaxed">
            {aiExplanation}
          </div>
        </section>
      )}

      {content.table && (
        <section className="rounded-2xl glass p-6 shadow-card overflow-x-auto">
          <h2 className="text-lg font-bold text-card-foreground mb-4">📊 Jadval</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {content.table.headers.map(h => (
                  <th key={h} className="text-left py-2 px-3 font-semibold text-card-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.table.rows.map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  {row.map((cell, j) => (
                    <td key={j} className="py-2 px-3 text-card-foreground/80">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="rounded-2xl glass p-6 shadow-card">
        <h2 className="text-lg font-bold text-card-foreground mb-4">💡 Misollar</h2>
        <div className="space-y-3">
          {content.examples.map((ex, i) => (
            <div key={i} className="rounded-xl bg-primary/5 border border-primary/10 p-4">
              <p className="font-medium text-card-foreground">{ex.en}</p>
              <p className="text-sm text-muted-foreground mt-1">→ {ex.uz}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl glass p-6 shadow-card">
        <h2 className="text-lg font-bold text-card-foreground mb-4">🌍 Real hayot</h2>
        <div className="space-y-3">
          {content.realLife.map((rl, i) => (
            <div key={i} className="rounded-xl bg-accent/5 border border-accent/10 p-4">
              <p className="font-medium text-card-foreground whitespace-pre-line">{rl.en}</p>
              <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">→ {rl.uz}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="text-center">
        <Button onClick={onStartQuiz} size="lg" className="h-14 px-8 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold shadow-soft hover:scale-[1.05] active:scale-[0.98] transition-transform duration-300">
          Quizni boshlash <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
}

function QuizSection({ lesson, aiQuiz, aiLoading, onGenerate, onRegenerate }: {
  lesson: typeof SAMPLE_LESSONS[0];
  aiQuiz: QuizQuestion[] | null;
  aiLoading: boolean;
  onGenerate: () => void;
  onRegenerate: () => void;
}) {
  const { completeTopic } = useProgress();
  const { hearts, loseHeart, isAlive } = useHearts();
  const { addMissionProgress } = useDailyMissions();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  // Auto-trigger generation when quiz tab opens and no cache
  useEffect(() => {
    if (!aiQuiz && !aiLoading) onGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const quiz = aiQuiz && aiQuiz.length > 0 ? aiQuiz : lesson.quiz;

  if (aiLoading && !aiQuiz) {
    return (
      <div className="rounded-2xl glass p-12 shadow-card text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-card-foreground font-medium">AI sifatli quiz tayyorlamoqda...</p>
        <p className="mt-1 text-sm text-muted-foreground">15 ta savol va batafsil tushuntirish</p>
      </div>
    );
  }

  const q = quiz[current];
  const total = quiz.length;

  // Find next lesson in the same level
  const sameLevel = SAMPLE_LESSONS.filter(l => l.levelId === lesson.levelId);
  const idx = sameLevel.findIndex(l => l.id === lesson.id);
  const nextLesson = idx >= 0 && idx < sameLevel.length - 1 ? sameLevel[idx + 1] : null;

  if (!isAlive) return <NoHeartsModal />;

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.correctIndex) {
      setScore(s => s + 1);
    } else {
      loseHeart();
    }
  };

  const handleNext = () => {
    if (current < total - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      const percent = Math.round((score / total) * 100);
      if (percent >= 70) {
        completeTopic(lesson.id, score);
        addMissionProgress('complete-lesson');
        addMissionProgress('quiz-pass');
      }
      setShowResult(true);
    }
  };

  const handleRetry = () => {
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setShowResult(false);
  };

  if (showResult) {
    const percent = Math.round((score / total) * 100);
    const passed = percent >= 70;

    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl glass p-8 shadow-card text-center">
        <div className="text-5xl mb-4">{passed ? '🎉' : '😔'}</div>
        <h2 className="text-2xl font-bold text-card-foreground">
          {passed ? 'Tabriklaymiz!' : "Qayta urinib ko'ring"}
        </h2>
        <p className="text-muted-foreground mt-2">{score}/{total} to'g'ri — {percent}%</p>
        {passed ? (
          <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-sm text-primary font-medium">✅ Mavzu muvaffaqiyatli o'tildi! +{score * 10} XP</p>
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">70% dan yuqori ball kerak. Qayta topshiring!</p>
          </div>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="outline" onClick={handleRetry} className="rounded-2xl">Qayta topshirish</Button>
          {passed && nextLesson && (
            <Button
              onClick={() => navigate(`/lesson/${nextLesson.id}`)}
              className="rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft"
            >
              Keyingi mavzu <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {passed && !nextLesson && (
            <Button onClick={() => navigate(`/levels/${lesson.levelId}`)} className="rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
              Darajaga qaytish
            </Button>
          )}
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="rounded-2xl">Bosh sahifa</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Savol {current + 1}/{total}</span>
          {aiQuiz && <span className="inline-flex items-center gap-1 text-xs text-primary font-medium"><Sparkles className="h-3 w-3" /> AI</span>}
        </div>
        <div className="flex items-center gap-3">
          <span>{score} to'g'ri</span>
          <button
            onClick={onRegenerate}
            disabled={aiLoading}
            title="Yangi savollar"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <motion.div className="h-full rounded-full bg-gradient-primary" animate={{ width: `${((current + 1) / total) * 100}%` }} transition={{ duration: 0.3 }} />
      </div>
      <div className="rounded-2xl glass p-6 shadow-card">
        <h3 className="text-lg font-bold text-card-foreground mb-6">{q.question}</h3>
        <div className="space-y-3">
          {q.options.map((opt, i) => {
            let cls = 'glass hover:shadow-card text-card-foreground';
            if (answered) {
              if (i === q.correctIndex) cls = 'border-primary bg-primary/10 text-primary';
              else if (i === selected) cls = 'border-destructive bg-destructive/10 text-destructive';
              else cls = 'glass text-muted-foreground opacity-50';
            }
            return (
              <button key={i} onClick={() => handleSelect(i)} disabled={answered}
                className={`w-full text-left rounded-2xl border p-4 transition-all duration-300 hover:scale-[1.01] ${cls}`}>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary mr-3">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm font-medium">{opt}</span>
              </button>
            );
          })}
        </div>
        {answered && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`mt-4 rounded-xl p-4 ${selected === q.correctIndex ? 'bg-primary/10 border border-primary/20' : 'bg-destructive/10 border border-destructive/20'}`}>
            <p className="text-sm text-card-foreground">{q.explanation}</p>
          </motion.div>
        )}
        {answered && (
          <div className="mt-6 text-right">
            <Button onClick={handleNext} className="rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft hover:scale-[1.05] transition-transform duration-300">
              {current < total - 1 ? 'Keyingi' : 'Yakunlash'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
