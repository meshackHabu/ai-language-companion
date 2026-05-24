/**
 * Response factories and test data generators
 * Produces valid, malformed, and edge-case responses
 */

class ResponseFactory {
  static buildValid(overrides = {}) {
    return {
      reply: overrides.reply || "Good effort! Your response shows clear intent and natural pacing.",
      corrections: overrides.corrections || [
        {
          original: "I go to school",
          corrected: "I go to school every day",
          explanation: "Adding 'every day' makes the frequency explicit and more natural."
        }
      ],
      feedback: {
        correction: overrides.correction || "Smoother version: 'I go to school every day.'",
        explanation: overrides.explanation || "Your verb tense is correct. Adding temporal frequency strengthens the sentence.",
        challenge: overrides.challenge || "Try adding where or when you go to school."
      },
      metrics: {
        voiceScore: overrides.voiceScore || 82,
        betterSentence: overrides.betterSentence || "I go to school every day.",
        whatToFix: overrides.whatToFix || "Consider mentioning why or how you get there.",
        nextReply: overrides.nextReply || "Great. Now tell me about your school.",
        suggestions: overrides.suggestions || [
          { id: "weakWords", label: "Practice weak words", active: false },
          { id: "slowCoach", label: "Slow coach mode", active: false },
          { id: "listeningMode", label: "Listening mode", active: false }
        ]
      },
      meta: {
        provider: "mock",
        historyLength: overrides.historyLength || 1,
        timestamp: new Date().toISOString()
      }
    };
  }

  static buildMalformed(type) {
    const base = this.buildValid();
    
    switch (type) {
      case "missingReply":
        delete base.reply;
        return base;
      
      case "invalidCorrections":
        base.corrections = "not_an_array";
        return base;
      
      case "nullMetrics":
        base.metrics = null;
        return base;
      
      case "missingMetrics":
        delete base.metrics;
        return base;
      
      case "emptyCorrectionsArray":
        base.corrections = [];
        return base;
      
      case "malformedFeedback":
        base.feedback = { incomplete: "object" };
        return base;
      
      case "nullFeedback":
        base.feedback = null;
        return base;
      
      case "invalidVoiceScore":
        base.metrics.voiceScore = 150; // Out of range
        return base;
      
      case "emptySuggestions":
        base.metrics.suggestions = [];
        return base;
      
      case "malformedSuggestion":
        base.metrics.suggestions = [{ missing_id: true }]; // Missing required 'id'
        return base;
      
      case "partialResponse":
        // Simulates truncated streaming
        delete base.metrics.suggestions;
        return base;
      
      default:
        return base;
    }
  }

  static buildEmpty() {
    return {};
  }

  static buildNull() {
    return null;
  }

  static buildStreamChunk(content, isLast = false) {
    if (isLast) {
      return "data: [DONE]\n\n";
    }
    return `data: ${JSON.stringify({
      choices: [{ delta: { content } }]
    })}\n\n`;
  }

  static buildFullStream(text) {
    const chunks = [];
    const words = text.split(" ");
    
    for (const word of words) {
      chunks.push(this.buildStreamChunk(word + " "));
    }
    chunks.push(this.buildStreamChunk(null, true));
    
    return chunks.join("");
  }

  static buildTruncatedStream(text, percentComplete = 0.5) {
    const chunks = [];
    const words = text.split(" ");
    const truncateAt = Math.floor(words.length * percentComplete);
    
    for (let i = 0; i < truncateAt; i++) {
      chunks.push(this.buildStreamChunk(words[i] + " "));
    }
    
    // Note: no [DONE] marker, simulating abrupt termination
    return chunks.join("");
  }

  static buildHugePayload() {
    // 10MB string (10,000 KB)
    const base = this.buildValid();
    base.reply = "A".repeat(10 * 1024 * 1024);
    return base;
  }

  static buildWithHistory(turnCount = 3) {
    return this.buildValid({ historyLength: turnCount });
  }
}

class ErrorScenarioFactory {
  static build503ServiceUnavailable() {
    return {
      statusCode: 503,
      headers: { "retry-after": "5" },
      body: { error: "Service temporarily unavailable" }
    };
  }

  static build504GatewayTimeout() {
    return {
      statusCode: 504,
      headers: { "retry-after": "10" },
      body: { error: "Gateway timeout" }
    };
  }

  static build429TooManyRequests() {
    return {
      statusCode: 429,
      headers: { "retry-after": "60" },
      body: { error: "Too many requests. Please slow down." }
    };
  }

  static build400BadRequest() {
    return {
      statusCode: 400,
      body: { error: "Bad request: missing required fields" }
    };
  }

  static buildConnectionReset() {
    return {
      error: "ERR_CONNECTION_RESET",
      message: "socket hang up"
    };
  }

  static buildAbortError() {
    const err = new Error("Aborted");
    err.name = "AbortError";
    return err;
  }

  static buildTimeoutError() {
    const err = new Error("Request timed out");
    err.code = "ETIMEDOUT";
    return err;
  }

  static buildOfflineError() {
    return new Error("Network error: user is offline");
  }
}

class BackoffCalculator {
  static calculateDelay(attempt, baseDelay = 1000, maxDelay = 16000) {
    const exponential = Math.min(maxDelay, baseDelay * Math.pow(2, attempt));
    const jitter = Math.random() * 1000;
    return exponential + jitter;
  }

  static verifyBackoffTiming(attemptDelays) {
    // Verify that delays follow exponential backoff pattern
    // Each delay should be roughly 2x the previous (±jitter range)
    for (let i = 1; i < attemptDelays.length; i++) {
      const ratio = attemptDelays[i] / attemptDelays[i - 1];
      if (ratio < 1.5 || ratio > 3) {
        return false; // Doesn't follow exponential pattern
      }
    }
    return true;
  }

  static calculateExpectedDelay(attempt, baseDelay = 1000, maxDelay = 16000) {
    return Math.min(maxDelay, baseDelay * Math.pow(2, attempt));
  }
}

class UIBindingValidator {
  static validateMetricsBinding(metricsResponse, domElements) {
    // Verify each metric is correctly bound to DOM
    const bindings = {
      voiceScore: domElements.pronunciationStatus?.textContent || "",
      betterSentence: domElements.correctionHint?.textContent || "",
      whatToFix: domElements.grammarHint?.textContent || "",
      nextReply: domElements.confidenceHint?.textContent || ""
    };

    const issues = [];

    if (metricsResponse.voiceScore !== undefined && 
        !bindings.voiceScore.includes(String(metricsResponse.voiceScore))) {
      issues.push("voiceScore not found in pronunciationStatus");
    }

    if (metricsResponse.betterSentence && 
        bindings.betterSentence !== metricsResponse.betterSentence) {
      issues.push("betterSentence not bound to correctionHint");
    }

    if (metricsResponse.whatToFix && 
        bindings.whatToFix !== metricsResponse.whatToFix) {
      issues.push("whatToFix not bound to grammarHint");
    }

    if (metricsResponse.nextReply && 
        bindings.nextReply !== metricsResponse.nextReply) {
      issues.push("nextReply not bound to confidenceHint");
    }

    return {
      valid: issues.length === 0,
      bindings,
      issues
    };
  }

  static validateSuggestionsRendering(suggestions, containerElement) {
    const renderedButtons = containerElement?.querySelectorAll("button[data-suggestion]") || [];
    
    if (renderedButtons.length !== suggestions.length) {
      return {
        valid: false,
        issue: `Expected ${suggestions.length} suggestions, got ${renderedButtons.length}`
      };
    }

    for (let i = 0; i < suggestions.length; i++) {
      const rendered = renderedButtons[i];
      const suggestion = suggestions[i];
      
      if (rendered.dataset.suggestion !== suggestion.id) {
        return {
          valid: false,
          issue: `Button ${i} data-suggestion mismatch`
        };
      }

      if (rendered.textContent !== suggestion.label) {
        return {
          valid: false,
          issue: `Button ${i} label mismatch`
        };
      }
    }

    return { valid: true };
  }
}

module.exports = {
  ResponseFactory,
  ErrorScenarioFactory,
  BackoffCalculator,
  UIBindingValidator
};
