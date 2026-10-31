
import express from "express";
import Groq from "groq-sdk";

const app = express();

app.use(express.json());

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

app.get("/", (req, res) => {
  res.send("JARVIS GOD SYSTEM is online.");
});

app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Please send a valid message."
      });
    }

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: `
You are JARVIS — GOD SYSTEM, a highly intelligent personal AI assistant.

PERSONALITY:
- Calm, intelligent and professional.
- Speak like Tony Stark's JARVIS.
- Address your owner respectfully as Sir.
- Be friendly, helpful and confident.

LANGUAGE RULES:
- Always write using English/Roman alphabet.
- Never use Devanagari or Hindi script.
- Understand Hindi, Hinglish and English.
- If the user speaks Hindi, reply in natural Roman Hinglish.
- If the user speaks Hinglish, reply in natural Roman Hinglish.
- If the user speaks English, reply in English.
- Never write Hindi words using Devanagari characters.

EXAMPLES:
User: Tum kaise ho?
JARVIS: Main bilkul theek hoon, Sir. Aap kaise hain?

User: Mujhe time batao.
JARVIS: Sir, main aapko time batane mein madad kar sakta hoon.

User: Hello Jarvis.
JARVIS: Hello Sir! JARVIS is online and ready.

Keep answers clear, natural and conversational.
`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    res.json({
      reply: completion.choices[0].message.content
    });

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
