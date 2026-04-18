import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Download, RefreshCw, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface UnlockSuccessOverlayProps {
  isVisible: boolean;
  isSubscription: boolean;
  onDismiss: () => void;
  userName?: string;
}

function buildWhatsAppUrl(userName: string | undefined, reportUrl: string): string {
  const name = userName ? `${userName}'s` : 'My';
  const message = [
    `🔮 ${name} AI Palm Reading is ready on PalmMitra!`,
    '',
    `The ancient science of Hast Rekha meets AI — and the results are surprisingly accurate.`,
    '',
    `Get your own reading (₹99 only) → ${reportUrl}`,
    `Use code PALMFRIEND for ₹50 off 🙏`,
  ].join('\n');
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function UnlockSuccessOverlay({
  isVisible,
  isSubscription,
  onDismiss,
  userName,
}: UnlockSuccessOverlayProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const reportUrl = window.location.href;

  const handleWhatsApp = () => {
    window.open(buildWhatsAppUrl(userName, reportUrl), '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PalmMitra Reading',
          text: 'Check out my palm reading from PalmMitra!',
          url: reportUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(reportUrl);
      toast({ title: 'Link Copied!', description: 'Report link copied to clipboard.' });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center"
          onClick={onDismiss}
        >
          {/* Background with gold particles */}
          <div className="absolute inset-0 bg-background/95 backdrop-blur-md">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-accent"
                initial={{ x: '50%', y: '50%', scale: 0, opacity: 1 }}
                animate={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: [0, 1, 0.5],
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5, ease: 'easeOut' }}
              />
            ))}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`ring-${i}`}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-accent/30 rounded-full"
                initial={{ width: 0, height: 0, opacity: 1 }}
                animate={{ width: 600 + i * 200, height: 600 + i * 200, opacity: 0 }}
                transition={{ duration: 2, delay: i * 0.3, ease: 'easeOut' }}
              />
            ))}
          </div>

          {/* Content */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, delay: 0.3 }}
            className="relative z-10 text-center px-6 max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            {/* Icon */}
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-gold flex items-center justify-center shadow-gold-lg"
            >
              {isSubscription ? (
                <Crown className="w-12 h-12 text-foreground" />
              ) : (
                <Sparkles className="w-12 h-12 text-foreground" />
              )}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3"
            >
              {isSubscription ? (
                <>Monthly Plan<br /><span className="text-gradient-gold">Activated!</span></>
              ) : (
                <>Your Destiny Report is<br /><span className="text-gradient-gold">Now Unlocked!</span></>
              )}
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-muted-foreground mb-3 max-w-sm mx-auto"
            >
              {isSubscription
                ? 'Unlimited readings for you and your family are now active.'
                : 'All premium insights are revealed. Discover your complete destiny.'}
            </motion.p>

            {/* WhatsApp share nudge */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="text-sm text-accent mb-8"
            >
              Share your reading on WhatsApp — give friends ₹50 off with code PALMFRIEND ✨
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col gap-3 w-full max-w-xs mx-auto"
            >
              {/* WhatsApp — primary viral CTA */}
              <Button
                onClick={handleWhatsApp}
                className="w-full rounded-xl py-3 gap-2 font-semibold text-white"
                style={{ backgroundColor: '#25D366' }}
              >
                {/* WhatsApp SVG icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Share on WhatsApp
              </Button>

              <Button
                onClick={onDismiss}
                className="w-full btn-gold rounded-xl py-3 gap-2"
              >
                <Download className="w-4 h-4" />
                View Full Report
              </Button>

              <Button
                onClick={() => navigate('/upload')}
                variant="outline"
                className="w-full rounded-xl py-3 gap-2 border-accent/30 hover:bg-accent/10"
              >
                <RefreshCw className="w-4 h-4" />
                New Reading
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-xs text-muted-foreground mt-6"
            >
              Tap anywhere to continue reading
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
