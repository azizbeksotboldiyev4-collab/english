import { Heart } from 'lucide-react';
import { useHearts } from '@/contexts/HeartsContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeartsDisplay({ compact = false }: { compact?: boolean }) {
  const { hearts, maxHearts, timeToRefill } = useHearts();

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Heart className={`h-4 w-4 ${hearts > 0 ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} />
        <span className={`text-xs font-extrabold ${hearts > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
          {hearts}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-0.5">
        {Array.from({ length: maxHearts }).map((_, i) => (
          <AnimatePresence key={i} mode="wait">
            <motion.div
              key={i < hearts ? 'full' : 'empty'}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0, rotate: -30 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              <Heart
                className={`h-5 w-5 transition-colors ${
                  i < hearts ? 'text-red-500 fill-red-500' : 'text-muted-foreground/30'
                }`}
              />
            </motion.div>
          </AnimatePresence>
        ))}
      </div>
      {timeToRefill && (
        <span className="text-[10px] text-muted-foreground">
          +1 ❤️ {timeToRefill}
        </span>
      )}
    </div>
  );
}
