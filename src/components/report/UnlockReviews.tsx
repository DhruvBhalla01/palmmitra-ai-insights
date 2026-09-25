import { useEffect, useState } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Review {
  name: string;
  quote: string;
  rating: number;
}

/**
 * Compact strip of approved customer reviews shown beside the unlock CTA.
 * Renders nothing until at least one approved review exists.
 */
export function UnlockReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    supabase
      .from('testimonials')
      .select('name,quote,rating')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data?.length) setReviews(data);
      });
  }, []);

  if (!reviews.length) return null;

  return (
    <div className="mt-5" aria-label="Customer reviews">
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold mb-3 text-center">
        What customers say after unlocking
      </p>
      <div className="grid sm:grid-cols-3 gap-2.5">
        {reviews.map((r) => (
          <figure
            key={r.name + r.quote.slice(0, 12)}
            className="rounded-xl border border-border/50 bg-background/40 p-3.5 flex flex-col gap-2"
          >
            <div className="flex gap-0.5" role="img" aria-label={`${r.rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < r.rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <blockquote className="text-xs text-foreground/80 leading-relaxed flex-1">
              "{r.quote.length > 140 ? r.quote.slice(0, 140).trimEnd() + '…' : r.quote}"
            </blockquote>
            <figcaption className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground/90">{r.name}</span>
              <span className="inline-flex items-center gap-0.5 text-emerald-500 font-semibold">
                <CheckCircle className="w-3 h-3" aria-hidden="true" />
                Verified
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
