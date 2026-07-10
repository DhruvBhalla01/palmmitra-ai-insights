import { m } from '@/lib/motion';
import { CheckCircle2, Cpu } from 'lucide-react';

const SIGNALS = [
  'Heart Line Match',
  'Head Line Correlation',
  'Life Path Alignment',
  'Emotional Pattern Detection',
  'Mount of Venus Compared',
  'Fate Line Convergence',
];

export function AiSignalsRow() {
  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="mb-8"
      aria-label="AI compatibility signals analyzed"
    >
      <div className="flex items-center justify-center gap-2 mb-3">
        <Cpu className="w-3.5 h-3.5 text-accent" />
        <p className="text-[10px] tracking-[0.28em] text-accent uppercase font-semibold">
          AI analyzed 300+ compatibility signals
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {SIGNALS.map((s, i) => (
          <m.span
            key={s}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium text-foreground/80 border border-accent/15 bg-accent/[0.05]"
          >
            <CheckCircle2 className="w-2.5 h-2.5 text-green-400" />
            {s}
          </m.span>
        ))}
      </div>
    </m.div>
  );
}
