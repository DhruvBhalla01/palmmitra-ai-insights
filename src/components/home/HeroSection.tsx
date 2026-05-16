import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Eye, Shield, Zap, Users, Star } from "lucide-react";
import { SampleReportModal } from "./SampleReportModal";

const heroPalmImg = "/lovable-uploads/41f937d2-cf0d-4793-a69c-892bf8c421eb.png";

const floatingInsights = [
  { label: "Career Turning Point", value: "Age 28–31", color: "text-accent" },
  { label: "Love Timeline", value: "Detailed", color: "text-purple-400" },
  { label: "Wealth Window", value: "2025–2027", color: "text-green-400" },
];

export function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Premium dark gradient background */}
      <div className="absolute inset-0 bg-gradient-mystic" />

      {/* Subtle dot-grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(42 87% 55%) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-accent/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/25 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-purple-900/10 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 py-12">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">
          {/* ── Left: Copy ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            {/* Live-count pill */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 glass-premium rounded-full px-5 py-2.5 mb-7 border border-accent/20"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span className="text-sm font-medium text-white/80">
                12,400+ readings done &nbsp;·&nbsp; 4.9
                <span className="text-accent">★</span> avg
              </span>
            </motion.div>

            {/* Sanskrit accent */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="sanskrit-accent mb-4 text-white/50 tracking-widest"
            >
              ॐ Bhavishya Darshan — The Science of Your Palm
            </motion.p>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7 }}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-[4.5rem] font-serif font-bold text-white leading-[1.08] mb-6"
            >
              Your Palm Holds{" "}
              <span className="text-gradient-gold">
                a 2,000-Word Story
              </span>{" "}
              <span className="text-white/90">About Your Life</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="text-base md:text-lg text-white/70 mb-7 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              India's most advanced AI palmistry platform. Upload one photo —
              get a personalised report decoding your career turning points,
              love timeline, wealth windows, and spiritual path in under 2
              minutes.
            </motion.p>

            {/* Value prop pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="flex flex-wrap gap-x-5 gap-y-2 justify-center lg:justify-start mb-8 text-sm text-white/60"
            >
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-accent" /> Results in 2 min
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-accent" /> 100% private
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-accent" /> Free preview
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-accent fill-accent" /> 4.9 rating
              </span>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6"
            >
              <Link to="/upload">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button className="btn-gold text-foreground font-semibold text-lg px-10 py-7 rounded-2xl group shadow-gold-lg w-full sm:w-auto">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Scan My Palm — Free
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </motion.div>
              </Link>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 font-semibold text-lg px-8 py-7 rounded-2xl w-full sm:w-auto backdrop-blur-sm"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Eye className="w-5 h-5 mr-2" />
                  See Sample Report
                </Button>
              </motion.div>
            </motion.div>

            {/* Micro-trust strip */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="text-xs text-white/35 text-center lg:text-left"
            >
              No sign-up needed &nbsp;·&nbsp; Razorpay secured &nbsp;·&nbsp;
              Trusted in 120+ cities &nbsp;·&nbsp; Full report ₹99
            </motion.p>
          </motion.div>

          {/* ── Right: Palm image ────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
            className="relative flex items-center justify-center"
          >
            {/* Glow layers */}
            <div className="absolute w-[320px] h-[320px] md:w-[500px] md:h-[500px] lg:w-[640px] lg:h-[640px] rounded-full bg-accent/15 blur-3xl animate-glow-pulse" />
            <div className="absolute w-[260px] h-[260px] md:w-[420px] md:h-[420px] lg:w-[540px] lg:h-[540px] rounded-full bg-accent/8 blur-2xl animate-glow-pulse-gold" />

            <div className="relative w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] md:w-[520px] md:h-[520px] lg:w-[680px] lg:h-[680px]">
              {/* Outer rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <circle
                    cx="100" cy="100" r="95"
                    fill="none"
                    stroke="hsl(var(--accent) / 0.15)"
                    strokeWidth="0.5"
                    strokeDasharray="3 9"
                  />
                  {[...Array(12)].map((_, i) => (
                    <circle
                      key={i}
                      cx={100 + 95 * Math.cos((i * 30 * Math.PI) / 180)}
                      cy={100 + 95 * Math.sin((i * 30 * Math.PI) / 180)}
                      r="1.5"
                      fill="hsl(var(--accent) / 0.35)"
                    />
                  ))}
                </svg>
              </motion.div>

              {/* Inner counter-rotating ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute inset-6"
              >
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <circle
                    cx="100" cy="100" r="90"
                    fill="none"
                    stroke="hsl(var(--accent) / 0.08)"
                    strokeWidth="0.5"
                    strokeDasharray="1 6"
                  />
                </svg>
              </motion.div>

              {/* Palm image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.img
                  src={heroPalmImg}
                  alt="AI Palm Reading — PalmMitra decodes your life path, career, love and destiny"
                  className="object-contain w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] md:w-[500px] md:h-[500px] lg:w-[660px] lg:h-[660px] opacity-95"
                  animate={{ y: [0, -16, 0], scale: [1, 1.02, 1] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    filter: "drop-shadow(0 0 60px hsl(42 87% 55% / 0.55))",
                  }}
                />
              </div>

              {/* Floating insight cards */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute top-[10%] left-[-5%] glass-premium rounded-2xl px-4 py-3 border border-accent/20 hidden sm:block"
              >
                <p className="text-xs text-white/50 mb-0.5">Readings done</p>
                <p className="text-lg font-serif font-bold text-gradient-gold">12,400+</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="absolute bottom-[20%] right-[-5%] glass-premium rounded-2xl px-4 py-3 border border-accent/20 hidden sm:block"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent" />
                  <p className="text-sm font-semibold text-white">4.9★ Rating</p>
                </div>
                <p className="text-xs text-white/50 mt-0.5">2,100+ reviews</p>
              </motion.div>

              {/* Floating insight preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-[5%] left-[5%] glass-premium rounded-2xl px-4 py-3 border border-purple-500/20 hidden md:block max-w-[180px]"
              >
                <p className="text-xs text-white/40 mb-1.5 uppercase tracking-wide">Sample Insight</p>
                {floatingInsights.slice(0, 2).map((insight) => (
                  <div key={insight.label} className="flex items-center justify-between gap-3 py-0.5">
                    <span className="text-xs text-white/60">{insight.label}</span>
                    <span className={`text-xs font-bold ${insight.color}`}>{insight.value}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sample Report Modal */}
      <SampleReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
