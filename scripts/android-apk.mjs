import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const releaseCertificate = '321a11506a41e737bc4df111d5793715c315d8e09509c0f691000cd1d2f520ec';
export async function verifyAndroidApk(path, metadata, { sdkRoot = process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT, run = promisify(execFile) } = {}) {
  assert.ok(sdkRoot, 'Android SDK is required to approve an APK for in-app updates');
  const versions = (await readdir(join(sdkRoot, 'build-tools'))).filter(version => /^\d+\.\d+\.\d+$/.test(version))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  assert.ok(versions.length, 'Android build tools are missing');
  const tools = join(sdkRoot, 'build-tools', versions.at(-1));
  const java = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'java.exe' : 'java') : 'java';
  const { stdout: signature } = await run(java, ['-jar', join(tools, 'lib', 'apksigner.jar'), 'verify', '--print-certs', path], { timeout: 60000 });
  const fingerprints = [...signature.matchAll(/^Signer #\d+ certificate SHA-256 digest: ([a-fA-F0-9]{64})$/gm)].map(match => match[1].toLowerCase());
  assert.deepEqual(fingerprints, [releaseCertificate], 'APK must use the existing GINHAWA release certificate');
  const { stdout: badging } = await run(join(tools, process.platform === 'win32' ? 'aapt.exe' : 'aapt'), ['dump', 'badging', path], { timeout: 30000 });
  const identity = /^package: name='([^']+)' versionCode='([^']+)' versionName='([^']+)'/m.exec(badging);
  const version = /^(\d+\.\d+\.\d+) \((\d+)\)$/.exec(metadata.version);
  assert.ok(identity && version, 'Missing Android package identity');
  assert.deepEqual(identity.slice(1), ['com.ginhawa.app', version[2], version[1]], 'APK package/build/version differs from the published release');
  assert.ok(!/^application-debuggable\s*$/m.test(badging), 'Debug APKs cannot become stable updates');
}
