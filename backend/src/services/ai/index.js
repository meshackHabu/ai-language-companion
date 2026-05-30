const { getEnvConfig } = require("../../config/env");
const { buildMockResponse } = require("./providers/mockProvider");
const { buildOpenAiResponse } = require("./providers/openaiProvider");
const { validateAiResponse } = require("./responseValidator"); 

function optimizeChatHistory(chatHistory) {
  const MAX_TURNS = 15;
  
  if (!Array.isArray(chatHistory) || chatHistory.length === 0) {
    return [];
  }

  if (chatHistory.length <= MAX_TURNS) {
    return chatHistory;
  }

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
  const optimizedHistory = optimizeChatHistory(input.chatHistory || []);

  let response;

  try {
    if (env.aiProvider === "openai") {
      response = await buildOpenAiResponse({
        ...input,
        chatHistory: optimizedHistory
      });
    } else {
      response = buildMockResponse({
        ...input,
        chatHistory: optimizedHistory
      });
    }

    // Validate response structure
    return validateAiResponse(response);
    
  } catch (error) {
    console.error("Error generating AI response:", error.message);
    
    // Fallback to mock response if real provider fails
    if (env.aiProvider !== "mock") {
      console.warn("Falling back to mock provider due to error");
      const mockResponse = buildMockResponse({
        ...input,
        chatHistory: optimizedHistory
      });
      return validateAiResponse(mockResponse);
    }
    
    throw error;
  }
}

module.exports = {
  generateAiResponse,
  optimizeChatHistory
};
