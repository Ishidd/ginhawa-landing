import test from 'node:test';
import assert from 'node:assert/strict';
import { publicAndroidRelease } from '../src/data/android-release.mjs';

const approved = {
  PUBLIC_APK_URL: 'https://github.com/Ishidd/ginhawa-landing/releases/download/android-v1.0.0-9/ginhawa-1.0.0-9.apk',
  PUBLIC_APK_SHA256: 'a'.repeat(64), PUBLIC_APK_VERSION: '1.0.0 (9)',
};
test('website switch is off by default and independent of OTA metadata', () => {
  assert.equal(publicAndroidRelease({ otaEnabled: true }), null);
  assert.equal(publicAndroidRelease({ ...approved, otaEnabled: false }).url, approved.PUBLIC_APK_URL);
});
test('only pinned GitHub APKs with a checksum and version can be public', () => {
  for (const url of ['http://github.com/Ishidd/ginhawa-landing/releases/download/v9/a.apk',
    'https://github.com/Ishidd/ginhawa-landing/releases/latest/download/a.apk',
    'https://github.com/other/repo/releases/download/v9/a.apk',
    approved.PUBLIC_APK_URL + '?token=private', approved.PUBLIC_APK_URL + '#x',
    approved.PUBLIC_APK_URL.replace('github.com', 'github.com.evil.test')]) {
    assert.throws(() => publicAndroidRelease({ ...approved, PUBLIC_APK_URL: url }));
  }
  assert.throws(() => publicAndroidRelease({ ...approved, PUBLIC_APK_SHA256: '' }));
  assert.throws(() => publicAndroidRelease({ ...approved, PUBLIC_APK_VERSION: '' }));
  assert.equal(publicAndroidRelease(approved).sha256, 'a'.repeat(64));
});
