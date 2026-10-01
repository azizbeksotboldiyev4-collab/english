import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Map, Swords, Gem, Lock, Check, ChevronRight, Trophy, Coins,
  Flame, Zap, Star, X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProgress } from '@/hooks/useProgress';
import { ADVENTURE_LEVELS, AdvLevel, AdvTask } from '@/data/adventureData';
import { loadStore, updateStore, grantAchievement, logGame, ACHIEVEMENTS } from '@/lib/gameStore';
import { toast } from 'sonner';

type Tab = 'xarita' | 'bosslar' | 'xazina';

function levelOf(xp: number) {
  return Math.floor(xp / 200) + 1;
}

export default function Adventure() {
  const { progress, addXp } = useProgress();
  const [tab, setTab] = useState<Tab>('xarita');
  const [tick, setTick] = useState(0);
  const store = useMemo(() => loadStore(), [tick]);
  const [battle, setBattle] = useState<{ level: AdvLevel; task?: AdvTask; boss?: boolean } | null>(null);

  const unlocked = (lvl: AdvLevel, i: number) =>
    i === 0 || store.defeatedBosses.includes(ADVENTURE_LEVELS[i - 1].id);

  function award(xp: number, coins: number, name: string) {
    const before = levelOf(progress.xp);
    addXp(xp);
    logGame(name, xp, coins);
    setTick((t) => t + 1);
    if (levelOf(progress.xp + xp) > before) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      toast.success('LEVEL UP! 🎉');
    }
  }

  function finishTask(level: AdvLevel, task: AdvTask, percent: number) {
    if (percent >= 60) {
      const key = `${level.id}:${task.id}`;
      if (!store.completedNodes.includes(key)) {
        updateStore((d) => ({ ...d, completedNodes: [...d.completedNodes, key] }));
      }
      if (task.id === 'grammar') {
        const count = loadStore().completedNodes.filter((n) => n.endsWith(':grammar')).length;
        if (count >= 5 && grantAchievement('grammar-explorer')) toast.success('📚 Yangi yutuq: Grammar Explorer!');
      }
      if (grantAchievement('adventure-starter')) toast.success('🗺️ Yangi yutuq: Adventure Starter!');
      award(task.xp, Math.round(task.xp / 4), `Adventure ${task.label}`);
    }
    setBattle(null);
    setTick((t) => t + 1);
  }

  function finishBoss(level: AdvLevel, percent: number) {
    if (percent >= 80) {
      if (!loadStore().defeatedBosses.includes(level.id)) {
        updateStore((d) => ({ ...d, defeatedBosses: [...d.defeatedBosses, level.id] }));
      }
      if (grantAchievement('first-victory')) toast.success('🏆 Yangi yutuq: First Victory!');
      const all = loadStore().defeatedBosses;
      if (ADVENTURE_LEVELS.every((l) => all.includes(l.id)) && grantAchievement('english-master')) {
        toast.success('👑 Yangi yutuq: English Master!');
      }
      confetti({ particleCount: 160, spread: 100, origin: { y: 0.6 } });
      award(100, 50, `Boss ${level.boss}`);
    }
    setBattle(null);
    setTick((t) => t + 1);
  }

  if (battle) {
    return (
      <Battle
        level={battle.level}
        task={battle.task}
        isBoss={!!battle.boss}
        onExit={() => setBattle(null)}
        onFinish={(p) => (battle.boss ? finishBoss(battle.level, p) : finishTask(battle.level, battle.task!, p))}
      />
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-6 md:py-10">
        <Link to="/games" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> O'yinlar
        </Link>

        <div className="mt-4 rounded-3xl border border-border/60 bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 p-5 md:p-6 text-white shadow-elevated">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/25 backdrop-blur-md border border-white/30 text-2xl">🏔️</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Adventure Mode</h1>
              <p className="text-sm text-white/85">Sarguzasht dunyosida ingliz tilini kashf eting</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            <MiniStat label="XP" value={progress.xp} />
            <MiniStat label="Level" value={levelOf(progress.xp)} />
            <MiniStat label="Coins" value={store.coins} />
            <MiniStat label="Streak" value={progress.streak} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {([['xarita', 'XARITA', Map], ['bosslar', 'BOSSLAR', Swords], ['xazina', 'XAZINA', Gem]] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id as Tab)}
              className={`min-h-[52px] rounded-2xl border px-2 py-3 text-[11px] md:text-xs font-extrabold uppercase tracking-wider transition-all ${
                tab === id
                  ? 'border-transparent bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                  : 'border-border/60 bg-card/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="mx-auto mb-1 h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'xarita' && (
            <motion.div key="m" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 space-y-4">
              {ADVENTURE_LEVELS.map((lvl, i) => {
                const open = unlocked(lvl, i);
                const done = store.defeatedBosses.includes(lvl.id);
                const current = open && !done;
                return (
                  <div key={lvl.id} className="relative">
                    {i > 0 && <div className="absolute -top-4 left-8 h-4 w-0.5 bg-border" />}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`relative overflow-hidden rounded-3xl border p-4 md:p-5 backdrop-blur-xl ${
                        open ? 'border-border/60 bg-card/70' : 'border-border/40 bg-card/40 opacity-70'
                      } ${current ? 'ring-2 ring-cyan-400/70' : ''}`}
                    >
                      {current && (
                        <motion.div
                          animate={{ opacity: [0.15, 0.35, 0.15] }}
                          transition={{ repeat: Infinity, duration: 2.4 }}
                          className={`absolute inset-0 -z-10 bg-gradient-to-br ${lvl.gradient}`}
                        />
                      )}
                      <div className="flex items-center gap-3">
                        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${lvl.gradient} text-white shadow-lg`}>
                          {done ? <Check className="h-6 w-6" /> : open ? <span className="text-lg font-extrabold">{lvl.id.toUpperCase()}</span> : <Lock className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-lg font-extrabold">{lvl.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {done ? '✅ Yakunlangan' : open ? 'Ochiq — mashqlarni boshlang' : `🔒 ${ADVENTURE_LEVELS[i - 1].boss}ni yenging`}
                          </div>
                        </div>
                      </div>

                      {open && (
                        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {lvl.tasks.map((t) => {
                            const ok = store.completedNodes.includes(`${lvl.id}:${t.id}`);
                            return (
                              <button
                                key={t.id}
                                onClick={() => setBattle({ level: lvl, task: t })}
                                className={`min-h-[52px] rounded-2xl border px-3 py-2 text-left text-xs font-bold transition-all ${
                                  ok ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-border/60 bg-muted/50 hover:bg-muted'
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span>{t.emoji}</span>
                                  <span className="truncate">{t.label}</span>
                                  {ok && <Check className="ml-auto h-3.5 w-3.5 text-emerald-500" />}
                                </div>
                                <div className="mt-0.5 text-[10px] text-muted-foreground">+{t.xp} XP</div>
                              </button>
                            );
                          })}
                          <button
                            onClick={() => setBattle({ level: lvl, boss: true })}
                            className="min-h-[52px] rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 px-3 py-2 text-left text-xs font-extrabold text-white"
                          >
                            <div className="flex items-center gap-1.5">{lvl.bossEmoji} <span className="truncate">{lvl.boss}</span></div>
                            <div className="mt-0.5 text-[10px] text-white/80">+100 XP</div>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {tab === 'bosslar' && (
            <motion.div key="b" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 space-y-3">
              {ADVENTURE_LEVELS.map((lvl, i) => {
                const open = unlocked(lvl, i);
                const done = store.defeatedBosses.includes(lvl.id);
                return (
                  <div key={lvl.id} className={`flex items-center gap-3 rounded-3xl border border-border/60 bg-card/70 p-4 backdrop-blur-xl ${open ? '' : 'opacity-60'}`}>
                    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${lvl.gradient} text-2xl`}>{lvl.bossEmoji}</div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-extrabold">{lvl.boss}</div>
                      <div className="text-xs text-muted-foreground">{lvl.id.toUpperCase()} • 80% talab qilinadi</div>
                    </div>
                    {done ? (
                      <span className="shrink-0 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-extrabold text-emerald-500">🏆 Yengilgan</span>
                    ) : open ? (
                      <button onClick={() => setBattle({ level: lvl, boss: true })} className="shrink-0 inline-flex min-h-[44px] items-center gap-1 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 px-4 text-sm font-extrabold text-white">
                        Jang <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <Lock className="h-5 w-5 shrink-0 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}

          {tab === 'xazina' && (
            <motion.div key="t" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Treasure icon={Zap} label="XP" value={progress.xp} tint="from-amber-400 to-orange-500" />
                <Treasure icon={Coins} label="Coins" value={store.coins} tint="from-yellow-400 to-amber-500" />
                <Treasure icon={Star} label="Level" value={levelOf(progress.xp)} tint="from-violet-500 to-fuchsia-500" />
                <Treasure icon={Flame} label="Streak" value={progress.streak} tint="from-rose-500 to-red-500" />
              </div>

              <div className="rounded-3xl border border-border/60 bg-card/70 p-4 backdrop-blur-xl">
                <div className="mb-3 text-sm font-extrabold">🏅 Yutuqlar</div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {ACHIEVEMENTS.map((a) => {
                    const got = store.achievements.includes(a.id);
                    return (
                      <div key={a.id} className={`rounded-2xl border p-3 ${got ? 'border-amber-400/60 bg-amber-400/10' : 'border-border/50 bg-muted/40 opacity-60'}`}>
                        <div className="text-2xl">{a.emoji}</div>
                        <div className="mt-1 text-xs font-extrabold">{a.label}</div>
                        <div className="text-[10px] text-muted-foreground">{a.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-border/60 bg-card/70 p-4 backdrop-blur-xl">
                <div className="mb-2 text-sm font-extrabold">🎁 Level mukofotlari</div>
                <div className="space-y-2">
                  {ADVENTURE_LEVELS.map((l) => (
                    <div key={l.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{l.name}</span>
                      <span className="font-extrabold">{store.defeatedBosses.includes(l.id) ? '✅ +100 XP' : '🔒'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-border/60 bg-card/70 p-4 backdrop-blur-xl">
                <div className="mb-2 text-sm font-extrabold">📜 O'yin tarixi</div>
                {store.history.length === 0 && <div className="text-sm text-muted-foreground">Hali o'yin yo'q.</div>}
                {store.history.slice(0, 8).map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate text-muted-foreground">{h.game}</span>
                    <span className="font-extrabold">+{h.xp} XP</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/15 px-2 py-2 backdrop-blur-md">
      <div className="text-[10px] font-bold uppercase tracking-wider text-white/80">{label}</div>
      <div className="text-lg font-extrabold">{value.toLocaleString()}</div>
    </div>
  );
}

function Treasure({ icon: Icon, label, value, tint }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; tint: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl">
      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${tint} opacity-10`} />
      <div className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${tint} text-white`}><Icon className="h-4 w-4" /></div>
      <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xl font-extrabold">{value.toLocaleString()}</div>
    </div>
  );
}

function Battle({ level, task, isBoss, onExit, onFinish }: {
  level: AdvLevel; task?: AdvTask; isBoss: boolean; onExit: () => void; onFinish: (percent: number) => void;
}) {
  const questions = isBoss ? level.bossQuestions : task!.questions;
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const percent = Math.round((correct / questions.length) * 100);
  const passed = percent >= (isBoss ? 80 : 60);

  function pick(idx: number) {
    if (picked !== null) return;
    setPicked(idx);
    const ok = idx === questions[i].answer;
    if (ok) setCorrect((c) => c + 1);
    setTimeout(() => {
      if (i + 1 >= questions.length) setDone(true);
      else { setI(i + 1); setPicked(null); }
    }, 800);
  }

  function retry() {
    setI(0); setPicked(null); setCorrect(0); setDone(false);
  }

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto max-w-2xl px-4 py-6 md:py-10">
        <button onClick={onExit} className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" /> Chiqish
        </button>

        <div className={`mt-4 rounded-3xl bg-gradient-to-br ${isBoss ? 'from-rose-500 to-red-600' : level.gradient} p-5 text-white shadow-elevated`}>
          <div className="text-3xl">{isBoss ? level.bossEmoji : task!.emoji}</div>
          <div className="text-xl font-extrabold">{isBoss ? level.boss : `${level.id.toUpperCase()} — ${task!.label}`}</div>
          <div className="text-sm text-white/85">{isBoss ? "G'alaba uchun 80% kerak" : "O'tish uchun 60% kerak"}</div>
        </div>

        {!done ? (
          <div className="mt-5">
            <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" animate={{ width: `${((i) / questions.length) * 100}%` }} />
            </div>
            <div className="mb-3 text-xs font-bold text-muted-foreground">Savol {i + 1} / {questions.length}</div>
            <div className="rounded-3xl border border-border/60 bg-card/70 p-5 backdrop-blur-xl">
              <div className="text-lg font-extrabold">{questions[i].q}</div>
              <div className="mt-4 space-y-2">
                {questions[i].options.map((o, idx) => {
                  const isAnswer = idx === questions[i].answer;
                  const state = picked === null ? '' : isAnswer ? 'border-emerald-500 bg-emerald-500/15' : picked === idx ? 'border-rose-500 bg-rose-500/15' : 'opacity-60';
                  return (
                    <button
                      key={idx}
                      onClick={() => pick(idx)}
                      className={`w-full min-h-[52px] rounded-2xl border border-border/60 bg-muted/50 px-4 text-left text-sm font-bold transition-all hover:bg-muted ${state}`}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mt-5 rounded-3xl border border-border/60 bg-card/70 p-6 text-center backdrop-blur-xl">
            <div className="text-5xl">{passed ? '🏆' : '💪'}</div>
            <div className="mt-2 text-2xl font-extrabold">
              {passed ? (isBoss ? 'Boss Defeated!' : 'Yakunlandi!') : 'Try Again'}
            </div>
            <div className="mt-1 text-muted-foreground">{correct} / {questions.length} • {percent}%</div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button onClick={retry} className="min-h-[52px] rounded-2xl border border-border/60 bg-muted/60 text-sm font-extrabold">Qayta urinish</button>
              <button onClick={() => onFinish(percent)} className="min-h-[52px] rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-extrabold text-white">
                {passed ? 'Mukofotni olish' : 'Xaritaga qaytish'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
