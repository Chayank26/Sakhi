# Phase 4 — Core platform journeys

Implemented account-backed user journeys across jobs, academy, schemes, community, profile, and support. Phase 5 remains security/production hardening; Phase 6 covers broader testing and polish; Phase 7 covers deployment.

## Account and authentication

- Protected workflows redirect to login and return to the requested page.
- Firebase Admin verifies tokens using the installed modular SDK. Unsigned token decoding has been removed. Configure `FIREBASE_PROJECT_ID` to match the frontend project, or a valid `FIREBASE_SERVICE_ACCOUNT_KEY`; protected APIs return 503 when authentication is unconfigured.
- `/api/me` returns only the signed-in account’s profile, saved opportunities, applications, and learning records. Profile contact fields and AI preferences are stored server-side. Account state resets on identity changes.
- Saved jobs/courses/schemes persist across devices and are fetched by reference, independently of catalogue pagination. Old unscoped browser bookmarks, guest applications, and email-only enrollments are not assigned to an account automatically.

## Jobs

- No in-memory job/application fallbacks. Offline storage returns an error; an empty search stays empty.
- Applications require authentication, a resume, contact information, and an open deadline. Identity/email come from the verified account; new applications have a unique account/job key.
- My job activity shows saved listings, application statuses, and jobs posted by the account.
- Posting owners can review applicants, download resumes, and update statuses. Applicants see those statuses on the next activity refresh/page load. Other users cannot use the review endpoints.
- Resume URLs are no longer publicly served. Downloads require posting ownership; notification emails can include attachments. Submission acknowledges storage, not email delivery. Files still use local disk: durable hosting/storage is a deployment prerequisite.

## Academy

- Enrollment is authenticated, repeatable without duplicates, and starts at zero. My learning queries by UID, never by a caller-supplied email.
- Authors can edit lesson titles, add lesson text/resource links, and publish a curriculum. The learning page displays available materials and stores each completed lesson atomically.
- Progress/status are derived from `completedLessons` against the current curriculum on API reads. Legacy numeric progress is not trusted. No lessons means zero progress.
- Completed courses with completion records enabled permit a real `.txt` download. Records explicitly identify completion as learner-reported, not an accredited qualification.
- Private courses are excluded from the public catalogue. Paid enrollment is explicitly unavailable pending a payment/access workflow. Existing courses without materials display that limitation.

## Schemes and community

- Saved schemes persist under the account. Source links accept HTTP(S) only, missing links have an explanation, and eligibility guidance never fabricates approval or satisfied criteria.
- Community feed/detail pages no longer replace empty/error results with sample posts. Likes and bookmarks update after the server succeeds; failures remain visible. Saved discussions support retry, and share links point to the individual post.
- Existing post/comment editing, deletion and report APIs remain in use.

## Support and settings

- Support requests are stored with account ownership, a reference and status. The account can view its latest 100 requests. No guaranteed response time or false email-delivery message.
- Operators currently review `supporttickets` using authorized database access and update status to `Received`, `In Progress`, or `Resolved`. An operator dashboard, reply delivery, and support staffing are not implemented.
- Public urgent-help information links to the official [112 service](https://112.gov.in/) and [National Cyber Crime Reporting Portal](https://cybercrime.gov.in/). Sakhi support is not an emergency service.
- Settings exposes profile preferences and Firebase password reset. Placeholder notification/language/theme/two-factor controls are labeled unavailable rather than pretending to save.

## Verification and rollout

Run from the respective project directory:

```sh
# Sakhi-Backend
node --test tests/*.test.js
# Sakhi-Frontend/Sakhi_Project
node --test tests/*.test.js
npm run build
```

New controller tests inject storage/email boundaries and cover ownership, failed writes, duplicate submissions, lesson validation, completion records, authentication, and recruiter permissions. They do not replace a real MongoDB/Firebase/browser integration test.

Before rollout:

1. Configure matching Firebase projects and MongoDB. Ensure the unique sparse `applicationKey` and `enrollmentKey` indexes and the `UserActivity.userId` unique index exist (Mongoose creates these when automatic indexing is enabled). Audit legacy guest/duplicate records separately; do not attach them by email alone.
2. With two test accounts, save opportunities and edit a profile, reload, switch accounts, and verify isolation.
3. Post a job as account A, apply as B, retry the application, review it as A, change status, and reload B’s activity. Test missing/oversized resumes, expired jobs, and forbidden resume downloads.
4. Publish a free course with lesson materials, enroll as B, complete/uncomplete lessons, reload My learning, and download the completion record only at 100%. Check private and paid-course restrictions.
5. Create/edit/comment/report/bookmark a discussion; confirm refresh persistence and visible service failures. Verify scheme links against the issuing authority.
6. Submit a support request, reload it, update its status through authorized operations access, and verify another account cannot see it.

Live database/authentication/email integration and browser smoke testing remain rollout checks. The production build retains the existing large-bundle warning. Broader rate limiting, request validation, CORS, upload/storage hardening, and operational controls remain Phase 5 work.

Final local verification: 62 backend tests and 12 frontend tests passed (74 total); lint passed for changed frontend source files; the production build and `git diff --check` passed. No live service or browser checks were run.
