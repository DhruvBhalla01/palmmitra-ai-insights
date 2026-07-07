import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import { AI_CONFIG } from '@/config/ai-pricing';

interface Props {
  onSend: (text: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  streaming?: boolean;
  placeholder?: string;
}

export function AiComposer({ onSend, onStop, disabled, streaming, placeholder }: Props) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  }, [value]);

  const submit = () => {
    const t = value.trim();
    if (!t || disabled) return;
    onSend(t);
    setValue('');
  };

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-black/60 backdrop-blur-xl p-2 shadow-[0_10px_40px_-10px_rgba(251,191,36,0.15)]">
      <div className="flex items-end gap-2">
        <textarea
          ref={ref}
          value={value}
          onChange={e => setValue(e.target.value.slice(0, AI_CONFIG.MAX_MESSAGE_CHARS))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
          }}
          placeholder={placeholder ?? 'Ask PalmMitra AI anything about your life…'}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-relaxed text-amber-50 placeholder:text-amber-100/30 focus:outline-none disabled:opacity-40"
        />
        {streaming ? (
          <button
            onClick={onStop}
            aria-label="Stop"
            className="h-10 w-10 shrink-0 rounded-xl bg-amber-100/10 text-amber-100 hover:bg-amber-100/20 flex items-center justify-center transition-colors"
          >
            <Square className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={disabled || !value.trim()}
            aria-label="Send"
            className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 text-black flex items-center justify-center transition-all hover:from-amber-200 hover:to-amber-400 disabled:from-amber-500/20 disabled:to-amber-500/20 disabled:text-amber-100/30 disabled:cursor-not-allowed"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="px-3 pb-1 pt-0.5 text-[10px] text-amber-100/30 flex justify-between">
        <span>Enter to send · Shift+Enter for new line</span>
        <span>{value.length}/{AI_CONFIG.MAX_MESSAGE_CHARS}</span>
      </div>
    </div>
  );
}
