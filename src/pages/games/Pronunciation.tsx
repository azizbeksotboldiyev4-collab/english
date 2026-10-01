import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Mic, MicOff, Volume2, RotateCcw, ChevronRight, BarChart3,
  Circle, Square, Play, Trash2, Trophy, Flame, Zap, AlertTriangle,
} from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { PRONUNCIATION_PHRASES } from '@/data/adventureData';
import {
  loadStore, updateStore, scorePronunciation, scoreLabel, today,
  grantAchievement, logGame,
} from '@/lib/gameStore';
import { toast } from 'sonner';

type Tab = 'nutq' | 'baho' | 'yozib';

function getSR(): any {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export default function Pronunciation() {
  const { progress, addXp } = useProgress();
  const [tab, setTab] = useState<Tab>('nutq');
  const [index, setIndex] = useState(() => Math.floor(Math.random() * PRONUNCIATION_PHRASES.length));
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState('');
  const [result, setResult] = useState<{ score: number; wrongWords: string[]; said: string } | null>(null);
  const [srError, setSrError] = useState<string | null>(null);
  const [manual, setManual] = useState('');
  const recRef = useRef<any>(null);
  const [storeTick, setStoreTick] = useState(0);
  const store = useMemo(() => loadStore(), [storeTick, tab, result]);

  const target = PRONUNCIATION_PHRASES[index];
  const supported = !!getSR();

  useEffect(() => () => { try { recRef.current?.stop(); } catch {} }, []);

  function speak(text: string) {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    } catch {
      toast.error('Brauzeringiz ovoz chiqarishni qo\u2018llamaydi');
    }
  }

  function submit(said: string) {
    const { score, wrongWords } = scorePronunciation(target, said);
    setResult({ score, wrongWords, said });
    const xp = score >= 90 ? 20 : score >= 75 ? 15 : score >= 50 ? 10 : 5;
    addXp(xp);
    logGame('Pronunciation', xp, Math.round(score / 10));
    updateStore((d) => ({
      ...d,
      pronAttempts: [{ date: today(), score, target, said }, ...d.pronAttempts].slice(0, 300),
    }));
    if (score >= 90 && grantAchievement('pron-master')) toast.success('🎤 Yangi yutuq: Pronunciation Master!');
    setStoreTick((t) => t + 1);
  }

  function startListening() {
    const SR = getSR();
    if (!SR) {
      setSrError('Brauzeringiz nutqni tanishni qo\u2018llamaydi. Chrome yoki Android Chrome\u2019dan foydalaning yoki matnni qo\u2018lda kiriting.');
      return;
    }
    setSrError(null);
    setHeard('');
    setResult(null);
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript + ' ';
      setHeard(text.trim());
      if (e.results[e.results.length - 1].isFinal) submit(text.trim());
    };
    rec.onerror = (e: any) => {
      setListening(false);
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setSrError('Mikrofonga ruxsat berilmadi. Brauzer sozlamalaridan mikrofonni yoqing.');
      } else if (e.error === 'no-speech') {
        setSrError('Ovoz eshitilmadi. Yana urinib ko\u2018ring.');
      } else {
        setSrError('Xatolik: ' + e.error);
      }
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  function stopListening() {
    try { recRef.current?.stop(); } catch {}
    setListening(false);
  }

  function next() {
    setResult(null);
    setHeard('');
    setManual('');
    setSrError(null);
    setIndex((i) => (i + 1) % PRONUNCIATION_PHRASES.length);
  }

  const attempts = store.pronAttempts;
  const todayScores = attempts.filter((a) => a.date === today());
  const avg = attempts.length ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length) : 0;
  const best = attempts.reduce((m, a) => Math.max(m, a.score), 0);

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-pink-500/20 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-6 md:py-10">
        <Link to="/games" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> O'yinlar
        </Link>

        <div className="mt-4 rounded-3xl border border-border/60 bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 p-5 md:p-6 text-white shadow-elevated">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/25 backdrop-blur-md border border-white/30">
              <Mic className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Pronunciation</h1>
              <p className="text-sm text-white/85">AI baho beruvchi talaffuz o'yini</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {([['nutq', 'NUTQ', Mic], ['baho', 'BAHO', BarChart3], ['yozib', 'YOZIB OLISH', Circle]] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id as Tab)}
              className={`min-h-[52px] rounded-2xl border px-2 py-3 text-[11px] md:text-xs font-extrabold uppercase tracking-wider transition-all ${
                tab === id
                  ? 'border-transparent bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                  : 'border-border/60 bg-card/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="mx-auto mb-1 h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'nutq' && (
            <motion.div key="nutq" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 space-y-4">
              <div className="rounded-3xl border border-border/60 bg-card/70 p-5 backdrop-blur-xl shadow-card">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ushbu matnni talaffuz qiling</div>
                <div className="mt-2 text-2xl md:text-3xl font-extrabold leading-snug">{target}</div>
                <button onClick={() => speak(target)} className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border/60 bg-muted/60 px-4 text-sm font-bold hover:bg-muted">
                  <Volume2 className="h-4 w-4" /> Ovozli namunani eshitish
                </button>
              </div>

              <div className="rounded-3xl border border-border/60 bg-card/70 p-6 text-center backdrop-blur-xl shadow-card">
                <motion.button
                  onClick={listening ? stopListening : startListening}
                  whileTap={{ scale: 0.94 }}
                  className={`relative mx-auto grid h-28 w-28 place-items-center rounded-full text-white shadow-2xl ${
                    listening ? 'bg-gradient-to-br from-red-500 to-rose-600' : 'bg-gradient-to-br from-pink-500 to-rose-500'
                  }`}
                >
                  {listening && (
                    <>
                      <motion.span animate={{ scale: [1, 1.5], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 1.4 }} className="absolute inset-0 rounded-full bg-rose-500/40" />
                      <motion.span animate={{ scale: [1, 1.8], opacity: [0.35, 0] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} className="absolute inset-0 rounded-full bg-rose-500/30" />
                    </>
                  )}
                  {listening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
                </motion.button>
                <div className="mt-3 text-sm font-bold">
                  {listening ? 'Tinglanmoqda... gapiring' : 'Mikrofonni bosing va gapiring'}
                </div>
                {heard && <div className="mt-2 text-sm text-muted-foreground italic">"{heard}"</div>}

                {!supported && (
                  <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-left text-xs">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <span>Brauzeringiz nutqni tanishni qo'llamaydi. Quyida matnni qo'lda yozib ham tekshirishingiz mumkin.</span>
                  </div>
                )}
                {srError && (
                  <div className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3 text-left text-xs">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                    <span>{srError}</span>
                  </div>
                )}

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={manual}
                    onChange={(e) => setManual(e.target.value)}
                    placeholder="Yoki matnni shu yerga yozing..."
                    className="min-h-[44px] flex-1 rounded-2xl border border-border/60 bg-background px-4 text-sm outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={() => manual.trim() && submit(manual.trim())}
                    className="min-h-[44px] rounded-2xl bg-foreground px-4 text-sm font-extrabold text-background"
                  >
                    Tekshirish
                  </button>
                </div>
              </div>

              {result && <ResultCard result={result} target={target} onRetry={() => { setResult(null); setHeard(''); }} onNext={next} onListen={() => speak(target)} />}
            </motion.div>
          )}

          {tab === 'baho' && (
            <motion.div key="baho" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 grid grid-cols-2 gap-3">
              <Stat label="Bugungi mashqlar" value={todayScores.length} icon={Zap} tint="from-pink-500 to-rose-500" />
              <Stat label="Bugungi o'rtacha" value={todayScores.length ? Math.round(todayScores.reduce((s, a) => s + a.score, 0) / todayScores.length) : 0} icon={BarChart3} tint="from-sky-500 to-blue-500" />
              <Stat label="Umumiy o'rtacha" value={avg} icon={BarChart3} tint="from-violet-500 to-fuchsia-500" />
              <Stat label="Jami mashqlar" value={attempts.length} icon={Mic} tint="from-emerald-500 to-teal-500" />
              <Stat label="Eng yuqori ball" value={best} icon={Trophy} tint="from-amber-400 to-orange-500" />
              <Stat label="Ketma-ket kunlar" value={progress.streak} icon={Flame} tint="from-rose-500 to-red-500" />
              <div className="col-span-2 rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">XP</div>
                <div className="text-2xl font-extrabold">{progress.xp.toLocaleString()}</div>
              </div>
              <div className="col-span-2 rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Oxirgi urinishlar</div>
                {attempts.length === 0 && <div className="text-sm text-muted-foreground">Hali mashq qilmadingiz.</div>}
                <div className="space-y-2">
                  {attempts.slice(0, 8).map((a, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-muted-foreground">{a.target}</span>
                      <span className="shrink-0 font-extrabold">{a.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'yozib' && <Recorder key="yozib" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ResultCard({ result, target, onRetry, onNext, onListen }: {
  result: { score: number; wrongWords: string[]; said: string };
  target: string; onRetry: () => void; onNext: () => void; onListen: () => void;
}) {
  const { label, tone } = scoreLabel(result.score);
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-border/60 bg-card/70 p-5 backdrop-blur-xl shadow-card">
      <div className={`mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br ${tone} text-white shadow-xl`}>
        <span className="text-3xl font-extrabold">{result.score}</span>
      </div>
      <div className="mt-3 text-center text-xl font-extrabold">{label}</div>

      <div className="mt-4 space-y-2 text-sm">
        <div><span className="font-bold text-muted-foreground">To'g'ri matn: </span>{target}</div>
        <div><span className="font-bold text-muted-foreground">Aniqlangan: </span>{result.said || '—'}</div>
        {result.wrongWords.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-muted-foreground">Noto'g'ri:</span>
            {result.wrongWords.map((w, i) => (
              <span key={i} className="rounded-full bg-rose-500/15 px-2 py-1 text-xs font-bold text-rose-500">{w}</span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <button onClick={onRetry} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-border/60 bg-muted/60 text-sm font-extrabold">
          <RotateCcw className="h-4 w-4" /> Qayta urinish
        </button>
        <button onClick={onListen} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-border/60 bg-muted/60 text-sm font-extrabold">
          <Volume2 className="h-4 w-4" /> Namuna
        </button>
        <button onClick={onNext} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-sm font-extrabold text-white">
          Keyingi so'z <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, icon: Icon, tint }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; tint: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl">
      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${tint} opacity-10`} />
      <div className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${tint} text-white`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xl font-extrabold">{value}</div>
    </div>
  );
}

function Recorder() {
  const [recording, setRecording] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        setUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mrRef.current = mr;
      setSeconds(0);
      setUrl(null);
      setRecording(true);
    } catch {
      setError("Mikrofonga ruxsat berilmadi yoki qurilma topilmadi.");
    }
  }

  function stop() {
    try { mrRef.current?.stop(); } catch {}
    setRecording(false);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 rounded-3xl border border-border/60 bg-card/70 p-6 text-center backdrop-blur-xl shadow-card">
      <div className="relative mx-auto grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-2xl">
        {recording && (
          <motion.span animate={{ scale: [1, 1.6], opacity: [0.45, 0] }} transition={{ repeat: Infinity, duration: 1.3 }} className="absolute inset-0 rounded-full bg-rose-500/40" />
        )}
        <span className="text-lg font-extrabold">
          {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
        </span>
      </div>

      {recording && (
        <div className="mt-4 flex h-10 items-end justify-center gap-1">
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.span
              key={i}
              animate={{ height: [6, 10 + ((i * 7) % 28), 6] }}
              transition={{ repeat: Infinity, duration: 0.7 + (i % 5) * 0.1 }}
              className="w-1.5 rounded-full bg-rose-500"
            />
          ))}
        </div>
      )}

      {error && <div className="mt-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs">{error}</div>}

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {!recording ? (
          <button onClick={start} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-sm font-extrabold text-white">
            <Circle className="h-4 w-4 fill-current" /> {url ? 'Qayta yozish' : 'Yozishni boshlash'}
          </button>
        ) : (
          <button onClick={stop} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-foreground text-sm font-extrabold text-background">
            <Square className="h-4 w-4 fill-current" /> To'xtatish
          </button>
        )}
        <button
          onClick={() => url && new Audio(url).play()}
          disabled={!url}
          className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-border/60 bg-muted/60 text-sm font-extrabold disabled:opacity-40"
        >
          <Play className="h-4 w-4" /> Tinglash
        </button>
        {url && (
          <>
            <audio controls src={url} className="col-span-full w-full" />
            <button
              onClick={() => { URL.revokeObjectURL(url); setUrl(null); setSeconds(0); }}
              className="col-span-full inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/10 text-sm font-extrabold text-rose-500"
            >
              <Trash2 className="h-4 w-4" /> O'chirish
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
