import { useEffect, useRef } from 'react';
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
    <div className="space-y-6">
      {messages.map((m) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
        >
          {m.role === 'user' ? (
            <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-amber-500/10 border border-amber-500/25 px-4 py-3 text-amber-50 text-[15px] leading-relaxed">
              {m.content}
            </div>
          ) : (
            <div className="max-w-[92%] flex gap-3">
              <div className="shrink-0 mt-1 h-8 w-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-black text-xs font-semibold flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.35)]">
                PM
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-[0.18em] text-amber-300/60 mb-1">PalmMitra AI</div>
                <div className="prose prose-sm prose-invert max-w-none text-amber-50/95 leading-relaxed [&_p]:my-2 [&_ul]:my-2 [&_strong]:text-amber-200">
                  {m.content
                    ? <ReactMarkdown>{m.content}</ReactMarkdown>
                    : <TypingDots />}
                  {m.streaming && m.content && (
                    <span className="inline-block w-1.5 h-4 bg-amber-300 ml-0.5 align-middle animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      ))}
      <div ref={endRef} aria-hidden />
      {/* userInitial preserved for future avatar */}
      <span className="sr-only">{userInitial}</span>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1.5 py-2" aria-label="Thinking">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-bounce [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-bounce [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-bounce" />
    </div>
  );
}
