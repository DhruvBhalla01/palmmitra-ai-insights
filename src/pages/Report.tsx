import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Brain, 
  TrendingUp, 
  Sparkles, 
  Star, 
  Calendar,
  Gem,
  ArrowLeft,
  Share2,
  Download,
  Loader2
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/AnimatedSection';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PalmReading {
  overview: string;
  lifeLine: {
    observation: string;
    meaning: string;
  };
  heartLine: {
    observation: string;
    meaning: string;
  };
  headLine: {
    observation: string;
    meaning: string;
  };
  fateLine: {
    observation: string;
    meaning: string;
  };
  personality: string[];
  strengths: string[];
  challenges: string[];
  luckyPeriods: {
    period: string;
    significance: string;
  }[];
  spiritualRemedies: {
    remedy: string;
    benefit: string;
  }[];
  finalMessage: string;
}

interface StoredData {
  name: string;
  age: string;
  email: string;
  readingType: 'full' | 'career' | 'love' | 'wealth';
  palmImage: string;
}

export default function Report() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reading, setReading] = useState<PalmReading | null>(null);
  const [userData, setUserData] = useState<StoredData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReading = async () => {
      // Get stored data from sessionStorage
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My PalmMitra Reading',
          text: `Check out my personalized palm reading from PalmMitra!`,
          url: window.location.origin,
        });
      } catch {
        toast({
          title: "Share",
          description: "Sharing cancelled or not supported",
        });
      }
    } else {
      await navigator.clipboard.writeText(window.location.origin);
      toast({
        title: "Link Copied",
        description: "Share link copied to clipboard!",
      });
    }
  };

  const readingTypeLabels: Record<string, string> = {
    full: 'Full Life Reading',
    career: 'Career Focus',
    love: 'Love & Relationships',
    wealth: 'Wealth & Prosperity',
  };

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
            <p className="text-muted-foreground">
              Our AI is analyzing your unique palm patterns
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <AnimatedSection className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                {readingTypeLabels[userData?.readingType || 'full']}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
              Your Palm Reading, <span className="text-gradient-gold">{userData?.name}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {reading.overview}
            </p>
          </AnimatedSection>

          {/* Palm Image */}
          {userData?.palmImage && (
            <AnimatedSection delay={0.1} className="max-w-xs mx-auto mb-12">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-accent/20">
                <img 
                  src={userData.palmImage} 
                  alt="Your palm" 
                  className="w-full aspect-square object-cover"
                />
              </div>
            </AnimatedSection>
          )}

          {/* Main Lines */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            {/* Life Line */}
            <AnimatedSection delay={0.2}>
              <div className="glass rounded-3xl p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground">Life Line</h3>
                </div>
                <p className="text-sm text-accent mb-2 font-medium">{reading.lifeLine.observation}</p>
                <p className="text-muted-foreground">{reading.lifeLine.meaning}</p>
              </div>
            </AnimatedSection>

            {/* Heart Line */}
            <AnimatedSection delay={0.25}>
              <div className="glass rounded-3xl p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-pink-500" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground">Heart Line</h3>
                </div>
                <p className="text-sm text-accent mb-2 font-medium">{reading.heartLine.observation}</p>
                <p className="text-muted-foreground">{reading.heartLine.meaning}</p>
              </div>
            </AnimatedSection>

            {/* Head Line */}
            <AnimatedSection delay={0.3}>
              <div className="glass rounded-3xl p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground">Head Line</h3>
                </div>
                <p className="text-sm text-accent mb-2 font-medium">{reading.headLine.observation}</p>
                <p className="text-muted-foreground">{reading.headLine.meaning}</p>
              </div>
            </AnimatedSection>

            {/* Fate Line */}
            <AnimatedSection delay={0.35}>
              <div className="glass rounded-3xl p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                    <Star className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground">Fate Line</h3>
                </div>
                <p className="text-sm text-accent mb-2 font-medium">{reading.fateLine.observation}</p>
                <p className="text-muted-foreground">{reading.fateLine.meaning}</p>
              </div>
            </AnimatedSection>
          </div>

          {/* Personality & Traits */}
          <AnimatedSection delay={0.4} className="max-w-4xl mx-auto mb-12">
            <div className="glass rounded-3xl p-8">
              <h3 className="text-2xl font-serif font-bold text-foreground mb-6 text-center">
                Your Personality Profile
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Personality Traits */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    Personality
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {reading.personality.map((trait, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Strengths */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-green-500" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {reading.strengths.map((strength, i) => (
                      <li key={i} className="text-muted-foreground text-sm flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Challenges */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    Growth Areas
                  </h4>
                  <ul className="space-y-2">
                    {reading.challenges.map((challenge, i) => (
                      <li key={i} className="text-muted-foreground text-sm flex items-start gap-2">
                        <span className="text-orange-500 mt-1">→</span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Lucky Periods */}
          {reading.luckyPeriods.length > 0 && (
            <AnimatedSection delay={0.45} className="max-w-4xl mx-auto mb-12">
              <div className="glass rounded-3xl p-8">
                <h3 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center justify-center gap-2">
                  <Calendar className="w-6 h-6 text-accent" />
                  Lucky Periods
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {reading.luckyPeriods.map((period, i) => (
                    <div 
                      key={i}
                      className="p-4 rounded-2xl bg-accent/5 border border-accent/20"
                    >
                      <p className="font-semibold text-accent mb-1">{period.period}</p>
                      <p className="text-sm text-muted-foreground">{period.significance}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* Spiritual Remedies */}
          {reading.spiritualRemedies.length > 0 && (
            <AnimatedSection delay={0.5} className="max-w-4xl mx-auto mb-12">
              <div className="glass rounded-3xl p-8">
                <h3 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center justify-center gap-2">
                  <Gem className="w-6 h-6 text-accent" />
                  Spiritual Remedies
                </h3>
                <div className="space-y-4">
                  {reading.spiritualRemedies.map((remedy, i) => (
                    <div 
                      key={i}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-primary/5"
                    >
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-accent font-bold">{i + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1">{remedy.remedy}</p>
                        <p className="text-sm text-muted-foreground">{remedy.benefit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* Final Message */}
          <AnimatedSection delay={0.55} className="max-w-2xl mx-auto mb-12">
            <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
              <span className="text-4xl mb-4 block">🙏</span>
              <p className="text-lg text-foreground font-serif italic">
                "{reading.finalMessage}"
              </p>
            </div>
          </AnimatedSection>

          {/* Actions */}
          <AnimatedSection delay={0.6} className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => navigate('/upload')}
              variant="outline"
              className="rounded-2xl px-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              New Reading
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="rounded-2xl px-6"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              className="btn-gold rounded-2xl px-6"
              onClick={() => toast({ title: "Coming Soon", description: "PDF download will be available soon!" })}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </AnimatedSection>
        </div>
      </main>

      <Footer />
    </div>
  );
}
