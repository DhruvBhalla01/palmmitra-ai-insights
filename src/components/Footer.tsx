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
            <p className="sanskrit-accent text-xs mb-4">ॐ Bhavishya Darshan</p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/palmmitra"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="PalmMitra on Instagram"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-accent/20 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-white/70 hover:text-accent" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com/palmmitra"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="PalmMitra on X (Twitter)"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-accent/20 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-white/70 hover:text-accent" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
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
        <div className="border-t border-white/10 pt-8">
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
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} PalmMitra. All rights reserved. Made with love in India.
          </p>
        </div>
      </div>
    </footer>
  );
}
