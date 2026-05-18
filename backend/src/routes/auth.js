const express = require("express");
const bcrypt = require("bcryptjs");

const { getDatabase } = require("../db/database");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      goal = "",
      selectedLanguage = "yoruba"
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required."
      });
    }

    const db = await getDatabase();
    const existingUser = await db.get(
      "SELECT id FROM users WHERE email = ?",
      [email.toLowerCase()]
    );

    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email already exists."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();

    const result = await db.run(
      `INSERT INTO users (name, email, password_hash, role, goal, selected_language, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email.toLowerCase(), passwordHash, "user", goal, selectedLanguage, createdAt]
    );

    const newUser = await db.get(
      `SELECT id, name, email, role, goal, selected_language, selected_category, study_mode, created_at
       FROM users WHERE id = ?`,
      [result.lastID]
    );

    res.status(201).json({
      message: "Account created successfully.",
      user: newUser
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to sign up." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required."
      });
    }

    const db = await getDatabase();
    const user = await db.get(
      "SELECT * FROM users WHERE email = ?",
      [email.toLowerCase()]
    );

    if (!user) {
      return res.status(404).json({
        error: "No account found for this email."
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Incorrect password."
      });
    }

    res.json({
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        goal: user.goal,
        selected_language: user.selected_language,
        selected_category: user.selected_category,
        study_mode: user.study_mode,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to log in." });
  }
});

module.exports = router;
