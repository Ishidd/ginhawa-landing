# ginhawa landing page

Cinematic student wellbeing landing page built with Astro, React Three Fiber, Three.js, and GSAP. Includes real app screenshots, Chika, an interactive guidance orb, FAQ, support resources, and legal pages.

## Development

Requires Node.js 24. Run `npm ci`, then `npm run dev`.

## Verify

Run `npm run build` and `npm run check`. Generated output is in `dist/`.

## Vercel

Project: `ginhawa`. Framework: Astro. Install: `npm ci`. Build: `npm run build`. Output: `dist`. Node.js: 24.x.

Set `SITE_URL=https://ginhawa.vercel.app` for production canonical and social metadata. `vercel.json` includes the deployment headers and content security policy.

Copy `.env.example` only when configuring optional features. Firebase web configuration is used exclusively by account deletion. Never commit local environment files, Admin SDK credentials, or access tokens. Leave `PUBLIC_APK_URL` empty until a verified Android release exists; the QR and download action appear automatically when configured.

## Source control

Source, required public assets, font licenses, dependency lockfile, verification scripts, and deployment configuration are tracked. Dependencies, builds, local environment files, review captures, tool state, and original JPEG screenshot duplicates are ignored. Local copies remain on disk.

The separately maintained admin portal is deployed at `https://ginhawa-admin.vercel.app`.
