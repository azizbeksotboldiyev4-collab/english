import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Languages, Search, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';

const TRANSLATOR_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translator`;

export default function Translator() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const handleTranslate = async (input?: string) => {
    const query = (input || text).trim();
    if (!query) return;
    setLoading(true);
    setResult('');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setResult('❌ Tizimga kiring.');
        setLoading(false);
        return;
      }
      const resp = await fetch(TRANSLATOR_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ text: query }),
        signal: controller.signal,
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: 'Xatolik' }));
        setResult(`❌ ${err.error || 'Xatolik yuz berdi'}`);
        setLoading(false);
        return;
      }

      if (!history.includes(query)) {
        setHistory(prev => [query, ...prev].slice(0, 10));
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
        setResult('❌ Tarmoq xatosi.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="container max-w-3xl py-4 sm:py-6 px-3 sm:px-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
          <Languages className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">AI Tarjimon</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">So'z yoki gapni batafsil tushuntirish</p>
        </div>
      </motion.div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="So'z yoki gap kiriting..."
            className="rounded-xl flex-1 h-12 text-base"
            onKeyDown={(e) => e.key === 'Enter' && handleTranslate()}
          />
          <Button
            onClick={() => handleTranslate()}
            disabled={loading || !text.trim()}
            className="h-12 w-12 rounded-xl bg-primary p-0"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          </Button>
        </div>

        {history.length > 0 && !result && (
          <div className="flex flex-wrap gap-2">
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => { setText(h); handleTranslate(h); }}
                className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {h}
              </button>
            ))}
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
              {loading && <span className="inline-block h-4 w-1 bg-primary animate-pulse ml-1" />}
            </div>
            {!loading && (
              <Button onClick={() => { setResult(''); setText(''); }} variant="outline" className="w-full mt-3 h-10 rounded-xl font-bold gap-2">
                <RotateCcw className="h-4 w-4" /> Yangi so'z qidirish
              </Button>
            )}
          </motion.div>
        )}

        {!result && !loading && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {['Hello', 'Nevertheless', 'Furthermore', 'Accomplish'].map(word => (
              <button
                key={word}
                onClick={() => { setText(word); handleTranslate(word); }}
                className="p-3 rounded-xl bg-card border border-border text-sm font-medium text-foreground hover:bg-primary/5 hover:border-primary/30 transition-all text-left"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary mb-1" />
                {word}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
