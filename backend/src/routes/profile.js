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
