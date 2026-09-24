import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Lock } from 'lucide-react';
import { validateImageFile } from '@/lib/validation';
import { setPendingPalm } from '@/lib/pendingPalm';
import { useToast } from '@/hooks/use-toast';
import { analytics } from '@/lib/analytics';

export function HeroUploadDrop() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const accept = (file: File | undefined, source: 'drop' | 'picker') => {
    if (!file) return;
    const check = validateImageFile(file);
    if (!check.ok) {
      toast({ title: check.reason ?? 'Invalid file', description: check.suggestion, variant: 'destructive' });
      return;
    }
    analytics.track('hero_upload_selected', { source, file_type: file.type });
    setPendingPalm(file);
    navigate('/upload');
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); accept(e.dataTransfer.files[0], 'drop'); }}
      className={`relative rounded-2xl p-px mb-5 max-w-lg mx-auto lg:mx-0 transition-shadow duration-300 ${dragging ? 'shadow-gold-lg' : 'shadow-gold'}`}
      style={{ background: 'linear-gradient(135deg, hsl(var(--accent) / 0.75), hsl(var(--accent) / 0.12) 45%, hsl(var(--accent) / 0.55))' }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="hidden"
        onChange={(e) => { accept(e.target.files?.[0], 'picker'); e.target.value = ''; }}
      />
      <div className={`relative rounded-[15px] bg-background/90 backdrop-blur-xl px-4 pt-4 pb-3 overflow-hidden ${dragging ? 'bg-accent/10' : ''}`}>
        <div aria-hidden="true" className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-accent/15 blur-2xl" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label="Take or choose a photo of your palm to start your free reading"
          className="group relative w-full flex items-center gap-3.5 text-left min-h-[52px] focus-visible:outline-none"
        >
          <span className="relative w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border border-accent/50 bg-gradient-to-b from-accent/25 to-accent/5">
            <span aria-hidden="true" className="absolute inset-[-4px] rounded-full border border-dashed border-accent/30 group-hover:rotate-45 transition-transform duration-700" />
            <Camera className="w-5 h-5 text-accent" strokeWidth={1.6} aria-hidden="true" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-serif text-[17px] leading-tight font-semibold text-foreground">Snap or drop your palm</span>
            <span className="block text-[11.5px] text-muted-foreground mt-1">Free reading begins instantly</span>
          </span>
          <span className="flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-accent group-hover:bg-accent/20 transition-colors">
            <Upload className="w-3.5 h-3.5" strokeWidth={1.8} aria-hidden="true" /> Upload
          </span>
        </button>
        <div className="mt-3 pt-2.5 border-t border-accent/10 flex items-center justify-between gap-2 text-[10.5px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-accent" strokeWidth={1.8} aria-hidden="true" /> Private · never shared
          </span>
          <span className="tracking-wider uppercase text-[9.5px] text-muted-foreground/70">JPG · PNG · WebP · HEIC</span>
        </div>
      </div>
    </div>
  );
}
