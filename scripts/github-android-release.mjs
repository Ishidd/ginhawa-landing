import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, open, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { verifyAndroidApk } from './android-apk.mjs';
import { publicAndroidRelease } from '../src/data/android-release.mjs';

const repository = 'Ishidd/ginhawa-landing';
const tagPattern = /^android-v(\d+\.\d+\.\d+)-(\d+)$/;
export const liveManifestUrl = 'https://ginhawa-ph.vercel.app/android-release.json';
export function buildNumber(release) {
  const build = Number(release.version.match(/\((\d+)\)$/)?.[1]);
  assert.ok(Number.isSafeInteger(build) && build > 0 && build <= 2100000000, 'Invalid Android build number');
  return build;
}
export function releaseMetadata(release, checksums) {
  const match = release.tag_name?.match(tagPattern);
  assert.ok(match && !release.draft && !release.prerelease && release.published_at, 'A published stable Android release is required');
  assert.equal(String(Number(match[2])), match[2], 'Build numbers must use canonical decimal notation');
  assert.ok(match[1].length <= 64, 'Version name too long');
  const filename = `ginhawa-${match[1]}-${match[2]}.apk`;
  const apk = release.assets?.find(asset => asset.name === filename);
  assert.ok(apk?.state === 'uploaded' && apk.size > 0 && apk.size < 2 ** 31, 'Missing or invalid release APK');
  const checksum = checksums.trim().split(/\r?\n/).map(line => line.match(/^([a-fA-F0-9]{64})\s+\*?([^\s]+)$/)).filter(row => row?.[2] === filename);
  assert.equal(checksum.length, 1, 'SHA256SUMS must contain one matching APK checksum');
  const sha256 = checksum[0][1].toLowerCase();
  assert.equal(apk.digest, `sha256:${sha256}`, 'GitHub APK digest differs from SHA256SUMS');
  const url = `https://github.com/${repository}/releases/download/${release.tag_name}/${filename}`;
  assert.equal(apk.browser_download_url, url, 'Unexpected release asset URL');
  const metadata = publicAndroidRelease({ PUBLIC_APK_URL: url, PUBLIC_APK_SHA256: sha256, PUBLIC_APK_VERSION: `${match[1]} (${match[2]})` });
  buildNumber(metadata);
  return metadata;
}
export function assertNoDowngrade(next, current) {
  if (!current) return;
  assert.ok(buildNumber(next) >= buildNumber(current), 'Refusing to downgrade the website download');
  if (buildNumber(next) === buildNumber(current)) assert.deepEqual(next, current, 'An existing build cannot be replaced with different release bytes');
}
async function response(url, headers = {}) {
  const result = await fetch(url, { headers, signal: AbortSignal.timeout(180_000) });
  assert.ok(result.ok, `Release request failed (${result.status})`);
  assert.equal(new URL(result.url).protocol, 'https:', 'Release downloads must stay on HTTPS');
  return result;
}
export async function readPublishedAndroidRelease({ tag, verifyApk = false, includeNotes = false, verifyAndroidIdentity = false } = {}) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'GINHAWA-website-release', ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }) };
  const api = `https://api.github.com/repos/${repository}/releases`;
  let release;
  if (tag) {
    assert.ok(tagPattern.test(tag), 'Invalid release tag');
    release = await (await response(`${api}/tags/${encodeURIComponent(tag)}`, headers)).json();
  } else {
    const releases = await (await response(`${api}?per_page=100`, headers)).json();
    release = releases.filter(item => !item.draft && !item.prerelease && tagPattern.test(item.tag_name))
      .sort((a, b) => Number(b.tag_name.match(tagPattern)[2]) - Number(a.tag_name.match(tagPattern)[2]))[0];
  }
  assert.ok(release, 'No published stable Android release found');
  const sums = release.assets?.find(asset => asset.name === 'SHA256SUMS');
  assert.ok(sums?.state === 'uploaded' && sums.size > 0 && sums.size <= 4096, 'Missing or oversized SHA256SUMS');
  assert.equal(sums.browser_download_url, `https://github.com/${repository}/releases/download/${release.tag_name}/SHA256SUMS`);
  const checksums = await (await response(sums.browser_download_url)).text();
  assert.ok(checksums.length <= 4096, 'Oversized checksum response');
  const metadata = releaseMetadata(release, checksums);
  if (verifyApk || verifyAndroidIdentity) {
    const directory = verifyAndroidIdentity ? await mkdtemp(join(tmpdir(), 'ginhawa-release-')) : null;
    let file;
    try {
      const path = directory && join(directory, 'release.apk');
      if (path) file = await open(path, 'wx');
      const apk = await response(metadata.url);
      const hash = createHash('sha256');
      const expectedSize = release.assets.find(asset => asset.browser_download_url === metadata.url).size;
      let bytes = 0;
      for await (const chunk of apk.body) {
        bytes += chunk.length;
        assert.ok(bytes <= expectedSize, 'APK exceeds its published size');
        hash.update(chunk);
        if (file) await file.writeFile(chunk);
      }
      assert.equal(bytes, expectedSize, 'Incomplete APK download');
      assert.equal(hash.digest('hex'), metadata.sha256, 'Public APK checksum mismatch');
      if (file) { await file.close(); file = null; }
      if (path) await verifyAndroidApk(path, metadata);
    } finally {
      if (file) await file.close();
      if (directory) await rm(directory, { recursive: true, force: true });
    }
  }
  if (!includeNotes) return metadata;
  const notes = releaseNotes(release.body);
  const history = await readPublishedReleaseNotes(buildNumber(metadata), headers);
  return { ...metadata, releaseNotes: notes,
    releaseNotesByBuild: { ...history, [buildNumber(metadata)]: notes } };
}

export function validateNoteHistory(history, latestBuild) {
  assert.ok(history && typeof history === 'object' && !Array.isArray(history)
    && Object.keys(history).length <= 1000, 'Invalid release-note history');
  for (const [key, notes] of Object.entries(history)) {
    const build = Number(key);
    assert.ok(/^[1-9]\d*$/.test(key) && Number.isSafeInteger(build) && build <= latestBuild
      && Array.isArray(notes) && notes.length >= 1 && notes.length <= 20
      && notes.every(note => typeof note === 'string' && note.trim() && note.length <= 500
        && !/[\x00-\x1f]/.test(note)), 'Invalid release-note history entry');
  }
  // ponytail: keep one phone read and the existing fixed-document identity.
  // Archive history separately if it eventually approaches Firestore's size limit.
  assert.ok(Buffer.byteLength(JSON.stringify(history), 'utf8') <= 500 * 1024,
    'Release-note history needs archival before it can grow further');
  return history;
}

export function publishedReleaseNotes(releases, latestBuild) {
  const history = {};
  for (const release of releases) {
    const match = release.tag_name?.match(tagPattern);
    if (!match || release.draft || release.prerelease || !release.published_at
      || String(Number(match[2])) !== match[2]) continue;
    const build = Number(match[2]);
    if (!Number.isSafeInteger(build) || build < 1 || build > latestBuild) continue;
    const filename = `ginhawa-${match[1]}-${build}.apk`;
    if (!release.assets?.some(asset => asset.name === filename && asset.state === 'uploaded' && asset.size > 0)) continue;
    let notes;
    try { notes = releaseNotes(release.body); }
    catch { continue; } // Legacy releases without readable bullets don't block a verified update.
    if (history[build]) assert.deepEqual(history[build], notes, 'Conflicting release notes for one Android build');
    history[build] = notes;
  }
  return validateNoteHistory(history, latestBuild);
}

export async function readPublishedReleaseNotes(latestBuild, headers, request = response) {
  const releases = [];
  for (let page = 1; page <= 10; page++) {
    const batch = await (await request(`https://api.github.com/repos/${repository}/releases?per_page=100&page=${page}`, headers)).json();
    assert.ok(Array.isArray(batch), 'Invalid GitHub release history');
    releases.push(...batch);
    if (batch.length < 100) return publishedReleaseNotes(releases, latestBuild);
  }
  throw Error('Release history exceeds the supported pagination limit');
}
export async function readLiveRelease() {
  const result = await fetch(liveManifestUrl, { cache: 'no-store', signal: AbortSignal.timeout(30_000) });
  if (result.status === 404) return null; // First deployment before the manifest exists.
  assert.ok(result.ok, `Live release check failed (${result.status})`);
  const release = await result.json();
  return publicAndroidRelease({ PUBLIC_APK_URL: release.url, PUBLIC_APK_SHA256: release.sha256, PUBLIC_APK_VERSION: release.version });
}

// Only user-facing bullet points enter the app, never the draft testing footer.
export function releaseNotes(body) {
  assert.ok(typeof body === 'string' && body.length <= 65536, 'Missing or oversized release notes');
  const notes = [];
  for (const line of body.split(/\r?\n/)) {
    if (notes.length && /^(?:#{1,6}\s|\*\*Draft|\*\*Before)/i.test(line.trim())) break;
    const match = /^[-*]\s+(.+)$/.exec(line.trim());
    if (!match) continue;
    const text = match[1].replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').trim();
    assert.ok(text.length > 0 && text.length <= 500 && !/[\x00-\x1f]/.test(text), 'Invalid release note');
    notes.push(text);
  }
  assert.ok(notes.length >= 1 && notes.length <= 20, 'Provide 1–20 user-facing release-note bullets');
  return notes;
}
