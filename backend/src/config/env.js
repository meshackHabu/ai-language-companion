function getEnvConfig() {
  return {
    port: Number(process.env.PORT || 4000),
    aiProvider: (process.env.AI_PROVIDER || "mock").toLowerCase(),
    openAiApiKey: process.env.OPENAI_API_KEY || "",
    openAiModel: process.env.OPENAI_MODEL || "gpt-4o-mini"
  };
}

module.exports = {
  getEnvConfig
};
