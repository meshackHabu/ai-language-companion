const express = require("express");

const { getDatabase } = require("../db/database");

const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const db = await getDatabase();

    const progress = await db.all(
      `SELECT language, word, meaning, correct_count, wrong_count, review_streak, is_mastered, last_seen_at
       FROM word_progress
       WHERE user_id = ?
      ORDER BY last_seen_at DESC`,
      [req.params.userId]
    );

    const sessions = await db.all(
      `SELECT language, activity_type, category, study_mode, created_at
       FROM study_sessions
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.params.userId]
    );

    res.json({ progress, sessions });
  } catch (error) {
    console.error("Get progress error:", error);
    res.status(500).json({ error: "Failed to fetch progress." });
  }
});

router.post("/answer", async (req, res) => {
  try {
    const {
      userId,
      language,
      category = "all",
      studyMode = "level",
      activityType = "quiz",
      word,
      meaning,
      wasCorrect
    } = req.body;

    if (!userId || !language || !word || !meaning || typeof wasCorrect !== "boolean") {
      return res.status(400).json({
        error: "userId, language, word, meaning, and wasCorrect are required."
      });
    }

    const db = await getDatabase();
    const now = new Date().toISOString();

    const existing = await db.get(
      `SELECT * FROM word_progress
       WHERE user_id = ? AND language = ? AND word = ? AND meaning = ?`,
      [userId, language, word, meaning]
    );

    if (!existing) {
      await db.run(
        `INSERT INTO word_progress (
          user_id, language, word, meaning,
          correct_count, wrong_count, review_streak, is_mastered, last_seen_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          language,
          word,
          meaning,
          wasCorrect ? 1 : 0,
          wasCorrect ? 0 : 1,
          wasCorrect ? 1 : 0,
          0,
          now
        ]
      );
    } else {
      const nextCorrectCount = existing.correct_count + (wasCorrect ? 1 : 0);
      const nextWrongCount = existing.wrong_count + (wasCorrect ? 0 : 1);
      const nextReviewStreak = wasCorrect ? existing.review_streak + 1 : 0;
      const nextIsMastered = nextReviewStreak >= 3 ? 1 : 0;

      await db.run(
        `UPDATE word_progress
         SET correct_count = ?,
             wrong_count = ?,
             review_streak = ?,
             is_mastered = ?,
             last_seen_at = ?
         WHERE id = ?`,
        [
          nextCorrectCount,
          nextWrongCount,
          nextReviewStreak,
          nextIsMastered,
          now,
          existing.id
        ]
      );
    }

    await db.run(
      `INSERT INTO study_sessions (user_id, language, activity_type, category, study_mode, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, language, activityType, category, studyMode, now]
    );

    const updatedWord = await db.get(
      `SELECT language, word, meaning, correct_count, wrong_count, review_streak, is_mastered, last_seen_at
       FROM word_progress
       WHERE user_id = ? AND language = ? AND word = ? AND meaning = ?`,
      [userId, language, word, meaning]
    );

    res.json({
      message: "Progress saved.",
      wordProgress: updatedWord
    });
  } catch (error) {
    console.error("Save answer error:", error);
    res.status(500).json({ error: "Failed to save progress." });
  }
});

module.exports = router;
