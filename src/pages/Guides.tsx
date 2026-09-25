import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { breadcrumbLd } from '@/lib/seo';
import { PremiumBackground } from '@/components/PremiumBackground';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, ScrollText } from 'lucide-react';
import { guides, GUIDE_CATEGORIES, type GuideCategory } from '@/data/guides';

const SITE_URL = 'https://www.palmmitra.in';

export default function Guides() {
  const [active, setActive] = useState<GuideCategory | 'All'>('All');

  const visible = active === 'All' ? guides : guides.filter((g) => g.category === active);

  const listLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'PalmMitra Palmistry Guides',
    itemListElement: guides.map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/guides/${g.slug}`,
      name: g.title,
    })),
  };

  return (
    <div className="min-h-screen bg-background relative">
      <SEO
        title="Palmistry Guides — Life Line, Marriage Line & Wealth Signs | PalmMitra"
        description="In-depth guides to traditional Indian palmistry: the forked life line, marriage timing and compatibility, the money triangle, heart line vs head line, and which hand to read."
        path="/guides"
        jsonLd={[breadcrumbLd([['Palmistry Guides', '/guides']]), listLd]}
      />
      <PremiumBackground showMandala intensity="light" />
      <Navbar />

      <main className="relative z-10 pt-28 pb-20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-12">
            <p className="sanskrit-accent mb-4">ॐ Hast Rekha Shastra</p>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-5">
              Palmistry <span className="text-gradient-gold">Guides</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Careful, jargon-free explanations of the lines and markings people ask about most —
              rooted in traditional Hast Rekha Shastra, written so you can read your own hand.
            </p>
          </AnimatedSection>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {(['All', ...GUIDE_CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat as GuideCategory | 'All')}
                aria-pressed={active === cat}
                className={`min-h-11 px-4 rounded-full text-sm font-medium border transition-colors ${
                  active === cat
                    ? 'bg-accent/15 border-accent/50 text-accent'
                    : 'bg-card/40 border-border text-muted-foreground hover:text-foreground hover:border-accent/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Guide cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {visible.map((guide, i) => (
              <AnimatedSection key={guide.slug} delay={i * 0.05}>
                <Link
                  to={`/guides/${guide.slug}`}
                  className="group block h-full glass-premium rounded-3xl p-6 border border-accent/20 hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent bg-accent/10 border border-accent/20 rounded-full px-3 py-1">
                      <ScrollText className="w-3.5 h-3.5" aria-hidden="true" />
                      {guide.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      {guide.readTime}
                    </span>
                  </div>
                  <h2 className="text-xl font-serif font-bold text-foreground mb-3 leading-snug group-hover:text-accent transition-colors">
                    {guide.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{guide.excerpt}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-accent">
                    Read the guide
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </AnimatedSection>
            ))}
          </div>

          {/* Conversion block */}
          <AnimatedSection delay={0.2} className="max-w-3xl mx-auto mt-20">
            <div className="glass-premium rounded-3xl p-8 md:p-10 border border-accent/30 text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
                Rather have your <span className="text-gradient-gold">own palm</span> read?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-7">
                Upload one clear photo of your dominant hand and PalmMitra reads your life line,
                heart line, head line and fate line together — in English or Hinglish.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="btn-gold text-foreground font-semibold px-8 py-6 rounded-2xl shadow-gold-lg">
                  <Link to="/upload">Get my palm reading</Link>
                </Button>
                <Button asChild variant="outline" className="px-8 py-6 rounded-2xl border-accent/40">
                  <Link to="/palmmatch">Check couple compatibility</Link>
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </main>

      <Footer />
    </div>
  );
}
