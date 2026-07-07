import { useState } from 'react';
import { AiPaywall } from '@/components/ai/AiPaywall';
import { PremiumBackground } from '@/components/PremiumBackground';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { AiPlanId } from '@/config/ai-pricing';

export default function AiUpgrade() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const handle = (_p: AiPlanId) => { void _p; /* delegated via chat flow */ };
  return (
    <div className="min-h-screen relative bg-[#050302] text-amber-50">
      <PremiumBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto max-w-2xl px-6 pt-20 text-center">
          <h1 className="font-serif text-4xl text-amber-100">PalmMitra AI Elite</h1>
          <p className="mt-3 text-amber-100/60">Continue your AI guidance any time.</p>
          <Button onClick={() => setOpen(true)} className="mt-6 bg-gradient-to-b from-amber-300 to-amber-500 text-black">View plans</Button>
          <div className="mt-4">
            <button className="text-amber-100/60 text-sm hover:text-amber-100" onClick={() => navigate(-1)}>← Back</button>
          </div>
        </div>
      </div>
      <AiPaywall open={open} onOpenChange={setOpen} onSelect={handle} reason="upsell" />
    </div>
  );
}
