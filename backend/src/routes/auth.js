const express  = require("express");
const bcrypt   = require("bcryptjs");
const crypto   = require("crypto");
const { getDatabase, runMigrations } = require("../db/database");

const router = express.Router();

// ── Helpers ─────────────────────────────────────────────────────────────────
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function tokenExpiresAt(minutesFromNow = 30) {
  return new Date(Date.now() + minutesFromNow * 60 * 1000).toISOString();
}

// ── POST /auth/signup ────────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, goal = "", selectedLanguage = "yoruba" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const db = await getDatabase();
    const existing = await db.get("SELECT id FROM users WHERE email = ?", [email.toLowerCase()]);

    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const createdAt    = new Date().toISOString();

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

    res.status(201).json({ message: "Account created successfully.", user: newUser });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to sign up." });
  }
});

// ── POST /auth/login ─────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const db   = await getDatabase();
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);

    if (!user) {
      return res.status(404).json({ error: "No account found for this email." });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Incorrect password. Try 'Forgot Password' if needed." });
    }

    // Clear any stale reset tokens on successful login
    await db.run(
      "UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
      [user.id]
    );

    res.json({
      message: "Login successful.",
      user: {
        id:                user.id,
        name:              user.name,
        email:             user.email,
        role:              user.role || "user",
        goal:              user.goal,
        selected_language: user.selected_language,
        selected_category: user.selected_category,
        study_mode:        user.study_mode,
        created_at:        user.created_at
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to log in." });
  }
});

// ── POST /auth/forgot-password ───────────────────────────────────────────────
// Generates a reset token and returns it (no email needed for local app)
router.post("/forgot-password", async (req, res) => {
  try {
    await runMigrations();

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const db   = await getDatabase();
    const user = await db.get("SELECT id, name FROM users WHERE email = ?", [email.toLowerCase()]);

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        message: "If an account exists for this email, a reset token has been generated.",
        found: false
      });
    }

    const token     = generateToken();
    const expiresAt = tokenExpiresAt(30); // 30 minutes

    await db.run(
      "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?",
      [token, expiresAt, user.id]
    );

    console.log(`🔑 Password reset token for ${email}: ${token}`);

    res.json({
      message:   "Reset token generated successfully.",
      found:     true,
      token:     token,           // Returned directly since no email server
      expiresAt: expiresAt,
      name:      user.name
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to generate reset token." });
  }
});

// ── POST /auth/reset-password ────────────────────────────────────────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const db   = await getDatabase();
    const user = await db.get(
      "SELECT id, email, reset_token_expires FROM users WHERE reset_token = ?",
      [token]
    );

    if (!user) {
      return res.status(400).json({ error: "Invalid or already-used reset token." });
    }

    // Check expiry
    if (new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({ error: "Reset token has expired. Please request a new one." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db.run(
      "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
      [passwordHash, user.id]
    );

    console.log(`✅ Password reset successful for: ${user.email}`);

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password." });
  }
});

// ── POST /auth/change-password ───────────────────────────────────────────────
router.post("/change-password", async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: "userId, currentPassword, and newPassword are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters." });
    }

    const db   = await getDatabase();
    const user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const matches = await bcrypt.compare(currentPassword, user.password_hash);
    if (!matches) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.run("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, userId]);

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Failed to change password." });
  }
});

module.exports = router;
