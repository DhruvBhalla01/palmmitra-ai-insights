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
  const [focused, setFocused] = useState(false);
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
    <div
      className={`rounded-2xl border p-2 backdrop-blur-xl transition-all duration-300
        ${focused
          ? 'border-[hsl(var(--gold)/0.55)] bg-[hsl(245_58%_8%/0.85)] shadow-[0_0_0_1px_hsl(var(--gold)/0.35),0_10px_40px_-10px_hsl(var(--gold)/0.35)]'
          : 'border-[hsl(var(--gold)/0.2)] bg-[hsl(245_58%_8%/0.7)] shadow-[0_10px_30px_-12px_hsl(var(--gold)/0.15)]'
        }`}
    >
      <div className="flex items-end gap-2">
        <textarea
          ref={ref}
          value={value}
          onChange={e => setValue(e.target.value.slice(0, AI_CONFIG.MAX_MESSAGE_CHARS))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
          }}
          placeholder={placeholder ?? 'Ask about your palm...'}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-relaxed text-foreground placeholder:text-foreground/35 focus:outline-none disabled:opacity-40"
        />
        {streaming ? (
          <button
            onClick={onStop}
            aria-label="Stop"
            className="h-10 w-10 shrink-0 rounded-xl bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold-light))] hover:bg-[hsl(var(--gold)/0.25)] flex items-center justify-center transition-all border border-[hsl(var(--gold)/0.3)]"
          >
            <Square className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={disabled || !value.trim()}
            aria-label="Send"
            className="h-10 w-10 shrink-0 rounded-xl bg-[linear-gradient(135deg,hsl(var(--gold)),hsl(var(--gold-light)))] text-[hsl(240_10%_10%)] flex items-center justify-center transition-all
              shadow-[0_6px_20px_-6px_hsl(var(--gold)/0.7),inset_0_1px_0_hsl(var(--gold-light))]
              hover:shadow-[0_8px_28px_-6px_hsl(var(--gold)/0.9),inset_0_1px_0_hsl(var(--gold-light))]
              hover:scale-[1.03]
              disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100"
          >
            <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
          </button>
        )}
      </div>
      <div className="px-3 pb-1 pt-1 text-[10px] text-foreground/35 flex justify-between">
        <span>Enter to send · Shift+Enter for new line</span>
        <span>{value.length}/{AI_CONFIG.MAX_MESSAGE_CHARS}</span>
      </div>
    </div>
  );
}
