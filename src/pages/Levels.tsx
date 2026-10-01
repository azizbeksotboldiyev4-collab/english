import { motion } from 'framer-motion';
import { LEVELS } from '@/data/lessons';
import LevelCard from '@/components/LevelCard';

export default function Levels() {
  return (
    <div className="container py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Darajalar</h1>
        <p className="mt-2 text-muted-foreground">
          A1 dan C1 gacha — o'z darajangizni tanlang va o'rganishni boshlang
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LEVELS.map((level, i) => (
          <motion.div
            key={level.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <LevelCard level={level} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
