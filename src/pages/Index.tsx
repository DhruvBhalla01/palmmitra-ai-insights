import { lazy, Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/home/HeroSection';
import { TrustStrip } from '@/components/home/TrustStrip';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Footer } from '@/components/Footer';
import { PremiumBackground } from '@/components/PremiumBackground';
import { SectionDivider } from '@/components/SectionDivider';
import { MobileCTABar } from '@/components/MobileCTABar';
import { useHashScroll } from '@/hooks/useHashScroll';

// Lazy load below-fold sections for performance
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
    <div className="min-h-screen bg-background relative">
      <PremiumBackground showMandala intensity="medium" />
      <Navbar />
      <main className="relative z-10">
        {/* 1. Hero */}
        <HeroSection />

        {/* 2. Social Proof */}
        <TrustStrip />

        {/* 3. How It Works */}
        <SectionDivider variant="gradient" />
        <HowItWorks />

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
