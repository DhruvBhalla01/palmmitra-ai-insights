import { takePendingPalm } from '@/lib/pendingPalm';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { m, AnimatePresence } from '@/lib/motion';
import palmIconGold from '@/assets/palm-icon-gold.webp';
import { useNavigate } from 'react-router-dom';
import {
  Upload, X, Loader2, User, AlertCircle, CheckCircle,
  Camera, Eye, Shield, Lock, Sparkles, FileText, Heart,
  Briefcase, TrendingUp, Star, ArrowRight, Zap, ShieldCheck, Bot, Clock,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { breadcrumbLd } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AnimatedSection } from '@/components/AnimatedSection';
import { AnalysisOverlay } from '@/components/upload/AnalysisOverlay';
const getSupabase = () => import('@/integrations/supabase/client').then((m) => m.supabase);
import { useToast } from '@/hooks/use-toast';
import { nameSchema, ageSchema, emailSchema, validateImageFile, zodFieldErrors } from '@/lib/validation';
import { z } from 'zod';
import { analytics, useFormAnalytics, trackApiError } from '@/lib/analytics';
import posthog from '@/lib/posthog';
import { useCurrency } from '@/hooks/useCurrency';
import { PRODUCTS, formatCurrency } from '@/config/pricing';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { compressImage } from '@/lib/imageCompression';

type ReadingType = 'full';
type ProcessingStep = 'idle' | 'uploading' | 'validating' | 'analyzing' | 'saving' | 'complete' | 'error';

interface FormData {
  name: string;
  age: string;
  email: string;
  readingType: ReadingType;
  language: 'english' | 'hinglish';
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

const trustChips = [
  { icon: Lock,        text: 'Photo used only for analysis' },
  { icon: Clock,       text: 'Report ready in under 2 min'  },
  { icon: Bot,         text: 'AI-powered palm analysis'     },
  { icon: Star,        text: 'Rated 4.9 by 12,400+ users'   },
];

const progressSteps = [
  { n: 1, label: 'Upload Palm'  },
  { n: 2, label: 'Your Details' },
  { n: 3, label: 'Get Reading'  },
];

/** True when the request never reached (or never returned from) the server. */
const isConnectionDrop = (message: string) =>
  /failed to send a request|failed to fetch|network|load failed|aborted|timeout/i.test(message || '');

/**
 * The reading usually finishes server-side even when the phone's connection drops.
 * Poll for up to ~60s to see whether the report landed before showing an error.
 */
const pollForReport = async (imageUrl: string, email: string): Promise<string | null> => {
  const supabase = await getSupabase();
  for (let attempt = 0; attempt < 20; attempt++) {
    await new Promise((r) => setTimeout(r, 3000));
    try {
      const { data } = await supabase.functions.invoke('get-report', {
        body: { lookup_image_url: imageUrl, user_email: email },
      });
      if (data?.found && data.report_id) return data.report_id as string;
    } catch { /* keep polling */ }
  }
  return null;
};

export default function UploadPalm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currency, countryCode, countryName } = useCurrency();
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  // Background upload — kicks off as soon as image is chosen, awaited at submit
  const uploadPromiseRef = useRef<Promise<string> | null>(null);
  const submittingRef = useRef(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    email: '',
    readingType: 'full',
    language: 'hinglish',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'name' | 'age' | 'email', string>>>({});
  const formAnalytics = useFormAnalytics('palm_upload');
  const [connectionLost, setConnectionLost] = useState(false);

  useEffect(() => {
    analytics.track('palm_reading_started', { entry_page: '/upload' });
  }, []);

  useEffect(() => {
    return () => {
      if (image?.startsWith('blob:') && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  const uploadFormSchema = useMemo(
    () => z.object({ name: nameSchema, age: ageSchema, email: emailSchema }),
    [],
  );

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
    const check = validateImageFile(file);
    if (!check.ok) {
      toast({ title: check.reason ?? 'Invalid file', description: check.suggestion, variant: 'destructive' });
      return;
    }
    processImage(file);
  }, [toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setValidationError(null);
    if (file) {
      const check = validateImageFile(file);
      if (!check.ok) {
        toast({ title: check.reason ?? 'Invalid file', description: check.suggestion, variant: 'destructive' });
      } else {
        processImage(file);
      }
    }
    // Reset input so same file can be reselected after removal
    e.target.value = '';
  }, [toast]);

  const processImage = (file: File) => {
    const uploadProperties = {
      file_size_kb: Math.round(file.size / 1024),
      file_type: file.type,
    };
    analytics.track('palm_image_upload_started', uploadProperties);
    posthog.capture('palm_image_upload_started', uploadProperties);
    setImageFile(file);
    if (typeof URL.createObjectURL === 'function') {
      setImage(URL.createObjectURL(file));
    } else {
      const reader = new FileReader();
      reader.onload = (event) => setImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
    // Kick off storage upload in background so it's ready by the time user submits.
    // Large camera photos are downscaled first so mobile networks don't time out.
    const uploadPromise = compressImage(file)
      .then((prepared) => uploadToStorage(prepared))
      .then((url) => {
        const uploadProperties = { file_size_kb: Math.round(file.size / 1024) };
        analytics.track('palm_image_uploaded', uploadProperties);
        posthog.capture('palm_image_uploaded', uploadProperties);
        return url;
      })
      .catch((err) => {
        uploadPromiseRef.current = null;
        const errorProperties = {
          error_category: 'upload_error',
          reason: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
          error_message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
        };
        analytics.track('palm_image_upload_failed', errorProperties);
        posthog.capture('palm_image_upload_failed', errorProperties);
        throw err;
      });
    uploadPromiseRef.current = uploadPromise;
    void uploadPromise.catch(() => undefined);
  };

  // Photo picked on the home page hero — load it straight in
  useEffect(() => {
    const pending = takePendingPalm();
    if (pending) processImage(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeImage = () => {
    setImage(null);
    setImageFile(null);
    setValidationError(null);
    uploadPromiseRef.current = null;
  };

  const uploadToStorage = async (file: File): Promise<string> => {
    const extensionByType: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/heic': 'heic',
      'image/heif': 'heif',
    };
    const ext = extensionByType[file.type] ?? file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const supabase = await getSupabase();
    // Mobile connections often drop mid-upload ("Failed to fetch"); retry up to 3 times.
    let data: { path: string } | null = null;
    let error: { message?: string } | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const res = await supabase.storage
        .from('palm-uploads')
        .upload(fileName, file, {
          cacheControl: '3600',
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        });
      data = res.data; error = res.error;
      if (!error) break;
      const msg = String(error.message || '').toLowerCase();
      if (!/fetch|network|timeout|load failed/.test(msg)) break;
      await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
    }
    if (error || !data) {
      throw new Error(`Image upload failed: ${error?.message || 'storage service rejected the file'}`);
    }
    const { data: { publicUrl } } = supabase.storage.from('palm-uploads').getPublicUrl(data.path);
    return publicUrl;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (submittingRef.current || isLoading) return;
    setConnectionLost(false);
    if (!imageFile) {
      toast({ title: 'Photo required', description: 'Please upload your palm photo first.', variant: 'destructive' });
      return;
    }

    // Validate form input
    const parsed = uploadFormSchema.safeParse({
      name: formData.name,
      age: formData.age,
      email: formData.email,
    });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      const first = parsed.error.errors[0]?.message ?? 'Please fix the highlighted fields.';
      parsed.error.errors.forEach((validationIssue) => {
        formAnalytics.validationError(String(validationIssue.path[0] ?? 'unknown'), validationIssue.code);
      });
      toast({ title: 'Please check your details', description: first, variant: 'destructive' });
      return;
    }
    setFieldErrors({});
    submittingRef.current = true;
    formAnalytics.submit('details');
    const analysisProperties = { reading_type: formData.readingType };
    analytics.track('palm_analysis_started', analysisProperties);
    posthog.capture('palm_analysis_started', analysisProperties);
    analytics.track('ai_request_started', { feature: 'palm_analysis' });
    const analysisStartedAt = Date.now();

    const cleanName = parsed.data.name;
    const cleanEmail = parsed.data.email;
    const cleanAge = String(parsed.data.age);

    setValidationError(null);
    setLoadingMessageIdx(0);

    const msgInterval = setInterval(() => {
      setLoadingMessageIdx((prev) => prev + 1);
    }, 2200);

    let uploadedImageUrl: string | null = null;
    try {
      setProcessingStep('uploading');
      const imageUrl = await (uploadPromiseRef.current ?? compressImage(imageFile).then(uploadToStorage));
      uploadedImageUrl = imageUrl;

      setProcessingStep('validating');
      setProcessingStep('analyzing');

      const supabase = await getSupabase();
      const referralRef = new URLSearchParams(window.location.search).get('ref');
      const { data: response, error: fnError } = await supabase.functions.invoke('analyze-palm', {
        body: {
          imageUrl, name: cleanName, age: cleanAge, email: cleanEmail,
          readingType: formData.readingType, language: formData.language,
          countryCode, countryName,
          ...(referralRef ? { ref: referralRef } : {}),
        },
      });

      if (fnError) {
        let message = fnError.message || 'Failed to analyze palm';
        const context = 'context' in fnError ? fnError.context : null;
        if (context instanceof Response) {
          try {
            const payload = await context.clone().json();
            if (typeof payload?.error === 'string') message = payload.error;
          } catch { /* retain the transport error */ }
        }
        // A dropped mobile connection often still leaves a finished reading on the
        // server. Wait for it before telling the user anything went wrong.
        if (isConnectionDrop(message)) {
          setProcessingStep('analyzing');
          const recoveredId = await pollForReport(imageUrl, cleanEmail);
          if (recoveredId) {
            try { localStorage.setItem('palmMitraEmail', cleanEmail); } catch { /* ignore */ }
            clearInterval(msgInterval);
            setProcessingStep('complete');
            analytics.track('palm_analysis_completed', {
              latency_ms: Date.now() - analysisStartedAt,
              reading_type: formData.readingType,
              has_report_id: true,
            });
            navigate(`/report/${recoveredId}`);
            return;
          }
        }
        throw new Error(message);
      }

      if (!response.validated) {
        setProcessingStep('error');
        const failureProperties = {
          error_category: 'validation_error',
          reason: String(response.message || response.validation?.reason || 'not_a_palm').slice(0, 160),
          latency_ms: Date.now() - analysisStartedAt,
        };
        analytics.track('palm_analysis_failed', failureProperties);
        posthog.capture('palm_analysis_failed', failureProperties);
        formAnalytics.failure('palm_validation_rejected');
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
        name: cleanName, age: cleanAge, email: cleanEmail,
        readingType: formData.readingType,
        language: response.language ?? formData.language,
        countryCode: response.countryCode ?? countryCode,
        countryName: response.countryName ?? countryName,
        imageUrl,
        reportId: response.reportId,
        reading: response.reading,
        validation: response.validation,
        generatedAt: response.generatedAt,
      }));
      // Persist email for cross-session report re-access (used by get-report gating).
      try { localStorage.setItem('palmMitraEmail', cleanEmail); } catch { /* ignore */ }

      setProcessingStep('complete');
      clearInterval(msgInterval);
      const completionProperties = {
        latency_ms: Date.now() - analysisStartedAt,
        reading_type: formData.readingType,
        has_report_id: Boolean(response.reportId),
      };
      analytics.track('palm_analysis_completed', completionProperties);
      posthog.capture('palm_analysis_completed', completionProperties);
      analytics.track('ai_request_completed', {
        feature: 'palm_analysis',
        latency_ms: Date.now() - analysisStartedAt,
        success: true,
      });
      formAnalytics.success({ reading_type: formData.readingType });
      navigate(response.reportId ? `/report/${response.reportId}` : '/report');

    } catch (err) {
      setProcessingStep('error');
      clearInterval(msgInterval);
      const msg = err instanceof Error ? err.message : '';
      const friendly =
        /AI capacity|temporarily unavailable/i.test(msg)
          ? 'Our AI reading capacity is being restored. Your photo is safe—please try again shortly.'
          : /briefly busy|rate limit|too many/i.test(msg)
          ? 'The reading engine is briefly busy. Please wait a minute and try again.'
          : /network|fetch|Failed to fetch/i.test(msg)
          ? "We couldn't reach the PalmMitra servers. Please check your connection and try again."
          : /upload/i.test(msg)
          ? "Your photo couldn't be uploaded. Please try a different image or check your connection."
          : "We couldn't complete your reading right now. Please try again in a moment.";
      const failureProperties = {
        error_category: /network|fetch/i.test(msg) ? 'network_error'
          : /rate limit|too many|capacity/i.test(msg) ? 'timeout' : 'provider_error',
        reason: (msg || 'unknown').slice(0, 160),
        latency_ms: Date.now() - analysisStartedAt,
      };
      analytics.track('palm_analysis_failed', failureProperties);
      posthog.capture('palm_analysis_failed', failureProperties);
      analytics.track('ai_request_failed', {
        feature: 'palm_analysis',
        latency_ms: Date.now() - analysisStartedAt,
        success: false,
      });
      trackApiError('analyze-palm', err);
      formAnalytics.failure('analysis_failed');
      if (isConnectionDrop(msg) && uploadedImageUrl) {
        // Keep the photo and the details; offer a one-tap reconnect instead of a dead end.
        setConnectionLost(true);
      } else {
        toast({ title: 'Reading failed', description: friendly, variant: 'destructive' });
      }
    } finally {
      submittingRef.current = false;
    }
  };

  const isFormValid = imageFile && formData.name && formData.email && formData.age;
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
  const statusMessage = validationError
    ? 'Photo verification failed. Review the guidance below.'
    : isLoading
      ? `${getLoadingLabel()} ${progress}% complete`
      : image
        ? 'Palm photo ready. Complete your details to continue.'
        : 'Choose a palm photo to begin.';

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Palm Reading Online — Upload Your Palm Photo | PalmMitra"
        description="Get a palm reading online in 2 minutes. Upload a photo of your dominant palm and PalmMitra reads 150+ markers to deliver a personalised destiny report with a free preview and localized pricing."
        path="/upload"
        jsonLd={breadcrumbLd([["Upload Palm", "/upload"]])}
      />
      <Navbar />

      {!image && processingStep === 'idle' && (
        <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 bg-background/90 backdrop-blur-md border-t border-accent/20">
          <label
            htmlFor="camera-capture"
            aria-label="Take or choose a palm photo"
            className="btn-gold text-foreground font-semibold min-h-12 rounded-2xl flex items-center justify-center gap-2 w-full active:scale-[0.98] transition-transform text-[15px] cursor-pointer"
          >
            <Camera className="w-[18px] h-[18px]" aria-hidden="true" />
            Take / choose photo
          </label>
        </div>
      )}

      <main className="pt-24 pb-28 sm:pb-20">
        <p className="sr-only" aria-live="polite" aria-atomic="true">{statusMessage}</p>
        <div className="container mx-auto px-4">

          {/* ── Page Header ──────────────────────────── */}
          <AnimatedSection className="text-center mb-5 sm:mb-8">
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-5"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="text-sm font-medium text-accent">Free scan · No payment needed to start</span>
            </m.div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
              Upload Your{' '}
              <span className="text-gradient-gold text-shadow-luxury">Dominant Hand</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              Our AI analyses 150+ palm markers and prepares your personalised life report in under 2 minutes.
            </p>
          </AnimatedSection>

          {/* ── Progress Steps ────────────────────────── */}
          <AnimatedSection delay={0.1} className="max-w-xs mx-auto mb-6 sm:mb-10">
            <div className="flex items-center justify-center">
              {progressSteps.map((s, i) => (
                <div key={s.n} className="flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <m.div
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
                    </m.div>
                    <span className={`text-xs whitespace-nowrap transition-colors ${formStep >= s.n ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < progressSteps.length - 1 && (
                    <m.div
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
            <div className="grid lg:grid-cols-5 gap-5 lg:gap-8">

              {/* LEFT: Form (3 cols) */}
              <div className="lg:col-span-3">
                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Upload Card */}
                  <AnimatedSection delay={0.15}>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      role="region"
                      aria-label="Upload a palm photo"
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
                          <m.div
                            key="preview"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="relative"
                          >
                            <img
                              src={image}
                              alt="Preview of the palm photo you selected, ready for your reading"
                              className="w-full max-h-72 object-cover"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              aria-label="Remove selected palm photo"
                              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                            >
                              <X className="w-4 h-4 text-foreground" aria-hidden="true" />
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
                          </m.div>
                        ) : (
                          /* ── Empty state ── */
                          <m.div
                            key="upload"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="relative flex flex-col items-center py-7 sm:py-12 px-5 sm:px-6 text-center"
                          >
                            {/* Ambient gold radiance */}
                            <div
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-x-8 top-4 h-40 opacity-70 blur-3xl"
                              style={{
                                background:
                                  'radial-gradient(closest-side, hsl(var(--accent) / 0.22), transparent 70%)',
                              }}
                            />

                            {/* Step chip */}
                            <div className="relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/25 mb-5">
                              <span className="text-accent text-[10px]">✦</span>
                              <span className="text-[10px] uppercase tracking-[0.18em] text-accent font-semibold">
                                Step 1 · Capture
                              </span>
                            </div>

                            {/* Palm icon with orbit ring */}
                            <div className="relative mb-5">
                              <div
                                aria-hidden="true"
                                className="absolute inset-0 -m-3 rounded-full border border-accent/25"
                                style={{
                                  background:
                                    'conic-gradient(from 0deg, hsl(var(--accent) / 0.35), transparent 40%, hsl(var(--accent) / 0.25) 70%, transparent)',
                                  mask: 'radial-gradient(circle, transparent 55%, black 56%)',
                                  WebkitMask: 'radial-gradient(circle, transparent 55%, black 56%)',
                                }}
                              />
                              <m.div
                                animate={{
                                  filter: [
                                    'drop-shadow(0 0 10px hsl(42 87% 55% / 0.3))',
                                    'drop-shadow(0 0 24px hsl(42 87% 55% / 0.6))',
                                    'drop-shadow(0 0 10px hsl(42 87% 55% / 0.3))',
                                  ],
                                }}
                                transition={{ duration: 2.5, repeat: Infinity }}
                                className="relative"
                              >
                                <img src={palmIconGold} alt="Gold line-art illustration of an open right palm with its major life, head and heart lines, facing the camera" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
                              </m.div>
                            </div>

                            <h3 className="relative text-xl sm:text-2xl font-serif font-bold text-foreground mb-2 leading-tight text-balance">
                              Photograph Your <span className="text-gradient-gold">Dominant Hand</span>
                            </h3>
                            <p className="relative text-sm text-muted-foreground mb-6 max-w-[19rem] leading-relaxed">
                              Right hand if right-handed · Left if left-handed.{" "}
                              <br className="hidden sm:inline" />
                              Open palm facing the camera in soft, even light.
                            </p>
                            <div className="relative grid grid-cols-3 gap-2 w-full max-w-[280px] mb-5 text-left">
                              {[
                                ['1', 'Open palm', 'All lines visible'],
                                ['2', 'Good light', 'No harsh shadows'],
                                ['3', 'Stay close', 'Fill the frame'],
                              ].map(([step, title, detail]) => (
                                <div key={step} className="rounded-xl border border-border/50 bg-background/35 p-2.5">
                                  <span className="text-[10px] font-bold text-accent">{step}</span>
                                  <p className="mt-1 text-[11px] font-semibold text-foreground leading-tight">{title}</p>
                                  <p className="mt-1 text-[10px] text-muted-foreground leading-tight">{detail}</p>
                                </div>
                              ))}
                            </div>

                            {/* Primary: Camera capture (opens camera directly on mobile) */}
                            <label htmlFor="camera-capture" aria-label="Take a photo of your palm" className="relative cursor-pointer w-full max-w-[280px]">
                              <div className="btn-gold text-foreground font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 w-full active:scale-[0.98] transition-transform text-[15px] shadow-gold-lg">
                                <Camera className="w-[18px] h-[18px]" />
                                Take Photo Now
                                <ArrowRight className="w-4 h-4 opacity-80" />
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

                            {/* Divider "or" */}
                            <div className="relative flex items-center gap-3 w-full max-w-[280px] my-3">
                              <div className="flex-1 h-px bg-border/50" />
                              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">or</span>
                              <div className="flex-1 h-px bg-border/50" />
                            </div>

                            {/* Secondary: Upload from gallery */}
                            <label htmlFor="gallery-upload" aria-label="Upload palm photo from gallery" className="relative cursor-pointer w-full max-w-[280px]">
                              <div className="flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl border border-accent/25 bg-background/40 text-sm text-foreground/90 hover:bg-accent/5 hover:border-accent/45 transition-all">
                                <Upload className="w-4 h-4 text-accent" />
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

                            {/* Micro trust */}
                            <div className="relative mt-6 flex items-center gap-3 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <ShieldCheck className="w-3 h-3 text-accent" />
                                Private
                              </span>
                              <span className="opacity-40">·</span>
                              <span className="flex items-center gap-1.5">
                                <Zap className="w-3 h-3 text-accent" />
                                Instant AI verify
                              </span>
                              <span className="opacity-40">·</span>
                              <span className="hidden sm:flex items-center gap-1.5">
                                Drag &amp; drop supported
                              </span>
                              <span className="sm:hidden flex items-center gap-1.5">
                                JPG · PNG · WEBP
                              </span>
                            </div>
                          </m.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </AnimatedSection>

                  {/* Trust Chips */}
                  <AnimatedSection delay={0.2}>
                    <div className="grid grid-cols-2 gap-2">
                      {trustChips.map(({ icon: Icon, text }) => (
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
                      <m.div
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
                      </m.div>
                    )}
                  </AnimatePresence>

                  {/* ── About You Form ── */}
                  <AnimatedSection delay={0.25}>
                    <div className="relative">
                      {/* Gradient border shell */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 rounded-3xl p-[1px] pointer-events-none"
                        style={{
                          background:
                            'linear-gradient(135deg, hsl(var(--accent) / 0.55), hsl(var(--accent) / 0.05) 45%, hsl(var(--primary) / 0.4))',
                        }}
                      >
                        <div className="w-full h-full rounded-3xl bg-card/60" />
                      </div>

                      <div className="relative glass-premium rounded-3xl p-5 sm:p-6 border border-accent/20 space-y-5 overflow-hidden">
                        {/* Top hairline */}
                        <div
                          aria-hidden="true"
                          className="absolute top-0 left-6 right-6 h-px"
                          style={{
                            background:
                              'linear-gradient(90deg, transparent, hsl(var(--accent) / 0.6), transparent)',
                          }}
                        />

                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center flex-shrink-0 shadow-gold">
                              <User className="w-4 h-4 text-accent" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase tracking-[0.18em] text-accent/80 font-semibold">
                                  Step 2
                                </span>
                                <span className="h-2.5 w-px bg-accent/30" />
                                <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                  30 seconds
                                </span>
                              </div>
                              <p className="font-serif font-bold text-foreground text-base sm:text-lg leading-tight mt-0.5">
                                About <span className="text-gradient-gold">You</span>
                              </p>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 border border-accent/25 flex-shrink-0">
                            <Lock className="w-2.5 h-2.5 text-accent" />
                            <span className="text-[9px] uppercase tracking-[0.14em] text-accent font-semibold">
                              Private
                            </span>
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed -mt-2">
                          Personalises your destiny timeline and life-cycle predictions.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-[13px] font-medium text-foreground/90 flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-accent" />
                              Your Name
                            </Label>
                            <Input
                              id="name"
                              placeholder="e.g. Priya Sharma"
                              autoComplete="name"
                              maxLength={60}
                              aria-invalid={!!fieldErrors.name}
                              aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                              value={formData.name}
                              onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value });
                                if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }));
                              }}
                              className={`rounded-xl h-12 bg-background/60 focus:border-accent focus:ring-1 focus:ring-accent/40 text-[15px] ${fieldErrors.name ? 'border-destructive' : 'border-border/60'}`}
                            />
                            {fieldErrors.name && (
                              <p id="name-error" className="text-xs text-destructive">{fieldErrors.name}</p>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="age" className="text-[13px] font-medium text-foreground/90 flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-accent" />
                              Your Age
                            </Label>
                            <Input
                              id="age"
                              type="number"
                              inputMode="numeric"
                              min={13}
                              max={100}
                              step={1}
                              placeholder="e.g. 28"
                              aria-invalid={!!fieldErrors.age}
                              aria-describedby={fieldErrors.age ? 'age-error' : 'age-help'}
                              value={formData.age}
                              onChange={(e) => {
                                const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
                                setFormData({ ...formData, age: v });
                                if (fieldErrors.age) setFieldErrors((p) => ({ ...p, age: undefined }));
                              }}
                              className={`rounded-xl h-12 bg-background/60 focus:border-accent focus:ring-1 focus:ring-accent/40 text-[15px] ${fieldErrors.age ? 'border-destructive' : 'border-border/60'}`}
                            />
                            {fieldErrors.age ? (
                              <p id="age-error" className="text-xs text-destructive">{fieldErrors.age}</p>
                            ) : (
                              <p id="age-help" className="text-[11px] text-muted-foreground/80">Anchors your life timeline (13–100).</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="email" className="text-[13px] font-medium text-foreground/90 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-accent" />
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            maxLength={254}
                            placeholder="your@email.com"
                            aria-invalid={!!fieldErrors.email}
                            aria-describedby={fieldErrors.email ? 'email-error' : 'email-help'}
                            value={formData.email}
                            onChange={(e) => {
                              setFormData({ ...formData, email: e.target.value });
                              if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                            }}
                            className={`rounded-xl h-12 bg-background/60 focus:border-accent focus:ring-1 focus:ring-accent/40 text-[15px] ${fieldErrors.email ? 'border-destructive' : 'border-border/60'}`}
                          />
                          {fieldErrors.email ? (
                            <p id="email-error" className="text-xs text-destructive">{fieldErrors.email}</p>
                          ) : (
                            <p id="email-help" className="text-[11px] text-muted-foreground/80 flex items-center gap-1.5">
                              <ShieldCheck className="w-3 h-3 text-accent/70 flex-shrink-0" />
                              Secure report link sent here. Never shared.
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="report-language" className="text-[13px] font-medium text-foreground/90 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-accent" />
                            Report Language
                          </Label>
                          <Select value={formData.language} onValueChange={(language: 'english' | 'hinglish') => setFormData({ ...formData, language })}>
                            <SelectTrigger id="report-language" className="h-12 rounded-xl bg-background/60 border-border/60">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="english">English</SelectItem>
                              <SelectItem value="hinglish">Hinglish</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-[11px] text-muted-foreground/80">Choose how your complete reading is written.</p>
                        </div>
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
                          See My Free Destiny Preview
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
                  <div className="relative lg:sticky lg:top-28">
                    {/* Gradient border shell */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 rounded-3xl p-[1px] pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(135deg, hsl(var(--accent) / 0.6), hsl(var(--accent) / 0.05) 45%, hsl(var(--primary) / 0.45))',
                      }}
                    >
                      <div className="w-full h-full rounded-3xl bg-card/60" />
                    </div>

                    {/* Ambient gold glow */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -inset-4 rounded-[2rem] opacity-60 blur-2xl"
                      style={{
                        background:
                          'radial-gradient(400px 220px at 50% 0%, hsl(var(--accent) / 0.18), transparent 70%)',
                      }}
                    />

                    <div className="relative glass-premium rounded-3xl p-6 border border-accent/20 space-y-5 overflow-hidden">
                      {/* Top hairline */}
                      <div
                        aria-hidden="true"
                        className="absolute top-0 left-6 right-6 h-px"
                        style={{
                          background:
                            'linear-gradient(90deg, transparent, hsl(var(--accent) / 0.7), transparent)',
                        }}
                      />

                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-11 h-11 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center flex-shrink-0 shadow-gold">
                            <FileText className="w-5 h-5 text-accent" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-serif font-bold text-foreground text-base leading-tight">
                              What You'll <span className="text-gradient-gold">Unlock</span>
                            </h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-accent/70" />
                              2,000+ words · 15 markers
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 border border-accent/25 flex-shrink-0">
                          <span className="text-[9px] uppercase tracking-[0.14em] text-accent font-semibold">
                            Preview
                          </span>
                        </span>
                      </div>

                      {/* Sections */}
                      <div className="space-y-2">
                        {reportSections.map(({ icon: Icon, label, free }) => (
                          <div
                            key={label}
                            className={`group relative flex items-center gap-3 p-3 pl-4 rounded-xl border transition-all ${
                              free
                                ? 'bg-card/50 border-accent/25 hover:border-accent/40'
                                : 'bg-background/40 border-border/40 hover:border-accent/25'
                            }`}
                          >
                            {/* Left accent bar */}
                            <div
                              aria-hidden="true"
                              className={`absolute left-0 top-2.5 bottom-2.5 w-[2px] rounded-r-full ${
                                free ? 'bg-gradient-to-b from-accent to-accent/30' : 'bg-muted/40'
                              }`}
                            />
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                                free
                                  ? 'bg-accent/10 border-accent/25'
                                  : 'bg-muted/20 border-muted/30'
                              }`}
                            >
                              <Icon
                                className={`w-3.5 h-3.5 ${free ? 'text-accent' : 'text-muted-foreground'}`}
                              />
                            </div>
                            <span className="text-sm text-foreground flex-1 font-medium">{label}</span>
                            {free ? (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-500 border border-green-500/25 tracking-wider">
                                FREE
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/25 flex items-center gap-1 tracking-wider">
                                <Lock className="w-2.5 h-2.5" />
                                PREMIUM
                              </span>
                            )}
                          </div>

                        ))}
                      </div>

                      {/* Price highlight */}
                      <div
                        className="relative overflow-hidden rounded-2xl p-4 text-center border border-accent/25 bg-gradient-mystic"
                      >
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 opacity-20"
                          style={{
                            backgroundImage:
                              'radial-gradient(circle at center, hsl(var(--accent) / 0.5) 1px, transparent 1px)',
                            backgroundSize: '18px 18px',
                          }}
                        />
                        <div className="relative">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-accent/80 font-semibold mb-1">
                            Unlock All 7 Sections
                          </p>
                          <div className="flex items-baseline justify-center gap-2">
                            <span className="font-serif text-3xl font-bold text-gradient-gold leading-none">
                              {PRODUCTS.insight.prices[currency].display}
                            </span>
                            <span className="text-xs text-muted-foreground line-through">{formatCurrency(Math.round(PRODUCTS.insight.prices[currency].minor * 499 / 299), currency)}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1.5">
                            One-time · Lifetime access · PDF included
                          </p>
                        </div>
                      </div>

                      {/* Trust row */}
                      <div className="flex items-center justify-center gap-2.5">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                          ))}
                        </div>
                        <div className="h-3 w-px bg-border" />
                        <span className="text-xs text-muted-foreground">4.9 · 12,400+ readings</span>
                      </div>

                      {/* Divider */}
                      <div
                        aria-hidden="true"
                        className="h-px w-full"
                        style={{
                          background:
                            'linear-gradient(90deg, transparent, hsl(var(--accent) / 0.3), transparent)',
                        }}
                      />

                      {/* Privacy */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                          <p className="text-xs font-semibold text-foreground tracking-wide">
                            Your Privacy, Guaranteed
                          </p>
                        </div>
                        {[
                          'Photo used only for your reading',
                          'Never shared with third parties',
                        ].map((line) => (
                          <p key={line} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                            <span className="mt-1 w-1 h-1 rounded-full bg-accent/60 flex-shrink-0" />
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* ── Premium Analysis Overlay ────────────────────────── */}
      <AnalysisOverlay
        open={isLoading || processingStep === 'complete'}
        imageUrl={image}
        isComplete={processingStep === 'complete'}
        hasError={processingStep === 'error'}
        userName={formData.name}
      />

      <Footer />
    </div>
  );
}
