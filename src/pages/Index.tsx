import { lazy, Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/home/HeroSection';
import { TrustStrip } from '@/components/home/TrustStrip';
import { HowItWorks } from '@/components/home/HowItWorks';
import { PromiseMarquee } from '@/components/home/PromiseMarquee';
import { Footer } from '@/components/Footer';
import { PremiumBackground } from '@/components/PremiumBackground';
import { SectionDivider } from '@/components/SectionDivider';
import { MobileCTABar } from '@/components/MobileCTABar';
import { useHashScroll } from '@/hooks/useHashScroll';
import { SEO } from '@/components/SEO';
import { Link } from 'react-router-dom';

// Lazy load below-fold sections for performance
const PalmLinesExplorer = lazy(() => import('@/components/home/PalmLinesExplorer').then(m => ({ default: m.PalmLinesExplorer })));
const FeaturesSection = lazy(() => import('@/components/home/FeaturesSection').then(m => ({ default: m.FeaturesSection })));
const SampleReportTeaser = lazy(() => import('@/components/home/SampleReportTeaser').then(m => ({ default: m.SampleReportTeaser })));
const ComparisonSection = lazy(() => import('@/components/home/ComparisonSection').then(m => ({ default: m.ComparisonSection })));
const AboutSection = lazy(() => import('@/components/home/AboutSection').then(m => ({ default: m.AboutSection })));
const Testimonials = lazy(() => import('@/components/home/Testimonials').then(m => ({ default: m.Testimonials })));
const FAQSection = lazy(() => import('@/components/home/FAQSection').then(m => ({ default: m.FAQSection })));
const FinalCTABanner = lazy(() => import('@/components/home/FinalCTABanner').then(m => ({ default: m.FinalCTABanner })));
const PricingSection = lazy(() => import('@/components/home/PricingSection').then(m => ({ default: m.PricingSection })));

const SectionLoader = () => (
  <div className="py-24 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
  </div>
);

const Index = () => {
  useHashScroll();

  return (
    <div className="min-h-screen bg-background relative overflow-x-clip">
      <SEO
        title="PalmMitra — AI Palm Reading | Discover Your Destiny in 2 Minutes"
        description="PalmMitra uses AI and ancient Indian Hasta Samudrika Shastra to read your palm lines and reveal insights about your career, love, wealth, and life path. Free preview."
        path="/"
      />
      <PremiumBackground showMandala intensity="medium" />
      <Navbar />
      <main className="relative z-10">
        {/* 1. Hero */}
        <HeroSection />

        {/* 2. Social Proof */}
        <TrustStrip />
        <PromiseMarquee />

        {/* 3. How It Works */}
        <SectionDivider variant="gradient" />
        <HowItWorks />

        <Suspense fallback={<SectionLoader />}>
          <PalmLinesExplorer />
        </Suspense>

        <section aria-label="PalmMatch couple compatibility" className="container mx-auto px-4 my-10 max-w-3xl">
          <Link to="/palmmatch" className="glass-card block rounded-2xl p-6 md:p-8 text-center border border-accent/30 hover:border-accent/60 transition-colors">
            <p className="text-xs uppercase tracking-[0.2em] text-accent mb-2">PalmMatch</p>
            <h2 className="font-serif text-xl md:text-2xl text-foreground mb-2">Check your couple compatibility by palm</h2>
            <p className="text-sm text-muted-foreground mb-4">Upload both palms for a love and marriage compatibility score with emotional, mental and physical insights.</p>
            <span className="inline-flex items-center text-sm font-medium text-accent">Try PalmMatch couple compatibility →</span>
          </Link>
        </section>

        {/* 4. Features */}
        <Suspense fallback={<SectionLoader />}>
          <FeaturesSection />
        </Suspense>

        {/* 5. Sample Report Preview */}
        <SectionDivider variant="ornate" />
        <Suspense fallback={<SectionLoader />}>
          <SampleReportTeaser />
        </Suspense>

        {/* 6. Why PalmMitra (comparison + about) */}
        <SectionDivider variant="mandala" />
        <Suspense fallback={<SectionLoader />}>
          <ComparisonSection />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <AboutSection />
        </Suspense>

        {/* 7. Testimonials */}
        <Suspense fallback={<SectionLoader />}>
          <Testimonials />
        </Suspense>

        {/* 8. FAQ */}
        <Suspense fallback={<SectionLoader />}>
          <FAQSection />
        </Suspense>

        {/* 8b. Pricing */}
        <Suspense fallback={<SectionLoader />}>
          <PricingSection />
        </Suspense>


        {/* 9. Final CTA */}
        <SectionDivider variant="gradient" />
        <Suspense fallback={<SectionLoader />}>
          <FinalCTABanner />
        </Suspense>
      </main>

      {/* 10. Footer */}
      <Footer />

      {/* Sticky mobile CTA — always visible on scroll */}
      <MobileCTABar />
    </div>
  );
};

export default Index;
