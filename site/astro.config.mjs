// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Static site for GitHub Pages. CI uploads site/dist/public, so the build
// emits there instead of Astro's default ./dist.

// Round 3 folded /publications and /record into the CV. Static output emits
// a meta-refresh page at each old address that lands on the CV anchor.
const redirects = {
  '/publications': '/cv/#publications',
  '/record': '/cv/#talks',
};
const redirected = new Set(Object.keys(redirects));

export default defineConfig({
  site: 'https://hyeongjunlee.me',
  output: 'static',
  outDir: './dist/public',
  trailingSlash: 'ignore',
  redirects,
  integrations: [
    react(),
    sitemap({
      // Redirect stubs are not pages; keep them out of the sitemap.
      filter: (page) => !redirected.has(new URL(page).pathname.replace(/\/+$/, '')),
    }),
  ],
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Never inline fonts as data: URLs: an inlined subset is downloaded with
      // every page's CSS whether or not a glyph needs it (22 KB of the home's
      // CSS was base64 font). Other small assets keep Vite's default.
      assetsInlineLimit: (filePath) => (/\.woff2?$/i.test(filePath) ? false : undefined),
    },
  },
});
