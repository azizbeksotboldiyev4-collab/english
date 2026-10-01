import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import type { Topic } from '@/data/lessons';

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`;

interface LessonAiChatProps {
  lesson: Topic;
}

function buildLessonContext(lesson: Topic): string {
  const { content } = lesson;
  let ctx = `Mavzu: ${lesson.title} (${lesson.titleUz})\nKategoriya: ${lesson.category}\n\n`;
  ctx += `Tushuntirish:\n${content.explanation}\n\n`;
  if (content.examples.length > 0) {
    ctx += `Misollar:\n`;
    content.examples.forEach(ex => { ctx += `- ${ex.en} → ${ex.uz}\n`; });
    ctx += '\n';
  }
  if (content.table) {
    ctx += `Jadval: ${content.table.headers.join(' | ')}\n`;
    content.table.rows.forEach(row => { ctx += `${row.join(' | ')}\n`; });
    ctx += '\n';
  }
  return ctx.slice(0, 4000);
}

export default function LessonAiChat({ lesson }: LessonAiChatProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lessonContext = useRef(buildLessonContext(lesson));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const QUICK_PROMPTS = [
    "Mashq bergin",
    "Misollar ko'rsatgin",
    "Soddaroq tushuntir",
    "Test ber",
    "Xato qildim, tuzat",
  ];

  const sendMessage = useCallback(async (text: string, isAutoStart = false) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 1000 || isLoading) return;

    const userMsg: Msg = { role: 'user', content: trimmed };
    
    // For auto-start, don't show user message - AI just starts teaching
    if (!isAutoStart) {
      setMessages(prev => [...prev, userMsg]);
    }
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';
    const allMessages = isAutoStart ? [userMsg] : [...messages, userMsg];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Iltimos avval tizimga kiring.' }]);
        setIsLoading(false);
        return;
      }

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: allMessages,
          lessonContext: lessonContext.current,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Xatolik yuz berdi' }));
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${err.error || 'Xatolik yuz berdi'}` }]);
        setIsLoading(false);
        return;
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Tarmoq xatosi. Qayta urinib ko\'ring.' }]);
    }
    setIsLoading(false);
  }, [messages, isLoading]);

  // Auto-start: AI begins teaching immediately when tab opens
  useEffect(() => {
    if (!autoStarted && messages.length === 0) {
      setAutoStarted(true);
      const autoMessage = `Salom! Men sening AI ustozingman. Hozir senga "${lesson.titleUz}" mavzusini bosqichma-bosqich o'rgataman. Darsni boshla — avval asosiy qoidalarni tushuntir, keyin misollar ber, va har 2-3 tushuntirishdan keyin mashq savoli ber. Interaktiv bo'l.`;
      // Small delay for smooth UX
      const timer = setTimeout(() => sendMessage(autoMessage, true), 500);
      return () => clearTimeout(timer);
    }
  }, [autoStarted, lesson.titleUz]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col" style={{ height: '65vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">AI Ustoz</h3>
            <p className="text-[10px] text-muted-foreground">{lesson.titleUz} bo'yicha dars o'tmoqda...</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="icon" onClick={() => { setMessages([]); setAutoStarted(false); }} className="rounded-xl h-8 w-8">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-2xl glass p-3 space-y-3">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-soft animate-pulse">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                AI Ustoz darsni tayyorlamoqda... 🎓
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Bir soniya kuting, ustoz hozir "{lesson.titleUz}" mavzusini o'rgatishni boshlaydi
              </p>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-primary mt-1 shadow-soft">
                  <Bot className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
              <div
                className={`rounded-2xl px-3 py-2 max-w-[85%] text-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-primary text-primary-foreground'
                    : 'glass text-foreground'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === 'user' && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-muted mt-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-primary mt-1 shadow-soft">
              <Bot className="h-3 w-3 text-primary-foreground" />
            </div>
            <div className="rounded-2xl glass px-3 py-2">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length > 0 && !isLoading && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="rounded-xl glass px-2.5 py-1 text-[11px] text-foreground hover:bg-primary/10 hover:scale-[1.03] transition-all duration-300"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
        className="mt-2 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Savolingizni yozing yoki javob bering..."
          disabled={isLoading}
          className="flex-1 rounded-2xl glass px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="h-11 w-11 rounded-2xl bg-gradient-primary shadow-soft hover:scale-[1.05] transition-transform duration-300">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </motion.div>
  );
}
