require("dotenv").config();

const express = require("express");
const rateLimit = require("express-rate-limit");
const Groq = require("groq-sdk");

const app = express();
app.use(express.json());

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // 10 requests per minute per IP
  message: { error: "Too many requests, please try again in a minute." },
});

app.use("/api/detect-fake-review", limiter);

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Fake review detector listening on port ${PORT}`);
});
