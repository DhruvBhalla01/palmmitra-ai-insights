import { useCallback, useRef, useState } from 'react';

export interface UiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

export type ChatError = 'quota' | 'rate_limit' | 'network' | 'auth' | 'unknown';

interface Options {
  reportId: string;
  userEmail: string;
  onQuotaExhausted?: () => void;
  onCompleted?: () => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export function useAiChatStream({ reportId, userEmail, onQuotaExhausted, onCompleted }: Options) {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [status, setStatus] = useState<'idle' | 'sending' | 'streaming'>('idle');
  const [error, setError] = useState<ChatError | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const hydrate = useCallback((initial: UiMessage[]) => setMessages(initial), []);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || status !== 'idle') return;
    setError(null);
    setStatus('sending');

    const userMsg: UiMessage = { id: crypto.randomUUID(), role: 'user', content: trimmed };
    const aiMsgId = crypto.randomUUID();
    setMessages(m => [...m, userMsg, { id: aiMsgId, role: 'assistant', content: '', streaming: true }]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
        },
        body: JSON.stringify({ reportId, userEmail, message: trimmed }),
        signal: ctrl.signal,
      });

      if (res.status === 402) {
        setError('quota');
        setStatus('idle');
        setMessages(m => m.filter(x => x.id !== aiMsgId));
        onQuotaExhausted?.();
        return;
      }
      if (res.status === 429) {
        setError('rate_limit');
        setStatus('idle');
        setMessages(m => m.filter(x => x.id !== aiMsgId));
        return;
      }
      if (res.status === 403 || res.status === 401) {
        setError('auth');
        setStatus('idle');
        setMessages(m => m.filter(x => x.id !== aiMsgId));
        return;
      }
      if (!res.ok || !res.body) {
        setError('network');
        setStatus('idle');
        setMessages(m => m.filter(x => x.id !== aiMsgId));
        return;
      }

      setStatus('streaming');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const raw of lines) {
          if (!raw.startsWith('data:')) continue;
          const payload = raw.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;
          try {
            const evt = JSON.parse(payload) as { delta?: string; done?: boolean };
            if (evt.delta) {
              setMessages(m => m.map(x => x.id === aiMsgId ? { ...x, content: x.content + evt.delta } : x));
            }
          } catch { /* ignore malformed line */ }
        }
      }

      setMessages(m => m.map(x => x.id === aiMsgId ? { ...x, streaming: false } : x));
      setStatus('idle');
      onCompleted?.();
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setError('network');
      setStatus('idle');
      setMessages(m => m.filter(x => x.id !== aiMsgId));
    }
  }, [reportId, userEmail, status, onCompleted, onQuotaExhausted]);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  return { messages, status, error, send, stop, hydrate, setError };
}
