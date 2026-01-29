import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface LockedSectionProps {
  isUnlocked: boolean;
  sectionName: string;
  children?: ReactNode;
  onUnlockClick: () => void;
  previewContent?: ReactNode;
}

export function LockedSection({ 
  isUnlocked, 
  sectionName, 
  children, 
  onUnlockClick,
  previewContent 
}: LockedSectionProps) {
  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred content preview */}
      <div className="relative overflow-hidden rounded-2xl">
        {previewContent && (
          <div className="blur-md pointer-events-none select-none opacity-60">
            {previewContent}
          </div>
        )}
        
        {/* Lock overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 rounded-2xl border border-accent/20"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3,
              ease: 'easeInOut'
            }}
            className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4"
          >
            <Lock className="w-8 h-8 text-accent" />
          </motion.div>
          
          <h3 className="text-lg font-serif font-bold text-foreground mb-2 text-center">
            {sectionName}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-xs">
            Unlock your complete reading to reveal this section
          </p>
          
          <Button
            onClick={onUnlockClick}
            className="btn-gold rounded-xl px-6 py-3 gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Unlock Full Report
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
