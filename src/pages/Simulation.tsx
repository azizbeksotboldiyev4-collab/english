import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Loader2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDailyMissions } from '@/contexts/DailyMissionsContext';

interface Scenario {
  id: string;
  title: string;
  titleUz: string;
  emoji: string;
  color: string;
  description: string;
  systemContext: string;
  starterMessage: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'restaurant',
    title: 'At a Restaurant',
    titleUz: 'Restoranda',
    emoji: '🍽️',
    color: 'bg-duo-orange',
    description: 'Ofitsiantga buyurtma bering, menyu haqida so\'rang',
    systemContext: `Sen restoran ofitsiantisan. O'quvchi mijoz sifatida senga murojaat qiladi. 
Vazifang: tabrikla, menyu taklif qil, buyurtma qabul qil, narx ayt.
Inglizcha gapir, lekin agar o'quvchi tushunmasa o'zbekchada yordam ber.
Menyu: Burger ($12), Pizza ($15), Salad ($8), Soup ($6), Coffee ($3), Juice ($4).
Qisqa, tabiiy gapir — haqiqiy ofitsiant kabi.`,
    starterMessage: "Welcome to Linguo Café! 🍕 How can I help you today? Would you like to see our menu?",
  },
  {
    id: 'airport',
    title: 'At the Airport',
    titleUz: 'Aeroportda',
    emoji: '✈️',
    color: 'bg-duo-blue',
    description: 'Check-in qiling, yo\'nalishlarni so\'rang',
    systemContext: `Sen aeroport xodimisan (check-in counter). O'quvchi yo'lovchi.
Vazifang: pasport so'ra, chiptani tekshir, bagaj og'irligini ayt, gate raqamini ber.
Inglizcha gapir, lekin agar o'quvchi tushunmasa o'zbekchada yordam ber.
Flight: LU-205 to London, Gate B12, Boarding at 14:30, Baggage limit: 23kg.
Qisqa, professional gapir.`,
    starterMessage: "Good morning! Welcome to Linguo Airlines check-in. ✈️ May I see your passport and booking confirmation, please?",
  },
  {
    id: 'shopping',
    title: 'Shopping',
    titleUz: "Do'konda xarid",
    emoji: '🛍️',
    color: 'bg-duo-purple',
    description: 'Kiyim-kechak sotib oling, narx so\'rang',
    systemContext: `Sen kiyim do'koni sotuvchisisan. O'quvchi xaridor.
Vazifang: yordam taklif qil, razmer so'ra, rang tavsiya qil, narx ayt, chegirma taklif qil.
Inglizcha gapir, lekin agar o'quvchi tushunmasa o'zbekchada yordam ber.
Mahsulotlar: T-shirt ($20), Jeans ($45), Jacket ($80), Sneakers ($60), Hat ($15).
20% discount on 2+ items. Doʻstona va yoqimli gapir.`,
    starterMessage: "Hi there! Welcome to our store! 🛍️ Are you looking for something specific today? We have some great deals!",
  },
  {
    id: 'hotel',
    title: 'Hotel Check-in',
    titleUz: 'Mehmonxonada',
    emoji: '🏨',
    color: 'bg-duo-green',
    description: 'Mehmonxonaga joylashtiring, xona so\'rang',
    systemContext: `Sen mehmonxona resepshinist'isan. O'quvchi mehmon.
Vazifang: tabrikla, bron tekshir, xona turi taklif qil, qulayliklarni tushuntir.
Inglizcha gapir, lekin agar o'quvchi tushunmasa o'zbekchada yordam ber.
Xonalar: Standard ($80/night), Deluxe ($120/night), Suite ($200/night).
WiFi bepul, nonushta 7-10, basseyn 6-22. Professional va yoqimli gapir.`,
    starterMessage: "Good evening! Welcome to Linguo Grand Hotel! 🏨 Do you have a reservation with us?",
  },
];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function Simulation() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { addMissionProgress } = useDailyMissions();
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const startScenario = (scenario: Scenario) => {
    setActiveScenario(scenario);
    setMessages([{ role: 'assistant', content: scenario.starterMessage }]);
    addMissionProgress('ai-chat');
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !activeScenario || !session) return;

    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const res = await supabase.functions.invoke('ai-tutor', {
        body: {
          messages: updated,
          lessonContext: activeScenario.systemContext,
        },
      });

      if (res.error) throw res.error;

      // Handle streaming response
      const reader = res.data instanceof ReadableStream 
        ? res.data.getReader() 
        : null;
      
      if (reader) {
        const decoder = new TextDecoder();
        let fullText = '';
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
          
          for (const line of lines) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content || '';
              fullText += delta;
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: 'assistant', content: fullText };
                return copy;
              });
            } catch {}
          }
        }
      } else if (typeof res.data === 'string') {
        setMessages(prev => [...prev, { role: 'assistant', content: res.data }]);
      }
    } catch (e) {
      console.error('Simulation error:', e);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Xatolik yuz berdi. Qayta urinib ko\'ring.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!activeScenario) {
    return (
      <div className="container max-w-lg py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Orqaga
        </button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <span className="text-5xl mb-3 block">🌍</span>
            <h1 className="text-2xl font-extrabold text-foreground">Real-life Simulation</h1>
            <p className="text-sm text-muted-foreground mt-2">Haqiqiy vaziyatlarda ingliz tilida gaplashing!</p>
          </div>

          <div className="space-y-3">
            {SCENARIOS.map((s, i) => (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => startScenario(s)}
                disabled={!user}
                className="w-full flex items-center gap-4 bg-card rounded-2xl border-2 border-border p-5 hover:border-primary hover:shadow-card transition-all duration-200 text-left disabled:opacity-50"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${s.color} text-2xl shadow-duo`}>
                  {s.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-card-foreground">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.titleUz}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                </div>
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </motion.button>
            ))}
          </div>

          {!user && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              Simulyatsiyadan foydalanish uchun tizimga kiring
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <button onClick={() => { setActiveScenario(null); setMessages([]); }} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${activeScenario.color} text-lg`}>
          {activeScenario.emoji}
        </div>
        <div>
          <p className="font-extrabold text-card-foreground text-sm">{activeScenario.title}</p>
          <p className="text-xs text-muted-foreground">{activeScenario.titleUz}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-card border border-border text-card-foreground rounded-bl-md'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl px-4 py-3 rounded-bl-md">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Inglizcha javob yozing..."
            className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn-duo bg-primary text-primary-foreground p-3 rounded-2xl disabled:opacity-50"
            style={{ boxShadow: '0 3px 0 0 hsl(145, 63%, 32%)' }}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
