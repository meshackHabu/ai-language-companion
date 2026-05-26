const { OpenAI } = require("openai");
require('dotenv').config();

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

  messages.push({
    role: "system",
    content: buildSystemPrompt(input)
  });

  for (const msg of chatHistory) {
    if (msg.role !== "system") {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }
  }

  if (!messages[messages.length - 1] || messages[messages.length - 1].role !== "user") {
    messages.push({
      role: "user",
      content: input.learnerMessage
    });
  }

  return messages;
}

function normalizeResponse(parsed) {
  if (!Array.isArray(parsed.corrections)) {
    parsed.corrections = [];
  }
  parsed.corrections = parsed.corrections.map(correction => ({
    original: correction.original || "",
    corrected: correction.corrected || "",
    explanation: correction.explanation || ""
  }));
  if (!parsed.reply) {
    parsed.reply = "Let's continue this conversation!";
  }
  return parsed;
}

async function buildOpenAiResponse(messages, options = {}) {
  try {
    // 1. Initialize with required OpenRouter rankings headers
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : "",
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:5500", 
        "X-Title": "AI Language Companion",
      }
    });

    // 2. Safe parsing extraction check for incoming payloads
    let finalMessages = [];
    
    if (Array.isArray(messages)) {
      finalMessages = messages;
    } else if (messages && Array.isArray(messages.messages)) {
      finalMessages = messages.messages;
    } else if (options && Array.isArray(options.messages)) {
      finalMessages = options.messages;
    } else if (messages && (messages.learnerMessage || messages.chatHistory)) {
      // Direct call parsing from raw router input object payload
      finalMessages = buildMessagesFromHistory(messages);
    } else if (typeof messages === 'string') {
      finalMessages = [{ role: "user", content: messages }];
    }

    if (finalMessages.length === 0) {
      console.warn("[OpenRouter] Falling back to default system prompt construction.");
      finalMessages = [{ role: "user", content: "Hello" }];
    }

    // 3. Clean and sanitize model name cleanly
    let envModel = process.env.OPENAI_MODEL;
    if (envModel && typeof envModel === 'object') {
      envModel = envModel.openAiModel;
    }
    
    const cleanModel = envModel ? String(envModel).trim().replace(/\.+$/, "") : "google/gemini-2.5-flash:free";

    console.log(`[OpenRouter] Sending clean payload with ${finalMessages.length} message(s) to model: "${cleanModel}"`);
    
    // 4. Fire execution request block
    const completion = await openai.chat.completions.create({
      model: cleanModel,
      messages: finalMessages,
      temperature: 0.4
    });

    if (completion.choices && completion.choices[0]) {
      return completion.choices[0].message.content;
    }
    
    throw new Error("Empty response structure received from OpenRouter.");

  } catch (error) {
    console.error("Core OpenRouter Provider Execution Error:", error.message);
    throw error;
  }
}

module.exports = {
  buildOpenAiResponse
};