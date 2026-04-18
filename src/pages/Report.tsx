import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { LockedSection } from '@/components/payment/LockedSection';
import { UnlockSuccessOverlay } from '@/components/payment/UnlockSuccessOverlay';

// Report components
import { ReportHeader } from '@/components/report/ReportHeader';
import { MajorLinesSection } from '@/components/report/MajorLinesSection';
import { MountsSection } from '@/components/report/MountsSection';
import { PersonalityTraits } from '@/components/report/PersonalityTraits';
import { CareerWealth } from '@/components/report/CareerWealth';
import { LoveRelationships } from '@/components/report/LoveRelationships';
import { LifePhaseSection } from '@/components/report/LifePhaseSection';
import { SpiritualRemediesSection } from '@/components/report/SpiritualRemediesSection';
import { FinalBlessing } from '@/components/report/FinalBlessing';
import { ActionButtons } from '@/components/report/ActionButtons';
import { PremiumPaywall } from '@/components/report/PremiumPaywall';
import { LegalDisclaimer } from '@/components/report/LegalDisclaimer';
import { StickyUnlockCTA } from '@/components/report/StickyUnlockCTA';
import type { PalmReading, StoredData } from '@/components/report/types';

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
  const [showReveal, setShowReveal] = useState(true);
  const [reading, setReading] = useState<PalmReading | null>(null);
  const [userData, setUserData] = useState<SessionData | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string>(new Date().toISOString());
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('summary');
  
  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [successIsSubscription, setSuccessIsSubscription] = useState(false);

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

  // Listen for payment success events
  useEffect(() => {
    const handlePaymentSuccess = (event: CustomEvent) => {
      setShowPaymentModal(false);
      setSuccessIsSubscription(event.detail.subscription);
      setShowSuccessOverlay(true);
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
            return;
          }
        } catch (e) {
          console.error('Error parsing session data:', e);
        }
      }

      if (urlReportId) {
        try {
          // Use secure edge function to fetch report
          const { data, error: fetchError } = await supabase.functions.invoke('get-report', {
            body: { report_id: urlReportId },
          });

          if (fetchError) throw fetchError;

          if (data?.success && data?.report) {
            const report = data.report;
            setUserData({
              name: report.user_name,
              age: report.user_age || '',
              email: report.user_email || '',
              readingType: (report.reading_type as StoredData['readingType']) || 'full',
              palmImage: report.image_url,
              imageUrl: report.image_url,
              reportId: urlReportId, // Store reportId in userData for unlock flow
            });
            setReading(report.report_json as unknown as PalmReading);
            setGeneratedAt(report.created_at || new Date().toISOString());
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Error loading report from database:', err);
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

  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = reportSections.map(s => ({
        id: s.id,
        element: document.getElementById(`section-${s.id}`)
      }));
      
      for (const section of sections) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUnlockClick = () => {
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

  const handleSelectPlan = (plan: 'report99' | 'monthly299', couponCode?: string) => {
    console.log('Plan selected:', plan, 'for report:', resolvedReportId);
    initiatePayment(plan, couponCode);
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
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto px-4"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-destructive/10 flex items-center justify-center">
              <span className="text-5xl">😔</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
              Unable to Load Report
            </h2>
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
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // Success State - Premium Report with Paywall
  return (
    <div className="min-h-screen bg-background relative">
      <PremiumBackground showMandala intensity="light" />
      <Navbar />

      <StickyUnlockCTA
        userName={userData?.name}
        onUnlockClick={handleUnlockClick}
        isUnlocked={isUnlocked}
      />

      {/* Destiny Reveal Animation on first load */}
      <AnimatePresence>
        {showReveal && (
          <DestinyRevealLoader 
            isLoading={false} 
            onComplete={() => setShowReveal(false)} 
          />
        )}
      </AnimatePresence>

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

      <main className="pt-24 pb-20 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Subscription Badge */}
          {hasSubscription && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex justify-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-gold text-foreground font-medium text-sm shadow-gold">
                <Crown className="w-4 h-4" />
                Unlimited Plan Active
              </div>
            </motion.div>
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
                  confidenceScore={reading.confidenceScore}
                  headlineSummary={reading.headlineSummary}
                  palmImage={userData?.imageUrl || userData?.palmImage}
                />
              </div>

              {/* 2. Major Lines - Life Line visible, others locked */}
              <div id="section-lines">
                {isUnlocked ? (
                  <MajorLinesSection lines={reading.majorLines} />
                ) : (
                  <>
                    {/* Show only Life Line for free */}
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="mb-6"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Activity className="w-8 h-8 text-accent" />
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                          Your Palm Lines <span className="text-gradient-gold">Speak</span>
                        </h2>
                      </div>
                      <p className="sanskrit-accent mb-6 ml-12">ॐ Rekha Vigyan</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        <span className="text-accent font-medium">Free Preview:</span> Life Line analysis included. Unlock for complete breakdown.
                      </p>
                    </motion.section>

                    {/* Life Line Card - Free */}
                    <motion.div
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
                          <div className="h-full bg-green-500 rounded-full w-4/5" />
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
                    </motion.div>

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
                    <div className="glass rounded-2xl p-6 h-64" />
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
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="mb-6"
                    >
                      <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4 flex items-center gap-3">
                        <Brain className="w-8 h-8 text-accent" />
                        Personality Traits <span className="text-gradient-gold">From Your Palm</span>
                      </h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        <span className="text-accent font-medium">Free Preview:</span> First trait included.
                      </p>
                    </motion.section>

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
                    <div className="glass rounded-2xl p-6 h-80" />
                  }
                >
                  <CareerWealth
                    bestFields={reading.careerWealth.bestFields}
                    turningPointAge={reading.careerWealth.turningPointAge}
                    wealthStyle={reading.careerWealth.wealthStyle}
                    peakPeriods={reading.careerWealth.peakPeriods}
                  />
                </LockedSection>
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
                    <div className="glass rounded-2xl p-6 h-64" />
                  }
                >
                  <LoveRelationships
                    emotionalStyle={reading.loveRelationships.emotionalStyle}
                    commitmentTendency={reading.loveRelationships.commitmentTendency}
                    relationshipAdvice={reading.loveRelationships.relationshipAdvice}
                  />
                </LockedSection>
              </div>

              {/* 7. Life Phases - Locked */}
              <div id="section-phases">
                <LockedSection
                  isUnlocked={isUnlocked}
                  sectionName="Life Phase Timeline"
                  sectionKey="phases"
                  userName={userData?.name}
                  onUnlockClick={handleUnlockClick}
                  previewContent={
                    <div className="glass rounded-2xl p-6 h-96" />
                  }
                >
                  <LifePhaseSection phases={reading.lifePhases} />
                </LockedSection>
              </div>

              {/* 8. Spiritual Remedies - First remedy free, others locked */}
              <div id="section-remedies">
                {isUnlocked ? (
                  <SpiritualRemediesSection remedies={reading.spiritualRemedies} />
                ) : (
                  <>
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="mb-6"
                    >
                      <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4 flex items-center gap-3">
                        <Zap className="w-8 h-8 text-accent" />
                        Spiritual <span className="text-gradient-gold">Remedies</span> & Guidance
                      </h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        <span className="text-accent font-medium">Free Preview:</span> First remedy included.
                      </p>
                    </motion.section>

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

              {/* 10. Action Buttons - PDF locked */}
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

              {/* 11. Premium Paywall - Only show if not unlocked */}
              {!isUnlocked && (
                <PremiumPaywall 
                  premiumInsights={reading.premiumInsights} 
                  onUnlockClick={handleUnlockClick}
                />
              )}

              {/* 12. Legal Disclaimer */}
              <LegalDisclaimer />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
