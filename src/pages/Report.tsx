import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export default function Report() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reading, setReading] = useState<PalmReading | null>(null);
  const [userData, setUserData] = useState<StoredData | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string>(new Date().toISOString());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReading = async () => {
      const storedData = sessionStorage.getItem('palmMitraData');
      
      if (!storedData) {
        navigate('/upload');
        return;
      }

      const data: StoredData = JSON.parse(storedData);
      setUserData(data);

      try {
        const { data: response, error: functionError } = await supabase.functions.invoke('analyze-palm', {
          body: {
            palmImage: data.palmImage,
            name: data.name,
            age: data.age,
            readingType: data.readingType,
          },
        });

        if (functionError) {
          console.error('Function error:', functionError);
          throw new Error(functionError.message || 'Failed to analyze palm');
        }

        if (response?.error) {
          throw new Error(response.error);
        }

        if (response?.reading) {
          setReading(response.reading);
          setGeneratedAt(response.generatedAt || new Date().toISOString());
        } else {
          throw new Error('No reading data received');
        }
      } catch (err) {
        console.error('Error fetching reading:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate reading');
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : 'Failed to generate reading',
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReading();
  }, [navigate, toast]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="w-32 h-32 mx-auto mb-8 relative"
            >
              <div className="absolute inset-0 rounded-full border-4 border-accent/30" />
              <div className="absolute inset-2 rounded-full border-2 border-accent/50" />
              <div className="absolute inset-4 rounded-full border border-accent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl">🖐️</span>
              </div>
            </motion.div>
            <motion.h2
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl font-serif font-bold text-foreground mb-2"
            >
              AI Reading Your Palm...
            </motion.h2>
            <p className="text-muted-foreground mb-4">
              Analyzing your unique palm patterns with advanced AI
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              This may take 10-15 seconds
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error State
  if (error || !reading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20 flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
              <span className="text-4xl">😔</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
              Unable to Generate Reading
            </h2>
            <p className="text-muted-foreground mb-8">
              {error || 'Something went wrong. Please try again.'}
            </p>
            <Button
              onClick={() => navigate('/upload')}
              className="btn-gold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Success State - Premium Report
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* 1. Report Header */}
          <ReportHeader
            name={userData?.name || 'User'}
            readingType={userData?.readingType || 'full'}
            generatedAt={generatedAt}
            confidenceScore={reading.confidenceScore}
            headlineSummary={reading.headlineSummary}
            palmImage={userData?.palmImage}
          />

          {/* 2. Major Lines Analysis */}
          <MajorLinesSection lines={reading.majorLines} />

          {/* 3. Mounts Analysis */}
          <MountsSection mounts={reading.mounts} />

          {/* 4. Personality Traits */}
          <PersonalityTraits traits={reading.personalityTraits} />

          {/* 5. Career & Wealth */}
          <CareerWealth
            bestFields={reading.careerWealth.bestFields}
            turningPointAge={reading.careerWealth.turningPointAge}
            wealthStyle={reading.careerWealth.wealthStyle}
            peakPeriods={reading.careerWealth.peakPeriods}
          />

          {/* 6. Love & Relationships */}
          <LoveRelationships
            emotionalStyle={reading.loveRelationships.emotionalStyle}
            commitmentTendency={reading.loveRelationships.commitmentTendency}
            relationshipAdvice={reading.loveRelationships.relationshipAdvice}
          />

          {/* 7. Life Phases */}
          <LifePhaseSection phases={reading.lifePhases} />

          {/* 8. Spiritual Remedies */}
          <SpiritualRemediesSection remedies={reading.spiritualRemedies} />

          {/* 9. Final Blessing */}
          <FinalBlessing 
            message={reading.finalBlessing} 
            name={userData?.name || 'User'} 
          />

          {/* 10. Action Buttons */}
          <ActionButtons />

          {/* 11. Premium Paywall */}
          <PremiumPaywall premiumInsights={reading.premiumInsights} />

          {/* 12. Legal Disclaimer */}
          <LegalDisclaimer />

        </div>
      </main>

      <Footer />
    </div>
  );
}
