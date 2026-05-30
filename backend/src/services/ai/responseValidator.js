function validateAiResponse(response) {
  /**
   * Validate that the response matches the expected structure:
   * {
   *   reply: string (required),
   *   corrections: Array<{original, corrected, explanation}> (optional, default []),
   *   feedback: {correction, explanation, challenge} (optional)
   * }
   */
  
  if (!response || typeof response !== 'object') {
    throw new Error("Response must be an object");
  }

  // Validate reply
  if (!response.reply || typeof response.reply !== 'string') {
    throw new Error("Response must have a 'reply' property that is a non-empty string");
  }

  // Validate and normalize corrections
  if (response.corrections !== undefined && !Array.isArray(response.corrections)) {
    throw new Error("'corrections' must be an array or undefined");
  }

  const corrections = response.corrections || [];
  
  for (let i = 0; i < corrections.length; i++) {
    const correction = corrections[i];
    if (!correction.original || !correction.corrected || !correction.explanation) {
      throw new Error(
        `Correction at index ${i} must have 'original', 'corrected', and 'explanation' fields`
      );
    }
  }

  // Validate and provide default feedback
  const feedback = response.feedback || {
    correction: "Good effort!",
    explanation: "Keep practicing to improve your language skills.",
    challenge: "Continue the conversation naturally."
  };

  if (feedback.correction === undefined || feedback.explanation === undefined || feedback.challenge === undefined) {
    throw new Error("Feedback must have 'correction', 'explanation', and 'challenge' fields");
  }

  return {
    reply: response.reply.trim(),
    corrections: corrections.map(c => ({
      original: String(c.original).trim(),
      corrected: String(c.corrected).trim(),
      explanation: String(c.explanation).trim()
    })),
    feedback: {
      correction: String(feedback.correction).trim(),
      explanation: String(feedback.explanation).trim(),
      challenge: String(feedback.challenge).trim()
    }
  };
}

module.exports = {
  validateAiResponse
};