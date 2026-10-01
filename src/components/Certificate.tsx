import { motion } from 'framer-motion';
import { Award, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRef } from 'react';

interface CertificateProps {
  level: { id: string; name: string; label: string };
  onClose: () => void;
}

export default function Certificate({ level, onClose }: CertificateProps) {
  const { user } = useAuth();
  const certRef = useRef<HTMLDivElement>(null);
  const userName = user?.user_metadata?.full_name || "O'rganuvchi";
  const date = new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleDownload = () => {
    if (!certRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Sertifikat - ${level.name}</title>
      <style>
        body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; font-family: 'Georgia', serif; }
        .cert { width: 800px; padding: 60px; background: white; border: 8px double #6C3CE1; text-align: center; position: relative; }
        .cert::before { content: ''; position: absolute; inset: 12px; border: 2px solid #E8E0F7; pointer-events: none; }
        h1 { color: #6C3CE1; font-size: 36px; margin: 0 0 8px; letter-spacing: 6px; }
        h2 { color: #333; font-size: 18px; font-weight: normal; margin: 0 0 40px; }
        .name { font-size: 32px; color: #1a1a2e; border-bottom: 2px solid #6C3CE1; display: inline-block; padding: 0 40px 8px; margin: 20px 0; }
        .level { font-size: 48px; color: #6C3CE1; font-weight: bold; margin: 20px 0; }
        .desc { color: #666; font-size: 16px; margin: 10px 0 30px; }
        .date { color: #999; font-size: 14px; margin-top: 40px; }
        .badge { font-size: 60px; margin: 10px 0; }
        @media print { body { background: white; } }
      </style></head><body>
      <div class="cert">
        <h1>SERTIFIKAT</h1>
        <h2>Certificate of Completion</h2>
        <div class="badge">🏆</div>
        <p style="color:#666">Bu sertifikat</p>
        <div class="name">${userName}</div>
        <p style="color:#666">ga berildi</p>
        <div class="level">${level.name} — ${level.label}</div>
        <p class="desc">darajasini muvaffaqiyatli tugatganligi uchun<br/>Parlify AI platformasida</p>
        <p class="date">${date}</p>
        <p style="color:#999;font-size:12px;margin-top:30px">Parlify AI — HBRIT ta'lim tizimi</p>
      </div>
      <script>setTimeout(() => window.print(), 500)</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-lg"
      >
        <button onClick={onClose} className="absolute -top-3 -right-3 z-10 rounded-full bg-card p-1.5 shadow-elevated">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div ref={certRef} className="rounded-2xl overflow-hidden shadow-elevated">
          {/* Header gradient */}
          <div className="bg-gradient-primary p-8 text-center">
            <Award className="h-16 w-16 mx-auto text-primary-foreground mb-3" />
            <h2 className="text-2xl font-bold text-primary-foreground tracking-widest">SERTIFIKAT</h2>
            <p className="text-primary-foreground/80 text-sm">Certificate of Completion</p>
          </div>

          {/* Content */}
          <div className="bg-card p-8 text-center space-y-4">
            <p className="text-muted-foreground text-sm">Bu sertifikat</p>
            <h3 className="text-2xl font-bold text-foreground border-b-2 border-primary inline-block px-6 pb-2">
              {userName}
            </h3>
            <p className="text-muted-foreground text-sm">ga berildi</p>

            <div className="py-4">
              <span className="text-4xl font-black text-gradient-primary">{level.name}</span>
              <p className="text-lg font-semibold text-foreground mt-1">{level.label}</p>
            </div>

            <p className="text-sm text-muted-foreground">
              darajasini muvaffaqiyatli tugatganligi uchun
            </p>
            <p className="text-xs text-muted-foreground">{date}</p>
            <p className="text-xs text-muted-foreground/60 pt-2">Parlify AI — HBRIT ta'lim tizimi</p>

            <Button onClick={handleDownload} className="mt-4 gap-2 rounded-xl">
              <Download className="h-4 w-4" />
              PDF yuklab olish
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
