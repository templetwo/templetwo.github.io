/**
 * The machine-readable layer.
 *
 * Every route builds its head through `pageMeta()` so canonical URLs, absolute
 * OG images, and Twitter cards can never be forgotten one page at a time. The
 * JSON-LD graph is generated from the same `publications` module the Record
 * route renders, so the structured data and the visible page cannot disagree.
 */

import { site } from "@/data/content";
import { publications } from "@/data/publications";

const ORIGIN = site.origin;
const DEFAULT_OG = `${ORIGIN}/images/og-card.jpg`;

export function canonical(path: string): string {
  if (!path || path === "/") return `${ORIGIN}/`;
  return `${ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Absolute URL for any site-relative asset. Crawlers do not resolve relative OG images. */
export function absolute(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${ORIGIN}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export type PageMetaInput = {
  title: string;
  description: string;
  /** Route path, e.g. "/instruments" — used for the canonical link and og:url. */
  path: string;
  /** Site-relative or absolute. Defaults to the temple gate. */
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
};

export function pageMeta({
  title,
  description,
  path,
  image,
  imageAlt = "Temple of Two — the gate where two paths meet",
  type = "website",
}: PageMetaInput) {
  const url = canonical(path);
  const ogImage = image ? absolute(image) : DEFAULT_OG;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:site_name", content: site.name },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: url },
      { property: "og:image", content: ogImage },
      { property: "og:image:alt", content: imageAlt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImage },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

/** Head entry for a JSON-LD block. TanStack Start renders `children` verbatim. */
export function jsonLd(data: unknown) {
  return {
    type: "application/ld+json",
    children: JSON.stringify(data),
  };
}

const ORG_ID = `${ORIGIN}/#org`;
const PERSON_ID = `${ORIGIN}/#anthony`;
const WEBSITE_ID = `${ORIGIN}/#website`;

/**
 * The site-wide identity graph: organization, founder, website.
 *
 * Mounted once in the root route, so it ships in the head of every page — keep
 * it small. The 19-publication CollectionPage used to live here too, which put
 * ~9.7 KB of structured data on pages that say nothing about publications; it
 * now lives in `recordGraph()` on /record, where it is actually about the page.
 *
 * Pass `withRecord` to get the combined graph (used by /record).
 */
export function siteGraph(opts: { withRecord?: boolean } = {}) {
  const graph = siteIdentityGraph();
  if (opts.withRecord) graph["@graph"].push(recordNode());
  return graph;
}

/** The record collection and its articles — for /record only. */
export function recordGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [recordNode()],
  };
}

function siteIdentityGraph(): {
  "@context": string;
  "@graph": Record<string, unknown>[];
} {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: site.name,
        alternateName: "The Temple of Two",
        url: ORIGIN,
        logo: `${ORIGIN}/images/logo-temple-of-two.webp`,
        description:
          "Independent computational research tracing a common architecture of commitment across biological and computational substrates.",
        founder: { "@id": PERSON_ID },
        sameAs: [site.github, site.orcidUrl],
        knowsAbout: [
          "Mitochondrial biology",
          "VDAC1",
          "Computational pharmacology",
          "AI alignment",
          "Phase-modulated attention",
          "Kuramoto oscillators",
          "AI phenomenology",
          "Language model interpretability",
        ],
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: site.founder,
        url: ORIGIN,
        affiliation: { "@id": ORG_ID },
        identifier: site.orcid,
        sameAs: [site.github, site.orcidUrl, site.linkedin],
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: ORIGIN,
        name: `${site.name} — ${site.tagline}`,
        publisher: { "@id": ORG_ID },
        inLanguage: "en",
      },
    ],
  };
}

/** SPDX id → the license's own URL, for schema.org `license`. */
const LICENSE_URL: Record<string, string> = {
  "CC-BY-4.0": "https://creativecommons.org/licenses/by/4.0/",
  "Apache-2.0": "https://www.apache.org/licenses/LICENSE-2.0",
  MIT: "https://opensource.org/license/mit/",
};

/**
 * Authorship as the archive records it. A deposit that lists more than one
 * creator (three do, each naming Claude second) gets every name; the founder
 * resolves to the site's Person node, any other creator becomes a Person
 * node carrying the deposit's own string. Single-creator deposits keep the
 * founder reference, which is what the archive says for them.
 */
function articleAuthor(p: (typeof publications)[number]) {
  if (!p.authors || p.authors.length === 0) return { "@id": PERSON_ID };
  return p.authors.map((name) =>
    /vas?quez/i.test(name) ? { "@id": PERSON_ID } : { "@type": "Person", name },
  );
}

function recordNode(): Record<string, unknown> {
  return {
    "@type": "CollectionPage",
    "@id": `${ORIGIN}/#record`,
    url: `${ORIGIN}/record`,
    name: `${site.name} — Record`,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    hasPart: publications.map((p) => ({
      "@type": "ScholarlyArticle",
      // A DOI is the stable identity; use it as the node @id so the
      // articles can be referenced rather than floating anonymously.
      "@id": `https://doi.org/${p.doi}`,
      url: `https://doi.org/${p.doi}`,
      name: p.title,
      headline: p.headline,
      // schema.org expects a PropertyValue here, not a bare string.
      identifier: {
        "@type": "PropertyValue",
        propertyID: "DOI",
        value: p.doi,
      },
      sameAs: `https://doi.org/${p.doi}`,
      datePublished: p.date,
      // publisher must be an Organization, not a bare venue string —
      // a bare string is what Rich Results flags.
      publisher: { "@type": "Organization", name: p.venue },
      abstract: p.blurb,
      isPartOf: { "@id": `${ORIGIN}/#record` },
      author: articleAuthor(p),
      // Only when the deposit's license has been read; nothing is assumed.
      ...(p.license && LICENSE_URL[p.license] ? { license: LICENSE_URL[p.license] } : {}),
    })),
  };
}

/** Per-page graph node — use on routes that are "about" one thing. */
export function pageGraph(opts: {
  type: "AboutPage" | "CollectionPage" | "WebPage";
  path: string;
  name: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": opts.type,
    "@id": `${canonical(opts.path)}#webpage`,
    url: canonical(opts.path),
    name: opts.name,
    description: opts.description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
  };
}
