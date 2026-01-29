import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

export function LegalDisclaimer() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border">
        <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Disclaimer:</strong> This report is AI-generated for spiritual guidance and entertainment purposes only. 
          PalmMitra does not provide medical, legal, or financial advice. Results are based on traditional palmistry 
          interpretations and should not be used as the sole basis for life decisions. Individual experiences may vary.
        </p>
      </div>
    </motion.section>
  );
}
