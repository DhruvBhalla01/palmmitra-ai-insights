import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import palmIconGold from '@/assets/palm-icon-gold.png';
import { useNavigate } from 'react-router-dom';
import {
  Upload, X, Loader2, User, AlertCircle, CheckCircle, Hand,
  Camera, Sun, Eye, Shield, Lock, Sparkles, FileText, Heart,
  Briefcase, TrendingUp, Star, ArrowRight, Zap, ShieldCheck,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AnimatedSection } from '@/components/AnimatedSection';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type ReadingType = 'full' | 'career' | 'love' | 'wealth';
type ProcessingStep = 'idle' | 'uploading' | 'validating' | 'analyzing' | 'saving' | 'complete' | 'error';

interface FormData {
  name: string;
  age: string;
  email: string;
  readingType: ReadingType;
}

interface ValidationError {
  reason: string;
  suggestions: string[];
}

const analyzingMessages = [
  'Reading your palm lines...',
  'Decoding your destiny...',
  'Analyzing life path...',
  'Predicting future cycles...',
  'Channeling ancient wisdom...',
];

const reportSections = [
  { icon: Star,        label: 'Personality Profile',   free: true  },
  { icon: Briefcase,   label: 'Career & Wealth Path',  free: false },
  { icon: TrendingUp,  label: 'Money & Prosperity',    free: false },
  { icon: Heart,       label: 'Love & Marriage',        free: false },
  { icon: Shield,      label: 'Health & Vitality',     free: false },
  { icon: Eye,         label: 'Future Predictions',    free: false },
  { icon: Sparkles,    label: 'Spiritual Remedies',    free: false },
];

const photoTips = [
  { icon: Hand,         text: 'Open palm facing camera'  },
  { icon: Sun,          text: 'Good natural lighting'    },
  { icon: Eye,          text: 'Lines clearly visible'    },
  { icon: CheckCircle,  text: 'One hand only'            },
];

const progressSteps = [
  { n: 1, label: 'Upload Palm'  },
  { n: 2, label: 'Your Details' },
  { n: 3, label: 'Get Reading'  },
];

const loadingSteps = [
  { step: 'uploading',  label: 'Securing your palm image'    },
  { step: 'validating', label: 'AI verifying palm clarity'   },
  { step: 'analyzing',  label: 'Decoding your destiny lines' },
  { step: 'saving',     label: 'Generating your report'      },
];

const stepOrder = ['uploading', 'validating', 'analyzing', 'saving'];

export default function UploadPalm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    email: '',
    readingType: 'full',
  });

  const formStep = useMemo(() => {
    if (!image) return 1;
    if (!formData.name || !formData.email || !formData.age) return 2;
    return 3;
  }, [image, formData]);

  const loadingProgress: Record<string, number> = {
    uploading: 18, validating: 42, analyzing: 72, saving: 90, complete: 100,
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setValidationError(null);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    } else {
      toast({ title: 'Invalid file', description: 'Please upload a JPG or PNG image.', variant: 'destructive' });
    }
  }, [toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setValidationError(null);
    if (file) {
      if (file.type.startsWith('image/')) {
        processImage(file);
      } else {
        toast({ title: 'Invalid file', description: 'Please upload a JPG or PNG image.', variant: 'destructive' });
      }
    }
    // Reset input so same file can be reselected after removal
    e.target.value = '';
  }, [toast]);

  const processImage = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImageFile(null);
    setValidationError(null);
  };

  const uploadToStorage = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const { data, error } = await supabase.storage
      .from('palm-uploads')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (error) throw new Error('Failed to upload image');
    const { data: { publicUrl } } = supabase.storage.from('palm-uploads').getPublicUrl(data.path);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !formData.name || !formData.email || !formData.age) return;

    setValidationError(null);
    setLoadingMessageIdx(0);

    const msgInterval = setInterval(() => {
      setLoadingMessageIdx((prev) => prev + 1);
    }, 2200);

    try {
      setProcessingStep('uploading');
      const imageUrl = await uploadToStorage(imageFile);

      setProcessingStep('validating');
      setProcessingStep('analyzing');

      const { data: response, error: fnError } = await supabase.functions.invoke('analyze-palm', {
        body: { imageUrl, name: formData.name, age: formData.age, email: formData.email, readingType: formData.readingType },
      });

      if (fnError) throw new Error(fnError.message || 'Failed to analyze palm');

      if (!response.validated) {
        setProcessingStep('error');
        setValidationError({
          reason: response.message || response.validation?.reason || 'This does not appear to be a palm image.',
          suggestions: [
            'Use an open palm facing the camera',
            'Ensure good lighting on the palm',
            'Avoid blurry or unclear images',
            'Show only one hand, not both',
            'Make sure palm lines are clearly visible',
          ],
        });
        clearInterval(msgInterval);
        return;
      }

      setProcessingStep('saving');
      sessionStorage.setItem('palmMitraData', JSON.stringify({
        ...formData, imageUrl,
        reportId: response.reportId,
        reading: response.reading,
        validation: response.validation,
        generatedAt: response.generatedAt,
      }));

      setProcessingStep('complete');
      clearInterval(msgInterval);
      setTimeout(() => navigate(response.reportId ? `/report/${response.reportId}` : '/report'), 500);

    } catch (err) {
      setProcessingStep('error');
      clearInterval(msgInterval);
      toast({
        title: 'Something went wrong',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const isFormValid = image && formData.name && formData.email && formData.age;
  const isLoading = !['idle', 'error', 'complete'].includes(processingStep);

  const getLoadingLabel = () => {
    if (processingStep === 'analyzing') return analyzingMessages[loadingMessageIdx % analyzingMessages.length];
    const labels: Record<string, string> = {
      uploading: 'Uploading to PalmMitra Vault...',
      validating: 'AI Checking Palm Quality...',
      saving: 'Preparing Your Destiny Report...',
      complete: 'Report Ready!',
    };
    return labels[processingStep] ?? '';
  };

  const progress = loadingProgress[processingStep] ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">

          {/* ── Page Header ──────────────────────────── */}
          <AnimatedSection className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-5"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="text-sm font-medium text-accent">Free scan · No payment needed to start</span>
            </motion.div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
              One Photo.{' '}
              <span className="text-gradient-gold text-shadow-luxury">Your Entire Destiny.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Upload your dominant hand. AI reads your life line, fate line, heart line and 12 more markers — in under 2 minutes.
            </p>
          </AnimatedSection>

          {/* ── Progress Steps ────────────────────────── */}
          <AnimatedSection delay={0.1} className="max-w-xs mx-auto mb-10">
            <div className="flex items-center justify-center">
              {progressSteps.map((s, i) => (
                <div key={s.n} className="flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <motion.div
                      animate={{
                        backgroundColor: formStep > s.n
                          ? 'hsl(var(--accent))'
                          : formStep === s.n
                          ? 'hsl(var(--accent) / 0.15)'
                          : 'hsl(var(--muted))',
                      }}
                      transition={{ duration: 0.35 }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                        formStep > s.n
                          ? 'border-accent text-background'
                          : formStep === s.n
                          ? 'border-accent text-accent'
                          : 'border-transparent text-muted-foreground'
                      }`}
                    >
                      {formStep > s.n ? <CheckCircle className="w-4 h-4" /> : s.n}
                    </motion.div>
                    <span className={`text-xs whitespace-nowrap transition-colors ${formStep >= s.n ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < progressSteps.length - 1 && (
                    <motion.div
                      animate={{ backgroundColor: formStep > s.n ? 'hsl(var(--accent))' : 'hsl(var(--border))' }}
                      transition={{ duration: 0.35 }}
                      className="h-px w-10 mx-2 mb-4 rounded-full"
                    />
                  )}
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* ── Main Grid ─────────────────────────────── */}
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8">

              {/* LEFT: Form (3 cols) */}
              <div className="lg:col-span-3">
                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Upload Card */}
                  <AnimatedSection delay={0.15}>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative rounded-3xl border-2 border-dashed transition-all duration-300 overflow-hidden ${
                        isDragging
                          ? 'border-accent bg-accent/8 scale-[1.01]'
                          : validationError
                          ? 'border-destructive/60 bg-destructive/5'
                          : image
                          ? 'border-accent/40 bg-accent/5'
                          : 'border-border hover:border-accent/40 bg-card/30'
                      }`}
                    >
                      <AnimatePresence mode="wait">
                        {image ? (
                          /* ── Preview state ── */
                          <motion.div
                            key="preview"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="relative"
                          >
                            <img
                              src={image}
                              alt="Palm preview"
                              className="w-full max-h-72 object-cover"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                            >
                              <X className="w-4 h-4 text-foreground" />
                            </button>
                            <div className={`absolute bottom-0 left-0 right-0 px-4 py-3 backdrop-blur-md ${
                              validationError ? 'bg-destructive/80' : 'bg-card/80'
                            }`}>
                              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                                {validationError ? (
                                  <>
                                    <AlertCircle className="w-4 h-4 text-destructive-foreground flex-shrink-0" />
                                    Palm verification failed — try another photo
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                                    Palm photo ready — fill your details below
                                  </>
                                )}
                              </p>
                            </div>
                          </motion.div>
                        ) : (
                          /* ── Empty state ── */
                          <motion.div
                            key="upload"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center py-10 px-6 text-center"
                          >
                            <motion.div
                              animate={{
                                filter: [
                                  'drop-shadow(0 0 10px hsl(42 87% 55% / 0.3))',
                                  'drop-shadow(0 0 24px hsl(42 87% 55% / 0.6))',
                                  'drop-shadow(0 0 10px hsl(42 87% 55% / 0.3))',
                                ],
                              }}
                              transition={{ duration: 2.5, repeat: Infinity }}
                              className="mb-5"
                            >
                              <img src={palmIconGold} alt="Palm" className="w-16 h-16 object-contain" />
                            </motion.div>

                            <h3 className="text-lg font-serif font-bold text-foreground mb-1.5">
                              Photograph Your Dominant Hand
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                              Right hand if right-handed · Left if left-handed. Open palm facing camera.
                            </p>

                            {/* Primary: Camera capture (opens camera directly on mobile) */}
                            <label htmlFor="camera-capture" className="cursor-pointer w-full max-w-[220px]">
                              <div className="btn-gold text-foreground font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 w-full hover:scale-[1.02] active:scale-[0.98] transition-transform text-sm">
                                <Camera className="w-4 h-4" />
                                Take Photo Now
                              </div>
                              <input
                                id="camera-capture"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileSelect}
                                className="hidden"
                              />
                            </label>

                            {/* Secondary: Upload from gallery */}
                            <label htmlFor="gallery-upload" className="cursor-pointer w-full max-w-[220px] mt-2.5">
                              <div className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl border border-border/60 text-sm text-muted-foreground hover:bg-accent/5 hover:border-accent/30 transition-all">
                                <Upload className="w-3.5 h-3.5" />
                                Upload from Gallery
                              </div>
                              <input
                                id="gallery-upload"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileSelect}
                                className="hidden"
                              />
                            </label>

                            <p className="text-xs text-muted-foreground mt-4 hidden lg:block opacity-60">
                              Or drag & drop here
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </AnimatedSection>

                  {/* Photo Tips */}
                  <AnimatedSection delay={0.2}>
                    <div className="grid grid-cols-2 gap-2">
                      {photoTips.map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-center gap-2 p-3 rounded-xl bg-muted/25 border border-border/40 text-xs text-muted-foreground">
                          <Icon className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                          {text}
                        </div>
                      ))}
                    </div>
                  </AnimatedSection>

                  {/* Validation Error */}
                  <AnimatePresence>
                    {validationError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="bg-destructive/8 border border-destructive/25 rounded-2xl p-5"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-destructive/15 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-destructive" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1 text-sm">
                              Photo didn't pass AI verification
                            </h3>
                            <p className="text-xs text-muted-foreground mb-3">{validationError.reason}</p>
                            <ul className="text-xs text-muted-foreground space-y-1.5 mb-4">
                              {validationError.suggestions.map((s, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <span className="w-1 h-1 rounded-full bg-accent flex-shrink-0" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                            <Button type="button" onClick={removeImage} className="btn-gold text-sm py-2 px-5 h-auto">
                              Try Another Photo
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── About You Form ── */}
                  <AnimatedSection delay={0.25}>
                    <div className="glass-premium rounded-3xl p-6 border border-accent/15 space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">About You</p>
                          <p className="text-xs text-muted-foreground">Personalises your reading</p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="name" className="text-sm font-medium text-foreground">Your Name</Label>
                          <Input
                            id="name"
                            placeholder="e.g. Priya Sharma"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="rounded-xl py-5 bg-background/50 border-border/60 focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="age" className="text-sm font-medium text-foreground">Your Age</Label>
                          <Input
                            id="age"
                            type="number"
                            min="1"
                            max="120"
                            placeholder="e.g. 28"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            className="rounded-xl py-5 bg-background/50 border-border/60 focus:border-accent"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="rounded-xl py-5 bg-background/50 border-border/60 focus:border-accent"
                        />
                        <p className="text-xs text-muted-foreground">Your report link is sent here · used only for this</p>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-foreground">Reading Focus</Label>
                        <Select
                          value={formData.readingType}
                          onValueChange={(value: ReadingType) => setFormData({ ...formData, readingType: value })}
                        >
                          <SelectTrigger className="rounded-xl py-5 bg-background/50 border-border/60 focus:border-accent">
                            <SelectValue placeholder="Select focus" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Full Life Reading (Recommended)</SelectItem>
                            <SelectItem value="career">Career & Wealth Focus</SelectItem>
                            <SelectItem value="love">Love & Relationships Focus</SelectItem>
                            <SelectItem value="wealth">Money & Prosperity Focus</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Deepens AI focus on your chosen area</p>
                      </div>
                    </div>
                  </AnimatedSection>

                  {/* ── Submit CTA ── */}
                  <AnimatedSection delay={0.3}>
                    <Button
                      type="submit"
                      disabled={!isFormValid || isLoading}
                      className="w-full btn-gold text-foreground font-bold text-lg py-7 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-3">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {getLoadingLabel()}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2.5">
                          <Sparkles className="w-5 h-5" />
                          Begin My Free Reading
                          <ArrowRight className="w-5 h-5" />
                        </span>
                      )}
                    </Button>

                    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                        Your photo is never shared
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-accent" />
                        256-bit SSL encrypted
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-accent" />
                        Free preview · No card needed
                      </span>
                    </div>
                  </AnimatedSection>

                </form>
              </div>

              {/* RIGHT: Sidebar (2 cols) */}
              <div className="lg:col-span-2">
                <AnimatedSection delay={0.4}>
                  <div className="glass-premium rounded-3xl p-6 border border-accent/20 lg:sticky top-28 space-y-5">

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-foreground text-base">What You'll Unlock</h3>
                        <p className="text-xs text-muted-foreground">2,000+ word personalised report</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {reportSections.map(({ icon: Icon, label, free }, i) => (
                        <motion.div
                          key={label}
                          initial={{ opacity: 0, x: 10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.45 + i * 0.07 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/40"
                        >
                          <Icon className="w-4 h-4 text-accent flex-shrink-0" />
                          <span className="text-sm text-foreground flex-1">{label}</span>
                          {free ? (
                            <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                              Free
                            </span>
                          ) : (
                            <Lock className="w-3 h-3 text-muted-foreground/40" />
                          )}
                        </motion.div>
                      ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-accent/5 border border-accent/15 text-center">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="text-accent font-semibold">Free preview</span> included with every scan.{' '}
                        Unlock all 7 sections for just{' '}
                        <span className="text-accent font-bold">₹99</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 justify-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">4.9★ · 12,400+ readings done</span>
                    </div>

                    <div className="border-t border-border/30 pt-4 space-y-2">
                      <p className="text-xs font-medium text-foreground mb-2">Your Privacy, Guaranteed</p>
                      {[
                        'Photo used only for your reading',
                        'Never shared with third parties',
                        'Delete request: privacy@palmmitra.com',
                      ].map((line) => (
                        <p key={line} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Shield className="w-3 h-3 text-accent flex-shrink-0" />
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* ── Loading Overlay ────────────────────────── */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/97 backdrop-blur-lg z-50 flex items-center justify-center"
          >
            <div className="text-center max-w-sm mx-auto px-4 w-full">

              {/* Animated rings + palm */}
              <div className="relative w-28 h-28 mx-auto mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-accent/15"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-3 rounded-full border border-accent/35"
                />
                <motion.div
                  animate={{ scale: [1, 1.07, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <img src={palmIconGold} alt="Reading" className="w-14 h-14 object-contain" />
                </motion.div>
              </div>

              <AnimatePresence mode="wait">
                <motion.h2
                  key={getLoadingLabel()}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="text-xl font-serif font-bold text-foreground mb-3"
                >
                  {getLoadingLabel()}
                </motion.h2>
              </AnimatePresence>

              {/* Progress bar */}
              <div className="w-full bg-border/30 rounded-full h-1.5 mb-6 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
              </div>

              {/* Step checklist */}
              <div className="space-y-3 text-left bg-card/60 rounded-2xl p-5 border border-border/40">
                {loadingSteps.map(({ step, label }) => {
                  const curr = stepOrder.indexOf(processingStep);
                  const idx = stepOrder.indexOf(step);
                  const done = idx < curr;
                  const active = step === processingStep;
                  return (
                    <div
                      key={step}
                      className={`flex items-center gap-3 transition-all duration-300 ${
                        done ? 'text-accent' : active ? 'text-foreground' : 'text-muted-foreground/35'
                      }`}
                    >
                      {done ? (
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      ) : active ? (
                        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-current flex-shrink-0 opacity-40" />
                      )}
                      <span className={`text-sm ${active ? 'font-medium' : ''}`}>{label}</span>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                Usually 15–30 seconds · Please don't close this window
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
