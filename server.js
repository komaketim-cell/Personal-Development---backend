import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { buildPrompt } from "./ai_prompt.js";

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Port (Render خودش تنظیم می‌کنه)
const PORT = process.env.PORT || 3000;

// ✅ API Key (فقط از Env)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ✅ Health check (اختیاری ولی مفید)
app.get("/", (req, res) => {
  res.send("✅ Calm Bot Backend is running");
});

// ✅ Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { context } = req.body;

    if (!context) {
      return res.status(400).json({ error: "Context is required" });
    }

    // 🧠 Build prompt safely (from backend only)
    const prompt = buildPrompt(context);

    // 🔗 Call OpenAI
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.4
        })
      }
    );

    const data = await response.json();

    // ✅ Send only the assistant reply to frontend
    res.json({
      reply: data.choices?.[0]?.message?.content || "..."
    });

  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({ error: "AI backend error" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
