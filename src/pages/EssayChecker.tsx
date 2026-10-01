import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Send, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ESSAY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/essay-checker`;

export default function EssayChecker() {
  const [essay, setEssay] = useState('');
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleCheck = async () => {
    if (!essay.trim() || essay.length < 10) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Iltimos, tizimga kiring.");
      return;
    }
    setLoading(true);
    setResult('');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch(ESSAY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ essay: essay.trim(), topic: topic.trim() || undefined }),
        signal: controller.signal,
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: 'Xatolik' }));
        setResult(`❌ ${err.error || 'Xatolik yuz berdi'}`);
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              setResult(accumulated);
            }
          } catch {}
        }
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setResult('❌ Tarmoq xatosi. Qayta urinib ko\'ring.');
      }
    }
    setLoading(false);
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setEssay('');
    setTopic('');
    setResult('');
    setLoading(false);
  };

  return (
    <div className="container max-w-3xl py-4 sm:py-6 px-3 sm:px-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-duo-green to-emerald-600 shadow-lg">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">AI Insho Tekshiruvchi</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Inshoyingizni AI yordamida tekshiring</p>
        </div>
      </motion.div>

      {!result ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-foreground mb-1 block">Mavzu (ixtiyoriy)</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Masalan: The importance of education"
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-foreground mb-1 block">Inshoyingiz</label>
            <Textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder="Ingliz tilida inshoyingizni shu yerga yozing..."
              className="rounded-xl min-h-[200px] sm:min-h-[300px] text-base"
            />
            <p className="text-xs text-muted-foreground mt-1">{essay.length} belgi</p>
          </div>
          <Button
            onClick={handleCheck}
            disabled={loading || essay.length < 10}
            className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-base gap-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            {loading ? 'Tekshirilmoqda...' : 'Tekshirish'}
          </Button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{result}</ReactMarkdown>
            {loading && <span className="inline-block h-4 w-1 bg-primary animate-pulse ml-1" />}
          </div>
          {!loading && (
            <Button onClick={handleReset} variant="outline" className="w-full h-12 rounded-2xl font-bold gap-2">
              <RotateCcw className="h-5 w-5" />
              Yangi insho tekshirish
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}
