# AI personalization and interactions (Phase 3)

## Profile preferences

The profile editor now saves city, career goal, skills, interests, work preference and learning level to `AiUserProfile`, keyed by the authenticated Firebase UID. Chat loads the saved preferences on each turn; client-provided profile objects and user IDs are not used. Contact details are not included in the AI profile.

Generic searches can use profile defaults. Explicit topics and filters take precedence. Retrieved records are ranked using actual skill, interest, goal and location matches; cards display the matching reasons. These are relevance explanations, not a guarantee of scheme eligibility or job suitability.

Name/contact fields remain browser-local. Their cache is scoped by account; legacy data is read only if its UID or email matches the current account. Existing hardcoded skills and location are no longer treated as user preferences.

## Feedback and quality signals

`PUT /api/ai/sessions/:sessionId/messages/:messageId/feedback` accepts `{ "rating": "up" }`, `"down"`, or `null` to clear it. The database update requires an owned session and an assistant message. Feedback survives refresh; guest responses cannot receive persisted feedback.

Quality scores are stored internally with assistant messages and excluded from session API responses. These are simple review heuristics, not factual-accuracy measurements. To summarize the latest 500 active sessions and list up to 100 response IDs needing review, run from `Sakhi-Backend`:

```sh
node scripts/reportAiQuality.js
```

The report does not print conversation text or profile data.

## Stop, Retry and export

Stop aborts the browser request and propagates cancellation through the backend to Gemini. A request cancelled before persistence does not save a partial turn. A response already committed to MongoDB cannot be undone by cancelling delivery.

Every UI turn has a stable `clientTurnId`. Retry reuses it; an atomic database condition prevents duplicate persisted turns even if the original response was saved but lost in transit. Reusing an ID for a different message returns HTTP 409. The legacy API without a client turn ID remains compatible but does not provide retry deduplication.

Feedback and late responses update only their originating conversation. Failed turns are excluded from subsequent guest context and exports. Copy reports clipboard errors; exports include recommendation reasons and navigation routes.

True token streaming is deferred. This phase uses a full-response API with loading, Stop and Retry controls, avoiding partial streamed-message persistence until that protocol is designed.

Tests exercise account scoping, profile-driven ranking, feedback persistence, cancellation, retries, quality redaction and transcript output. A live browser/Firebase/MongoDB/Gemini smoke test is still required before deployment.
