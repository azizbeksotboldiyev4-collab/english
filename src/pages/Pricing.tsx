import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DemoPaymentModal from '@/components/DemoPaymentModal';
import { usePremium } from '@/contexts/PremiumContext';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    icon: Zap,
    gradient: 'from-muted to-secondary',
    features: [
      'A1 daraja darslari',
      'Asosiy grammatika',
      'Cheklangan AI Ustoz (3 xabar/kun)',
      'So\'z o\'yini',
    ],
    limitations: [
      'B1-C1 darajalar bloklangan',
      'Speaking mashqlari yo\'q',
      'Podkastlar yo\'q',
      'Aziko lug\'at yo\'q',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 25,
    icon: Star,
    gradient: 'from-primary to-accent',
    popular: true,
    features: [
      'A1-B2 daraja darslari',
      'AI Ustoz cheksiz',
      'Speaking mashqlari',
      'AI Podkastlar',
      'Eshitib yozish',
      'Aziko aqlli lug\'at',
    ],
    limitations: [
      'C1 daraja bloklangan',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 80,
    icon: Crown,
    gradient: 'from-amber-500 to-orange-500',
    features: [
      'A1-C1 barcha darajalar',
      'AI Ustoz cheksiz + shaxsiy mentoring',
      'Speaking + talaffuz baho',
      'AI Podkastlar + transkripsiya',
      'Eshitib yozish + tuzatish',
      'Aziko lug\'at + flashcardlar',
      'Sertifikat olish imkoni',
      'Ustuvor qo\'llab-quvvatlash',
    ],
    limitations: [],
  },
];

export default function Pricing() {
  const { isPremium, premiumPlan } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);

  return (
    <div className="container py-12 space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          O'zingizga mos rejani tanlang
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Ingliz tilini professional darajada o'rganish uchun premium imkoniyatlarni oching
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map((plan, i) => {
          const isActive = isPremium && premiumPlan === plan.id;
          const Icon = plan.icon;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 flex flex-col transition-all duration-300 ${
                plan.popular
                  ? 'glass-strong shadow-elevated border-2 border-primary/30 scale-[1.02]'
                  : 'glass shadow-card'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-4 py-1 text-xs font-semibold text-primary-foreground shadow-soft">
                  Eng mashhur
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${plan.gradient} shadow-soft`}>
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{plan.name}</h3>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                {plan.price > 0 && <span className="text-muted-foreground text-sm">/oy</span>}
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-card-foreground">{f}</span>
                  </li>
                ))}
                {plan.limitations.map(l => (
                  <li key={l} className="flex items-start gap-2 text-sm">
                    <span className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0 text-center">✕</span>
                    <span className="text-muted-foreground line-through">{l}</span>
                  </li>
                ))}
              </ul>

              {isActive ? (
                <Button disabled className="w-full rounded-xl h-11">
                  <Crown className="h-4 w-4 mr-2" /> Faol
                </Button>
              ) : plan.price === 0 ? (
                <Button variant="outline" disabled className="w-full rounded-xl h-11">
                  Hozirgi reja
                </Button>
              ) : (
                <Button
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full rounded-xl h-11 font-semibold ${
                    plan.popular ? 'bg-gradient-primary text-primary-foreground shadow-soft hover:shadow-elevated' : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  Faollashtirish
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground italic">
        This is a demo payment simulation for presentation purposes.
      </p>

      {selectedPlan && (
        <DemoPaymentModal
          open={!!selectedPlan}
          onOpenChange={(o) => !o && setSelectedPlan(null)}
          plan={selectedPlan}
        />
      )}
    </div>
  );
}
