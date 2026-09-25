import { useState, useCallback, useRef, useEffect } from 'react';
import { m, AnimatePresence } from '@/lib/motion';
import { useNavigate } from 'react-router-dom';
import {
  Upload, X, Camera, CheckCircle, ArrowRight, ArrowLeft,
  Sparkles, Shield, Zap, Heart, MessageCircle, Target,
  Infinity as InfinityIcon, Star, Lock, Loader2,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { FestiveBanner } from '@/components/home/FestiveBanner';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { breadcrumbLd } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
const getSupabase = () => import('@/integrations/supabase/client').then((m) => m.supabase);
import { useToast } from '@/hooks/use-toast';
import { compressImage } from '@/lib/imageCompression';
import { PalmMatchAnalysisOverlay } from '@/components/palmmatch/PalmMatchAnalysisOverlay';
import type { PalmMatchLanguage } from '@/components/palmmatch/types';
import { analytics, useFormAnalytics, trackApiError } from '@/lib/analytics';
import {

  validateImageFile, nameSchema, ageSchema, emailSchema, relationshipTypeSchema,
} from '@/lib/validation';

const PALMMATCH_FAQS = [
  { q: 'How does palm compatibility work?', a: 'PalmMatch reads both partners\' heart, head, life and fate lines plus the mounts, then compares them to show where you naturally align and where you may need more understanding.' },
  { q: 'Can palm reading show marriage compatibility?', a: 'Palmistry offers a reflective view of emotional style, commitment tendency and communication. PalmMatch turns this into a couple compatibility score with emotional, mental, physical and spiritual dimensions. It is for guidance and reflection, not a prediction.' },
  { q: 'What do we need to upload?', a: 'One clear photo of each partner\'s open palm, both names and ages, the type of relationship and an email address to receive the report.' },
  { q: 'How much does PalmMatch cost?', a: 'A free compatibility preview is included. The full PalmMatch report is ₹999 in India, $24.99 in the US and priced in local currency in the UK, UAE, Canada, Australia and Singapore.' },
];

const PALMMATCH_FAQ_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PALMMATCH_FAQS.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
};

const PALMMATCH_SERVICE_LD = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'PalmMatch — Couple Palm Compatibility Report',
  serviceType: 'Love and marriage compatibility by palm reading',
  url: 'https://www.palmmitra.in/palmmatch',
  provider: { '@type': 'Organization', name: 'PalmMitra', url: 'https://www.palmmitra.in/' },
  areaServed: ['IN', 'US', 'GB', 'AE', 'CA', 'AU', 'SG'],
  offers: [
    ['999', 'INR'], ['24.99', 'USD'], ['19.99', 'GBP'], ['99', 'AED'], ['34', 'CAD'], ['39', 'AUD'], ['34', 'SGD'],
  ].map(([price, priceCurrency]) => ({ '@type': 'Offer', price, priceCurrency, url: 'https://www.palmmitra.in/palmmatch' })),
};


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
      className="glass-dark rounded-2xl border border-accent/25 p-5 text-left mx-auto max-w-sm"
      style={{ boxShadow: '0 8px 40px hsl(42 87% 55% / 0.12)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] text-primary-foreground/80 uppercase tracking-[0.22em] font-bold mb-0.5">
            Sample report preview
          </p>
          <p className="text-sm font-semibold text-primary-foreground">Priya & Arjun</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-serif font-bold text-gradient-gold leading-none">87%</div>
          <p className="text-[9px] text-primary-foreground/75 uppercase tracking-widest mt-0.5">Compatibility</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {sampleDimensions.map(({ icon: Icon, label, score, color }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
            <span className="text-xs text-primary-foreground flex-1 truncate">{label}</span>
            <div className="w-16 h-1 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${score}%`, background: color }}
              />
            </div>
            <span className="text-xs font-semibold text-primary-foreground tabular-nums w-8 text-right">
              {score}%
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-accent" fill="currentColor" />
          <span className="text-[11px] text-primary-foreground/90">Long-term potential</span>
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
  const uploadStateRef = useRef({
    person1: { url: null as string | null, status: 'idle' as UploadStatus },
    person2: { url: null as string | null, status: 'idle' as UploadStatus },
  });

  const [person1Name, setPerson1Name] = useState('');
  const [person1Age, setPerson1Age] = useState('');
  const [person2Name, setPerson2Name] = useState('');
  const [person2Age, setPerson2Age] = useState('');
  const [relationshipType, setRelationshipType] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState<PalmMatchLanguage>(() => {
    const saved = localStorage.getItem('palmmitra:palmmatch-language');
    return saved === 'english' ? 'english' : 'hinglish';
  });
  const formAnalytics = useFormAnalytics('palmmatch_upload');

  useEffect(() => {
    analytics.track('palm_reading_started', { reading_type: 'palmmatch' });
  }, []);

  // Background upload
  const pollForPalmMatch = async (mail: string, p1: string, p2: string): Promise<string | null> => {
    const supabase = await getSupabase();
    for (let attempt = 0; attempt < 20; attempt++) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const { data } = await supabase.functions.invoke('get-palmmatch-status', {
          body: { lookup_recent: true, email: mail, person1_name: p1, person2_name: p2 },
        });
        if (data?.found && data.report_id) return data.report_id as string;
      } catch { /* keep polling */ }
    }
    return null;
  };

  const uploadInBackground = useCallback(
    async (
      original: File,
      slot: 'person1' | 'person2',
      setUrl: (u: string) => void,
      setStatus: (s: UploadStatus) => void,
    ) => {
      setStatus('uploading');
      uploadStateRef.current[slot] = { url: null, status: 'uploading' };
      analytics.track('palm_image_upload_started', {
        reading_type: 'palmmatch', slot, file_size_kb: Math.round(original.size / 1024),
      });
      try {
        // Downscale big camera photos first so mobile uploads don't time out.
        const file = await compressImage(original);
        const extensionByType: Record<string, string> = {
          'image/jpeg': 'jpg',
          'image/png': 'png',
          'image/webp': 'webp',
        };
        const ext = extensionByType[file.type] ?? 'jpg';
        const path = `palmmatch/${crypto.randomUUID()}_${slot}.${ext}`;
        const supabase = await getSupabase();
        // Mobile connections drop mid-upload; retry transient failures.
        let error: { message?: string } | null = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          const res = await supabase.storage
            .from('palm-uploads')
            .upload(path, file, { cacheControl: '3600', contentType: file.type, upsert: true });
          error = res.error;
          if (!error) break;
          if (!/fetch|network|timeout|load failed/i.test(String(error.message || ''))) break;
          await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
        }
        if (error) throw error;
        const { data } = supabase.storage.from('palm-uploads').getPublicUrl(path);
        uploadStateRef.current[slot] = { url: data.publicUrl, status: 'ready' };
        setUrl(data.publicUrl);
        setStatus('ready');
        analytics.track('palm_image_uploaded', { reading_type: 'palmmatch', slot });
      } catch (e) {
        console.error('bg upload failed', e);
        uploadStateRef.current[slot] = { url: null, status: 'error' };
        setStatus('error');
        analytics.track('palm_image_upload_failed', {
          reading_type: 'palmmatch', slot, error_category: 'network_error',
        });
        toast({
          title: 'Palm upload failed',
          description: 'Please check your connection and select the photo again.',
          variant: 'destructive',
        });
      }
    },
    [toast],
  );

  const handleImage1 = (file: File, preview: string) => {
    const validation = validateImageFile(file);
    if (!validation.ok || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({
        title: validation.reason ?? 'Unsupported photo format',
        description: validation.suggestion ?? 'Please upload a JPG, PNG or WEBP photo.',
        variant: 'destructive',
      });
      return;
    }
    setImage1(preview);
    setUrl1(null);
    uploadInBackground(file, 'person1', setUrl1, setStatus1);
  };
  const handleImage2 = (file: File, preview: string) => {
    const validation = validateImageFile(file);
    if (!validation.ok || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({
        title: validation.reason ?? 'Unsupported photo format',
        description: validation.suggestion ?? 'Please upload a JPG, PNG or WEBP photo.',
        variant: 'destructive',
      });
      return;
    }
    setImage2(preview);
    setUrl2(null);
    uploadInBackground(file, 'person2', setUrl2, setStatus2);
  };
  const clearImage1 = () => {
    uploadStateRef.current.person1 = { url: null, status: 'idle' };
    setImage1(null); setUrl1(null); setStatus1('idle');
  };
  const clearImage2 = () => {
    uploadStateRef.current.person2 = { url: null, status: 'idle' };
    setImage2(null); setUrl2(null); setStatus2('idle');
  };

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
      formAnalytics.validationError('required_fields', 'incomplete');
      return;
    }

    const checks: Array<[string, { success: boolean; error?: { errors: { message: string }[] } }]> = [
      ['Your name', nameSchema.safeParse(person1Name)],
      ['Your age', ageSchema.safeParse(person1Age)],
      ["Partner's name", nameSchema.safeParse(person2Name)],
      ["Partner's age", ageSchema.safeParse(person2Age)],
      ['Email', emailSchema.safeParse(email)],
      ['Relationship', relationshipTypeSchema.safeParse(relationshipType)],
    ];
    const failed = checks.find(([, r]) => !r.success);
    if (failed) {
      toast({
        title: `${failed[0]} needs a quick fix`,
        description: failed[1].error?.errors[0]?.message ?? 'Please check this field.',
        variant: 'destructive',
      });
      formAnalytics.validationError(failed[0], 'invalid');
      return;
    }

    setProcessing('uploading');
    formAnalytics.submit('details');
    analytics.track('palm_analysis_started', { reading_type: 'palmmatch', language });
    analytics.track('ai_request_started', { feature: 'palmmatch_analysis', language });
    const analysisStartedAt = Date.now();

    try {
      // Wait for background uploads to finish
      const waitFor = async (slot: 'person1' | 'person2') => {
        let tries = 0;
        while (
          !uploadStateRef.current[slot].url &&
          uploadStateRef.current[slot].status !== 'error' &&
          tries < 100
        ) {
          await new Promise((r) => setTimeout(r, 200));
          tries++;
        }
        return uploadStateRef.current[slot].url;
      };
      const [uploadedUrl1, uploadedUrl2] = await Promise.all([
        waitFor('person1'),
        waitFor('person2'),
      ]);

      if (!uploadedUrl1 || !uploadedUrl2) {
        throw new Error('Upload failed. Please re-select your palm images.');
      }

      setProcessing('analyzing');

      const supabase = await getSupabase();
      const { data, error } = await supabase.functions.invoke('analyze-palmmatch', {
        body: {
          image1Url: uploadedUrl1,
          image2Url: uploadedUrl2,
          person1: { name: person1Name, age: person1Age },
          person2: { name: person2Name, age: person2Age },
          relationshipType,
          email,
          language,
        },
      });

      if (error && !data) {
        let serverMessage = '';
        try {
          const ctx = (error as { context?: Response }).context;
          const parsed = ctx ? await ctx.clone().json() : null;
          serverMessage = parsed?.error || '';
        } catch { /* ignore */ }
        throw new Error(serverMessage || 'Analysis failed. Please try again.');
      }

      if (error || !data?.success) {
        if (data?.error === 'invalid_palm') {
          toast({
            title: 'We couldn\'t read that palm',
            description: data.message || 'Please re-upload a clearer palm photo.',
            variant: 'destructive',
          });
          setProcessing('idle');
          setStep(data.person === 'person2' ? 2 : 1);
          analytics.track('palm_analysis_failed', {
            reading_type: 'palmmatch', error_category: 'validation_error',
            latency_ms: Date.now() - analysisStartedAt,
          });
          formAnalytics.failure('palm_validation_rejected');
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
          relationshipType, email, language: data.language ?? language,
          image1Url: uploadedUrl1, image2Url: uploadedUrl2,
        }),
      );

      setProcessing('complete');
      analytics.track('palm_analysis_completed', {
        reading_type: 'palmmatch', latency_ms: Date.now() - analysisStartedAt,
        has_report_id: Boolean(data.reportId),
      });
      analytics.track('ai_request_completed', {
        feature: 'palmmatch_analysis', latency_ms: Date.now() - analysisStartedAt, success: true,
      });
      formAnalytics.success({ reading_type: 'palmmatch' });
      setTimeout(() => navigate(`/palmmatch-report/${data.reportId}`), 900);
    } catch (err) {
      console.error('PalmMatch error:', err);
      // A dropped mobile connection usually still leaves a finished reading on the
      // server — look for it before telling the couple anything went wrong.
      const message = err instanceof Error ? err.message : '';
      if (/failed to send a request|failed to fetch|network|load failed|timeout/i.test(message)) {
        const recoveredId = await pollForPalmMatch(email.trim().toLowerCase(), person1Name, person2Name);
        if (recoveredId) {
          setProcessing('complete');
          analytics.track('palm_analysis_completed', {
            reading_type: 'palmmatch', latency_ms: Date.now() - analysisStartedAt, has_report_id: true,
          });
          formAnalytics.success({ reading_type: 'palmmatch' });
          setTimeout(() => navigate(`/palmmatch-report/${recoveredId}`), 600);
          return;
        }
      }
      analytics.track('palm_analysis_failed', {
        reading_type: 'palmmatch', error_category: 'provider_error',
        latency_ms: Date.now() - analysisStartedAt,
      });
      analytics.track('ai_request_failed', {
        feature: 'palmmatch_analysis', latency_ms: Date.now() - analysisStartedAt, success: false,
      });
      trackApiError('analyze-palmmatch', err);
      formAnalytics.failure('analysis_failed');
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

  // ─── Processing Screen (Premium AI Overlay) ────────────────────────────
  if (processing !== 'idle' && processing !== 'error') {
    return (
      <PalmMatchAnalysisOverlay
        open
        isComplete={processing === 'complete'}
        hasError={false}
        person1Name={person1Name}
        person2Name={person2Name}
        image1Url={image1}
        image2Url={image2}
      />
    );
  }


  // ─── Main Upload UI ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="PalmMatch — Love & Marriage Compatibility by Palm Reading | PalmMitra"
        description="Check love and marriage compatibility with AI palm reading. Upload both partners' palms for a couple compatibility score, emotional, mental and physical breakdown, and shared destiny insights."
        path="/palmmatch"
        jsonLd={[breadcrumbLd([["PalmMatch", "/palmmatch"]]), PALMMATCH_SERVICE_LD, PALMMATCH_FAQ_LD]}
      />
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
        <FestiveBanner />
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
            <div className="inline-flex items-center gap-2 glass-dark rounded-full px-3 py-1 mb-4 border border-accent/25">
              <Sparkles className="w-3 h-3 text-accent" />
              <span className="text-[11px] font-semibold text-primary-foreground tracking-wide">
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
              data-analytics-id="start_palmmatch"
              className="inline-flex items-center gap-1.5 mt-3 min-h-11 px-3 text-xs text-accent hover:text-accent/80 transition-colors"
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
                  <m.div
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
                      data-analytics-id="palmmatch_continue"
                      disabled={!canAdvanceStep1}
                      className="btn-gold w-full mt-6 h-12 rounded-2xl text-foreground font-semibold text-[15px] gap-2"
                    >
                      Continue — add their palm
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </m.div>
                )}

                {step === 2 && (
                  <m.div
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

                    <fieldset className="mt-4">
                      <legend className="text-xs font-semibold mb-2">Report language</legend>
                      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Report language">
                        {([
                          ['english', 'English', 'Clear, concise English'],
                          ['hinglish', 'Hinglish', 'Natural Roman Hindi + English'],
                        ] as const).map(([value, label, description]) => {
                          const selected = language === value;
                          return (
                            <Button
                              key={value}
                              type="button"
                              variant="outline"
                              role="radio"
                              aria-checked={selected}
                              onClick={() => {
                                setLanguage(value);
                                localStorage.setItem('palmmitra:palmmatch-language', value);
                              }}
                              className={`h-auto min-h-14 rounded-xl px-3 py-2.5 flex-col items-start gap-0.5 ${selected ? 'border-accent bg-accent/10 shadow-gold' : 'border-border/60 bg-background/40'}`}
                            >
                              <span className={selected ? 'text-accent font-semibold' : 'text-foreground font-semibold'}>{label}</span>
                              <span className="text-[10px] font-normal text-muted-foreground text-left leading-tight">{description}</span>
                            </Button>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        Your complete compatibility report will use this language.
                      </p>
                    </fieldset>

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
                        data-analytics-id="start_palmmatch_analysis"
                        disabled={!canAdvanceStep2}
                        className="btn-gold flex-1 h-12 rounded-2xl text-foreground font-semibold text-[15px] gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Reveal our compatibility
                      </Button>
                    </div>
                  </m.div>
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
        <section aria-labelledby="palmmatch-faq" className="container mx-auto px-4 mt-16 max-w-3xl">
          <h2 id="palmmatch-faq" className="font-serif text-2xl md:text-3xl text-foreground text-center mb-6">
            PalmMatch couple compatibility — common questions
          </h2>
          <div className="space-y-3">
            {PALMMATCH_FAQS.map(({ q, a }) => (
              <details key={q} className="rounded-2xl border border-border bg-card/60 backdrop-blur px-5 py-4 group">
                <summary className="cursor-pointer text-sm md:text-base font-medium text-foreground list-none flex justify-between gap-4">
                  {q}<span className="text-accent group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
