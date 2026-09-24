import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';

type LineKey = 'heart' | 'head' | 'life' | 'fate' | 'sun' | 'mounts';

const LINES: Record<LineKey, { label: string; text: string; path?: string }> = {
  heart: {
    label: 'Heart line',
    text: 'The top crease under your fingers shows how you love and recover. A line curving up loves openly; a straighter one loves carefully and privately.',
    path: 'M40 92 C70 78 110 76 160 86',
  },
  head: {
    label: 'Head line',
    text: 'Crossing the middle of the palm, it shows how you think and decide. Straight marks a practical planner; a gentle slope, an imaginative mind.',
    path: 'M42 112 C80 110 118 118 152 134',
  },
  life: {
    label: 'Life line',
    text: 'It arcs around the thumb. It never measures lifespan — palmists read it for vitality, energy and the timing of big life turns.',
    path: 'M60 104 C48 140 56 180 86 212',
  },
  fate: {
    label: 'Fate line',
    text: 'Rising toward the middle finger, it reflects career and direction. Many successful hands have none — that reads as a self-made path.',
    path: 'M104 214 C102 170 102 120 104 70',
  },
  sun: {
    label: 'Sun line',
    text: 'A short line under the ring finger, read for recognition and creative fulfilment — how visible your gifts become.',
    path: 'M132 190 C132 160 134 130 136 100',
  },
  mounts: {
    label: 'Mounts',
    text: 'The soft pads under each finger and the thumb. A full mount shows strength in that area — warmth for Venus, ambition for Jupiter.',
  },
};

const MOUNTS = [[62, 64], [92, 56], [122, 58], [150, 70], [58, 176]];

export function PalmLinesExplorer() {
  const [active, setActive] = useState<LineKey>('heart');

  const choose = (k: LineKey) => {
    setActive(k);
    analytics.track('palm_line_explored', { line: k });
  };

  return (
    <section id="learn-palm-lines" className="py-16 md:py-24 relative scroll-mt-24" aria-labelledby="palm-lines-heading">
      <div className="container mx-auto px-5 max-w-5xl">
        <div className="text-center mb-10">
          <h2 id="palm-lines-heading" className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
            Tap a line, <span className="text-gradient-gold">see what it reveals</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Here's what a palmist reads in each line. Then let our AI read yours for real.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="glass-premium rounded-3xl border border-accent/20 p-6 flex justify-center">
            <svg viewBox="0 0 200 240" className="w-full max-w-[260px]" role="img" aria-label={`Palm illustration highlighting the ${LINES[active].label}`}>
              <path
                d="M50 230 C30 190 28 150 36 110 L30 60 C28 44 46 42 48 58 L56 96 L58 30 C58 14 78 14 78 30 L82 88 L90 22 C92 6 112 8 110 24 L108 88 L120 30 C124 14 142 18 138 34 L130 96 L146 56 C152 42 170 50 164 64 L150 120 C168 104 186 110 178 126 L150 170 C140 196 130 214 128 230 Z"
                fill="hsl(var(--accent) / 0.05)"
                stroke="hsl(var(--accent) / 0.45)"
                strokeWidth="1.2"
              />
              {(Object.keys(LINES) as LineKey[]).filter((k) => LINES[k].path).map((k) => (
                <path
                  key={k}
                  d={LINES[k].path}
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeLinecap="round"
                  strokeWidth={active === k ? 3.2 : 1.2}
                  opacity={active === k ? 1 : 0.35}
                  style={{ transition: 'opacity .3s, stroke-width .3s' }}
                />
              ))}
              {MOUNTS.map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r={active === 'mounts' ? 9 : 5} fill="hsl(var(--accent) / 0.18)"
                  stroke="hsl(var(--accent))" strokeWidth={active === 'mounts' ? 1.4 : 0.4}
                  opacity={active === 'mounts' ? 1 : 0.35} style={{ transition: 'all .3s' }} />
              ))}
            </svg>
          </div>

          <div>
            <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="Choose a palm line">
              {(Object.keys(LINES) as LineKey[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={active === k}
                  onClick={() => choose(k)}
                  className={`px-4 min-h-[44px] rounded-full text-sm font-medium border transition-colors ${
                    active === k ? 'bg-accent/15 border-accent text-foreground' : 'border-accent/20 text-muted-foreground hover:border-accent/50'
                  }`}
                >
                  {LINES[k].label}
                </button>
              ))}
            </div>
            <div className="glass-premium rounded-2xl border border-accent/15 p-5 mb-5 min-h-[120px]" aria-live="polite">
              <h3 className="font-serif text-lg font-bold text-foreground mb-2">{LINES[active].label}</h3>
              <p className="text-muted-foreground leading-relaxed">{LINES[active].text}</p>
            </div>
            <Link to="/upload" onClick={() => analytics.track('cta_clicked', { cta: 'palm_lines_explorer', line: active })}>
              <Button className="btn-gold text-foreground font-semibold rounded-2xl w-full sm:w-auto min-h-[52px] px-6">
                <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" /> Read my {LINES[active].label.toLowerCase()} — free
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-14 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">What is palm reading?</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            In India, palm reading is Hast Rekha Shastra, part of the ancient Hasta Samudrika Shastra. A palmist looks at each line — where it starts, how deep it runs, the path it takes and where it ends — alongside the mounts of the hand.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            PalmMitra's AI does the same from one photo. Palmistry is a tradition, not a science: lines describe tendencies, never fixed verdicts, and no line predicts lifespan or illness. Come for reflection, not prophecy.
          </p>
        </div>
      </div>
    </section>
  );
}
