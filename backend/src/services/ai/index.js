const { getEnvConfig } = require("../../config/env");
const { buildMockResponse } = require("./providers/mockProvider");
const { buildOpenAiResponse } = require("./providers/openaiProvider");

function optimizeChatHistory(chatHistory) {
  // Keep only the last N turns (max 15) to prevent token limits
  const MAX_TURNS = 15;
  
  if (!Array.isArray(chatHistory) || chatHistory.length === 0) {
    return [];
  }

  // If history is smaller than limit, return as is
  if (chatHistory.length <= MAX_TURNS) {
    return chatHistory;
  }

  // Keep the system message (first message) + last N-1 turns
  const systemMessages = chatHistory.filter(msg => msg.role === "system");
  const nonSystemMessages = chatHistory.filter(msg => msg.role !== "system");
  
  const optimized = [
    ...systemMessages,
    ...nonSystemMessages.slice(-MAX_TURNS + 1)
  ];

  return optimized;
}

async function generateAiResponse(input) {
  const env = getEnvConfig();

  // Optimize chat history before passing to provider
  const optimizedHistory = optimizeChatHistory(input.chatHistory || []);

  if (env.aiProvider === "openai") {
    return buildOpenAiResponse({
      ...input,
      chatHistory: optimizedHistory
    });
  }

  return buildMockResponse({
    ...input,
    chatHistory: optimizedHistory
  });
}

module.exports = {
  generateAiResponse,
  optimizeChatHistory
};
