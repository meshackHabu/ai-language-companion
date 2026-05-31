const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let database;

async function getDatabase() {
  if (!database) {
    database = await open({
      filename: path.join(__dirname, "../../data/app.db"),
      driver: sqlite3.Database
    });
  }

  return database;
}

async function initializeDatabase() {
  const db = await getDatabase();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      goal TEXT DEFAULT '',
      selected_language TEXT DEFAULT 'yoruba',
      selected_category TEXT DEFAULT 'all',
      study_mode TEXT DEFAULT 'level',
      reset_token TEXT,
      reset_token_expires TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS word_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      language TEXT NOT NULL,
      word TEXT NOT NULL,
      meaning TEXT NOT NULL,
      correct_count INTEGER DEFAULT 0,
      wrong_count INTEGER DEFAULT 0,
      review_streak INTEGER DEFAULT 0,
      is_mastered INTEGER DEFAULT 0,
      last_seen_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      language TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      category TEXT DEFAULT 'all',
      study_mode TEXT DEFAULT 'level',
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      language TEXT NOT NULL,
      scenario TEXT NOT NULL,
      role TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Always ensure reset_token columns exist (safe to run every startup)
  await runMigrations();

  const userColumns = await db.all(`PRAGMA table_info(users)`);
  const hasRoleColumn = userColumns.some(column => column.name === "role");

  if (!hasRoleColumn) {
    await db.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`);
  }

  return db;
}



// Migration: add password reset columns if not present
async function runMigrations() {
  const db = await getDatabase();
  const cols = await db.all('PRAGMA table_info(users)');
  const names = cols.map(c => c.name);

  if (!names.includes('reset_token')) {
    await db.exec(`ALTER TABLE users ADD COLUMN reset_token TEXT`);
    console.log('✅ Migration: added reset_token column');
  }
  if (!names.includes('reset_token_expires')) {
    await db.exec(`ALTER TABLE users ADD COLUMN reset_token_expires TEXT`);
    console.log('✅ Migration: added reset_token_expires column');
  }
  return db;
}

module.exports = {
  getDatabase,
  initializeDatabase,
  runMigrations
};
