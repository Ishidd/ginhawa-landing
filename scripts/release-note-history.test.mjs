import test from 'node:test';
import assert from 'node:assert/strict';
import { publishedReleaseNotes, readPublishedReleaseNotes, validateNoteHistory } from './github-android-release.mjs';
import { releaseDocument, encodeRelease, currentRelease, planRelease, syncAndroidRelease } from './firestore-android-release.mjs';

const published = (build, body = `- Changes in ${build}.`) => ({
  tag_name: `android-v1.0.0-${build}`, draft: false, prerelease: false,
  published_at: '2026-11-03T00:00:00Z', body,
  assets: [{name: `ginhawa-1.0.0-${build}.apk`, state: 'uploaded', size: 100}],
});
const candidate = (build = 13) => ({version: `1.0.0 (${build})`, sha256: 'a'.repeat(64),
  url: `https://github.com/Ishidd/ginhawa-landing/releases/download/android-v1.0.0-${build}/ginhawa-1.0.0-${build}.apk`,
  releaseNotes: [`Changes in ${build}.`]});
const data = (patch = {}) => ({schemaVersion: 1, channel: 'stable', otaEnabled: true, packageName: 'com.ginhawa.app',
  versionName: '1.0.0', buildNumber: 12, apkUrl: candidate(12).url, sha256: candidate().sha256,
  releaseNotes: ['Current approved notes.'], mandatory: true, minSupportedBuildNumber: 10, ...patch});
const document = (patch = {}) => ({name: releaseDocument, updateTime: '2026-11-03T00:00:00Z', fields: encodeRelease(data(patch))});

test('history includes only published stable Android builds up to the approved target', () => {
  const releases = [published(13), published(12), published(11),
    published(14), {...published(10), draft: true}, {...published(9), prerelease: true},
    {...published(8), published_at: null}, {...published(7), assets: []},
    published(6, 'Legacy release without bullets'), {...published(5), tag_name: 'android-v1.0.0-05'},
    {...published(4), tag_name: 'website-v4'}];
  assert.deepEqual(publishedReleaseNotes(releases, 13), {
    11: ['Changes in 11.'], 12: ['Changes in 12.'], 13: ['Changes in 13.'],
  });
  assert.throws(() => publishedReleaseNotes([published(12), published(12, '- Conflicting notes.')], 13), /Conflicting/);
});

test('history pagination does not silently miss older Android releases', async () => {
  const requests = [];
  const history = await readPublishedReleaseNotes(13, {Accept:'test'}, async (url, headers) => {
    requests.push(url); assert.equal(headers.Accept, 'test');
    return {json: async () => requests.length === 1
      ? Array.from({length: 100}, (_, i) => ({tag_name: `website-${i}`}))
      : [published(12), published(11)]};
  });
  assert.equal(requests.length, 2);
  assert.ok(requests[1].endsWith('per_page=100&page=2'));
  assert.deepEqual(history, {11:['Changes in 11.'],12:['Changes in 12.']});
  await assert.rejects(readPublishedReleaseNotes(13, {}, async()=>({json:async()=>({})})), /Invalid GitHub/);
  await assert.rejects(readPublishedReleaseNotes(13, {}, async()=>({json:async()=>Array(100).fill({tag_name:'other'})})), /pagination limit/);
});

test('history validation bounds display data and keeps the single document below its size limit', () => {
  for (const history of [null, [], {'01':['Bad key']}, {0:['Bad key']}, {14:['Future']}, {12:[]},
    {12:['']}, {12:['x'.repeat(501)]}, {12:['bad\u0000note']}]) {
    assert.throws(() => validateNoteHistory(history, 13));
  }
  const oversized = Object.fromEntries(Array.from({length:200}, (_, i)=>[i+1, Array(20).fill('x'.repeat(500))]));
  assert.throws(() => validateNoteHistory(oversized, 200), /archival/);
});

test('new release merges approved history, backfills old notes, and preserves policy', () => {
  const next = {...candidate(), releaseNotesByBuild: {11:['GitHub older notes'],12:['GitHub current notes'],13:['Stale latest copy']}};
  const plan = planRelease(next, document({releaseNotesByBuild:{11:['Previously approved older notes']}}));
  assert.equal(plan.status, 'updated');
  assert.deepEqual(plan.data.releaseNotesByBuild, {
    11:['Previously approved older notes'],12:['Current approved notes.'],13:['Changes in 13.'],
  });
  assert.equal(plan.data.mandatory, true);
  assert.equal(plan.data.minSupportedBuildNumber, 10);
  assert.deepEqual(currentRelease({...document(), fields:encodeRelease(plan.data)}), plan.data);
});

test('same-build backfill writes only history, preserves pauses and manual notes, and is idempotent', async () => {
  const original = document({otaEnabled:false});
  const next = {...candidate(12), releaseNotesByBuild:{11:['Older change.'],12:['Upstream edited notes.']}};
  const plan = planRelease(next, original);
  assert.equal(plan.status, 'history-updated');
  assert.deepEqual(Object.keys(plan.data), ['releaseNotesByBuild']);
  assert.deepEqual(plan.data.releaseNotesByBuild[12], ['Current approved notes.']);
  const updated = {...original, fields:encodeRelease({...data({otaEnabled:false}),...plan.data})};
  const requests=[];
  assert.equal(await syncAndroidRelease(next, {token:'fake',document:original,request:async(url, options)=>{
    requests.push(url);
    if(options.method === 'POST') {
      const write=JSON.parse(options.body).writes[0];
      assert.deepEqual(write.updateMask.fieldPaths,['releaseNotesByBuild']);
      assert.equal(write.update.name,releaseDocument);
      assert.equal(write.currentDocument.updateTime,original.updateTime);
      return {ok:true};
    }
    return {ok:true,json:async()=>updated};
  }}), 'history-updated');
  assert.equal(requests.length,2);
  assert.equal(currentRelease(updated).otaEnabled,false);
  assert.equal(planRelease(next,updated).status,'unchanged');
  assert.equal(planRelease({...candidate(11),releaseNotesByBuild:{11:['Older']}},updated).status,'stale');
});
