import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { emailSchema } from '@/lib/validation';
import { useToast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  returnTo?: string;
  prefillEmail?: string;
}

export function AiSignInModal({ open, onOpenChange, returnTo, prefillEmail }: Props) {
  const { signInWithOtp } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState(prefillEmail ?? '');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast({ title: 'Enter a valid email', variant: 'destructive' });
      return;
    }
    setBusy(true);
    const { error } = await signInWithOtp(parsed.data, returnTo);
    setBusy(false);
    if (error) {
      toast({ title: 'Could not send link', description: error.message, variant: 'destructive' });
      return;
    }
    setSent(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0d0a08] border-amber-500/20 text-amber-50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-amber-200">
            {sent ? 'Check your inbox' : 'Continue with PalmMitra AI'}
          </DialogTitle>
          <DialogDescription className="text-amber-100/60">
            {sent
              ? `We just sent a secure sign-in link to ${email}. Open it on this device to continue.`
              : 'Enter your email — we\u2019ll send a one-tap sign-in link so your conversations and questions stay yours.'}
          </DialogDescription>
        </DialogHeader>
        {!sent && (
          <form onSubmit={submit} className="space-y-4 pt-2">
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-black/40 border-amber-500/30 text-amber-50"
              disabled={busy}
              required
            />
            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-gradient-to-b from-amber-300 to-amber-500 text-black hover:from-amber-200 hover:to-amber-400 font-medium h-11"
            >
              {busy ? 'Sending…' : 'Send sign-in link'}
            </Button>
            <p className="text-xs text-amber-100/40 text-center">
              No password. We use magic links for security.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
