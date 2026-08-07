import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { SiteHeader } from "@/components/temple/site-header";
import { SiteFooter } from "@/components/temple/site-footer";
import { site } from "@/data/content";
import { pageMeta, jsonLd, siteGraph } from "@/lib/seo";
import appCss from "../styles.css?url";

/**
 * The mark, inline. The previous favicon was a 670 KB JPEG photograph — this is
 * ~400 bytes, scales, and needs no network request.
 */
const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%230b0d12' stroke='%23c9955a' stroke-width='6'/%3E%3Ccircle cx='50' cy='50' r='18' fill='none' stroke='%23c9955a' stroke-width='4'/%3E%3Cline x1='50' y1='5' x2='50' y2='32' stroke='%23c9955a' stroke-width='4'/%3E%3Cline x1='50' y1='68' x2='50' y2='95' stroke='%23c9955a' stroke-width='4'/%3E%3Cline x1='5' y1='50' x2='32' y2='50' stroke='%238a9eb2' stroke-width='4'/%3E%3Cline x1='68' y1='50' x2='95' y2='50' stroke='%238a9eb2' stroke-width='4'/%3E%3C/svg%3E";

const rootMeta = pageMeta({
  title: `${site.name} — ${site.tagline}`,
  description:
    "Independent inquiry and an ongoing case study in human–AI governed co-creation and trust. Faith opens the inquiry. Rigor governs the claim.",
  path: "/",
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0b0d12" },
      { name: "author", content: site.founder },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1",
      },
      ...rootMeta.meta,
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=IBM+Plex+Mono:wght@400;500&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;1,400&display=swap",
      },
      { rel: "icon", href: FAVICON, type: "image/svg+xml" },
      {
        rel: "alternate",
        type: "text/plain",
        href: "/llms.txt",
        title: "For machine readers",
      },
    ],
    // Site-wide structured data, generated from the same publications module
    // the Record route renders. Per-route pages add their own WebPage node.
    scripts: [jsonLd(siteGraph())],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en" className="antialiased">
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-dvh flex-col bg-bg text-fg">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
        <Scripts />
      </body>
    </html>
  );
}
