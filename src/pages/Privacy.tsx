import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PremiumBackground } from '@/components/PremiumBackground';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Shield, Eye, Lock, Trash2, Server, Mail } from 'lucide-react';
import { useHashScroll } from '@/hooks/useHashScroll';

const sections = [
  {
    icon: Eye,
    title: 'Information We Collect',
    content: [
      'Palm images you upload for analysis',
      'Basic personal information (name, email) for report delivery',
      'Payment information processed securely through Razorpay',
      'Usage data to improve our services',
    ],
  },
  {
    icon: Lock,
    title: 'How We Use Your Data',
    content: [
      'To generate your personalized palm reading report',
      'To deliver your report via email',
      'To process payments securely',
      'To improve our AI accuracy and services',
    ],
  },
  {
    icon: Server,
    title: 'Data Storage & Security',
    content: [
      'All data is encrypted in transit and at rest',
      'Palm images are processed securely and not shared with third parties',
      'We use industry-standard security measures',
      'Reports are stored securely for your future access',
    ],
  },
  {
    icon: Trash2,
    title: 'Data Retention & Deletion',
    content: [
      'You can request deletion of your data at any time',
      'Palm images are stored securely and used only to generate your reading',
      'Account data is retained only as long as necessary',
      'Contact us to exercise your data rights',
    ],
  },
];

export default function Privacy() {
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
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Privacy <span className="text-gradient-gold">Policy</span>
            </h1>
            <p className="text-muted-foreground">
              Last updated: January 2025
            </p>
          </AnimatedSection>

          {/* Introduction */}
          <AnimatedSection delay={0.1} className="mb-12">
            <div className="glass-premium rounded-2xl p-8 border border-accent/20">
              <p className="text-muted-foreground leading-relaxed">
                At PalmMitra, we take your privacy seriously. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our AI palm reading service. 
                Please read this privacy policy carefully. By using PalmMitra, you consent to the practices 
                described in this policy.
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
                <ul className="space-y-3">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          ))}

          {/* Third-Party Services */}
          <AnimatedSection delay={0.4} className="mb-8">
            <div className="glass-premium rounded-2xl p-8 border border-accent/20">
              <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-4">
                Third-Party Services
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the following third-party services:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <span><strong className="text-foreground">Razorpay:</strong> For secure payment processing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <span><strong className="text-foreground">Google Cloud AI:</strong> For palm image analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <span><strong className="text-foreground">Supabase:</strong> For secure data storage</span>
                </li>
              </ul>
            </div>
          </AnimatedSection>

          {/* Disclaimer Section - with proper scroll target ID */}
          <div id="disclaimer" className="scroll-mt-24">
            <AnimatedSection delay={0.45} className="mb-8">
              <div className="glass-premium rounded-2xl p-8 border border-accent/40 bg-accent/5">
                <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-4">
                  ⚠️ Disclaimer
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">For Entertainment Purposes:</strong> PalmMitra provides AI-based 
                    palm reading insights for entertainment and self-reflection purposes only. Our readings should not 
                    be considered as professional medical, legal, financial, or psychological advice.
                  </p>
                  <p>
                    <strong className="text-foreground">No Guarantees:</strong> Palmistry is a traditional practice, 
                    and while our AI strives for accuracy based on historical palmistry principles, we cannot guarantee 
                    the accuracy or reliability of any predictions or insights provided.
                  </p>
                  <p>
                    <strong className="text-foreground">Personal Decisions:</strong> Any decisions you make based on 
                    your palm reading are your own responsibility. We encourage you to consult qualified professionals 
                    for important life decisions.
                  </p>
                  <p>
                    <strong className="text-foreground">Results May Vary:</strong> Individual experiences with palmistry 
                    vary widely, and past results are not indicative of future outcomes.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Contact */}
          <AnimatedSection delay={0.5} className="mb-8">
            <div className="glass-premium rounded-2xl p-8 border border-accent/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground">
                  Contact Us
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or wish to exercise your data rights, 
                please contact us at <a href="mailto:privacy@palmmitra.com" className="text-accent hover:underline">privacy@palmmitra.com</a>.
              </p>
            </div>
          </AnimatedSection>

          {/* Footer note */}
          <AnimatedSection delay={0.55}>
            <p className="text-center text-sm text-muted-foreground">
              By using PalmMitra, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </AnimatedSection>
        </div>
      </main>

      <Footer />
    </div>
  );
}
