require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const { getEnvConfig } = require("./src/config/env");
const { initializeDatabase } = require("./src/db/database");
const authRoutes = require("./src/routes/auth");
const profileRoutes = require("./src/routes/profile");
const progressRoutes = require("./src/routes/progress");
const chatRoutes = require("./src/routes/chat");
const adminRoutes = require("./src/routes/admin");

const app = express();
const env = getEnvConfig();
const PORT = env.port;

// Allow all origins in development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(express.json());

// ✅ Serve frontend static files from the parent directory
const frontendPath = path.join(__dirname, "..");
app.use(express.static(frontendPath));

// API routes
app.use("/auth", authRoutes);
app.use("/user", profileRoutes);
app.use("/progress", progressRoutes);
app.use("/ai", chatRoutes);
app.use("/admin", adminRoutes);

// ✅ Serve frontend HTML files for all non-API routes
app.get("*.html", (req, res) => {
  const filePath = path.join(frontendPath, req.path);
  res.sendFile(filePath, (err) => {
    if (err) res.status(404).send("Page not found");
  });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
      console.log(`✅ AI provider: ${env.aiProvider}`);
      console.log(`✅ Open your app at: http://localhost:${PORT}/index.html`);
    });
  })
  .catch(error => {
    console.error("Failed to start backend:", error);
  });
