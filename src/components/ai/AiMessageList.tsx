import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { UiMessage } from '@/hooks/useAiChatStream';
import { m } from '@/lib/motion';
import { Sparkles } from 'lucide-react';

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
    <div className="space-y-6">
      {messages.map((msg) => (
        <m.div
          key={msg.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
        >
          {msg.role === 'user' ? (
            <div className="max-w-[80%] rounded-2xl rounded-tr-md px-4 py-2.5 text-[14.5px] leading-relaxed
              bg-[linear-gradient(135deg,hsl(var(--gold)/0.18),hsl(var(--gold)/0.1))]
              border border-[hsl(var(--gold)/0.35)]
              text-foreground/95
              shadow-[0_6px_20px_-8px_hsl(var(--gold)/0.3),inset_0_1px_0_hsl(var(--gold)/0.2)]">
              {msg.content}
            </div>
          ) : (
            <div className="max-w-full w-full flex flex-col gap-2">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--gold)/0.7)] px-1">PalmMitra AI</div>
              <div className="relative rounded-3xl rounded-tl-lg border border-[hsl(var(--gold)/0.22)] bg-[linear-gradient(160deg,hsl(245_58%_12%/0.85),hsl(245_58%_8%/0.9))] backdrop-blur-xl px-5 py-4 sm:px-6 sm:py-5
                shadow-[0_14px_40px_-16px_hsl(var(--gold)/0.28),inset_0_1px_0_hsl(var(--gold)/0.12)]">
                <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-[hsl(var(--gold)/0.4)] to-transparent" />
                <div className="max-w-none text-foreground/95 text-[15px] leading-[1.75]
                  [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                  [&_p]:my-3
                  [&_h1]:font-serif [&_h1]:text-[22px] [&_h1]:text-foreground [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:leading-tight
                  [&_h2]:font-serif [&_h2]:text-[20px] [&_h2]:text-foreground [&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-[hsl(var(--gold)/0.2)] [&_h2]:leading-tight
                  [&_h3]:font-serif [&_h3]:text-[17px] [&_h3]:text-[hsl(var(--gold-light))] [&_h3]:uppercase [&_h3]:tracking-[0.14em] [&_h3]:mt-6 [&_h3]:mb-2
                  [&_ul]:my-3 [&_ul]:pl-0 [&_ul]:space-y-2 [&_ul]:list-none
                  [&_ul>li]:relative [&_ul>li]:pl-5
                  [&_ul>li]:before:content-[''] [&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:top-[0.7em] [&_ul>li]:before:h-1.5 [&_ul>li]:before:w-1.5 [&_ul>li]:before:rounded-full [&_ul>li]:before:bg-[hsl(var(--gold))] [&_ul>li]:before:shadow-[0_0_6px_hsl(var(--gold)/0.7)]
                  [&_ol]:my-3 [&_ol]:pl-0 [&_ol]:space-y-2.5 [&_ol]:list-decimal [&_ol]:list-inside
                  [&_ol]:marker:text-[hsl(var(--gold-light))] [&_ol]:marker:font-serif [&_ol]:marker:font-semibold
                  [&_strong]:text-[hsl(var(--gold-light))] [&_strong]:font-semibold
                  [&_em]:text-foreground/80 [&_em]:italic
                  [&_a]:text-[hsl(var(--gold-light))] [&_a]:no-underline hover:[&_a]:underline
                  [&_code]:text-[hsl(var(--gold-light))] [&_code]:bg-black/40 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px]
                  [&_hr]:my-6 [&_hr]:border-0 [&_hr]:h-px [&_hr]:bg-gradient-to-r [&_hr]:from-transparent [&_hr]:via-[hsl(var(--gold)/0.3)] [&_hr]:to-transparent
                  [&_blockquote]:relative [&_blockquote]:my-4 [&_blockquote]:pl-5 [&_blockquote]:pr-4 [&_blockquote]:py-3 [&_blockquote]:rounded-2xl [&_blockquote]:border [&_blockquote]:border-[hsl(var(--gold)/0.3)] [&_blockquote]:bg-[hsl(var(--gold)/0.06)]
                  [&_blockquote>*]:not-italic [&_blockquote>p]:my-0 [&_blockquote>p]:text-foreground/85
                  [&_blockquote]:before:content-['From_your_Palm_Report'] [&_blockquote]:before:block [&_blockquote]:before:text-[9px] [&_blockquote]:before:uppercase [&_blockquote]:before:tracking-[0.24em] [&_blockquote]:before:text-[hsl(var(--gold))] [&_blockquote]:before:mb-1.5
                ">
                  {msg.content
                    ? <ReactMarkdown>{msg.content}</ReactMarkdown>
                    : <ReadingShimmer />}
                  {msg.streaming && msg.content && (
                    <span className="inline-block w-[3px] h-[1em] bg-[hsl(var(--gold))] ml-0.5 align-middle animate-pulse rounded-sm shadow-[0_0_8px_hsl(var(--gold)/0.9)]" />
                  )}
                </div>
              </div>
            </div>
          )}
        </m.div>
      ))}
      <div ref={endRef} aria-hidden />
      <span className="sr-only">{userInitial}</span>
    </div>
  );
}

const READING_PHRASES = [
  'Reading your palm…',
  'Reviewing your fate line…',
  'Connecting ancient wisdom…',
  'Understanding your life patterns…',
  'Consulting classical palmistry…',
  'Preparing your guidance…',
  'Generating personalized insight…',
];

function ReadingShimmer() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % READING_PHRASES.length), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-2.5 py-1.5" aria-label="Thinking">
      <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--gold))] animate-pulse" strokeWidth={1.75} />
      <m.span
        key={idx}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="text-[14px] italic bg-[linear-gradient(90deg,hsl(var(--gold)/0.5),hsl(var(--gold-light)),hsl(var(--gold)/0.5))] bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer"
      >
        {READING_PHRASES[idx]}
      </m.span>
    </div>
  );
}
