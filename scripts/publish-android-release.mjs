import assert from 'node:assert/strict';
import { readFile, appendFile } from 'node:fs/promises';
import { assertNoDowngrade, readLiveRelease, readPublishedAndroidRelease } from './github-android-release.mjs';

const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, 'utf8'));
const release = await readPublishedAndroidRelease({ tag: event.release?.tag_name, verifyApk: true });
const current = await readLiveRelease();
assertNoDowngrade(release, current);
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
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `Verified published Android ${release.version}, public APK download and SHA-256. Website download and QR use this release. Firebase OTA settings were not changed.\n`);
