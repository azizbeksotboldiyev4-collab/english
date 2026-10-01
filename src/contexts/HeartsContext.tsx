import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface HeartsContextType {
  hearts: number;
  maxHearts: number;
  loseHeart: () => boolean; // returns false if no hearts left
  refillHearts: () => void;
  nextRefillAt: number | null; // timestamp
  isAlive: boolean;
  timeToRefill: string;
}

const MAX_HEARTS = 5;
const REFILL_MS = 30 * 60 * 1000; // 30 minutes per heart

const HeartsContext = createContext<HeartsContextType>({
  hearts: MAX_HEARTS,
  maxHearts: MAX_HEARTS,
  loseHeart: () => true,
  refillHearts: () => {},
  nextRefillAt: null,
  isAlive: true,
  timeToRefill: '',
});

function loadHearts(): { hearts: number; lastLostAt: number | null } {
  try {
    const raw = localStorage.getItem('linguo-hearts');
    if (raw) {
      const data = JSON.parse(raw);
      return { hearts: data.hearts ?? MAX_HEARTS, lastLostAt: data.lastLostAt ?? null };
    }
  } catch {}
  return { hearts: MAX_HEARTS, lastLostAt: null };
}

function saveHearts(hearts: number, lastLostAt: number | null) {
  localStorage.setItem('linguo-hearts', JSON.stringify({ hearts, lastLostAt }));
}

export function HeartsProvider({ children }: { children: ReactNode }) {
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [lastLostAt, setLastLostAt] = useState<number | null>(null);
  const [timeToRefill, setTimeToRefill] = useState('');

  // Load on mount + calculate refilled hearts
  useEffect(() => {
    const saved = loadHearts();
    let h = saved.hearts;
    const lost = saved.lastLostAt;

    if (h < MAX_HEARTS && lost) {
      const elapsed = Date.now() - lost;
      const refilled = Math.floor(elapsed / REFILL_MS);
      h = Math.min(MAX_HEARTS, h + refilled);
    }

    setHearts(h);
    setLastLostAt(h < MAX_HEARTS ? (saved.lastLostAt ?? null) : null);
    saveHearts(h, h < MAX_HEARTS ? saved.lastLostAt : null);
  }, []);

  // Timer for refill countdown
  useEffect(() => {
    if (hearts >= MAX_HEARTS || !lastLostAt) {
      setTimeToRefill('');
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastLostAt;
      const heartsRefilled = Math.floor(elapsed / REFILL_MS);
      
      if (hearts + heartsRefilled >= MAX_HEARTS) {
        setHearts(MAX_HEARTS);
        setLastLostAt(null);
        saveHearts(MAX_HEARTS, null);
        setTimeToRefill('');
        return;
      }

      if (heartsRefilled > 0) {
        const newHearts = hearts + heartsRefilled;
        setHearts(newHearts);
        saveHearts(newHearts, lastLostAt);
      }

      const nextRefillIn = REFILL_MS - (elapsed % REFILL_MS);
      const mins = Math.floor(nextRefillIn / 60000);
      const secs = Math.floor((nextRefillIn % 60000) / 1000);
      setTimeToRefill(`${mins}:${secs.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [hearts, lastLostAt]);

  const loseHeart = useCallback(() => {
    if (hearts <= 0) return false;
    const newHearts = hearts - 1;
    const now = Date.now();
    setHearts(newHearts);
    setLastLostAt(now);
    saveHearts(newHearts, now);
    return true;
  }, [hearts]);

  const refillHearts = useCallback(() => {
    setHearts(MAX_HEARTS);
    setLastLostAt(null);
    saveHearts(MAX_HEARTS, null);
  }, []);

  return (
    <HeartsContext.Provider value={{
      hearts,
      maxHearts: MAX_HEARTS,
      loseHeart,
      refillHearts,
      nextRefillAt: lastLostAt ? lastLostAt + REFILL_MS : null,
      isAlive: hearts > 0,
      timeToRefill,
    }}>
      {children}
    </HeartsContext.Provider>
  );
}

export const useHearts = () => useContext(HeartsContext);
