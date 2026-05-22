const express = require("express");

const { getDatabase } = require("../db/database");
const { generateAiResponse } = require("../services/ai");

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const {
      userId,
      language,
      scenario,
      learnerMessage,
      weakWords = [],
      targetWords = [],
      chatHistory = []
    } = req.body;

    if (!userId || !language || !scenario || !learnerMessage) {
      return res.status(400).json({
        error: "userId, language, scenario, and learnerMessage are required."
      });
    }

    const db = await getDatabase();
    const createdAt = new Date().toISOString();

    await db.run(
      `INSERT INTO chat_messages (user_id, language, scenario, role, message, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, language, scenario, "user", learnerMessage, createdAt]
    );

    // Pass the full chat history to the AI provider
    const aiResult = await generateAiResponse({
      language,
      scenario,
      learnerMessage,
      weakWords,
      targetWords,
      chatHistory
    });

    await db.run(
      `INSERT INTO chat_messages (user_id, language, scenario, role, message, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, language, scenario, "assistant", aiResult.reply, createdAt]
    );

    res.json(aiResult);
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to generate AI reply." });
  }
});

module.exports = router;
