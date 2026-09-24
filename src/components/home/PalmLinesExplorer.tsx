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
    path: 'M146 126 C124 116 98 115 72 119',
  },
  head: {
    label: 'Head line',
    text: 'Crossing the middle of the palm, it shows how you think and decide. Straight marks a practical planner; a gentle slope, an imaginative mind.',
    path: 'M56 144 C80 139 110 146 136 162',
  },
  life: {
    label: 'Life line',
    text: 'It arcs around the thumb. It never measures lifespan — palmists read it for vitality, energy and the timing of big life turns.',
    path: 'M60 140 C50 170 56 204 76 230',
  },
  fate: {
    label: 'Fate line',
    text: 'Rising toward the middle finger, it reflects career and direction. Many successful hands have none — that reads as a self-made path.',
    path: 'M104 230 C102 200 100 168 98 126',
  },
  sun: {
    label: 'Sun line',
    text: 'A short line under the ring finger, read for recognition and creative fulfilment — how visible your gifts become.',
    path: 'M126 212 C126 188 124 164 120 134',
  },
  mounts: {
    label: 'Mounts',
    text: 'The soft pads under each finger and the thumb. A full mount shows strength in that area — warmth for Venus, ambition for Jupiter.',
  },
};

const MOUNTS = [[62, 108], [88, 104], [112, 106], [136, 114], [44, 176], [132, 190]];

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
          <div className="relative glass-premium rounded-3xl border border-accent/25 p-6 flex justify-center shadow-gold overflow-hidden">
            <svg viewBox="0 0 200 250" className="w-full max-w-[280px]" role="img" aria-label={`Palm illustration highlighting the ${LINES[active].label}`}>
              <defs>
                <linearGradient id="pl-gold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="hsl(var(--accent))" stopOpacity="1" />
                  <stop offset="1" stopColor="hsl(var(--accent))" stopOpacity="0.55" />
                </linearGradient>
                <radialGradient id="pl-halo" cx="50%" cy="55%" r="55%">
                  <stop offset="0" stopColor="hsl(var(--accent))" stopOpacity="0.14" />
                  <stop offset="1" stopColor="hsl(var(--accent))" stopOpacity="0" />
                </radialGradient>
                <filter id="pl-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.4" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <circle cx="100" cy="135" r="104" fill="url(#pl-halo)" />
              <circle cx="100" cy="135" r="96" fill="none" stroke="hsl(var(--accent) / 0.16)" strokeWidth="0.5" strokeDasharray="1 5" />
              {Array.from({ length: 24 }).map((_, i) => {
                const a = (i * 15 * Math.PI) / 180;
                const r1 = i % 6 === 0 ? 90 : 93;
                return <line key={i} x1={100 + r1 * Math.cos(a)} y1={135 + r1 * Math.sin(a)} x2={100 + 96 * Math.cos(a)} y2={135 + 96 * Math.sin(a)} stroke="hsl(var(--accent) / 0.35)" strokeWidth="0.5" />;
              })}
              <path
                d="M62 236 C58 214 52 196 44 180 C34 162 20 142 16 124 C13 111 25 105 33 113 C41 121 46 134 52 142 L52 54 A10 10 0 0 1 72 54 L73 104 L77 38 A11 11 0 0 1 99 38 L100 102 L103 46 A10 10 0 0 1 123 46 L124 108 L129 74 A8.5 8.5 0 0 1 146 75 L148 132 C150 170 144 206 140 236 Z"
                fill="hsl(var(--accent) / 0.04)"
                stroke="hsl(var(--accent) / 0.5)"
                strokeWidth="0.9"
                strokeLinejoin="round"
              />
              {[[62, 58], [88, 42], [113, 50], [137, 78]].map(([x, y], i) => (
                <g key={i} stroke="hsl(var(--accent) / 0.22)" strokeWidth="0.5" strokeLinecap="round">
                  <line x1={x - 5} y1={y + 18} x2={x + 5} y2={y + 18} />
                  <line x1={x - 5} y1={y + 34} x2={x + 5} y2={y + 34} />
                </g>
              ))}
              {MOUNTS.map(([cx, cy], i) => (
                <g key={i} opacity={active === 'mounts' ? 1 : 0.4} style={{ transition: 'opacity .35s' }}>
                  <circle cx={cx} cy={cy} r={active === 'mounts' ? 7 : 4} fill="hsl(var(--accent) / 0.12)" stroke="hsl(var(--accent) / 0.8)" strokeWidth="0.6" style={{ transition: 'r .35s' }} />
                  <circle cx={cx} cy={cy} r="1" fill="hsl(var(--accent))" />
                </g>
              ))}
              {(Object.keys(LINES) as LineKey[]).filter((k) => LINES[k].path).map((k) => {
                const on = active === k;
                return (
                  <g key={k}>
                    <path d={LINES[k].path} fill="none" stroke="hsl(var(--accent) / 0.3)" strokeLinecap="round" strokeWidth="1" />
                    <path
                      d={LINES[k].path}
                      fill="none"
                      stroke="url(#pl-gold)"
                      strokeLinecap="round"
                      strokeWidth="2.4"
                      filter="url(#pl-glow)"
                      pathLength={1}
                      strokeDasharray="1"
                      strokeDashoffset={on ? 0 : 1}
                      style={{ transition: 'stroke-dashoffset .7s cubic-bezier(.4,0,.2,1)' }}
                    />
                  </g>
                );
              })}
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
