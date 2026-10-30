import express from "express";
import OpenAI from "openai";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
res.setHeader("Access-Control-Allow-Origin", "https://blastermaster12.github.io");
res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");

if (req.method === "OPTIONS") {
return res.sendStatus(204);
}

next();
});

const openai = new OpenAI({
apiKey: process.env.OPENAI_API_KEY
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

const response = await openai.responses.create({
  model: "gpt-4o-mini",
  instructions: "You are JARVIS, a calm, intelligent AI assistant inspired by Tony Stark's assistant. Reply naturally in Hindi, Hinglish, or English according to the user's language.",
  input: message
});

res.json({
  reply: response.output_text
});

} catch (error) {
console.error("JARVIS Error:", error.message);

res.status(500).json({
  error: "JARVIS brain connection failed."
});

}
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log("JARVIS running on port ${PORT}");
});
