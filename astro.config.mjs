// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // TODO: echte Domain eintragen, sobald verfügbar (wird für sitemap.xml
  // und canonical URLs gebraucht).
  site: 'https://pv-content-hub.example',
  integrations: [react(), mdx(), sitemap()],
  adapter: vercel(),
});