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
    q: 'Is this scientifically accurate or just entertainment?',
    a: 'PalmMitra is rooted in Hasta Samudrika Shastra — a 3,000-year-old Indian science of palm analysis — combined with AI trained on thousands of verified palm readings. While palmistry is a traditional practice and not a medical or scientific discipline, the patterns AI identifies in your unique palm lines are specific to you, not generic horoscope predictions. Treat it as deep self-reflection backed by ancient wisdom.',
  },
  {
    q: 'How is PalmMitra different from free astrology or horoscope apps?',
    a: 'Astrology apps use your birth date and give the same prediction to millions of people born in the same month. PalmMitra analyses the actual physical lines on YOUR palm — unique to you like a fingerprint — using computer vision AI trained on traditional Hasta Samudrika Shastra texts. Your birth date never changes. But your palm carries the living story of your actual life path, shaped by your choices and nature.',
  },
  {
    q: 'Which hand should I photograph?',
    a: 'We recommend photographing your dominant hand (right for right-handed people, left for left-handed). Your dominant hand shows your current path and potential, while the non-dominant hand shows inherited traits.',
  },
  {
    q: 'How long does it take to get my reading?',
    a: 'Your palm reading is generated quickly! Once you upload your palm image, our AI analyses it in under 2 minutes and presents your personalised report.',
  },
  {
    q: 'What happens to my palm image after the reading?',
    a: 'Your palm image is stored securely on our servers and is never shared with third parties. It is used solely to generate your reading. You can request deletion at any time by emailing privacy@palmmitra.com.',
  },
  {
    q: 'Can I trust AI for something this personal?',
    a: "We understand the hesitation. Our AI doesn't make broad generalisations — it identifies specific patterns in YOUR palm's line depth, length, curvature, and intersections, then maps them to traditional Indian palmistry knowledge compiled from classical texts. Think of it as an expert palmist who has studied thousands of palms and can recall every pattern instantly. The report is always yours, never a template.",
  },
  {
    q: 'What does the free preview include?',
    a: 'The free preview includes your palm summary, Life Line deep analysis, your first personality trait reveal, and one personalised spiritual remedy. To unlock all 5 major lines, mounts analysis, career & wealth turning points, love & marriage insights, and the 5-year Lucky Periods Timeline — upgrade for ₹99.',
  },
  {
    q: 'Can I access my report later?',
    a: 'Yes. Your report is saved permanently at your unique report link. Bookmark it or save the URL — you can return anytime, on any device, for as long as you need.',
  },
  {
    q: 'Can I get readings for family members?',
    a: 'Absolutely! You can upload palm photos for any family member or friend. Our Monthly Plan at ₹299/month gives you unlimited readings for the whole family — the most popular choice for families.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major payment methods through Razorpay, including UPI, credit/debit cards, net banking, and popular wallets like Paytm, PhonePe, and Google Pay.',
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24 md:py-32 relative scroll-mt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <AnimatedSection className="text-center mb-16">
          <p className="sanskrit-accent mb-3">ॐ Prashna Samadhan</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            Your Questions,{' '}
            <span className="text-gradient-gold">Honestly Answered</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real answers to the questions people ask before they commit
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
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.04 }}
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
