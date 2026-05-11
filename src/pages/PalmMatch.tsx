import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Upload, X, Camera, Sun, Eye, CheckCircle, Hand,
  ArrowRight, ArrowLeft, Sparkles, Shield, Zap, Users,
  Heart, MessageCircle, Target, Infinity,
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

const heroPalmImg = '/lovable-uploads/41f937d2-cf0d-4793-a69c-892bf8c421eb.png';

type Step = 1 | 2 | 3;
type ProcessingState = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';

const RELATIONSHIP_TYPES = [
  'Partner',
  'Spouse',
  'Friend',
  'Sibling',
  'Parent-Child',
  'Business Partner',
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
  { icon: Infinity, label: 'Spiritual Alignment' },
];

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: 'Your Palm' },
    { n: 2, label: 'Their Palm' },
    { n: 3, label: 'Get Match' },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center">
            <motion.div
              animate={current === s.n ? { boxShadow: '0 0 22px hsla(42,87%,55%,0.55)', scale: 1.1 } : { boxShadow: 'none', scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                current > s.n
                  ? 'bg-accent text-foreground'
                  : current === s.n
                  ? 'bg-accent text-foreground ring-4 ring-accent/25'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {current > s.n ? <CheckCircle className="w-4 h-4" /> : s.n}
            </motion.div>
            <span className={`text-xs mt-2 font-medium transition-colors ${
              current >= s.n ? 'text-accent' : 'text-muted-foreground/50'
            }`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 h-0.5 mb-5 mx-2 rounded-full transition-all duration-500 ${
              current > s.n ? 'bg-accent' : 'bg-secondary'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

function ImageUploadZone({
  image,
  onImage,
  onClear,
  label,
  sanskritLabel,
}: {
  image: string | null;
  onImage: (file: File, preview: string) => void;
  onClear: () => void;
  label: string;
  sanskritLabel: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) onImage(file, e.target.result as string);
    };
    reader.readAsDataURL(file);
  }, [onImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-3">
        <h3 className="text-lg font-serif font-bold text-foreground">{label}</h3>
        <span className="sanskrit-accent text-sm text-white/50">{sanskritLabel}</span>
      </div>

      {image ? (
        <div className="relative rounded-2xl overflow-hidden border border-accent/30">
          <img src={image} alt="Palm preview" className="w-full h-48 object-cover" />
          <button
            onClick={onClear}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-green-500/90 text-white text-xs px-2.5 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Palm uploaded
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-accent bg-accent/10 scale-[1.02]'
              : 'border-accent/30 hover:border-accent/60 hover:bg-accent/5'
          }`}
        >
          <Upload className="w-8 h-8 text-accent/60 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Drag & drop palm photo</p>
          <p className="text-xs text-muted-foreground mb-4">or tap to browse · JPG, PNG, WEBP</p>
          <Button type="button" className="btn-secondary-premium text-sm px-4 py-2 rounded-xl gap-2 mr-2">
            <Upload className="w-4 h-4" /> Gallery
          </Button>
          <Button
            type="button"
            className="btn-secondary-premium text-sm px-4 py-2 rounded-xl gap-2"
            onClick={(e) => {
              e.stopPropagation();
              if (inputRef.current) { inputRef.current.capture = 'environment'; inputRef.current.click(); }
            }}
          >
            <Camera className="w-4 h-4" /> Camera
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mt-3">
        {photoTips.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon className="w-3 h-3 text-accent flex-shrink-0" />
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}

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
      toast({ title: 'Missing information', description: 'Please fill in all fields and upload both palms.', variant: 'destructive' });
      return;
    }

    setProcessing('uploading');
    const interval = setInterval(cycleMessage, 2200);

    try {
      // Upload both palms
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
          image1Url: url1,
          image2Url: url2,
          person1: { name: person1Name, age: person1Age },
          person2: { name: person2Name, age: person2Age },
          relationshipType,
          email,
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
        person1Name,
        person1Age,
        person2Name,
        person2Age,
        relationshipType,
        email,
        image1Url: url1,
        image2Url: url2,
      }));

      setProcessing('complete');
      setTimeout(() => navigate(`/palmmatch-report/${data.reportId}`), 800);
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
      <div className="min-h-screen bg-gradient-mystic flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm w-full"
        >
          {/* Animated palm pair */}
          <div className="flex items-center justify-center gap-5 mb-10 h-20 select-none">
            <motion.span
              animate={isDone ? { x: 10, scale: 1.12 } : { x: [0, 5, 0, -5, 0] }}
              transition={isDone ? { duration: 0.4 } : { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="text-5xl"
            >
              🤚
            </motion.span>
            <motion.span
              animate={{ scale: [0.85, 1.25, 0.85], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              className="text-3xl"
            >
              {isDone ? '💕' : '✨'}
            </motion.span>
            <motion.span
              animate={isDone ? { x: -10, scale: 1.12 } : { x: [0, -5, 0, 5, 0] }}
              transition={isDone ? { duration: 0.4 } : { repeat: Infinity, duration: 2.2, ease: 'easeInOut', delay: 0.5 }}
              className="text-5xl"
              style={{ transform: 'scaleX(-1)' }}
            >
              🤚
            </motion.span>
          </div>

          <h2 className="text-2xl font-serif font-bold text-white mb-7">
            {isDone ? '✨ Your Match is Ready!' : 'Reading Your Destiny...'}
          </h2>

          {/* Stage list */}
          <div className="space-y-3 mb-8 text-left">
            {stages.map((stage, i) => (
              <motion.div
                key={stage.text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.12 }}
                className={`flex items-center gap-3 text-sm transition-colors ${stage.done ? 'text-white/85' : 'text-white/35'}`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${stage.done ? 'bg-accent' : 'bg-white/10'}`}>
                  {stage.done
                    ? <CheckCircle className="w-3 h-3 text-foreground" />
                    : <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                  }
                </div>
                {stage.text}
              </motion.div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden max-w-[280px] mx-auto">
            <motion.div
              className="h-full bg-accent rounded-full"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </div>

          {/* Cycling sub-message */}
          {!isDone && (
            <AnimatePresence mode="wait">
              <motion.p
                key={processingMsgIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-white/45 text-xs mt-4"
              >
                {processingMessages[processingMsgIdx]}
              </motion.p>
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <div className="bg-gradient-mystic py-16 px-4 text-center relative overflow-hidden mb-12">
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'radial-gradient(circle, hsl(42 87% 55%) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="sanskrit-accent mb-3 text-white/60"
            >
              ॐ Yugal Rekha · Compatibility Reading
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight"
            >
              Do Your Palms Tell{' '}
              <span className="text-gradient-gold block mt-1">the Same Story?</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-white/75 text-lg max-w-xl mx-auto mb-6"
            >
              Upload two palms — let ancient Indian palmistry reveal your compatibility,
              emotional bond, and destiny alignment.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex flex-wrap justify-center gap-5 text-sm text-white/60 mb-6"
            >
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-accent" /> 100% private</span>
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-accent" /> Results in 3 minutes</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-accent" /> 4,200+ couples matched</span>
            </motion.div>

            {/* Dimension preview pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {dimensionIcons.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 glass-premium px-3 py-1.5 rounded-full text-xs text-white/70 border border-accent/15">
                  <Icon className="w-3.5 h-3.5 text-accent" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wizard */}
        <div className="container mx-auto px-4 max-w-2xl">
          <StepIndicator current={step} />

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
                className="glass-premium rounded-3xl p-6 md:p-8 border border-accent/20"
              >
                <ImageUploadZone
                  image={image1}
                  onImage={(f, p) => { setFile1(f); setImage1(p); }}
                  onClear={() => { setFile1(null); setImage1(null); }}
                  label="Upload Your Palm"
                  sanskritLabel="Pahla Hath"
                />

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <Label htmlFor="p1name" className="text-sm font-medium mb-1.5 block">Your Name</Label>
                    <Input
                      id="p1name"
                      placeholder="e.g. Priya"
                      value={person1Name}
                      onChange={(e) => setPerson1Name(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="p1age" className="text-sm font-medium mb-1.5 block">Your Age</Label>
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
                  className="btn-gold w-full mt-6 py-6 rounded-2xl text-foreground font-semibold text-base gap-2"
                >
                  Next — Upload Their Palm
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-3">Your palm image stays 100% private</p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
                className="glass-premium rounded-3xl p-6 md:p-8 border border-accent/20"
              >
                <ImageUploadZone
                  image={image2}
                  onImage={(f, p) => { setFile2(f); setImage2(p); }}
                  onClear={() => { setFile2(null); setImage2(null); }}
                  label="Upload Their Palm"
                  sanskritLabel="Doosra Hath"
                />

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <Label htmlFor="p2name" className="text-sm font-medium mb-1.5 block">Their Name</Label>
                    <Input
                      id="p2name"
                      placeholder="e.g. Arjun"
                      value={person2Name}
                      onChange={(e) => setPerson2Name(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="p2age" className="text-sm font-medium mb-1.5 block">Their Age</Label>
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

                <div className="mt-4">
                  <Label className="text-sm font-medium mb-1.5 block">Relationship Type</Label>
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

                <div className="mt-4">
                  <Label htmlFor="email" className="text-sm font-medium mb-1.5 block">Email (to save your report)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="border-accent/20 rounded-2xl py-6 px-5 gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!canAdvanceStep2}
                    className="btn-gold flex-1 py-6 rounded-2xl text-foreground font-semibold text-base gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Get PalmMatch — Free Preview
                  </Button>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-3">No sign-up · Instant results · Free preview included</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}
