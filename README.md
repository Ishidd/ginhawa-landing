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

Stable Android releases use `.github/workflows/android-release-website.yml` to synchronize in-app update metadata and refresh the website. Publish in `Ishidd/ginhawa-landing` with tag `android-v<VERSION>-<BUILD>`, its matching `ginhawa-<VERSION>-<BUILD>.apk`, user-facing release-note bullets and `SHA256SUMS`. Upload assets before publishing. Drafts and prereleases are ignored. Create release tags from current `main` so the workflow is included.

The workflow verifies the entire public APK download, GitHub asset digest and checksum, then conditionally updates Firestore `appReleases/androidStable` and triggers the dedicated Vercel hook in `VERCEL_RELEASE_DEPLOY_HOOK`. A separate keyless Google identity is required; activation status, exact permission scope and setup are documented in [Android release synchronization](docs/android-release-sync.md).

New stable builds automatically enable OTA while preserving the existing required-update policy. Duplicate runs preserve operator pauses, notes and policy without a write; older releases cannot downgrade the website or app, and changed bytes for an existing build are rejected. A concurrent metadata edit fails safely rather than being overwritten. A website-hook failure can be retried without republishing Firestore metadata. Manual Actions runs on `main` retry the latest published stable build, with an optional forced website rebuild.

`npm run build` selects the highest published stable Android build and checks its checksum against GitHub's asset digest. It refuses older releases or changed bytes for an already deployed build. GitHub failures or invalid assets retain the previous website deployment. `vercel.json` contains the minimum approved build metadata; `/android-release.json` records the actual built release used by the buttons and QR code. Website visitors do not call GitHub, Firebase or AI. This event-based automation adds no scheduled job or dependency installation.

Run `node --test scripts/android-release.test.mjs scripts/github-android-release.test.mjs scripts/firestore-android-release.test.mjs scripts/android-apk.test.mjs`, then build and check. The app offers the new version on its next startup or manual update check; Android still asks the user to approve installation. App feature rules and other backend deployments remain separate from release metadata synchronization.
