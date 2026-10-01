import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

export interface ListeningItem {
  id: string;
  audioText: string; // Text that will be spoken via SpeechSynthesis
  transcript: string; // Correct transcript for comparison
  hint?: string;
}

interface ListeningPracticeProps {
  items: ListeningItem[];
  lessonTitle: string;
}

interface WordResult {
  word: string;
  status: 'correct' | 'incorrect' | 'missing';
}

export default function ListeningPractice({ items, lessonTitle }: ListeningPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userText, setUserText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<WordResult[]>([]);
  const [accuracy, setAccuracy] = useState(0);
  const [overallScore, setOverallScore] = useState<number[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const item = items[currentIndex];

  const speak = useCallback((text: string, rate: number) => {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-US';
    utt.rate = rate;
    utt.onstart = () => setIsPlaying(true);
    utt.onend = () => setIsPlaying(false);
    utt.onerror = () => setIsPlaying(false);
    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, []);

  const handlePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      speak(item.audioText, speed);
    }
  };

  const handleRewind = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setTimeout(() => speak(item.audioText, speed), 200);
  };

  const normalize = (text: string) =>
    text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

  const checkAnswer = () => {
    const correctWords = normalize(item.transcript).split(' ');
    const userWords = normalize(userText).split(' ');

    const wordResults: WordResult[] = [];
    let correct = 0;

    correctWords.forEach((word, i) => {
      if (i < userWords.length && userWords[i] === word) {
        wordResults.push({ word, status: 'correct' });
        correct++;
      } else if (i < userWords.length) {
        wordResults.push({ word: userWords[i], status: 'incorrect' });
      } else {
        wordResults.push({ word, status: 'missing' });
      }
    });

    // Extra words typed by user
    if (userWords.length > correctWords.length) {
      for (let i = correctWords.length; i < userWords.length; i++) {
        wordResults.push({ word: userWords[i], status: 'incorrect' });
      }
    }

    const acc = Math.round((correct / correctWords.length) * 100);
    setResults(wordResults);
    setAccuracy(acc);
    setChecked(true);
  };

  const handleNext = () => {
    setOverallScore(prev => [...prev, accuracy]);
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetState();
    } else {
      setShowSummary(true);
    }
  };

  const handleRetry = () => {
    resetState();
  };

  const resetState = () => {
    setUserText('');
    setChecked(false);
    setResults([]);
    setAccuracy(0);
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setOverallScore([]);
    setShowSummary(false);
    resetState();
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const getFeedback = (acc: number) => {
    if (acc >= 95) return { emoji: '🌟', text: 'Ajoyib!', color: 'text-primary' };
    if (acc >= 80) return { emoji: '👏', text: 'Yaxshi!', color: 'text-primary' };
    if (acc >= 60) return { emoji: '💪', text: "Yomon emas!", color: 'hsl(var(--warning))' };
    return { emoji: '🔄', text: "Qayta urinib ko'ring", color: 'text-destructive' };
  };

  if (showSummary) {
    const allScores = [...overallScore, accuracy];
    const avg = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
    const feedback = getFeedback(avg);

    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl glass p-8 shadow-card text-center">
        <div className="text-5xl mb-4">{feedback.emoji}</div>
        <h2 className="text-2xl font-bold text-card-foreground">{feedback.text}</h2>
        <p className="text-muted-foreground mt-2">O'rtacha aniqlik: {avg}%</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {allScores.map((s, i) => (
            <div key={i} className={`rounded-xl p-3 border ${s >= 80 ? 'bg-primary/10 border-primary/20' : s >= 60 ? 'bg-accent/10 border-accent/20' : 'bg-destructive/10 border-destructive/20'}`}>
              <p className="text-xs text-muted-foreground">#{i + 1}</p>
              <p className="text-lg font-bold text-card-foreground">{s}%</p>
            </div>
          ))}
        </div>
        <Button onClick={handleRestart} className="mt-6 rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
          <RefreshCw className="mr-2 h-4 w-4" /> Qayta boshlash
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Mashq {currentIndex + 1}/{items.length}</span>
        {item.hint && <span className="text-xs italic">💡 {item.hint}</span>}
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div className="h-full rounded-full bg-gradient-primary" animate={{ width: `${((currentIndex + 1) / items.length) * 100}%` }} transition={{ duration: 0.3 }} />
      </div>

      {/* Audio Player */}
      <div className="rounded-2xl glass p-6 shadow-card space-y-5">
        <div className="flex items-center gap-3">
          <Volume2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-card-foreground">🎧 Tinglang va yozing</h3>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handlePlay}
            size="icon"
            className="h-14 w-14 rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>

          <Button
            onClick={handleRewind}
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-2xl"
            title="Qayta eshitish"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>

          <div className="flex-1 flex items-center gap-3 ml-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Tezlik:</span>
            <div className="flex gap-1.5">
              {[0.75, 1, 1.25].map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
                    speed === s
                      ? 'bg-gradient-primary text-primary-foreground shadow-soft'
                      : 'glass text-card-foreground hover:shadow-card'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Waveform animation */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-end justify-center gap-1 h-10"
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 rounded-full bg-primary/60"
                  animate={{
                    height: [8, 20 + Math.random() * 20, 8],
                  }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.3,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Text Input */}
      <div className="rounded-2xl glass p-6 shadow-card space-y-4">
        <h3 className="font-semibold text-card-foreground">✍️ Eshitganingizni yozing:</h3>
        <Textarea
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          placeholder="Eshitgan gapingizni bu yerga yozing..."
          className="min-h-[100px] rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground resize-none"
          disabled={checked}
        />
        {!checked ? (
          <Button
            onClick={checkAnswer}
            disabled={!userText.trim()}
            className="w-full rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft hover:scale-[1.02] active:scale-[0.98] transition-transform h-12"
          >
            <Check className="mr-2 h-4 w-4" /> Tekshirish
          </Button>
        ) : null}
      </div>

      {/* Results */}
      <AnimatePresence>
        {checked && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Accuracy score */}
            <div className="rounded-2xl glass p-6 shadow-card text-center">
              <p className="text-sm text-muted-foreground mb-2">Aniqlik</p>
              <p className="text-4xl font-bold text-card-foreground">{accuracy}%</p>
              <p className={`text-sm font-medium mt-1 ${getFeedback(accuracy).color}`}>
                {getFeedback(accuracy).emoji} {getFeedback(accuracy).text}
              </p>
            </div>

            {/* Word-by-word results */}
            <div className="rounded-2xl glass p-6 shadow-card">
              <h3 className="font-semibold text-card-foreground mb-3">Natija:</h3>
              <div className="flex flex-wrap gap-1.5">
                {results.map((r, i) => (
                  <span
                    key={i}
                    className={`inline-block px-2 py-1 rounded-lg text-sm font-medium ${
                      r.status === 'correct'
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : r.status === 'incorrect'
                        ? 'bg-destructive/10 text-destructive border border-destructive/20 line-through'
                        : 'bg-accent/10 text-accent border border-accent/20 italic'
                    }`}
                  >
                    {r.word}
                    {r.status === 'missing' && ' ⟵'}
                  </span>
                ))}
              </div>
              <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> To'g'ri</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Noto'g'ri</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" /> Tushirilgan</span>
              </div>
            </div>

            {/* Correct transcript */}
            <div className="rounded-2xl glass p-6 shadow-card">
              <h3 className="font-semibold text-card-foreground mb-2">✅ To'g'ri matn:</h3>
              <p className="text-card-foreground/80 leading-relaxed">{item.transcript}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <Button onClick={handleRetry} variant="outline" className="rounded-2xl">
                <RefreshCw className="mr-2 h-4 w-4" /> Qayta urinish
              </Button>
              <Button onClick={handleNext} className="rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft hover:scale-105 transition-transform">
                {currentIndex < items.length - 1 ? 'Keyingi' : 'Yakunlash'} →
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
