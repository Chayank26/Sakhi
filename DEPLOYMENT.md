# Phase 7 — Vercel + Render release handoff

## Status

Deployment preparation is implemented. **No staging or production deployment has been performed.** The owner selected Vercel + Render and will supply the staging targets. The workspace has no linked Vercel project or installed Vercel/Render CLI. A hosted CI result, live acceptance checks and production rollout remain pending.

The original blue canvas (`#C7E0E5`) and orange palette are retained throughout the app. Chat uses the shared theme tokens; account/support/saved-item pages have consistent cards and forms. Shared mobile navigation scrolls horizontally without overlapping links. Existing cream/white cards, fonts and page structure are preserved. Darker existing orange shades are used where white text needs more contrast.

## Release files and commands

- `render.yaml`: a **new staging** backend template, manual deploys, Node 22, database-aware health check, one persistent upload disk. The declared paid compute plan and 1 GB disk are not provisioned by editing the file. Review the service name, plan and storage capacity before importing it. Do not import it over an existing production service without checking the resource mapping.
- `Sakhi-Frontend/Sakhi_Project/vercel.json`: Vite build/output, SPA deep links, HTML revalidation, immutable versioned assets and basic response security headers.
- `.nvmrc`: Node 22. The application requires at least Node 22.12.
- Backend `npm run check:release`: checks production configuration structure and required AI/email settings; does not connect to services or print secret values.
- Frontend `npm run build:release`: validates explicit API/Firebase settings before building. It rejects HTTP API targets, placeholder values and conflicting API URL settings. Normal development builds remain available.
- Frontend `npm run test:e2e:release`: builds and tests the production bundle with **fixture configuration**. Never deploy this test output; rebuild with the intended environment using `npm run build:release`.
- Root `scripts/release-smoke.mjs`: read-only hosted checks with bounded network timeouts. It does not generate AI replies, create accounts, upload files or send emails.
- `.github/workflows/quality.yml`: backend tests, full frontend lint, unit tests, build and production-bundle browser tests. Hosted execution awaits a push.

## Local verification

- 80 backend tests and 18 frontend unit tests passed.
- All 20 production-build Playwright cases passed across desktop and mobile Chrome emulation. Coverage includes chat, mocked sign-in/persistence, account settings, support, job activity, learning, saved schemes, direct directory loads and navigation back into chat.
- Full frontend lint passed with no warnings or errors; the 45 errors and 2 warnings recorded in Phase 6 were resolved rather than suppressed.
- The release build passed with fixture configuration. Desktop chat and mobile account-page screenshots were inspected; automated axe checks passed for chat welcome, recommendations and the mobile drawer.
- Render/workflow YAML parsing, smoke-script syntax and diff whitespace checks passed. Hosted schema validation and CI execution remain pending.

Local execution used Node 24.18.0. The workflow selects Node 22; that hosted run has not been executed here. Browser services and authentication were mocked, so these results do not establish live provider quality, email delivery, storage persistence or production availability.

## 1. Prepare isolated staging resources

Use a staging MongoDB database, Firebase project/test accounts and AI/email settings appropriate to testing. Avoid reusing production data for acceptance tests.

Create or identify the Render service and the Vercel staging project. Use these root directories:

| Host | Project root | Build | Start/output |
| --- | --- | --- | --- |
| Render | `Sakhi-Backend` | `npm ci --omit=dev` | `npm run check:release && npm start` |
| Vercel | `Sakhi-Frontend/Sakhi_Project` | `npm run build:release` | `dist` |

The blueprint is optional for an existing Render service: apply the equivalent settings to the intended service instead of creating a duplicate. Backend start checks configuration again and requires MongoDB connectivity. Render should use `/api/health` for readiness. Keep one backend replica because rate limits are currently process-local.

## 2. Configure hosts

Set backend values in Render's secret/environment settings, not Git:

| Setting | Required value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Staging database connection URI |
| `FRONTEND_URL` | Exact HTTPS staging frontend origin, no path |
| `CLIENT_URL` | Optional second exact trusted origin; leave unset unless needed |
| `PUBLIC_API_ORIGIN` | Exact HTTPS Render backend origin |
| `UPLOAD_DIR` | `/var/data/sakhi/uploads` on the blueprint's persistent disk |
| `TRUST_PROXY` | Explicit trusted hop count/network, verified for the deployed ingress; do not guess or trust arbitrary forwarded headers |
| `FIREBASE_PROJECT_ID` | Same staging project as the frontend; optional service-account JSON belongs in `FIREBASE_SERVICE_ACCOUNT_KEY` when required |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Valid provider key and a model enabled for that project; preflight cannot verify provider availability |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL` | Working notification sender; use controlled recipients during staging tests |

Persistent storage is required even when public community images use Cloudinary: private application resumes still use disk. Existing uploads must be backed up and migrated deliberately before switching a populated deployment. Do not point an empty disk at an existing database and assume document links will work. Ensure the MongoDB network allowlist accepts the chosen hosting environment.

Set frontend values in the correct Vercel environment before building:

- `VITE_API_BASE_URL=https://BACKEND_HOST/api` (preferred; remove a conflicting `VITE_API_URL`).
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN` (hostname only), `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`.
- The optional Firebase storage bucket and messaging sender values from `.env.example`, if used.

`VITE_` settings are public and compiled into browser assets. Never put provider, SMTP, MongoDB or service-account secrets in them. Register the frontend hostname in Firebase Authentication's authorized domains. Configure exact staging origins in CORS; a changing preview URL is not automatically trusted. API/Firebase changes require a new frontend build.

The local frontend preflight currently passes structural validation. The local backend preflight currently stops at missing `FRONTEND_URL` and also flags missing explicit `TRUST_PROXY`. It reports the first runtime validation error; resolve it and rerun to discover any additional required production fields. Local files were not changed to contain deployment secrets.

## 3. Run checks, deploy staging, inspect headers

```sh
# Sakhi-Backend
npm ci
npm test
npm run check:release

# Sakhi-Frontend/Sakhi_Project
npm ci
npm run lint
npm test
npm run test:e2e:release
# Rebuild with real staging configuration after the fixture browser run:
npm run build:release
```

Run hosted checks from the repository root after staging is available:

```sh
node scripts/release-smoke.mjs --api https://BACKEND_HOST --web https://FRONTEND_HOST
```

The script checks database readiness, request IDs, no-store API responses, authentication enforcement, allowed/denied CORS, SPA deep links, frontend security headers, HTML cache policy and versioned JavaScript content/cache policy. Any failed check exits nonzero. It accepts HTTP loopback origins only with `--allow-local`.

For the optional authenticated GET `/api/me` check, provide a fresh staging test account ID token as `SAKHI_SMOKE_TOKEN` in the execution environment. Without it, the script explicitly reports that check as skipped. Do not paste tokens into chat or command arguments. Vercel deployment protection may need an operator-approved access mechanism for smoke checks; do not weaken production access controls to make a test pass.

## 4. Live acceptance gate — still pending

Use two staging accounts and verify:

1. Login, refresh, logout and account switching; saved conversations and profile data stay isolated.
2. Real AI replies for jobs, courses and schemes; results open existing records and no-match queries do not invent listings. Verify retries, provider timeouts and rate limits. Record provider latency and inspect request IDs without retaining sensitive prompts in logs.
3. Save/remove jobs, courses and schemes; reload and switch accounts.
4. Apply to a test job, reopen the private resume as the posting owner, and confirm a second account cannot access it. Verify intended notification delivery using controlled recipients.
5. Enroll in a free course, update progress and download the completion record; check unauthorized access and duplicate submissions.
6. Create/edit a staging community post, load comments and verify upload persistence across a backend restart.
7. Store a support request, reload it and verify account ownership.
8. Test physical mobile/Safari keyboard behavior, screen-reader navigation, the blue/orange theme and all navigation destinations. Automated Chromium emulation is not a Safari/device test.

Do not mark Phase 7 or v2 production-ready until these checks, the hosted workflow and the intended rollout have completed.

## 5. Rollout and rollback

Record the Git revision, environment configuration revision and last working host deployments. Take MongoDB and upload-volume backups and verify restoration in a separate environment. This change performs no data migration.

Deploy the tested backend configuration, wait for healthy readiness, then deploy the frontend built against it. Re-run the smoke script and the short account/chat journey. Monitor request errors, database health, model failures/latency, upload capacity and notification delivery. Keep auto-deploy off until the release gate is established.

If readiness or acceptance fails, stop promotion and select the prior known-good Render/Vercel deployment. Restore matching environment settings if they changed. Code rollback does not undo data writes or restore files; use verified backups only through a deliberate restoration procedure. A persistent disk can affect deployment availability; plan a maintenance window appropriate to the chosen service instead of assuming a zero-downtime rollout.

## Configuration references

The host files follow the [Render Blueprint reference](https://render.com/docs/blueprint-spec), [Render health checks](https://render.com/docs/health-checks), [Vercel project configuration](https://vercel.com/docs/project-configuration/vercel-json) and [Vercel cache-control documentation](https://vercel.com/docs/caching/cache-control-headers).
