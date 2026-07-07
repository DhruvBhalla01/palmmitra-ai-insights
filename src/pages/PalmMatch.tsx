import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Upload, X, Camera, CheckCircle, ArrowRight, ArrowLeft,
  Sparkles, Shield, Zap, Heart, MessageCircle, Target,
  Infinity as InfinityIcon, Star, Lock, Loader2,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Step = 1 | 2;
type ProcessingState = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';
type UploadStatus = 'idle' | 'uploading' | 'ready' | 'error';

const RELATIONSHIP_TYPES = [
  'Partner', 'Spouse', 'Friend', 'Sibling', 'Parent-Child', 'Business Partner',
];

const processingMessages = [
  'Encrypting palm images…',
  'Detecting heart line & mounts…',
  'Comparing emotional patterns…',
  'Aligning communication signals…',
  'Composing your compatibility report…',
];

const sampleDimensions = [
  { icon: Heart,          label: 'Emotional Bond',     score: 91, color: 'hsl(340 82% 65%)' },
  { icon: MessageCircle,  label: 'Communication',      score: 84, color: 'hsl(200 82% 65%)' },
  { icon: Target,         label: 'Shared Goals',       score: 89, color: 'hsl(42 87% 60%)'  },
  { icon: InfinityIcon,   label: 'Spiritual Alignment', score: 78, color: 'hsl(260 60% 70%)' },
];

// ─── Step Indicator ─────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-center gap-2 mb-2">
        {[1, 2].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                current > n
                  ? 'bg-accent text-foreground'
                  : current === n
                  ? 'bg-accent text-foreground ring-4 ring-accent/20'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {current > n ? <CheckCircle className="w-4 h-4" /> : n}
            </div>
            {n === 1 && (
              <div className={`w-10 h-px ${current > 1 ? 'bg-accent' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-[11px] uppercase tracking-[0.24em] text-muted-foreground font-semibold">
        Step {current} of 2 · {current === 1 ? 'Your palm' : 'Their palm'}
      </p>
    </div>
  );
}

// ─── Report Preview Card ────────────────────────────────────────────────────
function ReportPreviewCard() {
  return (
    <div
      className="glass-premium rounded-2xl border border-accent/25 p-5 text-left mx-auto max-w-sm"
      style={{ boxShadow: '0 8px 40px hsl(42 87% 55% / 0.12)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] text-white/50 uppercase tracking-[0.22em] font-bold mb-0.5">
            Sample report preview
          </p>
          <p className="text-sm font-semibold text-white/90">Priya & Arjun</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-serif font-bold text-gradient-gold leading-none">87%</div>
          <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">Compatibility</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {sampleDimensions.map(({ icon: Icon, label, score, color }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
            <span className="text-xs text-white/75 flex-1 truncate">{label}</span>
            <div className="w-16 h-1 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${score}%`, background: color }}
              />
            </div>
            <span className="text-xs font-semibold text-white/80 tabular-nums w-8 text-right">
              {score}%
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-accent" fill="currentColor" />
          <span className="text-[11px] text-white/70">Long-term potential</span>
        </div>
        <span className="text-[11px] font-semibold text-accent">Strong</span>
      </div>
    </div>
  );
}

// ─── Image Upload Zone (with background upload) ────────────────────────────
function ImageUploadZone({
  image, status, onFile, onClear, label, hint,
}: {
  image: string | null;
  status: UploadStatus;
  onFile: (file: File, preview: string) => void;
  onClear: () => void;
  label: string;
  hint: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) onFile(file, e.target.result as string);
    };
    reader.readAsDataURL(file);
  }, [onFile]);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-base font-semibold text-foreground">{label}</h3>
        <span className="text-[11px] text-muted-foreground">{hint}</span>
      </div>

      {image ? (
        <div
          className="relative rounded-2xl overflow-hidden border border-accent/40 animate-fade-in"
          style={{ boxShadow: '0 0 32px hsl(42 87% 55% / 0.18)' }}
        >
          <img src={image} alt="Palm preview" className="w-full h-48 object-cover" />

          {/* AI scan line overlay while uploading */}
          {status === 'uploading' && (
            <>
              <div className="absolute inset-0 bg-background/30" />
              <div
                className="absolute left-0 right-0 h-16 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(180deg, transparent, hsl(42 87% 55% / 0.35), transparent)',
                  animation: 'scanY 1.6s ease-in-out infinite',
                }}
              />
            </>
          )}

          <button
            onClick={onClear}
            aria-label="Remove image"
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-background/90 border border-border flex items-center justify-center hover:bg-background transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 to-transparent p-3">
            <div className="flex items-center gap-2">
              {status === 'ready' ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-foreground/90">
                    Palm analyzed · Ready
                  </span>
                </>
              ) : status === 'uploading' ? (
                <>
                  <Loader2 className="w-4 h-4 text-accent animate-spin" />
                  <span className="text-xs text-foreground/80">
                    AI preprocessing your palm…
                  </span>
                </>
              ) : status === 'error' ? (
                <span className="text-xs text-destructive">Upload failed — tap × to retry</span>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative w-full rounded-2xl overflow-hidden transition-transform duration-200 active:scale-[0.99]"
          style={{
            border: '1px dashed hsl(42 87% 55% / 0.35)',
            background:
              'linear-gradient(135deg, hsl(42 87% 55% / 0.04), hsl(260 50% 55% / 0.03))',
          }}
        >
          {/* Premium animated corners */}
          <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t border-l border-accent/60 rounded-tl pointer-events-none" />
          <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t border-r border-accent/60 rounded-tr pointer-events-none" />
          <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b border-l border-accent/60 rounded-bl pointer-events-none" />
          <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b border-r border-accent/60 rounded-br pointer-events-none" />

          {/* Soft pulse */}
          <div
            className="absolute inset-8 rounded-full bg-accent/10 blur-3xl pointer-events-none"
            style={{ animation: 'pulseGlow 3s ease-in-out infinite' }}
          />

          <div className="relative p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center mx-auto mb-4">
              <Camera className="w-6 h-6 text-accent" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              Tap to upload palm photo
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              JPG, PNG or WEBP · Open palm, good lighting
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-accent/80">
              <Upload className="w-3 h-3" /> Gallery
              <span className="text-muted-foreground/50 mx-1.5">·</span>
              <Camera className="w-3 h-3" /> Camera
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) processFile(f);
            }}
          />
        </button>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function PalmMatch() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [processing, setProcessing] = useState<ProcessingState>('idle');
  const [processingMsgIdx, setProcessingMsgIdx] = useState(0);

  const [image1, setImage1] = useState<string | null>(null);
  const [image2, setImage2] = useState<string | null>(null);
  const [url1, setUrl1] = useState<string | null>(null);
  const [url2, setUrl2] = useState<string | null>(null);
  const [status1, setStatus1] = useState<UploadStatus>('idle');
  const [status2, setStatus2] = useState<UploadStatus>('idle');

  const [person1Name, setPerson1Name] = useState('');
  const [person1Age, setPerson1Age] = useState('');
  const [person2Name, setPerson2Name] = useState('');
  const [person2Age, setPerson2Age] = useState('');
  const [relationshipType, setRelationshipType] = useState('');
  const [email, setEmail] = useState('');

  // Background upload
  const uploadInBackground = useCallback(
    async (
      file: File,
      slot: 'person1' | 'person2',
      setUrl: (u: string) => void,
      setStatus: (s: UploadStatus) => void,
    ) => {
      setStatus('uploading');
      try {
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `palmmatch/${Date.now()}_${slot}.${ext}`;
        const { error } = await supabase.storage
          .from('palm-uploads')
          .upload(path, file, { upsert: true });
        if (error) throw error;
        const { data } = supabase.storage.from('palm-uploads').getPublicUrl(path);
        setUrl(data.publicUrl);
        setStatus('ready');
      } catch (e) {
        console.error('bg upload failed', e);
        setStatus('error');
      }
    },
    [],
  );

  const handleImage1 = (file: File, preview: string) => {
    setImage1(preview);
    setUrl1(null);
    uploadInBackground(file, 'person1', setUrl1, setStatus1);
  };
  const handleImage2 = (file: File, preview: string) => {
    setImage2(preview);
    setUrl2(null);
    uploadInBackground(file, 'person2', setUrl2, setStatus2);
  };
  const clearImage1 = () => { setImage1(null); setUrl1(null); setStatus1('idle'); };
  const clearImage2 = () => { setImage2(null); setUrl2(null); setStatus2('idle'); };

  // Rotate messages during processing
  useEffect(() => {
    if (processing === 'idle' || processing === 'error' || processing === 'complete') return;
    const iv = setInterval(
      () => setProcessingMsgIdx((i) => (i + 1) % processingMessages.length),
      2200,
    );
    return () => clearInterval(iv);
  }, [processing]);

  const handleSubmit = async () => {
    if (
      !image1 || !image2 || !person1Name || !person1Age || !person2Name ||
      !person2Age || !relationshipType || !email
    ) {
      toast({
        title: 'Almost there',
        description: 'Please complete all fields to reveal your compatibility.',
        variant: 'destructive',
      });
      return;
    }

    setProcessing('uploading');

    try {
      // Wait for background uploads to finish
      const waitFor = async (
        getUrl: () => string | null,
        getStatus: () => UploadStatus,
      ) => {
        let tries = 0;
        while (!getUrl() && getStatus() !== 'error' && tries < 100) {
          await new Promise((r) => setTimeout(r, 200));
          tries++;
        }
      };
      await Promise.all([
        waitFor(() => url1, () => status1),
        waitFor(() => url2, () => status2),
      ]);

      if (!url1 || !url2) throw new Error('Upload failed. Please re-select your palm images.');

      setProcessing('analyzing');

      const { data, error } = await supabase.functions.invoke('analyze-palmmatch', {
        body: {
          image1Url: url1,
          image2Url: url2,
          person1: { name: person1Name, age: person1Age },
          person2: { name: person2Name, age: person2Age },
          relationshipType,
          email,
        },
      });

      if (error || !data?.success) {
        if (data?.error === 'invalid_palm') {
          toast({
            title: 'We couldn\'t read that palm',
            description: data.message || 'Please re-upload a clearer palm photo.',
            variant: 'destructive',
          });
          setProcessing('idle');
          setStep(data.person === 'person2' ? 2 : 1);
          return;
        }
        throw new Error(data?.error || 'Analysis failed');
      }

      sessionStorage.setItem(
        'palmMatchData',
        JSON.stringify({
          reading: data.reading,
          reportId: data.reportId,
          person1Name, person1Age, person2Name, person2Age,
          relationshipType, email,
          image1Url: url1, image2Url: url2,
        }),
      );

      setProcessing('complete');
      setTimeout(() => navigate(`/palmmatch-report/${data.reportId}`), 900);
    } catch (err) {
      console.error('PalmMatch error:', err);
      toast({
        title: 'Analysis failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
      setProcessing('error');
    }
  };

  const canAdvanceStep1 = image1 && person1Name && person1Age;
  const canAdvanceStep2 = image2 && person2Name && person2Age && relationshipType && email;

  // ─── Processing Screen ─────────────────────────────────────────────────
  if (processing !== 'idle' && processing !== 'error') {
    const isDone = processing === 'complete';
    const isAnalyzing = processing === 'analyzing' || isDone;
    const stages = [
      { text: 'Palm images encrypted', done: true },
      { text: 'AI reading both palm lines', done: isAnalyzing },
      { text: 'Comparing compatibility patterns', done: isDone },
      { text: 'Composing your report', done: isDone },
    ];
    const progressPct = isDone ? 100 : isAnalyzing ? 74 : 32;

    return (
      <div className="min-h-screen bg-gradient-mystic flex items-center justify-center px-4">
        <div className="text-center max-w-sm w-full">
          {/* Minimal AI ring */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div
              className="absolute inset-0 rounded-full border-2 border-accent/20"
              style={{ animation: isDone ? 'none' : 'spin 3s linear infinite' }}
            />
            <div
              className="absolute inset-2 rounded-full border-2 border-transparent border-t-accent"
              style={{ animation: isDone ? 'none' : 'spin 1.4s linear infinite reverse' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {isDone ? (
                <CheckCircle className="w-10 h-10 text-accent" />
              ) : (
                <Sparkles className="w-8 h-8 text-accent" />
              )}
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">
            {isDone ? 'Your report is ready' : 'Analyzing compatibility'}
          </h2>
          <p className="text-white/50 text-sm mb-8">
            {isDone
              ? 'Opening your PalmMatch report…'
              : 'Our AI is comparing both palms in real time.'}
          </p>

          <div className="space-y-3 mb-6 text-left">
            {stages.map((stage) => (
              <div
                key={stage.text}
                className={`flex items-center gap-3 text-sm transition-colors ${
                  stage.done ? 'text-white/90' : 'text-white/30'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    stage.done ? 'bg-accent' : 'bg-white/10'
                  }`}
                >
                  {stage.done ? (
                    <CheckCircle className="w-3 h-3 text-foreground" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  )}
                </div>
                {stage.text}
              </div>
            ))}
          </div>

          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden max-w-xs mx-auto mb-2">
            <div
              className="h-full rounded-full transition-[width] duration-1000 ease-out"
              style={{
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, hsl(42 87% 55%), hsl(42 90% 72%))',
              }}
            />
          </div>
          <p className="text-white/40 text-xs tabular-nums">{progressPct}% complete</p>

          {!isDone && (
            <AnimatePresence mode="wait">
              <motion.p
                key={processingMsgIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-white/45 text-xs mt-4"
              >
                {processingMessages[processingMsgIdx]}
              </motion.p>
            </AnimatePresence>
          )}
        </div>
      </div>
    );
  }

  // ─── Main Upload UI ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <style>{`
        @keyframes scanY {
          0%   { top: -20%; }
          100% { top: 100%; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(0.95); }
          50%      { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>

      <main className="pt-20 pb-16">
        {/* ── Compact Hero (mobile-first, above-fold value) ── */}
        <section className="bg-gradient-mystic px-4 pt-8 pb-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, hsl(42 87% 55%) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[380px] h-[240px] rounded-full bg-accent/10 blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto text-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 glass-premium rounded-full px-3 py-1 mb-4 border border-accent/25">
              <Sparkles className="w-3 h-3 text-accent" />
              <span className="text-[11px] font-semibold text-white/80 tracking-wide">
                AI Compatibility · Powered by Ancient Palmistry
              </span>
            </div>

            {/* Product-clear headline */}
            <h1 className="text-[2.1rem] leading-[1.1] md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4">
              AI Compatibility Report
              <span className="block text-gradient-gold mt-1">for Couples</span>
            </h1>

            <p className="text-white/70 text-[15px] md:text-base max-w-md mx-auto mb-5 leading-relaxed">
              Upload both palms. Our AI analyzes your emotional bond, communication,
              shared goals, and long-term potential — in under 3 minutes.
            </p>

            {/* Trust row — visible above fold */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 mb-6 text-[12px] text-white/75">
              <span className="inline-flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-accent" fill="currentColor" />
                4,200+ reports
              </span>
              <span className="text-white/25">·</span>
              <span className="inline-flex items-center gap-1">
                <div className="flex">
                  {[0,1,2,3,4].map((i) => (
                    <Star key={i} className="w-3 h-3 text-accent" fill="currentColor" />
                  ))}
                </div>
                <span className="ml-1">4.9/5</span>
              </span>
              <span className="text-white/25">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-accent" /> Private
              </span>
              <span className="text-white/25">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-accent" /> Under 3 min
              </span>
            </div>

            {/* Report preview card */}
            <ReportPreviewCard />

            <a
              href="#start"
              className="inline-flex items-center gap-1.5 mt-5 text-xs text-accent hover:text-accent/80 transition-colors"
            >
              Start your reading below <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </section>

        {/* ── Wizard ── */}
        <div id="start" className="container mx-auto px-4 max-w-xl -mt-6">
          <div
            className="glass-premium rounded-3xl border border-accent/20 overflow-hidden"
            style={{ boxShadow: '0 20px 60px hsl(245 58% 25% / 0.15)' }}
          >
            <div
              className="h-[3px] w-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent, hsl(42 87% 55%), hsl(260 50% 65%), hsl(42 87% 55%), transparent)',
              }}
            />
            <div className="p-6 md:p-8">
              <StepIndicator current={step} />

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ImageUploadZone
                      image={image1}
                      status={status1}
                      onFile={handleImage1}
                      onClear={clearImage1}
                      label="Upload your palm"
                      hint="Right hand · dominant"
                    />

                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <div>
                        <Label htmlFor="p1name" className="text-xs font-semibold mb-1.5 block">
                          Your name
                        </Label>
                        <Input
                          id="p1name"
                          placeholder="e.g. Priya"
                          value={person1Name}
                          onChange={(e) => setPerson1Name(e.target.value)}
                          className="rounded-xl h-11"
                        />
                      </div>
                      <div>
                        <Label htmlFor="p1age" className="text-xs font-semibold mb-1.5 block">
                          Your age
                        </Label>
                        <Input
                          id="p1age"
                          type="number"
                          inputMode="numeric"
                          placeholder="e.g. 28"
                          min="10"
                          max="100"
                          value={person1Age}
                          onChange={(e) => setPerson1Age(e.target.value)}
                          className="rounded-xl h-11"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      Age helps AI personalize compatibility timelines and life-stage analysis.
                    </p>

                    <Button
                      onClick={() => setStep(2)}
                      disabled={!canAdvanceStep1}
                      className="btn-gold w-full mt-6 h-12 rounded-2xl text-foreground font-semibold text-[15px] gap-2"
                    >
                      Continue — add their palm
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ImageUploadZone
                      image={image2}
                      status={status2}
                      onFile={handleImage2}
                      onClear={clearImage2}
                      label="Upload their palm"
                      hint="Their dominant hand"
                    />

                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <div>
                        <Label htmlFor="p2name" className="text-xs font-semibold mb-1.5 block">
                          Their name
                        </Label>
                        <Input
                          id="p2name"
                          placeholder="e.g. Arjun"
                          value={person2Name}
                          onChange={(e) => setPerson2Name(e.target.value)}
                          className="rounded-xl h-11"
                        />
                      </div>
                      <div>
                        <Label htmlFor="p2age" className="text-xs font-semibold mb-1.5 block">
                          Their age
                        </Label>
                        <Input
                          id="p2age"
                          type="number"
                          inputMode="numeric"
                          placeholder="e.g. 30"
                          min="10"
                          max="100"
                          value={person2Age}
                          onChange={(e) => setPerson2Age(e.target.value)}
                          className="rounded-xl h-11"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label className="text-xs font-semibold mb-1.5 block">
                        Relationship
                      </Label>
                      <Select value={relationshipType} onValueChange={setRelationshipType}>
                        <SelectTrigger className="rounded-xl h-11">
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          {RELATIONSHIP_TYPES.map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="mt-4">
                      <Label htmlFor="email" className="text-xs font-semibold mb-1.5 block">
                        Email for your report
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        inputMode="email"
                        placeholder="you@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl h-11"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        We'll send your report here. No spam, ever.
                      </p>
                    </div>

                    <div className="flex gap-2 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="rounded-2xl h-12 px-4 gap-1.5 border-accent/25 text-foreground/80"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!canAdvanceStep2}
                        className="btn-gold flex-1 h-12 rounded-2xl text-foreground font-semibold text-[15px] gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Reveal our compatibility
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Trust row under card */}
              <div className="grid grid-cols-2 gap-2 mt-6 pt-5 border-t border-border/40">
                {[
                  { icon: Lock, text: 'Images encrypted' },
                  { icon: Shield, text: 'Deleted after analysis' },
                  { icon: Sparkles, text: 'AI compares both palms' },
                  { icon: Zap, text: 'Ready in under 3 min' },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-2 text-[11px] text-muted-foreground"
                  >
                    <Icon className="w-3 h-3 text-accent flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
