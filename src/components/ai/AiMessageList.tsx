import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { UiMessage } from '@/hooks/useAiChatStream';
import { motion } from 'framer-motion';

interface Props {
  messages: UiMessage[];
  userInitial?: string;
}

export function AiMessageList({ messages, userInitial = 'You' }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  return (
    <div className="space-y-5">
      {messages.map((m) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
        >
          {m.role === 'user' ? (
            <div className="max-w-[85%] rounded-2xl rounded-tr-md px-4 py-2.5 text-[15px] leading-relaxed
              bg-[linear-gradient(135deg,hsl(var(--gold)),hsl(var(--gold-light)))]
              text-[hsl(240_10%_10%)] font-medium
              shadow-[0_8px_24px_-8px_hsl(var(--gold)/0.55),inset_0_1px_0_hsl(var(--gold-light))]">
              {m.content}
            </div>
          ) : (
            <div className="max-w-[92%] flex gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--gold)/0.7)] mb-1.5 px-1">PalmMitra AI</div>
                <div className="relative rounded-2xl rounded-tl-md border border-[hsl(var(--gold)/0.22)] bg-[linear-gradient(160deg,hsl(245_58%_12%/0.85),hsl(245_58%_8%/0.9))] backdrop-blur-xl px-4 py-3
                  shadow-[0_10px_30px_-12px_hsl(var(--gold)/0.25),inset_0_1px_0_hsl(var(--gold)/0.1)]">
                  <div className="prose prose-sm prose-invert max-w-none text-foreground/95 leading-relaxed
                    [&_p]:my-2 [&_ul]:my-2 [&_li]:my-1
                    [&_strong]:text-[hsl(var(--gold-light))] [&_strong]:font-semibold
                    [&_a]:text-[hsl(var(--gold-light))] [&_a]:no-underline hover:[&_a]:underline
                    [&_code]:text-[hsl(var(--gold-light))] [&_code]:bg-black/30 [&_code]:px-1 [&_code]:rounded">
                    {m.content
                      ? <ReactMarkdown>{m.content}</ReactMarkdown>
                      : <ReadingShimmer />}
                    {m.streaming && m.content && (
                      <span className="inline-block w-[3px] h-[1em] bg-[hsl(var(--gold))] ml-0.5 align-middle animate-pulse rounded-sm shadow-[0_0_8px_hsl(var(--gold)/0.9)]" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      ))}
      <div ref={endRef} aria-hidden />
      <span className="sr-only">{userInitial}</span>
    </div>
  );
}

const READING_PHRASES = [
  'Reading your palm…',
  'Analyzing life line…',
  'Connecting ancient wisdom…',
  'Discovering hidden patterns…',
];

function ReadingShimmer() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % READING_PHRASES.length), 1600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-2 py-1" aria-label="Thinking">
      <span className="relative h-2 w-2">
        <span className="absolute inset-0 rounded-full bg-[hsl(var(--gold))] animate-ping opacity-70" />
        <span className="absolute inset-0 rounded-full bg-[hsl(var(--gold))]" />
      </span>
      <motion.span
        key={idx}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-sm italic bg-[linear-gradient(90deg,hsl(var(--gold)/0.5),hsl(var(--gold-light)),hsl(var(--gold)/0.5))] bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer"
      >
        {READING_PHRASES[idx]}
      </motion.span>
    </div>
  );
}
