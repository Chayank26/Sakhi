# Phase 5 — Security and production hardening

## Implemented safeguards

- CORS accepts the configured frontend/client origins only; localhost exceptions apply only outside production. Origin checks are not authentication: non-browser clients still require Firebase tokens for protected operations.
- Helmet supplies API security headers. Responses disable caching and include a generated request ID. Unknown endpoints return 404; malformed/oversized requests return bounded JSON errors without exception details or filesystem paths.
- API traffic is limited to 300 requests per IP/minute, writes to 60 per IP/minute, AI chat to 12 per IP/minute, and uploads to 20 per IP/15 minutes. Limits return 429 and Retry-After. IPv6 grouping uses express-rate-limit's default subnet protection. Health checks remain available outside API quotas.
- JSON bodies are limited to 256 KiB, URL-encoded bodies to 64 KiB. Query/body validation rejects nested database operators, unexpected scalar/array types, invalid pagination, unsafe URL protocols, and oversized structures. Searches use escaped literal text, not user-provided regex syntax.
- Invalid credentials on optionally authenticated routes are rejected rather than downgraded to guest access. Clients likewise stop if an account's token cannot be retrieved. The legacy message append endpoint accepts user messages only; generated assistant turns remain server-owned.
- Public community authors no longer expose email addresses. API exception logging and email notification logs omit request payloads, bearer tokens, and contact data. Email templates escape user-controlled HTML.
- Multer is upgraded. Uploads have bounded file, field and part counts; at most one 5 MiB file is accepted. Binary type inspection runs in a worker with a three-second deadline and a memory limit, before any file is written. Filenames use UUIDs and detected extensions, with restrictive filesystem permissions.
- New resumes accept PDF/DOCX; ambiguous legacy DOC uploads are rejected. Images accept JPEG/PNG/GIF/WebP. Existing active-content extensions are not publicly served, even if present in the old upload directory. Resumes remain available only through authorized recruiter downloads.
- Cloudinary errors fail the upload and remove temporary files. Local image URLs use configured `PUBLIC_API_ORIGIN`, not the incoming Host header. Persistent upload storage is configurable with `UPLOAD_DIR`.
- `app.js` constructs the app without opening a port or connecting to MongoDB. `server.js` validates configuration, requires a successful database connection, sets HTTP timeouts, and drains connections on SIGTERM/SIGINT.

## Runtime and deployment

Use Node **22.12 or newer** and install with `npm ci` in both project directories. Keep package manifests/lockfiles in Git; installed `node_modules` belongs outside version control.

Production requires:

- `NODE_ENV=production` and `MONGODB_URI`.
- Matching Firebase Admin credentials/project configuration and frontend Firebase project.
- HTTPS origins in `FRONTEND_URL` and `PUBLIC_API_ORIGIN`; `CLIENT_URL`, if set, must also be an HTTPS origin.
- An absolute `UPLOAD_DIR` on a persistent volume. The service account must be able to write it. Back up resumes and MongoDB according to your retention policy.
- `TRUST_PROXY=0` for direct access, or an explicit trusted network/hop count matching the host topology. Never expose a server that trusts arbitrary forwarded headers. If using a hop count, all incoming paths must traverse the configured trusted proxies.

The rate-limit stores are **process-local**. Run one backend process/replica with these limits, or add a shared limiter/edge quota before scaling horizontally. Restarting the process resets its counters. These controls do not replace infrastructure-level DDoS protection.

File signatures are a format check, **not malware scanning**. Scan documents in isolated infrastructure before broad production distribution if required by your operational threat model. Existing on-disk files are not rewritten or deleted by this phase.

Firebase ID-token verification does not perform a revocation lookup on every request. Account revocation enforcement and any administrator workflow must be configured and tested before relying on immediate account disablement.

Live MongoDB, Firebase, SMTP, Cloudinary and hosting/proxy configuration still require deployment smoke tests. No external messages were sent as part of development validation.

## Dependencies

Patched dependency versions are recorded in both lockfiles, including Express, Multer, Firebase Admin, Nodemailer and frontend tooling/router dependencies. A narrow override upgrades the UUID dependency used by `gaxios@6.7.1` to the patched 11.x line; this caller only uses the compatible `v4()` API. Review/remove the override when its upstream dependency is patched.

References: [express-rate-limit configuration](https://github.com/express-rate-limit/express-rate-limit), [file-type format detection limitations](https://github.com/sindresorhus/file-type), [UUID advisory](https://github.com/advisories/GHSA-w5hq-g745-h8pq).

## Verification

From `Sakhi-Backend`, run `npm test`. Security tests open temporary localhost listeners and temporary upload directories; they do not use live services. They exercise CORS/preflight, headers, private paths, JSON/parser limits, input validation, rate limits, auth downgrade rejection, runtime configuration, public author privacy, file spoofing/size rejection, and legacy active-content paths.

From `Sakhi-Frontend/Sakhi_Project`, run `node --test tests/*.test.js`, lint the changed source files, and `npm run build`. Run `npm audit` in both directories to recheck advisory status at deployment time.

Local verification completed: **76 backend tests + 12 frontend tests (88 total)** passed, including 14 security/integration tests. Changed frontend source lint, the production build, backend startup syntax, and diff whitespace checks passed. Both dependency audits reported **0 known vulnerabilities** after patching. The pre-existing frontend bundle-size warning remains. Repository ignore rules exclude dependency folders, build output, environment files, logs, and uploads.
