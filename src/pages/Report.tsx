import { useEffect, useState } from 'react';
import { m } from '@/lib/motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Crown, Activity, Brain, Zap } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PremiumBackground } from '@/components/PremiumBackground';
import { DestinyRevealLoader } from '@/components/DestinyRevealLoader';
import { ReportProgressIndicator } from '@/components/report/ReportProgressIndicator';
import { useReportUnlock } from '@/hooks/useReportUnlock';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { PaymentRecoveryDialog, type RecoveryReason } from '@/components/payment/PaymentRecoveryDialog';
import { LockedSection } from '@/components/payment/LockedSection';
import { UnlockSuccessOverlay } from '@/components/payment/UnlockSuccessOverlay';
import { useAiEntitlement } from '@/hooks/useAiEntitlement';
import { SEO } from '@/components/SEO';


// Report components
import { ReportHeader, reportTitles } from '@/components/report/ReportHeader';
import { MajorLinesSection } from '@/components/report/MajorLinesSection';
import { MountsSection } from '@/components/report/MountsSection';
import { PersonalityTraits } from '@/components/report/PersonalityTraits';
import { CareerWealth } from '@/components/report/CareerWealth';
import { LoveRelationships } from '@/components/report/LoveRelationships';
import { LifePhaseSection } from '@/components/report/LifePhaseSection';
import { SpiritualRemediesSection } from '@/components/report/SpiritualRemediesSection';
import { FinalBlessing } from '@/components/report/FinalBlessing';
import { ActionButtons } from '@/components/report/ActionButtons';
import { ReviewPrompt } from '@/components/report/ReviewPrompt';
import { PalmMatchCrossSell } from '@/components/report/PalmMatchCrossSell';
import { PremiumPaywall } from '@/components/report/PremiumPaywall';
import { UnlockTeaserCard } from '@/components/report/UnlockTeaserCard';
import { VedicCertificate } from '@/components/report/VedicCertificate';
import { PalmLineExplorer } from '@/components/report/PalmLineExplorer';
import { LegalDisclaimer } from '@/components/report/LegalDisclaimer';
import { StickyUnlockCTA } from '@/components/report/StickyUnlockCTA';
import { AskPalmMitraInline } from '@/components/report/AskPalmMitraInline';
import { PalmMitraAiSection } from '@/components/report/PalmMitraAiSection';
import { AiDrawer } from '@/components/ai/AiDrawer';
import type { PalmReading, StoredData } from '@/components/report/types';
import { analytics, markSectionViewed, recordInteraction, trackApiError } from '@/lib/analytics';

interface SessionData extends StoredData {
  imageUrl?: string;
  reportId?: string;
  reading?: PalmReading;
  validation?: {
    confidence: number;
    quality: string;
  };
  generatedAt?: string;
}

const reportSections = [
  { id: 'summary', label: 'Summary' },
  { id: 'lines', label: 'Major Lines' },
  { id: 'mounts', label: 'Mounts' },
  { id: 'personality', label: 'Personality' },
  { id: 'career', label: 'Career' },
  { id: 'love', label: 'Love' },
  { id: 'phases', label: 'Life Phase' },
  { id: 'remedies', label: 'Remedies' },
  { id: 'blessing', label: 'Blessing' },
];

export default function Report() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id: urlReportId } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [reading, setReading] = useState<PalmReading | null>(null);
  const [userData, setUserData] = useState<SessionData | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string>(new Date().toISOString());
  const [error, setError] = useState<string | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [showSectionBar, setShowSectionBar] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowSectionBar(window.scrollY > 380);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const [activeSection, setActiveSection] = useState('summary');
  
  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [successIsSubscription, setSuccessIsSubscription] = useState(false);
  const [recovery, setRecovery] = useState<{ reason: RecoveryReason; plan: 'report99' | 'monthly299' | 'unlimited999' } | null>(null);

  // AI drawer state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiSeed, setAiSeed] = useState<string | null>(null);
  const [aiSource, setAiSource] = useState<string>('end_of_report');
  

  const openAi = (source: string, seed?: string) => {
    analytics.track('ai_guide_opened', { source });
    setAiSource(source);
    setAiSeed(seed ?? null);
    setAiOpen(true);
  };


  // Resolve reportId: prefer URL param, fallback to session data
  const resolvedReportId = urlReportId || userData?.reportId;

  // Get user email from session data
  const userEmail = userData?.email || '';
  
  // Use the unlock hook with resolved report ID
  const { 
    isUnlocked, 
    hasSubscription, 
    isLoading: unlockLoading,
    isProcessing,
    initiatePayment 
  } = useReportUnlock(resolvedReportId, userEmail);

  const { data: aiEntitlement } = useAiEntitlement(resolvedReportId, userEmail, isUnlocked && !!resolvedReportId && !!userEmail);

  // Listen for payment success events
  useEffect(() => {
    const handlePaymentSuccess = (event: CustomEvent) => {
      setShowPaymentModal(false);
      setSuccessIsSubscription(event.detail.subscription);
      setShowSuccessOverlay(true);
      analytics.track('checkout_completed', {
        plan_id: event.detail.plan,
        checkout_step: 'complete',
      });
    };

    window.addEventListener('paymentSuccess', handlePaymentSuccess as EventListener);
    return () => {
      window.removeEventListener('paymentSuccess', handlePaymentSuccess as EventListener);
    };
  }, []);

  useEffect(() => {
    const loadReport = async () => {
      const storedData = sessionStorage.getItem('palmMitraData');
      
      if (storedData) {
        try {
          const data: SessionData = JSON.parse(storedData);
          setUserData(data);
          
          if (data.reading) {
            setReading(data.reading);
            setGeneratedAt(data.generatedAt || new Date().toISOString());
            setLoading(false);
            analytics.track('reading_preview_viewed', { report_id: data.reportId ?? urlReportId ?? null });
            return;
          }
        } catch (e) {
          console.error('Error parsing session data:', e);
        }
      }

      if (urlReportId) {
        try {
          // Send persisted email so the edge function can gate `report_json`
          // behind ownership / subscription / unlock.
          const persistedEmail = (() => {
            try {
              // Reminder emails carry the owner's email (base64url) so they can reopen on any device.
              const e = new URLSearchParams(window.location.search).get('e');
              if (e) {
                const decoded = atob(e.replace(/-/g, '+').replace(/_/g, '/')).trim().toLowerCase();
                if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(decoded)) localStorage.setItem('palmMitraEmail', decoded);
              }
            } catch { /* ignore malformed link */ }
            try { return localStorage.getItem('palmMitraEmail') || ''; } catch { return ''; }
          })();
          const { data, error: fetchError } = await supabase.functions.invoke('get-report', {
            body: { report_id: urlReportId, user_email: persistedEmail || undefined },
          });

          if (fetchError) throw fetchError;

          if (data?.success && data?.report) {
            const report = data.report;
            setUserData({
              name: report.user_name,
              age: report.user_age || '',
              email: persistedEmail,
              readingType: (report.reading_type as StoredData['readingType']) || 'full',
              language: report.language === 'hinglish' ? 'hinglish' : 'english',
              countryCode: report.country_code || undefined,
              countryName: report.country_name || undefined,
              palmImage: report.image_url,
              imageUrl: report.image_url,
              reportId: urlReportId,
            });
            if (report.report_json) {
              setReading(report.report_json as unknown as PalmReading);
            } else if (report.shared_preview) {
              setReading(report.shared_preview as unknown as PalmReading);
              setIsShared(true);
              analytics.track('shared_report_viewed', { report_id: urlReportId });
            }
            setGeneratedAt(report.created_at || new Date().toISOString());
            setLoading(false);
            analytics.track('reading_preview_viewed', { report_id: urlReportId });
            if (!report.report_json && !report.shared_preview) {
              setError('This report is not available yet. Please try again shortly.');
              analytics.track('report_locked_viewed', { report_id: urlReportId });
            }
            return;
          }
        } catch (err) {
          console.error('Error loading report from database:', err);
          trackApiError('get-report', err);
        }
      }

      if (!storedData && !urlReportId) {
        navigate('/upload');
        return;
      }

      setError('Report not found');
      setLoading(false);
    };

    loadReport();
  }, [navigate, urlReportId, toast]);

  // Track the active report section without forcing layout on every scroll event.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!visible) return;

        const sectionId = visible.target.id.replace('section-', '');
        const sectionIndex = reportSections.findIndex((section) => section.id === sectionId);
        if (sectionIndex < 0) return;
        setActiveSection(sectionId);

        const firstView = markSectionViewed(`report_${sectionId}`, {
          section_name: reportSections[sectionIndex].label,
          section_index: sectionIndex,
        });
        if (firstView) {
          analytics.track('destiny_section_viewed', {
            section_id: sectionId,
            section_name: reportSections[sectionIndex].label,
            section_index: sectionIndex,
          });
          analytics.track('report_section_viewed', {
            section_id: sectionId,
            section_index: sectionIndex,
          });
        }
      },
      { rootMargin: '-130px 0px -60% 0px', threshold: 0 },
    );

    reportSections.forEach(({ id }) => {
      const section = document.getElementById(`section-${id}`);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, [loading, isUnlocked]);

  const handleUnlockClick = (placementArg?: unknown) => {
    const placement = typeof placementArg === 'string' ? placementArg : 'unknown';
    if (isShared) {
      analytics.track('shared_report_cta_clicked', { report_id: resolvedReportId ?? null });
      navigate('/upload');
      return;
    }
    analytics.track('unlock_report_clicked', { report_id: resolvedReportId ?? null, placement });
    analytics.track('pricing_cta_clicked', { element_id: 'unlock_report', plan_id: 'insight' });
    recordInteraction('cta_clicked', 'unlock_report');
    if (!userEmail) {
      toast({
        title: 'Email Required',
        description: 'Please provide your email when uploading your palm to unlock premium features.',
        variant: 'destructive',
      });
      return;
    }
    
    // Verify we have a report context before opening payment modal
    if (!resolvedReportId) {
      console.error('handleUnlockClick: No reportId available');
      toast({
        title: 'Report Context Missing',
        description: 'Unable to identify your report. Please try refreshing the page.',
        variant: 'destructive',
      });
      return;
    }
    
    console.log('Opening payment modal for report:', resolvedReportId);
    setShowPaymentModal(true);
  };

  const handleSelectPlan = (plan: 'report99' | 'monthly299' | 'unlimited999') => {
    console.log('Plan selected:', plan, 'for report:', resolvedReportId);
    initiatePayment(plan);
  };

  // Loading State with Destiny Reveal
  if (loading) {
    return (
      <div className="min-h-screen bg-background relative">
        <PremiumBackground showMandala intensity="full" />
        <Navbar />
        <DestinyRevealLoader isLoading={true} />
        <Footer />
      </div>
    );
  }

  // Error State
  if (error || !reading) {
    return (
      <div className="min-h-screen bg-background relative">
        <PremiumBackground showMandala={false} intensity="light" />
        <Navbar />
        <main className="pt-24 pb-20 flex items-center justify-center min-h-[80vh] relative z-10">
          <m.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto px-4"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-destructive/10 flex items-center justify-center">
              <span className="text-5xl">😔</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground mb-4">
              Unable to Load Report
            </h1>
            <p className="text-muted-foreground mb-8">
              {error || 'Something went wrong. Please try again.'}
            </p>
            <Button
              onClick={() => navigate('/upload')}
              className="btn-gold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              New Reading
            </Button>
          </m.div>
        </main>
        <Footer />
      </div>
    );
  }

  // Success State - Premium Report with Paywall
  return (
    <div className="min-h-screen bg-background relative">
      <SEO
        title="Your PalmMitra Reading"
        description="Your private PalmMitra palm reading report."
        path={urlReportId ? `/report/${urlReportId}` : '/report'}
        noindex
      />
      <PremiumBackground showMandala intensity="light" />
      <Navbar />

      <StickyUnlockCTA
        userName={userData?.name}
        onUnlockClick={() => handleUnlockClick('sticky_bar')}
        isUnlocked={isUnlocked || isShared}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSelectPlan={handleSelectPlan}
        isProcessing={isProcessing}
        reportName={`${userData?.name || 'Your'} Palm Reading`}
      />

      {/* Success Overlay */}
      <UnlockSuccessOverlay
        isVisible={showSuccessOverlay}
        isSubscription={successIsSubscription}
        onDismiss={() => setShowSuccessOverlay(false)}
        userName={userData?.name}
      />
      
      {/* Unlock Loading Overlay */}
      {unlockLoading && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Checking access...</p>
          </div>
        </div>
      )}

      <main className="pt-20 md:pt-24 pb-20 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Report title — page-level <h1> */}
          <m.header
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-center"
          >
            <h1 className="text-xl md:text-4xl font-serif font-bold text-foreground leading-tight text-balance">
              {reportTitles[userData?.readingType ?? 'full'] ?? 'Destiny Report'} for{' '}
              <span className="text-gradient-gold">{userData?.name || 'You'}</span>
            </h1>
          </m.header>

          {isShared && (
            <div className="mb-6 glass-premium rounded-2xl border border-accent/25 p-4 flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
              <p className="flex-1 text-sm text-foreground">
                <span className="font-semibold">{userData?.name || 'Someone'}</span> shared a preview of their reading. Get your own reading and you both receive a free PalmMitra AI question.
              </p>
              <Button
                onClick={() => {
                  analytics.track('shared_report_cta_clicked', { report_id: resolvedReportId ?? null, placement: 'top' });
                  navigate(resolvedReportId ? `/upload?ref=${resolvedReportId}` : '/upload');
                }}
                className="btn-gold rounded-xl min-h-11 px-5 text-sm font-semibold"
              >
                Get your own reading
              </Button>
            </div>
          )}

          {/* Mobile section bar */}
          <nav aria-label="Report sections" className={`lg:hidden fixed inset-x-0 top-[70px] z-30 px-4 py-2 bg-background/90 backdrop-blur-md border-b border-accent/15 transition-all duration-300 ${showSectionBar ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
            <div className="flex gap-2 overflow-x-auto no-scrollbar" style={{ scrollbarWidth: 'none' }}>
              {reportSections.map((s) => {
                const active = s.id === activeSection;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`Go to ${s.label}`}
                    aria-current={active ? 'true' : undefined}
                    ref={(el) => { if (active && el) el.scrollIntoView({ block: 'nearest', inline: 'center' }); }}
                    onClick={() => document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className={`shrink-0 min-h-11 px-4 rounded-full text-xs font-medium border transition-colors ${active ? 'bg-accent text-foreground border-accent' : 'border-accent/20 text-muted-foreground'}`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Subscription Badge */}
          {hasSubscription && (
            <m.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex justify-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-gold text-foreground font-medium text-sm shadow-gold">
                <Crown className="w-4 h-4" />
                Unlimited Plan Active
              </div>
            </m.div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Progress Indicator - Desktop */}
            <div className="hidden lg:block w-20 flex-shrink-0">
              <ReportProgressIndicator 
                sections={reportSections} 
                activeSection={activeSection} 
              />
            </div>

            {/* Main Report Content */}
            <div className="flex-1 max-w-4xl">
              {/* 1. Report Header - Always visible (Free Preview) */}
              <div id="section-summary">
                <ReportHeader
                  name={userData?.name || 'User'}
                  readingType={userData?.readingType || 'full'}
                  generatedAt={generatedAt}
                  headlineSummary={reading.headlineSummary}
                  palmImage={userData?.imageUrl || userData?.palmImage}
                  isUnlocked={isUnlocked}
                  hinglish={userData?.language === 'hinglish'}
                />
                {!isUnlocked && !isShared && (
                  <UnlockTeaserCard
                    clue={reading.premiumInsights?.careerBreakthrough || reading.premiumInsights?.marriageTiming}
                    userName={userData?.name}
                    hinglish={userData?.language === 'hinglish'}
                    onUnlockClick={() => handleUnlockClick('top_teaser')}
                  />
                )}
              </div>

              {/* 2. Major Lines - Life Line visible, others locked */}
              <div id="section-lines">
                {isUnlocked ? (
                  <MajorLinesSection lines={reading.majorLines} />
                ) : (
                  <>
                    {/* Show only Life Line for free */}
                    <m.section
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="mb-6"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <Activity className="w-6 h-6 md:w-8 md:h-8 text-accent flex-shrink-0 mt-1" />
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground leading-tight text-balance">
                          Your Palm Lines <span className="text-gradient-gold">Speak</span>
                        </h2>
                      </div>
                      <p className="sanskrit-accent mb-6 ml-9 md:ml-11">ॐ Rekha Vigyan</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        <span className="text-accent font-medium">Free Preview:</span> Life Line analysis included. Unlock for complete breakdown.
                      </p>
                    </m.section>

                    {/* Life Line Card - Free */}
                    <m.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-premium rounded-2xl p-6 border border-green-500/20 mb-6"
                    >
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
                          <Activity className="w-7 h-7 text-green-500" />
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-foreground text-lg">Life Line</h3>
                          <p className="text-xs text-muted-foreground">Energy & Vitality</p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-muted-foreground font-medium">Strength</span>
                          <span className="text-xs font-bold text-green-500 px-2 py-0.5 rounded-full bg-green-500/10">
                            {reading.majorLines.lifeLine.strength}
                          </span>
                        </div>
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                          <m.div
                            initial={{ width: 0 }}
                            animate={{
                              width:
                                reading.majorLines.lifeLine.strength === 'Strong' ? '88%'
                                : reading.majorLines.lifeLine.strength === 'Moderate' ? '65%'
                                : reading.majorLines.lifeLine.strength === 'Developing' ? '45%'
                                : '55%',
                            }}
                            transition={{ duration: 1.1, ease: 'easeOut', delay: 0.2 }}
                            className="h-full bg-green-500 rounded-full"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {reading.majorLines.lifeLine.meaning}
                      </p>
                      <div className="pt-4 border-t border-border/50">
                        <p className="text-sm font-medium text-accent flex items-start gap-2">
                          <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{reading.majorLines.lifeLine.keyInsight}</span>
                        </p>
                      </div>
                    </m.div>

                    {/* Locked: Other Lines */}
                    <LockedSection
                      isUnlocked={false}
                      sectionName="Heart, Head, Fate & Sun Lines"
                      sectionKey="lines"
                      userName={userData?.name}
                      onUnlockClick={handleUnlockClick}
                      previewContent={
                        <div className="grid md:grid-cols-2 gap-4 p-4">
                          {['Heart Line', 'Head Line', 'Fate Line', 'Sun Line'].map((line) => (
                            <div key={line} className="glass rounded-xl p-4 h-32" />
                          ))}
                        </div>
                      }
                    />
                  </>
                )}
              </div>

              {/* 3. Mounts Analysis - Locked */}
              <div id="section-mounts">
                <LockedSection
                  isUnlocked={isUnlocked}
                  sectionName="Palm Mounts Analysis"
                  sectionKey="mounts"
                  userName={userData?.name}
                  onUnlockClick={handleUnlockClick}
                  previewContent={
                    <div className="glass rounded-2xl p-6 h-48 md:h-64" />
                  }
                >
                  <MountsSection mounts={reading.mounts} />
                </LockedSection>
              </div>

              {/* 4. Personality Traits - First trait free, others locked */}
              <div id="section-personality">
                {isUnlocked ? (
                  <PersonalityTraits traits={reading.personalityTraits} />
                ) : (
                  <>
                    <m.section
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="mb-6"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <Brain className="w-6 h-6 md:w-8 md:h-8 text-accent flex-shrink-0 mt-1" />
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground leading-tight text-balance">
                          Personality Traits <span className="text-gradient-gold">From Your Palm</span>
                        </h2>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        <span className="text-accent font-medium">Free Preview:</span> First trait included.
                      </p>
                    </m.section>

                    {/* First trait - Free */}
                    {reading.personalityTraits[0] && (
                      <div className="glass rounded-2xl p-6 mb-6">
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                            <Zap className="w-5 h-5 text-orange-500" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">
                              {reading.personalityTraits[0].trait}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {reading.personalityTraits[0].description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Locked: Other traits */}
                    <LockedSection
                      isUnlocked={false}
                      sectionName="Complete Personality Analysis"
                      sectionKey="personality"
                      userName={userData?.name}
                      onUnlockClick={handleUnlockClick}
                      previewContent={
                        <div className="glass rounded-2xl p-6 space-y-3">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-16 bg-background/50 rounded-xl" />
                          ))}
                        </div>
                      }
                    />
                  </>
                )}
              </div>

              {/* 5. Career & Wealth - Locked */}
              <div id="section-career">
                <LockedSection
                  isUnlocked={isUnlocked}
                  sectionName="Career & Wealth Insights"
                  sectionKey="career"
                  userName={userData?.name}
                  onUnlockClick={handleUnlockClick}
                  previewContent={
                    <div className="glass rounded-2xl p-6 h-56 md:h-80" />
                  }
                >
                  <CareerWealth
                    bestFields={reading.careerWealth.bestFields}
                    turningPointAge={reading.careerWealth.turningPointAge}
                    wealthStyle={reading.careerWealth.wealthStyle}
                    peakPeriods={reading.careerWealth.peakPeriods}
                  />
                </LockedSection>
                {isUnlocked && (
                  <AskPalmMitraInline
                    source="career"
                    question="Want more clarity about your career direction?"
                    seed="Based on my palm, expand on my career direction for the next 3 years — what should I focus on and what to avoid?"
                    onAsk={openAi}
                  />
                )}
              </div>

              {/* 6. Love & Relationships - Locked */}
              <div id="section-love">
                <LockedSection
                  isUnlocked={isUnlocked}
                  sectionName="Love & Relationship Destiny"
                  sectionKey="love"
                  userName={userData?.name}
                  onUnlockClick={handleUnlockClick}
                  previewContent={
                    <div className="glass rounded-2xl p-6 h-48 md:h-64" />
                  }
                >
                  <LoveRelationships
                    emotionalStyle={reading.loveRelationships.emotionalStyle}
                    commitmentTendency={reading.loveRelationships.commitmentTendency}
                    relationshipAdvice={reading.loveRelationships.relationshipAdvice}
                  />
                </LockedSection>
                {isUnlocked && (
                  <AskPalmMitraInline
                    source="love"
                    question="Curious about marriage timing and compatibility?"
                    seed="Tell me more about my marriage — timing, the kind of partner suited to me, and what to work on in relationships."
                    onAsk={openAi}
                  />
                )}
              </div>
              <div id="section-phases">
                <LockedSection
                  isUnlocked={isUnlocked}
                  sectionName="Life Phase Timeline"
                  sectionKey="phases"
                  userName={userData?.name}
                  onUnlockClick={handleUnlockClick}
                  previewContent={
                    <div className="glass rounded-2xl p-6 h-64 md:h-96" />
                  }
                >
                  <LifePhaseSection phases={reading.lifePhases} />
                </LockedSection>
                {isUnlocked && (
                  <AskPalmMitraInline
                    source="phases"
                    question="Want more detail on the phase you're entering next?"
                    seed="Walk me through what to expect in the next life phase according to my palm and how to prepare."
                    onAsk={openAi}
                  />
                )}
              </div>

              {/* 8. Spiritual Remedies - First remedy free, others locked */}
              <div id="section-remedies">
                {isUnlocked ? (
                  <SpiritualRemediesSection remedies={reading.spiritualRemedies} />
                ) : (
                  <>
                    <m.section
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="mb-6"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <Zap className="w-6 h-6 md:w-8 md:h-8 text-accent flex-shrink-0 mt-1" />
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground leading-tight text-balance">
                          Spiritual <span className="text-gradient-gold">Remedies</span> &amp; Guidance
                        </h2>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        <span className="text-accent font-medium">Free Preview:</span> First remedy included.
                      </p>
                    </m.section>

                    {/* First remedy - Free */}
                    {reading.spiritualRemedies[0] && (
                      <div className="glass rounded-2xl p-6 mb-6">
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50">
                          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-accent font-bold">1</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">
                              {reading.spiritualRemedies[0].remedy}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {reading.spiritualRemedies[0].benefit}
                            </p>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs mt-2">
                              {reading.spiritualRemedies[0].timing}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Locked: Other remedies */}
                    <LockedSection
                      isUnlocked={false}
                      sectionName="Complete Spiritual Remedies"
                      sectionKey="remedies"
                      userName={userData?.name}
                      onUnlockClick={handleUnlockClick}
                      previewContent={
                        <div className="glass rounded-2xl p-6 space-y-3">
                          {[2, 3, 4].map((i) => (
                            <div key={i} className="h-20 bg-background/50 rounded-xl" />
                          ))}
                        </div>
                      }
                    />
                  </>
                )}
                {isUnlocked && (
                  <AskPalmMitraInline
                    source="remedies"
                    question="Want more personalised guidance on health, energy or remedies?"
                    seed="Based on my palm, what personalised remedies and lifestyle practices would help me most right now?"
                    onAsk={openAi}
                  />
                )}
              </div>

              {/* 9. Final Blessing - Locked */}
              <div id="section-blessing">
                <LockedSection
                  isUnlocked={isUnlocked}
                  sectionName="Final Divine Blessing"
                  sectionKey="blessing"
                  userName={userData?.name}
                  onUnlockClick={handleUnlockClick}
                  previewContent={
                    <div className="glass rounded-2xl p-6 h-48" />
                  }
                >
                  <FinalBlessing 
                    message={reading.finalBlessing} 
                    name={userData?.name || 'User'} 
                  />
                </LockedSection>
              </div>

              {/* 10. Action Buttons - PDF locked (hidden on shared links) */}
              {!isShared && (
                <ActionButtons
                  isUnlocked={isUnlocked}
                  onUnlockClick={handleUnlockClick}
                  reading={reading}
                  userData={{
                    name: userData?.name || 'User',
                    readingType: userData?.readingType || 'full',
                    generatedAt: generatedAt,
                  }}
                  userName={userData?.name}
                />
              )}

              {/* 10b. PalmMatch cross-sell + review prompt — unlocked reports only */}
              {isUnlocked && !isShared && (
                <PalmMatchCrossSell hinglish={userData?.language === 'hinglish'} />
              )}
              {isUnlocked && !isShared && (
                <ReviewPrompt defaultName={userData?.name} source="report" />
              )}

              {/* Continue with PalmMitra AI — end-of-report premium section */}
              {isUnlocked && resolvedReportId && (
                <PalmMitraAiSection
                  entitlement={aiEntitlement}
                  onStart={() => openAi('end_of_report')}
                />
              )}

              {/* 11. Shared-link invite or Premium Paywall */}
              {isShared ? (
                <section className="glass-premium rounded-3xl p-8 md:p-10 border border-accent/20 text-center mb-12">
                  <Crown className="w-10 h-10 text-accent mx-auto mb-4" aria-hidden="true" />
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3 text-balance">
                    {userData?.name ? `${userData.name} shared their reading with you` : 'A reading was shared with you'}
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Discover what your own palm reveals about your career, love and life path in under a minute — and you both get a free PalmMitra AI question.
                  </p>
                  <Button
                    onClick={() => {
                      analytics.track('shared_report_cta_clicked', { report_id: resolvedReportId ?? null });
                      navigate(resolvedReportId ? `/upload?ref=${resolvedReportId}` : '/upload');
                    }}
                    className="btn-gold rounded-2xl px-8 py-6 text-base font-semibold"
                  >
                    Get your own palm reading
                  </Button>
                </section>
              ) : !isUnlocked && (
                <PremiumPaywall 
                  premiumInsights={reading.premiumInsights} 
                  userName={userData?.name}
                  onUnlockClick={() => handleUnlockClick('bottom_paywall')}
                />
              )}

              {/* 12. Legal Disclaimer */}
              <LegalDisclaimer />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* PalmMitra AI Drawer — only reachable when report is unlocked */}
      {isUnlocked && resolvedReportId && (
        <AiDrawer
          open={aiOpen}
          onOpenChange={setAiOpen}
          reportId={resolvedReportId}
          userName={userData?.name}
          userEmail={userEmail}
          seedPrompt={aiSeed}
          onSeedConsumed={() => setAiSeed(null)}
          source={aiSource}
          reportGeneratedAt={generatedAt}
        />
      )}
    </div>
  );
}
