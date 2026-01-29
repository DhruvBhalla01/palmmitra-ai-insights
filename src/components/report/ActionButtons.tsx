import { motion } from 'framer-motion';
import { Download, RefreshCw, Share2, Bookmark, Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface ActionButtonsProps {
  isUnlocked?: boolean;
  onUnlockClick?: () => void;
}

export function ActionButtons({ isUnlocked = true, onUnlockClick }: ActionButtonsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My PalmMitra AI Reading',
          text: 'Check out my personalized AI palm reading!',
          url: shareUrl,
        });
      } catch {
        // Cancelled or not supported
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Report link copied to clipboard",
      });
    }
  };

  const handleDownload = async () => {
    if (!isUnlocked) {
      onUnlockClick?.();
      return;
    }

    setIsDownloading(true);
    
    // Simulate download preparation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "✨ PDF Ready!",
      description: "Your premium palm reading PDF is downloading...",
    });
    
    setIsDownloading(false);
  };

  const handleSave = () => {
    toast({
      title: "Coming Soon",
      description: "Dashboard save feature coming soon!",
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <div className="glass-premium rounded-3xl p-8 border border-accent/20">
        <div className="flex flex-wrap justify-center gap-4">
          {/* Primary CTA with sparkle effect */}
          <motion.div 
            className="relative group"
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
          >
            {/* Sparkle particles on hover */}
            <div className="absolute -inset-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-accent"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                  animate={{
                    y: [0, -20],
                    x: [0, (Math.random() - 0.5) * 20],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
            
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`rounded-2xl px-8 py-6 text-base font-semibold gap-2 shadow-gold-lg relative overflow-hidden ${
                isUnlocked ? 'btn-gold' : 'bg-muted/50 border border-accent/30 text-foreground hover:bg-accent/10'
              }`}
            >
              {isDownloading ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Preparing Your Destiny...
                </>
              ) : isUnlocked ? (
                <>
                  <Download className="w-5 h-5" />
                  Download Full PDF Report
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Unlock to Download PDF
                </>
              )}
            </Button>
          </motion.div>

          {/* Secondary Actions */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => navigate('/upload')}
              className="btn-secondary-premium rounded-2xl px-6 py-6 text-base gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              New Reading
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleShare}
              className="btn-secondary-premium rounded-2xl px-6 py-6 text-base gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share Report
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleSave}
              className="btn-secondary-premium rounded-2xl px-6 py-6 text-base gap-2"
            >
              <Bookmark className="w-5 h-5" />
              Save to Dashboard
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}