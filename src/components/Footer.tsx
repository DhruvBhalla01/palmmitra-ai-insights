import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoImg from '@/assets/logo.png';
import { SmartLink } from '@/components/SmartLink';

const footerLinks = {
  company: [
    { name: 'About PalmMitra', path: '/about' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Pricing', path: '/#pricing' },
  ],
  legal: [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Disclaimer', path: '/privacy#disclaimer' },
  ],
  support: [
    { name: 'Contact Us', path: '/contact' },
    { name: 'FAQ', path: '/help#faq' },
    { name: 'Help Center', path: '/help' },
  ],
};

export function Footer() {
  return (
    <footer className="relative bg-gradient-mystic text-white py-20 pb-32 md:pb-20 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-6">
            <motion.div 
                className="w-10 h-10 rounded-full overflow-hidden"
                whileHover={{ scale: 1.05 }}
              >
                <img src={logoImg} alt="PalmMitra logo" className="w-full h-full object-contain" />
              </motion.div>
              <span className="text-2xl font-serif font-bold">
                Palm<span className="text-accent">Mitra</span>
              </span>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              AI Powered Palm Reading, Inspired by Ancient India. Discover your destiny through the wisdom of your palms.
            </p>
            <p className="sanskrit-accent text-xs">ॐ Bhavishya Darshan</p>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-serif font-bold mb-5 text-lg">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <SmartLink
                    to={link.path}
                    className="text-white/70 hover:text-accent transition-colors text-sm inline-flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-accent/50 group-hover:bg-accent transition-colors" />
                    {link.name}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-serif font-bold mb-5 text-lg">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <SmartLink
                    to={link.path}
                    className="text-white/70 hover:text-accent transition-colors text-sm inline-flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-accent/50 group-hover:bg-accent transition-colors" />
                    {link.name}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-serif font-bold mb-5 text-lg">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <SmartLink
                    to={link.path}
                    className="text-white/70 hover:text-accent transition-colors text-sm inline-flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-accent/50 group-hover:bg-accent transition-colors" />
                    {link.name}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-primary-foreground/10 pt-8">
          <div className="rounded-2xl p-6 max-w-4xl mx-auto bg-white/10 dark:bg-white/5 border border-white/10">
            <p className="text-white/70 text-xs text-center leading-relaxed">
              <strong className="text-white/90">Disclaimer:</strong> PalmMitra provides spiritual guidance and AI-based insights for entertainment and self-reflection purposes. 
              Results may vary and should not be considered as medical, legal, financial, or professional advice. 
              By using our services, you acknowledge that palmistry is a traditional practice and outcomes are not guaranteed.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8">
          <p className="text-primary-foreground/50 text-sm">
            © {new Date().getFullYear()} PalmMitra. All rights reserved. Made with ❤️ in India.
          </p>
        </div>
      </div>
    </footer>
  );
}
