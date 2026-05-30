const { OpenAI } = require("openai");
require('dotenv').config();

// Maps scenario IDs to readable descriptions for better AI context
const SCENARIO_DESCRIPTIONS = {
  "greeting":          "a friendly greeting and introduction",
  "warm-up":           "a friendly greeting and introduction",
  "new-friend":        "meeting someone new and introducing yourself",
  "family-visit":      "greeting someone at a family visit",
  "phone-call":        "a short polite phone call",
  "help-request":      "politely asking for help",
  "small-mistake":     "apologizing and fixing a small mistake",
  "directions-help":   "asking for directions politely",
  "clinic-help":       "asking for help at a clinic",
  "market":            "buying items at a market",
  "home-routine":      "talking about your home routine",
  "bus-stop":          "asking about a bus at a bus stop",
  "classroom":         "talking to a teacher in a classroom",
  "coach-mix":         "a mixed everyday conversation",
  "confidence-builder":"building conversational confidence",
  "daily-support":     "daily life support conversation",
  "general":           "a general everyday conversation"
};

function buildSystemPrompt(input) {
  const language   = input.language  || "the target language";
  const scenarioId = typeof input.scenario === "string"
    ? input.scenario
    : (input.scenario?.id || "general");

  const scenarioDesc = SCENARIO_DESCRIPTIONS[scenarioId]
    || `a ${scenarioId.replace(/-/g, " ")} conversation`;

  const weakWords   = Array.isArray(input.weakWords)
    ? input.weakWords.map(w => w.word || w).filter(Boolean).join(", ")
    : "";
  const targetWords = Array.isArray(input.targetWords)
    ? input.targetWords.map(w => w.word || w).filter(Boolean).join(", ")
    : "";

  return [
    `You are a friendly ${language} language coach helping a learner practice ${language}.`,
    `Current practice scenario: ${scenarioDesc}.`,
    "",
    "ABSOLUTE RULES — follow every time, no exceptions:",
    `1. Your "reply" field MUST be written in ${language} (not English).`,
    "2. Respond ONLY with a valid JSON object — no markdown, no code fences, no extra text.",
    "3. Use exactly this JSON structure:",
    '{',
    '  "corrections": [',
    '    {',
    '      "original":    "the exact wrong word or phrase from the learner",',
    '      "corrected":   "the correct version in English",',
    '      "explanation": "one-sentence rule explanation"',
    '    }',
    '  ],',
    `  "reply": "Your response continuing the conversation — written in ${language}"`,
    '}',
    "",
    "CORRECTION RULES:",
    "- Correct grammar errors, spelling mistakes, and wrong word choices.",
    "- If the learner's message has NO errors, set corrections to [].",
    "- Keep explanations short (one sentence, in English).",
    "",
    "REPLY RULES:",
    `- Write your reply ONLY in ${language} — never switch to English mid-reply.`,
    "- Keep the conversation going naturally within the practice scenario.",
    "- Be encouraging and supportive.",
    "- Keep the reply to 1–2 sentences.",
    weakWords   ? `- Gently encourage the learner to use these weak words: ${weakWords}` : "",
    targetWords ? `- Try to work these target words into the conversation: ${targetWords}` : "",
  ].filter(line => line !== null && line !== undefined).join("\n");
}

function buildMessagesFromHistory(input) {
  const messages = [];

  // Always start with the system prompt
  messages.push({
    role: "system",
    content: buildSystemPrompt(input)
  });

  // Add previous conversation turns (skip system messages)
  const chatHistory = Array.isArray(input.chatHistory) ? input.chatHistory : [];
  for (const msg of chatHistory) {
    if (msg.role === "user" || msg.role === "assistant") {
      messages.push({ role: msg.role, content: msg.content || "" });
    }
  }

  // Add the current learner message if not already last in history
  const lastMsg = messages[messages.length - 1];
  if (!lastMsg || lastMsg.role !== "user") {
    messages.push({ role: "user", content: input.learnerMessage });
  }

  return messages;
}

function parseAiResponse(responseText) {
  // Strip markdown code fences if present
  const cleaned = responseText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);

    if (!parsed.reply || typeof parsed.reply !== "string") {
      throw new Error("Missing reply field");
    }

    const corrections = Array.isArray(parsed.corrections)
      ? parsed.corrections.filter(c => c.original && c.corrected && c.explanation)
      : [];

    return {
      reply:       parsed.reply.trim(),
      corrections: corrections,
      feedback: parsed.feedback || {
        correction:  "Good effort!",
        explanation: "Keep practicing to improve.",
        challenge:   "Continue the conversation naturally."
      }
    };

  } catch (parseError) {
    console.warn("[OpenAI Provider] Response is not valid JSON, using as plain reply:", parseError.message);
    return {
      reply:       cleaned || "Let's continue this conversation!",
      corrections: [],
      feedback: {
        correction:  "Response received.",
        explanation: "The AI coach replied to your message.",
        challenge:   "Keep the conversation going naturally."
      }
    };
  }
}

async function buildOpenAiResponse(input) {
  const { learnerMessage, language, scenario } = input;

  if (!learnerMessage) {
    throw new Error("learnerMessage is required");
  }
  if (!scenario) {
    throw new Error("scenario is required");
  }

  const apiKey = process.env.OPENAI_API_KEY
    ? process.env.OPENAI_API_KEY.trim()
    : "";

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set in .env");
  }

  // Auto-detect provider from key prefix
  const isOpenRouter = apiKey.startsWith("sk-or-");
  const baseURL = isOpenRouter
    ? "https://openrouter.ai/api/v1"
    : "https://api.openai.com/v1";

  const openai = new OpenAI({
    apiKey,
    baseURL,
    defaultHeaders: isOpenRouter ? {
      "HTTP-Referer": "http://localhost:5500",
      "X-Title":      "AI Language Companion"
    } : {}
  });

  const finalMessages = buildMessagesFromHistory(input);

  const modelEnv  = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
  const cleanModel = String(modelEnv).trim().replace(/\.+$/, "");

  console.log(`[OpenAI Provider] ${isOpenRouter ? "OpenRouter" : "OpenAI"} | model: "${cleanModel}" | messages: ${finalMessages.length} | lang: ${language} | scenario: ${scenario}`);

  const completion = await openai.chat.completions.create({
    model:       cleanModel,
    messages:    finalMessages,
    temperature: 0.4,
    max_tokens:  600
  });

  if (!completion.choices?.[0]) {
    throw new Error("No response choices received from API");
  }

  const responseText = completion.choices[0].message.content;
  if (!responseText) {
    throw new Error("Empty response content from API");
  }

  const result = parseAiResponse(responseText);
  console.log(`[OpenAI Provider] ✅ Parsed response | corrections: ${result.corrections.length} | reply starts: "${result.reply.substring(0, 50)}..."`);

  return result;
}

module.exports = { buildOpenAiResponse };
