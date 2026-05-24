require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const MOCK_SERVER_PORT = 5501;

app.use(cors());
app.use(express.json());

// Global mock configuration state
let mockConfig = {
  enabled: true,
  defaultDelay: 0,
  defaultStatusCode: 200,
  truncateStream: false,
  malformedResponse: null, // "missingReply", "invalidCorrections", "nullMetrics", etc.
  scenario: "success"
};

// Response factories
function buildValidResponse(input = {}) {
  return {
    reply: input.reply || "Good answer! Continue practicing with this scenario.",
    corrections: input.corrections || [
      {
        original: "I am happy",
        corrected: "I am very happy",
        explanation: "Added emphasis with 'very' for more natural expression."
      }
    ],
    feedback: {
      correction: input.correction || "Smoother version: 'I am very happy today.'",
      explanation: input.explanation || "Your sentence was clear. Adding 'today' makes it more conversational.",
      challenge: input.challenge || "Try adding a reason for your happiness in the next turn."
    },
    metrics: {
      voiceScore: 78,
      betterSentence: "I am very happy today.",
      whatToFix: "Consider adding emotional context.",
      nextReply: "Excellent. Now tell me why you're happy.",
      suggestions: [
        { id: "weakWords", label: "Practice weak words", active: false },
        { id: "slowCoach", label: "Slow coach mode", active: false }
      ]
    },
    meta: {
      provider: "mock",
      historyLength: input.historyLength || 0,
      timestamp: new Date().toISOString()
    }
  };
}

function buildMalformedResponse(type) {
  const base = buildValidResponse();
  switch (type) {
    case "missingReply":
      delete base.reply;
      return base;
    case "invalidCorrections":
      base.corrections = "not an array";
      return base;
    case "nullMetrics":
      base.metrics = null;
      return base;
    case "missingMetrics":
      delete base.metrics;
      return base;
    case "emptyCorrections":
      base.corrections = [];
      return base;
    case "malformedFeedback":
      base.feedback = { partial: "field" };
      return base;
    default:
      return base;
  }
}

function generateStreamChunks(text) {
  const chunks = [];
  const words = text.split(" ");
  
  for (const word of words) {
    chunks.push(`data: ${JSON.stringify({
      choices: [{ delta: { content: word + " " } }]
    })}\n\n`);
  }
  
  chunks.push("data: [DONE]\n\n");
  return chunks;
}

// Mock configuration endpoint
app.post("/api/mock-config", (req, res) => {
  const { scenario, delay, statusCode, truncate, malformed } = req.body;
  
  mockConfig = {
    enabled: req.body.enabled !== false,
    defaultDelay: delay !== undefined ? delay : mockConfig.defaultDelay,
    defaultStatusCode: statusCode !== undefined ? statusCode : 200,
    truncateStream: truncate === true,
    malformedResponse: malformed || null,
    scenario: scenario || "success"
  };
  
  res.json({
    status: "configured",
    config: mockConfig
  });
});

// Get current mock config
app.get("/api/mock-config", (req, res) => {
  res.json(mockConfig);
});

// Non-streaming chat endpoint: POST /ai/chat
app.post("/ai/chat", async (req, res) => {
  const delay = parseInt(req.query.delay) || mockConfig.defaultDelay;
  const statusCode = parseInt(req.query.statusCode) || mockConfig.defaultStatusCode;
  const malformedType = req.query.malformed || mockConfig.malformedResponse;
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Handle error status codes
  if (statusCode !== 200) {
    const errorMessages = {
      400: "Bad request: missing required fields",
      503: "Service temporarily unavailable",
      504: "Gateway timeout",
      429: "Too many requests"
    };
    
    return res.status(statusCode).json({
      error: errorMessages[statusCode] || "Unknown error",
      statusCode
    });
  }
  
  // Generate response (malformed if requested)
  const response = malformedType 
    ? buildMalformedResponse(malformedType)
    : buildValidResponse({ historyLength: req.body.chatHistory?.length || 0 });
  
  res.json(response);
});

// Streaming chat endpoint: POST /api/chat/stream
app.post("/api/chat/stream", async (req, res) => {
  const delay = parseInt(req.query.delay) || mockConfig.defaultDelay;
  const statusCode = parseInt(req.query.statusCode) || mockConfig.defaultStatusCode;
  const truncate = req.query.truncate === "true" || mockConfig.truncateStream;
  const malformedType = req.query.malformed || mockConfig.malformedResponse;
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Handle error status codes (before streaming starts)
  if (statusCode !== 200) {
    const errorMessages = {
      400: "Bad request: missing message or scenario",
      503: "Service temporarily unavailable",
      504: "Gateway timeout",
      429: "Too many requests"
    };
    
    res.status(statusCode).json({
      error: errorMessages[statusCode] || "Unknown error",
      statusCode
    });
    return;
  }
  
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Transfer-Encoding", "chunked");
  
  try {
    // Generate response
    const response = malformedType 
      ? buildMalformedResponse(malformedType)
      : buildValidResponse({ historyLength: req.body.chatHistory?.length || 0 });
    
    // Stream the full response as SSE chunks
    const streamText = response.reply;
    const chunks = generateStreamChunks(streamText);
    
    // Write chunks, optionally truncating mid-stream
    for (let i = 0; i < chunks.length; i++) {
      if (truncate && i > chunks.length / 2) {
        // Abruptly end stream mid-response
        res.end();
        return;
      }
      res.write(chunks[i]);
      // Small delay between chunks for realistic streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    res.end();
  } catch (error) {
    console.error("Streaming error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Streaming failed" });
    } else {
      res.end();
    }
  }
});

// Health check endpoint
app.get("/api/mock-health", (req, res) => {
  res.json({
    status: "ok",
    port: MOCK_SERVER_PORT,
    mockConfig
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Mock endpoint not found",
    path: req.path,
    method: req.method
  });
});

// Start server
app.listen(MOCK_SERVER_PORT, () => {
  console.log(`\n🎭 Mock API Server running on http://localhost:${MOCK_SERVER_PORT}`);
  console.log(`   POST /ai/chat — Non-streaming endpoint`);
  console.log(`   POST /api/chat/stream — Streaming endpoint`);
  console.log(`   POST /api/mock-config — Set mock behavior dynamically`);
  console.log(`   GET /api/mock-config — Get current config`);
  console.log(`   GET /api/mock-health — Health check`);
  console.log(`\n📝 Query params: ?delay=ms&statusCode=###&truncate=true&malformed=type`);
  console.log(`   Malformed types: missingReply, invalidCorrections, nullMetrics, emptyCorrections, malformedFeedback\n`);
});

module.exports = app;
