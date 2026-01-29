import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/home/HeroSection';
import { TrustStrip } from '@/components/home/TrustStrip';
import { HowItWorks } from '@/components/home/HowItWorks';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { SampleReportTeaser } from '@/components/home/SampleReportTeaser';
import { Testimonials } from '@/components/home/Testimonials';
import { PricingSection } from '@/components/home/PricingSection';
import { Footer } from '@/components/Footer';
import { PremiumBackground } from '@/components/PremiumBackground';
import { SectionDivider } from '@/components/SectionDivider';
import { MobileCTABar } from '@/components/MobileCTABar';

const Index = () => {
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
        <FeaturesSection />
        <SectionDivider variant="ornate" />
        <SampleReportTeaser />
        <SectionDivider variant="gradient" />
        <Testimonials />
        <SectionDivider variant="mandala" />
        <PricingSection />
      </main>
      <Footer />
      <MobileCTABar />
    </div>
  );
};

export default Index;