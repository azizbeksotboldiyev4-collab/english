import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Brain, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useProgress } from '@/hooks/useProgress';
import AiExplainFromZero from '@/components/AiExplainFromZero';

type Quiz = { id: string; question: string; options: string[]; correctIndex: number; explanation?: string };

export default function DbLesson() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'lesson' | 'quiz'>('lesson');
  const { openLesson } = useProgress();

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['db-lesson', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('custom_lessons').select('*').eq('id', id!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (lesson?.id) openLesson(lesson.id, lesson.level_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }
  if (!lesson) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground">Dars topilmadi</p>
        <Button variant="outline" className="mt-4 rounded-2xl" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Orqaga
        </Button>
      </div>
    );
  }

  const examples = (lesson.examples as any[]) || [];
  const quiz: Quiz[] = ((lesson.quiz as any[]) || []).map(q => ({ ...q, options: q.options || [] }));

  return (
    <div className="container max-w-3xl py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Orqaga
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="rounded-xl bg-primary/10 border border-primary/20 px-2.5 py-1 text-[11px] font-bold text-primary uppercase">
            {lesson.level_id} • {lesson.category}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">{lesson.title_uz || lesson.title}</h1>
        <p className="text-muted-foreground mt-1">{lesson.description}</p>
      </motion.div>

      <div className="flex gap-2 mt-6 mb-4">
        <button onClick={() => setTab('lesson')} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${tab === 'lesson' ? 'bg-gradient-primary text-primary-foreground' : 'glass'}`}>
          <BookOpen className="h-4 w-4" /> Dars
        </button>
        {quiz.length > 0 && (
          <button onClick={() => setTab('quiz')} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${tab === 'quiz' ? 'bg-gradient-primary text-primary-foreground' : 'glass'}`}>
            <Brain className="h-4 w-4" /> Quiz ({quiz.length})
          </button>
        )}
      </div>

      {tab === 'lesson' ? (
        <div className="space-y-6">
          <section className="rounded-2xl glass p-6 shadow-card">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><BookOpen className="h-5 w-5" /> Tushuntirish</h2>
            <div className="prose prose-sm max-w-none whitespace-pre-line text-card-foreground/90 leading-relaxed">
              {lesson.explanation || 'Tushuntirish mavjud emas'}
            </div>
          </section>

          <AiExplainFromZero
            lessonId={lesson.id}
            title={lesson.title}
            titleUz={lesson.title_uz || undefined}
            levelId={lesson.level_id}
            category={lesson.category}
            baseExplanation={lesson.explanation || undefined}
          />

          {examples.length > 0 && (
            <section className="rounded-2xl glass p-6 shadow-card">
              <h2 className="text-lg font-bold mb-3">💡 Misollar</h2>
              <div className="space-y-3">
                {examples.map((ex, i) => (
                  <div key={i} className="rounded-xl bg-primary/5 border border-primary/10 p-4">
                    <p className="font-medium">{ex.en}</p>
                    <p className="text-sm text-muted-foreground mt-1">→ {ex.uz}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <DbQuiz quiz={quiz} />
      )}
    </div>
  );
}

function DbQuiz({ quiz }: { quiz: Quiz[] }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (quiz.length === 0) return <p className="text-center text-muted-foreground">Test mavjud emas</p>;
  const q = quiz[current];

  if (done) {
    const pct = Math.round((score / quiz.length) * 100);
    return (
      <div className="rounded-2xl glass p-8 text-center">
        <div className="text-5xl mb-3">{pct >= 70 ? '🎉' : '😔'}</div>
        <h2 className="text-2xl font-bold">{score}/{quiz.length} — {pct}%</h2>
        <Button className="mt-4 rounded-2xl" onClick={() => { setCurrent(0); setSelected(null); setAnswered(false); setScore(0); setDone(false); }}>
          Qayta urinish
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Savol {current + 1}/{quiz.length}</span>
        <span>{score} to'g'ri</span>
      </div>
      <div className="rounded-2xl glass p-6">
        <h3 className="text-lg font-bold mb-4">{q.question}</h3>
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            let cls = 'glass hover:shadow-card';
            if (answered) {
              if (i === q.correctIndex) cls = 'border-primary bg-primary/10 text-primary';
              else if (i === selected) cls = 'border-destructive bg-destructive/10 text-destructive';
              else cls = 'glass opacity-50';
            }
            return (
              <button
                key={i}
                disabled={answered}
                onClick={() => {
                  setSelected(i);
                  setAnswered(true);
                  if (i === q.correctIndex) setScore(s => s + 1);
                }}
                className={`w-full text-left rounded-xl border p-3 text-sm font-medium ${cls}`}
              >
                {String.fromCharCode(65 + i)}. {opt}
              </button>
            );
          })}
        </div>
        {answered && q.explanation && (
          <div className="mt-3 rounded-xl bg-muted p-3 text-sm">{q.explanation}</div>
        )}
        {answered && (
          <div className="text-right mt-4">
            <Button onClick={() => {
              if (current < quiz.length - 1) { setCurrent(c => c + 1); setSelected(null); setAnswered(false); }
              else setDone(true);
            }} className="rounded-2xl">
              {current < quiz.length - 1 ? 'Keyingi' : 'Yakunlash'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
