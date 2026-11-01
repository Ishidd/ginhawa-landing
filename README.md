# ginhawa landing page

Cinematic student wellbeing landing page built with Astro, React Three Fiber, Three.js, and GSAP. Includes real app screenshots, Chika, an interactive guidance orb, FAQ, support resources, and legal pages.

## Development

Requires Node.js 24. Run `npm ci`, then `npm run dev`.

## Verify

Run `npm run build` and `npm run check`. Generated output is in `dist/`.

## Vercel

Project: `ginhawa`. Framework: Astro. Install: `npm ci`. Build: `npm run build`. Output: `dist`. Node.js: 24.x.

Set `SITE_URL=https://ginhawa-ph.vercel.app` for production canonical and social metadata. `vercel.json` includes the deployment headers and content security policy.

Copy `.env.example` only when configuring optional features. Firebase web configuration is used exclusively by account deletion. Never commit local environment files, Admin SDK credentials, or access tokens. Leave `PUBLIC_APK_URL` empty until a verified Android release exists; the QR and download action appear automatically when configured.

## Source control

Source, required public assets, font licenses, dependency lockfile, verification scripts, and deployment configuration are tracked. Dependencies, builds, local environment files, review captures, tool state, and original JPEG screenshot duplicates are ignored. Local copies remain on disk.

The separately maintained admin portal is deployed at `https://ginhawa-admin.vercel.app`.

The originally requested `ginhawa.vercel.app` alias was rejected by Vercel as already in use. The current production address is `https://ginhawa-ph.vercel.app`.
# Android release controls

Public downloads use build-time `PUBLIC_APK_URL`, `PUBLIC_APK_SHA256` and
`PUBLIC_APK_VERSION` (for example `1.0.0 (9)`). The URL must point to a
tag-specific APK asset in `Ishidd/ginhawa-landing`. Leave the URL empty to retain
coming soon. Publish this website change only after Stable approval.

The approved production release is recorded in `vercel.json` under `build.env`.
These three values are public download metadata, never credentials. Update them
together after verifying the signed APK for each separately approved Stable
release. Vercel rebuilds the page and `/download-qr.png` from the same URL; the
QR can be saved from the download section. For local verification, set the same
three environment variables before building. Run
`node --test scripts/android-release.test.mjs`, then build and check.

These variables do not enable in-app updates. Firestore OTA approval is a
separate operator action. See `../ginhawa/docs/android-ota-updates.md` for the
Draft → Testing → Stable → OTA workflow and local preparation tool.
