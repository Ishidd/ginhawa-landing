import assert from 'node:assert/strict';
import { publicAndroidRelease } from '../src/data/android-release.mjs';
import { buildNumber } from './github-android-release.mjs';

export const releaseDocument = 'projects/ginhawa-82218/databases/(default)/documents/appReleases/androidStable';
const endpoint = 'https://firestore.googleapis.com/v1/';
const workflow = 'Ishidd/ginhawa-landing/.github/workflows/android-release-website.yml@';
const emulators = ['FIRESTORE_EMULATOR_HOST', 'FIREBASE_AUTH_EMULATOR_HOST', 'FIREBASE_DATABASE_EMULATOR_HOST'];

export function releaseAccessToken(env = process.env) {
  assert.ok(env.GITHUB_ACTIONS === 'true' && env.GITHUB_REPOSITORY === 'Ishidd/ginhawa-landing'
    && env.GITHUB_REPOSITORY_ID === '1441560524' && env.GITHUB_REPOSITORY_OWNER_ID === '149577279'
    && env.GITHUB_WORKFLOW_REF === workflow + env.GITHUB_REF
    && ((env.GITHUB_EVENT_NAME === 'release' && /^refs\/tags\/android-v\d+\.\d+\.\d+-[1-9]\d*$/.test(env.GITHUB_REF))
      || (env.GITHUB_EVENT_NAME === 'workflow_dispatch' && env.GITHUB_REF === 'refs/heads/main'))
    && !emulators.some(key => env[key]) && !env.GOOGLE_APPLICATION_CREDENTIALS && !env.FIREBASE_TOKEN,
    'Release workflow identity or credential configuration rejected');
  const token = env.GINHAWA_RELEASE_ACCESS_TOKEN;
  assert.ok(typeof token === 'string' && token.length > 0 && !/\s/.test(token), 'Short-lived release access token required');
  return token;
}

const decode = value => 'integerValue' in value ? Number(value.integerValue)
  : 'stringValue' in value ? value.stringValue : 'booleanValue' in value ? value.booleanValue
  : 'arrayValue' in value ? (value.arrayValue.values ?? []).map(decode) : null;
const encode = value => typeof value === 'boolean' ? { booleanValue: value }
  : typeof value === 'number' ? { integerValue: String(value) }
  : typeof value === 'string' ? { stringValue: value }
  : { arrayValue: { values: value.map(encode) } };
export const encodeRelease = data => Object.fromEntries(Object.entries(data).map(([key, value]) => [key, encode(value)]));

export function currentRelease(document) {
  assert.ok(document?.name === releaseDocument && typeof document.updateTime === 'string' && document.updateTime, 'Missing release document identity or concurrency token');
  const data = Object.fromEntries(Object.entries(document.fields ?? {}).map(([key, value]) => [key, decode(value)]));
  assert.ok(data.schemaVersion === 1 && data.channel === 'stable' && data.packageName === 'com.ginhawa.app'
    && typeof data.otaEnabled === 'boolean' && typeof data.mandatory === 'boolean'
    && Number.isInteger(data.buildNumber) && data.buildNumber > 0 && data.buildNumber <= 2100000000
    && Number.isInteger(data.minSupportedBuildNumber) && data.minSupportedBuildNumber >= 1 && data.minSupportedBuildNumber <= data.buildNumber
    && Array.isArray(data.releaseNotes) && data.releaseNotes.length >= 1 && data.releaseNotes.length <= 20
    && data.releaseNotes.every(note => typeof note === 'string' && note.trim() && note.length <= 500), 'Invalid current Android release policy');
  const metadata = publicAndroidRelease({ PUBLIC_APK_URL: data.apkUrl, PUBLIC_APK_SHA256: data.sha256, PUBLIC_APK_VERSION: `${data.versionName} (${data.buildNumber})` });
  assert.equal(metadata.url, `https://github.com/Ishidd/ginhawa-landing/releases/download/android-v${data.versionName}-${data.buildNumber}/ginhawa-${data.versionName}-${data.buildNumber}.apk`);
  return data;
}

export function planRelease(candidate, document) {
  const current = currentRelease(document);
  const next = publicAndroidRelease({ PUBLIC_APK_URL: candidate.url, PUBLIC_APK_SHA256: candidate.sha256, PUBLIC_APK_VERSION: candidate.version });
  const number = buildNumber(next);
  if (number < current.buildNumber) return { status: 'stale' };
  if (number === current.buildNumber) {
    assert.deepEqual(next, { url: current.apkUrl, sha256: current.sha256.toLowerCase(), version: `${current.versionName} (${current.buildNumber})` }, 'An existing OTA build cannot be replaced');
    // Preserve manual pauses, notes, and required-update policy on reruns.
    return { status: 'unchanged' };
  }
  const versionName = next.version.match(/^(\d+\.\d+\.\d+) \(\d+\)$/)?.[1];
  assert.ok(versionName && versionName.length <= 64 && next.url === `https://github.com/Ishidd/ginhawa-landing/releases/download/android-v${versionName}-${number}/ginhawa-${versionName}-${number}.apk`, 'Release identity mismatch');
  assert.ok(Array.isArray(candidate.releaseNotes) && candidate.releaseNotes.length >= 1 && candidate.releaseNotes.length <= 20
    && candidate.releaseNotes.every(note => typeof note === 'string' && note.trim() && note.length <= 500), 'Invalid user-facing update notes');
  return { status: 'updated', data: { schemaVersion: 1, channel: 'stable', otaEnabled: true, packageName: 'com.ginhawa.app',
    versionName, buildNumber: number, apkUrl: next.url, sha256: next.sha256, releaseNotes: candidate.releaseNotes,
    mandatory: current.mandatory, minSupportedBuildNumber: current.minSupportedBuildNumber } };
}

export async function readReleaseDocument(token, request = fetch) {
  const response = await request(endpoint + releaseDocument, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(30000) });
  assert.ok(response.ok, `Release metadata read failed (${response.status}); existing document required`);
  const document = await response.json();
  currentRelease(document);
  return document;
}

export async function syncAndroidRelease(candidate, { token, document, request = fetch }) {
  const plan = planRelease(candidate, document);
  if (plan.status !== 'updated') return plan.status;
  const response = await request(endpoint + 'projects/ginhawa-82218/databases/(default)/documents:commit', {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(30000),
    body: JSON.stringify({ writes: [{ update: { name: releaseDocument, fields: encodeRelease(plan.data) },
      updateMask: { fieldPaths: Object.keys(plan.data) }, currentDocument: { updateTime: document.updateTime } }] }),
  });
  assert.ok(response.ok, `Release metadata update failed (${response.status}); recheck policy and retry`);
  const verified = currentRelease(await readReleaseDocument(token, request));
  for (const [key, value] of Object.entries(plan.data)) assert.deepEqual(verified[key], value, `Release read-back mismatch: ${key}`);
  return 'updated';
}
