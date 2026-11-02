import assert from 'node:assert/strict';
import { readFile, appendFile } from 'node:fs/promises';
import { readReleaseDocument, syncAndroidRelease, releaseAccessToken } from './firestore-android-release.mjs';
import { buildNumber, assertNoDowngrade, readLiveRelease, readPublishedAndroidRelease } from './github-android-release.mjs';

const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, 'utf8'));
if (process.env.GITHUB_EVENT_NAME === 'release') {
  assert.ok(event.action === 'published' && event.release && !event.release.draft && !event.release.prerelease, 'Only published stable release events are accepted');
  assert.equal(process.env.GITHUB_REF, 'refs/tags/' + event.release.tag_name, 'Release event/tag mismatch');
}
const candidate = await readPublishedAndroidRelease({ tag: event.release?.tag_name, verifyApk: true, verifyAndroidIdentity: true, includeNotes: true });
const { releaseNotes, ...release } = candidate;
const current = await readLiveRelease();
const token = releaseAccessToken();
const document = await readReleaseDocument(token);
if (current && buildNumber(release) < buildNumber(current)) {
  console.log('Ignoring an older release; website and OTA metadata remain unchanged.');
  process.exit(0);
}
assertNoDowngrade(release, current);
const otaStatus = await syncAndroidRelease(candidate, { token, document });
if (otaStatus === 'stale') {
  console.log('Ignoring an older release; Firestore already has a newer Android build.');
  process.exit(0);
}
console.log(`Firestore Android release: ${otaStatus}.`);
const force = event.inputs?.force === true || event.inputs?.force === 'true';
if (JSON.stringify(release) === JSON.stringify(current) && !force) {
  console.log(`Android ${release.version} is already live; no deployment needed.`);
} else {
  const hook = process.env.VERCEL_RELEASE_DEPLOY_HOOK;
  assert.ok(/^https:\/\/api\.vercel\.com\/v1\/integrations\/deploy\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/.test(hook ?? ''), 'Missing or invalid Vercel release deploy hook');
  const response = await fetch(hook + '?buildCache=true', { method: 'POST', signal: AbortSignal.timeout(30_000) });
  assert.ok(response.ok, `Vercel deployment trigger failed (${response.status})`);
  console.log(`Triggered website rebuild for verified Android ${release.version}.`);
}
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `Verified published Android ${release.version}, public APK download and SHA-256. Website download and QR use this release. Firestore OTA metadata: ${otaStatus}. Existing required-update policy was preserved.\n`);
