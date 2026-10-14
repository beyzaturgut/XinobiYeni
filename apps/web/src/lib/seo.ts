import type { Metadata, MetadataRoute } from "next";

/**
 * Public site origin for canonical URLs, the sitemap and robots (Faz04 SEO), e.g. https://www.xinobi.com.tr.
 * Unset in test and preview builds, which then ask search engines not to index anything: the current live
 * preview is a test server reached by IP, and must not compete with the future domain.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/+$/, "");
export const indexable = /^https:\/\/[a-z0-9.-]+$/i.test(siteUrl);

/** Public, indexable pages (trailing slash, as exported). Product details are added once a build-time catalogue exists. */
export const publicRoutes = ["/", "/urunler/", "/arama/", "/xinobi-u/", "/xinobi/", "/kurumsal/teklif/", "/asistan/", "/yasal/"] as const;

/** Personal, transactional or tool pages that never belong in search results. */
export const privateRoutes = ["/hesap/", "/sepet/", "/odeme/", "/favoriler/", "/karsilastir/", "/studio/", "/kurumsal/teklif/takip/",
  "/xinobi-u/renk/", "/xinobi-u/sorular/", "/xinobi-u/kendi-gorselin/", "/xinobi-u/onizleme/", "/xinobi-u/maske-kontrolu/", "/xinobi-u/mobil-onizleme/",
  "/urunler/cay-makinesi-101/", "/admin/", "/api/"] as const;

/** Page metadata with a canonical URL when the site is indexable; otherwise only the given fields. */
export function pageMetadata(path: (typeof publicRoutes)[number], metadata: Metadata): Metadata {
  return indexable ? { ...metadata, alternates: { canonical: path } } : metadata;
}

/** Site-wide defaults: Open Graph, and noindex everywhere until the public domain is configured. */
export const siteMetadata: Metadata = {
  ...(indexable ? { metadataBase: new URL(siteUrl) } : { robots: { index: false, follow: false } }),
  openGraph: { siteName: "Xinobi", locale: "tr_TR", type: "website" },
};

export function robotsFile(): MetadataRoute.Robots {
  if (!indexable) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: [...privateRoutes] }, sitemap: `${siteUrl}/sitemap.xml` };
}

export function sitemapFile(): MetadataRoute.Sitemap {
  if (!indexable) return [];
  return publicRoutes.map(path => ({ url: siteUrl + path, changeFrequency: path === "/" || path === "/urunler/" ? "daily" : "monthly", priority: path === "/" ? 1 : 0.7 }));
}

/** JSON for a script tag: `<` is escaped so catalogue text cannot close the tag (Next.js JSON-LD guidance). */
export const jsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

export function organizationJsonLd() {
  return jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", name: "Xinobi", ...(indexable ? { url: siteUrl + "/", logo: siteUrl + "/assets/brand/xinobi-logo-white.png" } : {}) },
      { "@type": "WebSite", name: "Xinobi", inLanguage: "tr", ...(indexable ? { url: siteUrl + "/" } : {}) },
    ],
  });
}

/** Schema.org Product for the selected variant; price and availability come from the server catalogue only. */
export function productJsonLd(product: { name: string; description?: string; category: string }, variant: { sku: string; color: string; stock: number }, image: string | undefined, priceMinor: number | undefined) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} ${variant.color}`,
    sku: variant.sku,
    category: product.category,
    brand: { "@type": "Brand", name: "Xinobi" },
    ...(product.description ? { description: product.description } : {}),
    ...(image ? { image } : {}),
    ...(priceMinor === undefined ? {} : { offers: { "@type": "Offer", priceCurrency: "TRY", price: (priceMinor / 100).toFixed(2), availability: variant.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" } }),
  });
}
