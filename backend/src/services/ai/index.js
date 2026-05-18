const { getEnvConfig } = require("../../config/env");
const { buildMockResponse } = require("./providers/mockProvider");
const { buildOpenAiResponse } = require("./providers/openaiProvider");

async function generateAiResponse(input) {
  const env = getEnvConfig();

  if (env.aiProvider === "openai") {
    return buildOpenAiResponse(input);
  }

  return buildMockResponse(input);
}

module.exports = {
  generateAiResponse
};
