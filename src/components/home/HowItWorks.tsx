import { motion } from 'framer-motion';
import { Upload, Scan, FileText } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';

const steps = [
  {
    icon: Upload,
    title: 'Upload Palm Photo',
    description: 'Take a clear photo of your palm and upload it securely to our platform.',
    color: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    icon: Scan,
    title: 'AI Scans Major Lines',
    description: 'Our advanced AI analyzes your Life, Heart, Fate, and other palm lines.',
    color: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
  {
    icon: FileText,
    title: 'Get Personalized Report',
    description: 'Receive detailed insights about your personality, future, and spiritual path.',
    color: 'bg-accent/10',
    iconColor: 'text-accent',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            How It <span className="text-gradient-gold">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get your personalized palm reading in three simple steps
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative group"
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-accent/50 to-transparent" />
              )}

              <div className="relative bg-card rounded-3xl p-8 border border-border shadow-soft hover:shadow-elevated transition-all duration-300">
                {/* Step number */}
                <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center font-bold text-foreground shadow-gold">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                </div>

                <h3 className="text-xl font-serif font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
