// This build-time switch controls only the official website. Never read the
// in-app Firestore approval here: the two release approvals are independent.
export function publicAndroidRelease(env) {
  const url = (env.PUBLIC_APK_URL || '').trim();
  if (!url) return null;
  const hash = (env.PUBLIC_APK_SHA256 || '').trim().toLowerCase();
  const version = (env.PUBLIC_APK_VERSION || '').trim();
  const pinnedAsset = /^https:\/\/github\.com\/Ishidd\/ginhawa-landing\/releases\/download\/[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]*\.apk$/;
  if (!pinnedAsset.test(url) || !/^[a-f0-9]{64}$/.test(hash) ||
      !/^\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)? \(\d+\)$/.test(version)) {
    throw new Error('Public Android release needs a pinned HTTPS GitHub APK, SHA-256, and version label such as 1.0.0 (9).');
  }
  return { url, sha256: hash, version };
}
