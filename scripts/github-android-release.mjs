import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { publicAndroidRelease } from '../src/data/android-release.mjs';

const repository = 'Ishidd/ginhawa-landing';
const tagPattern = /^android-v(\d+\.\d+\.\d+)-(\d+)$/;
export const liveManifestUrl = 'https://ginhawa-ph.vercel.app/android-release.json';
export function buildNumber(release) {
  const build = Number(release.version.match(/\((\d+)\)$/)?.[1]);
  assert.ok(Number.isSafeInteger(build) && build > 0, 'Invalid Android build number');
  return build;
}
export function releaseMetadata(release, checksums) {
  const match = release.tag_name?.match(tagPattern);
  assert.ok(match && !release.draft && !release.prerelease && release.published_at, 'A published stable Android release is required');
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
export async function readPublishedAndroidRelease({ tag, verifyApk = false } = {}) {
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
  if (verifyApk) {
    const apk = await response(metadata.url);
    const hash = createHash('sha256');
    const expectedSize = release.assets.find(asset => asset.browser_download_url === metadata.url).size;
    let bytes = 0;
    for await (const chunk of apk.body) {
      bytes += chunk.length;
      assert.ok(bytes <= expectedSize, 'APK exceeds its published size');
      hash.update(chunk);
    }
    assert.equal(bytes, expectedSize, 'Incomplete APK download');
    assert.equal(hash.digest('hex'), metadata.sha256, 'Public APK checksum mismatch');
  }
  return metadata;
}
export async function readLiveRelease() {
  const result = await fetch(liveManifestUrl, { cache: 'no-store', signal: AbortSignal.timeout(30_000) });
  if (result.status === 404) return null; // First deployment before the manifest exists.
  assert.ok(result.ok, `Live release check failed (${result.status})`);
  const release = await result.json();
  return publicAndroidRelease({ PUBLIC_APK_URL: release.url, PUBLIC_APK_SHA256: release.sha256, PUBLIC_APK_VERSION: release.version });
}
