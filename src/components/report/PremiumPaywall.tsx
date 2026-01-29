import { motion } from 'framer-motion';
import { Lock, Gem, Calendar, Briefcase, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PremiumPaywallProps {
  premiumInsights: {
    marriageTiming: string;
    careerBreakthrough: string;
    gemstoneRecommendation: string;
  };
}

export function PremiumPaywall({ premiumInsights }: PremiumPaywallProps) {
  const { toast } = useToast();

  const handleUnlock = () => {
    toast({
      title: "Premium Coming Soon",
      description: "Payment integration will be available soon!",
    });
  };

  const lockedItems = [
    { 
      icon: Calendar, 
      title: 'Marriage Timing Window',
      preview: premiumInsights.marriageTiming.slice(0, 20) + '...',
      color: 'text-pink-500',
      bg: 'bg-pink-500/10'
    },
    { 
      icon: Briefcase, 
      title: 'Exact Career Breakthrough Year',
      preview: premiumInsights.careerBreakthrough.slice(0, 20) + '...',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    { 
      icon: Gem, 
      title: 'Personalized Gemstone Suggestion',
      preview: premiumInsights.gemstoneRecommendation.slice(0, 20) + '...',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <div className="relative glass rounded-3xl overflow-hidden border-2 border-accent/30">
        {/* Lock overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 pointer-events-none" />
        
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground">
                Unlock Detailed Predictions
              </h2>
              <p className="text-sm text-muted-foreground">Premium insights based on your palm</p>
            </div>
          </div>

          {/* Locked content preview */}
          <div className="space-y-3 mb-8">
            {lockedItems.map(({ icon: Icon, title, preview, color, bg }, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-background/50 relative overflow-hidden"
              >
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground blur-sm select-none">
                    {preview}
                  </p>
                </div>
                <Lock className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <motion.div 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <Button
                onClick={handleUnlock}
                className="btn-gold rounded-2xl px-10 py-6 text-lg font-semibold gap-2 shadow-xl"
              >
                <Sparkles className="w-5 h-5" />
                Unlock Premium Reading ₹199
              </Button>
            </motion.div>
            <p className="text-xs text-muted-foreground mt-3">
              One-time payment • Instant access • Detailed predictions
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
