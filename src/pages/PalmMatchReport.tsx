import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, MessageCircle, Target, Sparkles, Infinity,
  CheckCircle, AlertTriangle, ArrowLeft, Share2,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/AnimatedSection';
import { CompatibilityScoreRing } from '@/components/palmmatch/CompatibilityScoreRing';
import { DimensionCard } from '@/components/palmmatch/DimensionCard';
import { PalmMatchPaywall } from '@/components/palmmatch/PalmMatchPaywall';
import { StickyUnlockCTA } from '@/components/report/StickyUnlockCTA';
import { usePalmMatchUnlock } from '@/hooks/usePalmMatchUnlock';
import { PalmMatchReading } from '@/components/palmmatch/types';
import { useToast } from '@/hooks/use-toast';

const DIMENSION_TEASERS = {
  communication: "Your communication styles decoded — where you naturally align and where friction hides.",
  lifeGoals: "Your life timelines compared — when your ambitions converge and when they diverge.",
  romance: "The romantic arc written in your palm lines — your peak connection window revealed.",
  spiritualAlignment: "Your spiritual energies mapped — and the single practice that amplifies your bond.",
};

export default function PalmMatchReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reading, setReading] = useState<PalmMatchReading | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem('palmMatchData');
    if (!raw) { navigate('/palmmatch'); return; }
    const data = JSON.parse(raw);
    setReading(data.reading);
    setEmail(data.email || '');
  }, [navigate]);

  const { isUnlocked, isLoading, isProcessing, initiatePayment } = usePalmMatchUnlock(id, email);

  const handleUnlockClick = () => initiatePayment('palmmatch149');

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: 'My PalmMatch Report', url });
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied!', description: 'Share your PalmMatch report.' });
    }
  };

  if (!reading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const { person1Name, person2Name, relationshipType, overallScore, compatibilityVerdict,
    overallNarrative, emotionalBond, communication, lifeGoals, romance, spiritualAlignment,
    strengthsAndChallenges, timingGuidance, remediesForPair, finalBlessing } = reading;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {!isUnlocked && !isLoading && (
        <StickyUnlockCTA
          userName={`${person1Name} & ${person2Name}`}
          onUnlockClick={handleUnlockClick}
          isUnlocked={isUnlocked}
        />
      )}

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">

          {/* Back button */}
          <button
            onClick={() => navigate('/palmmatch')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            New PalmMatch
          </button>

          {/* Report Header */}
          <AnimatedSection>
            <div className="glass-premium rounded-3xl p-8 md:p-10 border border-accent/20 mb-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 shimmer rounded-3xl pointer-events-none" />
              <div className="relative z-10">
                <p className="sanskrit-accent mb-3 text-white/50">ॐ Yugal Rekha · Compatibility Reading</p>

                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-1"
                >
                  <span className="text-gradient-gold">{person1Name}</span>
                  <span className="text-accent/60 mx-3 text-2xl">♥</span>
                  <span className="text-gradient-gold">{person2Name}</span>
                </motion.h1>

                <p className="text-sm text-muted-foreground mb-8 capitalize">
                  {relationshipType} Compatibility · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>

                {/* Score Ring */}
                <div className="flex justify-center mb-8">
                  <CompatibilityScoreRing
                    score={overallScore}
                    verdict={compatibilityVerdict}
                    size={180}
                  />
                </div>

                {/* Overall narrative (free) */}
                <div className="glass-premium rounded-2xl p-5 border border-accent/15 text-left">
                  <p className="text-xs font-medium text-accent uppercase tracking-wider mb-2">Overall Compatibility</p>
                  <p className="text-sm text-foreground/85 leading-relaxed">{overallNarrative}</p>
                </div>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="mt-4 flex items-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors mx-auto"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share your PalmMatch
                </button>
              </div>
            </div>
          </AnimatedSection>

          {/* Dimensions heading */}
          <AnimatedSection delay={0.1}>
            <div className="text-center mb-5">
              <h2 className="text-xl font-serif font-bold text-foreground">
                5 Compatibility <span className="text-gradient-gold">Dimensions</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isUnlocked ? 'Full analysis unlocked' : '1 of 5 unlocked — free preview'}
              </p>
            </div>
          </AnimatedSection>

          {/* Mini score overview strip */}
          <AnimatedSection delay={0.13}>
            <div className="glass-premium rounded-2xl p-4 border border-accent/15 mb-8">
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: 'Emotional', score: emotionalBond.score, icon: '❤️', unlocked: true },
                  { label: 'Comms', score: communication.score, icon: '💬', unlocked: isUnlocked },
                  { label: 'Goals', score: lifeGoals.score, icon: '🎯', unlocked: isUnlocked },
                  { label: 'Romance', score: romance.score, icon: '🌹', unlocked: isUnlocked },
                  { label: 'Spirit', score: spiritualAlignment.score, icon: '✨', unlocked: isUnlocked },
                ].map(({ label, score, icon, unlocked }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                    <span className="text-lg leading-none">{icon}</span>
                    <span className="text-[10px] text-muted-foreground font-medium leading-tight">{label}</span>
                    {unlocked ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-sm font-bold text-accent tabular-nums"
                      >
                        {score}%
                      </motion.span>
                    ) : (
                      <span className="text-sm font-bold text-foreground/20">??%</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Emotional Bond — always unlocked (free preview) */}
          <AnimatedSection delay={0.15} className="mb-6">
            <div className="glass-premium gradient-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-serif font-bold text-foreground text-base">{emotionalBond.title}</h3>
                <span className="ml-auto text-sm font-bold text-accent">{emotionalBond.score}%</span>
              </div>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden mb-4">
                <motion.div
                  className="h-full rounded-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${emotionalBond.score}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut', delay: 0.5 }}
                />
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed mb-3">{emotionalBond.text}</p>
              <p className="text-xs text-accent font-medium italic border-t border-accent/10 pt-3">
                {emotionalBond.guidance}
              </p>
            </div>
          </AnimatedSection>

          {/* Remaining 4 dimensions */}
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            <DimensionCard
              dimension={communication}
              icon={MessageCircle}
              isUnlocked={isUnlocked}
              onUnlockClick={handleUnlockClick}
              delay={0.2}
              teaser={DIMENSION_TEASERS.communication}
            />
            <DimensionCard
              dimension={lifeGoals}
              icon={Target}
              isUnlocked={isUnlocked}
              onUnlockClick={handleUnlockClick}
              delay={0.25}
              teaser={DIMENSION_TEASERS.lifeGoals}
            />
            <DimensionCard
              dimension={romance}
              icon={Sparkles}
              isUnlocked={isUnlocked}
              onUnlockClick={handleUnlockClick}
              delay={0.3}
              teaser={DIMENSION_TEASERS.romance}
            />
            <DimensionCard
              dimension={spiritualAlignment}
              icon={Infinity}
              isUnlocked={isUnlocked}
              onUnlockClick={handleUnlockClick}
              delay={0.35}
              teaser={DIMENSION_TEASERS.spiritualAlignment}
            />
          </div>

          {/* Paywall — only when locked */}
          {!isUnlocked && (
            <PalmMatchPaywall
              person1Name={person1Name}
              person2Name={person2Name}
              onUnlockClick={(plan) => initiatePayment(plan)}
              isProcessing={isProcessing}
            />
          )}

          {/* Strengths & Challenges — locked */}
          {isUnlocked && (
            <AnimatedSection delay={0.1} className="mb-10">
              <div className="glass-premium gradient-border rounded-2xl p-6 md:p-8">
                <h2 className="text-lg font-serif font-bold text-foreground mb-6 text-center">
                  Strengths & <span className="text-gradient-gold">Challenges</span>
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Your Strengths
                    </h3>
                    <ul className="space-y-2.5">
                      {strengthsAndChallenges.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Growth Areas
                    </h3>
                    <ul className="space-y-2.5">
                      {strengthsAndChallenges.challenges.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 rounded-xl bg-accent/5 border border-accent/15">
                  <p className="text-sm text-foreground/80 leading-relaxed italic text-center">
                    "{strengthsAndChallenges.growthPath}"
                  </p>
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* Timing Guidance — locked */}
          {isUnlocked && (
            <AnimatedSection delay={0.15} className="mb-10">
              <div className="glass-premium rounded-2xl p-6 border border-accent/20">
                <h2 className="font-serif font-bold text-foreground mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  Timing Guidance for {person1Name} & {person2Name}
                </h2>
                <p className="text-sm text-foreground/80 leading-relaxed">{timingGuidance}</p>
              </div>
            </AnimatedSection>
          )}

          {/* Spiritual Remedies for the Pair — locked */}
          {isUnlocked && (
            <AnimatedSection delay={0.2} className="mb-10">
              <div className="glass-premium rounded-2xl p-6 border border-accent/20">
                <h2 className="font-serif font-bold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Spiritual Remedies for Your Bond
                </h2>
                <div className="space-y-4">
                  {remediesForPair.map((remedy, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/10">
                      <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-foreground text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">{remedy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* Final Blessing — always shown */}
          <AnimatedSection delay={0.25}>
            <motion.section
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
              className="mb-10 relative bg-gradient-mystic rounded-3xl overflow-hidden"
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <span className="text-[8rem] text-accent/8 font-serif leading-none">ॐ</span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
              <div className="relative z-10 p-10 md:p-14 text-center">
                <p className="sanskrit-accent mb-5 text-white/50">ॐ Ashirvaad · Divine Blessing</p>
                <blockquote className="text-lg md:text-xl font-serif italic text-white/90 leading-relaxed mb-5 max-w-2xl mx-auto">
                  "{finalBlessing}"
                </blockquote>
                <p className="text-sm text-white/50">— Blessed for {person1Name} & {person2Name}</p>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
            </motion.section>
          </AnimatedSection>

          {/* Try another */}
          <div className="text-center">
            <Button
              onClick={() => navigate('/palmmatch')}
              variant="outline"
              className="border-accent/30 text-foreground hover:bg-accent/10 rounded-2xl px-8 py-5 gap-2"
            >
              <Heart className="w-4 h-4 text-accent" />
              Try Another PalmMatch
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
