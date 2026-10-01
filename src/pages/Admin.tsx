import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Headphones, Mic, BookOpen, Plus, Trash2, Loader2, CheckCircle2, Users, BarChart3, TrendingUp, GraduationCap, Crown, ShieldCheck, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

const tabs = [
  { id: 'stats', label: 'Statistika', icon: BarChart3, color: 'text-amber-500' },
  { id: 'users', label: 'Foydalanuvchilar', icon: Users, color: 'text-cyan-500' },
  { id: 'lessons', label: 'Darslar', icon: GraduationCap, color: 'text-orange-500' },
  { id: 'listening', label: 'Listening', icon: Headphones, color: 'text-blue-500' },
  { id: 'speaking', label: 'Speaking', icon: Mic, color: 'text-purple-500' },
  { id: 'vocabulary', label: "Lug'at", icon: BookOpen, color: 'text-green-500' },
];

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [activeTab, setActiveTab] = useState('stats');

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container max-w-4xl py-4 sm:py-6 px-3 sm:px-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-duo-green to-emerald-600 shadow-lg">
          <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">Admin Panel</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Kontent boshqaruv tizimi</p>
        </div>
      </motion.div>

      {/* Tabs - scrollable on mobile */}
      <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-duo-green text-white shadow-lg'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <tab.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'stats' && <StatsSection />}
          {activeTab === 'users' && <UsersSection />}
          {activeTab === 'lessons' && <LessonsSection />}
          {activeTab === 'listening' && <ListeningSection />}
          {activeTab === 'speaking' && <SpeakingSection />}
          {activeTab === 'vocabulary' && <VocabularySection />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ========== STATISTICS ========== */
function StatsSection() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [users, lessons, listening, speaking, vocab] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('custom_lessons').select('id', { count: 'exact', head: true }),
        supabase.from('listening_exercises').select('id', { count: 'exact', head: true }),
        supabase.from('speaking_exercises').select('id', { count: 'exact', head: true }),
        supabase.from('vocabulary_items').select('id', { count: 'exact', head: true }),
      ]);
      return {
        users: users.count || 0,
        lessons: lessons.count || 0,
        listening: listening.count || 0,
        speaking: speaking.count || 0,
        vocab: vocab.count || 0,
      };
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const cards = [
    { label: 'Foydalanuvchilar', value: stats?.users ?? 0, icon: Users, color: 'from-cyan-500 to-blue-600', textColor: 'text-cyan-600' },
    { label: 'Darslar', value: stats?.lessons ?? 0, icon: GraduationCap, color: 'from-orange-500 to-rose-600', textColor: 'text-orange-600' },
    { label: 'Listening', value: stats?.listening ?? 0, icon: Headphones, color: 'from-blue-500 to-indigo-600', textColor: 'text-blue-600' },
    { label: 'Speaking', value: stats?.speaking ?? 0, icon: Mic, color: 'from-purple-500 to-violet-600', textColor: 'text-purple-600' },
    { label: "Lug'at so'zlari", value: stats?.vocab ?? 0, icon: BookOpen, color: 'from-green-500 to-emerald-600', textColor: 'text-green-600' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-5 w-5 text-amber-500" />
        <h3 className="font-bold text-foreground text-sm sm:text-base">Umumiy statistika</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {cards.map((card) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-card border border-border p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} shadow`}>
              <card.icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{card.value}</span>
            <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground text-center">{card.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ========== USERS MANAGEMENT ========== */
function UsersSection() {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (!profiles) return [];

      const { data: progress } = await supabase.from('user_progress').select('*');
      const { data: roles } = await supabase.from('user_roles').select('*');

      return profiles.map((p: any) => ({
        ...p,
        progress: progress?.find((pr: any) => pr.user_id === p.user_id),
        roles: roles?.filter((r: any) => r.user_id === p.user_id).map((r: any) => r.role) || [],
      }));
    },
  });

  const toggleAdmin = useMutation({
    mutationFn: async ({ userId, makeAdmin }: { userId: string; makeAdmin: boolean }) => {
      if (makeAdmin) {
        const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Yangilandi');
    },
    onError: (e: any) => toast.error(e.message || 'Xatolik'),
  });

  const togglePremium = useMutation({
    mutationFn: async ({ userId, makePremium }: { userId: string; makePremium: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_premium: makePremium, premium_plan: makePremium ? 'admin-grant' : null })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Yangilandi');
    },
    onError: (e: any) => toast.error(e.message || 'Xatolik'),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-cyan-500" />
          <h3 className="font-bold text-foreground text-sm sm:text-base">Foydalanuvchilar ({users.length})</h3>
        </div>
      </div>

      {users.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">Foydalanuvchilar topilmadi</p>
      ) : (
        <div className="space-y-2">
          {users.map((u: any) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl bg-card border border-border p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
            >
              <div className="flex items-center gap-3 w-full sm:w-auto sm:flex-1 min-w-0">
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary font-bold text-sm border-2 border-primary/20 overflow-hidden">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  (u.full_name || '?').charAt(0).toUpperCase()
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-foreground text-sm truncate">{u.full_name || "Noma'lum"}</p>
                  {u.roles.includes('admin') && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      Admin
                    </span>
                  )}
                  {u.is_premium && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      Premium
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                  <span>XP: <strong className="text-foreground">{u.progress?.xp ?? 0}</strong></span>
                  <span>Streak: <strong className="text-foreground">{u.progress?.streak ?? 0}</strong></span>
                  <span>Level: <strong className="text-foreground uppercase">{u.progress?.current_level ?? 'a1'}</strong></span>
                </div>
              </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <Button
                  size="sm"
                  variant={u.roles.includes('admin') ? 'default' : 'outline'}
                  onClick={() => toggleAdmin.mutate({ userId: u.user_id, makeAdmin: !u.roles.includes('admin') })}
                  disabled={toggleAdmin.isPending}
                  className="h-8 text-[11px] gap-1 flex-1 sm:flex-initial"
                  title={u.roles.includes('admin') ? "Adminlikni olib tashlash" : "Admin qilish"}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {u.roles.includes('admin') ? "Olib tashlash" : "Admin"}
                </Button>
                <Button
                  size="sm"
                  variant={u.is_premium ? 'default' : 'outline'}
                  onClick={() => togglePremium.mutate({ userId: u.user_id, makePremium: !u.is_premium })}
                  disabled={togglePremium.isPending}
                  className="h-8 text-[11px] gap-1 flex-1 sm:flex-initial"
                  title={u.is_premium ? 'Premiumni o\'chirish' : 'Premium berish'}
                >
                  <Crown className="h-3.5 w-3.5" />
                  {u.is_premium ? "Bekor qilish" : "Premium"}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========== LESSONS MANAGEMENT ========== */
function LessonsSection() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', title_uz: '', level_id: 'a1', category: 'grammar',
    description: '', explanation: '',
  });
  const [examples, setExamples] = useState([{ en: '', uz: '' }]);
  const [quiz, setQuiz] = useState([{ question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }]);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-custom-lessons'],
    queryFn: async () => {
      const { data } = await supabase.from('custom_lessons').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('custom_lessons').insert({
        ...form,
        examples: examples.filter(e => e.en && e.uz),
        real_life: [],
        practice: [],
        quiz: quiz.filter(q => q.question).map(q => ({
          id: crypto.randomUUID(),
          question: q.question,
          options: q.options.filter(Boolean),
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        })),
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-custom-lessons'] });
      setForm({ title: '', title_uz: '', level_id: 'a1', category: 'grammar', description: '', explanation: '' });
      setExamples([{ en: '', uz: '' }]);
      setQuiz([{ question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }]);
      toast.success("Dars qo'shildi!");
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('custom_lessons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-custom-lessons'] });
      toast.success("O'chirildi");
    },
  });

  const CATEGORIES = [
    { value: 'grammar', label: '📝 Grammar' },
    { value: 'vocabulary', label: '📚 Vocabulary' },
    { value: 'speaking', label: '🗣️ Speaking' },
    { value: 'reading', label: '📖 Reading' },
    { value: 'writing', label: '✍️ Writing' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-2xl bg-card border border-border p-4 sm:p-5 space-y-3 sm:space-y-4">
        <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2">
          <Plus className="h-4 w-4" /> Yangi dars qo'shish
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input placeholder="Sarlavha (inglizcha)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input placeholder="Sarlavha (o'zbekcha)" value={form.title_uz} onChange={(e) => setForm({ ...form, title_uz: e.target.value })} />
        </div>

        <Textarea placeholder="Tavsif (o'zbekcha)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LevelSelect value={form.level_id} onChange={(v) => setForm({ ...form, level_id: v })} />
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Textarea placeholder="Tushuntirish (explanation) — asosiy dars matni" rows={4} value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />

        {/* Examples */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground">Misollar:</p>
          {examples.map((ex, i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <Input placeholder="English" value={ex.en} onChange={(e) => {
                const copy = [...examples];
                copy[i] = { ...copy[i], en: e.target.value };
                setExamples(copy);
              }} />
              <Input placeholder="O'zbekcha" value={ex.uz} onChange={(e) => {
                const copy = [...examples];
                copy[i] = { ...copy[i], uz: e.target.value };
                setExamples(copy);
              }} />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setExamples([...examples, { en: '', uz: '' }])} className="text-xs">
            + Misol qo'shish
          </Button>
        </div>

        {/* Quiz */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-muted-foreground">Test savollari:</p>
          {quiz.map((q, qi) => (
            <div key={qi} className="rounded-xl border border-border/50 p-3 space-y-2 bg-muted/20">
              <Input placeholder={`Savol ${qi + 1}`} value={q.question} onChange={(e) => {
                const copy = [...quiz];
                copy[qi] = { ...copy[qi], question: e.target.value };
                setQuiz(copy);
              }} />
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-1">
                    <input
                      type="radio"
                      name={`q-${qi}`}
                      checked={q.correctIndex === oi}
                      onChange={() => {
                        const copy = [...quiz];
                        copy[qi] = { ...copy[qi], correctIndex: oi };
                        setQuiz(copy);
                      }}
                      className="accent-primary"
                    />
                    <Input placeholder={`Variant ${oi + 1}`} value={opt} onChange={(e) => {
                      const copy = [...quiz];
                      const opts = [...copy[qi].options];
                      opts[oi] = e.target.value;
                      copy[qi] = { ...copy[qi], options: opts };
                      setQuiz(copy);
                    }} className="h-8 text-xs" />
                  </div>
                ))}
              </div>
              <Input placeholder="Tushuntirish (ixtiyoriy)" value={q.explanation} onChange={(e) => {
                const copy = [...quiz];
                copy[qi] = { ...copy[qi], explanation: e.target.value };
                setQuiz(copy);
              }} className="text-xs" />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setQuiz([...quiz, { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }])} className="text-xs">
            + Savol qo'shish
          </Button>
        </div>

        <Button
          onClick={() => addMutation.mutate()}
          disabled={!form.title || !form.title_uz || !form.explanation || addMutation.isPending}
          className="w-full bg-duo-green hover:bg-duo-green/90 text-white font-bold rounded-xl"
        >
          {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Darsni qo'shish"}
        </Button>
      </div>

      <ItemList items={items} isLoading={isLoading} onDelete={(id) => deleteMutation.mutate(id)} renderItem={(item: any) => (
        <div>
          <p className="font-bold text-foreground text-xs sm:text-sm">{item.title_uz || item.title}</p>
          <p className="text-[11px] sm:text-xs text-muted-foreground">
            {item.level_id?.toUpperCase()} • {item.category} • {(item.quiz as any[])?.length || 0} savol
          </p>
        </div>
      )} />
    </div>
  );
}


/* ========== LISTENING ========== */
function ListeningSection() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: '', audio_text: '', question: '', options: '', correct_answer: '', level: 'a1' });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-listening'],
    queryFn: async () => {
      const { data } = await supabase.from('listening_exercises').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('listening_exercises').insert({
        ...form,
        options: form.options.split(',').map((o) => o.trim()).filter(Boolean),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listening'] });
      setForm({ title: '', audio_text: '', question: '', options: '', correct_answer: '', level: 'a1' });
      toast.success("Listening mashq qo'shildi!");
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('listening_exercises').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listening'] });
      toast.success("O'chirildi");
    },
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-2xl bg-card border border-border p-4 sm:p-5 space-y-3 sm:space-y-4">
        <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2"><Plus className="h-4 w-4" /> Yangi listening mashq</h3>
        <Input placeholder="Sarlavha" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Textarea placeholder="Audio matni (eshitish uchun)" value={form.audio_text} onChange={(e) => setForm({ ...form, audio_text: e.target.value })} />
        <Input placeholder="Savol" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
        <Input placeholder="Variantlar (vergul bilan: a, b, c, d)" value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} />
        <Input placeholder="To'g'ri javob" value={form.correct_answer} onChange={(e) => setForm({ ...form, correct_answer: e.target.value })} />
        <LevelSelect value={form.level} onChange={(v) => setForm({ ...form, level: v })} />
        <Button onClick={() => addMutation.mutate()} disabled={!form.title || !form.audio_text || addMutation.isPending} className="w-full bg-duo-green hover:bg-duo-green/90 text-white font-bold rounded-xl">
          {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Qo'shish"}
        </Button>
      </div>
      <ItemList items={items} isLoading={isLoading} onDelete={(id) => deleteMutation.mutate(id)} renderItem={(item: any) => (
        <div>
          <p className="font-bold text-foreground text-xs sm:text-sm">{item.title}</p>
          <p className="text-[11px] sm:text-xs text-muted-foreground">{item.level} • {item.audio_text?.slice(0, 40)}...</p>
        </div>
      )} />
    </div>
  );
}

/* ========== SPEAKING ========== */
function SpeakingSection() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: '', text: '', translation: '', level: 'a1' });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-speaking'],
    queryFn: async () => {
      const { data } = await supabase.from('speaking_exercises').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('speaking_exercises').insert(form);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-speaking'] });
      setForm({ title: '', text: '', translation: '', level: 'a1' });
      toast.success("Speaking mashq qo'shildi!");
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('speaking_exercises').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-speaking'] });
      toast.success("O'chirildi");
    },
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-2xl bg-card border border-border p-4 sm:p-5 space-y-3 sm:space-y-4">
        <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2"><Plus className="h-4 w-4" /> Yangi speaking mashq</h3>
        <Input placeholder="Sarlavha" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Textarea placeholder="Inglizcha matn" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
        <Input placeholder="O'zbekcha tarjima" value={form.translation} onChange={(e) => setForm({ ...form, translation: e.target.value })} />
        <LevelSelect value={form.level} onChange={(v) => setForm({ ...form, level: v })} />
        <Button onClick={() => addMutation.mutate()} disabled={!form.title || !form.text || addMutation.isPending} className="w-full bg-duo-green hover:bg-duo-green/90 text-white font-bold rounded-xl">
          {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Qo'shish"}
        </Button>
      </div>
      <ItemList items={items} isLoading={isLoading} onDelete={(id) => deleteMutation.mutate(id)} renderItem={(item: any) => (
        <div>
          <p className="font-bold text-foreground text-xs sm:text-sm">{item.title}</p>
          <p className="text-[11px] sm:text-xs text-muted-foreground">{item.level} • {item.text?.slice(0, 40)}...</p>
        </div>
      )} />
    </div>
  );
}

/* ========== VOCABULARY ========== */
function VocabularySection() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ word: '', translation: '', example: '', level: 'a1' });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-vocabulary'],
    queryFn: async () => {
      const { data } = await supabase.from('vocabulary_items').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('vocabulary_items').insert(form);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vocabulary'] });
      setForm({ word: '', translation: '', example: '', level: 'a1' });
      toast.success("So'z qo'shildi!");
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vocabulary_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vocabulary'] });
      toast.success("O'chirildi");
    },
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-2xl bg-card border border-border p-4 sm:p-5 space-y-3 sm:space-y-4">
        <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2"><Plus className="h-4 w-4" /> Yangi so'z</h3>
        <Input placeholder="Inglizcha so'z" value={form.word} onChange={(e) => setForm({ ...form, word: e.target.value })} />
        <Input placeholder="O'zbekcha tarjima" value={form.translation} onChange={(e) => setForm({ ...form, translation: e.target.value })} />
        <Textarea placeholder="Misol gap" value={form.example} onChange={(e) => setForm({ ...form, example: e.target.value })} />
        <LevelSelect value={form.level} onChange={(v) => setForm({ ...form, level: v })} />
        <Button onClick={() => addMutation.mutate()} disabled={!form.word || !form.translation || addMutation.isPending} className="w-full bg-duo-green hover:bg-duo-green/90 text-white font-bold rounded-xl">
          {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Qo'shish"}
        </Button>
      </div>
      <ItemList items={items} isLoading={isLoading} onDelete={(id) => deleteMutation.mutate(id)} renderItem={(item: any) => (
        <div>
          <p className="font-bold text-foreground text-xs sm:text-sm">{item.word} — {item.translation}</p>
          <p className="text-[11px] sm:text-xs text-muted-foreground">{item.level} • {item.example?.slice(0, 40)}</p>
        </div>
      )} />
    </div>
  );
}

/* ========== SHARED COMPONENTS ========== */
function LevelSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="a1">A1 — Boshlang'ich</SelectItem>
        <SelectItem value="a2">A2 — Elementar</SelectItem>
        <SelectItem value="b1">B1 — O'rta</SelectItem>
        <SelectItem value="b2">B2 — Yuqori o'rta</SelectItem>
        <SelectItem value="c1">C1 — Ilg'or</SelectItem>
      </SelectContent>
    </Select>
  );
}

function ItemList({
  items,
  isLoading,
  onDelete,
  renderItem,
}: {
  items: any[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  renderItem: (item: any) => React.ReactNode;
}) {
  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (items.length === 0) {
    return <p className="text-center text-sm text-muted-foreground py-8">Hozircha ma'lumot yo'q</p>;
  }

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-b border-border/50">
        <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Mavjud kontentlar ({items.length})
        </span>
      </div>
      {items.map((item: any) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors"
        >
          <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-duo-green shrink-0" />
          <div className="flex-1 min-w-0">{renderItem(item)}</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="shrink-0 text-red-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 p-0"
          >
            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
