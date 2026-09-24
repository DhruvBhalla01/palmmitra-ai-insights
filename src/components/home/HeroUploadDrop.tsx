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
      className={`glass-dark rounded-2xl border border-dashed p-4 mb-5 max-w-lg mx-auto lg:mx-0 transition-colors ${
        dragging ? 'border-accent bg-accent/10' : 'border-accent/35'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="hidden"
        onChange={(e) => { accept(e.target.files?.[0], 'picker'); e.target.value = ''; }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Take or choose a photo of your palm to start your free reading"
        className="w-full flex items-center gap-3 text-left min-h-[48px]"
      >
        <span className="w-11 h-11 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0">
          <Camera className="w-5 h-5 text-accent" aria-hidden="true" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-semibold text-primary-foreground">Snap or drop your palm photo</span>
          <span className="block text-[11px] text-primary-foreground/55">Starts your free reading instantly · JPG, PNG, WebP</span>
        </span>
        <Upload className="w-4 h-4 text-accent" aria-hidden="true" />
      </button>
      <p className="flex items-center gap-1.5 text-[10px] text-primary-foreground/45 mt-2 pl-1">
        <Lock className="w-3 h-3 text-accent" aria-hidden="true" /> Stored securely, never shared · delete anytime on request
      </p>
    </div>
  );
}
