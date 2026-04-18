import { motion } from 'framer-motion';
import { Download, RefreshCw, Share2, Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { generateReportPDF } from '@/lib/generateReportPDF';
import type { PalmReading } from './types';

interface UserDataForPDF {
  name: string;
  readingType: 'full' | 'career' | 'love' | 'wealth';
  generatedAt: string;
}

interface ActionButtonsProps {
  isUnlocked?: boolean;
  onUnlockClick?: () => void;
  reading?: PalmReading | null;
  userData?: UserDataForPDF | null;
  userName?: string;
}

export function ActionButtons({
  isUnlocked = true,
  onUnlockClick,
  reading,
  userData,
  userName,
}: ActionButtonsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleWhatsAppShare = () => {
    const name = userName ? `${userName}'s` : 'My';
    const reportUrl = window.location.href;
    const message = [
      `🔮 ${name} AI Palm Reading from PalmMitra is incredible!`,
      '',
      `Get your own reading (₹99 only) → ${reportUrl}`,
      `Use code PALMFRIEND for ₹50 off 🙏`,
    ].join('\n');
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

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

  // Determine if download is available
  const isReportDataReady = Boolean(reading && reading.headlineSummary && reading.majorLines);
  
  const handleDownload = async () => {
    // Check unlock status first
    if (!isUnlocked) {
      onUnlockClick?.();
      return;
    }

    // Validate reading data exists with detailed check
    if (!reading) {
      console.error('PDF Download failed: reading prop is null/undefined');
      toast({
        title: "Report Not Ready",
        description: "Unable to generate PDF. Please wait for the report to load completely.",
        variant: "destructive",
      });
      return;
    }

    // Validate reading has required structure
    if (!reading.headlineSummary || !reading.majorLines) {
      console.error('PDF Download failed: reading data incomplete', {
        hasHeadline: Boolean(reading.headlineSummary),
        hasMajorLines: Boolean(reading.majorLines),
      });
      toast({
        title: "Report Incomplete",
        description: "Some report sections are still loading. Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      // Generate the PDF
      generateReportPDF(reading, {
        name: userData?.name || 'User',
        readingType: userData?.readingType || 'full',
        generatedAt: userData?.generatedAt || new Date().toISOString(),
      });
      
      toast({
        title: "✨ PDF Downloaded!",
        description: "Your premium Destiny Report has been saved.",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Download Failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
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
              disabled={isDownloading || !isReportDataReady}
              className={`rounded-2xl px-8 py-6 text-base font-semibold gap-2 shadow-gold-lg relative overflow-hidden ${
                isUnlocked && isReportDataReady 
                  ? 'btn-gold' 
                  : 'bg-muted/50 border border-accent/30 text-foreground hover:bg-accent/10'
              }`}
            >
              {isDownloading ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Preparing Your Destiny...
                </>
              ) : !isReportDataReady ? (
                <>
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  Loading Report...
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
              onClick={handleWhatsAppShare}
              className="rounded-2xl px-6 py-6 text-base gap-2 text-white font-semibold"
              style={{ backgroundColor: '#25D366' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}