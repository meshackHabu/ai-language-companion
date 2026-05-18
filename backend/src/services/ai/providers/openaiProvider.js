const { getEnvConfig } = require("../../../config/env");

function buildSystemPrompt(input) {
  const weakWords = input.weakWords?.map(item => item.word).join(", ") || "none";
  const targetWords = input.targetWords?.map(item => item.word).join(", ") || "none";

  return [
    "You are an AI language coach.",
    "Return strict JSON only with keys: reply, feedback.",
    "feedback must include: correction, explanation, challenge.",
    `Language: ${input.language}`,
    `Scenario: ${input.scenario}`,
    `Weak words: ${weakWords}`,
    `Target words: ${targetWords}`
  ].join("\n");
}

function parseJsonContent(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

async function buildOpenAiResponse(input) {
  const env = getEnvConfig();

  if (!env.openAiApiKey) {
    throw new Error("OPENAI_API_KEY is missing. Set it in your environment before using AI_PROVIDER=openai.");
  }

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
      messages: [
        { role: "system", content: buildSystemPrompt(input) },
        { role: "user", content: input.learnerMessage }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content || "";
  const parsed = parseJsonContent(content);

  if (!parsed || !parsed.reply || !parsed.feedback) {
    throw new Error("OpenAI returned invalid JSON format.");
  }

  return {
    reply: parsed.reply,
    feedback: {
      correction: parsed.feedback.correction || "Try a cleaner sentence.",
      explanation: parsed.feedback.explanation || "Keep the sentence short and natural.",
      challenge: parsed.feedback.challenge || "Reply again with one more useful detail."
    },
    meta: {
      provider: "openai",
      model: env.openAiModel
    }
  };
}

module.exports = {
  buildOpenAiResponse
};
