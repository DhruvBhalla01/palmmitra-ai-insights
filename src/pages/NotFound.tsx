import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PremiumBackground } from "@/components/PremiumBackground";
import { Button } from "@/components/ui/button";
import { Home, Sparkles, ArrowLeft } from "lucide-react";
import { useHashScroll } from "@/hooks/useHashScroll";
import palmIconGold from '@/assets/palm-icon-gold.png';

const NotFound = () => {
  const location = useLocation();
  
  // Enable smooth hash-based scrolling with navbar offset
  useHashScroll();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background relative">
      <PremiumBackground showMandala intensity="light" />
      <Navbar />
      
      <main className="relative z-10 pt-28 pb-20 min-h-[80vh] flex items-center justify-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            {/* Mystical 404 */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                filter: ['drop-shadow(0 0 20px rgba(255,193,7,0.3))', 'drop-shadow(0 0 40px rgba(255,193,7,0.5))', 'drop-shadow(0 0 20px rgba(255,193,7,0.3))']
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-8"
            >
              <img src={palmIconGold} alt="Palm" className="w-28 h-28 md:w-36 md:h-36 object-contain" />
            </motion.div>

            <p className="sanskrit-accent mb-4">ॐ Marg Bhool</p>
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-4">
              <span className="text-gradient-gold">404</span>
            </h1>
            
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-6">
              This Path Leads to Mystery
            </h2>
            
            <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
              The lines of destiny don't lead here. Perhaps the cosmos has a different 
              path in store for you. Let us guide you back.
            </p>

            <div className="glass-premium rounded-3xl p-8 border border-accent/20 mb-8">
              <p className="text-sm text-muted-foreground mb-6">
                You tried to access: <code className="text-accent bg-accent/10 px-2 py-1 rounded">{location.pathname}</code>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <Button className="btn-gold text-foreground font-semibold px-8 py-6 rounded-2xl w-full sm:w-auto">
                    <Home className="w-5 h-5 mr-2" />
                    Return Home
                  </Button>
                </Link>
                <Link to="/upload">
                  <Button variant="outline" className="btn-secondary-premium font-semibold px-8 py-6 rounded-2xl w-full sm:w-auto">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Get Your Reading
                  </Button>
                </Link>
              </div>
            </div>

            <button 
              onClick={() => window.history.back()} 
              className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Go back to previous page
            </button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
