# Mock API Quick Reference Card

## Start Mock Server
```bash
npm run mock-server
# Port: http://localhost:5501
```

## Run Tests
```bash
npm run test:unit                    # Unit tests only
npm run test:integration             # Integration tests
npm run test                         # All tests + coverage
npm run test:watch                   # Auto-rerun on changes
```

## Point Frontend to Mock
```javascript
// In ai-chat.html line 236
const currentApiUrl = "http://localhost:5501";
```

## Query Parameters for Mock Server

| Param | Example | Effect |
|-------|---------|--------|
| `delay` | `?delay=5000` | Wait 5 seconds before responding |
| `statusCode` | `?statusCode=503` | Return HTTP 503 error |
| `truncate` | `?truncate=true` | Cut stream mid-response |
| `malformed` | `?malformed=missingReply` | Return invalid response |

## Malformed Response Types

```bash
# Missing reply field (schema fails → fallback to mock)
?malformed=missingReply

# Invalid corrections (use empty array)
?malformed=invalidCorrections

# Null metrics (use defaults)
?malformed=nullMetrics

# Empty corrections array (valid, no corrections)
?malformed=emptyCorrectionsArray

# Bad feedback structure
?malformed=malformedFeedback
```

## Test Scenarios in Order

### Happy Path (should all succeed)
1. Fast stream <2s: `?delay=500`
2. Slow stream 8s: `?delay=8000`
3. Multi-turn: Send multiple messages

### Malformed Responses (should fallback gracefully)
4. `?malformed=missingReply`
5. `?malformed=invalidCorrections`
6. `?malformed=nullMetrics`
7. `?truncate=true`

### Network Errors (should retry then fallback)
8. `?statusCode=503&delay=100` (first attempt fails)
9. `?statusCode=504&delay=100` (all retries fail)
10. Connection reset (unplug network)
11. User offline (DevTools Network → Offline)

### Rate Limiting (should respect backoff)
12. `?statusCode=429` with Retry-After header
13. Verify exponential backoff: attempt 1 = ~1-2s, attempt 2 = ~2-4s, etc.
14. All retries exhausted (3 failures) → offline mode

### Timeout (should abort at 12s)
15. `?delay=10000` (should timeout after 10s, fallback)
16. `?delay=13000` (should abort at exactly 12s via AbortController)

### Edge Cases (should handle gracefully)
17. `?malformed=emptyCorrectionsArray` (valid, empty corrections)
18. `?payloadSize=10MB` (huge response, no memory errors)

## Common Testing Workflows

### Workflow 1: Test Retry Logic
```bash
# Terminal 1
npm run mock-server

# Terminal 2 - Set up 503 error
curl -X POST http://localhost:5501/api/mock-config \
  -H "Content-Type: application/json" \
  -d '{"statusCode": 503, "delay": 1000}'

# Browser console
currentApiUrl = "http://localhost:5501";
handleSendMessage();  // Triggers 503 → retries → succeeds
```

### Workflow 2: Test Timeout (12s AbortController)
```bash
# Set delay > 12000ms
curl -X POST http://localhost:5501/api/mock-config \
  -H "Content-Type: application/json" \
  -d '{"delay": 15000}'

# Browser: Send message → watch UI at 12s mark → abort happens, fallback triggers
```

### Workflow 3: Test Offline Mode
```bash
# Browser DevTools: Network tab → Select "Offline"
# Browser console
handleSendMessage();  # Uses mock, no network requests
# Check warning banner: "Offline mode: Using cached scenarios"
```

### Workflow 4: Test Malformed Response
```bash
curl -X POST "http://localhost:5501/ai/chat?malformed=missingReply" \
  -H "Content-Type: application/json" \
  -d '{"message":"test","scenario":"test"}'
  
# Frontend should catch schema error → fallback to mock
```

## Verify Expected Behaviors

### After 503 Error (Retry Expected)
✓ Warning banner shows "Connection lost. Retrying in..."  
✓ Countdown displays seconds until retry  
✓ Retry happens at expected exponential delay  
✓ Either succeeds on retry or falls back to mock  

### After 12-Second Timeout (AbortController)
✓ Request aborts exactly at 12s  
✓ Error: "Request timed out after 12 seconds"  
✓ Falls back to mock (no hang)  
✓ Warning banner disappears after fallback  

### In Offline Mode
✓ No network requests made  
✓ Mock response appears within 100ms  
✓ Warning banner shows "Offline mode"  
✓ Helper text mentions offline usage  

### Malformed Response
✓ Schema validation catches error  
✓ Falls back to mock or uses defaults  
✓ UI still updates with fallback data  
✓ No JavaScript errors  

## Debugging

### Check Current Mock Config
```bash
curl http://localhost:5501/api/mock-config
```

### Health Check
```bash
curl http://localhost:5501/api/mock-health
```

### View Errors in Tests
```bash
npm run test:integration -- --verbose
```

### Check Network Tab (Browser)
- Open DevTools → Network tab
- Send message
- Look for: `localhost:5501/api/chat/stream` (or `/ai/chat`)
- Check response headers and body

### Console Logs in Frontend
```javascript
// In ai-chat.html handleSendMessage()
console.log("streamResult:", streamResult);  // What came back
console.log("streamError:", streamError);    // What went wrong
console.log("backendResult:", backendResult); // Backend attempt
console.log("response:", response);          // Final response
```

## Performance Targets

| Metric | Target |
|--------|--------|
| Stream latency | <2s (happy path) |
| Retry delay (attempt 1) | ~1-2s (exponential) |
| Retry delay (attempt 2) | ~2-4s |
| Retry delay (attempt 3) | ~4-8s |
| Offline activation | <100ms after detection |
| UI update from response | <50ms |
| Test execution | <30s per scenario |

## Success Criteria Checklist

After running all 18 scenarios:

- [ ] 0 JavaScript errors in console
- [ ] All 3 happy path scenarios succeed without retries
- [ ] All 4 malformed response scenarios fallback correctly
- [ ] All 4 network error scenarios trigger expected retry behavior
- [ ] All 3 rate-limit scenarios respect Retry-After and exponential backoff
- [ ] Both timeout scenarios abort/fallback at correct times
- [ ] Both edge case scenarios handle gracefully
- [ ] Warning banners appear/disappear smoothly
- [ ] All UI elements update with correct values
- [ ] Test coverage report shows ≥85% on error paths
- [ ] No memory leaks or DOM corruption

## Useful Curl Commands

### List all endpoints
```bash
# Use mock server health check
curl http://localhost:5501/api/mock-health
```

### Test stream endpoint
```bash
curl -X POST http://localhost:5501/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message":"test","scenario":"test","history":[]}'
```

### Test non-stream endpoint
```bash
curl -X POST http://localhost:5501/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test","scenario":"test"}'
```

### Simulate different errors
```bash
# 503 Service Unavailable
curl -X POST "http://localhost:5501/ai/chat?statusCode=503" \
  -H "Content-Type: application/json" \
  -d '{"message":"test","scenario":"test"}'

# 504 Gateway Timeout
curl -X POST "http://localhost:5501/ai/chat?statusCode=504" \
  -H "Content-Type: application/json" \
  -d '{"message":"test","scenario":"test"}'

# 429 Too Many Requests (rate limit)
curl -X POST "http://localhost:5501/ai/chat?statusCode=429" \
  -H "Content-Type: application/json" \
  -d '{"message":"test","scenario":"test"}'
```

### Simulate delays
```bash
# 5 second delay
curl -X POST "http://localhost:5501/ai/chat?delay=5000" \
  -H "Content-Type: application/json" \
  -d '{"message":"test","scenario":"test"}'

# 15 second delay (exceeds 12s timeout)
curl -X POST "http://localhost:5501/ai/chat?delay=15000" \
  -H "Content-Type: application/json" \
  -d '{"message":"test","scenario":"test"}'
```

## Files Reference

| File | Purpose |
|------|---------|
| `backend/mock-server.js` | Express mock API server |
| `backend/tests/fixtures/schemas.js` | JSON Schema definitions |
| `backend/tests/fixtures/factories.js` | Response/error builders |
| `backend/tests/fixtures/error-scenarios.js` | 18 test scenarios |
| `backend/tests/unit/factories.test.js` | Unit tests |
| `backend/tests/integration/mock-server.test.js` | Integration tests |
| `backend/jest.config.js` | Jest configuration |
| `backend/MOCK_SERVER_GUIDE.md` | Full reference guide |
