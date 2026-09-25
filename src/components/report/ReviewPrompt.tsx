import { useState } from 'react';
import { Star, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { analytics } from '@/lib/analytics';

interface ReviewPromptProps {
  defaultName?: string;
  source: 'report' | 'palmmatch';
}

export function ReviewPrompt({ defaultName = '', source }: ReviewPromptProps) {
  const [rating, setRating] = useState(0);
  const [quote, setQuote] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const submit = async () => {
    if (!rating || quote.trim().length < 10) return;
    setState('sending');
    const { error } = await supabase.from('testimonials').insert({
      name: (defaultName || 'A PalmMitra customer').slice(0, 60),
      quote: quote.trim().slice(0, 500),
      rating,
      source,
    });
    if (error) {
      setState('error');
      analytics.track('review_submit_failed', { source });
    } else {
      setState('done');
      analytics.track('review_submitted', { source, rating });
    }
  };

  if (state === 'done') {
    return (
      <section className="glass-premium rounded-2xl border border-accent/20 p-6 text-center mb-12">
        <Heart className="w-7 h-7 text-accent mx-auto mb-2" aria-hidden="true" />
        <p className="font-serif text-lg text-foreground">Thank you for your words</p>
        <p className="text-sm text-muted-foreground mt-1">Your review will appear on our home page once approved.</p>
      </section>
    );
  }

  return (
    <section className="glass-premium rounded-2xl border border-accent/20 p-6 mb-12" aria-labelledby="review-heading">
      <h2 id="review-heading" className="font-serif text-xl text-foreground text-center">How was your reading?</h2>
      <p className="text-sm text-muted-foreground text-center mt-1 mb-4">A few honest words help others trust their own reading.</p>
      <div className="flex justify-center gap-2 mb-4" role="radiogroup" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onClick={() => setRating(n)}
            className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-accent/10"
          >
            <Star className={`w-6 h-6 ${n <= rating ? 'fill-accent text-accent' : 'text-muted-foreground/40'}`} aria-hidden="true" />
          </button>
        ))}
      </div>
      <Textarea
        value={quote}
        onChange={(e) => setQuote(e.target.value)}
        placeholder="What felt true in your reading? (min. 10 characters)"
        maxLength={500}
        rows={3}
        className="mb-3"
      />
      <Button
        onClick={submit}
        disabled={!rating || quote.trim().length < 10 || state === 'sending'}
        className="btn-gold w-full rounded-xl min-h-11 font-semibold"
      >
        {state === 'sending' ? 'Sending…' : 'Share your review'}
      </Button>
      {state === 'error' && <p className="text-sm text-destructive text-center mt-2">Couldn't send your review. Please try again.</p>}
    </section>
  );
}
