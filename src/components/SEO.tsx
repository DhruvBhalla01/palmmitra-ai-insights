import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  path: string; // e.g. "/about" or "/"
  ogType?: "website" | "article" | "product";
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const SITE_URL = "https://palmmitra.com";

/**
 * Per-route <head> metadata for AI/search crawlers that execute JS
 * (ChatGPT, Perplexity, Claude, Gemini, Google AI Mode, Bingbot).
 *
 * Static crawlers still see index.html defaults, which is the correct
 * fallback for social-preview crawlers (LinkedIn, Slack, Facebook).
 */
export function SEO({
  title,
  description,
  path,
  ogType = "website",
  noindex = false,
  jsonLd,
}: SEOProps) {
  const url = `${SITE_URL}${path}`;
  const jsonLdArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />

      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {jsonLdArray.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}
