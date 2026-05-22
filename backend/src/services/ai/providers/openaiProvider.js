const { getEnvConfig } = require("../../../config/env");

function buildSystemPrompt(input) {
  const weakWords = input.weakWords?.map(item => item.word).join(", ") || "none";
  const targetWords = input.targetWords?.map(item => item.word).join(", ") || "none";
  const scenarioRole = input.scenarioRole || "a helpful language coach";

  return [
    `You are ${scenarioRole} in a ${input.language || "foreign"} language learning scenario.`,
    `Scenario: ${input.scenario || "general conversation"}`,
    "",
    "CRITICAL INSTRUCTIONS:",
    "1. Analyze the user's message for grammar, spelling, and vocabulary errors.",
    "2. Return ONLY valid JSON (no markdown, no extra text) with this structure:",
    "{",
    '  "corrections": [',
    '    {',
    '      "original": "the exact erroneous phrase or word",',
    '      "corrected": "the corrected version",',
    '      "explanation": "brief rule explanation (e.g., \'Subject-verb agreement\' or \'Spelling of past tense\')"',
    '    }',
    "  ],",
    '  "reply": "Your conversational response to continue the dialogue naturally"',
    "}",
    "",
    "ERROR ANALYSIS RULES:",
    "- If NO errors found, set corrections to empty array: []",
    "- For EACH error, include original, corrected, and explanation.",
    "- Keep explanations concise (one sentence max).",
    "- Focus on teaching: explain the rule, not just the fix.",
    "- Analyze: grammar tense/agreement, spelling/punctuation, word choice/vocabulary.",
    "",
    "REPLY GUIDELINES:",
    `- Maintain the persona: ${scenarioRole}`,
    "- Continue the practice scenario naturally.",
    "- Keep the reply encouraging and context-aware.",
    `- Language: ${input.language || "foreign"}`,
    `- Weak words to practice: ${weakWords}`,
    `- Target words for this scenario: ${targetWords}`
  ].join("\n");
}

function parseJsonContent(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

function buildMessagesFromHistory(input) {
  const messages = [];
  const chatHistory = input.chatHistory || [];

  // Add system message
  messages.push({
    role: "system",
    content: buildSystemPrompt(input)
  });

  // Add chat history messages (excluding system messages since we built our own)
  for (const msg of chatHistory) {
    if (msg.role !== "system") {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }
  }

  // If no user message at the end (from history), add the current learner message
  if (!messages[messages.length - 1] || messages[messages.length - 1].role !== "user") {
    messages.push({
      role: "user",
      content: input.learnerMessage
    });
  }

  return messages;
}

function normalizeResponse(parsed) {
  // Ensure corrections is an array
  if (!Array.isArray(parsed.corrections)) {
    parsed.corrections = [];
  }

  // Validate each correction object
  parsed.corrections = parsed.corrections.map(correction => ({
    original: correction.original || "",
    corrected: correction.corrected || "",
    explanation: correction.explanation || ""
  }));

  // Ensure reply exists
  if (!parsed.reply) {
    parsed.reply = "Let's continue this conversation!";
  }

  return parsed;
}

async function buildOpenAiResponse(input) {
  const env = getEnvConfig();

  if (!env.openAiApiKey) {
    throw new Error("OPENAI_API_KEY is missing. Set it in your environment before using AI_PROVIDER=openai.");
  }

  // Build messages from full chat history or use legacy single-message format
  const messages = input.chatHistory && input.chatHistory.length > 0
    ? buildMessagesFromHistory(input)
    : [
        { role: "system", content: buildSystemPrompt(input) },
        { role: "user", content: input.learnerMessage }
      ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.openAiApiKey}`
    },
    body: JSON.stringify({
      model: env.openAiModel,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: messages
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content || "";
  const parsed = parseJsonContent(content);

  if (!parsed || !parsed.reply) {
    throw new Error("OpenAI returned invalid JSON format. Expected 'reply' field.");
  }

  // Normalize the response to ensure proper structure
  const normalized = normalizeResponse(parsed);

  return {
    corrections: normalized.corrections,
    reply: normalized.reply,
    feedback: {
      correction: "See corrections array above.",
      explanation: `Found ${normalized.corrections.length} error(s) in your message.`,
      challenge: "Try again with the corrections in mind."
    },
    meta: {
      provider: "openai",
      model: env.openAiModel,
      historyLength: input.chatHistory?.length || 0,
      errorsFound: normalized.corrections.length
    }
  };
}

module.exports = {
  buildOpenAiResponse
};
