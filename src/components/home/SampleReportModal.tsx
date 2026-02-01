import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ArrowRight, Sparkles, Star, Heart, Briefcase, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

interface SampleReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const sampleSections = [
  {
    icon: Star,
    title: 'Life Line Analysis',
    preview: 'Your life line reveals a strong vitality and resilience. The arc suggests...',
    unlocked: true,
  },
  {
    icon: Heart,
    title: 'Love & Relationships',
    preview: 'Deep emotional connections await. Your heart line indicates...',
    unlocked: false,
  },
  {
    icon: Briefcase,
    title: 'Career & Success',
    preview: 'Peak career growth period begins in 2026-2028...',
    unlocked: false,
  },
  {
    icon: TrendingUp,
    title: 'Wealth Forecast',
    preview: 'Financial opportunities emerging from multiple sources...',
    unlocked: false,
  },
];

export function SampleReportModal({ isOpen, onClose }: SampleReportModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto glass-premium rounded-3xl border border-accent/30 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 glass-premium border-b border-accent/20 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-accent font-medium mb-1">
                    Sample Preview
                  </p>
                  <h2 className="text-2xl font-serif font-bold text-foreground">
                    Your Destiny <span className="text-gradient-gold">Report</span>
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Destiny highlight box */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-mystic rounded-2xl p-5 text-center"
              >
                <Sparkles className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="text-foreground font-medium">
                  "Your strongest growth cycle begins mid-2026 and peaks in 2028."
                </p>
                <p className="text-sm text-muted-foreground mt-1">— AI Destiny Analysis</p>
              </motion.div>

              {/* Report sections */}
              {sampleSections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + index * 0.1 }}
                  className={`glass-premium rounded-2xl p-5 border transition-all ${
                    section.unlocked 
                      ? 'border-accent/20' 
                      : 'border-accent/10 relative overflow-hidden'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      section.unlocked ? 'bg-accent/10' : 'bg-muted/50'
                    }`}>
                      <section.icon className={`w-6 h-6 ${section.unlocked ? 'text-accent' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-bold text-foreground mb-1 flex items-center gap-2">
                        {section.title}
                        {!section.unlocked && (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                      </h3>
                      <p className={`text-sm leading-relaxed ${
                        section.unlocked ? 'text-muted-foreground' : 'text-muted-foreground/60 blur-[2px]'
                      }`}>
                        {section.preview}
                      </p>
                    </div>
                  </div>
                  
                  {/* Blur overlay for locked sections */}
                  {!section.unlocked && (
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end justify-center pb-4">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Premium Content
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-4"
              >
                <Link to="/upload" onClick={onClose}>
                  <Button className="btn-gold w-full text-foreground font-semibold text-lg py-7 rounded-2xl shadow-gold-lg group">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Get Your Full Reading
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <p className="text-center text-sm text-muted-foreground mt-3">
                  Upload your palm and unlock all premium insights
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
