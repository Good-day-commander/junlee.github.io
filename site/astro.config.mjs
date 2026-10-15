// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Static site for GitHub Pages. CI uploads site/dist/public, so the build
// emits there instead of Astro's default ./dist.
export default defineConfig({
  site: 'https://hyeongjunlee.me',
  output: 'static',
  outDir: './dist/public',
  trailingSlash: 'ignore',
  integrations: [react(), sitemap()],
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
