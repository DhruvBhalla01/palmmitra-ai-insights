import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PremiumBackground } from '@/components/PremiumBackground';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle, Camera, CreditCard, Shield, Zap, MessageCircle } from 'lucide-react';
import { useHashScroll } from '@/hooks/useHashScroll';

const faqCategories = [
  {
    icon: Zap,
    title: 'Getting Started',
    questions: [
      {
        q: 'How does PalmMitra work?',
        a: 'PalmMitra uses advanced AI to analyze the lines, mounts, and features of your palm. Simply upload a clear photo of your palm, and our AI will generate a personalized reading covering your personality traits, career potential, relationships, and more.',
      },
      {
        q: 'How accurate is the AI palm reading?',
        a: "Our AI is trained on thousands of palm readings and traditional palmistry principles. While we strive for accuracy, palmistry is a traditional practice and results should be taken as guidance for self-reflection rather than absolute predictions.",
      },
      {
        q: 'How long does it take to get my reading?',
        a: 'Your palm reading is generated instantly! Once you upload your palm image, our AI analyzes it in under 30 seconds and presents your personalized report.',
      },
    ],
  },
  {
    icon: Camera,
    title: 'Palm Photo Tips',
    questions: [
      {
        q: 'Which hand should I photograph?',
        a: 'We recommend photographing your dominant hand (right hand for right-handed people, left for left-handed). Your dominant hand shows your current path and potential, while the non-dominant hand shows inherited traits.',
      },
      {
        q: 'How should I take the palm photo?',
        a: 'Place your palm flat against a plain, contrasting background (like a white paper). Ensure good lighting without harsh shadows. Keep your fingers slightly apart and take the photo from directly above your palm.',
      },
      {
        q: 'What if my photo gets rejected?',
        a: "If our AI can't detect a palm clearly, you'll be prompted to retake the photo. Common issues include poor lighting, blurry images, or partial palm visibility. Try again with better lighting and a steady hand.",
      },
    ],
  },
  {
    icon: CreditCard,
    title: 'Pricing & Payments',
    questions: [
      {
        q: 'What does the free preview include?',
        a: 'The free preview includes a summary of your palm reading, Life Line analysis, and one personalized spiritual remedy. To unlock the full detailed report with all sections, you can purchase the premium report.',
      },
      {
        q: 'How much does the full report cost?',
        a: 'The detailed palm reading report costs ₹99 for a single report. We also offer an unlimited reports plan at ₹999 for those who want to explore readings for family and friends.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major payment methods through Razorpay, including UPI, credit/debit cards, net banking, and popular wallets like Paytm, PhonePe, and Google Pay.',
      },
      {
        q: 'Can I get a refund?',
        a: 'Due to the instant digital delivery of our reports, all sales are generally final. However, if you experience technical issues preventing report delivery, please contact us within 48 hours and we will review your case.',
      },
    ],
  },
  {
    icon: Shield,
    title: 'Privacy & Security',
    questions: [
      {
        q: 'Is my palm image stored permanently?',
        a: 'Yes. Your palm image is stored securely on our servers and is never shared with third parties. It is used solely to generate your reading. Contact us at privacy@palmmitra.com to request deletion.',
      },
      {
        q: 'Who can see my palm reading?',
        a: 'Only you have access to your palm reading report. We do not share your personal information or reading results with any third parties.',
      },
      {
        q: 'Is my payment information secure?',
        a: 'Absolutely. All payments are processed through Razorpay, a PCI-DSS compliant payment gateway. We never store your card details on our servers.',
      },
    ],
  },
];

export default function Help() {
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
              <HelpCircle className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Help <span className="text-gradient-gold">Center</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Find answers to commonly asked questions about PalmMitra
            </p>
          </AnimatedSection>

          {/* FAQ Section with scroll target ID */}
          <div id="faq" className="scroll-mt-24">
            {/* FAQ Categories */}
            {faqCategories.map((category, categoryIndex) => (
              <AnimatedSection key={category.title} delay={0.1 + categoryIndex * 0.1} className="mb-10">
                <div className="glass-premium rounded-3xl p-6 md:p-8 border border-accent/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <category.icon className="w-6 h-6 text-accent" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground">
                      {category.title}
                    </h2>
                  </div>
                  <Accordion type="single" collapsible className="space-y-3">
                    {category.questions.map((faq, index) => (
                      <AccordionItem 
                        key={index} 
                        value={`${category.title}-${index}`}
                        className="border border-accent/10 rounded-xl px-4 data-[state=open]:bg-accent/5"
                      >
                        <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Contact CTA */}
          <AnimatedSection delay={0.5}>
            <div className="glass-premium rounded-3xl p-8 md:p-12 border border-accent/20 text-center">
              <MessageCircle className="w-12 h-12 text-accent mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
                Still Have Questions?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Can't find what you're looking for? Our support team is here to help. 
                Reach out and we'll get back to you within 24 hours.
              </p>
              <Link to="/contact">
                <Button className="btn-gold text-foreground font-semibold text-lg px-10 py-6 rounded-2xl">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contact Support
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </main>

      <Footer />
    </div>
  );
}
