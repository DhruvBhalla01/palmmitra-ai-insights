import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SmartLink } from '@/components/SmartLink';
import { useTheme } from '@/hooks/useTheme';
import logoImg from '@/assets/logo.png';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Features', path: '/#features' },
  { name: 'How It Works', path: '/#how-it-works' },
  { name: 'Testimonials', path: '/#testimonials' },
  { name: 'FAQ', path: '/#faq' },
  { name: 'Pricing', path: '/#pricing' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'glass-premium shadow-soft py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <motion.div 
            className="w-11 h-11 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-xl">🖐️</span>
          </motion.div>
          <span className="text-2xl font-serif font-bold text-foreground">
            Palm<span className="text-gradient-gold">Mitra</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => (
            <SmartLink
              key={link.name}
              to={link.path}
              className="relative text-muted-foreground hover:text-foreground transition-colors font-medium group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent rounded-full group-hover:w-full transition-all duration-300" />
            </SmartLink>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={isDark}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="btn-secondary-premium w-10 h-10 p-0 rounded-xl flex items-center justify-center"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link to="/upload">
            <Button className="btn-gold text-foreground font-semibold px-6 py-5 rounded-xl shadow-gold">
              <Sparkles className="w-4 h-4 mr-2" />
              Get Your Reading
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="lg:hidden p-2 text-foreground rounded-xl hover:bg-accent/10 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          whileTap={{ scale: 0.95 }}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav"
        >
          <AnimatePresence mode="wait">
            {isMobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden glass-premium mt-3 mx-4 rounded-2xl overflow-hidden border border-accent/20"
            id="mobile-nav"
          >
            <div className="p-4 flex flex-col gap-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <SmartLink
                    to={link.path}
                    className="block text-foreground font-medium py-3 px-4 hover:bg-accent/10 rounded-xl transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </SmartLink>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-2 grid gap-2"
              >
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                  aria-pressed={isDark}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-foreground font-medium hover:bg-accent/10 transition-colors"
                >
                  <span>{isDark ? "Light mode" : "Dark mode"}</span>
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <Link to="/upload">
                  <Button className="btn-gold w-full text-foreground font-semibold py-5">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Your Reading
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
