// Small SEO helpers shared across route <SEO /> instances.

const SITE_URL = "https://palmmitra.com";

/**
 * Build a BreadcrumbList JSON-LD for a route.
 * Pass the trail after Home, e.g. breadcrumbLd([["About", "/about"]]).
 */
export function breadcrumbLd(trail: Array<[string, string]>) {
  const items = [["Home", "/"] as [string, string], ...trail].map(
    ([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${SITE_URL}${path}`,
    }),
  );
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}
