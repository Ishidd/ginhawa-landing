import test from 'node:test';
import assert from 'node:assert/strict';
import { releaseDocument, encodeRelease, currentRelease, planRelease, syncAndroidRelease, readReleaseDocument, releaseAccessToken } from './firestore-android-release.mjs';
import { releaseNotes } from './github-android-release.mjs';
const candidate = (build = 13) => ({ version: `1.0.0 (${build})`, sha256: 'a'.repeat(64), url: `https://github.com/Ishidd/ginhawa-landing/releases/download/android-v1.0.0-${build}/ginhawa-1.0.0-${build}.apk`, releaseNotes: ['Clearer calibration and activity checklists.'] });
const data = (patch = {}) => ({ schemaVersion: 1, channel: 'stable', otaEnabled: true, packageName: 'com.ginhawa.app', versionName: '1.0.0', buildNumber: 12, apkUrl: candidate(12).url, sha256: candidate().sha256, releaseNotes: ['Previous notes'], mandatory: false, minSupportedBuildNumber: 1, ...patch });
const document = (patch = {}) => ({ name: releaseDocument, updateTime: '2026-11-02T12:00:00.000Z', fields: encodeRelease(data(patch)) });
const env = { GITHUB_ACTIONS: 'true', GITHUB_REPOSITORY: 'Ishidd/ginhawa-landing', GITHUB_REPOSITORY_ID: '1441560524', GITHUB_REPOSITORY_OWNER_ID: '149577279', GITHUB_EVENT_NAME: 'release', GITHUB_REF: 'refs/tags/android-v1.0.0-13', GITHUB_WORKFLOW_REF: 'Ishidd/ginhawa-landing/.github/workflows/android-release-website.yml@refs/tags/android-v1.0.0-13', GINHAWA_RELEASE_ACCESS_TOKEN: 'fake-short-lived-token' };
test('keyless token use is restricted to this repository, workflow and stable release/main dispatch context', () => {
  assert.equal(releaseAccessToken(env), env.GINHAWA_RELEASE_ACCESS_TOKEN);
  assert.equal(releaseAccessToken({ ...env, GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_REF: 'refs/heads/main', GITHUB_WORKFLOW_REF: 'Ishidd/ginhawa-landing/.github/workflows/android-release-website.yml@refs/heads/main' }), env.GINHAWA_RELEASE_ACCESS_TOKEN);
  for (const patch of [{GITHUB_ACTIONS:'false'}, {GITHUB_REPOSITORY:'other/repo'}, {GITHUB_REPOSITORY_ID:'1'}, {GITHUB_REPOSITORY_OWNER_ID:'2'}, {GITHUB_EVENT_NAME:'pull_request'}, {GITHUB_REF:'refs/heads/main'}, {GITHUB_WORKFLOW_REF:'other'}, {GINHAWA_RELEASE_ACCESS_TOKEN:''}, {GINHAWA_RELEASE_ACCESS_TOKEN:'bad token'}, {GOOGLE_APPLICATION_CREDENTIALS:'key.json'}, {FIREBASE_TOKEN:'old'}, {FIRESTORE_EMULATOR_HOST:'localhost:8080'}, {FIREBASE_AUTH_EMULATOR_HOST:'localhost:9099'}]) assert.throws(() => releaseAccessToken({...env,...patch}));
});
test('notes use bounded readable bullets and omit the draft footer', () => {
  assert.deepEqual(releaseNotes('GINHAWA 1.0.0 (13)\n\n- **Clearer** calibration.\n- Open [your checklist](https://example.com).\n\n**Draft testing note:** Do not show this.\n- Private testing instructions.'), ['Clearer calibration.', 'Open your checklist.']);
  for (const body of [undefined, '', '- ' + 'x'.repeat(501), Array(21).fill('- Too many').join('\n'), '- bad\u0000note']) assert.throws(() => releaseNotes(body));
});
test('new stable build enables OTA and preserves required-update policy', () => {
  const plan = planRelease(candidate(), document({mandatory: true, minSupportedBuildNumber: 10}));
  assert.equal(plan.status, 'updated');
  assert.equal(plan.data.buildNumber, 13); assert.equal(plan.data.otaEnabled, true);
  assert.equal(plan.data.mandatory, true); assert.equal(plan.data.minSupportedBuildNumber, 10);
  assert.deepEqual(plan.data.releaseNotes, candidate().releaseNotes);
});
test('duplicate preserves a manual pause, required policy and existing notes; old events do not roll back', async () => {
  const unchanged = document({otaEnabled: false, mandatory: true, minSupportedBuildNumber: 10});
  const noRequest = () => { throw Error('Unexpected write'); };
  assert.equal(await syncAndroidRelease(candidate(12), {token:'test',document:unchanged,request:noRequest}), 'unchanged');
  assert.equal(await syncAndroidRelease(candidate(11), {token:'test',document:unchanged,request:noRequest}), 'stale');
  assert.equal(currentRelease(unchanged).otaEnabled, false);
  assert.throws(() => planRelease({...candidate(12),sha256:'b'.repeat(64)},unchanged));
  assert.throws(() => planRelease({...candidate(12),version:'2.0.0 (12)'},unchanged));
});
test('malformed current policy and mismatched candidate identity fail closed', () => {
  for (const patch of [{schemaVersion:2},{channel:'draft'},{otaEnabled:'yes'},{mandatory:null},{minSupportedBuildNumber:0},{minSupportedBuildNumber:13},{buildNumber:0},{packageName:'other.app'},{releaseNotes:[]},{sha256:'invalid'},{apkUrl:candidate(13).url}]) assert.throws(() => currentRelease(document(patch)));
  for (const patch of [{releaseNotes:[]},{releaseNotes:['x'.repeat(501)]},{url:candidate(14).url},{version:'1.0.0 (2100000001)'}]) assert.throws(() => planRelease({...candidate(),...patch},document()));
  assert.throws(() => currentRelease({...document(),name:'users/someone'}));
  assert.throws(() => currentRelease({...document(),updateTime:null}));
});
test('only the fixed document is updated with a concurrency precondition and verified read-back', async () => {
  const original = document(); const requests = [];
  const request = async (url, options) => {
    requests.push({url,options});
    if(options.method==='POST') {
      const payload=JSON.parse(options.body); assert.equal(payload.writes.length,1);
      assert.equal(payload.writes[0].update.name,releaseDocument);
      assert.deepEqual(payload.writes[0].currentDocument,{updateTime:original.updateTime});
      assert.deepEqual(payload.writes[0].updateMask.fieldPaths,Object.keys(planRelease(candidate(),original).data));
      return {ok:true,status:200};
    }
    assert.equal(url,'https://firestore.googleapis.com/v1/'+releaseDocument);
    return {ok:true,status:200,json:async()=>({...original,updateTime:'2026-11-02T12:01:00.000Z',fields:encodeRelease(planRelease(candidate(),original).data)})};
  };
  assert.equal(await syncAndroidRelease(candidate(), {token:'test',document:original,request}), 'updated');
  assert.equal(requests.length,2);
});
test('missing document, conflicts, permission failures and failed verification never report success', async () => {
  await assert.rejects(readReleaseDocument('test',async()=>({ok:false,status:404})),/existing document required/);
  for(const status of [403,412,429,500]) {
    let calls=0;
    await assert.rejects(syncAndroidRelease(candidate(),{token:'test',document:document(),request:async()=>{calls++;return {ok:false,status};}}),/update failed/);
    assert.equal(calls,1);
  }
  await assert.rejects(syncAndroidRelease(candidate(),{token:'test',document:document(),request:async(_,options)=>options.method==='POST'?{ok:true,status:200}:{ok:true,status:200,json:async()=>document()}}),/read-back mismatch/);
});
