```javascript
import express from "express";
import Groq from "groq-sdk";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
   "https://blastermaster12.github.io"
  );
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
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
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are JARVIS, a calm and intelligent AI assistant inspired by Tony Stark's assistant. Reply naturally in Hindi, Hinglish, or English according to the user's language."
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
