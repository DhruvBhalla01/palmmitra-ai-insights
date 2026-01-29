import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Download, Share2, RefreshCw, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface UnlockSuccessOverlayProps {
  isVisible: boolean;
  isSubscription: boolean;
  onDismiss: () => void;
}

export function UnlockSuccessOverlay({ 
  isVisible, 
  isSubscription,
  onDismiss 
}: UnlockSuccessOverlayProps) {
  const navigate = useNavigate();

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
            {/* Animated particles */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-accent"
                initial={{ 
                  x: '50%', 
                  y: '50%',
                  scale: 0,
                  opacity: 1
                }}
                animate={{ 
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: [0, 1, 0.5],
                  opacity: [1, 1, 0]
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: 'easeOut'
                }}
              />
            ))}

            {/* Expanding mandala rings */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`ring-${i}`}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-accent/30 rounded-full"
                initial={{ width: 0, height: 0, opacity: 1 }}
                animate={{ 
                  width: 600 + i * 200, 
                  height: 600 + i * 200, 
                  opacity: 0 
                }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.3,
                  ease: 'easeOut'
                }}
              />
            ))}
          </div>

          {/* Content */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, delay: 0.3 }}
            className="relative z-10 text-center px-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Icon */}
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
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
                <>Unlimited Access<br /><span className="text-gradient-gold">Activated!</span></>
              ) : (
                <>Your Destiny Report is<br /><span className="text-gradient-gold">Now Unlocked!</span></>
              )}
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-muted-foreground mb-8 max-w-md mx-auto"
            >
              {isSubscription 
                ? 'You now have lifetime access to all palm readings. Your spiritual journey awaits!'
                : 'All premium insights are now revealed. Discover your complete destiny.'}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-3 justify-center"
            >
              <Button
                onClick={onDismiss}
                className="btn-gold rounded-xl px-6 py-3 gap-2"
              >
                <Download className="w-4 h-4" />
                View Full Report
              </Button>
              <Button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'PalmMitra Reading',
                      text: 'Check out my palm reading from PalmMitra!',
                      url: window.location.href,
                    });
                  }
                }}
                variant="outline"
                className="rounded-xl px-6 py-3 gap-2 border-accent/30 hover:bg-accent/10"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button
                onClick={() => navigate('/upload')}
                variant="outline"
                className="rounded-xl px-6 py-3 gap-2 border-accent/30 hover:bg-accent/10"
              >
                <RefreshCw className="w-4 h-4" />
                New Reading
              </Button>
            </motion.div>

            {/* Tap to dismiss hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-xs text-muted-foreground mt-8"
            >
              Tap anywhere to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
