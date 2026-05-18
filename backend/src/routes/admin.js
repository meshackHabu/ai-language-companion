const express = require("express");

const { getDatabase } = require("../db/database");

const router = express.Router();

async function requireAdmin(req, res) {
  const db = await getDatabase();
  const requesterId = req.header("x-admin-user-id");

  if (!requesterId) {
    res.status(401).json({ error: "Admin user id header is required." });
    return null;
  }

  const requester = await db.get(
    `SELECT id, role, email FROM users WHERE id = ?`,
    [requesterId]
  );

  if (!requester) {
    res.status(404).json({ error: "Requesting user not found." });
    return null;
  }

  if ((requester.role || "user") !== "admin") {
    res.status(403).json({ error: "Admin access only." });
    return null;
  }

  return { db, requester };
}

router.get("/overview", async (req, res) => {
  try {
    const adminContext = await requireAdmin(req, res);

    if (!adminContext) {
      return;
    }

    const { db } = adminContext;

    const users = await db.all(
      `SELECT id, name, email, role, goal, selected_language, selected_category, study_mode, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    const progress = await db.all(
      `SELECT user_id, language, word, meaning, correct_count, wrong_count, review_streak, is_mastered, last_seen_at
       FROM word_progress
       ORDER BY last_seen_at DESC`
    );

    const sessions = await db.all(
      `SELECT user_id, language, activity_type, category, study_mode, created_at
       FROM study_sessions
       ORDER BY created_at DESC`
    );

    const chats = await db.all(
      `SELECT user_id, language, scenario, role, message, created_at
       FROM chat_messages
       ORDER BY created_at DESC
       LIMIT 100`
    );

    res.json({
      users,
      progress,
      sessions,
      chats
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({ error: "Failed to fetch admin overview." });
  }
});

module.exports = router;
