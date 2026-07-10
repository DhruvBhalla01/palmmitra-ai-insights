import { useState } from "react";
import { m } from '@/lib/motion';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Eye, Shield, Zap, Star } from "lucide-react";
import { SampleReportModal } from "./SampleReportModal";

const heroPalmImg = "/lovable-uploads/41f937d2-cf0d-4793-a69c-892bf8c421eb.webp";
const heroPalmSrcSet = [
  "/lovable-uploads/41f937d2-cf0d-4793-a69c-892bf8c421eb-320w.webp 320w",
  "/lovable-uploads/41f937d2-cf0d-4793-a69c-892bf8c421eb-480w.webp 480w",
  "/lovable-uploads/41f937d2-cf0d-4793-a69c-892bf8c421eb-800w.webp 800w",
  "/lovable-uploads/41f937d2-cf0d-4793-a69c-892bf8c421eb.webp 900w",
].join(", ");
const heroPalmSizes = "(min-width: 1024px) 560px, (min-width: 768px) 420px, (min-width: 640px) 280px, 200px";

export function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section
      className="relative flex items-center pt-24 pb-10 md:pt-28 md:pb-16 lg:min-h-[92vh] overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-mystic" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(42 87% 55%) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[140px] pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 w-[420px] h-[420px] rounded-full bg-primary/25 blur-[120px] pointer-events-none" aria-hidden="true" />

      <div className="container mx-auto px-5 relative z-10">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 xl:gap-16 items-center">
          {/* ── Copy ───────────────────────────── */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center lg:text-left order-2 lg:order-1"
          >
            {/* Live trust pill */}
            <div className="inline-flex items-center gap-2 glass-premium rounded-full px-3.5 py-1.5 mb-5 border border-accent/25">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              <span className="text-[11px] sm:text-xs font-medium text-white/75">
                12,400+ readings · 4.9<span className="text-accent">★</span> from 2,100 reviews
              </span>
            </div>

            {/* H1 — SEO optimized, mobile-tight */}
            <h1
              id="hero-heading"
              className="font-serif font-bold text-white leading-[1.05] mb-4 tracking-tight text-[2.15rem] sm:text-5xl lg:text-6xl xl:text-[4.25rem]"
            >
              AI Palm Reading{" "}
              <span className="text-gradient-gold">Rooted in Ancient</span>{" "}
              <span className="text-white/95">Indian Wisdom</span>
            </h1>

            {/* Supporting paragraph — short, mobile-scannable */}
            <p className="text-[15px] sm:text-lg text-white/70 mb-6 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Upload one photo. Get a personalised 2,000-word destiny report on your career, love,
              wealth, and life path — in under 2 minutes.
            </p>

            {/* CTAs — thumb-friendly, mobile-first */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-5">
              <Link to="/upload" className="w-full sm:w-auto">
                <Button
                  className="btn-gold text-foreground font-semibold text-base sm:text-lg px-8 py-6 sm:py-7 rounded-2xl group shadow-gold-lg w-full min-h-[56px]"
                  aria-label="Analyze my palm — start free"
                >
                  <Sparkles className="w-5 h-5 mr-2" aria-hidden="true" />
                  Analyze My Palm
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(true)}
                className="border-white/25 bg-white/5 text-white hover:bg-white/12 hover:border-white/50 font-semibold text-base sm:text-lg px-6 py-6 sm:py-7 rounded-2xl w-full sm:w-auto backdrop-blur-sm min-h-[56px]"
                aria-label="View a sample palm reading report"
              >
                <Eye className="w-5 h-5 mr-2" aria-hidden="true" />
                View Sample Report
              </Button>
            </div>

            {/* Value pills — compact */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center lg:justify-start text-[12px] sm:text-sm text-white/55">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-accent" aria-hidden="true" /> Results in 2 min
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-accent" aria-hidden="true" /> 100% private
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-accent fill-accent" aria-hidden="true" /> Free preview
              </span>
            </div>

            <p className="text-[11px] text-white/35 mt-4 text-center lg:text-left">
              No sign-up needed · Full report ₹149 / $9.99
            </p>
          </m.div>

          {/* ── Palm visual — smaller/compact on mobile ────── */}
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="relative flex items-center justify-center order-1 lg:order-2"
          >
            <div className="absolute w-[240px] h-[240px] md:w-[420px] md:h-[420px] lg:w-[560px] lg:h-[560px] rounded-full bg-accent/15 blur-3xl animate-glow-pulse" aria-hidden="true" />

            <div className="relative w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] md:w-[440px] md:h-[440px] lg:w-[580px] lg:h-[580px]">
              {/* Rotating gold ring */}
              <m.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
                aria-hidden="true"
              >
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="95" fill="none" stroke="hsl(var(--accent) / 0.18)" strokeWidth="0.5" strokeDasharray="3 9" />
                  {[...Array(12)].map((_, i) => (
                    <circle
                      key={i}
                      cx={100 + 95 * Math.cos((i * 30 * Math.PI) / 180)}
                      cy={100 + 95 * Math.sin((i * 30 * Math.PI) / 180)}
                      r="1.5"
                      fill="hsl(var(--accent) / 0.4)"
                    />
                  ))}
                </svg>
              </m.div>

              {/* AI scan line */}
              <m.div
                aria-hidden="true"
                className="absolute inset-8 rounded-full overflow-hidden pointer-events-none"
              >
                <m.div
                  className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-accent to-transparent"
                  style={{ boxShadow: "0 0 24px hsl(var(--accent) / 0.7)" }}
                  animate={{ top: ["10%", "90%", "10%"] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </m.div>

              <div className="absolute inset-0 flex items-center justify-center">
                <m.img
                  src={heroPalmImg}
                  srcSet={heroPalmSrcSet}
                  sizes={heroPalmSizes}
                  alt="AI palm reading illustration — PalmMitra decodes your life path, career, love and destiny from your palm lines"
                  className="object-contain w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] md:w-[420px] md:h-[420px] lg:w-[560px] lg:h-[560px] opacity-95"
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  style={{ filter: "drop-shadow(0 0 50px hsl(42 87% 55% / 0.5))" }}
                  loading="eager"
                  fetchPriority="high"
                  width={560}
                  height={560}
                />
              </div>
            </div>
          </m.div>
        </div>
      </div>

      <SampleReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
