// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// @see https://photovoltaikaktuell.vercel.app
export default defineConfig({
  site: 'https://photovoltaikaktuell.vercel.app',
  integrations: [react(), mdx(), sitemap()],
  adapter: vercel(),
});
