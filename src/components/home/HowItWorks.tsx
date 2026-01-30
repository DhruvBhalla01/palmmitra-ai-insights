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
    borderColor: 'border-blue-500/20',
  },
  {
    icon: Scan,
    title: 'AI Scans Major Lines',
    description: 'Our advanced AI analyzes your Life, Heart, Fate, and other palm lines.',
    color: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
    borderColor: 'border-purple-500/20',
  },
  {
    icon: FileText,
    title: 'Get Personalized Report',
    description: 'Receive detailed insights about your personality, future, and spiritual path.',
    color: 'bg-accent/10',
    iconColor: 'text-accent',
    borderColor: 'border-accent/20',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 relative scroll-mt-20">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <p className="sanskrit-accent mb-3">ॐ Margadarshan</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            How It <span className="text-gradient-gold">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get your personalized palm reading in three simple steps
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection line for desktop */}
          <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-px">
            <div className="w-full h-full bg-gradient-to-r from-accent/0 via-accent/30 to-accent/0" />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative group"
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className={`relative card-premium p-8 border ${step.borderColor} hover:border-accent/40`}
              >
                {/* Step number with premium styling */}
                <motion.div 
                  className="absolute -top-5 -right-5 w-12 h-12 rounded-2xl bg-gradient-gold flex items-center justify-center font-bold text-foreground shadow-gold text-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {index + 1}
                </motion.div>

                {/* Icon with glow effect */}
                <motion.div 
                  className={`w-20 h-20 rounded-3xl ${step.color} flex items-center justify-center mb-6 relative`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <step.icon className={`w-10 h-10 ${step.iconColor}`} />
                  <div className={`absolute inset-0 rounded-3xl ${step.color} blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />
                </motion.div>

                <h3 className="text-xl font-serif font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}