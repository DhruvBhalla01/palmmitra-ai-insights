import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PremiumBackground } from '@/components/PremiumBackground';
import { AnimatedSection } from '@/components/AnimatedSection';
import { FileText, Check, AlertTriangle, CreditCard, Scale, Ban } from 'lucide-react';
import { useHashScroll } from '@/hooks/useHashScroll';

const sections = [
  {
    icon: Check,
    title: 'Acceptance of Terms',
    content: `By accessing or using PalmMitra's services, you agree to be bound by these Terms of Service. 
    If you do not agree to these terms, please do not use our services. We reserve the right to modify 
    these terms at any time, and your continued use of the service constitutes acceptance of any changes.`,
  },
  {
    icon: FileText,
    title: 'Service Description',
    content: `PalmMitra provides AI-powered palm reading services for entertainment and self-reflection purposes. 
    Our service analyzes palm images you upload and generates personalized insights based on traditional 
    palmistry principles combined with artificial intelligence. The service includes both free previews 
    and premium detailed reports available for purchase.`,
  },
  {
    icon: CreditCard,
    title: 'Payments & Refunds',
    content: `All payments are processed securely through Razorpay. Prices are displayed in Indian Rupees (₹). 
    Due to the digital nature of our service and instant delivery, all sales are final. Refunds may be 
    considered on a case-by-case basis for technical issues that prevent report delivery. Contact us 
    within 48 hours of purchase for refund requests.`,
  },
  {
    icon: AlertTriangle,
    title: 'Disclaimer of Warranties',
    content: `PalmMitra services are provided "as is" without any warranties, express or implied. We do not 
    guarantee the accuracy, completeness, or reliability of any palm reading insights. Palmistry is a 
    traditional practice, and results are subjective. Our AI interpretations should not replace 
    professional advice for medical, legal, financial, or psychological matters.`,
  },
  {
    icon: Scale,
    title: 'Limitation of Liability',
    content: `To the maximum extent permitted by law, PalmMitra and its operators shall not be liable for any 
    indirect, incidental, special, consequential, or punitive damages arising from your use of the service. 
    Our total liability shall not exceed the amount you paid for the specific service giving rise to the claim.`,
  },
  {
    icon: Ban,
    title: 'Prohibited Uses',
    content: `You agree not to: upload images that are not of human palms; attempt to reverse-engineer our AI 
    algorithms; use the service for any illegal purpose; share your account credentials; upload offensive, 
    harmful, or inappropriate content; attempt to circumvent payment systems; or use automated means to 
    access the service without authorization.`,
  },
];

export default function Terms() {
  // Enable smooth hash-based scrolling with navbar offset
  useHashScroll();

  return (
    <div className="min-h-screen bg-background relative">
      <PremiumBackground showMandala intensity="light" />
      <Navbar />
      
      <main className="relative z-10 pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <AnimatedSection className="text-center mb-16">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Terms of <span className="text-gradient-gold">Service</span>
            </h1>
            <p className="text-muted-foreground">
              Last updated: January 2025
            </p>
          </AnimatedSection>

          {/* Introduction */}
          <AnimatedSection delay={0.1} className="mb-12">
            <div className="glass-premium rounded-2xl p-8 border border-accent/20">
              <p className="text-muted-foreground leading-relaxed">
                Welcome to PalmMitra. These Terms of Service govern your access to and use of our AI palm 
                reading service. Please read these terms carefully before using our service. By using 
                PalmMitra, you agree to be bound by these terms and our Privacy Policy.
              </p>
            </div>
          </AnimatedSection>

          {/* Sections */}
          {sections.map((section, index) => (
            <AnimatedSection key={section.title} delay={0.15 + index * 0.05} className="mb-8">
              <div className="glass-premium rounded-2xl p-8 border border-accent/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground">
                    {section.title}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </div>
            </AnimatedSection>
          ))}

          {/* User Content */}
          <AnimatedSection delay={0.5} className="mb-8">
            <div className="glass-premium rounded-2xl p-8 border border-accent/20">
              <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-4">
                User Content & Intellectual Property
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  You retain ownership of the palm images you upload. By uploading images, you grant 
                  PalmMitra a limited license to process and analyze them for the purpose of generating 
                  your palm reading report.
                </p>
                <p>
                  All content on PalmMitra, including but not limited to text, graphics, logos, AI algorithms, 
                  and software, is the property of PalmMitra and is protected by intellectual property laws. 
                  You may not reproduce, distribute, or create derivative works without our written permission.
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Governing Law */}
          <AnimatedSection delay={0.55} className="mb-8">
            <div className="glass-premium rounded-2xl p-8 border border-accent/20">
              <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-4">
                Governing Law & Dispute Resolution
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of India. 
                Any disputes arising from these terms or your use of PalmMitra shall be subject to the 
                exclusive jurisdiction of the courts in India. We encourage you to contact us first 
                to resolve any disputes amicably.
              </p>
            </div>
          </AnimatedSection>

          {/* Contact */}
          <AnimatedSection delay={0.6} className="mb-8">
            <div className="glass-premium rounded-2xl p-8 border border-accent/20">
              <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-4">
                Contact Information
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, please contact us at{' '}
                <a href="mailto:legal@palmmitra.com" className="text-accent hover:underline">
                  legal@palmmitra.com
                </a>.
              </p>
            </div>
          </AnimatedSection>

          {/* Footer note */}
          <AnimatedSection delay={0.65}>
            <p className="text-center text-sm text-muted-foreground">
              By using PalmMitra, you acknowledge that you have read, understood, and agree to these Terms of Service.
            </p>
          </AnimatedSection>
        </div>
      </main>

      <Footer />
    </div>
  );
}
