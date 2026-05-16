import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Upload, X, Camera, Sun, Eye, CheckCircle, Hand,
  ArrowRight, ArrowLeft, Sparkles, Shield, Zap, Users,
  Heart, MessageCircle, Target, Infinity as InfinityIcon,
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

const RELATIONSHIP_TYPES = [
  'Partner', 'Spouse', 'Friend', 'Sibling', 'Parent-Child', 'Business Partner',
];

const photoTips = [
  { icon: Hand, text: 'Open palm facing camera' },
  { icon: Sun, text: 'Good natural lighting' },
  { icon: Eye, text: 'Lines clearly visible' },
  { icon: CheckCircle, text: 'One hand only' },
];

const processingMessages = [
  'Uploading palm images securely...',
  'AI validating both palms...',
  'Comparing destiny patterns...',
  'Calculating compatibility matrix...',
  'Generating your PalmMatch report...',
];

const dimensionIcons = [
  { icon: Heart, label: 'Emotional Bond' },
  { icon: MessageCircle, label: 'Communication' },
  { icon: Target, label: 'Life Goals' },
  { icon: InfinityIcon, label: 'Spiritual Alignment' },
];

const heroParticles = [
  { left: '5%',  top: '18%', size: 6,   delay: 0,   dur: 4.2, diamond: false },
  { left: '91%', top: '24%', size: 4,   delay: 0.8, dur: 3.8, diamond: false },
  { left: '12%', top: '65%', size: 5,   delay: 1.5, dur: 5.0, diamond: false },
  { left: '86%', top: '70%', size: 4,   delay: 2.2, dur: 4.5, diamond: false },
  { left: '50%', top: '9%',  size: 3,   delay: 1.0, dur: 3.5, diamond: true  },
  { left: '33%', top: '82%', size: 3,   delay: 2.8, dur: 4.8, diamond: true  },
  { left: '22%', top: '38%', size: 2.5, delay: 0.4, dur: 6.0, diamond: true  },
  { left: '76%', top: '45%', size: 2.5, delay: 1.8, dur: 5.5, diamond: false },
  { left: '63%', top: '88%', size: 2,   delay: 3.2, dur: 4.0, diamond: true  },
  { left: '8%',  top: '50%', size: 2,   delay: 2.0, dur: 5.2, diamond: false },
];

// ─── Step Indicator ────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: Step }) {
  const steps: { n: Step; label: string; sublabel: string }[] = [
    { n: 1, label: 'Your Hand', sublabel: 'Pahla Hath' },
    { n: 2, label: 'Their Hand', sublabel: 'Doosra Hath' },
  ];
  return (
    <div className="mb-10">
      <p className="text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold mb-4">
        Step {current} of 2
      </p>
      <div className="flex items-center justify-center gap-0">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                animate={
                  current === s.n
                    ? { boxShadow: '0 0 32px hsla(42,87%,55%,0.7)', scale: 1.15 }
                    : { boxShadow: 'none', scale: 1 }
                }
                transition={{ duration: 0.4 }}
                className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                  current > s.n
                    ? 'bg-accent text-foreground'
                    : current === s.n
                    ? 'bg-accent text-foreground ring-4 ring-accent/25'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {current > s.n ? <CheckCircle className="w-5 h-5" /> : s.n}
              </motion.div>
              <span className={`text-xs mt-2 font-semibold text-center leading-tight transition-colors ${
                current >= s.n ? 'text-accent' : 'text-muted-foreground/40'
              }`}>
                {s.label}
              </span>
              <span className={`text-[9px] mt-0.5 italic tracking-wider transition-colors ${
                current >= s.n ? 'text-accent/50' : 'text-muted-foreground/25'
              }`}>
                {s.sublabel}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-24 h-px mb-8 mx-4 overflow-hidden rounded-full"
                style={{ background: current > s.n
                  ? 'linear-gradient(90deg, hsl(42 87% 55%), hsl(42 90% 72%))'
                  : 'hsl(var(--secondary))' }}>
                {current > s.n && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full bg-accent"
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Image Upload Zone ─────────────────────────────────────────────────────
function ImageUploadZone({
  image, onImage, onClear, label, sanskritLabel,
}: {
  image: string | null;
  onImage: (file: File, preview: string) => void;
  onClear: () => void;
  label: string;
  sanskritLabel: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) onImage(file, e.target.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-baseline gap-3 mb-5">
        <h3 className="text-xl font-serif font-bold text-foreground">{label}</h3>
        <span className="text-[11px] text-accent/55 italic tracking-[0.18em]">{sanskritLabel}</span>
      </div>

      {image ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'backOut' }}
          className="relative rounded-2xl overflow-hidden border border-accent/50"
          style={{ boxShadow: '0 0 40px hsl(42 87% 55% / 0.22), 0 0 0 1px hsl(42 87% 55% / 0.15)' }}
        >
          <img src={image} alt="Palm preview" className="w-full h-52 object-cover" />
          <button
            onClick={onClear}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/90 border border-accent/25 flex items-center justify-center hover:bg-background hover:border-accent/50 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
                style={{ boxShadow: '0 0 12px rgba(74,222,128,0.5)' }}>
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground/90 font-serif italic">
                Palm received — destiny awaits ✦
              </span>
            </div>
          </div>
        </motion.div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500"
          style={{
            border: `1px solid hsl(42 87% 55% / ${isDragging ? 0.55 : 0.22})`,
            background: isDragging
              ? 'linear-gradient(135deg, hsl(42 87% 55% / 0.1), hsl(260 50% 55% / 0.06))'
              : 'linear-gradient(135deg, hsl(42 87% 55% / 0.03), hsl(260 50% 55% / 0.02))',
            boxShadow: isDragging
              ? '0 0 50px hsl(42 87% 55% / 0.18), inset 0 0 30px hsl(42 87% 55% / 0.04)'
              : '0 0 0px transparent',
            transform: isDragging ? 'scale(1.015)' : 'scale(1)',
          }}
        >
          {/* Corner bracket ornaments */}
          <div className="absolute top-3 left-3 w-5 h-5 border-t-[1.5px] border-l-[1.5px] border-accent/45 rounded-tl pointer-events-none" />
          <div className="absolute top-3 right-3 w-5 h-5 border-t-[1.5px] border-r-[1.5px] border-accent/45 rounded-tr pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-5 h-5 border-b-[1.5px] border-l-[1.5px] border-accent/45 rounded-bl pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-5 h-5 border-b-[1.5px] border-r-[1.5px] border-accent/45 rounded-br pointer-events-none" />

          <div className="p-10 text-center">
            <motion.div
              animate={{
                y: [0, -12, 0],
                filter: [
                  'drop-shadow(0 4px 12px hsl(42 87% 55% / 0.35))',
                  'drop-shadow(0 8px 28px hsl(42 87% 55% / 0.75))',
                  'drop-shadow(0 4px 12px hsl(42 87% 55% / 0.35))',
                ],
              }}
              transition={{ repeat: Infinity, duration: 3.4, ease: 'easeInOut' }}
              className="text-6xl mb-5 select-none leading-none"
            >
              🤚
            </motion.div>
            <p className="text-base font-serif font-semibold text-foreground mb-1.5">
              Place your palm before the universe
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Tap to upload · JPG, PNG, WEBP
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button type="button" className="btn-secondary-premium text-sm px-5 py-2.5 rounded-xl gap-2">
                <Upload className="w-3.5 h-3.5" /> Gallery
              </Button>
              <Button
                type="button"
                className="btn-secondary-premium text-sm px-5 py-2.5 rounded-xl gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  if (inputRef.current) {
                    inputRef.current.capture = 'environment';
                    inputRef.current.click();
                  }
                }}
              >
                <Camera className="w-3.5 h-3.5" /> Camera
              </Button>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
          />
        </div>
      )}

      {/* Photo tips — premium */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {photoTips.map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-2.5 text-xs text-foreground/60 rounded-xl px-3 py-2.5"
            style={{ background: 'hsl(42 87% 55% / 0.04)', border: '1px solid hsl(42 87% 55% / 0.1)' }}
          >
            <span className="w-5 h-5 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-2.5 h-2.5 text-accent" />
            </span>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function PalmMatch() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [processing, setProcessing] = useState<ProcessingState>('idle');
  const [processingMsgIdx, setProcessingMsgIdx] = useState(0);

  const [image1, setImage1] = useState<string | null>(null);
  const [file1, setFile1] = useState<File | null>(null);
  const [image2, setImage2] = useState<string | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [person1Name, setPerson1Name] = useState('');
  const [person1Age, setPerson1Age] = useState('');
  const [person2Name, setPerson2Name] = useState('');
  const [person2Age, setPerson2Age] = useState('');
  const [relationshipType, setRelationshipType] = useState('');
  const [email, setEmail] = useState('');

  const cycleMessage = useCallback(() => {
    setProcessingMsgIdx((i) => (i + 1) % processingMessages.length);
  }, []);

  const handleSubmit = async () => {
    if (!file1 || !file2 || !person1Name || !person1Age || !person2Name || !person2Age || !relationshipType || !email) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all fields and upload both palms.',
        variant: 'destructive',
      });
      return;
    }

    setProcessing('uploading');
    const interval = setInterval(cycleMessage, 2200);

    try {
      const uploadFile = async (file: File, slot: string) => {
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `palmmatch/${Date.now()}_${slot}.${ext}`;
        const { error } = await supabase.storage.from('palm-uploads').upload(path, file, { upsert: true });
        if (error) throw new Error(`Upload failed: ${error.message}`);
        const { data: urlData } = supabase.storage.from('palm-uploads').getPublicUrl(path);
        return urlData.publicUrl;
      };

      const [url1, url2] = await Promise.all([
        uploadFile(file1, 'person1'),
        uploadFile(file2, 'person2'),
      ]);

      setProcessing('analyzing');

      const { data, error } = await supabase.functions.invoke('analyze-palmmatch', {
        body: {
          image1Url: url1, image2Url: url2,
          person1: { name: person1Name, age: person1Age },
          person2: { name: person2Name, age: person2Age },
          relationshipType, email,
        },
      });

      clearInterval(interval);

      if (error || !data?.success) {
        if (data?.error === 'invalid_palm') {
          toast({
            title: 'Invalid palm image',
            description: data.message || 'One of the images is not a clear palm photo.',
            variant: 'destructive',
          });
          setProcessing('idle');
          setStep(data.person === 'person2' ? 2 : 1);
          return;
        }
        throw new Error(data?.error || 'Analysis failed');
      }

      sessionStorage.setItem('palmMatchData', JSON.stringify({
        reading: data.reading,
        reportId: data.reportId,
        person1Name, person1Age, person2Name, person2Age,
        relationshipType, email,
        image1Url: url1, image2Url: url2,
      }));

      setProcessing('complete');
      setTimeout(() => navigate(`/palmmatch-report/${data.reportId}`), 1200);
    } catch (err) {
      clearInterval(interval);
      console.error('PalmMatch error:', err);
      toast({
        title: 'Analysis failed',
        description: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      setProcessing('error');
    }
  };

  const canAdvanceStep1 = image1 && person1Name && person1Age;
  const canAdvanceStep2 = image2 && person2Name && person2Age && relationshipType && email;

  // ─── Cinematic Processing Screen ──────────────────────────────────────────
  if (processing !== 'idle' && processing !== 'error') {
    const isDone = processing === 'complete';
    const isAnalyzing = processing === 'analyzing' || isDone;
    const stages = [
      { text: 'Uploading palm images securely', done: true },
      { text: 'AI validating both palm lines', done: isAnalyzing },
      { text: 'Decoding destiny patterns', done: isDone },
      { text: 'Generating compatibility report', done: isDone },
    ];
    const progressPct = isDone ? 100 : isAnalyzing ? 72 : 30;

    return (
      <div className="min-h-screen bg-gradient-mystic flex items-center justify-center px-4 relative overflow-hidden">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(42 87% 55%) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Floating particles */}
        {Array.from({ length: 10 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-accent pointer-events-none"
            style={{
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              left: `${5 + i * 9}%`,
              top: `${10 + ((i * 17) % 72)}%`,
            }}
            animate={{ y: [0, -28, 0], opacity: [0.2, 0.8, 0.2] }}
            transition={{ repeat: Infinity, duration: 3.5 + i * 0.4, delay: i * 0.3 }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-sm w-full relative z-10"
        >
          {/* Animated palm pair */}
          <div className="flex items-center justify-center gap-3 mb-10 h-28 select-none">
            <motion.div
              animate={
                isDone
                  ? { x: 16, scale: 1.22, rotate: -8 }
                  : { x: [0, 7, 0, 4, 0], rotate: [0, -4, 0, 4, 0] }
              }
              transition={
                isDone
                  ? { duration: 0.55, ease: 'backOut' }
                  : { repeat: Infinity, duration: 3.2, ease: 'easeInOut' }
              }
              className="text-7xl leading-none"
              style={{ filter: 'drop-shadow(0 0 28px hsl(42 87% 55% / 0.8))' }}
            >
              🤚
            </motion.div>

            {/* Energy orb */}
            <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
              <motion.div
                animate={{ scale: [0.7, 1.6, 0.7], opacity: [0.3, 0.85, 0.3] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-accent/25 blur-lg"
              />
              <motion.div
                animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-2 rounded-full bg-accent/15"
              />
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 7, ease: 'linear' }}
                className="text-2xl relative z-10"
              >
                {isDone ? '💕' : '✦'}
              </motion.span>
            </div>

            <div style={{ transform: 'scaleX(-1)' }}>
              <motion.div
                animate={
                  isDone
                    ? { x: -16, scale: 1.22, rotate: 8 }
                    : { x: [0, -7, 0, -4, 0], rotate: [0, 4, 0, -4, 0] }
                }
                transition={
                  isDone
                    ? { duration: 0.55, ease: 'backOut' }
                    : { repeat: Infinity, duration: 3.2, ease: 'easeInOut', delay: 0.4 }
                }
                className="text-7xl leading-none"
                style={{ filter: 'drop-shadow(0 0 28px hsl(42 87% 55% / 0.8))' }}
              >
                🤚
              </motion.div>
            </div>
          </div>

          <motion.h2
            key={isDone ? 'done' : 'loading'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-serif font-bold text-white mb-2"
          >
            {isDone ? '✨ Your Match is Ready!' : 'Reading Your Destiny...'}
          </motion.h2>
          {!isDone && (
            <motion.p
              key="sub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white/45 text-sm italic font-serif mb-8"
            >
              The stars are aligning for you two
            </motion.p>
          )}
          {isDone && <div className="mb-8" />}

          {/* Stage checklist */}
          <div className="space-y-4 mb-8 text-left">
            {stages.map((stage, i) => (
              <motion.div
                key={stage.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.14 }}
                className={`flex items-center gap-3 text-sm transition-all duration-500 ${
                  stage.done ? 'text-white/90' : 'text-white/30'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                    stage.done ? 'bg-accent' : 'bg-white/10'
                  }`}
                  style={stage.done ? { boxShadow: '0 0 12px hsl(42 87% 55% / 0.5)' } : undefined}
                >
                  {stage.done ? (
                    <CheckCircle className="w-3.5 h-3.5 text-foreground" />
                  ) : (
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="w-2 h-2 rounded-full bg-white/40"
                    />
                  )}
                </div>
                {stage.text}
              </motion.div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-white/10 rounded-full overflow-hidden max-w-xs mx-auto mb-3">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, hsl(42 87% 55%), hsl(42 90% 72%))' }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 2, ease: 'easeOut' }}
            />
          </div>
          <p className="text-white/30 text-xs tabular-nums">{progressPct}% complete</p>

          {!isDone && (
            <AnimatePresence mode="wait">
              <motion.p
                key={processingMsgIdx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-white/40 text-xs mt-4"
              >
                {processingMessages[processingMsgIdx]}
              </motion.p>
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    );
  }

  // ─── Main Upload UI ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">

        {/* ── Cinematic Hero ── */}
        <div className="bg-gradient-mystic py-20 px-4 text-center relative overflow-hidden mb-14">
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, hsl(42 87% 55%) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />
          {/* Ambient glow blobs */}
          <div className="absolute top-1/4 left-[10%] w-[460px] h-[300px] rounded-full bg-accent/8 blur-[130px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-[10%] w-[380px] h-[260px] rounded-full bg-purple-800/14 blur-[110px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[220px] rounded-full bg-indigo-900/8 blur-[90px] pointer-events-none" />
          {/* ॐ watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-[18rem] text-accent/[0.035] font-serif leading-none"
              style={{ filter: 'blur(1px)' }}>ॐ</span>
          </div>
          {/* Star-field particles — circles + rotated diamonds */}
          {heroParticles.map((p, i) => (
            <motion.div
              key={i}
              className="absolute bg-accent pointer-events-none"
              style={{
                left: p.left, top: p.top,
                width: p.size, height: p.size,
                borderRadius: p.diamond ? '1px' : '50%',
                transform: p.diamond ? 'rotate(45deg)' : undefined,
              }}
              animate={{ y: [0, -24, 0], opacity: [0.25, 0.85, 0.25] }}
              transition={{ repeat: Infinity, duration: p.dur, delay: p.delay }}
            />
          ))}

          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Live activity pill */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 glass-premium rounded-full px-4 py-2 mb-6 border border-accent/20"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span className="text-xs font-medium text-white/70">
                3 couples discovering their destiny right now
              </span>
            </motion.div>

            {/* Sanskrit eyebrow with ornamental dividers */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-4 mb-5"
            >
              <div className="h-px w-14 bg-gradient-to-r from-transparent to-accent/40" />
              <p className="text-sm tracking-[0.28em] text-accent/90 italic font-medium whitespace-nowrap">
                ॐ Yugal Rekha · Compatibility Reading
              </p>
              <div className="h-px w-14 bg-gradient-to-l from-transparent to-accent/40" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.75 }}
              className="text-5xl md:text-6xl lg:text-[5.25rem] font-serif font-bold text-white mb-6 leading-[1.05]"
            >
              Do Your Palms Tell
              <span className="text-gradient-gold block mt-2"
                style={{ textShadow: '0 0 60px hsl(42 87% 55% / 0.25)' }}>
                the Same Story?
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-white/70 text-lg md:text-xl max-w-lg mx-auto mb-9 leading-relaxed"
            >
              Two palms placed before the cosmos — ancient Indian palmistry
              decodes your emotional bond, life alignment, and sacred destiny.
            </motion.p>

            {/* Trust badges — premium pill style */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex flex-wrap justify-center gap-3 mb-7"
            >
              {[
                { icon: Shield, text: '100% private' },
                { icon: Zap, text: 'Results in 3 min' },
                { icon: Users, text: '4,200+ couples' },
              ].map(({ icon: Icon, text }) => (
                <span
                  key={text}
                  className="flex items-center gap-2 text-sm text-white/75 glass-premium border border-white/12 rounded-full pl-1.5 pr-4 py-1.5"
                >
                  <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3 h-3 text-accent" />
                  </span>
                  {text}
                </span>
              ))}
            </motion.div>

            {/* Ornamental divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42 }}
              className="flex items-center justify-center gap-3 mb-5"
            >
              <div className="h-px w-20 bg-gradient-to-r from-transparent to-accent/25" />
              <span className="text-accent/40 text-[11px] font-serif">✦</span>
              <div className="h-px w-20 bg-gradient-to-l from-transparent to-accent/25" />
            </motion.div>

            {/* Discover pills */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48 }}
            >
              <p className="text-white/30 text-[10px] uppercase tracking-[0.28em] mb-3 font-bold">
                What you'll discover
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[...dimensionIcons, { icon: Sparkles, label: 'Spiritual Remedies' }].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 glass-premium px-3.5 py-2 rounded-full text-xs text-white/80 border border-accent/18"
                    style={{ boxShadow: '0 2px 12px hsl(42 87% 55% / 0.06)' }}
                  >
                    <Icon className="w-3.5 h-3.5 text-accent" />
                    {label}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Sample result preview */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 inline-flex items-center gap-4 glass-premium rounded-2xl px-5 py-3.5 border border-accent/25 mx-auto"
              style={{ boxShadow: '0 0 32px hsl(42 87% 55% / 0.1)' }}
            >
              <div className="flex flex-col items-center">
                <span className="text-2xl font-serif font-bold text-accent leading-none">87%</span>
                <span className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">match</span>
              </div>
              <div className="w-px h-9 bg-accent/15" />
              <div className="text-left">
                <p className="text-xs font-semibold text-white/80 mb-0.5">Sample: Priya & Arjun</p>
                <p className="text-[10px] text-white/40">Soulmate Connection · ✦ Deeply Written</p>
              </div>
              <div className="text-accent/60 text-xs font-serif italic">Preview</div>
            </motion.div>
          </div>
        </div>

        {/* ── Wizard ── */}
        <div className="container mx-auto px-4 max-w-2xl">
          <StepIndicator current={step} />

          <AnimatePresence mode="wait">
            {/* ── Step 1 ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="glass-premium rounded-3xl border border-accent/20 overflow-hidden"
                style={{ boxShadow: '0 0 50px hsl(42 87% 55% / 0.07), 0 24px 60px hsl(245 58% 25% / 0.1)' }}
              >
                <div
                  className="h-[3px] w-full"
                  style={{ background: 'linear-gradient(90deg, transparent, hsl(42 87% 55%), hsl(260 50% 65%), hsl(42 87% 55%), transparent)' }}
                />
                <div className="p-7 md:p-9">
                  <p className="text-sm text-accent/70 mb-7 text-center font-serif italic">
                    ✦ The universe needs to see your hand first
                  </p>

                  <ImageUploadZone
                    image={image1}
                    onImage={(f, p) => { setFile1(f); setImage1(p); }}
                    onClear={() => { setFile1(null); setImage1(null); }}
                    label="Upload Your Palm"
                    sanskritLabel="Pahla Hath"
                  />

                  {/* Form section divider */}
                  <div className="flex items-center gap-3 mt-8 mb-6">
                    <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, hsl(42 87% 55% / 0.2))' }} />
                    <span className="text-[9px] text-accent/50 uppercase tracking-[0.28em] font-bold">Your Details</span>
                    <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg, transparent, hsl(42 87% 55% / 0.2))' }} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="p1name" className="text-sm font-semibold mb-0.5 block text-foreground/85">
                        Your Name
                      </Label>
                      <p className="text-[10px] text-accent/50 italic mb-2">Aapka Naam</p>
                      <Input
                        id="p1name"
                        placeholder="e.g. Priya"
                        value={person1Name}
                        onChange={(e) => setPerson1Name(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="p1age" className="text-sm font-semibold mb-0.5 block text-foreground/85">
                        Your Age
                      </Label>
                      <p className="text-[10px] text-accent/50 italic mb-2">Aapki Umar</p>
                      <Input
                        id="p1age"
                        type="number"
                        placeholder="e.g. 28"
                        min="10"
                        max="100"
                        value={person1Age}
                        onChange={(e) => setPerson1Age(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    disabled={!canAdvanceStep1}
                    className="btn-gold w-full mt-7 py-6 rounded-2xl text-foreground font-bold text-base gap-2"
                  >
                    Continue — Add Their Palm
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    <Shield className="w-3 h-3 text-accent/60" />
                    <p className="text-xs text-muted-foreground">
                      Palm image encrypted · Never stored beyond analysis
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="glass-premium rounded-3xl border border-accent/20 overflow-hidden"
                style={{ boxShadow: '0 0 50px hsl(260 50% 55% / 0.07), 0 24px 60px hsl(245 58% 25% / 0.1)' }}
              >
                <div
                  className="h-[3px] w-full"
                  style={{ background: 'linear-gradient(90deg, transparent, hsl(260 50% 65%), hsl(42 87% 55%), hsl(260 50% 65%), transparent)' }}
                />
                <div className="p-7 md:p-9">
                  <p className="text-sm text-accent/70 mb-7 text-center font-serif italic">
                    ✦ Almost there — now add their palm to reveal your destiny
                  </p>

                  <ImageUploadZone
                    image={image2}
                    onImage={(f, p) => { setFile2(f); setImage2(p); }}
                    onClear={() => { setFile2(null); setImage2(null); }}
                    label="Upload Their Palm"
                    sanskritLabel="Doosra Hath"
                  />

                  {/* Form section divider */}
                  <div className="flex items-center gap-3 mt-8 mb-6">
                    <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, hsl(260 50% 55% / 0.25))' }} />
                    <span className="text-[9px] text-accent/50 uppercase tracking-[0.28em] font-bold">Their Details</span>
                    <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg, transparent, hsl(260 50% 55% / 0.25))' }} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="p2name" className="text-sm font-semibold mb-0.5 block text-foreground/85">
                        Their Name
                      </Label>
                      <p className="text-[10px] text-accent/50 italic mb-2">Unka Naam</p>
                      <Input
                        id="p2name"
                        placeholder="e.g. Arjun"
                        value={person2Name}
                        onChange={(e) => setPerson2Name(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="p2age" className="text-sm font-semibold mb-0.5 block text-foreground/85">
                        Their Age
                      </Label>
                      <p className="text-[10px] text-accent/50 italic mb-2">Unki Umar</p>
                      <Input
                        id="p2age"
                        type="number"
                        placeholder="e.g. 30"
                        min="10"
                        max="100"
                        value={person2Age}
                        onChange={(e) => setPerson2Age(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <Label className="text-sm font-semibold mb-0.5 block text-foreground/85">
                      Your Relationship
                    </Label>
                    <p className="text-[10px] text-accent/50 italic mb-2">Sambandh</p>
                    <Select value={relationshipType} onValueChange={setRelationshipType}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select relationship..." />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_TYPES.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-5">
                    <Label htmlFor="email" className="text-sm font-semibold mb-0.5 block text-foreground/85">
                      Your Email
                    </Label>
                    <p className="text-[10px] text-accent/50 italic mb-2">Report delivered here · Aapka Email</p>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>

                  {/* Ornamental divider before CTA */}
                  <div className="flex items-center gap-3 mt-8 mb-6">
                    <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, hsl(42 87% 55% / 0.2))' }} />
                    <span className="text-accent/35 text-[10px] font-serif">✦ ✦ ✦</span>
                    <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg, transparent, hsl(42 87% 55% / 0.2))' }} />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="border-accent/20 rounded-2xl py-6 px-5 gap-2 text-foreground/70 hover:border-accent/40"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!canAdvanceStep2}
                      className="btn-gold flex-1 py-6 rounded-2xl text-foreground font-bold text-base gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      Reveal Our Compatibility
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-accent/60" /> Free preview</span>
                    <span className="text-muted-foreground/30">·</span>
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-accent/60" /> No sign-up</span>
                    <span className="text-muted-foreground/30">·</span>
                    <span>Results in 3 min</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}
