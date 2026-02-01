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
const FAQSection = lazy(() => import('@/components/home/FAQSection').then(m => ({ default: m.FAQSection })));
const AboutSection = lazy(() => import('@/components/home/AboutSection').then(m => ({ default: m.AboutSection })));
const EmailCaptureSection = lazy(() => import('@/components/home/EmailCaptureSection').then(m => ({ default: m.EmailCaptureSection })));
const PricingSection = lazy(() => import('@/components/home/PricingSection').then(m => ({ default: m.PricingSection })));

// Loading fallback for lazy sections
const SectionLoader = () => (
  <div className="py-24 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
  </div>
);

const Index = () => {
  // Enable smooth hash-based scrolling with navbar offset
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
        <SectionDivider variant="mandala" />
        <Suspense fallback={<SectionLoader />}>
          <FeaturesSection />
        </Suspense>
        <SectionDivider variant="ornate" />
        <Suspense fallback={<SectionLoader />}>
          <SampleReportTeaser />
        </Suspense>
        <SectionDivider variant="gradient" />
        <Suspense fallback={<SectionLoader />}>
          <Testimonials />
        </Suspense>
        <SectionDivider variant="mandala" />
        <Suspense fallback={<SectionLoader />}>
          <FAQSection />
        </Suspense>
        <SectionDivider variant="gradient" />
        <Suspense fallback={<SectionLoader />}>
          <AboutSection />
        </Suspense>
        <SectionDivider variant="ornate" />
        <Suspense fallback={<SectionLoader />}>
          <EmailCaptureSection />
        </Suspense>
        <SectionDivider variant="mandala" />
        <Suspense fallback={<SectionLoader />}>
          <PricingSection />
        </Suspense>
      </main>
      <Footer />
      <MobileCTABar />
    </div>
  );
};

export default Index;
