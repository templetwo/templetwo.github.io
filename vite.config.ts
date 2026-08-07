import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Static build. The Temple deploys to GitHub Pages, which serves files and
 * nothing else — so every route is prerendered to HTML at build time and the
 * contact form posts to the Cloudflare Worker in `contact-worker/`.
 *
 * Removed from the generator scaffold: the PGLite bootstrap plugin, the OAuth
 * popup middleware, and the Nitro/Vercel server preset. Nothing on this site is
 * gated, so none of it was reachable.
 *
 * Instrument detail pages are enumerated from the content layer so a new
 * instrument is prerendered without touching this file.
 */
async function instrumentPaths(): Promise<string[]> {
  const { instruments } = await import("./src/data/content");
  return instruments.map((i) => `/instruments/${i.slug}`);
}

export default defineConfig(async () => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart({
      target: "static",
      prerender: {
        enabled: true,
        crawlLinks: true,
        // Seed the crawler with everything not reachable by a static <a>.
        pages: [
          "/",
          "/inquiry",
          "/instruments",
          "/record",
          "/writings",
          "/co-creation",
          "/about",
          ...(await instrumentPaths()),
        ].map((path) => ({ path })),
      },
    }),
    viteReact(),
  ],
}));
