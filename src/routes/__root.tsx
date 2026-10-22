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
 * The icon set is the seal's line glyph in brass on the void (public/brand,
 * public/favicon.*). The ico carries 16/32/48 for the browsers that still ask
 * for it; the SVG scales everywhere else; the PNGs are Chrome renders of the
 * same glyph at exact sizes.
 */
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
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      {
        rel: "icon",
        href: "/favicon-32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        rel: "icon",
        href: "/favicon-16.png",
        type: "image/png",
        sizes: "16x16",
      },
      {
        rel: "icon",
        href: "/icon-512.png",
        type: "image/png",
        sizes: "512x512",
      },
      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png",
        sizes: "180x180",
      },
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
