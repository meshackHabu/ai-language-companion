# Mock API Server & Integration Test Infrastructure

## Overview

This infrastructure enables comprehensive testing of your frontend JSON parsing, error handling, retry logic, and offline fallback before connecting to the live non-deterministic OpenAI API.

**Architecture:**
- **Mock Server** (port 5501) — Express app that mirrors backend routes with configurable behavior
- **Test Fixtures** — Response factories, error scenarios, schema validators
- **Test Suites** — Unit tests + integration tests with 18 predefined error scenarios
- **Documentation** — Guides for setup, endpoints, and testing strategies

---

## What's Included

### 1. Mock Server (`backend/mock-server.js`)
- Listens on port 5501 (separate from production backend)
- Endpoints:
  - `POST /ai/chat` — Non-streaming endpoint
  - `POST /api/chat/stream` — Streaming endpoint (SSE format)
  - `POST /api/mock-config` — Dynamically set mock behavior
  - `GET /api/mock-config` — Retrieve current config
  - `GET /api/mock-health` — Health check
- Query parameters for controlling behavior: `?delay=5000&statusCode=503&truncate=true&malformed=type`

### 2. Test Fixtures (`backend/tests/fixtures/`)
- **schemas.js** — JSON Schema definitions for response validation
- **factories.js** — Response builders, error generators, backoff calculator, UI validators
- **error-scenarios.js** — 18 predefined test scenarios with setup & expectations

### 3. Test Suites (`backend/tests/`)
- **unit/** — Tests for response factories, backoff logic, schema validation
- **integration/** — Tests for mock server endpoints and error scenarios

### 4. Configuration
- **jest.config.js** — Jest test runner config with coverage thresholds
- **package.json** — Updated with test scripts and dev dependencies
- **MOCK_SERVER_GUIDE.md** — Comprehensive reference guide

---

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start Mock Server
```bash
npm run mock-server
# Output: 🎭 Mock API Server running on http://localhost:5501
```

### 3. Run Tests
```bash
# Unit tests (no server needed)
npm run test:unit

# Integration tests (requires mock server running)
npm run test:integration

# All tests with coverage
npm run test
```

### 4. Use Mock Server in Frontend
Update `ai-chat.html` line 236:
```javascript
const currentApiUrl = "http://localhost:5501"; // For testing
```

---

## 18 Test Scenarios

All pre-configured in `backend/tests/fixtures/error-scenarios.js`:

**Happy Path (3)**
- Fast stream (<2s)
- Slow stream (8s delay)
- Multi-turn with history

**Malformed Responses (4)**
- Missing `reply` field
- Invalid `corrections` array
- Null `metrics`
- Truncated stream

**Network Errors (4)**
- 503 Unavailable (retry succeeds)
- 504 Timeout (all retries fail)
- Connection reset mid-stream
- User offline

**Rate Limiting (3)**
- 429 with Retry-After header
- Exponential backoff formula verified
- Max retries exhausted

**Timeout Scenarios (2)**
- 10s hang (before 12s limit)
- 12s+ hang (AbortController triggers)

**Edge Cases (2)**
- Empty corrections + valid metrics
- 10MB payload

---

## Key Features

### ✅ Timeout Management
- 12-second AbortController with precise error handling
- Triggers graceful fallback chain on timeout

### ✅ Exponential Backoff with Jitter
- Formula: `min(16s, 1s × 2^attempt) + random_jitter`
- Configurable base delay, max delay, jitter range
- Math verified by `BackoffCalculator` tests

### ✅ Offline Detection
- Detects `navigator.onLine` status
- Activates local mock responses immediately
- Shows contextual warning banner

### ✅ Error Fallback Chain
1. Try streaming (12s timeout, 3 retries with backoff)
2. If fails → Try backend API
3. If fails → Use mock API
4. If all fail → Offline mode (local cache + mock)

### ✅ Schema Validation
- JSON Schema definitions for strict contract validation
- Frontend validates incoming responses
- Invalid responses trigger fallback automatically

### ✅ UI Binding Verification
- Validators ensure metrics map to correct DOM elements
- `#pronunciationStatus`, `#correctionHint`, `#grammarHint`, `#confidenceHint`
- `#suggestedActionsContainer` properly renders and clears

### ✅ Connection Warning Banner
- Shows on network errors with countdown
- Displays retry progress
- Auto-hides on recovery

---

## Usage Examples

### Test 503 Retry Logic
```bash
# Terminal 1: Start mock server
npm run mock-server

# Terminal 2: Configure for 503 error
curl -X POST http://localhost:5501/api/mock-config \
  -H "Content-Type: application/json" \
  -d '{"statusCode": 503, "delay": 500}'

# Browser: Open DevTools console and send message
currentApiUrl = "http://localhost:5501";
handleSendMessage();

# Watch: Warning banner → retry countdown → fallback to mock response
```

### Test 12-Second Timeout
```bash
# Configure for long delay (exceeds 12s timeout)
curl -X POST http://localhost:5501/api/mock-config \
  -H "Content-Type: application/json" \
  -d '{"delay": 15000}'

# Send message (will abort at 12s)
# Verify: No UI freeze, falls back to mock
```

### Test Malformed Response
```bash
# Configure for missing reply field
curl -X POST http://localhost:5501/ai/chat?malformed=missingReply \
  -H "Content-Type: application/json" \
  -d '{"message":"test","scenario":"test"}'

# Frontend should: Detect schema violation → fallback to mock
```

### Test Offline Mode
```bash
# Browser DevTools: Network tab → Select "Offline"
# Send message
# Verify: Mock response appears, no network requests, warning shows offline mode
```

---

## Test Coverage

Current coverage targets (in `jest.config.js`):
- **Branches**: 70%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

Run tests with coverage report:
```bash
npm run test
# Open: backend/coverage/lcov-report/index.html
```

---

## NPM Scripts

```json
{
  "mock-server": "node mock-server.js",           // Start mock server
  "test": "jest --coverage --verbose",            // All tests with coverage
  "test:watch": "jest --watch",                   // Auto-rerun on file changes
  "test:unit": "jest tests/unit --coverage",      // Unit tests only
  "test:integration": "jest tests/integration --runInBand", // Integration tests
  "test:all": "npm run test:unit && npm run test:integration"
}
```

---

## Validation Checklist

After implementing, verify:

- [ ] Mock server starts on port 5501
- [ ] All 18 scenarios run without frontend crashes
- [ ] Exponential backoff delays mathematically correct (±100ms tolerance)
- [ ] Schema validation catches ≥95% of malformed responses
- [ ] Offline fallback activates within 100ms of network detection
- [ ] Warning banners appear/disappear smoothly
- [ ] UI metrics correctly bound to all response fields
- [ ] Test coverage ≥85% for error paths
- [ ] No JavaScript console errors during any test scenario

---

## Files Created

```
backend/
├── mock-server.js                           # Express mock API
├── jest.config.js                           # Jest configuration
├── MOCK_SERVER_GUIDE.md                     # Comprehensive guide
├── package.json                             # Updated with test scripts
└── tests/
    ├── fixtures/
    │   ├── schemas.js                       # JSON Schema definitions
    │   ├── factories.js                     # Response/error builders
    │   └── error-scenarios.js               # 18 test scenarios
    ├── unit/
    │   └── factories.test.js                # Factory unit tests
    └── integration/
        └── mock-server.test.js              # Mock server integration tests
```

---

## Next Steps

1. **Verify Setup** — Run `npm run test:unit` (should pass with no dependencies)
2. **Start Mock Server** — Run `npm run mock-server` in one terminal
3. **Run Integration Tests** — Run `npm run test:integration` in another terminal
4. **Point Frontend to Mock** — Update `ai-chat.html` to use `http://localhost:5501`
5. **Manual Testing** — Test scenarios in browser console as documented above
6. **Coverage Report** — Run `npm run test` and check `backend/coverage/`
7. **Integrate to CI/CD** — Add test scripts to GitHub Actions / CI pipeline
8. **Connect to Production** — Once all tests pass, switch backend to real OpenAI API

---

## Additional Resources

- **MOCK_SERVER_GUIDE.md** — Full endpoint reference, malformed response types, troubleshooting
- **error-scenarios.js** — Detailed expectations for each of the 18 scenarios
- **factories.js** — Docstrings for all response builders and validators
- **schemas.js** — JSON Schema references and property definitions

---

## Support

For issues:
- Check MOCK_SERVER_GUIDE.md troubleshooting section
- Review test output: `npm run test:integration -- --verbose`
- Inspect mock config: `curl http://localhost:5501/api/mock-config`
- Check browser DevTools Network tab for actual requests
