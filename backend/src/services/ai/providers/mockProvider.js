function buildMockResponse(input) {
  const { scenario, learnerMessage, weakWords = [], targetWords = [] } = input;
  const nextTarget = targetWords[0] || weakWords[0] || null;

  const reply = nextTarget
    ? `Good try. Continue this ${scenario} conversation and include "${nextTarget.word}" in your next reply.`
    : `Good try. Continue this ${scenario} conversation with one more natural sentence.`;

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
      provider: "mock"
    }
  };
}

module.exports = {
  buildMockResponse
};
