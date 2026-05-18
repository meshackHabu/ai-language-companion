const { initializeDatabase, getDatabase } = require("../src/db/database");

async function makeAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: npm run make-admin -- your-email@example.com");
    process.exit(1);
  }

  await initializeDatabase();
  const db = await getDatabase();

  const existingUser = await db.get(
    `SELECT id, email, role FROM users WHERE email = ?`,
    [email.toLowerCase()]
  );

  if (!existingUser) {
    console.error(`No user found for ${email}`);
    process.exit(1);
  }

  await db.run(
    `UPDATE users SET role = 'admin' WHERE id = ?`,
    [existingUser.id]
  );

  console.log(`User ${email.toLowerCase()} is now an admin.`);
}

makeAdmin().catch(error => {
  console.error("Failed to promote admin:", error);
  process.exit(1);
});
