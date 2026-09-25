import { useParams, Link, Navigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { breadcrumbLd } from '@/lib/seo';
import { PremiumBackground } from '@/components/PremiumBackground';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ArrowRight, ChevronRight, Clock, Quote, ScrollText } from 'lucide-react';
import { getGuide, relatedGuides } from '@/data/guides';

const SITE_URL = 'https://www.palmmitra.in';

export default function GuideDetail() {
  const { slug } = useParams<{ slug: string }>();
  const guide = slug ? getGuide(slug) : undefined;

  if (!guide) return <Navigate to="/guides" replace />;

  const url = `${SITE_URL}/guides/${guide.slug}`;
  const related = relatedGuides(guide.slug);

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.metaDescription,
    datePublished: guide.publishDate,
    dateModified: guide.publishDate,
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: 'PalmMitra' },
    publisher: {
      '@type': 'Organization',
      name: 'PalmMitra',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.webp` },
    },
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const isMatch = guide.cta === 'palmmatch';

  return (
    <div className="min-h-screen bg-background relative">
      <SEO
        title={guide.metaTitle}
        description={guide.metaDescription}
        path={`/guides/${guide.slug}`}
        ogType="article"
        jsonLd={[
          breadcrumbLd([
            ['Palmistry Guides', '/guides'],
            [guide.title, `/guides/${guide.slug}`],
          ]),
          articleLd,
          faqLd,
        ]}
      />
      <PremiumBackground intensity="light" />
      <Navbar />

      <main className="relative z-10 pt-24 md:pt-28 pb-20">
        <div className="container mx-auto px-4">
          <article className="max-w-3xl mx-auto">
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                <li><Link to="/" className="hover:text-accent">Home</Link></li>
                <li aria-hidden="true"><ChevronRight className="w-3 h-3" /></li>
                <li><Link to="/guides" className="hover:text-accent">Palmistry Guides</Link></li>
                <li aria-hidden="true"><ChevronRight className="w-3 h-3" /></li>
                <li className="text-foreground/80 line-clamp-1">{guide.category}</li>
              </ol>
            </nav>

            {/* Header */}
            <AnimatedSection>
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent bg-accent/10 border border-accent/20 rounded-full px-3 py-1">
                  <ScrollText className="w-3.5 h-3.5" aria-hidden="true" />
                  {guide.category}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {guide.readTime}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground leading-tight mb-6">
                {guide.title}
              </h1>

              {guide.intro.map((p, i) => (
                <p key={i} className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
                  {p}
                </p>
              ))}
            </AnimatedSection>

            {/* Table of contents */}
            <AnimatedSection delay={0.1}>
              <div className="glass-premium rounded-2xl p-5 md:p-6 border border-accent/20 my-10">
                <h2 className="text-sm font-semibold text-accent uppercase tracking-wide mb-3">
                  In this guide
                </h2>
                <ol className="space-y-2">
                  {guide.sections.map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="text-sm text-muted-foreground hover:text-accent transition-colors inline-flex gap-2"
                      >
                        <span className="text-accent/60">{i + 1}.</span>
                        {s.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </AnimatedSection>

            {/* Body */}
            {guide.sections.map((section, idx) => (
              <AnimatedSection key={section.id} delay={0.05}>
                <section id={section.id} className="scroll-mt-28 mb-12">
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
                    {section.heading}
                  </h2>
                  {section.paragraphs.map((p, i) => (
                    <p key={i} className="text-base text-muted-foreground leading-relaxed mb-4">
                      {p}
                    </p>
                  ))}

                  {section.bullets && (
                    <ul className="space-y-2.5 my-5">
                      {section.bullets.map((b, i) => (
                        <li key={i} className="flex gap-3 text-base text-muted-foreground leading-relaxed">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.callout && (
                    <div className="relative glass-premium rounded-2xl border border-accent/30 p-5 md:p-6 my-6">
                      <Quote className="w-5 h-5 text-accent mb-3" aria-hidden="true" />
                      <p className="text-base md:text-lg font-serif text-foreground/90 leading-relaxed">
                        {section.callout}
                      </p>
                    </div>
                  )}

                  {/* Mid-article conversion block */}
                  {idx === 1 && (
                    <div className="glass-premium rounded-2xl border border-accent/30 p-6 my-10 text-center">
                      <p className="text-base text-foreground mb-4">
                        {isMatch
                          ? 'Want both palms read side by side? PalmMatch compares two hands the way a traditional reader would.'
                          : 'Want this read on your own hand? One clear photo is all it takes.'}
                      </p>
                      <Button asChild className="btn-gold text-foreground font-semibold px-8 py-6 rounded-2xl shadow-gold-lg">
                        <Link to={isMatch ? '/palmmatch' : '/upload'}>
                          {isMatch ? 'Check our compatibility' : 'Read my palm'}
                        </Link>
                      </Button>
                    </div>
                  )}
                </section>
              </AnimatedSection>
            ))}

            {/* FAQ */}
            <AnimatedSection delay={0.1}>
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-5">
                  Frequently asked questions
                </h2>
                <Accordion type="single" collapsible className="space-y-3">
                  {guide.faqs.map((faq, i) => (
                    <AccordionItem
                      key={i}
                      value={`faq-${i}`}
                      className="glass-premium rounded-2xl border border-accent/20 px-5"
                    >
                      <AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline py-4">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-4">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            </AnimatedSection>

            {/* Closing CTA */}
            <AnimatedSection delay={0.1}>
              <div className="glass-premium rounded-3xl p-8 border border-accent/30 text-center mb-14">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3">
                  {isMatch ? (
                    <>See your <span className="text-gradient-gold">compatibility</span></>
                  ) : (
                    <>Read your <span className="text-gradient-gold">own palm</span></>
                  )}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {isMatch
                    ? 'PalmMatch reads both partners’ heart lines, head lines and union lines together, in English or Hinglish.'
                    : 'PalmMitra reads your life line, heart line, head line and fate line together from a single photo, in English or Hinglish.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild className="btn-gold text-foreground font-semibold px-8 py-6 rounded-2xl shadow-gold-lg">
                    <Link to={isMatch ? '/palmmatch' : '/upload'}>
                      {isMatch ? 'Start PalmMatch' : 'Get my palm reading'}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="px-8 py-6 rounded-2xl border-accent/40">
                    <Link to={isMatch ? '/upload' : '/palmmatch'}>
                      {isMatch ? 'Read a single palm' : 'Couple compatibility'}
                    </Link>
                  </Button>
                </div>
              </div>
            </AnimatedSection>

            {/* Related */}
            <section aria-labelledby="related-heading">
              <h2 id="related-heading" className="text-xl font-serif font-bold text-foreground mb-5">
                Continue reading
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {related.map((g) => (
                  <Link
                    key={g.slug}
                    to={`/guides/${g.slug}`}
                    className="group glass-premium rounded-2xl p-5 border border-accent/20 hover:border-accent/50 transition-colors"
                  >
                    <p className="text-xs text-accent mb-2">{g.category}</p>
                    <p className="text-sm font-serif font-semibold text-foreground leading-snug mb-3 group-hover:text-accent transition-colors">
                      {g.title}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      {g.readTime}
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <p className="text-xs text-muted-foreground/70 leading-relaxed mt-12">
              Palmistry is a traditional practice offered for reflection and entertainment. PalmMitra
              readings are not medical, legal or financial advice.
            </p>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
