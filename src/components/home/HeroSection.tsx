import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Eye, Shield, Zap, Users } from "lucide-react";
import heroVideo from "@/assets/hero-video.mp4";

const heroPalmImg = "/lovable-uploads/41f937d2-cf0d-4793-a69c-892bf8c421eb.png";
import { SampleReportModal } from "./SampleReportModal";

export function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = heroVideo;
    link.type = "video/mp4";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          className={`w-full h-full object-cover transition-opacity duration-700 ${isVideoReady ? "opacity-100" : "opacity-0"}`}
          onLoadedData={() => setIsVideoReady(true)}
          onCanPlay={() => setIsVideoReady(true)}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
      </div>

      {/* Hologram glow behind palm */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/10 blur-[100px] animate-glow-pulse pointer-events-none z-[1]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 glass-premium rounded-full px-5 py-2.5 mb-6"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              <span className="text-sm font-medium text-foreground">3,200+ readings this week</span>
            </motion.div>

            {/* Sanskrit accent */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="sanskrit-accent mb-4"
            >
              ॐ Bhavishya Darshan
            </motion.p>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-foreground leading-tight mb-4">
              What Does Your Palm{" "}
              <span className="text-gradient-gold text-shadow-luxury">Reveal About You?</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Uncover hidden truths about your personality, career, love life, and destiny — powered by advanced AI palmistry analysis.
            </p>

            {/* Value prop bullets */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start mb-8 text-sm text-foreground/80">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-accent" />
                Instant results
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-accent" />
                100% private
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-accent" />
                Free preview
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/upload">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button className="btn-gold text-foreground font-semibold text-lg px-10 py-7 rounded-2xl group shadow-gold-lg w-full sm:w-auto">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Scan My Palm — It's Free
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </motion.div>
              </Link>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="outline"
                  className="btn-secondary-premium font-semibold text-lg px-8 py-7 rounded-2xl w-full sm:w-auto"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Eye className="w-5 h-5 mr-2" />
                  See Sample Report
                </Button>
              </motion.div>
            </div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-foreground/70"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                50,000+ Readings
              </span>
              <span className="hidden sm:inline text-accent/50">•</span>
              <span>Rated 4.9★</span>
              <span className="hidden sm:inline text-accent/50">•</span>
              <span>Trusted by users in 120+ cities</span>
            </motion.div>
          </motion.div>

          {/* Right Content - Mystical Palm Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative flex items-center justify-center"
          >
            {/* Multiple glow layers */}
            <div className="absolute w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] md:w-[520px] md:h-[520px] lg:w-[680px] lg:h-[680px] rounded-full bg-accent/20 blur-3xl animate-glow-pulse" />
            <div className="absolute w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] md:w-[450px] md:h-[450px] lg:w-[580px] lg:h-[580px] rounded-full bg-accent/10 blur-2xl animate-glow-pulse-gold" />

            {/* Palm illustration container */}
            <div className="relative w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] md:w-[520px] md:h-[520px] lg:w-[700px] lg:h-[700px]">
              {/* Outer rotating ring with dots */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="95"
                    fill="none"
                    stroke="hsl(var(--accent) / 0.2)"
                    strokeWidth="0.5"
                    strokeDasharray="4 8"
                  />
                  {[...Array(12)].map((_, i) => (
                    <circle
                      key={i}
                      cx={100 + 95 * Math.cos((i * 30 * Math.PI) / 180)}
                      cy={100 + 95 * Math.sin((i * 30 * Math.PI) / 180)}
                      r="2"
                      fill="hsl(var(--accent) / 0.4)"
                    />
                  ))}
                </svg>
              </motion.div>

              {/* Mystical Palm Image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.img
                  alt="Mystical Palm Reading"
                  className="object-contain w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] md:w-[520px] md:h-[520px] lg:w-[680px] lg:h-[680px] opacity-95"
                  animate={{
                    y: [0, -18, 0],
                    scale: [1, 1.03, 1],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    filter: "drop-shadow(0 0 60px hsl(var(--gold) / 0.6))",
                  }}
                  src={heroPalmImg}
                />
              </div>

              {/* Floating symbols with premium styling */}
              {[
                { symbol: "✨", x: "8%", y: "15%", delay: 0 },
                { symbol: "🔮", x: "88%", y: "25%", delay: 0.5 },
                { symbol: "⭐", x: "5%", y: "75%", delay: 1 },
                { symbol: "🌙", x: "92%", y: "78%", delay: 1.5 },
                { symbol: "ॐ", x: "50%", y: "2%", delay: 0.8 },
              ].map(({ symbol, x, y, delay }, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl md:text-3xl"
                  style={{ left: x, top: y }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.4, 1, 0.4],
                    scale: [0.9, 1.1, 0.9],
                  }}
                  transition={{
                    duration: 4 + i * 0.5,
                    repeat: Infinity,
                    delay,
                  }}
                >
                  {symbol}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sample Report Modal */}
      <SampleReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
