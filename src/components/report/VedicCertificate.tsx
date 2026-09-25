import { m } from '@/lib/motion';
import { BadgeCheck, Hand, Sparkles } from 'lucide-react';
import type { PalmReading } from './types';

interface VedicCertificateProps {
  reading: PalmReading;
  name: string;
  reportId?: string;
  generatedAt: string;
  countryCode?: string;
  hinglish?: boolean;
}

const MOUNT_LABELS: Record<string, { en: string; sanskrit: string }> = {
  venus: { en: 'Mount of Venus', sanskrit: 'Shukra' },
  jupiter: { en: 'Mount of Jupiter', sanskrit: 'Guru' },
  saturn: { en: 'Mount of Saturn', sanskrit: 'Shani' },
  apollo: { en: 'Mount of Apollo', sanskrit: 'Surya' },
  mercury: { en: 'Mount of Mercury', sanskrit: 'Budha' },
};

const LEVEL_WEIGHT: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
const STRENGTH_WEIGHT: Record<string, number> = {
  'Very Strong': 5,
  Strong: 4,
  Moderate: 3,
  Developing: 2,
  Faint: 1,
};

const ELEMENTS = [
  { key: 'earth', name: 'Earth Hand', sanskrit: 'Prithvi', trait: 'Grounded, dependable, steady builder' },
  { key: 'fire', name: 'Fire Hand', sanskrit: 'Agni', trait: 'Driven, magnetic, quick to act' },
  { key: 'air', name: 'Air Hand', sanskrit: 'Vayu', trait: 'Analytical, expressive, idea-led' },
  { key: 'water', name: 'Water Hand', sanskrit: 'Jala', trait: 'Intuitive, emotional, deeply feeling' },
] as const;

/** Stable base-36 hash so the same report always shows the same certificate ID. */
function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function dominantMount(reading: PalmReading) {
  const entries = Object.entries(reading.mounts ?? {});
  if (!entries.length) return MOUNT_LABELS.venus;
  const best = entries.reduce((acc, cur) =>
    (LEVEL_WEIGHT[cur[1]?.level] ?? 0) > (LEVEL_WEIGHT[acc[1]?.level] ?? 0) ? cur : acc
  );
  return MOUNT_LABELS[best[0]] ?? MOUNT_LABELS.venus;
}

/** Element derived from which line dominates — deterministic, never random. */
function handElement(reading: PalmReading, seed: number) {
  const lines = reading.majorLines ?? ({} as PalmReading['majorLines']);
  const scores = {
    earth: STRENGTH_WEIGHT[lines.lifeLine?.strength] ?? 0,
    fire: STRENGTH_WEIGHT[lines.sunLine?.strength] ?? 0,
    air: STRENGTH_WEIGHT[lines.headLine?.strength] ?? 0,
    water: STRENGTH_WEIGHT[lines.heartLine?.strength] ?? 0,
  };
  const max = Math.max(...Object.values(scores));
  const winners = ELEMENTS.filter((e) => scores[e.key as keyof typeof scores] === max);
  return winners[seed % winners.length] ?? ELEMENTS[0];
}

export function VedicCertificate({
  reading,
  name,
  reportId,
  generatedAt,
  countryCode,
  hinglish,
}: VedicCertificateProps) {
  const seed = stableHash(`${reportId ?? name}-${generatedAt}`);
  const year = new Date(generatedAt).getFullYear();
  const region = (countryCode || 'IN').toUpperCase().slice(0, 2);
  const serial = (seed % 10000).toString().padStart(4, '0');
  const certificateId = `PM-${year}-${region}-${serial}`;

  const element = handElement(reading, seed);
  const mount = dominantMount(reading);

  const rows = [
    {
      label: hinglish ? 'Hast Prakaar (Hand Type)' : 'Hand Classification',
      value: `${element.name} · ${element.sanskrit}`,
      note: element.trait,
    },
    {
      label: hinglish ? 'Pradhan Parvat (Dominant Mount)' : 'Dominant Planetary Mount',
      value: `${mount.en} · ${mount.sanskrit}`,
      note: hinglish ? 'Aapki sabse ubhri hui energy' : 'Your most pronounced energy centre',
    },
    {
      label: hinglish ? 'Verification ID' : 'Verification ID',
      value: certificateId,
      note: hinglish ? 'Is reading ke liye permanent ID' : 'Permanent ID for this reading',
    },
  ];

  return (
    <m.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-6"
      aria-label={hinglish ? 'Hastarekha praman patra' : 'Hastarekha authenticity certificate'}
    >
      <div className="relative glass-premium rounded-3xl border border-accent/30 p-5 sm:p-7 overflow-hidden">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
        <div aria-hidden="true" className="absolute -bottom-20 -left-16 w-52 h-52 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-accent uppercase tracking-[0.18em]">
              <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" />
              {hinglish ? 'Hastarekha Praman Patra' : 'Hastarekha Certificate'}
            </p>
            <h2 className="mt-1.5 font-serif text-lg sm:text-2xl font-bold text-foreground leading-tight">
              {hinglish ? 'Biometric Palm Praman' : 'Biometric Palm Record'}{' '}
              <span className="text-gradient-gold block sm:inline">{name}</span>
            </h2>
          </div>

          {/* Gold Vedic seal */}
          <div className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20" aria-hidden="true">
            <div className="absolute inset-0 rounded-full bg-gradient-gold opacity-20 blur-md" />
            <div className="relative w-full h-full rounded-full border-2 border-accent/60 flex items-center justify-center">
              <div className="absolute inset-1.5 rounded-full border border-accent/30 border-dashed" />
              <Hand className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
            </div>
          </div>
        </div>

        <div aria-hidden="true" className="relative my-4 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

        <dl className="relative grid gap-3 sm:grid-cols-3">
          {rows.map((row) => (
            <div key={row.label} className="rounded-2xl bg-background/40 border border-border/50 p-3.5 min-w-0">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {row.label}
              </dt>
              <dd className="mt-1 font-serif text-sm sm:text-base font-semibold text-foreground break-words">
                {row.value}
              </dd>
              <p className="mt-1 text-[11px] text-muted-foreground leading-snug">{row.note}</p>
            </div>
          ))}
        </dl>

        <p className="relative mt-4 flex items-start gap-1.5 text-[11px] text-muted-foreground leading-relaxed">
          <Sparkles className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
          {hinglish
            ? 'Yeh record aapki upload ki hui palm image se banaya gaya hai. ID har baar same rahegi.'
            : 'Generated from the palm photograph you uploaded. This ID stays the same every time you open the report.'}
        </p>
      </div>
    </m.section>
  );
}
