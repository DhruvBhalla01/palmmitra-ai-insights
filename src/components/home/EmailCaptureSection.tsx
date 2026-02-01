import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Sparkles, Check, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatedSection } from '@/components/AnimatedSection';
import { useToast } from '@/hooks/use-toast';

export function EmailCaptureSection() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call - in production, this would save to database
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
    
    toast({
      title: 'Welcome to PalmMitra!',
      description: 'Check your inbox for your free palm insights preview.',
    });
  };

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 max-w-3xl relative z-10">
        <AnimatedSection>
          <motion.div
            className="glass-premium rounded-3xl p-8 md:p-12 border border-accent/30 text-center relative overflow-hidden"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 shimmer opacity-50" />
            
            {/* Floating sparkles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-accent/60"
                style={{
                  left: `${15 + i * 18}%`,
                  top: `${10 + (i % 2) * 10}%`,
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            ))}

            <div className="relative z-10">
              <motion.div
                className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Mail className="w-8 h-8 text-accent" />
              </motion.div>

              <p className="sanskrit-accent mb-3">ॐ Jyotish Sandesh</p>
              
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-foreground mb-4">
                Get Your Free Palm <span className="text-gradient-gold">Insights Preview</span>
              </h2>
              
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Join 50,000+ seekers. Receive weekly palmistry insights, lucky dates, and exclusive offers.
              </p>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 h-14 rounded-xl bg-background/50 border-accent/20 text-foreground placeholder:text-muted-foreground focus:border-accent"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="submit"
                      className="btn-gold text-foreground font-semibold h-14 px-8 rounded-xl shadow-gold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Sparkles className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Get Free Insights
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-3 text-green-500"
                >
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Check your inbox for your free insights!</span>
                </motion.div>
              )}

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent/70" />
                  No spam, ever
                </span>
                <span className="flex items-center gap-2">
                  <X className="w-4 h-4 text-accent/70" />
                  Unsubscribe anytime
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}
