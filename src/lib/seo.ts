/**
 * Centralized SEO constants and helpers for Sri Udharchi Enterprises.
 * Single source of truth for meta tag generation across all routes.
 */

/** Canonical domain — update once production domain is configured */
export const SITE_URL = "https://sriudharchi.com";

export const BRAND = "Sri Udharchi Enterprises";
export const BRAND_TAGLINE = "Fire & Industrial Safety Solutions";
export const OG_IMAGE = "/sri-udharchi-enterprises-logo.png";
export const THEME_COLOR = "#1e3a5f"; // Deep navy matching brand

/** Geo/location constants for local SEO */
export const GEO = {
  region: "IN-AP",
  placename: "Palasamudram, Andhra Pradesh",
  position: "14.6519;77.6006",
  icbm: "14.6519, 77.6006",
} as const;

interface SeoOptions {
  /** Page title — will be suffixed with brand if not already present */
  title: string;
  /** Meta description, 150–160 chars recommended */
  description: string;
  /** Canonical path, e.g. "/products" */
  path: string;
  /** SEO keywords targeting search queries */
  keywords?: string | string[];
  /** Override og:type (defaults to "website") */
  ogType?: string;
  /** Override og:image path */
  ogImage?: string;
  /** Set true to add noindex, nofollow */
  noIndex?: boolean;
  /** Additional structured data (JSON-LD) to inject */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const DEFAULT_KEYWORDS = [
  "fire safety products",
  "fire safety product",
  "fire safety equipment",
  "fire protection products",
  "industrial safety products",
  "fire extinguishers",
  "fire hydrant systems",
  "fire fighting equipment supplier",
  "safety gear and PPE",
  "Andhra Pradesh fire safety",
  "Sri Udharchi Enterprises",
];

/**
 * Generate a complete set of meta tags + links for a route's `head()` return.
 * Ensures consistency: every page gets canonical, OG, Twitter, geo tags, and optional structured data.
 */
export function seoHead(opts: SeoOptions) {
  const fullTitle = opts.title.includes(BRAND) ? opts.title : `${opts.title} | ${BRAND}`;
  const canonicalUrl = `${SITE_URL}${opts.path}`;
  const ogImage = opts.ogImage ?? OG_IMAGE;
  const absoluteOgImage = ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`;

  const keywordsContent = opts.keywords
    ? Array.isArray(opts.keywords)
      ? opts.keywords.join(", ")
      : opts.keywords
    : DEFAULT_KEYWORDS.join(", ");

  const meta: Array<Record<string, string>> = [
    { title: fullTitle },
    { name: "description", content: opts.description },
    { name: "keywords", content: keywordsContent },

    // OpenGraph
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: opts.description },
    { property: "og:url", content: canonicalUrl },
    { property: "og:image", content: absoluteOgImage },
    { property: "og:type", content: opts.ogType ?? "website" },
    { property: "og:site_name", content: BRAND },
    { property: "og:locale", content: "en_IN" },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: opts.description },
    { name: "twitter:image", content: absoluteOgImage },

    // Theme & Mobile
    { name: "theme-color", content: THEME_COLOR },

    // Geo tags for local SEO
    { name: "geo.region", content: GEO.region },
    { name: "geo.placename", content: GEO.placename },
    { name: "geo.position", content: GEO.position },
    { name: "ICBM", content: GEO.icbm },
  ];

  // Robots directive
  if (opts.noIndex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  }

  const links: Array<Record<string, string>> = [{ rel: "canonical", href: canonicalUrl }];

  // Build head return
  const head: {
    meta: Array<Record<string, string>>;
    links: Array<Record<string, string>>;
    scripts?: Array<{ type: string; children: string }>;
  } = { meta, links };

  // Optional JSON-LD structured data
  if (opts.jsonLd) {
    const ldItems = Array.isArray(opts.jsonLd) ? opts.jsonLd : [opts.jsonLd];
    head.scripts = ldItems.map((ld) => ({
      type: "application/ld+json",
      children: JSON.stringify(ld),
    }));
  }

  return head;
}

/**
 * Schema.org structured data helpers
 */
export const schemas = {
  /** WebSite schema with SearchAction for Google Sitelinks Search Box */
  website: () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: BRAND,
    alternateName: [
      "Sri Udharchi",
      "Udharchi Safety",
      "Udharchi Fire Safety",
      "Sri Udharchi Fire Safety Solutions",
    ],
    url: SITE_URL,
    description: `${BRAND} — Certified fire safety equipment distributor and fire protection engineering contractor in Andhra Pradesh.`,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en-IN",
  }),

  /** Google Sitelinks SiteNavigationElement schema */
  siteNavigation: () => ({
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    "@id": `${SITE_URL}/#navigation`,
    name: "Main Site Navigation",
    hasPart: [
      {
        "@type": "WebPage",
        name: "Home",
        description: "Official portal for Sri Udharchi Enterprises fire safety engineering and equipment distribution.",
        url: `${SITE_URL}/`,
      },
      {
        "@type": "WebPage",
        name: "Fire Safety Products",
        description: "Browse and buy ISI/BIS certified fire extinguishers, hydrants, fire pumps, and industrial PPE gear.",
        url: `${SITE_URL}/products`,
      },
      {
        "@type": "WebPage",
        name: "Fire Engineering Services",
        description: "End-to-end fire safety audits, system installation, hydro-testing, and annual maintenance contracts (AMC).",
        url: `${SITE_URL}/services`,
      },
      {
        "@type": "WebPage",
        name: "Industry Solutions",
        description: "Tailored fire protection systems for manufacturing plants, warehouses, marine ports, and hospitals.",
        url: `${SITE_URL}/industries`,
      },
      {
        "@type": "WebPage",
        name: "Featured Projects",
        description: "Showcase of industrial fire hydrant networks, pump houses, and cable management installations.",
        url: `${SITE_URL}/projects`,
      },
      {
        "@type": "WebPage",
        name: "About Sri Udharchi",
        description: "Our certified engineering team, compliance records, mission, and central depot in Palasamudram, AP.",
        url: `${SITE_URL}/about`,
      },
      {
        "@type": "WebPage",
        name: "Contact Us & Emergency Dispatch",
        description: "24/7 emergency dispatch hotline, depot address, quotation inquiries, and WhatsApp support.",
        url: `${SITE_URL}/contact`,
      },
    ],
  }),

  /** LocalBusiness schema — used on root layout */
  localBusiness: () => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#business`,
    name: BRAND,
    legalName: "Sri Udharchi Enterprises (Proprietor: Dabbara Bhanu Swaroop)",
    founder: {
      "@type": "Person",
      name: "Dabbara Bhanu Swaroop",
      jobTitle: "Proprietor",
    },
    url: SITE_URL,
    image: `${SITE_URL}${OG_IMAGE}`,
    description:
      "Certified fire protection systems, industrial safety equipment, fire hydrants, gas suppression, and comprehensive AMC maintenance in Andhra Pradesh and Pan-India.",
    telephone: "+918639858221",
    email: "support@udharchi.in",
    address: {
      "@type": "PostalAddress",
      streetAddress: "4-169-B, Dharmapuram, Peddapappur, Dharmapuram",
      addressLocality: "Ananthapuramu",
      addressRegion: "Andhra Pradesh",
      postalCode: "515445",
      addressCountry: "IN",
    },
    department: [
      {
        "@type": "LocalBusiness",
        name: "Sri Udharchi Enterprises - Central Logistics Depot",
        address: {
          "@type": "PostalAddress",
          streetAddress: "H-7, Kubera Hills",
          addressLocality: "Palasamudram",
          addressRegion: "Andhra Pradesh",
          postalCode: "515241",
          addressCountry: "IN",
        },
      },
    ],
    geo: {
      "@type": "GeoCoordinates",
      latitude: 14.6519,
      longitude: 77.6006,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "19:00",
      },
    ],
    areaServed: [
      { "@type": "State", name: "Andhra Pradesh" },
      { "@type": "State", name: "Telangana" },
      { "@type": "State", name: "Odisha" },
      { "@type": "Country", name: "India" },
    ],
    priceRange: "$$",
    sameAs: [],
  }),

  /** BreadcrumbList for a given path array */
  breadcrumbs: (items: Array<{ name: string; path: string }>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }),

  /** Service schema for service pages */
  service: (name: string, description: string, path: string) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${SITE_URL}${path}`,
    provider: {
      "@type": "LocalBusiness",
      name: BRAND,
      "@id": `${SITE_URL}/#business`,
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
  }),

  /** ItemList schema for product catalogs */
  productList: (
    products: Array<{
      name: string;
      description?: string;
      image?: string;
      price?: number;
      category?: string;
    }>,
  ) => ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Certified Fire Safety Products & Industrial Protection Equipment Catalog",
    description:
      "Buy certified fire safety products: ISI certified fire extinguishers, fire hydrant valves, RRL hoses, diesel fire pumps, industrial PPE kits, and emergency detection gear.",
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Product",
        name: p.name,
        category: p.category ?? "Fire Safety Products",
        description:
          p.description ??
          "Certified fire safety product compliant with IS 15683 and NBC 2016 safety codes.",
        ...(p.image ? { image: p.image } : {}),
        ...(p.price
          ? {
              offers: {
                "@type": "Offer",
                priceCurrency: "INR",
                price: p.price,
                availability: "https://schema.org/InStock",
                seller: {
                  "@type": "Organization",
                  name: BRAND,
                },
              },
            }
          : {}),
        brand: {
          "@type": "Brand",
          name: BRAND,
        },
      },
    })),
  }),

  /** FAQPage schema */
  faq: (items: Array<{ question: string; answer: string }>) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }),

  /** Single Product schema */
  singleProduct: (product: {
    name: string;
    description?: string | undefined;
    image?: string | undefined;
    price?: string | number | undefined;
    sku?: string | undefined;
    category?: string | undefined;
    inStock?: boolean | undefined;
    url?: string | undefined;
  }) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description ||
      `${product.name} - Certified industrial safety and fire protection equipment by ${BRAND}.`,
    ...(product.image ? { image: product.image } : {}),
    ...(product.sku ? { sku: product.sku, mpn: product.sku } : {}),
    category: product.category || "Fire Safety Products",
    brand: {
      "@type": "Brand",
      name: BRAND,
    },
    ...(product.price
      ? {
          offers: {
            "@type": "Offer",
            url: product.url ? `${SITE_URL}${product.url}` : undefined,
            priceCurrency: "INR",
            price:
              typeof product.price === "string"
                ? parseFloat(product.price.replace(/[^\d.]/g, "")) || 0
                : product.price,
            priceValidUntil: "2027-12-31",
            availability:
              product.inStock === false
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: {
              "@type": "Organization",
              name: BRAND,
            },
          },
        }
      : {}),
  }),
} as const;
