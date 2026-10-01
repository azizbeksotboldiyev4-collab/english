import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Zap, Puzzle, Brain, Mic, Mountain, Trophy, Coins, Star, Flame, ChevronRight, Sparkles } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';

interface GameDef {
  id: string;
  to: string;
  title: string;
  tagline: string;
  emoji: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  glow: string;
  tags: string[];
  ready: boolean;
  featured?: boolean;
  cta?: string;
}

const GAMES: GameDef[] = [
  {
    id: 'word-hunt',
    to: '/games/word-hunt',
    title: 'Word Hunt',
    tagline: "Panjaradan yashirin so'zlarni topib oling",
    emoji: '⭐',
    icon: Search,
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    glow: 'shadow-[0_20px_60px_-15px_rgba(251,146,60,0.55)]',
    tags: ['Taymer', 'Kombolar', 'Kunlik chaqiruv'],
    ready: true,
    featured: true,
  },
  {
    id: 'speed',
    to: '/games/speed',
    title: 'Speed Challenge',
    tagline: '60 soniyada maksimal ballni to\'plang',
    emoji: '⚡',
    icon: Zap,
    gradient: 'from-yellow-400 via-amber-500 to-orange-500',
    glow: 'shadow-[0_20px_60px_-15px_rgba(234,179,8,0.55)]',
    tags: ['60s', 'Combo x5', 'Reyting'],
    ready: true,
  },
  {
    id: 'drag-match',
    to: '/games/drag-match',
    title: 'Drag & Match',
    tagline: "So'zlarni tarjimasi bilan bog'lang",
    emoji: '🧩',
    icon: Puzzle,
    gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
    glow: 'shadow-[0_20px_60px_-15px_rgba(16,185,129,0.55)]',
    tags: ['Sudrash', 'Yulduzlar', 'Levellar'],
    ready: true,
  },
  {
    id: 'memory',
    to: '/games/memory',
    title: 'Memory Cards',
    tagline: 'Juftlarni toping va xotirangizni sinang',
    emoji: '🧠',
    icon: Brain,
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    glow: 'shadow-[0_20px_60px_-15px_rgba(168,85,247,0.55)]',
    tags: ['Flip', 'Vaqt bonusi', 'Mavzular'],
    ready: true,
  },
  {
    id: 'pronunciation',
    to: '/games/pronunciation',
    title: 'Pronunciation',
    tagline: "AI baho beruvchi talaffuz o'yini",
    emoji: '🎤',
    icon: Mic,
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    glow: 'shadow-[0_20px_60px_-15px_rgba(244,63,94,0.55)]',
    tags: ['Nutq', 'Baho', 'Yozib olish'],
    ready: true,
    cta: "Ko'rib chiqish",
  },
  {
    id: 'adventure',
    to: '/games/adventure',
    title: 'Adventure Mode',
    tagline: 'Sarguzasht dunyosida ingliz tilini kashf eting',
    emoji: '🏔️',
    icon: Mountain,
    gradient: 'from-indigo-500 via-blue-600 to-cyan-500',
    glow: 'shadow-[0_20px_60px_-15px_rgba(99,102,241,0.55)]',
    tags: ['Xarita', 'Bosslar', "Xazina"],
    ready: true,
    cta: "Ko'rib chiqish",
  },
];

const RANKS = [
  { name: 'Bronze', color: 'from-amber-700 to-amber-900', min: 0 },
  { name: 'Silver', color: 'from-slate-300 to-slate-500', min: 500 },
  { name: 'Gold', color: 'from-yellow-400 to-amber-500', min: 1500 },
  { name: 'Platinum', color: 'from-cyan-300 to-teal-500', min: 3500 },
  { name: 'Diamond', color: 'from-sky-400 to-indigo-500', min: 7000 },
  { name: 'Master', color: 'from-fuchsia-500 to-purple-600', min: 12000 },
  { name: 'Legend', color: 'from-rose-500 to-red-600', min: 20000 },
  { name: 'Grandmaster', color: 'from-orange-400 via-pink-500 to-purple-600', min: 35000 },
];

function getRank(xp: number) {
  let current = RANKS[0];
  for (const r of RANKS) if (xp >= r.min) current = r;
  return current;
}

export default function Games() {
  const { progress } = useProgress();
  const rank = getRank(progress.xp);
  const nextRank = RANKS[RANKS.findIndex((r) => r.name === rank.name) + 1];
  const rankProgress = nextRank
    ? Math.min(100, ((progress.xp - rank.min) / (nextRank.min - rank.min)) * 100)
    : 100;

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      {/* Ambient bg */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute top-40 right-0 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1.5 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Premium o'yin markazi
            </span>
          </div>
          <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
              🎮 English Games
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-base md:text-lg text-muted-foreground">
            Ingliz tilini qiziqarli interaktiv o'yinlar orqali o'rganing.
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8"
        >
          <StatTile icon={Zap} label="XP" value={progress.xp} tint="from-amber-400 to-orange-500" />
          <StatTile icon={Flame} label="Streak" value={progress.streak} tint="from-rose-500 to-red-500" />
          <StatTile icon={Coins} label="Coinlar" value={Math.floor(progress.xp / 5)} tint="from-yellow-400 to-amber-500" />
          <StatTile icon={Star} label="O'yin darajasi" value={Math.floor(progress.xp / 200) + 1} tint="from-violet-500 to-fuchsia-500" />
        </motion.div>

        {/* Rank card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8 rounded-3xl border border-border/60 bg-card/60 p-5 md:p-6 backdrop-blur-xl shadow-elevated"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${rank.color} text-white shadow-xl`}>
                <Trophy className="h-7 w-7" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sizning darajangiz</div>
                <div className="text-2xl font-extrabold">{rank.name}</div>
              </div>
            </div>
            {nextRank && (
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Keyingi: <span className="font-bold text-foreground">{nextRank.name}</span></div>
                <div className="text-sm font-bold">{nextRank.min - progress.xp} XP qoldi</div>
              </div>
            )}
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${rankProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full bg-gradient-to-r ${rank.color}`}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {RANKS.map((r) => (
              <span
                key={r.name}
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${
                  r.name === rank.name
                    ? `bg-gradient-to-r ${r.color} text-white border-transparent`
                    : 'border-border/60 text-muted-foreground'
                }`}
              >
                {r.name}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Games grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {GAMES.map((g, i) => (
            <GameCard key={g.id} game={g} index={i} />
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-10 text-center text-xs text-muted-foreground">
          Har kuni o'ynang — XP, coin va yulduzlar oling. 🏆
        </div>
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tint: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl shadow-card"
    >
      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${tint} opacity-10 group-hover:opacity-20 transition-opacity`} />
      <div className="flex items-center gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${tint} text-white shadow-md`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="text-xl font-extrabold leading-tight">{value.toLocaleString()}</div>
        </div>
      </div>
    </motion.div>
  );
}

function GameCard({ game, index }: { game: GameDef; index: number }) {
  const Icon = game.icon;
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.4 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className={`group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-card/60 backdrop-blur-xl transition-all ${game.glow} ${
        game.featured ? 'md:col-span-2 lg:col-span-2' : ''
      }`}
    >
      {/* Gradient blob */}
      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${game.gradient} opacity-90`} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/20 blur-3xl group-hover:bg-white/30 transition-colors" />

      <div className={`relative p-5 md:p-6 min-h-[220px] flex flex-col ${game.featured ? 'md:min-h-[260px]' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/25 backdrop-blur-md border border-white/30 text-white shadow-lg">
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-1.5">
            {game.featured && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-white/25 text-white backdrop-blur-md">
                ⭐ Yulduz
              </span>
            )}
            {!game.ready && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-black/40 text-white backdrop-blur-md">
                Tez orada
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto">
          <div className="text-4xl md:text-5xl mb-2">{game.emoji}</div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {game.title}
          </h3>
          <p className="mt-1 text-sm text-white/85 max-w-md">{game.tagline}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {game.tags.map((t) => (
              <span
                key={t}
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-white/20 text-white border border-white/25 backdrop-blur-md"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-slate-900 shadow-lg group-hover:shadow-2xl transition-shadow">
            {game.cta ?? "O'ynash"}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (!game.ready) {
    return <div className={game.featured ? 'md:col-span-2 lg:col-span-2' : ''}>{inner}</div>;
  }
  return (
    <Link to={game.to} className={game.featured ? 'md:col-span-2 lg:col-span-2 block' : 'block'}>
      {inner}
    </Link>
  );
}