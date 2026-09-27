# Sakhi AI reliability (Phase 2)

## Configuration

- `GEMINI_MODEL` remains `gemini-3.6-flash`. Google's model reference lists it as stable and supports function calling.
- `GEMINI_TIMEOUT_MS` defaults to 45000 and is bounded to 1000–45000 ms. All Gemini calls, tool rounds and retries within one generation share this deadline.
- `GEMINI_MAX_RETRIES` defaults to 1 and is bounded to 0–2. Only transient server/network errors are retried; quota, authentication and other client errors are not. SDK retries are disabled to prevent duplicate retry layers.
- The browser AI client has a 90-second HTTP timeout to allow database operations around the provider deadline. It does not automatically replay chat requests.
- MongoDB server selection and connection timeouts are 5 seconds, socket timeout is 10 seconds, buffering is disabled, and AI search queries have a 3-second execution limit.

Do not put real credentials in `.env.example`.

## Search behavior

Search intent is rule-based English parsing, not semantic/vector retrieval. It extracts topic keywords and supported filters, including job location/type, course difficulty/price/certificates and scheme state. Literal keyword searches require each retained keyword to match at least one searchable field.

Follow-ups such as `Only remote ones` and `In Mumbai instead` inherit the previous search topic. A remote refinement clears the old city unless a city is provided in that turn. A new topic starts a fresh search.

Courses must be public. State scheme queries can include `All India` records. Empty course and scheme queries no longer substitute unrelated recommendations. Every requested domain reports `matched`, `empty` or `unavailable`; successful results remain usable when another domain fails. Recognized searches use the retrieved records directly as generation context and cards, without a second independent model-directed search.

## Operations and verification

`GET /api/health` returns HTTP 200 when MongoDB is connected and HTTP 503 with its connection state otherwise. Persisted AI session routes fail promptly with HTTP 503 during an outage. If the initial database connection fails, correct configuration/access and restart the backend.

From the repository root:

```sh
node --test Sakhi-Backend/tests/*.test.js Sakhi-Frontend/Sakhi_Project/tests/*.test.js
```

Tests cover retrieval against database fixtures, partial failures, session regressions, timeout/retry limits, health transitions, and real installed Gemini SDK serialization with mocked HTTP responses. They do not establish live MongoDB, Firebase or Gemini account access.

Live smoke checks before deployment:

1. Ask for software jobs in Chennai, then `Only remote ones`.
2. Ask for free beginner Python courses with certificates.
3. Ask for maternity schemes in Tamil Nadu.
4. Use a topic absent from the database and confirm no unrelated cards appear.
5. Verify health and session errors with MongoDB disconnected, then restore connectivity.

Provider references checked during implementation:

- [Gemini 3.6 Flash model](https://ai.google.dev/gemini-api/docs/models/gemini-3.6-flash)
- [Function calling and structured function results](https://ai.google.dev/gemini-api/docs/function-calling)
