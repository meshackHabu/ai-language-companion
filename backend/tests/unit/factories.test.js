/**
 * Unit tests for mock server response factories
 */

const { ResponseFactory, ErrorScenarioFactory, BackoffCalculator } = require("../fixtures/factories");

describe("Mock Server Response Factories", () => {
  describe("ResponseFactory.buildValid()", () => {
    it("should generate a complete valid response", () => {
      const response = ResponseFactory.buildValid();
      
      expect(response).toHaveProperty("reply");
      expect(response).toHaveProperty("corrections");
      expect(response).toHaveProperty("feedback");
      expect(response).toHaveProperty("metrics");
      expect(response).toHaveProperty("meta");
      
      expect(typeof response.reply).toBe("string");
      expect(Array.isArray(response.corrections)).toBe(true);
      expect(typeof response.feedback).toBe("object");
      expect(typeof response.metrics).toBe("object");
    });

    it("should allow field overrides", () => {
      const customReply = "Custom response text";
      const response = ResponseFactory.buildValid({ reply: customReply });
      
      expect(response.reply).toBe(customReply);
    });

    it("should have valid metrics structure", () => {
      const response = ResponseFactory.buildValid();
      
      expect(response.metrics).toHaveProperty("voiceScore");
      expect(response.metrics).toHaveProperty("betterSentence");
      expect(response.metrics).toHaveProperty("whatToFix");
      expect(response.metrics).toHaveProperty("nextReply");
      expect(response.metrics).toHaveProperty("suggestions");
      
      expect(Array.isArray(response.metrics.suggestions)).toBe(true);
      expect(response.metrics.suggestions.length).toBeGreaterThan(0);
    });

    it("should include provider metadata", () => {
      const response = ResponseFactory.buildValid();
      
      expect(response.meta.provider).toBe("mock");
      expect(response.meta).toHaveProperty("historyLength");
      expect(response.meta).toHaveProperty("timestamp");
    });
  });

  describe("ResponseFactory.buildMalformed()", () => {
    it("should generate response with missing reply", () => {
      const response = ResponseFactory.buildMalformed("missingReply");
      
      expect(response).not.toHaveProperty("reply");
      expect(response).toHaveProperty("feedback");
    });

    it("should generate response with invalid corrections", () => {
      const response = ResponseFactory.buildMalformed("invalidCorrections");
      
      expect(typeof response.corrections).toBe("string");
      expect(Array.isArray(response.corrections)).toBe(false);
    });

    it("should generate response with null metrics", () => {
      const response = ResponseFactory.buildMalformed("nullMetrics");
      
      expect(response.metrics).toBeNull();
    });

    it("should generate response with empty corrections", () => {
      const response = ResponseFactory.buildMalformed("emptyCorrectionsArray");
      
      expect(Array.isArray(response.corrections)).toBe(true);
      expect(response.corrections.length).toBe(0);
    });

    it("should generate response with malformed feedback", () => {
      const response = ResponseFactory.buildMalformed("malformedFeedback");
      
      expect(response.feedback).toHaveProperty("incomplete");
      expect(response.feedback).not.toHaveProperty("correction");
    });

    it("should generate response with invalid voice score", () => {
      const response = ResponseFactory.buildMalformed("invalidVoiceScore");
      
      expect(response.metrics.voiceScore).toBe(150); // Out of valid range
    });
  });

  describe("ResponseFactory streaming utilities", () => {
    it("should generate individual stream chunks", () => {
      const chunk = ResponseFactory.buildStreamChunk("Hello ");
      
      expect(chunk).toContain("data:");
      expect(chunk).toContain("choices");
      expect(chunk).toContain("Hello ");
    });

    it("should generate terminal [DONE] chunk", () => {
      const chunk = ResponseFactory.buildStreamChunk(null, true);
      
      expect(chunk).toBe("data: [DONE]\n\n");
    });

    it("should generate full stream from text", () => {
      const stream = ResponseFactory.buildFullStream("Hello world");
      const chunks = stream.split("\n\n").filter(c => c.length > 0);
      
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[chunks.length - 1]).toContain("[DONE]");
    });

    it("should generate truncated stream", () => {
      const stream = ResponseFactory.buildTruncatedStream("Hello world test", 0.5);
      
      expect(stream).not.toContain("[DONE]");
      expect(stream).toContain("data:");
    });
  });

  describe("ResponseFactory edge cases", () => {
    it("should generate huge payload", () => {
      const response = ResponseFactory.buildHugePayload();
      
      expect(response.reply.length).toBeGreaterThan(1024 * 1024); // > 1MB
    });

    it("should generate response with history context", () => {
      const response = ResponseFactory.buildWithHistory(5);
      
      expect(response.meta.historyLength).toBe(5);
    });
  });

  describe("ErrorScenarioFactory", () => {
    it("should generate 503 error", () => {
      const error = ErrorScenarioFactory.build503ServiceUnavailable();
      
      expect(error.statusCode).toBe(503);
      expect(error.headers).toHaveProperty("retry-after");
      expect(error.body).toHaveProperty("error");
    });

    it("should generate 504 error", () => {
      const error = ErrorScenarioFactory.build504GatewayTimeout();
      
      expect(error.statusCode).toBe(504);
      expect(error.headers).toHaveProperty("retry-after");
    });

    it("should generate 429 rate limit error", () => {
      const error = ErrorScenarioFactory.build429TooManyRequests();
      
      expect(error.statusCode).toBe(429);
      expect(error.headers["retry-after"]).toBe("60");
    });

    it("should generate connection reset error", () => {
      const error = ErrorScenarioFactory.buildConnectionReset();
      
      expect(error.error).toBe("ERR_CONNECTION_RESET");
    });

    it("should generate abort error", () => {
      const error = ErrorScenarioFactory.buildAbortError();
      
      expect(error.name).toBe("AbortError");
    });
  });

  describe("BackoffCalculator", () => {
    it("should calculate exponential backoff delay", () => {
      const delay0 = BackoffCalculator.calculateExpectedDelay(0);
      const delay1 = BackoffCalculator.calculateExpectedDelay(1);
      const delay2 = BackoffCalculator.calculateExpectedDelay(2);
      
      expect(delay1).toBe(2000); // 1000 * 2^1
      expect(delay2).toBe(4000); // 1000 * 2^2
      expect(delay0).toBe(1000); // 1000 * 2^0
    });

    it("should cap at max delay", () => {
      const delay = BackoffCalculator.calculateExpectedDelay(10, 1000, 16000);
      
      expect(delay).toBe(16000); // Should not exceed maxDelay
    });

    it("should include jitter in calculated delay", () => {
      const delay = BackoffCalculator.calculateDelay(1);
      const expectedBase = 2000; // 1000 * 2^1
      
      // Delay should be expectedBase + some jitter (0-1000)
      expect(delay).toBeGreaterThanOrEqual(expectedBase);
      expect(delay).toBeLessThanOrEqual(expectedBase + 1000);
    });

    it("should verify exponential backoff pattern", () => {
      const attemptDelays = [1500, 3500, 7500]; // Roughly exponential
      
      expect(BackoffCalculator.verifyBackoffTiming(attemptDelays)).toBe(true);
    });

    it("should reject non-exponential pattern", () => {
      const attemptDelays = [1000, 1100, 1200]; // Linear, not exponential
      
      expect(BackoffCalculator.verifyBackoffTiming(attemptDelays)).toBe(false);
    });
  });
});
