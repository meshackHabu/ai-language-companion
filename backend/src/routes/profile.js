const express = require("express");

const { getDatabase } = require("../db/database");

const router = express.Router();

router.get("/profile/:userId", async (req, res) => {
  try {
    const db = await getDatabase();
    const user = await db.get(
      `SELECT id, name, email, role, goal, selected_language, selected_category, study_mode, created_at
       FROM users WHERE id = ?`,
      [req.params.userId]
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile." });
  }
});

router.patch("/profile/:userId", async (req, res) => {
  try {
    const {
      name,
      goal,
      selectedLanguage,
      selectedCategory,
      studyMode
    } = req.body;

    const db = await getDatabase();
    const user = await db.get("SELECT id FROM users WHERE id = ?", [req.params.userId]);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    await db.run(
      `UPDATE users
       SET name = COALESCE(?, name),
           goal = COALESCE(?, goal),
           selected_language = COALESCE(?, selected_language),
           selected_category = COALESCE(?, selected_category),
           study_mode = COALESCE(?, study_mode)
       WHERE id = ?`,
      [
        name || null,
        goal || null,
        selectedLanguage || null,
        selectedCategory || null,
        studyMode || null,
        req.params.userId
      ]
    );

    const updatedUser = await db.get(
      `SELECT id, name, email, role, goal, selected_language, selected_category, study_mode, created_at
       FROM users WHERE id = ?`,
      [req.params.userId]
    );

    res.json({
      message: "Profile updated.",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile." });
  }
});

module.exports = router;


// ── GET /user/dashboard/:userId ───────────────────────────────────────────────
// Single endpoint that returns everything the profile panel needs
router.get("/dashboard/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const db = await getDatabase();

    // Fetch user
    const user = await db.get(
      `SELECT id, name, email, role, goal, selected_language,
              selected_category, study_mode, created_at
       FROM users WHERE id = ?`,
      [userId]
    );

    if (!user) return res.status(404).json({ error: "User not found." });

    // Word progress
    const wordProgress = await db.all(
      `SELECT language, word, meaning,
              correct_count, wrong_count, review_streak, is_mastered, last_seen_at
       FROM word_progress WHERE user_id = ?
       ORDER BY last_seen_at DESC`,
      [userId]
    );

    // Study sessions
    const sessions = await db.all(
      `SELECT language, activity_type, category, study_mode, created_at
       FROM study_sessions WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    // Chat messages (count unique words practiced via AI chat)
    const chatMessages = await db.all(
      `SELECT language, role, message, created_at
       FROM chat_messages WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    ).catch(() => []); // graceful if table missing

    // ── Compute per-language stats ────────────────────────────────────────────
    const languages = [...new Set([
      ...wordProgress.map(w => w.language),
      ...sessions.map(s => s.language),
      ...chatMessages.map(c => c.language)
    ])];

    const statsByLanguage = {};

    for (const lang of languages) {
      const langProgress = wordProgress.filter(w => w.language === lang);

      const totals = langProgress.reduce((acc, w) => {
        acc.correct += w.correct_count || 0;
        acc.wrong   += w.wrong_count   || 0;
        return acc;
      }, { correct: 0, wrong: 0 });

      const totalAttempts = totals.correct + totals.wrong;
      const practicedCount = langProgress.length;
      const masteredCount  = langProgress.filter(w => w.is_mastered === 1).length;
      const weakCount      = langProgress.filter(
        w => (w.wrong_count || 0) > 0 && w.is_mastered !== 1
      ).length;
      const accuracy = totalAttempts
        ? Math.round((totals.correct / totalAttempts) * 100)
        : 0;

      // Chat turns for this language
      const chatTurns = chatMessages.filter(
        m => m.language === lang && m.role === "user"
      ).length;

      // Study streak
      const langSessions = sessions
        .filter(s => s.language === lang)
        .map(s => s.created_at.split("T")[0]);
      const uniqueDays = [...new Set(langSessions)].sort();

      let streak = 0;
      let cursor = new Date();
      cursor.setHours(0, 0, 0, 0);

      for (let i = uniqueDays.length - 1; i >= 0; i--) {
        const dayKey = cursor.toISOString().split("T")[0];
        if (uniqueDays[i] === dayKey) {
          streak++;
          cursor.setDate(cursor.getDate() - 1);
        } else if (uniqueDays[i] > dayKey) {
          continue;
        } else {
          break;
        }
      }

      statsByLanguage[lang] = {
        practicedCount,
        masteredCount,
        weakCount,
        accuracy,
        totalAttempts,
        chatTurns,
        streak
      };
    }

    res.json({
      user,
      wordProgress,
      sessions,
      chatMessages: chatMessages.length,
      statsByLanguage
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats." });
  }
});
