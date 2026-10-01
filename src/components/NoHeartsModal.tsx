import { motion } from 'framer-motion';
import { Heart, Clock } from 'lucide-react';
import { useHearts } from '@/contexts/HeartsContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function NoHeartsModal() {
  const { timeToRefill } = useHearts();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="bg-card rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-border"
      >
        <div className="flex justify-center mb-4">
          {[0, 1, 2].map(i => (
            <Heart key={i} className="h-8 w-8 text-muted-foreground/20 -mx-0.5" />
          ))}
        </div>

        <h2 className="text-xl font-extrabold text-card-foreground mb-2">
          Yuraklar tugadi! 💔
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Xato javoblar uchun yuraklar sarflandi. Biroz kutib turing yoki mashq qiling.
        </p>

        {timeToRefill && (
          <div className="flex items-center justify-center gap-2 mb-6 text-duo-blue">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-bold">Keyingi yurak: {timeToRefill}</span>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full btn-duo bg-primary text-primary-foreground font-extrabold"
            style={{ boxShadow: '0 4px 0 0 hsl(145, 63%, 32%)' }}
          >
            Bosh sahifaga qaytish
          </Button>
          <Button
            onClick={() => navigate('/vocab-game')}
            variant="outline"
            className="w-full rounded-2xl font-bold"
          >
            So'z o'yinida mashq qilish
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
