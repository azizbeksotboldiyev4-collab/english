import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PremiumContextType {
  isPremium: boolean;
  premiumPlan: string | null;
  loading: boolean;
}

const PremiumContext = createContext<PremiumContextType>({
  isPremium: false,
  premiumPlan: null,
  loading: true,
});

export function PremiumProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [premiumPlan, setPremiumPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsPremium(false);
      setPremiumPlan(null);
      setLoading(false);
      return;
    }

    const fetchPremium = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('is_premium, premium_plan')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setIsPremium(data.is_premium);
        setPremiumPlan(data.premium_plan);
      }
      setLoading(false);
    };

    fetchPremium();
  }, [user]);

  return (
    <PremiumContext.Provider value={{ isPremium, premiumPlan, loading }}>
      {children}
    </PremiumContext.Provider>
  );
}

export const usePremium = () => useContext(PremiumContext);
