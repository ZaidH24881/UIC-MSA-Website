import { defineConfig } from 'astro/config';
import { rm } from 'node:fs/promises';
import { donations } from './src/data/site.ts';
export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || undefined,
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  integrations: [
    {
      name: 'current-donation-artwork',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          if (!donations.enabled || donations.methods.length === 0) {
            await rm(new URL('assets/community-donations.png', dir), { force: true });
          }
        },
      },
    },
  ],
});
