import { motion } from 'framer-motion';
import { Download, RefreshCw, Share2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function ActionButtons() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My PalmMitra AI Reading',
          text: 'Check out my personalized AI palm reading!',
          url: window.location.origin,
        });
      } catch {
        // Cancelled or not supported
      }
    } else {
      await navigator.clipboard.writeText(window.location.origin);
      toast({
        title: "Link Copied!",
        description: "Share link copied to clipboard",
      });
    }
  };

  const handleDownload = () => {
    toast({
      title: "Coming Soon",
      description: "PDF download will be available in premium version!",
    });
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
      <div className="flex flex-wrap justify-center gap-4">
        {/* Primary CTA */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleDownload}
            className="btn-gold rounded-2xl px-8 py-6 text-base font-semibold gap-2 shadow-lg"
          >
            <Download className="w-5 h-5" />
            Download Full PDF Report
          </Button>
        </motion.div>

        {/* Secondary Actions */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => navigate('/upload')}
            variant="outline"
            className="rounded-2xl px-6 py-6 text-base gap-2 border-2"
          >
            <RefreshCw className="w-5 h-5" />
            New Reading
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleShare}
            variant="outline"
            className="rounded-2xl px-6 py-6 text-base gap-2 border-2"
          >
            <Share2 className="w-5 h-5" />
            Share Report
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleSave}
            variant="outline"
            className="rounded-2xl px-6 py-6 text-base gap-2 border-2"
          >
            <Bookmark className="w-5 h-5" />
            Save to Dashboard
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}
