import { useState } from 'react';
import { m } from '@/lib/motion';
import { Lock, Sparkles, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { recordInteraction } from '@/lib/analytics';
import type { PalmReading } from './types';

interface PalmLineExplorerProps {
  reading: PalmReading;
  isUnlocked: boolean;
  hinglish?: boolean;
  onUnlockClick?: () => void;
}

type SpotKey =
  | 'lifeLine' | 'heartLine' | 'headLine' | 'fateLine' | 'sunLine'
  | 'venus' | 'jupiter' | 'saturn' | 'apollo' | 'mercury';

interface Spot {
  key: SpotKey;
  label: string;
  sanskrit: string;
  kind: 'line' | 'mount';
  path?: string;
  cx?: number;
  cy?: number;
  free?: boolean;
}

/** Stylised right palm, 200x260 viewBox. Paths approximate classical line positions. */
const SPOTS: Spot[] = [
  { key: 'lifeLine', label: 'Life Line', sanskrit: 'Jeevan Rekha', kind: 'line', free: true, path: 'M78 78 C 62 106, 58 146, 74 186' },
  { key: 'headLine', label: 'Head Line', sanskrit: 'Mastishk Rekha', kind: 'line', path: 'M76 88 C 104 104, 132 116, 152 118' },
  { key: 'heartLine', label: 'Heart Line', sanskrit: 'Hriday Rekha', kind: 'line', path: 'M70 66 C 100 80, 132 86, 156 84' },
  { key: 'fateLine', label: 'Fate Line', sanskrit: 'Bhagya Rekha', kind: 'line', path: 'M112 196 C 110 158, 112 118, 116 74' },
  { key: 'sunLine', label: 'Sun Line', sanskrit: 'Surya Rekha', kind: 'line', path: 'M142 192 C 144 160, 144 122, 142 92' },
  { key: 'venus', label: 'Mount of Venus', sanskrit: 'Shukra', kind: 'mount', cx: 88, cy: 158 },
  { key: 'jupiter', label: 'Mount of Jupiter', sanskrit: 'Guru', kind: 'mount', cx: 92, cy: 58 },
  { key: 'saturn', label: 'Mount of Saturn', sanskrit: 'Shani', kind: 'mount', cx: 116, cy: 52 },
  { key: 'apollo', label: 'Mount of Apollo', sanskrit: 'Surya', kind: 'mount', cx: 140, cy: 56 },
  { key: 'mercury', label: 'Mount of Mercury', sanskrit: 'Budha', kind: 'mount', cx: 162, cy: 70 },
];

export function PalmLineExplorer({ reading, isUnlocked, hinglish, onUnlockClick }: PalmLineExplorerProps) {
  const [active, setActive] = useState<SpotKey>('lifeLine');
  const spot = SPOTS.find((s) => s.key === active) ?? SPOTS[0];

  const select = (key: SpotKey) => {
    setActive(key);
    recordInteraction('palm_explorer_tapped', key);
  };

  const detail = (() => {
    if (spot.kind === 'line') {
      const line = reading.majorLines?.[spot.key as keyof PalmReading['majorLines']];
      if (!line) return null;
      return { badge: line.strength, body: line.keyInsight || line.meaning };
    }
    const mount = reading.mounts?.[spot.key as keyof PalmReading['mounts']];
    if (!mount) return null;
    return { badge: `${mount.level} ${hinglish ? 'ubhaar' : 'prominence'}`, body: mount.meaning };
  })();

  const locked = !isUnlocked && !spot.free;

  return (
    <m.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-6"
    >
      <div className="flex items-start gap-3 mb-2">
        <Fingerprint className="w-6 h-6 md:w-8 md:h-8 text-accent flex-shrink-0 mt-1" aria-hidden="true" />
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground leading-tight text-balance">
          {hinglish ? 'Apni Hatheli ' : 'Explore Your '}
          <span className="text-gradient-gold">{hinglish ? 'Kholein' : 'Palm Map'}</span>
        </h2>
      </div>
      <p className="sanskrit-accent mb-4 ml-9 md:ml-11">ॐ Hasta Darshan</p>
      <p className="text-sm text-muted-foreground mb-4">
        {hinglish
          ? 'Kisi bhi rekha ya parvat par tap karein aur uska matlab turant dekhein.'
          : 'Tap any line or mount to read what it means on your hand.'}
      </p>

      <div className="glass-premium rounded-3xl border border-accent/25 p-4 sm:p-6 grid gap-5 sm:grid-cols-[minmax(0,220px)_1fr] items-start">
        {/* Palm diagram */}
        <div className="relative mx-auto w-full max-w-[220px]">
          <svg viewBox="0 0 200 260" className="w-full h-auto" role="img" aria-label="Interactive palm diagram">
            <path
              d="M62 250 C 44 210, 44 164, 52 122 L 48 74 C 47 64, 61 62, 63 72 L 69 108 L 72 46 C 73 35, 87 35, 89 46 L 94 104 L 99 34 C 100 23, 114 23, 115 34 L 119 104 L 128 44 C 130 33, 144 35, 143 46 L 140 110 L 152 78 C 155 68, 168 72, 166 82 L 156 132 C 152 178, 146 214, 134 250 Z"
              className="fill-accent/5 stroke-accent/30"
              strokeWidth="1.5"
            />
            {SPOTS.filter((s) => s.kind === 'line').map((s) => (
              <path
                key={s.key}
                d={s.path}
                fill="none"
                strokeLinecap="round"
                strokeWidth={active === s.key ? 4 : 2}
                className={active === s.key ? 'stroke-accent' : 'stroke-accent/40'}
                style={{ cursor: 'pointer' }}
                onClick={() => select(s.key)}
              />
            ))}
            {SPOTS.filter((s) => s.kind === 'mount').map((s) => (
              <circle
                key={s.key}
                cx={s.cx}
                cy={s.cy}
                r={active === s.key ? 9 : 6}
                className={active === s.key ? 'fill-accent/70 stroke-accent' : 'fill-accent/20 stroke-accent/40'}
                strokeWidth="1.5"
                style={{ cursor: 'pointer' }}
                onClick={() => select(s.key)}
              />
            ))}
          </svg>
        </div>

        {/* Detail panel */}
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-4">
            {SPOTS.map((s) => (
              <button
                key={s.key}
                onClick={() => select(s.key)}
                aria-pressed={active === s.key}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors min-h-[32px] ${
                  active === s.key
                    ? 'bg-accent/20 border-accent/50 text-accent'
                    : 'bg-background/40 border-border/50 text-muted-foreground hover:border-accent/40'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-background/40 border border-border/50 p-4">
            <p className="font-serif text-lg font-bold text-foreground">{spot.label}</p>
            <p className="text-xs text-accent mb-3">{spot.sanskrit}</p>

            {detail && !locked && (
              <>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/15 border border-accent/30 text-[11px] font-semibold text-accent mb-3">
                  <Sparkles className="w-3 h-3" aria-hidden="true" /> {detail.badge}
                </span>
                <p className="text-sm text-foreground/85 leading-relaxed">{detail.body}</p>
              </>
            )}

            {locked && (
              <div className="space-y-3">
                <div aria-hidden="true" className="space-y-2">
                  <div className="h-3 rounded-full bg-gradient-gold opacity-25" />
                  <div className="h-3 rounded-full bg-gradient-gold opacity-20 w-5/6" />
                  <div className="h-3 rounded-full bg-gradient-gold opacity-15 w-2/3" />
                </div>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                  {hinglish
                    ? 'Is rekha ka poora matlab full reading mein hai.'
                    : 'The full meaning of this line is in your complete reading.'}
                </p>
                {onUnlockClick && (
                  <Button className="btn-gold w-full h-11" onClick={onUnlockClick}>
                    {hinglish ? 'Poori reading unlock karein' : 'Unlock the full reading'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </m.section>
  );
}
