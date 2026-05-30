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

    if (!language || !scenario || !learnerMessage) {
      return res.status(400).json({
        error: "language, scenario, and learnerMessage are required."
      });
    }

    // Generate AI response
    const aiResult = await generateAiResponse({
      language,
      scenario,
      learnerMessage,
      weakWords,
      targetWords,
      chatHistory
    });

    // Save to database only if userId is provided
    if (userId) {
      try {
        const db = await getDatabase();
        const createdAt = new Date().toISOString();

        await db.run(
          `INSERT INTO chat_messages (user_id, language, scenario, role, message, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, language, scenario, "user", learnerMessage, createdAt]
        );

        await db.run(
          `INSERT INTO chat_messages (user_id, language, scenario, role, message, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, language, scenario, "assistant", aiResult.reply, createdAt]
        );
      } catch (dbError) {
        // Log DB error but don't fail the request
        console.warn("DB save warning (non-fatal):", dbError.message);
      }
    }

    res.json(aiResult);

  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Failed to generate AI reply.",
      details: error.message
    });
  }
});

module.exports = router;
