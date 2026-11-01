
import express from "express";
import Groq from "groq-sdk";

const app = express();

app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://blastermaster12.github.io"
  );

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Temporary conversation memory
const sessions = new Map();

const MAX_HISTORY = 20;

const SYSTEM_PROMPT = `
You are JARVIS — GOD SYSTEM, a highly intelligent personal AI companion.

PERSONALITY:
- Behave like a caring, intelligent and trustworthy friend.
- Also act as a capable personal assistant, advisor and teacher.
- Be calm, friendly, natural and conversational.
- Address the user respectfully as Sir.
- Listen carefully and understand the user's complete situation.
- Explain things clearly and give practical advice.
- Remember the context of the current conversation.
- Never pretend to remember information that is not in the conversation.
- Ask questions when important details are missing.
- Do not blindly agree; politely correct mistakes when necessary.
- Use light humour naturally when appropriate.

LANGUAGE RULES:
- Always use English/Roman alphabet.
- Never use Devanagari or Hindi script.
- Understand Hindi, Hinglish and English.
- Hindi input: reply in natural Roman Hinglish.
- Hinglish input: reply in natural Roman Hinglish.
- English input: reply in English.
- Never write Hindi words using Devanagari characters.

CONVERSATION:
- Treat the user like a friend, not just someone giving commands.
- Understand follow-up questions using previous messages.
- Keep answers clear and natural.
- Do not repeat greetings unnecessarily.
`;

app.get("/", (req, res) => {
  res.send("JARVIS GOD SYSTEM is online.");
});

app.post("/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please send a valid message."
      });
    }

    if (
      typeof sessionId !== "string" ||
      !/^[a-zA-Z0-9-]{1,100}$/.test(sessionId)
    ) {
      return res.status(400).json({
        error: "A valid sessionId is required."
      });
    }

    // Get existing conversation or create a new one
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, []);
    }

    const history = sessions.get(sessionId);

    const userMessage = {
      role: "user",
      content: message.trim()
    };

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",

      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        ...history,
        userMessage
      ],

      temperature: 0.7,
      max_tokens: 800
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "Sorry Sir, I could not generate a response.";

    // Save both sides of the conversation
    history.push(userMessage);
    history.push({
      role: "assistant",
      content: reply
    });

    // Keep only the latest 20 messages
    if (history.length > MAX_HISTORY) {
      history.splice(0, history.length - MAX_HISTORY);
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
