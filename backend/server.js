require("dotenv").config();

const express = require("express");
const cors = require("cors");

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

// Configure CORS options
const corsOptions = {
  origin: 'http://localhost:5501', // Allow only your frontend port
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "AI Language Companion backend is running."
  });
});

app.use("/auth", authRoutes);
app.use("/user", profileRoutes);
app.use("/progress", progressRoutes);
app.use("/ai", chatRoutes);
app.use("/api", chatRoutes);
app.use("/admin", adminRoutes);

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT} (AI provider: ${env.aiProvider})`);
    });
  })
  .catch(error => {
    console.error("Failed to start backend:", error);
  });
