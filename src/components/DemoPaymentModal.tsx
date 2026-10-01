import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CreditCard, Lock, CheckCircle2, Loader2, Shield } from 'lucide-react';

interface DemoPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: { name: string; price: number; id: string };
}

export default function DemoPaymentModal({ open, onOpenChange, plan }: DemoPaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

  const formatCard = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const isValid = cardNumber.replace(/\s/g, '').length === 16 && expiry.length === 5 && cvv.length >= 3;

  const handlePay = async () => {
    setStep('processing');
    await new Promise(r => setTimeout(r, 2000));
    setStep('success');
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep('form');
      setCardNumber('');
      setExpiry('');
      setCvv('');
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md glass-strong border-border/50">
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-foreground">
                  <CreditCard className="h-5 w-5 text-primary" />
                  {plan.name} — ${plan.price}/oy
                </DialogTitle>
                <DialogDescription>
                  Premium imkoniyatlarni faollashtirish
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Karta raqami</label>
                  <div className="relative">
                    <Input
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={e => setCardNumber(formatCard(e.target.value))}
                      className="pl-10"
                    />
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amal qilish</label>
                    <Input
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={e => setExpiry(formatExpiry(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">CVV</label>
                    <div className="relative">
                      <Input
                        placeholder="123"
                        type="password"
                        maxLength={4}
                        value={cvv}
                        onChange={e => setCvv(e.target.value.replace(/\D/g, ''))}
                        className="pl-10"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePay}
                  disabled={!isValid}
                  className="w-full bg-gradient-primary text-primary-foreground font-semibold h-11 rounded-xl shadow-soft hover:shadow-elevated transition-all"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  ${plan.price} to'lash
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  Bu demo to'lov simulyatsiyasidir. Haqiqiy pul yechilmaydi.
                </div>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-12 gap-4"
            >
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-lg font-semibold text-foreground">To'lov amalga oshirilmoqda...</p>
              <p className="text-sm text-muted-foreground">Iltimos, kutib turing</p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10 gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
              </motion.div>
              <h3 className="text-xl font-bold text-foreground">To'lov muvaffaqiyatli! ✨</h3>
              <p className="text-sm text-muted-foreground text-center">
                (Demo Mode) — Premium faollashtirildi
              </p>
              <Button onClick={handleClose} className="mt-2 rounded-xl">
                Davom etish
              </Button>
              <p className="text-[10px] text-muted-foreground italic">
                This is a demo payment simulation for presentation purposes.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
