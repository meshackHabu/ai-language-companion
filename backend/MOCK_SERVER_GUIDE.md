# Mock API Server & Integration Test Guide

## Quick Start

### 1. Start the Mock Server

```bash
npm run mock-server
```

The mock server runs on **port 5501** (separate from production backend on 5500).

Output:
```
🎭 Mock API Server running on http://localhost:5501
   POST /ai/chat — Non-streaming endpoint
   POST /api/chat/stream — Streaming endpoint
   POST /api/mock-config — Set mock behavior dynamically
   GET /api/mock-config — Get current config
   GET /api/mock-health — Health check
```

### 2. Point Your Frontend to Mock Server

Update `ai-chat.html` to use mock server for testing:

```javascript
// In ai-chat.html, line 236:
const currentApiUrl = "http://localhost:5501"; // Changed from 5500
```

Or use query parameter:
```
http://localhost:8000/ai-chat.html?apiUrl=http://localhost:5501
```

### 3. Run Tests

```bash
# Unit tests only
npm run test:unit

# Integration tests (requires mock server)
npm run test:integration

# All tests with coverage
npm run test

# Watch mode (auto-rerun on file changes)
npm run test:watch
```

---

## Endpoint Reference

### Non-Streaming Endpoint: POST /ai/chat

**Base Request:**
```bash
curl -X POST http://localhost:5501/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","scenario":"greeting"}'
```

**Query Parameters:**
- `delay=ms` — Simulate network latency (e.g., `?delay=5000` for 5 seconds)
- `statusCode=###` — Return specific HTTP status (e.g., `?statusCode=503`)
- `truncate=true` — Cut stream mid-response
- `malformed=type` — Return malformed response (see types below)

**Example: Simulate 503 error**
```bash
curl -X POST "http://localhost:5501/ai/chat?statusCode=503&delay=1000" \
  -H "Content-Type: application/json" \
  -d '{"message":"test","scenario":"test"}'
```

**Response:**
```json
{
  "reply": "Good answer! Continue practicing with this scenario.",
  "corrections": [
    {
      "original": "I am happy",
      "corrected": "I am very happy",
      "explanation": "Added emphasis with 'very' for more natural expression."
    }
  ],
  "feedback": {
    "correction": "Smoother version: 'I am very happy today.'",
    "explanation": "Your sentence was clear. Adding 'today' makes it more conversational.",
    "challenge": "Try adding a reason for your happiness in the next turn."
  },
  "metrics": {
    "voiceScore": 78,
    "betterSentence": "I am very happy today.",
    "whatToFix": "Consider adding emotional context.",
    "nextReply": "Excellent. Now tell me why you're happy.",
    "suggestions": [
      { "id": "weakWords", "label": "Practice weak words", "active": false }
    ]
  },
  "meta": {
    "provider": "mock",
    "historyLength": 0,
    "timestamp": "2026-05-24T10:00:00.000Z"
  }
}
```

### Streaming Endpoint: POST /api/chat/stream

**Base Request:**
```bash
curl -X POST http://localhost:5501/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","scenario":"greeting","history":[]}'
```

**Response (Server-Sent Events):**
```
data: {"choices":[{"delta":{"content":"Good "}}]}

data: {"choices":[{"delta":{"content":"answer "}}]}

data: [DONE]
```

**Example: Simulate timeout**
```bash
curl -X POST "http://localhost:5501/api/chat/stream?delay=15000" \
  -H "Content-Type: application/json" \
  -d '{"message":"test","scenario":"test"}'
  # Will hang for 15 seconds (exceeds frontend 12s timeout)
```

### Dynamic Configuration: POST /api/mock-config

**Set global mock behavior:**
```bash
curl -X POST http://localhost:5501/api/mock-config \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "rate-limit-test",
    "delay": 2000,
    "statusCode": 429,
    "truncate": false,
    "malformed": null
  }'
```

**Response:**
```json
{
  "status": "configured",
  "config": {
    "enabled": true,
    "defaultDelay": 2000,
    "defaultStatusCode": 429,
    "truncateStream": false,
    "malformedResponse": null,
    "scenario": "rate-limit-test"
  }
}
```

### Get Configuration: GET /api/mock-config

```bash
curl http://localhost:5501/api/mock-config
```

### Health Check: GET /api/mock-health

```bash
curl http://localhost:5501/api/mock-health
```

---

## Malformed Response Types

Use `?malformed=TYPE` to test error handling:

| Type | Description | Frontend Behavior |
|------|-------------|-------------------|
| `missingReply` | No `reply` field | Schema validation fails → fallback to mock |
| `invalidCorrections` | `corrections` is string instead of array | Use empty array default |
| `nullMetrics` | `metrics` field is null | Use default metrics |
| `missingMetrics` | `metrics` field omitted | Use default metrics |
| `emptyCorrectionsArray` | `corrections: []` | Valid, just no corrections |
| `malformedFeedback` | `feedback` missing expected fields | Use default feedback |
| `nullFeedback` | `feedback: null` | Use default feedback |
| `invalidVoiceScore` | `voiceScore: 150` (out of 0-100 range) | Clamp or use default |
| `emptySuggestions` | `suggestions: []` | Valid, just no suggestions |
| `malformedSuggestion` | Suggestion objects missing `id` | Skip invalid suggestions |

**Example:**
```bash
# Test missing reply field
curl -X POST "http://localhost:5501/ai/chat?malformed=missingReply" \
  -H "Content-Type: application/json" \
  -d '{"message":"test","scenario":"test"}'
```

---

## 18 Test Scenarios

All scenarios are defined in `backend/tests/fixtures/error-scenarios.js`.

### Happy Path (3)
1. **happy-path-fast** — Stream completes in <2s
2. **happy-path-slow** — Stream with 8s delay (before 12s timeout)
3. **happy-path-multi-turn** — Multi-turn conversation with history

### Malformed Responses (4)
4. **malformed-missing-reply** — Response missing `reply` field
5. **malformed-invalid-corrections** — `corrections` is string not array
6. **malformed-null-metrics** — `metrics` is null
7. **malformed-truncated-stream** — Stream cuts off mid-response

### Network Errors (4)
8. **network-503-retries-and-succeeds** — 503 on first, succeeds on retry
9. **network-504-all-retries-fail** — 504 on all 3 attempts → offline mode
10. **network-connection-reset** — Connection reset mid-stream
11. **network-user-offline** — User is offline (navigator.onLine = false)

### Rate Limiting (3)
12. **rate-limit-429-with-retry-after** — 429 with Retry-After header
13. **rate-limit-exponential-backoff-respected** — Verify backoff math
14. **rate-limit-max-retries-exhausted** — All 3 retries fail

### Timeout Scenarios (2)
15. **timeout-10-seconds** — Request hangs 10s (before 12s limit)
16. **timeout-12-seconds-abort** — AbortController triggers at 12s

### Edge Cases (2)
17. **edge-case-empty-corrections-valid-metrics** — Valid with no corrections
18. **edge-case-huge-payload-10mb** — 10MB response payload

---

## Using Test Fixtures

### ResponseFactory

Generate test responses programmatically:

```javascript
const { ResponseFactory } = require("./backend/tests/fixtures/factories");

// Valid response
const valid = ResponseFactory.buildValid({ reply: "Custom text" });

// Malformed response
const malformed = ResponseFactory.buildMalformed("missingReply");

// Stream chunks
const streamText = ResponseFactory.buildFullStream("Hello world");
const truncated = ResponseFactory.buildTruncatedStream("Hello world", 0.5);
```

### ErrorScenarioFactory

Generate error scenarios:

```javascript
const { ErrorScenarioFactory } = require("./backend/tests/fixtures/factories");

const error503 = ErrorScenarioFactory.build503ServiceUnavailable();
const timeout = ErrorScenarioFactory.buildTimeoutError();
const offline = ErrorScenarioFactory.buildOfflineError();
```

### BackoffCalculator

Verify exponential backoff math:

```javascript
const { BackoffCalculator } = require("./backend/tests/fixtures/factories");

const delay1 = BackoffCalculator.calculateExpectedDelay(1);
const delay2 = BackoffCalculator.calculateExpectedDelay(2);
// delay1 = 2000ms, delay2 = 4000ms (exponential)

const isValid = BackoffCalculator.verifyBackoffTiming([1500, 3500, 7500]);
```

---

## Testing Frontend Error Handling

### Example: Test 503 Retry Logic

1. **Start mock server:**
   ```bash
   npm run mock-server
   ```

2. **Configure mock for 503 error:**
   ```bash
   curl -X POST http://localhost:5501/api/mock-config \
     -H "Content-Type: application/json" \
     -d '{"statusCode": 503, "delay": 500}'
   ```

3. **In browser console:**
   ```javascript
   // Point to mock server
   const currentApiUrl = "http://localhost:5501";
   
   // Send message (will trigger 503, then retry, then fallback to mock)
   handleSendMessage();
   
   // Watch for:
   // - Warning banner: "Connection lost. Retrying in 3s..."
   // - After retry succeeds or fails: fallback to mock response
   // - No JavaScript errors in console
   ```

### Example: Test Timeout

1. **Configure mock for 15s delay:**
   ```bash
   curl -X POST http://localhost:5501/api/mock-config \
     -H "Content-Type: application/json" \
     -d '{"delay": 15000}'
   ```

2. **Send message:**
   ```javascript
   handleSendMessage();
   ```

3. **Verify:**
   - At 12s: Request aborts
   - Error: "Request timed out after 12 seconds"
   - Falls back to mock response
   - No hang or freeze in UI

### Example: Test Offline Mode

1. **In browser DevTools Network tab, select "Offline" mode**

2. **Configure mock to simulate offline:**
   ```bash
   curl -X POST http://localhost:5501/api/mock-config \
     -H "Content-Type: application/json" \
     -d '{"navigatorOnline": false}'
   ```

3. **Send message:**
   ```javascript
   handleSendMessage();
   ```

4. **Verify:**
   - Warning banner: "Offline mode: Using cached scenarios"
   - Mock response appears immediately
   - No network requests made
   - Helper text mentions offline

---

## Schema Validation

JSON schemas are defined in `backend/tests/fixtures/schemas.js`.

### Validate Response Manually

```javascript
const Ajv = require("ajv");
const { aiChatResponseSchema } = require("./backend/tests/fixtures/schemas");

const ajv = new Ajv();
const validate = ajv.compile(aiChatResponseSchema);

const response = { /* response from API */ };
const valid = validate(response);

if (!valid) {
  console.error("Schema validation errors:", validate.errors);
}
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: cd backend && npm install
      
      - run: npm run test:unit
      
      - run: npm run test:integration
      
      - uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info
```

---

## Troubleshooting

### Mock server won't start
```bash
# Check port 5501 is available
lsof -i :5501

# Kill process if needed
kill -9 <PID>

# Try again
npm run mock-server
```

### Tests timeout
- Mock server might be slow or offline
- Increase `testTimeout` in `jest.config.js`
- Check error logs: `npm run test:integration -- --verbose`

### CORS errors from frontend
- Mock server has CORS enabled (`cors()` middleware)
- Ensure frontend uses exact URL: `http://localhost:5501`
- Check browser DevTools Network tab for actual URL

### Response not matching schema
- Check actual response structure vs. `schemas.js`
- Use `?malformed=TYPE` to test specific schema violations
- Add `console.log()` in `updateCoachFeedback()` to inspect response

---

## Next Steps

1. **Run unit tests:** `npm run test:unit` (should pass)
2. **Run integration tests:** `npm run test:integration` (requires mock server)
3. **Run all tests:** `npm run test` (with coverage report)
4. **Test in browser:** Point frontend to `http://localhost:5501` and manually test scenarios
5. **Measure coverage:** Open `backend/coverage/lcov-report/index.html`

Expected coverage: **≥85% for error paths**
