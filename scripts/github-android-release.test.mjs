import test from 'node:test';
import assert from 'node:assert/strict';
import { releaseMetadata, assertNoDowngrade } from './github-android-release.mjs';

test('published release metadata, integrity, and monotonic build checks', () => {
  const hash = 'a'.repeat(64);
  const filename = 'ginhawa-1.0.0-12.apk';
  const release = {
    tag_name: 'android-v1.0.0-12', draft: false, prerelease: false, published_at: '2026-11-02T10:20:37Z',
    assets: [{ name: filename, state: 'uploaded', size: 1234, digest: `sha256:${hash}`,
      browser_download_url: `https://github.com/Ishidd/ginhawa-landing/releases/download/android-v1.0.0-12/${filename}` }],
  };
  const sums = `${hash}  ${filename}\n`;
  const metadata = releaseMetadata(release, sums);
  assert.equal(metadata.version, '1.0.0 (12)');
  assert.equal(metadata.sha256, hash);
  for (const change of [{ draft: true }, { prerelease: true }, { published_at: null }, { tag_name: 'v12' }, { tag_name: 'android-v1.0.0-0' }]) {
    assert.throws(() => releaseMetadata({ ...release, ...change }, sums));
  }
  for (const change of [{ state: 'new' }, { digest: `sha256:${'b'.repeat(64)}` }, { size: 0 }, { size: 2 ** 31 }, { browser_download_url: 'https://example.com/app.apk' }]) {
    assert.throws(() => releaseMetadata({ ...release, assets: [{ ...release.assets[0], ...change }] }, sums));
  }
  for (const invalid of ['', `${hash}  other.apk`, sums + sums]) assert.throws(() => releaseMetadata(release, invalid));
  assertNoDowngrade(metadata, null);
  assertNoDowngrade(metadata, metadata);
  assertNoDowngrade(metadata, { ...metadata, version: '1.0.0 (11)' });
  assert.throws(() => assertNoDowngrade(metadata, { ...metadata, version: '1.0.0 (13)' }));
  assert.throws(() => assertNoDowngrade(metadata, { ...metadata, sha256: 'b'.repeat(64) }));
});
