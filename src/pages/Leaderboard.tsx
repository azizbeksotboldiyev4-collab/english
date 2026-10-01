import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Star, Flame, Crown, TrendingUp, Calendar, Zap, Award } from 'lucide-react';

const WEEKLY_LEADERS = [
  { name: 'Aziz K.', xp: 2450, level: 'B1', streak: 15, avatar: '👨‍💻', change: 0 },
  { name: 'Malika S.', xp: 2100, level: 'A2', streak: 12, avatar: '👩‍🎓', change: 1 },
  { name: 'Jasur T.', xp: 1800, level: 'A2', streak: 8, avatar: '🧑‍💼', change: -1 },
  { name: 'Dilnoza R.', xp: 1500, level: 'A2', streak: 10, avatar: '👩‍🏫', change: 2 },
  { name: 'Sardor M.', xp: 1200, level: 'A1', streak: 5, avatar: '👨‍🔬', change: 0 },
  { name: 'Nodira A.', xp: 950, level: 'A1', streak: 7, avatar: '👩‍💻', change: 3 },
  { name: 'Bekzod U.', xp: 800, level: 'A1', streak: 3, avatar: '🧑‍🎨', change: -2 },
  { name: 'Gulnora P.', xp: 650, level: 'A1', streak: 4, avatar: '👩‍🔧', change: 1 },
  { name: 'Sherzod B.', xp: 500, level: 'A1', streak: 2, avatar: '👨‍🎤', change: -1 },
  { name: 'Kamola N.', xp: 350, level: 'A1', streak: 1, avatar: '👩‍🎤', change: 0 },
];

const ALL_TIME_LEADERS = [
  { name: 'Farhod J.', xp: 15200, level: 'C1', streak: 90, avatar: '🏆', change: 0 },
  { name: 'Aziz K.', xp: 12800, level: 'B1', streak: 45, avatar: '👨‍💻', change: 0 },
  { name: 'Shahlo M.', xp: 11500, level: 'B2', streak: 60, avatar: '👩‍🏫', change: 1 },
  { name: 'Otabek R.', xp: 9800, level: 'B1', streak: 30, avatar: '🧑‍💼', change: -1 },
  { name: 'Malika S.', xp: 8500, level: 'A2', streak: 25, avatar: '👩‍🎓', change: 2 },
  { name: 'Jasur T.', xp: 7200, level: 'A2', streak: 20, avatar: '🧑‍💼', change: 0 },
  { name: 'Dilnoza R.', xp: 6800, level: 'A2', streak: 35, avatar: '👩‍🏫', change: -1 },
  { name: 'Sardor M.', xp: 5500, level: 'A1', streak: 15, avatar: '👨‍🔬', change: 1 },
  { name: 'Nodira A.', xp: 4200, level: 'A1', streak: 18, avatar: '👩‍💻', change: 0 },
  { name: 'Bekzod U.', xp: 3800, level: 'A1', streak: 10, avatar: '🧑‍🎨', change: 0 },
];

const podiumColors = [
  { bg: 'from-yellow-400 via-amber-400 to-orange-400', ring: 'ring-yellow-400/50', shadow: 'shadow-[0_0_30px_rgba(251,191,36,0.4)]', medal: '🥇' },
  { bg: 'from-slate-300 via-gray-300 to-slate-400', ring: 'ring-slate-300/50', shadow: 'shadow-[0_0_20px_rgba(148,163,184,0.3)]', medal: '🥈' },
  { bg: 'from-amber-600 via-orange-500 to-amber-700', ring: 'ring-amber-600/50', shadow: 'shadow-[0_0_20px_rgba(217,119,6,0.3)]', medal: '🥉' },
];

const tabs = [
  { id: 'weekly', label: 'Haftalik', icon: Calendar },
  { id: 'alltime', label: 'Umumiy', icon: Trophy },
];

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('weekly');
  const leaders = activeTab === 'weekly' ? WEEKLY_LEADERS : ALL_TIME_LEADERS;
  const top3 = leaders.slice(0, 3);

  return (
    <div className="container max-w-2xl py-6 md:py-10 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ duration: 1, delay: 0.3 }}
          className="inline-block mb-2"
        >
          <span className="text-5xl">🏆</span>
        </motion.div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
          Reyting jadvali
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Eng yaxshi o'quvchilar reytingi
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-8 bg-muted/50 rounded-2xl p-1.5"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === tab.id
                ? 'text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-duo-green rounded-xl shadow-lg"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Podium - Top 3 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + '-podium'}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="flex items-end justify-center gap-3 md:gap-6 mb-10"
        >
          {/* 2nd place */}
          <PodiumCard leader={top3[1]} place={2} delay={0.2} />
          {/* 1st place */}
          <PodiumCard leader={top3[0]} place={1} delay={0.1} />
          {/* 3rd place */}
          <PodiumCard leader={top3[2]} place={3} delay={0.3} />
        </motion.div>
      </AnimatePresence>

      {/* Weekly countdown badge */}
      {activeTab === 'weekly' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <div className="flex items-center gap-2 bg-duo-green/10 text-duo-green px-4 py-2 rounded-full text-xs font-bold">
            <Zap className="h-3.5 w-3.5" />
            Hafta tugashiga 3 kun qoldi
          </div>
        </motion.div>
      )}

      {/* Full List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + '-list'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl bg-card border border-border/50 shadow-xl overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-border/30 flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {activeTab === 'weekly' ? '📊 Haftalik reyting' : '👑 Barcha vaqt'}
            </span>
            <span className="text-xs text-muted-foreground">TOP 10</span>
          </div>

          {leaders.map((leader, i) => (
            <motion.div
              key={leader.name + i}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i + 0.2, type: 'spring', stiffness: 200 }}
              className={`group flex items-center gap-3 px-5 py-3.5 transition-all duration-300 hover:bg-primary/5 cursor-default ${
                i !== leaders.length - 1 ? 'border-b border-border/20' : ''
              } ${i < 3 ? 'bg-gradient-to-r from-duo-green/5 to-transparent' : ''}`}
            >
              {/* Rank */}
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold shrink-0 ${
                i === 0
                  ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-md'
                  : i === 1
                  ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-md'
                  : i === 2
                  ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {i + 1}
              </div>

              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.15, rotate: 5 }}
                className="text-2xl shrink-0"
              >
                {leader.avatar}
              </motion.div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {leader.name}
                  {i === 0 && <Crown className="inline h-3.5 w-3.5 ml-1 text-yellow-500" />}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                    {leader.level}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Flame className="h-3 w-3 text-orange-500" />
                    {leader.streak} kun
                  </span>
                </div>
              </div>

              {/* XP & Change */}
              <div className="text-right shrink-0">
                <p className="text-sm font-extrabold text-duo-green flex items-center gap-1 justify-end">
                  <Star className="h-3.5 w-3.5" />
                  {leader.xp.toLocaleString()}
                </p>
                {leader.change !== 0 && (
                  <span className={`text-[10px] font-bold ${
                    leader.change > 0 ? 'text-green-500' : 'text-red-400'
                  }`}>
                    {leader.change > 0 ? `▲ ${leader.change}` : `▼ ${Math.abs(leader.change)}`}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Your rank banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 rounded-2xl bg-gradient-to-r from-duo-green to-emerald-500 p-4 shadow-xl"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-2xl">
            🧑‍🎓
          </div>
          <div className="flex-1">
            <p className="text-xs text-white/70 font-medium">Sizning o'rningiz</p>
            <p className="text-lg font-extrabold text-white">#12</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/70">Keyingi o'ringa</p>
            <p className="text-sm font-bold text-white flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              150 XP kerak
            </p>
          </div>
        </div>
      </motion.div>

      {/* Motivational */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-xs text-muted-foreground mt-4 mb-20"
      >
        💪 Ko'proq dars o'qing va reytingda yuqoriga ko'taring!
      </motion.p>
    </div>
  );
}

function PodiumCard({
  leader,
  place,
  delay,
}: {
  leader: (typeof WEEKLY_LEADERS)[0];
  place: 1 | 2 | 3;
  delay: number;
}) {
  const idx = place - 1;
  const config = podiumColors[idx];
  const isFirst = place === 1;
  const podiumH = isFirst ? 'h-28' : place === 2 ? 'h-20' : 'h-14';
  const avatarSize = isFirst ? 'text-4xl h-20 w-20' : 'text-3xl h-16 w-16';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 15 }}
      className={`flex flex-col items-center ${isFirst ? 'order-2 -mt-4' : place === 2 ? 'order-1' : 'order-3'}`}
    >
      {/* Crown for 1st */}
      {isFirst && (
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-1"
        >
          <Crown className="h-7 w-7 text-yellow-400 drop-shadow-lg" />
        </motion.div>
      )}

      {/* Avatar circle */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        className={`relative flex items-center justify-center rounded-full ring-4 ${config.ring} ${config.shadow} bg-card ${avatarSize} mb-2`}
      >
        <span>{leader.avatar}</span>
        <div className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${config.bg} text-[10px] font-extrabold text-white shadow-lg`}>
          {place}
        </div>
      </motion.div>

      {/* Name & XP */}
      <p className="text-xs font-extrabold text-foreground text-center max-w-[80px] truncate">
        {leader.name}
      </p>
      <p className="text-[11px] font-bold text-duo-green flex items-center gap-0.5">
        <Star className="h-3 w-3" />
        {leader.xp.toLocaleString()}
      </p>

      {/* Podium bar */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: 'auto' }}
        transition={{ delay: delay + 0.2, duration: 0.4, ease: 'easeOut' }}
        className={`mt-2 ${podiumH} w-20 md:w-24 rounded-t-2xl bg-gradient-to-b ${config.bg} flex items-center justify-center shadow-lg`}
      >
        <span className="text-2xl">{config.medal}</span>
      </motion.div>
    </motion.div>
  );
}
