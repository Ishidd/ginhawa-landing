# Stable Android release synchronization

## Behavior

The existing `.github/workflows/android-release-website.yml` will synchronize a published stable release from `Ishidd/ginhawa-landing` with Firestore `appReleases/androidStable`, then trigger the existing website rebuild. Drafts, prereleases, unrelated tags, pull requests, and dispatches from other branches are excluded. A manual dispatch on main retries the latest published stable build.

The workflow checks GitHub's matching APK asset, SHA256SUMS, asset digest and the entire public APK download before using the release. Android build tools also verify the existing release certificate, package com.ginhawa.app, declared version/build and non-debuggable status. Temporary APK files are removed after verification. Human-readable release-note bullets become the in-app update notes; draft testing footers are excluded. No AI or model call is involved.

The updater rejects changed bytes or identity for an existing build, ignores older releases, and does not rewrite duplicate metadata. An operator pause (`otaEnabled: false`), notes and required-update policy remain unchanged on duplicate runs. Newer stable builds enable OTA while preserving `mandatory` and `minSupportedBuildNumber`. A conditional write using the existing document updateTime prevents overwriting a concurrent operator edit. The existing document must exist; this identity cannot create it.

If Firestore succeeds and the website hook fails, rerunning preserves the successful metadata and retries the website. The app sees the new build on its next launch or manual update check; Android still requires the user to approve installation. Publishing is not a silent app installation.

## Approved identity setup

- Project: `ginhawa-82218`, project number `467523888732`.
- New service account: `ginhawa-release-publisher@ginhawa-82218.iam.gserviceaccount.com`.
- New custom role: `projects/ginhawa-82218/roles/ginhawaAndroidReleasePublisher` with exactly `datastore.entities.get` and `datastore.entities.update`.
- New WIF pool/provider: `projects/467523888732/locations/global/workloadIdentityPools/ginhawa-releases/providers/github`.
- GitHub issuer: `https://token.actions.githubusercontent.com`.
- Bind `roles/iam.workloadIdentityUser` on this service account only to the pool's `attribute.repository_id/1441560524` principal set.
- Map subject, numeric repository ID and numeric owner ID. Require repository `Ishidd/ginhawa-landing`, repository ID `1441560524`, owner ID `149577279`, and the exact `android-release-website.yml` workflow at the event ref. Permit only release tag refs beginning `refs/tags/android-v` or manual dispatch on `refs/heads/main`. Runtime checks additionally require the canonical Android tag format.
- The project role binding is conditional on `resource.name == 'projects/ginhawa-82218/databases/(default)'`. All existing IAM bindings must be preserved with their concurrency token.
- The workflow receives a masked access token lasting 600 seconds, with no credential file, service-account key or Firebase CLI login in GitHub. Existing Firebase rules, administrator/student accounts, billing and other identities remain unchanged.

**Actual permission scope:** Firestore IAM is database-scoped. This role can read and update any existing document in the default database if its credentials are misused; it cannot list, create or delete documents. Client Firestore rules do not constrain this trusted identity. The release code hardcodes the single release-document destination, and WIF restricts which workflow can obtain credentials. This is not IAM-enforced document-only access. A separate broker would be needed to enforce a single-document boundary outside the workflow.

The owner explicitly approved this permission scope on 2 November 2026. The dedicated identity, role, pool/provider and bindings have been configured and read back. All unrelated project IAM bindings were preserved, the service account has zero user-managed keys, and project billing remains disabled and unlinked. Live GitHub verification is pending deployment of this workflow.

## Validation

Run `node --test scripts/android-release.test.mjs scripts/github-android-release.test.mjs scripts/firestore-android-release.test.mjs scripts/android-apk.test.mjs`.

Tests cover stable metadata validation, notes limits, workflow identity checks, policy preservation, duplicate/old releases, changed bytes, fixed-path writes, missing records, concurrency conflicts, transport errors and verified read-back. The public website manifest remains independent of the added user-facing notes.

Before publishing build 13, also deploy the separately prepared recommendation-checklist rules in the app/admin repositories and finish phone acceptance. Release synchronization does not deploy app feature rules or publish the current draft.

Primary references: [Google keyless GitHub authentication](https://github.com/google-github-actions/auth), [GitHub deployment federation](https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines), [Firestore IAM and permissions](https://firebase.google.com/docs/firestore/security/iam), [per-database IAM conditions](https://docs.cloud.google.com/firestore/native/docs/manage-databases).
