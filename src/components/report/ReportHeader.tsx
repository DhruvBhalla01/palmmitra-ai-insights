import { motion } from 'framer-motion';
import { Sparkles, Calendar, Target } from 'lucide-react';

interface ReportHeaderProps {
  name: string;
  readingType: string;
  generatedAt: string;
  confidenceScore: number;
  headlineSummary: string;
  palmImage?: string;
}

const readingTypeLabels: Record<string, string> = {
  full: 'Full Palm Reading',
  career: 'Career Focus Reading',
  love: 'Love & Relationships Reading',
  wealth: 'Wealth & Prosperity Reading',
};

export function ReportHeader({ 
  name, 
  readingType, 
  generatedAt, 
  confidenceScore, 
  headlineSummary,
  palmImage 
}: ReportHeaderProps) {
  const formattedDate = new Date(generatedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative mb-12"
    >
      {/* Premium Summary Card */}
      <div className="glass rounded-3xl p-8 md:p-10 border border-accent/20 overflow-hidden relative">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          {/* Top row: Badge + Confidence */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                {readingTypeLabels[readingType] || 'Palm Reading'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600">
              <Target className="w-4 h-4" />
              <span className="text-sm font-semibold">
                AI Confidence: {confidenceScore}%
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Palm Image */}
            {palmImage && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-accent/30 shadow-xl flex-shrink-0"
              >
                <img 
                  src={palmImage} 
                  alt="Your palm" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}

            {/* Text Content */}
            <div className="flex-1 text-center md:text-left">
              {/* User Info */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
                <span className="font-medium text-foreground text-lg">
                  Reading for <span className="text-accent">{name}</span>
                </span>
                <span className="hidden md:inline text-accent">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formattedDate}
                </span>
              </div>

              {/* Headline */}
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-foreground leading-tight"
              >
                "{headlineSummary}"
              </motion.h1>
            </div>
          </div>

          {/* Glowing Divider */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-8 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"
          />
        </div>
      </div>
    </motion.div>
  );
}
