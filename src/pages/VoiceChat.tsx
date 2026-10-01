import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Volume2, VolumeX, Sparkles, Bot, User, AlertCircle, Send,
  ChevronLeft, ChevronRight, Settings, BarChart3, MessageSquare, GraduationCap,
  Briefcase, Plane, BookOpen, Users, Turtle, Play, Zap, Lightbulb, Keyboard,
  XCircle, CheckCircle2, Star, Target, TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

type Msg = { role: 'user' | 'assistant'; content: string; at?: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`;

const MODES = [
  { id: 'free', icon: MessageSquare, title: 'Free Talk', desc: 'Erkin suhbat, kundalik mavzular', ctx: 'Mavzu: erkin kundalik suhbat.' },
  { id: 'ielts', icon: GraduationCap, title: 'IELTS Practice', desc: 'Imtihon uchun mashq', ctx: 'Mavzu: IELTS Speaking Part 1-3 mashqi. Imtihon uslubida savol ber.' },
  { id: 'job', icon: Briefcase, title: 'Job Interview', desc: 'Ish suhbatiga tayyorgarlik', ctx: 'Mavzu: ish suhbati (job interview). Sen HR menejersan.' },
  { id: 'travel', icon: Plane, title: 'Travel English', desc: 'Sayohat uchun kerakli iboralar', ctx: 'Mavzu: sayohat (aeroport, mehmonxona, yo\'l so\'rash).' },
  { id: 'student', icon: BookOpen, title: 'Student Life', desc: "O'quv hayoti va universitet", ctx: "Mavzu: talabalik hayoti, universitet, darslar." },
  { id: 'daily', icon: Users, title: 'Daily Conversation', desc: 'Har kuni ishlatiladigan iboralar', ctx: 'Mavzu: kundalik iboralar (do\'kon, kafe, do\'stlar).' },
];

const SPEEDS = [
  { id: 'slow', icon: Turtle, label: 'Slow', sub: '(A1)', rate: 0.75 },
  { id: 'normal', icon: Play, label: 'Normal', sub: '(A2-B1)', rate: 0.95 },
  { id: 'fast', icon: Zap, label: 'Fast', sub: '(B2-C1)', rate: 1.15 },
];

const VOICE_SYSTEM_CONTEXT = `Bu VOICE CHAT MODE. Foydalanuvchi mikrofon orqali ingliz tilida gapiradi va sen javob berasan.

MAJBURIY JAVOB FORMATI (aynan shu markerlar bilan, boshqa hech narsa qo'shma):
[CORRECTION]
<Agar foydalanuvchi jumlasida grammatika, so'z tanlash yoki talaffuz xatosi bo'lsa — o'zbek tilida QISQA (1-3 qator) tushuntir. Format:
• Xato: "..." → To'g'ri: "..."
• Sabab: ...
Agar xato bo'lmasa, faqat: "✅ Xato yo'q, ajoyib!" deb yoz.>
[REPLY]
<Ingliz tilida QISQA va TABIIY javob (1-3 jumla, max 40 so'z). Beginner darajada oddiy so'zlar. Suhbatni davom ettirish uchun oxirida QISQA savol ber. Markdown, emoji, qavs ishlatma — sof matn, chunki TTS o'qib beradi.>

Har doim ikkala markerni ham qaytar. Boshqa hech narsa yozma.`;

function getSpeechRecognition() {
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
}

function parseAiOutput(raw: string): { correction: string; reply: string } {
  const cIdx = raw.indexOf('[CORRECTION]');
  const rIdx = raw.indexOf('[REPLY]');
  if (cIdx === -1 && rIdx === -1) return { correction: '', reply: raw.trim() };
  const correction = cIdx !== -1 ? raw.slice(cIdx + 12, rIdx === -1 ? undefined : rIdx).trim() : '';
  const reply = rIdx !== -1 ? raw.slice(rIdx + 7).trim() : '';
  return { correction, reply };
}

function isSpeechSupported() {
  return typeof window !== 'undefined' && !!getSpeechRecognition();
}

function isIosDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function stamp(startedAt: number) {
  const s = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function VoiceChat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [typedMessage, setTypedMessage] = useState('');
  const [showTyping, setShowTyping] = useState(false);
  const [mode, setMode] = useState(MODES[0]);
  const [speed, setSpeed] = useState(SPEEDS[1]);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const messagesRef = useRef<Msg[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const latestTranscriptRef = useRef('');
  const startedAtRef = useRef(Date.now());
  const speedRef = useRef(speed);

  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    messagesRef.current = messages;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  useEffect(() => {
    return () => {
      stopMicAnimation();
      if (recognitionRef.current) recognitionRef.current.stop();
      window.speechSynthesis.cancel();
      mediaStreamRef.current?.getTracks().forEach(t => t.stop());
      audioContextRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startMicAnimation = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAudioLevel(Math.min(100, (avg / 128) * 100));
        animationFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      console.warn('Mic animation unavailable', e);
    }
  };

  const stopMicAnimation = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    mediaStreamRef.current = null;
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    setAudioLevel(0);
  };

  const askAI = useCallback(async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || isThinking) return;
    setIsThinking(true);
    setError(null);

    const userMsg: Msg = { role: 'user', content: trimmed, at: stamp(startedAtRef.current) };
    const newMessages = [...messagesRef.current, userMsg];
    setMessages(newMessages);

    let assistantSoFar = '';

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Voice Chat uchun tizimga kirishingiz kerak.');
        setIsThinking(false);
        return;
      }

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: newMessages.map(({ role, content }) => ({ role, content })),
          lessonContext: `${VOICE_SYSTEM_CONTEXT}\n\nSUHBAT REJIMI: ${mode.title}. ${mode.ctx}`,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Xatolik' }));
        if (resp.status === 429) setError('Juda ko\'p so\'rov. Biroz kuting.');
        else if (resp.status === 402) setError('AI limiti tugadi. Workspace\'ga kredit qo\'shing.');
        else setError(err.error || 'AI javob bera olmadi.');
        setIsThinking(false);
        return;
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, nl);
          textBuffer = textBuffer.slice(nl + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistantSoFar += delta;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: 'assistant', content: assistantSoFar, at: stamp(startedAtRef.current) }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      setIsThinking(false);
      if (assistantSoFar && !muted) {
        const { reply } = parseAiOutput(assistantSoFar);
        if (reply) speak(reply);
      }
    } catch (e) {
      console.error(e);
      setError('Tarmoq xatosi.');
      setIsThinking(false);
    }
  }, [muted, isThinking, mode]);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const clean = text.replace(/\[(CORRECTION|REPLY)\]/g, '').replace(/[*_`#~]/g, '').trim();
    if (!clean) return;
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = 'en-US';
    utt.rate = speedRef.current.rate;
    utt.pitch = 1;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utt);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const startListening = () => {
    setError(null);
    stopSpeaking();

    const SR = getSpeechRecognition();
    if (!SR) {
      setShowTyping(true);
      setError(isIosDevice()
        ? "iPhone/iPad brauzerida real-time ovoz tanish cheklangan. Matn orqali yozib yuboring."
        : "Brauzeringiz ovoz tanishni qo'llab-quvvatlamaydi. Chrome yoki Edge ishlating.");
      return;
    }

    try { recognitionRef.current?.stop(); } catch { /* ignore */ }

    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    let finalText = '';
    latestTranscriptRef.current = '';

    recognition.onresult = (e: any) => {
      let interimText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
        else interimText += e.results[i][0].transcript;
      }
      const transcript = `${finalText} ${interimText}`.trim();
      latestTranscriptRef.current = transcript;
      setInterim(transcript);
    };

    recognition.onerror = (e: any) => {
      if (e.error === 'no-speech') setError("Ovoz eshitilmadi. Yana urinib ko'ring.");
      else if (e.error === 'not-allowed') setError("Mikrofonga ruxsat berilmagan. Brauzer sozlamalaridan ruxsat bering.");
      else if (e.error === 'network') setError("Internet aloqasi kerak.");
      else if (e.error === 'aborted') { /* user stopped */ }
      else if (e.error === 'audio-capture') setError("Mikrofon topilmadi.");
      else setError(`Mikrofon xatosi: ${e.error}`);
      setIsListening(false);
      stopMicAnimation();
    };

    recognition.onend = () => {
      setIsListening(false);
      stopMicAnimation();
      const spoken = (finalText.trim() || latestTranscriptRef.current.trim());
      setInterim('');
      latestTranscriptRef.current = '';
      if (spoken) askAI(spoken);
    };

    recognitionRef.current = recognition;
    setInterim('');
    try {
      recognition.start();
      setIsListening(true);
      startMicAnimation();
    } catch (err: any) {
      console.error('Recognition start failed:', err);
      setError("Mikrofonni ishga tushirib bo'lmadi. Sahifani yangilab qayta urinib ko'ring.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    stopMicAnimation();
  };

  const sendTypedMessage = () => {
    const text = typedMessage.trim();
    if (!text) return;
    setTypedMessage('');
    askAI(text);
  };

  const pickMode = (m: typeof MODES[number]) => {
    setMode(m);
    setMessages([]);
    stopSpeaking();
    setError(null);
    startedAtRef.current = Date.now();
  };

  // ---- derived score panel ----
  const userTurns = messages.filter(m => m.role === 'user');
  const corrections = messages
    .filter(m => m.role === 'assistant')
    .map(m => parseAiOutput(m.content).correction)
    .filter(c => c && !c.includes('Xato yo'));
  const cleanTurns = Math.max(0, userTurns.length - corrections.length);
  const accuracy = userTurns.length ? Math.round((cleanTurns / userTurns.length) * 100) : 0;
  const base = userTurns.length ? Math.max(45, Math.min(98, accuracy)) : 0;
  const metrics = [
    { label: 'Fluency', value: userTurns.length ? Math.min(99, base + 4) : 0, color: 'bg-emerald-400' },
    { label: 'Grammar', value: base, color: 'bg-sky-400' },
    { label: 'Vocabulary', value: userTurns.length ? Math.max(40, base - 6) : 0, color: 'bg-violet-400' },
    { label: 'Pronunciation', value: userTurns.length ? Math.min(99, base + 2) : 0, color: 'bg-amber-400' },
  ];
  const overall = userTurns.length ? Math.round(metrics.reduce((a, m) => a + m.value, 0) / metrics.length) : 0;
  const newWords = new Set(
    messages.filter(m => m.role === 'assistant')
      .flatMap(m => parseAiOutput(m.content).reply.toLowerCase().match(/[a-z']{5,}/g) || [])
  ).size;

  if (!user) {
    return (
      <div className="container max-w-2xl py-12 text-center">
        <div className="rounded-3xl border border-border bg-card p-10">
          <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
          <h2 className="text-2xl font-bold mb-2">AI Speaking Coach</h2>
          <p className="text-muted-foreground mb-6">Real-time ingliz tili suhbati uchun tizimga kiring.</p>
          <Link to="/login"><Button className="bg-gradient-primary">Tizimga kirish</Button></Link>
        </div>
      </div>
    );
  }

  const statusLabel = isListening ? "I'm listening..." : isSpeaking ? 'AI is speaking...' : isThinking ? 'Thinking...' : 'Ready when you are';
  const statusSub = isListening ? 'Gapiring, men sizni tinglayapman.' : isSpeaking ? 'AI javob berayapti.' : isThinking ? "AI o'ylayapti..." : "Mikrofonni bosib gapiring.";
  const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
  const lastReply = lastAssistant ? parseAiOutput(lastAssistant.content).reply : '';
  const lastCorrection = corrections[corrections.length - 1] || '';

  return (
    <div className="min-h-screen p-3 md:p-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 rounded-3xl border border-border bg-card/70 backdrop-blur px-3 py-3 md:px-5">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-secondary text-foreground hover:bg-secondary/70 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary shadow-elevated">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-extrabold text-foreground truncate">AI Speaking Coach</h1>
            <p className="text-xs text-muted-foreground truncate">Tillarni gapirish orqali o'rganing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMuted(m => !m)} title={muted ? 'Ovozni yoqish' : "Ovozni o'chirish"}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button onClick={() => setShowTyping(s => !s)} title="Matn rejimi"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="h-4 w-4" />
          </button>
          <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-border bg-secondary px-3 py-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <div className="leading-tight">
              <p className="text-sm font-bold text-foreground">A2</p>
              <p className="text-[10px] text-muted-foreground">Current level</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_300px] gap-4">
        {/* LEFT COLUMN */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-card p-4">
            <h2 className="font-bold text-foreground">Suhbat rejimini tanlang</h2>
            <p className="text-[11px] text-muted-foreground mb-3">O'zingizga mos mavzuni tanlang va boshlang</p>
            <div className="space-y-2">
              {MODES.map(m => {
                const active = m.id === mode.id;
                return (
                  <button key={m.id} onClick={() => pickMode(m)}
                    className={`w-full flex items-center gap-3 rounded-2xl border p-2.5 text-left transition-all ${
                      active
                        ? 'border-primary/60 bg-primary/15 shadow-soft'
                        : 'border-border bg-secondary/50 hover:border-primary/40 hover:bg-secondary'
                    }`}>
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-gradient-primary text-primary-foreground' : 'bg-background text-primary'}`}>
                      <m.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground truncate">{m.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{m.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Volume2 className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-foreground text-sm">Ovoz tezligini tanlang</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SPEEDS.map(s => {
                const active = s.id === speed.id;
                return (
                  <button key={s.id} onClick={() => setSpeed(s)}
                    className={`rounded-2xl border p-2.5 text-center transition-all ${
                      active ? 'border-primary bg-gradient-primary text-primary-foreground shadow-soft' : 'border-border bg-secondary/50 text-foreground hover:border-primary/40'
                    }`}>
                    <s.icon className="mx-auto h-4 w-4" />
                    <p className="mt-1 text-xs font-bold">{s.label}</p>
                    <p className="text-[10px] opacity-70">{s.sub}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground font-extrabold">A2</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>O'rganish darajangiz</span>
                  <span className="font-semibold text-foreground">A2 → B1</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-primary transition-all" style={{ width: `${Math.max(8, overall)}%` }} />
                </div>
              </div>
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
          </div>
        </div>

        {/* CENTER STAGE */}
        <div className="rounded-3xl border border-border bg-card p-4 md:p-6 flex flex-col">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5">
              <span className={`h-2 w-2 rounded-full ${isListening ? 'bg-emerald-400 animate-pulse' : 'bg-muted-foreground'}`} />
              <span className="text-xs font-semibold text-foreground">{isListening ? 'AI tinglamoqda...' : 'AI tayyor'}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5">
              <mode.icon className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">{mode.title}</span>
            </div>
          </div>

          {/* Orb + waveform */}
          <div className="relative mt-6 flex items-center justify-center gap-2">
            <div className="hidden sm:flex flex-1 items-center justify-end gap-1 h-24 overflow-hidden">
              {Array.from({ length: 22 }).map((_, i) => (
                <span key={i} className="w-1 rounded-full bg-gradient-to-t from-primary/30 to-primary"
                  style={{
                    height: `${8 + Math.abs(Math.sin((i + 1) * 0.9)) * (isListening ? 20 + audioLevel : 40)}%`,
                    opacity: 0.35 + (i / 30),
                    transition: 'height 120ms linear',
                  }} />
              ))}
            </div>
            <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
              <span className={`absolute inset-0 rounded-full border-2 border-primary/50 ${isListening || isSpeaking ? 'animate-ping' : ''}`} style={{ animationDuration: '2s' }} />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-primary shadow-elevated">
                <Bot className="h-11 w-11 text-primary-foreground" />
              </div>
            </div>
            <div className="hidden sm:flex flex-1 items-center gap-1 h-24 overflow-hidden">
              {Array.from({ length: 22 }).map((_, i) => (
                <span key={i} className="w-1 rounded-full bg-gradient-to-t from-primary/30 to-primary"
                  style={{
                    height: `${8 + Math.abs(Math.cos((i + 1) * 0.9)) * (isListening ? 20 + audioLevel : 40)}%`,
                    opacity: 0.9 - (i / 30),
                    transition: 'height 120ms linear',
                  }} />
              ))}
            </div>
          </div>

          <div className="mt-4 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">{statusLabel}</h2>
            <p className="text-sm text-muted-foreground mt-1">{statusSub}</p>
          </div>

          {/* AI bubble */}
          <div className="mt-5 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-primary">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="rounded-2xl rounded-tl-md border border-border bg-secondary/60 px-4 py-3 text-sm text-foreground leading-relaxed">
              {lastReply || (interim ? <span className="italic text-muted-foreground">{interim}</span> : 'Nice to meet you! 👋 How was your day today? What did you do?')}
            </div>
          </div>

          {/* Mic + actions */}
          <div className="mt-auto pt-6 flex flex-col items-center gap-3">
            <div className="flex w-full items-center justify-center gap-3 md:gap-6">
              <button onClick={() => askAI('Can you give me a small hint to continue?')} disabled={isThinking}
                className="hidden sm:flex items-center gap-2 rounded-2xl border border-border bg-secondary/60 px-3 py-2.5 text-left hover:border-primary/40 transition-colors disabled:opacity-50">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400"><Lightbulb className="h-4 w-4" /></span>
                <span>
                  <span className="block text-xs font-bold text-foreground">Help me</span>
                  <span className="block text-[10px] text-muted-foreground">Kichik hint oling</span>
                </span>
              </button>

              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isThinking}
                className={`relative inline-flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 disabled:opacity-50 ${
                  isListening ? 'bg-destructive text-destructive-foreground' : 'bg-gradient-primary text-primary-foreground hover:scale-105'
                } shadow-elevated`}
              >
                {(isListening || isSpeaking) && (
                  <>
                    <span className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping" style={{ animationDuration: '1.5s' }} />
                    <span className="absolute inset-0 rounded-full bg-primary/25"
                      style={{ transform: `scale(${1 + audioLevel / 200})`, transition: 'transform 80ms linear' }} />
                  </>
                )}
                {isListening ? <MicOff className="relative z-10 h-8 w-8" /> : <Mic className="relative z-10 h-8 w-8" />}
              </button>

              <button onClick={() => setShowTyping(s => !s)}
                className="hidden sm:flex items-center gap-2 rounded-2xl border border-border bg-secondary/60 px-3 py-2.5 text-left hover:border-primary/40 transition-colors">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary"><Keyboard className="h-4 w-4" /></span>
                <span>
                  <span className="block text-xs font-bold text-foreground">Matn orqali</span>
                  <span className="block text-[10px] text-muted-foreground">Yozib yuboring</span>
                </span>
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Mikrofonni bosib, gapiring</p>
              <p className="text-[11px] text-muted-foreground">(yoki to'g'ridan-to'g'ri ovozli suhbatni boshlang)</p>
            </div>

            <AnimatePresence>
              {(showTyping || !isSpeechSupported()) && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="w-full overflow-hidden">
                  <div className="flex w-full gap-2 pt-1">
                    <input
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendTypedMessage(); } }}
                      placeholder="Inglizcha gap yozing..."
                      disabled={isThinking || isListening}
                      className="min-w-0 flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary disabled:opacity-60"
                    />
                    <Button onClick={sendTypedMessage} disabled={!typedMessage.trim() || isThinking || isListening}
                      size="icon" className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-primary text-primary-foreground">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="w-full rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={() => navigate('/progress')}
              className="w-full flex items-center gap-3 rounded-2xl border border-border bg-secondary/60 px-4 py-3 hover:border-primary/40 transition-colors">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary"><BarChart3 className="h-4 w-4" /></span>
              <span className="flex-1 text-left">
                <span className="block text-sm font-bold text-foreground">Suhbat yakunida</span>
                <span className="block text-[11px] text-muted-foreground">Natijalarni ko'rish</span>
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground"><ChevronRight className="h-4 w-4" /></span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-foreground text-sm">Suhbat transkripti</h2>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
              </span>
            </div>
            <div className="max-h-[260px] space-y-3 overflow-y-auto pr-1">
              {messages.length === 0 && (
                <p className="text-xs text-muted-foreground">Suhbat boshlanganda bu yerda yozuvlar paydo bo'ladi.</p>
              )}
              {messages.map((m, i) => {
                const isAi = m.role === 'assistant';
                const text = isAi ? (parseAiOutput(m.content).reply || m.content) : m.content;
                return (
                  <div key={i} className="flex gap-2">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${isAi ? 'bg-gradient-primary' : 'bg-secondary'}`}>
                      {isAi ? <Bot className="h-3.5 w-3.5 text-primary-foreground" /> : <User className="h-3.5 w-3.5 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-foreground">
                        {isAi ? 'AI' : 'You'} <span className="ml-1 font-normal text-muted-foreground">{m.at}</span>
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed break-words">{text}</p>
                    </div>
                  </div>
                );
              })}
              {isListening && interim && (
                <p className="text-xs italic text-muted-foreground">{interim}</p>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-foreground text-sm">Sizning speaking natijangiz</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative h-[86px] w-[86px] shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" className="stroke-secondary" />
                  <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" strokeLinecap="round"
                    className="stroke-emerald-400" strokeDasharray={`${(overall / 100) * 264} 264`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-extrabold text-foreground">{overall}%</span>
                </div>
                <p className="mt-1 text-center text-[10px] text-muted-foreground">Umumiy ball</p>
              </div>
              <div className="flex-1 space-y-2">
                {metrics.map(m => (
                  <div key={m.label}>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">{m.label}</span>
                      <span className="font-bold text-foreground">{m.value}%</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-secondary/50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-destructive" />
                <p className="text-xs font-bold text-foreground">Xatolar va tuzatishlar</p>
              </div>
              {lastCorrection ? (
                <p className="whitespace-pre-line text-[11px] leading-relaxed text-muted-foreground">{lastCorrection}</p>
              ) : (
                <p className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Hozircha xato yo'q — davom eting!
                </p>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-border bg-secondary/50 px-3 py-2.5">
              <Star className="h-4 w-4 text-amber-400" />
              <p className="flex-1 text-xs font-bold text-foreground">Yangi so'zlar</p>
              <p className="text-[10px] text-muted-foreground">{newWords} ta yangi so'z</p>
            </div>

            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-gradient-primary px-3 py-3 text-primary-foreground shadow-soft">
              <Target className="h-5 w-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold">Keyingi maqsad</p>
                <p className="text-[10px] opacity-80">Uzoqroq gaplar tuzishga harakat qiling.</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
