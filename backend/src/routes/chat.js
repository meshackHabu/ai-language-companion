const express = require("express");

const { getDatabase } = require("../db/database");
const { generateAiResponse } = require("../services/ai");
const { getEnvConfig } = require("../config/env");

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const {
      userId,
      language,
      scenario,
      learnerMessage,
      weakWords = [],
      targetWords = [],
      chatHistory = []
    } = req.body;

    if (!userId || !language || !scenario || !learnerMessage) {
      return res.status(400).json({
        error: "userId, language, scenario, and learnerMessage are required."
      });
    }

    const db = await getDatabase();
    const createdAt = new Date().toISOString();

    await db.run(
      `INSERT INTO chat_messages (user_id, language, scenario, role, message, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, language, scenario, "user", learnerMessage, createdAt]
    );

    // Pass the full chat history to the AI provider
    const aiResult = await generateAiResponse({
      language,
      scenario,
      learnerMessage,
      weakWords,
      targetWords,
      chatHistory
    });

    await db.run(
      `INSERT INTO chat_messages (user_id, language, scenario, role, message, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, language, scenario, "assistant", aiResult.reply, createdAt]
    );

    res.json(aiResult);
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to generate AI reply." });
  }
});

router.post("/chat/stream", async (req, res) => {
  try {
    const { message, history = [], scenario } = req.body;
    const env = getEnvConfig();

    if (!message || !scenario) {
      return res.status(400).json({ error: "message and scenario are required." });
    }

    if (env.aiProvider !== "openai") {
      return res.status(501).json({ error: "Streaming is only supported for the OpenAI provider." });
    }

    const scenarioRole = String(scenario || "language coach").replace(/[_-]+/g, " ");
    const scenarioInstructions = `You are speaking as a ${scenarioRole}. Stay fully in character and keep the learner engaged with a conversational reply.`;
    const tutoringRules = [
      "Always respond conversationally and keep the dialogue moving.",
      "Do not stop the practice flow unless the learner asks to end the conversation.",
      "Prioritize short, useful replies that encourage the learner to continue.",
      "Keep the tone supportive, clear, and easy to understand.",
      "Avoid any metadata, JSON, or extraneous commentary in the assistant response."
    ].join(" ");

    const systemPrompt = [
      `You are ${scenarioRole} in a language learning conversation.`,
      `Scenario: ${scenario}`,
      scenarioInstructions,
      tutoringRules
    ].join("\n");

    const recentTurns = Array.isArray(history)
      ? history.filter(turn => turn.role === "user" || turn.role === "assistant").slice(-15)
      : [];
    const messages = [
      { role: "system", content: systemPrompt },
      ...recentTurns.map((turn) => ({ role: turn.role, content: turn.content || "" })),
      { role: "user", content: message }
    ];

    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.openAiApiKey}`
      },
      body: JSON.stringify({
        model: env.openAiModel,
        temperature: 0.5,
        stream: true,
        messages
      })
    });

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      return res.status(openAiResponse.status).send(errorText || openAiResponse.statusText);
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Transfer-Encoding", "chunked");

    const reader = openAiResponse.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffered = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffered += decoder.decode(value, { stream: true });
      const lines = buffered.split("\n");
      buffered = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;

        const payload = trimmed.replace(/^data:\s*/, "");
        if (payload === "[DONE]") {
          res.end();
          return;
        }

        try {
          const parsed = JSON.parse(payload);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            res.write(content);
          }
        } catch (parseError) {
          continue;
        }
      }
    }

    if (buffered.trim() && buffered.trim() !== "[DONE]") {
      const payload = buffered.replace(/^data:\s*/, "");
      try {
        const parsed = JSON.parse(payload);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          res.write(content);
        }
      } catch (parseError) {
        // ignore trailing parse errors
      }
    }

    res.end();
  } catch (error) {
    console.error("Streaming chat error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to stream AI response." });
    } else {
      res.end();
    }
  }
});

module.exports = router;

