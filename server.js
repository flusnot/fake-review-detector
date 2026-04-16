require("dotenv").config();

const express = require("express");
const rateLimit = require("express-rate-limit");
const Groq = require("groq-sdk");

const app = express();
app.use(express.json());

// CORS — allow GitHub Pages demo site to call the API
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // 10 requests per minute per IP
  message: { error: "Too many requests, please try again in a minute." },
});

const demoLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3,              // 3 requests per minute per IP (protect Groq free tier)
  message: { error: "Too many demo requests, please wait a minute." },
});

app.use("/api/detect-fake-review", limiter);
app.use("/demo/detect", demoLimiter);

const SYSTEM_PROMPT = `You are an expert at detecting fake or incentivized reviews. Analyze the review and return ONLY a JSON object with these fields:
fake_score (0-100, where 100 = definitely fake),
verdict (genuine/suspicious/likely_fake),
reasons (array of max 3 short strings explaining why)`;

app.post("/api/detect-fake-review", async (req, res) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { review_text, product_type } = req.body;

  if (!review_text) {
    return res.status(400).json({ error: "review_text is required" });
  }

  try {
    const userMessage = product_type
      ? `Product type: ${product_type}\n\nReview: ${review_text}`
      : `Review: ${review_text}`;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return res.json(result);
  } catch (err) {
    console.error("Analysis error:", err);
    return res.status(500).json({ error: "analysis failed" });
  }
});

// Public demo endpoint — no API key required, used by GitHub Pages demo site
app.post("/demo/detect", async (req, res) => {
  const { review_text, product_type } = req.body;

  if (!review_text) {
    return res.status(400).json({ error: "review_text is required" });
  }

  if (review_text.length > 1000) {
    return res.status(400).json({ error: "review_text must be 1000 characters or fewer" });
  }

  try {
    const userMessage = product_type
      ? `Product type: ${product_type}\n\nReview: ${review_text}`
      : `Review: ${review_text}`;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return res.json(result);
  } catch (err) {
    console.error("Demo analysis error:", err);
    return res.status(500).json({ error: "analysis failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Fake review detector listening on port ${PORT}`);
});
