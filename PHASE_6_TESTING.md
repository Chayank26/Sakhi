# Phase 6 — Chatbot experience, regression testing and performance

Historical Phase 6 snapshot. Phase 7 restores the original blue/orange palette and clears the lint debt noted below; see [DEPLOYMENT.md](DEPLOYMENT.md) for current release status.

Phase 6 implementation and local validation are complete. Phase 7 is staging and deployment; this does not mark v2 as production-validated.

## Delivered

- Rebuilt the chatbot as a cream, sage and terracotta workspace with a desktop history sidebar, searchable conversations, a mobile history drawer, and responsive recommendation cards.
- Added keyboard focus handling, Escape/drawer focus restoration, accessible control names, contrast fixes, semantic card headings and reduced-motion styles.
- Kept the composer inside the conversation layout; added multiline/IME-safe input, a 6,000-character limit, automatic textarea sizing, and a latest-message control. New replies preserve the reading position when the user has scrolled upward.
- Clarified guest versus saved conversations, loading and failure states, cancellation, retry, copy, export, feedback and starting a new conversation. A pending reply remains associated with its original conversation.
- Recommendation cards open job/course/scheme records directly; legacy cards fall back to encoded directory searches. Zero-price courses display “Free.” Unsupported AI action routes are filtered out.
- Retry respects both the API delay and HTTP `Retry-After` headers. Removed raw conversation-load error logging that could include request credentials.
- Lazy-loaded application routes with a loading state and recoverable error boundary. Shared header CSS is explicitly imported so direct directory visits retain their layout.
- Added frontend unit/browser test scripts and a GitHub Actions workflow for backend tests, frontend tests, scoped lint, production build, desktop/mobile browser tests and test artifacts. The workflow has been authored locally; its hosted run is pending a push.

## Local verification

| Check | Result |
| --- | --- |
| Backend regression tests | 76 passed |
| Frontend unit tests | 16 passed |
| Playwright browser cases | 20 passed: 10 desktop + 10 mobile |
| Automated accessibility scans | No axe violations in tested welcome, recommendation and mobile drawer states |
| Chat/changed-source lint | Passed |
| Production build | Passed, without the previous large-chunk warning |
| Main JavaScript bundle | Approximately 406 KB / 129 KB gzip, previously approximately 742 KB uncompressed |
| Chat route chunk | Approximately 141 KB / 43 KB gzip, loaded when visiting chat |

The bundle figures describe output chunks, not a measured improvement in page-load time. The shared runtime and the selected route still need to load.

Browser coverage includes prompts, guest reload behavior, Enter/Shift+Enter/IME, HTTP retry delays, stable retry IDs, cancellation while switching conversations, history search, modal focus, recommendation links, free pricing, blocked external actions, export, saved conversations and feedback after reload, failed route loading, scroll position, and direct public directory visits. Desktop and mobile screenshots were inspected.

All browser API and authentication responses are mocked. External requests are blocked, including web fonts. Tests exercise the real React interface, router, Firebase client and HTTP client against fixtures, without creating live accounts or calling the production backend or AI provider. Mobile coverage uses Chrome device emulation, not a physical phone or Safari. Accessibility scans cover the tested states and do not replace manual screen-reader testing.

## Run locally

Use Node 22.12 or newer. Install dependencies with `npm ci` in each project directory.

```sh
# From Sakhi-Backend
npm test

# From Sakhi-Frontend/Sakhi_Project
npm test
npm run lint:chat
npm run build
npm run test:e2e
```

Browser tests use installed Google Chrome, start their own Vite server on `127.0.0.1:5186`, and intercept API traffic addressed to `127.0.0.1:5001`. No backend server is required. If Chrome is missing, install it with `npx playwright install chrome`; Linux CI uses `npx playwright install --with-deps chrome`. The test server port must be available. Screenshots/traces are written under ignored `test-results/`. `npm run test:e2e:ui` opens Playwright's test interface.

`npm run lint` still reports **45 errors and 2 warnings** in existing files outside this change, primarily unused imports and older hook patterns. `lint:chat` intentionally covers the chatbot, route changes, shared header, and test code; it is not a claim that repository-wide lint is clean.

## Phase 7 handoff

1. Configure staging with real MongoDB, Firebase, AI provider, trusted frontend origins, persistent uploads and email settings. Apply the requirements in `SECURITY_HARDENING.md`.
2. Run real two-account tests: login/logout/account isolation; chat persistence, recommendations and feedback; saved items; job applications and recruiter ownership; course progress/completion; support request storage and intended email delivery.
3. Check real provider latency, timeouts, rate limits and answer grounding against representative jobs/courses/schemes, including no-match cases. Local mocks do not measure model quality or live uptime.
4. Validate physical mobile devices, Safari and screen-reader use; resolve the existing repository lint debt before treating full-repository lint as a release gate.
5. Verify hosting SPA rewrites and chunk caching, proxy/CORS behavior, health checks, logs, backups and rollback. Run the new CI workflow, deploy to staging, then validate production through a controlled rollout.

No token streaming, voice input, paid checkout or new model/provider migration is introduced in this phase. These remain separate product decisions rather than requirements silently implied by the loading animation or this UI redesign.
