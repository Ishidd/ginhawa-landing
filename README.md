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

Stable Android releases automatically update the website. Publish a release in
`Ishidd/ginhawa-landing` with tag `android-v<VERSION>-<BUILD>`, its matching
`ginhawa-<VERSION>-<BUILD>.apk`, and `SHA256SUMS`. Upload both assets before
publishing. The release workflow verifies the public APK bytes and checksum,
then calls the dedicated Vercel deploy hook stored in the repository secret
`VERCEL_RELEASE_DEPLOY_HOOK`. Drafts and prereleases do not trigger it. Duplicate
runs skip deployment when that exact release is already live; Actions also
offers a manual run with an optional forced rebuild. Create future release tags
from current `main` so the workflow is included.

`npm run build` selects the highest published stable Android build and checks
its checksum against GitHub's asset digest. The build refuses older releases
or changed bytes for an already deployed build. GitHub failures or invalid
assets fail the build, retaining the previous live deployment. `vercel.json`
contains the minimum approved build metadata, not an automatically maintained
latest-version record. `/android-release.json` records the actual built release;
the buttons, version and `/download-qr.png` use that same release. Fetching is
build-time only; visitors do not call GitHub, Firebase or AI. No scheduled job
is needed. Standard releases trigger one deployment and no uploaded Actions
artifacts. Run `node --test scripts/*release.test.mjs`, then build and check.

These variables do not enable in-app updates. Firestore OTA approval is a
separate operator action. See `../ginhawa/docs/android-ota-updates.md` for the
Draft → Testing → Stable → OTA workflow and local preparation tool.
