/**
 * JSON Schemas for API response validation
 * Used with Ajv for strict contract validation
 */

const aiChatResponseSchema = {
  $id: "http://localhost:5500/schemas/ai-chat-response",
  type: "object",
  required: ["reply"],
  properties: {
    reply: {
      type: "string",
      minLength: 1,
      description: "AI coach conversational response"
    },
    corrections: {
      type: "array",
      description: "Grammar/spelling corrections found",
      items: {
        type: "object",
        required: ["original", "corrected", "explanation"],
        properties: {
          original: { type: "string", minLength: 1 },
          corrected: { type: "string", minLength: 1 },
          explanation: { type: "string", minLength: 1 }
        },
        additionalProperties: false
      }
    },
    feedback: {
      type: "object",
      description: "Coaching feedback",
      properties: {
        correction: { type: "string" },
        explanation: { type: "string" },
        challenge: { type: "string" }
      }
    },
    metrics: {
      type: "object",
      description: "Structured metrics for UI binding",
      properties: {
        voiceScore: {
          type: ["number", "null"],
          minimum: 0,
          maximum: 100,
          description: "Voice pronunciation score 0-100"
        },
        betterSentence: { type: "string" },
        whatToFix: { type: "string" },
        nextReply: { type: "string" },
        suggestions: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "label"],
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              active: { type: "boolean" }
            }
          }
        }
      }
    },
    meta: {
      type: "object",
      properties: {
        provider: { type: "string", enum: ["mock", "openai", "backend"] },
        historyLength: { type: "number" },
        timestamp: { type: "string" }
      }
    }
  },
  additionalProperties: false
};

const streamingResponseSchema = {
  $id: "http://localhost:5500/schemas/streaming-response",
  type: "object",
  required: ["choices"],
  properties: {
    choices: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        properties: {
          delta: {
            type: "object",
            properties: {
              content: { type: "string" }
            }
          },
          finish_reason: { type: ["string", "null"] }
        }
      }
    }
  }
};

const errorResponseSchema = {
  $id: "http://localhost:5500/schemas/error-response",
  type: "object",
  required: ["error"],
  properties: {
    error: {
      type: "string",
      minLength: 1
    },
    statusCode: { type: "number" },
    timestamp: { type: "string" }
  },
  additionalProperties: false
};

const retryAfterHeaderSchema = {
  description: "Retry-After header value (seconds or HTTP-date)",
  type: ["string", "number"]
};

module.exports = {
  aiChatResponseSchema,
  streamingResponseSchema,
  errorResponseSchema,
  retryAfterHeaderSchema
};
