import { Link } from 'react-router-dom';

const footerLinks = {
  company: [
    { name: 'About PalmMitra', path: '/about' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Pricing', path: '/pricing' },
  ],
  legal: [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Disclaimer', path: '/privacy#disclaimer' },
  ],
  support: [
    { name: 'Contact Us', path: '/contact' },
    { name: 'FAQ', path: '/pricing#faq' },
    { name: 'Help Center', path: '/help' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
                <span className="text-xl">🖐️</span>
              </div>
              <span className="text-2xl font-serif font-bold">
                Palm<span className="text-accent">Mitra</span>
              </span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              AI Powered Palm Reading, Inspired by Ancient India. Discover your destiny through the wisdom of your palms.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-serif font-bold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-serif font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-serif font-bold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-primary-foreground/10 pt-8">
          <p className="text-primary-foreground/50 text-xs text-center max-w-3xl mx-auto leading-relaxed">
            <strong>Disclaimer:</strong> PalmMitra provides spiritual guidance and AI-based insights for entertainment and self-reflection purposes. 
            Results may vary and should not be considered as medical, legal, financial, or professional advice. 
            By using our services, you acknowledge that palmistry is a traditional practice and outcomes are not guaranteed.
          </p>
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
