import { m } from '@/lib/motion';

interface Props {
  person1Name: string;
  person2Name: string;
  score: number;         // 0-100 shared dimension score
  trait: string;         // e.g. "Empathy"
  color: string;         // dimension accent color
  seed?: number;         // deterministic differentiator
}

// Deterministic mini-hash for stable per-person values
function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function CompareBar({ person1Name, person2Name, score, trait, color, seed = 0 }: Props) {
  // Spread around the shared score by ±6 pts, deterministic per name+trait
  const delta1 = ((hash(person1Name + trait) + seed) % 13) - 6;
  const delta2 = ((hash(person2Name + trait) + seed * 3) % 13) - 6;
  const v1 = Math.max(45, Math.min(99, score + delta1));
  const v2 = Math.max(45, Math.min(99, score + delta2));

  return (
    <div className="rounded-xl border border-accent/15 bg-accent/[0.03] p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color }}>
          {trait}
        </p>
        <p className="text-[10px] text-foreground/50">Palm reading match</p>
      </div>
      {[
        { name: person1Name, val: v1 },
        { name: person2Name, val: v2 },
      ].map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-1.5 last:mb-0">
          <span className="text-[11px] text-foreground/80 w-16 truncate">{p.name}</span>
          <div className="flex-1 h-1.5 rounded-full bg-foreground/8 overflow-hidden">
            <m.div
              initial={{ width: 0 }}
              whileInView={{ width: `${p.val}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.1 + i * 0.15 }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
            />
          </div>
          <span className="text-[11px] font-bold tabular-nums w-8 text-right" style={{ color }}>
            {p.val}
          </span>
        </div>
      ))}
    </div>
  );
}
