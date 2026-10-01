import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, XCircle, Trophy, Timer, Zap, RotateCcw, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tenses, tensesQuestions, type TenseInfo, type TenseQuestion } from '@/data/tensesData';

type GameState = 'menu' | 'learn' | 'quiz' | 'result';

export default function TensesGame() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [selectedTense, setSelectedTense] = useState<TenseInfo | null>(null);
  const [questions, setQuestions] = useState<TenseQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timer, setTimer] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  const [answers, setAnswers] = useState<{ correct: boolean; question: TenseQuestion }[]>([]);

  // Timer
  useEffect(() => {
    if (!timerActive || timer <= 0) return;
    const t = setTimeout(() => setTimer(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, timerActive]);

  useEffect(() => {
    if (timer === 0 && timerActive) {
      handleAnswer('__timeout__');
    }
  }, [timer, timerActive]);

  const startQuiz = useCallback((tense: TenseInfo | null) => {
    let qs: TenseQuestion[];
    if (tense) {
      qs = tensesQuestions.filter(q => q.tenseId === tense.id);
    } else {
      // Mix all tenses
      qs = [...tensesQuestions].sort(() => Math.random() - 0.5).slice(0, 15);
    }
    // Shuffle
    qs = qs.sort(() => Math.random() - 0.5);
    setQuestions(qs);
    setCurrentQ(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers([]);
    setTimer(15);
    setTimerActive(true);
    setSelectedTense(tense);
    setGameState('quiz');
  }, []);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;
    setTimerActive(false);
    const q = questions[currentQ];
    const isCorrect = answer === q.correctAnswer;
    setSelectedAnswer(answer);
    setShowExplanation(true);
    if (isCorrect) setScore(prev => prev + 10);
    setAnswers(prev => [...prev, { correct: isCorrect, question: q }]);
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setGameState('result');
      return;
    }
    setCurrentQ(prev => prev + 1);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTimer(15);
    setTimerActive(true);
  };

  const percentage = questions.length > 0 ? Math.round((score / (questions.length * 10)) * 100) : 0;

  return (
    <div className="container max-w-4xl py-8">
      <AnimatePresence mode="wait">
        {gameState === 'menu' && (
          <Menu
            key="menu"
            onSelectTense={(t) => { setSelectedTense(t); setGameState('learn'); }}
            onStartMix={() => startQuiz(null)}
          />
        )}
        {gameState === 'learn' && selectedTense && (
          <LearnTense
            key="learn"
            tense={selectedTense}
            onBack={() => setGameState('menu')}
            onStartQuiz={() => startQuiz(selectedTense)}
          />
        )}
        {gameState === 'quiz' && questions.length > 0 && (
          <Quiz
            key="quiz"
            question={questions[currentQ]}
            currentQ={currentQ}
            totalQ={questions.length}
            score={score}
            timer={timer}
            selectedAnswer={selectedAnswer}
            showExplanation={showExplanation}
            onAnswer={handleAnswer}
            onNext={nextQuestion}
            onQuit={() => setGameState('menu')}
          />
        )}
        {gameState === 'result' && (
          <Result
            key="result"
            score={score}
            total={questions.length * 10}
            percentage={percentage}
            answers={answers}
            onRestart={() => startQuiz(selectedTense)}
            onMenu={() => setGameState('menu')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Menu ─── */
function Menu({ onSelectTense, onStartMix }: { onSelectTense: (t: TenseInfo) => void; onStartMix: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
          <Clock className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">⏱️ Zamonlar O'yini</h1>
          <p className="text-muted-foreground text-sm">Ingliz tili zamonlarini o'yin orqali o'rganing</p>
        </div>
      </div>

      {/* Mix Quiz Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStartMix}
        className="w-full mt-6 rounded-2xl p-5 text-left glass shadow-card hover:shadow-elevated transition-all duration-300 border border-accent/20 bg-gradient-to-r from-accent/10 to-primary/10"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-lg">🎯 Aralash Quiz</h3>
            <p className="text-sm text-muted-foreground">Barcha zamonlardan 15 ta tasodifiy savol</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto" />
        </div>
      </motion.button>

      {/* Tenses Grid */}
      <h2 className="text-lg font-bold text-foreground mt-8 mb-4">Zamonni tanlang</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {tenses.map((t, i) => (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectTense(t)}
            className="rounded-2xl glass p-5 text-left shadow-card hover:shadow-elevated transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{t.emoji}</span>
              <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${t.color}`} />
            </div>
            <h3 className="font-bold text-card-foreground">{t.name}</h3>
            <p className="text-sm text-muted-foreground">{t.nameUz}</p>
            <p className="text-xs text-muted-foreground mt-2 font-mono bg-secondary/50 rounded-lg px-2 py-1 inline-block">{t.formula}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Learn Tense ─── */
function LearnTense({ tense, onBack, onStartQuiz }: { tense: TenseInfo; onBack: () => void; onStartQuiz: () => void }) {
  const relatedQuestions = tensesQuestions.filter(q => q.tenseId === tense.id);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Orqaga
      </button>

      <div className="rounded-2xl glass p-6 md:p-8 shadow-card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{tense.emoji}</span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{tense.name}</h1>
            <p className="text-muted-foreground">{tense.nameUz}</p>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          <div className="rounded-xl bg-secondary/30 p-4">
            <p className="text-xs text-muted-foreground mb-1 font-medium">📐 Formula</p>
            <p className="font-mono text-foreground font-bold text-lg">{tense.formula}</p>
          </div>

          <div className="rounded-xl bg-secondary/30 p-4">
            <p className="text-xs text-muted-foreground mb-1 font-medium">📝 Misol</p>
            <p className="text-foreground font-medium">{tense.example}</p>
            <p className="text-sm text-muted-foreground mt-1">{tense.exampleUz}</p>
          </div>

          <div className="rounded-xl bg-secondary/30 p-4">
            <p className="text-xs text-muted-foreground mb-2 font-medium">📊 Savollar soni</p>
            <p className="text-foreground">{relatedQuestions.length} ta savol mavjud</p>
          </div>
        </div>
      </div>

      <Button
        onClick={onStartQuiz}
        disabled={relatedQuestions.length === 0}
        className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold text-base shadow-soft hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300"
      >
        <Zap className="h-5 w-5 mr-2" />
        Quizni boshlash ({relatedQuestions.length} savol)
      </Button>
    </motion.div>
  );
}

/* ─── Quiz ─── */
function Quiz({
  question, currentQ, totalQ, score, timer, selectedAnswer, showExplanation,
  onAnswer, onNext, onQuit,
}: {
  question: TenseQuestion; currentQ: number; totalQ: number; score: number; timer: number;
  selectedAnswer: string | null; showExplanation: boolean;
  onAnswer: (a: string) => void; onNext: () => void; onQuit: () => void;
}) {
  const tense = tenses.find(t => t.id === question.tenseId);
  const timerPercent = (timer / 15) * 100;

  const typeLabel = question.type === 'identify' ? '🔍 Zamonni aniqlang' : question.type === 'fill' ? '✏️ Bo\'sh joyni to\'ldiring' : '✅ To\'g\'ri gapni tanlang';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onQuit} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Chiqish
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">{currentQ + 1}/{totalQ}</span>
          <div className="flex items-center gap-1.5 rounded-full bg-secondary/50 px-3 py-1">
            <Zap className="h-3.5 w-3.5 text-accent" />
            <span className="text-sm font-bold text-foreground">{score}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="h-2 rounded-full bg-secondary/50 mb-2 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQ + 1) / totalQ) * 100}%` }}
        />
      </div>

      {/* Timer */}
      <div className="flex items-center gap-2 mb-6">
        <Timer className={`h-4 w-4 ${timer <= 5 ? 'text-destructive' : 'text-muted-foreground'}`} />
        <div className="flex-1 h-1.5 rounded-full bg-secondary/50 overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-colors ${timer <= 5 ? 'bg-destructive' : 'bg-accent'}`}
            animate={{ width: `${timerPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className={`text-sm font-bold min-w-[24px] text-right ${timer <= 5 ? 'text-destructive' : 'text-muted-foreground'}`}>{timer}</span>
      </div>

      {/* Question Card */}
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-2xl glass p-6 shadow-card mb-6"
      >
        {tense && (
          <div className="flex items-center gap-2 mb-3">
            <span>{tense.emoji}</span>
            <span className="text-xs font-medium text-muted-foreground">{tense.name}</span>
          </div>
        )}
        <p className="text-xs font-medium text-accent mb-2">{typeLabel}</p>
        <p className="text-lg font-bold text-foreground leading-relaxed">{question.sentence}</p>
      </motion.div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((opt, i) => {
          let classes = 'rounded-2xl glass p-4 text-left w-full text-sm font-medium transition-all duration-300 ';
          if (selectedAnswer) {
            if (opt === question.correctAnswer) {
              classes += 'bg-green-500/20 border-2 border-green-500/50 text-green-700 dark:text-green-300';
            } else if (opt === selectedAnswer) {
              classes += 'bg-destructive/20 border-2 border-destructive/50 text-destructive';
            } else {
              classes += 'opacity-50 text-muted-foreground';
            }
          } else {
            classes += 'hover:scale-[1.02] hover:shadow-card text-card-foreground active:scale-[0.98]';
          }

          return (
            <motion.button
              key={opt}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onAnswer(opt)}
              disabled={!!selectedAnswer}
              className={classes}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/50 text-xs font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{opt}</span>
                {selectedAnswer && opt === question.correctAnswer && <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />}
                {selectedAnswer && opt === selectedAnswer && opt !== question.correctAnswer && <XCircle className="h-5 w-5 text-destructive ml-auto" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-2xl bg-secondary/30 p-4"
          >
            <p className="text-sm font-medium text-foreground mb-1">💡 Tushuntirish:</p>
            <p className="text-sm text-muted-foreground">{question.explanation}</p>
            <Button onClick={onNext} className="mt-4 w-full rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft hover:scale-[1.02] transition-transform">
              {currentQ + 1 >= totalQ ? 'Natijani ko\'rish' : 'Keyingi savol'} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Result ─── */
function Result({
  score, total, percentage, answers, onRestart, onMenu,
}: {
  score: number; total: number; percentage: number;
  answers: { correct: boolean; question: TenseQuestion }[];
  onRestart: () => void; onMenu: () => void;
}) {
  const label = percentage >= 80 ? 'Ajoyib! 🎉' : percentage >= 50 ? 'Yaxshi! 👍' : 'Qayta urinib ko\'ring 💪';
  const correct = answers.filter(a => a.correct).length;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center">
      <div className="rounded-3xl glass p-8 shadow-card mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-primary mx-auto mb-4 shadow-elevated">
          <Trophy className="h-10 w-10 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-1">{label}</h2>
        <p className="text-muted-foreground mb-6">Siz {answers.length} ta savoldan {correct} tasiga to'g'ri javob berdingiz</p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl bg-secondary/30 p-3">
            <p className="text-2xl font-bold text-foreground">{score}</p>
            <p className="text-xs text-muted-foreground">Ball</p>
          </div>
          <div className="rounded-xl bg-secondary/30 p-3">
            <p className="text-2xl font-bold text-foreground">{percentage}%</p>
            <p className="text-xs text-muted-foreground">Aniqlik</p>
          </div>
          <div className="rounded-xl bg-secondary/30 p-3">
            <p className="text-2xl font-bold text-foreground">{correct}/{answers.length}</p>
            <p className="text-xs text-muted-foreground">To'g'ri</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={onRestart} className="flex-1 rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft hover:scale-[1.02] transition-transform">
            <RotateCcw className="h-4 w-4 mr-2" /> Qayta o'ynash
          </Button>
          <Button onClick={onMenu} variant="outline" className="flex-1 rounded-2xl glass">
            <BookOpen className="h-4 w-4 mr-2" /> Menyu
          </Button>
        </div>
      </div>

      {/* Answers Review */}
      <div className="text-left space-y-3">
        <h3 className="font-bold text-foreground">📋 Javoblar ko'rigi</h3>
        {answers.map((a, i) => (
          <div key={i} className={`rounded-xl p-4 text-sm ${a.correct ? 'bg-green-500/10 border border-green-500/20' : 'bg-destructive/10 border border-destructive/20'}`}>
            <div className="flex items-start gap-2">
              {a.correct ? <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> : <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />}
              <div>
                <p className="font-medium text-foreground">{a.question.sentence}</p>
                <p className="text-muted-foreground mt-1">✅ {a.question.correctAnswer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
