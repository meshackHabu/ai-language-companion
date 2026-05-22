function buildMockResponse(input) {
  const { scenario, learnerMessage, weakWords = [], targetWords = [], chatHistory = [] } = input;
  const nextTarget = targetWords[0] || weakWords[0] || null;

  // Check if chat history is provided
  const hasHistory = Array.isArray(chatHistory) && chatHistory.length > 0;
  const historyContext = hasHistory 
    ? ` You've been discussing this for ${chatHistory.length} messages.`
    : "";

  const reply = nextTarget
    ? `Good try. Continue this ${scenario} conversation${historyContext} and include "${nextTarget.word}" in your next reply.`
    : `Good try. Continue this ${scenario} conversation${historyContext} with one more natural sentence.`;

  return {
    reply,
    feedback: {
      correction: `Smoother version: "${learnerMessage.charAt(0).toUpperCase() + learnerMessage.slice(1)}."`,
      explanation: weakWords.length
        ? `Try to reuse one of your weak words: ${weakWords.map(item => item.word).join(", ")}.`
        : "Keep your sentence short and natural.",
      challenge: nextTarget
        ? `Next challenge: answer again and include "${nextTarget.word}".`
        : "Next challenge: answer again with one extra detail."
    },
    meta: {
      provider: "mock",
      historyLength: chatHistory?.length || 0
    }
  };
}

module.exports = {
  buildMockResponse
};
