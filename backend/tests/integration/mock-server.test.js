/**
 * Integration tests for mock server endpoints
 */

const request = require("supertest");
const mockApp = require("../../mock-server");

describe("Mock Server Integration Tests", () => {
  describe("POST /ai/chat - Non-streaming endpoint", () => {
    it("should return valid response on success", async () => {
      const response = await request(mockApp)
        .post("/ai/chat")
        .send({
          message: "Hello",
          scenario: "greeting",
          chatHistory: []
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("reply");
      expect(response.body).toHaveProperty("corrections");
      expect(response.body).toHaveProperty("feedback");
      expect(response.body).toHaveProperty("metrics");
    });

    it("should respect delay parameter", async () => {
      const start = Date.now();
      await request(mockApp)
        .post("/ai/chat?delay=500")
        .send({ message: "test", scenario: "test" });
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(500);
    });

    it("should return error status code when requested", async () => {
      const response = await request(mockApp)
        .post("/ai/chat?statusCode=503")
        .send({ message: "test", scenario: "test" });

      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty("error");
    });

    it("should generate malformed response when requested", async () => {
      const response = await request(mockApp)
        .post("/ai/chat?malformed=missingReply")
        .send({ message: "test", scenario: "test" });

      expect(response.status).toBe(200);
      expect(response.body).not.toHaveProperty("reply");
    });

    it("should track history length", async () => {
      const response = await request(mockApp)
        .post("/ai/chat")
        .send({
          message: "test",
          scenario: "test",
          chatHistory: [{ role: "user", content: "msg1" }, { role: "assistant", content: "reply" }]
        });

      expect(response.body.meta.historyLength).toBe(2);
    });
  });

  describe("POST /api/chat/stream - Streaming endpoint", () => {
    it("should stream response successfully", async () => {
      const response = await request(mockApp)
        .post("/api/chat/stream")
        .send({
          message: "Hello",
          scenario: "greeting",
          history: []
        });

      expect(response.status).toBe(200);
      expect(response.text).toContain("data:");
      expect(response.text).toContain("[DONE]");
    });

    it("should return content chunks", async () => {
      const response = await request(mockApp)
        .post("/api/chat/stream")
        .send({ message: "test", scenario: "test" });

      const chunks = response.text.split("\n\n").filter(c => c.length > 0);
      expect(chunks.length).toBeGreaterThan(1);
      expect(chunks.some(c => c.includes("choices"))).toBe(true);
    });

    it("should respect delay parameter", async () => {
      const start = Date.now();
      await request(mockApp)
        .post("/api/chat/stream?delay=300")
        .send({ message: "test", scenario: "test" });
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(300);
    });

    it("should return error on bad status code", async () => {
      const response = await request(mockApp)
        .post("/api/chat/stream?statusCode=503")
        .send({ message: "test", scenario: "test" });

      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty("error");
    });

    it("should truncate stream when requested", async () => {
      const response = await request(mockApp)
        .post("/api/chat/stream?truncate=true")
        .send({ message: "test", scenario: "test" });

      expect(response.status).toBe(200);
      expect(response.text).not.toContain("[DONE]");
      // Stream should end abruptly without terminal marker
      expect(response.text.split("data:").length).toBeGreaterThan(2);
    });

    it("should set proper headers for streaming", async () => {
      const response = await request(mockApp)
        .post("/api/chat/stream")
        .send({ message: "test", scenario: "test" });

      expect(response.headers["content-type"]).toContain("text/plain");
      expect(response.headers["cache-control"]).toContain("no-cache");
      expect(response.headers["transfer-encoding"]).toBe("chunked");
    });
  });

  describe("POST /api/mock-config - Dynamic configuration", () => {
    it("should accept new configuration", async () => {
      const response = await request(mockApp)
        .post("/api/mock-config")
        .send({
          scenario: "error-test",
          delay: 2000,
          statusCode: 500,
          truncate: true
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("configured");
      expect(response.body.config.defaultDelay).toBe(2000);
      expect(response.body.config.defaultStatusCode).toBe(500);
    });

    it("should apply config to subsequent requests", async () => {
      await request(mockApp)
        .post("/api/mock-config")
        .send({ delay: 1000, statusCode: 503 });

      const response = await request(mockApp)
        .post("/ai/chat")
        .send({ message: "test", scenario: "test" });

      expect(response.status).toBe(503);
    });
  });

  describe("GET /api/mock-config - Get configuration", () => {
    it("should return current configuration", async () => {
      const response = await request(mockApp)
        .get("/api/mock-config");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("enabled");
      expect(response.body).toHaveProperty("defaultDelay");
      expect(response.body).toHaveProperty("defaultStatusCode");
      expect(response.body).toHaveProperty("scenario");
    });
  });

  describe("GET /api/mock-health - Health check", () => {
    it("should return health status", async () => {
      const response = await request(mockApp)
        .get("/api/mock-health");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("ok");
      expect(response.body).toHaveProperty("port");
      expect(response.body).toHaveProperty("mockConfig");
    });
  });

  describe("Error handling", () => {
    it("should return 404 for unknown endpoint", async () => {
      const response = await request(mockApp)
        .post("/api/unknown");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
    });

    it("should handle malformed JSON gracefully", async () => {
      const response = await request(mockApp)
        .post("/ai/chat")
        .send("invalid json");

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("Scenario-based testing", () => {
    it("scenario: 503 error requires retry", async () => {
      const response = await request(mockApp)
        .post("/ai/chat?statusCode=503")
        .send({ message: "test", scenario: "test" });

      expect(response.status).toBe(503);
      expect(response.body.error).toContain("unavailable");
    });

    it("scenario: network timeout (long delay)", async () => {
      const start = Date.now();
      await request(mockApp)
        .post("/ai/chat?delay=10000&statusCode=200")
        .send({ message: "test", scenario: "test" });
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(10000);
    });

    it("scenario: malformed response triggers fallback", async () => {
      const response = await request(mockApp)
        .post("/ai/chat?malformed=nullMetrics")
        .send({ message: "test", scenario: "test" });

      expect(response.status).toBe(200);
      expect(response.body.metrics).toBeNull();
    });

    it("scenario: truncated stream", async () => {
      const response = await request(mockApp)
        .post("/api/chat/stream?truncate=true")
        .send({ message: "test", scenario: "test" });

      const hasTerminator = response.text.includes("[DONE]");
      const hasContent = response.text.includes("choices");

      expect(hasContent).toBe(true);
      expect(hasTerminator).toBe(false);
    });
  });
});
