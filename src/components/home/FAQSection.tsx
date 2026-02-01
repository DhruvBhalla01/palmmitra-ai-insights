import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: "How accurate is PalmMitra's AI palm reading?",
    a: 'Our AI is trained on thousands of palm readings and traditional Indian palmistry principles. While we strive for accuracy, palmistry is a traditional practice and results should be taken as guidance for self-reflection rather than absolute predictions.',
  },
  {
    q: 'Which hand should I photograph?',
    a: 'We recommend photographing your dominant hand (right hand for right-handed people, left for left-handed). Your dominant hand shows your current path and potential, while the non-dominant hand shows inherited traits.',
  },
  {
    q: 'How long does it take to get my reading?',
    a: 'Your palm reading is generated instantly! Once you upload your palm image, our AI analyzes it in under 30 seconds and presents your personalized report.',
  },
  {
    q: 'Is my palm image stored permanently?',
    a: 'No. Your palm images are processed securely and are not stored permanently. We only retain the generated report data for your future access. Your privacy is our priority.',
  },
  {
    q: 'What does the free preview include?',
    a: 'The free preview includes a summary of your palm reading, Life Line analysis, and one personalized spiritual remedy. To unlock the full detailed report with all sections, you can purchase the premium report for just ₹99.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major payment methods through Razorpay, including UPI, credit/debit cards, net banking, and popular wallets like Paytm, PhonePe, and Google Pay.',
  },
  {
    q: 'Can I get readings for family members?',
    a: 'Absolutely! You can upload palm photos for family members and friends. Our Unlimited plan at ₹999 is perfect for those who want to explore readings for their entire family.',
  },
  {
    q: 'Is this for entertainment or real guidance?',
    a: 'PalmMitra is designed for spiritual guidance and self-reflection. While rooted in ancient Indian palmistry traditions, our readings are meant for entertainment and personal insight purposes. Major life decisions should always be made thoughtfully.',
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24 md:py-32 relative scroll-mt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <AnimatedSection className="text-center mb-16">
          <p className="sanskrit-accent mb-3">ॐ Prashna Samadhan</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            Frequently Asked <span className="text-gradient-gold">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about PalmMitra and your palm reading journey
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="glass-premium rounded-3xl p-6 md:p-8 border border-accent/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-foreground">
                Common Questions
              </h3>
            </div>
            
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AccordionItem
                    value={`faq-${index}`}
                    className="border border-accent/10 rounded-xl px-4 data-[state=open]:bg-accent/5 transition-colors"
                  >
                    <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
