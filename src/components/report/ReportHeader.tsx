import { motion } from 'framer-motion';
import { Sparkles, Calendar, Target, Shield } from 'lucide-react';

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
      {/* Key Destiny Message Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 border border-accent/30 relative overflow-hidden"
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 shimmer pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <span className="text-sm font-semibold text-accent uppercase tracking-wide">
            Key Destiny Insight
          </span>
        </div>
        <p className="text-lg md:text-xl font-serif text-foreground leading-relaxed">
          "{headlineSummary}"
        </p>
      </motion.div>

      {/* Premium Summary Card */}
      <div className="glass-premium rounded-3xl p-8 md:p-10 overflow-hidden relative">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          {/* Top row: Badges */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <motion.div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl glass-premium border-accent/20"
              whileHover={{ scale: 1.02 }}
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">
                {readingTypeLabels[readingType] || 'Palm Reading'}
              </span>
            </motion.div>
            
            <div className="flex items-center gap-3">
              <motion.div 
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20"
                whileHover={{ scale: 1.02 }}
              >
                <Target className="w-4 h-4 text-green-500" />
                <span className="text-sm font-bold text-green-600">
                  {confidenceScore}% Confidence
                </span>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20"
                whileHover={{ scale: 1.02 }}
              >
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">
                  Verified
                </span>
              </motion.div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Palm Image with premium frame */}
            {palmImage && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-gold rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border-4 border-accent/40 shadow-gold-lg">
                  <img 
                    src={palmImage} 
                    alt="Your palm" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Scan line effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent"
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>
              </motion.div>
            )}

            {/* Text Content */}
            <div className="flex-1 text-center md:text-left">
              {/* User Info */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
                <span className="font-semibold text-foreground text-xl">
                  Reading for <span className="text-gradient-gold">{name}</span>
                </span>
                <span className="hidden md:inline text-accent">•</span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {formattedDate}
                </span>
              </div>

              {/* Sanskrit accent */}
              <p className="sanskrit-accent mb-3">ॐ Bhavishya Darshan</p>

              {/* Report summary */}
              <p className="text-muted-foreground leading-relaxed">
                This comprehensive analysis reveals the unique patterns in your palm, 
                offering insights into your personality, life path, and spiritual journey.
              </p>
            </div>
          </div>

          {/* Glowing Divider */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-8 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
          />
        </div>
      </div>
    </motion.div>
  );
}