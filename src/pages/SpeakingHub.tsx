import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Play, RefreshCw, ArrowRight, Bot, Volume2, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const SPEAKING_DATA: Record<string, { title: string; prompts: { id: string; text: string; translation: string; level: string }[] }[]> = {
  a1: [
    {
      title: "Introduce Yourself — O'zingizni tanishtiring",
      prompts: [
        { id: 'sp-a1-1', text: 'Hello, my name is Sara. I am from Uzbekistan.', translation: "Salom, mening ismim Sara. Men O'zbekistondanman.", level: 'a1' },
        { id: 'sp-a1-2', text: 'I am a student. I am twenty years old.', translation: "Men talabaman. Men yigirma yoshdaman.", level: 'a1' },
        { id: 'sp-a1-3', text: 'I like reading books and playing football.', translation: "Men kitob o'qishni va futbol o'ynashni yaxshi ko'raman.", level: 'a1' },
        { id: 'sp-a1-4', text: 'Nice to meet you. How are you?', translation: "Tanishganimdan xursandman. Qandaysiz?", level: 'a1' },
      ],
    },
    {
      title: "Daily Activities — Kundalik ishlar",
      prompts: [
        { id: 'sp-a1-5', text: 'I wake up at seven every morning.', translation: "Men har kuni ertalab ettida turaman.", level: 'a1' },
        { id: 'sp-a1-6', text: 'I have breakfast with my family.', translation: "Men oilam bilan nonushta qilaman.", level: 'a1' },
        { id: 'sp-a1-7', text: 'I go to school by bus.', translation: "Men maktabga avtobusda boraman.", level: 'a1' },
        { id: 'sp-a1-8', text: 'I like to watch TV in the evening.', translation: "Men kechqurun televizor ko'rishni yaxshi ko'raman.", level: 'a1' },
      ],
    },
  ],
  a2: [
    {
      title: "Describing People — Odamlarni tasvirlash",
      prompts: [
        { id: 'sp-a2-1', text: 'My best friend is tall and has brown hair.', translation: "Mening eng yaqin do'stim baland bo'yli va qo'ng'ir sochli.", level: 'a2' },
        { id: 'sp-a2-2', text: 'She is very kind and always helps other people.', translation: "U juda mehribon va doim boshqa odamlarga yordam beradi.", level: 'a2' },
        { id: 'sp-a2-3', text: 'He enjoys cooking and often makes dinner for his family.', translation: "U ovqat pishirishni yaxshi ko'radi va tez-tez oilasiga kechki ovqat tayyorlaydi.", level: 'a2' },
        { id: 'sp-a2-4', text: 'They moved to a new city last summer.', translation: "Ular o'tgan yozda yangi shaharga ko'chib o'tishdi.", level: 'a2' },
      ],
    },
  ],
  b1: [
    {
      title: "Expressing Opinions — Fikr bildirish",
      prompts: [
        { id: 'sp-b1-1', text: 'I believe that education is the most important investment in our future.', translation: "Men ta'lim kelajagimizga eng muhim sarmoya deb hisoblayman.", level: 'b1' },
        { id: 'sp-b1-2', text: 'In my opinion, technology has changed the way we communicate with each other.', translation: "Menimcha, texnologiya bizning bir-birimiz bilan muloqot qilish usulimizni o'zgartirdi.", level: 'b1' },
        { id: 'sp-b1-3', text: 'Although social media has many advantages, it can also have negative effects on mental health.', translation: "Ijtimoiy tarmoqlarning ko'p afzalliklari bo'lsa-da, u ruhiy salomatlikka salbiy ta'sir ko'rsatishi mumkin.", level: 'b1' },
        { id: 'sp-b1-4', text: 'I strongly agree that regular exercise improves both physical and mental well-being.', translation: "Men muntazam jismoniy mashqlar jismoniy va ruhiy salomatlikni yaxshilashiga to'liq qo'shilaman.", level: 'b1' },
      ],
    },
  ],
  b2: [
    {
      title: "Discussion & Debate — Munozara",
      prompts: [
        { id: 'sp-b2-1', text: 'While some argue that artificial intelligence will replace human workers, others maintain that it will create new job opportunities.', translation: "Ba'zilar sun'iy intellekt inson ishchilarini almashtiradi deb ta'kidlasa, boshqalar u yangi ish imkoniyatlarini yaratadi deb hisoblaydi.", level: 'b2' },
        { id: 'sp-b2-2', text: 'The government should prioritize sustainable development over short-term economic growth.', translation: "Hukumat qisqa muddatli iqtisodiy o'sishdan ko'ra barqaror rivojlanishga ustuvorlik berishi kerak.", level: 'b2' },
        { id: 'sp-b2-3', text: 'It is essential that we address the root causes of inequality rather than merely treating its symptoms.', translation: "Biz tengsizlikning oqibatlarini davolash o'rniga uning asosiy sabablarini hal qilishimiz muhim.", level: 'b2' },
      ],
    },
  ],
  c1: [
    {
      title: "Academic Presentation — Akademik taqdimot",
      prompts: [
        { id: 'sp-c1-1', text: 'The findings of this research have significant implications for our understanding of cognitive development in early childhood.', translation: "Ushbu tadqiqot natijalari bolalikdagi kognitiv rivojlanishni tushunishimiz uchun muhim ahamiyatga ega.", level: 'c1' },
        { id: 'sp-c1-2', text: 'Notwithstanding the limitations of the study, the data provides compelling evidence for a paradigm shift in educational methodology.', translation: "Tadqiqotning cheklovlariga qaramay, ma'lumotlar ta'lim metodologiyasida paradigma o'zgarishi uchun ishonchli dalillarni taqdim etadi.", level: 'c1' },
        { id: 'sp-c1-3', text: 'Had the sample size been larger, the statistical significance of these results would have been even more pronounced.', translation: "Agar namuna hajmi kattaroq bo'lganda, bu natijalarning statistik ahamiyati yanada yaqqolroq bo'lgan bo'lardi.", level: 'c1' },
      ],
    },
  ],
};

const LEVELS = [
  { id: 'a1', name: 'A1', label: "Boshlang'ich" },
  { id: 'a2', name: 'A2', label: 'Elementar' },
  { id: 'b1', name: 'B1', label: "O'rta" },
  { id: 'b2', name: 'B2', label: "Yuqori o'rta" },
  { id: 'c1', name: 'C1', label: "Ilg'or" },
];

export default function SpeakingHub() {
  const { user } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState('a1');
  const [selectedSet, setSelectedSet] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [practicing, setPracticing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const recognitionRef = useRef<any>(null);

  const levelData = SPEAKING_DATA[selectedLevel] || [];
  const currentSet = levelData[selectedSet];
  const prompt = currentSet?.prompts[currentPrompt];

  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Brauzeringiz Speech Recognition-ni qo'llab-quvvatlamaydi. Chrome yoki Edge ishlatib ko'ring.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = '';
    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript + interim);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setTranscript('');
    setShowFeedback(false);
    setAiFeedback('');
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const playAudio = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-US';
    utt.rate = 0.9;
    window.speechSynthesis.speak(utt);
  }, []);

  const getAiFeedback = useCallback(async () => {
    if (!transcript.trim() || !prompt) return;
    setLoadingFeedback(true);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: `Men speaking mashq qilyapman. Quyidagi gapni o'qishim kerak edi:\n\nOriginal: "${prompt.text}"\n\nMen aytgan gap (Speech Recognition natijasi): "${transcript.trim()}"\n\nIltimos, mening talaffuzim va aniqligimni tahlil qiling:\n1. Aniqlik foizi (original bilan solishtiring)\n2. Xatolar va to'g'ri shakli\n3. Talaffuz bo'yicha maslahatlar\n4. Umumiy baho`,
              },
            ],
            lessonContext: `Speaking Practice - ${selectedLevel.toUpperCase()} level. O'quvchi gapni o'qib, talaffuzini tekshiryapti.`,
          }),
        }
      );

      if (!response.ok) {
        setAiFeedback("AI tahlil vaqtincha ishlamayapti. Iltimos keyinroq urinib ko'ring.");
        setShowFeedback(true);
        setLoadingFeedback(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && line.slice(6).trim() !== '[DONE]') {
              try {
                const parsed = JSON.parse(line.slice(6));
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  result += content;
                  setAiFeedback(result);
                }
              } catch {}
            }
          }
        }
      }

      setShowFeedback(true);
    } catch {
      setAiFeedback("Xatolik yuz berdi. Qayta urinib ko'ring.");
      setShowFeedback(true);
    } finally {
      setLoadingFeedback(false);
    }
  }, [transcript, prompt, selectedLevel]);

  const handleNext = () => {
    if (currentSet && currentPrompt < currentSet.prompts.length - 1) {
      setCurrentPrompt(prev => prev + 1);
    } else {
      setPracticing(false);
      setSelectedSet(0);
      setCurrentPrompt(0);
    }
    setTranscript('');
    setAiFeedback('');
    setShowFeedback(false);
  };

  const handleRetry = () => {
    setTranscript('');
    setAiFeedback('');
    setShowFeedback(false);
  };

  return (
    <div className="container max-w-3xl py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Mic className="h-6 w-6 text-success" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Speaking Practice</h1>
        </div>
        <p className="text-muted-foreground">Gapiring — AI talaffuzingizni tahlil qiladi</p>
      </motion.div>

      {/* Voice Chat CTA */}
      <Link to="/voice-chat" className="block mt-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          className="rounded-2xl bg-gradient-to-r from-primary to-primary/70 p-5 text-primary-foreground shadow-soft cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-base">Voice Chat AI</h3>
                <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Yangi</span>
              </div>
              <p className="text-sm text-primary-foreground/90">Real-time ovozli suhbat — AI bilan ingliz tilida gaplashing</p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0" />
          </div>
        </motion.div>
      </Link>

      {/* Level tabs */}
      <div className="flex gap-2 mt-8 mb-6 overflow-x-auto pb-1">
        {LEVELS.map(level => (
          <button
            key={level.id}
            onClick={() => { setSelectedLevel(level.id); setSelectedSet(0); setCurrentPrompt(0); setPracticing(false); handleRetry(); }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
              selectedLevel === level.id
                ? 'bg-gradient-primary text-primary-foreground shadow-soft'
                : 'border border-border bg-card text-foreground hover:shadow-card'
            }`}
          >
            {level.name} — {level.label}
          </button>
        ))}
      </div>

      {!practicing ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {levelData.map((set, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5 hover:shadow-card transition-all duration-200 cursor-pointer"
              onClick={() => { setSelectedSet(i); setCurrentPrompt(0); setPracticing(true); handleRetry(); }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-card-foreground">{set.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{set.prompts.length} ta mashq</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <Mic className="h-5 w-5 text-success" />
                </div>
              </div>
            </div>
          ))}
          {levelData.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">Bu daraja uchun mashqlar tez orada qo'shiladi</p>
            </div>
          )}
        </motion.div>
      ) : prompt ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Progress */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <button onClick={() => { setPracticing(false); handleRetry(); }} className="hover:text-foreground transition-colors">← Orqaga</button>
            <span>Mashq {currentPrompt + 1}/{currentSet?.prompts.length}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-primary" animate={{ width: `${((currentPrompt + 1) / (currentSet?.prompts.length || 1)) * 100}%` }} />
          </div>

          {/* Target text */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-card-foreground">📖 O'qing:</h3>
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => playAudio(prompt.text)}>
                <Volume2 className="h-4 w-4 mr-1.5" /> Tinglash
              </Button>
            </div>
            <p className="text-lg text-card-foreground leading-relaxed">{prompt.text}</p>
            <p className="text-sm text-muted-foreground mt-2">→ {prompt.translation}</p>
          </div>

          {/* Record */}
          <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
            <h3 className="font-semibold text-card-foreground">🎤 Gapiring:</h3>
            
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`inline-flex h-20 w-20 items-center justify-center rounded-full transition-all duration-200 ${
                isRecording
                  ? 'bg-destructive text-destructive-foreground animate-pulse shadow-elevated'
                  : 'bg-gradient-primary text-primary-foreground shadow-soft hover:scale-105'
              }`}
            >
              {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </button>
            <p className="text-sm text-muted-foreground">
              {isRecording ? "Gapiring... To'xtatish uchun bosing" : "Yozishni boshlash uchun bosing"}
            </p>

            {/* Live transcript */}
            {transcript && (
              <div className="rounded-lg bg-secondary/50 p-4 text-left">
                <p className="text-xs text-muted-foreground mb-1">Siz aytgan gap:</p>
                <p className="text-card-foreground">{transcript}</p>
              </div>
            )}
          </div>

          {/* Actions after recording */}
          {transcript && !isRecording && (
            <div className="flex gap-3 justify-center">
              <Button onClick={handleRetry} variant="outline" className="rounded-lg">
                <RefreshCw className="mr-2 h-4 w-4" /> Qayta gapirish
              </Button>
              {user ? (
                <Button
                  onClick={getAiFeedback}
                  disabled={loadingFeedback}
                  className="rounded-lg bg-gradient-primary text-primary-foreground shadow-soft"
                >
                  <Bot className="mr-2 h-4 w-4" />
                  {loadingFeedback ? 'Tahlil qilinmoqda...' : 'AI tahlil'}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">AI tahlil uchun tizimga kiring</p>
              )}
            </div>
          )}

          {/* AI Feedback */}
          <AnimatePresence>
            {(showFeedback || loadingFeedback) && aiFeedback && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-primary/15 bg-primary/5 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-card-foreground">AI Tahlil</h3>
                </div>
                <div className="prose prose-sm max-w-none text-card-foreground/85 whitespace-pre-line leading-relaxed">
                  {aiFeedback}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next */}
          {showFeedback && (
            <div className="text-center">
              <Button onClick={handleNext} className="rounded-lg bg-gradient-primary text-primary-foreground shadow-soft">
                {currentPrompt < (currentSet?.prompts.length || 1) - 1 ? 'Keyingi' : 'Yakunlash'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </motion.div>
      ) : null}
    </div>
  );
}
