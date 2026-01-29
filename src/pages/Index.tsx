import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/home/HeroSection';
import { TrustStrip } from '@/components/home/TrustStrip';
import { HowItWorks } from '@/components/home/HowItWorks';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { SampleReportTeaser } from '@/components/home/SampleReportTeaser';
import { Testimonials } from '@/components/home/Testimonials';
import { PricingSection } from '@/components/home/PricingSection';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <TrustStrip />
        <HowItWorks />
        <FeaturesSection />
        <SampleReportTeaser />
        <Testimonials />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
