
import express from "express";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://blastermaster12.github.io"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const SYSTEM_PROMPT = `
You are JARVIS — GOD SYSTEM, a caring and intelligent AI companion.

- Address the user respectfully as Sir.
- Be friendly, natural, helpful and trustworthy.
- Understand Hindi, Hinglish and English.
- Reply in Roman Hinglish for Hindi/Hinglish input.
- Reply in English for English input.
- Never use Devanagari script.
- Use saved memories to understand the user.
- Never pretend to remember something that is not available.
`;

app.get("/", (req, res) => {
  res.send("JARVIS GOD SYSTEM is online.");
});

app.post("/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (
      typeof message !== "string" ||
      !message.trim() ||
      typeof sessionId !== "string" ||
      !/^[a-zA-Z0-9-]{1,100}$/.test(sessionId)
    ) {
      return res.status(400).json({
        error: "Valid message and sessionId required."
      });
    }

    // Load saved memories
    const { data: memories, error: memoryError } =
      await supabase
        .from("jarvis_memories")
        .select("id, memory")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(30);

    if (memoryError) throw memoryError;

    const memoryText = (memories || [])
      .map(item => item.memory)
      .join("\n");

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content:
            SYSTEM_PROMPT +
            "\n\nSAVED USER MEMORIES:\n" +
            (memoryText || "No saved memories yet.")
        },
        {
          role: "user",
          content: message.trim()
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "Sorry Sir, I could not generate a response.";

    // Save information only when user explicitly asks to remember it
    if (/\b(remember|save this|don't forget|do not forget|yaad rakhna|yaad rakh)\b/i.test(message)) {
      const { error: saveError } = await supabase
        .from("jarvis_memories")
        .insert({
          session_id: sessionId,
          memory: message.trim()
        });

      if (saveError) throw saveError;
    }

    res.json({ reply });

  } catch (error) {
    console.error("JARVIS Error:", error.message);
    res.status(500).json({
      error: "JARVIS brain connection failed."
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("JARVIS running on port " + PORT);
});
