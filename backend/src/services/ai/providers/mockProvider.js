function buildMockResponse(input) {
  const { scenario, learnerMessage, weakWords = [], targetWords = [], chatHistory = [] } = input;
  const nextTarget = targetWords[0] || weakWords[0] || null;

  const hasHistory = Array.isArray(chatHistory) && chatHistory.length > 0;
  const historyContext = hasHistory 
    ? ` You've been discussing this for ${chatHistory.length} messages.`
    : "";

  const reply = nextTarget
    ? `Good try. Continue this ${scenario} conversation${historyContext} and include "${nextTarget.word}" in your next reply.`
    : `Good try. Continue this ${scenario} conversation${historyContext} with one more natural sentence.`;

  // Add mock corrections if there are weak words to practice
  const corrections = weakWords.length > 0 
    ? [{
        original: learnerMessage,
        corrected: learnerMessage.charAt(0).toUpperCase() + learnerMessage.slice(1) + ".",
        explanation: "Consider adding punctuation and capitalizing the first word."
      }]
    : [];

  return {
    reply,
    corrections,  // ✅ NOW INCLUDED
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
