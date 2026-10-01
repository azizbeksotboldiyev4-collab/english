import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, User, Sparkles, Plus, MessageSquare, Trash2, Menu, X,
  BookOpen, Mic, Library, Award, Coffee, PenLine, Briefcase, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/hooks/useProgress';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type Msg = { role: 'user' | 'assistant'; content: string };
type Mode = 'free' | 'grammar' | 'speaking' | 'vocabulary' | 'ielts' | 'daily' | 'writing' | 'interview';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`;

const MODES: { id: Mode; label: string; icon: React.ComponentType<{ className?: string }>; intro: string }[] = [
  { id: 'free', label: 'Free Chat', icon: Sparkles, intro: 'Ask me anything about English.' },
  { id: 'grammar', label: 'Grammar', icon: BookOpen, intro: "Let's practice grammar. Pick a topic or I can suggest one." },
  { id: 'speaking', label: 'Speaking', icon: Mic, intro: "Let's have a conversation. I'll ask, you reply." },
  { id: 'vocabulary', label: 'Vocabulary', icon: Library, intro: "Want to learn new words? Tell me a topic." },
  { id: 'ielts', label: 'IELTS', icon: Award, intro: 'IELTS practice — Speaking, Writing or Reading?' },
  { id: 'daily', label: 'Daily Talk', icon: Coffee, intro: 'Pick a daily situation: café, airport, meeting...' },
  { id: 'writing', label: 'Writing Fix', icon: PenLine, intro: 'Paste your text — I will correct and score it.' },
  { id: 'interview', label: 'Interview', icon: Briefcase, intro: 'Job interview practice. What role are you targeting?' },
];

export default function AiTutor() {
  const { user } = useAuth();
  const { progress } = useProgress();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<Mode>('free');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations list
  const { data: conversations = [] } = useQuery({
    queryKey: ['ai-conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('ai_conversations')
        .select('id, title, mode, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!user,
  });

  const loadConversation = async (id: string) => {
    const { data } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', id)
      .order('created_at');
    setMessages((data || []) as Msg[]);
    setConversationId(id);
    const conv = conversations.find((c: any) => c.id === id);
    if (conv) setMode(conv.mode as Mode);
    setSidebarOpen(false);
  };

  const newChat = (m: Mode = mode) => {
    setMessages([]);
    setConversationId(null);
    setMode(m);
    setSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const deleteConversation = async (id: string) => {
    await supabase.from('ai_conversations').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['ai-conversations', user?.id] });
    if (conversationId === id) newChat();
  };

  const ensureConversation = async (firstUserText: string): Promise<string | null> => {
    if (conversationId) return conversationId;
    if (!user) return null;
    const title = firstUserText.slice(0, 60);
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({ user_id: user.id, title, mode })
      .select('id')
      .single();
    if (error || !data) return null;
    setConversationId(data.id);
    queryClient.invalidateQueries({ queryKey: ['ai-conversations', user?.id] });
    return data.id;
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 1000 || isLoading) return;
    if (!user) {
      toast.error('Iltimos avval tizimga kiring');
      return;
    }

    const userMsg: Msg = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const convId = await ensureConversation(trimmed);
    if (convId) {
      await supabase.from('ai_messages').insert({ conversation_id: convId, role: 'user', content: trimmed });
    }

    let assistantSoFar = '';
    const history = [...messages, userMsg];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          messages: history,
          mode,
          userLevel: progress.level,
          completedTopics: progress.completedTopics,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Xatolik' }));
        if (resp.status === 429) toast.error('Juda ko\'p so\'rov. Biroz kuting.');
        else if (resp.status === 402) toast.error('AI limit tugadi.');
        setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ ${err.error || 'Xatolik'}` }]);
        setIsLoading(false);
        return;
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let done = false;

      while (!done) {
        const { done: rdone, value } = await reader.read();
        if (rdone) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { done = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
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

      if (assistantSoFar && convId) {
        await supabase.from('ai_messages').insert({ conversation_id: convId, role: 'assistant', content: assistantSoFar });
        await supabase.from('ai_conversations').update({ updated_at: new Date().toISOString() }).eq('id', convId);
        queryClient.invalidateQueries({ queryKey: ['ai-conversations', user?.id] });
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => [...prev, { role: 'assistant', content: '⚠️ Network error. Try again.' }]);
    }
    setIsLoading(false);
  };

  const activeMode = MODES.find((m) => m.id === mode)!;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 border-r border-border bg-card transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm">AI Tutor</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-3">
            <Button onClick={() => newChat()} className="w-full justify-start gap-2 rounded-xl" variant="outline">
              <Plus className="h-4 w-4" /> New chat
            </Button>
          </div>

          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            History
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
            {conversations.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">No conversations yet</p>
            )}
            {conversations.map((c: any) => (
              <div
                key={c.id}
                className={`group flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition-colors ${
                  conversationId === c.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                }`}
                onClick={() => loadConversation(c.id)}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 truncate text-xs">{c.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 text-destructive transition-opacity"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          {user && (
            <div className="border-t border-border p-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                {(user.user_metadata?.full_name || user.email || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{user.user_metadata?.full_name || user.email}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Level: {progress.level}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main chat */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-2 border-b border-border px-3 sm:px-4 py-2.5">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded hover:bg-muted">
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <activeMode.icon className="h-4 w-4 text-primary" />
            <h1 className="font-bold text-sm truncate">{activeMode.label}</h1>
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
              {progress.level}
            </span>
          </div>
        </div>

        {/* Mode pills */}
        <div className="flex gap-1.5 overflow-x-auto px-3 sm:px-4 py-2 border-b border-border bg-muted/30">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => { if (messages.length === 0) setMode(m.id); else newChat(m.id); }}
              className={`flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                mode === m.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              <m.icon className="h-3 w-3" />
              {m.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center gap-4 py-12">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg">
                  <activeMode.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{activeMode.label}</h2>
                  <p className="text-sm text-muted-foreground max-w-md mt-1">{activeMode.intro}</p>
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 mt-1">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-sm break-words ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>pre]:my-2 [&_code]:text-xs">
                        <ReactMarkdown>{msg.content || '...'}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 mt-1">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="rounded-2xl bg-muted px-4 py-3 flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border px-3 sm:px-6 py-3 bg-background">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="max-w-3xl mx-auto flex items-end gap-2"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder={`Message AI Tutor in ${activeMode.label}...`}
              disabled={isLoading}
              rows={1}
              maxLength={1000}
              className="flex-1 resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-32"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
              className="h-11 w-11 rounded-2xl shrink-0"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
          <p className="text-[10px] text-muted-foreground text-center mt-1.5">
            AI o'qituvchi — javoblar tekshirilishi mumkin
          </p>
        </div>
      </main>
    </div>
  );
}
