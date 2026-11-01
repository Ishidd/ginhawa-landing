import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || undefined,
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  vite: {
    ssr: { external: ['qrcode'] },
    build: { assetsInlineLimit: 0 },
  },
});
