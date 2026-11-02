import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { verifyAndroidApk } from './android-apk.mjs';
const hash = '321a11506a41e737bc4df111d5793715c315d8e09509c0f691000cd1d2f520ec';
test('Android identity validation checks signature, package, build and non-debuggable status', async () => {
 const sdkRoot = await mkdtemp(join(tmpdir(), 'ginhawa-sdk-test-'));
 try {
  await mkdir(join(sdkRoot,'build-tools','36.0.0'),{recursive:true});
  const valid = {signature:`Signer #1 certificate SHA-256 digest: ${hash}`,badging:"package: name='com.ginhawa.app' versionCode='13' versionName='1.0.0'"};
  const run = fixture => async (_, args) => ({stdout:args.includes('verify')?fixture.signature:fixture.badging});
  await verifyAndroidApk('/test.apk',{version:'1.0.0 (13)'},{sdkRoot,run:run(valid)});
  for (const signature of [`V2 Signer: certificate SHA-256 digest: ${hash}`, `V3.0 Signer: certificate SHA-256 digest: ${hash}`, `V2 Signer: certificate SHA-256 digest: ${hash}\nV3.0 Signer: certificate SHA-256 digest: ${hash}`]) await verifyAndroidApk('/test.apk',{version:'1.0.0 (13)'},{sdkRoot,run:run({...valid,signature})});
  for (const fixture of [{...valid,signature:valid.signature.replace(hash,'a'.repeat(64))},{...valid,signature:''},{...valid,signature:valid.signature+'\nSigner #2 certificate SHA-256 digest: '+'b'.repeat(64)},{...valid,badging:valid.badging.replace('com.ginhawa.app','other.app')},{...valid,badging:valid.badging.replace("versionCode='13'","versionCode='12'")},{...valid,badging:valid.badging.replace("versionName='1.0.0'","versionName='2.0.0'")},{...valid,badging:valid.badging+'\napplication-debuggable'}]) await assert.rejects(verifyAndroidApk('/test.apk',{version:'1.0.0 (13)'},{sdkRoot,run:run(fixture)}));
  await assert.rejects(verifyAndroidApk('/test.apk',{version:'1.0.0 (13)'},{sdkRoot,run:async()=>{throw Error('Invalid APK');}}));
 } finally {await rm(sdkRoot,{recursive:true,force:true});}
});
