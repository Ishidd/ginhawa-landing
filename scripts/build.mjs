import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { publicAndroidRelease } from '../src/data/android-release.mjs';
import { assertNoDowngrade, readLiveRelease, readPublishedAndroidRelease } from './github-android-release.mjs';

const release = await readPublishedAndroidRelease();
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
assertNoDowngrade(release, publicAndroidRelease(config.build.env));
assertNoDowngrade(release, await readLiveRelease());
console.log(`Building website for verified Android ${release.version}`);
const result = spawnSync(process.execPath, [resolve('node_modules/astro/bin/astro.mjs'), 'build'], {
  stdio: 'inherit',
  env: { ...process.env, PUBLIC_APK_URL: release.url, PUBLIC_APK_SHA256: release.sha256, PUBLIC_APK_VERSION: release.version },
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
