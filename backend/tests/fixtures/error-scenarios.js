/**
 * 18 Pre-defined error scenarios for comprehensive testing
 * Each scenario includes setup, expected behavior, and assertions
 */

const testScenarios = {
  // ===== HAPPY PATH (3 scenarios) =====
  
  "happy-path-fast": {
    category: "happy-path",
    description: "Successful stream completes in under 2 seconds",
    setup: {
      delay: 500,
      statusCode: 200,
      truncate: false,
      malformed: null
    },
    expectations: {
      maxDuration: 2000,
      shouldRetry: false,
      shouldFallback: false,
      shouldActivateOfflineMode: false,
      responseIsValid: true
    }
  },

  "happy-path-slow": {
    category: "happy-path",
    description: "Successful stream with 8 second delay (before timeout)",
    setup: {
      delay: 8000,
      statusCode: 200,
      truncate: false,
      malformed: null
    },
    expectations: {
      maxDuration: 9000,
      shouldRetry: false,
      shouldFallback: false,
      shouldActivateOfflineMode: false,
      responseIsValid: true
    }
  },

  "happy-path-multi-turn": {
    category: "happy-path",
    description: "Multi-turn conversation with history",
    setup: {
      delay: 1000,
      statusCode: 200,
      truncate: false,
      malformed: null,
      historyLength: 5
    },
    expectations: {
      maxDuration: 2000,
      shouldRetry: false,
      shouldFallback: false,
      shouldActivateOfflineMode: false,
      responseIsValid: true,
      metricsIncludeHistoryContext: true
    }
  },

  // ===== MALFORMED RESPONSES (4 scenarios) =====

  "malformed-missing-reply": {
    category: "malformed",
    description: "Response missing 'reply' field triggers fallback",
    setup: {
      delay: 500,
      statusCode: 200,
      truncate: false,
      malformed: "missingReply"
    },
    expectations: {
      shouldRetry: false,
      shouldFallback: true,
      fallbackTo: "mock",
      schemaValidationFails: true,
      uiStillUpdates: true
    }
  },

  "malformed-invalid-corrections": {
    category: "malformed",
    description: "Corrections is string instead of array",
    setup: {
      delay: 500,
      statusCode: 200,
      truncate: false,
      malformed: "invalidCorrections"
    },
    expectations: {
      shouldRetry: false,
      shouldFallback: false, // Fallback not needed, use default
      schemaValidationFails: true,
      correctionsResetToEmpty: true
    }
  },

  "malformed-null-metrics": {
    category: "malformed",
    description: "Metrics field is null instead of object",
    setup: {
      delay: 500,
      statusCode: 200,
      truncate: false,
      malformed: "nullMetrics"
    },
    expectations: {
      shouldRetry: false,
      shouldFallback: false,
      metricsUseDefaults: true,
      uiDisplaysDefaults: true
    }
  },

  "malformed-truncated-stream": {
    category: "malformed",
    description: "Stream cuts off mid-response",
    setup: {
      delay: 0,
      statusCode: 200,
      truncate: true,
      malformed: null
    },
    expectations: {
      shouldRetry: false,
      shouldFallback: true,
      fallbackTo: "backend",
      partialContentReceived: true,
      connectionClosedAbnormally: true
    }
  },

  // ===== NETWORK ERRORS (4 scenarios) =====

  "network-503-retries-and-succeeds": {
    category: "network",
    description: "503 on first attempt, succeeds on retry",
    setup: [
      { delay: 100, statusCode: 503, attempt: 1 },
      { delay: 100, statusCode: 200, attempt: 2 }
    ],
    expectations: {
      shouldRetry: true,
      retryAttempts: 1,
      finalSuccess: true,
      shouldFallback: false,
      warningBannerShown: true,
      warningBannerContainsCountdown: true
    }
  },

  "network-504-all-retries-fail": {
    category: "network",
    description: "504 on all 3 retry attempts triggers offline mode",
    setup: [
      { delay: 100, statusCode: 504, attempt: 1 },
      { delay: 100, statusCode: 504, attempt: 2 },
      { delay: 100, statusCode: 504, attempt: 3 }
    ],
    expectations: {
      shouldRetry: true,
      retryAttempts: 2, // Fails on 1st, retries on 2nd and 3rd
      shouldActivateOfflineMode: true,
      warningBannerShown: true,
      warningBannerText: "Offline mode"
    }
  },

  "network-connection-reset": {
    category: "network",
    description: "Connection reset mid-stream triggers fallback chain",
    setup: {
      error: "ERR_CONNECTION_RESET",
      triggerAt: "mid-stream"
    },
    expectations: {
      shouldRetry: true,
      shouldFallback: true,
      fallbackChain: ["stream", "backend", "mock"],
      warningBannerShown: true
    }
  },

  "network-user-offline": {
    category: "network",
    description: "User is offline (navigator.onLine = false)",
    setup: {
      navigatorOnline: false
    },
    expectations: {
      shouldDetectOffline: true,
      shouldActivateOfflineMode: true,
      noNetworkRequests: true,
      useMockResponsesImmediately: true,
      helperTextMentionsOfflineMode: true
    }
  },

  // ===== RATE LIMITING (3 scenarios) =====

  "rate-limit-429-with-retry-after": {
    category: "rate-limit",
    description: "429 response with Retry-After header (5 seconds)",
    setup: {
      delay: 0,
      statusCode: 429,
      headers: { "retry-after": "5" }
    },
    expectations: {
      shouldRetry: true,
      respectRetryAfterHeader: true,
      retryDelayAtLeast: 5000,
      warningBannerShows: "5 seconds"
    }
  },

  "rate-limit-exponential-backoff-respected": {
    category: "rate-limit",
    description: "Exponential backoff delays follow formula exactly",
    setup: {
      multipleRequests: true,
      trackTimings: true
    },
    expectations: {
      exponentialBackoffFormula: "min(16s, 1s × 2^n) + jitter",
      attempt1Delay: { min: 1000, max: 2000 },
      attempt2Delay: { min: 2000, max: 4000 },
      attempt3Delay: { min: 4000, max: 8000 }
    }
  },

  "rate-limit-max-retries-exhausted": {
    category: "rate-limit",
    description: "All 3 retries exhausted, activate offline mode",
    setup: [
      { delay: 0, statusCode: 429, headers: { "retry-after": "60" }, attempt: 1 },
      { delay: 0, statusCode: 429, headers: { "retry-after": "60" }, attempt: 2 },
      { delay: 0, statusCode: 429, headers: { "retry-after": "60" }, attempt: 3 }
    ],
    expectations: {
      shouldRetry: true,
      retryCount: 2,
      shouldActivateOfflineMode: true,
      warningBannerText: "offline"
    }
  },

  // ===== TIMEOUT SCENARIOS (2 scenarios) =====

  "timeout-10-seconds": {
    category: "timeout",
    description: "Request hangs for 10 seconds (before 12s limit)",
    setup: {
      hangDuration: 10000,
      abortTimeout: 12000
    },
    expectations: {
      shouldAbort: false,
      requestCompletes: false,
      shouldRetry: false,
      shouldFallback: true
    }
  },

  "timeout-12-seconds-abort": {
    category: "timeout",
    description: "Request hangs for 12+ seconds, AbortController triggers",
    setup: {
      hangDuration: 13000,
      abortTimeout: 12000
    },
    expectations: {
      shouldAbort: true,
      abortName: "AbortError",
      errorMessage: "timed out",
      shouldRetry: false,
      shouldFallback: true,
      fallbackTo: "mock"
    }
  },

  // ===== EDGE CASES (2 scenarios) =====

  "edge-case-empty-corrections-valid-metrics": {
    category: "edge-case",
    description: "Valid response with empty corrections array",
    setup: {
      delay: 500,
      statusCode: 200,
      malformed: "emptyCorrectionsArray"
    },
    expectations: {
      responseIsValid: true,
      correctionsArray: [],
      metricsStillAvailable: true,
      uiUpdatesProperly: true
    }
  },

  "edge-case-huge-payload-10mb": {
    category: "edge-case",
    description: "Extremely large response payload (10MB)",
    setup: {
      delay: 0,
      statusCode: 200,
      payloadSize: "10MB"
    },
    expectations: {
      responseIsValid: true,
      noMemoryErrors: true,
      parseCompletes: true,
      parseTime: { max: 5000 } // Should complete within 5s
    }
  }
};

// Map scenarios to execution order
const scenarioOrder = [
  // Run happy paths first to establish baseline
  "happy-path-fast",
  "happy-path-slow",
  "happy-path-multi-turn",
  
  // Then malformed responses
  "malformed-missing-reply",
  "malformed-invalid-corrections",
  "malformed-null-metrics",
  "malformed-truncated-stream",
  
  // Then network errors
  "network-503-retries-and-succeeds",
  "network-504-all-retries-fail",
  "network-connection-reset",
  "network-user-offline",
  
  // Then rate limiting
  "rate-limit-429-with-retry-after",
  "rate-limit-exponential-backoff-respected",
  "rate-limit-max-retries-exhausted",
  
  // Then timeouts
  "timeout-10-seconds",
  "timeout-12-seconds-abort",
  
  // Finally edge cases
  "edge-case-empty-corrections-valid-metrics",
  "edge-case-huge-payload-10mb"
];

module.exports = {
  testScenarios,
  scenarioOrder,
  
  // Helper to get scenario by name
  getScenario: (name) => testScenarios[name],
  
  // Helper to get all scenarios of a category
  getScenariosByCategory: (category) => 
    Object.entries(testScenarios)
      .filter(([_, scenario]) => scenario.category === category)
      .map(([name, scenario]) => ({ name, ...scenario })),
  
  // Get next scenario in execution order
  getNextScenario: (currentIndex) => 
    scenarioOrder[currentIndex + 1] ? testScenarios[scenarioOrder[currentIndex + 1]] : null,
  
  // Total scenario count
  totalScenarios: scenarioOrder.length
};
