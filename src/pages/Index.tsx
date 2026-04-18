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
const Testimonials = lazy(() => import('@/components/home/Testimonials').then(m => ({ default: m.Testimonials })));
const ComparisonSection = lazy(() => import('@/components/home/ComparisonSection').then(m => ({ default: m.ComparisonSection })));
const AboutSection = lazy(() => import('@/components/home/AboutSection').then(m => ({ default: m.AboutSection })));
const PricingSection = lazy(() => import('@/components/home/PricingSection').then(m => ({ default: m.PricingSection })));
const FAQSection = lazy(() => import('@/components/home/FAQSection').then(m => ({ default: m.FAQSection })));
const EmailCaptureSection = lazy(() => import('@/components/home/EmailCaptureSection').then(m => ({ default: m.EmailCaptureSection })));
const FinalCTABanner = lazy(() => import('@/components/home/FinalCTABanner').then(m => ({ default: m.FinalCTABanner })));

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
        <HeroSection />
        <TrustStrip />

        <SectionDivider variant="gradient" />
        <HowItWorks />

        <Suspense fallback={<SectionLoader />}>
          <FeaturesSection />
        </Suspense>

        <SectionDivider variant="ornate" />
        <Suspense fallback={<SectionLoader />}>
          <SampleReportTeaser />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <Testimonials />
        </Suspense>

        <SectionDivider variant="mandala" />
        <Suspense fallback={<SectionLoader />}>
          <ComparisonSection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <AboutSection />
        </Suspense>

        <SectionDivider variant="gradient" />
        <Suspense fallback={<SectionLoader />}>
          <PricingSection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <FAQSection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <EmailCaptureSection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <FinalCTABanner />
        </Suspense>
      </main>
      <Footer />
      <MobileCTABar />
    </div>
  );
};

export default Index;
