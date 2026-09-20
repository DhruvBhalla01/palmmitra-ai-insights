import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  path: string; // e.g. "/about" or "/"
  ogType?: "website" | "article" | "product";
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  image?: string;
}

const SITE_URL = "https://www.palmmitra.in";
const DEFAULT_IMAGE = `${SITE_URL}/logo.webp`;

/**
 * Per-route <head> metadata for AI/search crawlers that execute JS
 * (ChatGPT, Perplexity, Claude, Gemini, Google AI Mode, Bingbot).
 *
 * Static crawlers use the deployment's initial HTML; public route metadata
 * should therefore also be provided by SSR or prerendering.
 */
export function SEO({
  title,
  description,
  path,
  ogType = "website",
  noindex = false,
  jsonLd,
  image,
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
      <meta property="og:image" content={image ?? DEFAULT_IMAGE} />

      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image ?? DEFAULT_IMAGE} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {jsonLdArray.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}
