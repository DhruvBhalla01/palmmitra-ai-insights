import { Zap, Languages, Shield, Moon, MessageCircle, Sparkles } from 'lucide-react';

const items = [
  { icon: Zap, text: 'Free preview in about 2 minutes' },
  { icon: MessageCircle, text: '3 free AI questions with your reading' },
  { icon: Languages, text: 'English & Hinglish readings' },
  { icon: Shield, text: 'Private & secure — never shared' },
  { icon: Moon, text: 'Ready 24×7, even at 3 AM' },
  { icon: Sparkles, text: 'Rooted in Hasta Samudrika Shastra' },
];

export function PromiseMarquee() {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-accent/15 bg-card/40 py-3" aria-label="What you get with PalmMitra">
      <ul className="sr-only">{items.map((i) => <li key={i.text}>{i.text}</li>)}</ul>
      <div className="flex w-max gap-10 animate-promise-marquee motion-reduce:animate-none" aria-hidden="true">
        {row.map(({ icon: Icon, text }, i) => (
          <span key={i} className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
            <Icon className="w-4 h-4 text-accent" /> {text}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
