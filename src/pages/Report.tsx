import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PremiumBackground } from '@/components/PremiumBackground';
import { DestinyRevealLoader } from '@/components/DestinyRevealLoader';
import { ReportProgressIndicator } from '@/components/report/ReportProgressIndicator';

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
  const { id: reportId } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [showReveal, setShowReveal] = useState(true);
  const [reading, setReading] = useState<PalmReading | null>(null);
  const [userData, setUserData] = useState<SessionData | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string>(new Date().toISOString());
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('summary');

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

      if (reportId) {
        try {
          const { data: report, error: dbError } = await supabase
            .from('palm_reports')
            .select('*')
            .eq('id', reportId)
            .single();

          if (dbError) throw dbError;

          if (report) {
            setUserData({
              name: report.user_name,
              age: report.user_age || '',
              email: report.user_email || '',
              readingType: (report.reading_type as StoredData['readingType']) || 'full',
              palmImage: report.image_url,
              imageUrl: report.image_url,
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

      if (!storedData && !reportId) {
        navigate('/upload');
        return;
      }

      setError('Report not found');
      setLoading(false);
    };

    loadReport();
  }, [navigate, reportId, toast]);

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

  // Success State - Premium Report
  return (
    <div className="min-h-screen bg-background relative">
      <PremiumBackground showMandala intensity="light" />
      <Navbar />
      
      {/* Destiny Reveal Animation on first load */}
      <AnimatePresence>
        {showReveal && (
          <DestinyRevealLoader 
            isLoading={false} 
            onComplete={() => setShowReveal(false)} 
          />
        )}
      </AnimatePresence>
      
      <main className="pt-24 pb-20 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex gap-8">
            {/* Progress Indicator - Desktop */}
            <div className="hidden lg:block w-20 flex-shrink-0">
              <ReportProgressIndicator 
                sections={reportSections} 
                activeSection={activeSection} 
              />
            </div>

            {/* Main Report Content */}
            <div className="flex-1 max-w-4xl">
              {/* 1. Report Header */}
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

              {/* 2. Major Lines Analysis */}
              <div id="section-lines">
                <MajorLinesSection lines={reading.majorLines} />
              </div>

              {/* 3. Mounts Analysis */}
              <div id="section-mounts">
                <MountsSection mounts={reading.mounts} />
              </div>

              {/* 4. Personality Traits */}
              <div id="section-personality">
                <PersonalityTraits traits={reading.personalityTraits} />
              </div>

              {/* 5. Career & Wealth */}
              <div id="section-career">
                <CareerWealth
                  bestFields={reading.careerWealth.bestFields}
                  turningPointAge={reading.careerWealth.turningPointAge}
                  wealthStyle={reading.careerWealth.wealthStyle}
                  peakPeriods={reading.careerWealth.peakPeriods}
                />
              </div>

              {/* 6. Love & Relationships */}
              <div id="section-love">
                <LoveRelationships
                  emotionalStyle={reading.loveRelationships.emotionalStyle}
                  commitmentTendency={reading.loveRelationships.commitmentTendency}
                  relationshipAdvice={reading.loveRelationships.relationshipAdvice}
                />
              </div>

              {/* 7. Life Phases */}
              <div id="section-phases">
                <LifePhaseSection phases={reading.lifePhases} />
              </div>

              {/* 8. Spiritual Remedies */}
              <div id="section-remedies">
                <SpiritualRemediesSection remedies={reading.spiritualRemedies} />
              </div>

              {/* 9. Final Blessing */}
              <div id="section-blessing">
                <FinalBlessing 
                  message={reading.finalBlessing} 
                  name={userData?.name || 'User'} 
                />
              </div>

              {/* 10. Action Buttons */}
              <ActionButtons />

              {/* 11. Premium Paywall */}
              <PremiumPaywall premiumInsights={reading.premiumInsights} />

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