# CLAUDE.md — Fake Review Detector API

## Project Overview

This is a side hustle API project built to generate passive income. The goal is to run it at zero cost, list it on API marketplaces, and let it earn money without requiring active maintenance. It is NOT a main focus — it is designed to be lightweight, self-sustaining, and low-effort to manage.

The API uses AI to analyze product review text and determine whether it is genuine, suspicious, or likely fake. It returns a structured JSON response that developers can integrate directly into their applications.

---

## Business Model

- Listed on **RapidAPI Hub** at: `https://rapidapi.com/flusnot/api/fake-review-detector`
- **Free tier:** 5 requests/hour — lets users test before committing
- **Pro tier:** $9.99/month, 100 requests/hour
- Payouts go to **PayPal**: judahroekle@gmail.com
- RapidAPI takes ~20% cut, remainder goes to PayPal automatically
- No Stripe setup needed — RapidAPI handles all billing and customer management

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **AI Provider:** Groq (free tier) — using model `llama-3.3-70b-versatile` or similar
- **Key packages:** `express`, `@anthropic-ai/sdk` (may be replaced by groq-sdk), `dotenv`
- **Hosting:** Render.com free tier
- **Repo:** https://github.com/flusnot/fake-review-detector

---

## Why Groq Instead of Anthropic

Originally built with Anthropic Claude (`claude-sonnet-4-20250514`), but the Anthropic API key associated with the project (judahroekle@gmail.com) had insufficient credits. Switched to **Groq free tier** to avoid any cost. Groq provides fast inference on open-source models at no charge.

If the project starts generating revenue, consider switching back to Anthropic for better accuracy.

---

## API Endpoint

### `POST /api/detect-fake-review`

**Authentication:** Header `x-api-key` must match `process.env.API_KEY`

**Request body:**
```json
{
  "review_text": "This product is absolutely amazing!!!",
  "product_type": "blender"
}
```

**Response:**
```json
{
  "fake_score": 85,
  "verdict": "likely_fake",
  "reasons": [
    "Overly enthusiastic language",
    "Reviewer admits to receiving free product",
    "Lack of specific product details"
  ]
}
```

**Fields:**
- `fake_score` — 0 to 100, where 100 = definitely fake
- `verdict` — one of: `genuine`, `suspicious`, `likely_fake`
- `reasons` — array of up to 3 short strings explaining the verdict

**Error response:**
```json
{ "error": "analysis failed" }
```

---

## System Prompt Sent to AI

```
You are an expert at detecting fake or incentivized reviews. Analyze the review and return ONLY a JSON object with these fields:
fake_score (0-100, where 100 = definitely fake),
verdict (genuine/suspicious/likely_fake),
reasons (array of max 3 short strings explaining why)
```

---

## Environment Variables

```
API_KEY=frd-k9Xm2pQvL8nJwR4tYhBzC7eA
GROQ_API_KEY=<your groq key from console.groq.com>
PORT=3000 (Render sets this automatically to 10000)
```

- `.env` file is gitignored — never commit it
- `.env.example` is committed as a template
- On Render, environment variables are set in the dashboard under Environment tab

---

## Deployment — Render.com

- **Service URL:** `https://fake-review-detector-9747.onrender.com`
- **Plan:** Free
- **Build command:** `npm install`
- **Start command:** `node server.js`
- **Branch:** master
- **Auto-deploy:** enabled on push to master

**Important:** Free tier spins down after 15 minutes of inactivity. First request after idle takes ~30-50 seconds to wake up. This is disclosed in the RapidAPI listing description.

---

## RapidAPI Listing Details

- **Name:** Fake Review Detector
- **Category:** Text Analysis
- **Short description:** Detect fake, incentivized, or suspicious product reviews using AI. Returns a fake score, verdict, and reasons.
- **Long description includes:** fake_score explanation, verdict options, reasons field, 50-second cold start disclaimer
- **Endpoint configured:** `POST /api/detect-fake-review`
- **Security scheme:** API Key in Header with key name `x-api-key`, value set to the API_KEY env var
- **Visibility:** Public
- **Recommended plan:** Pro

---

## RapidAPI Security Setup

RapidAPI forwards requests to Render with the `x-api-key` header automatically injected. The value stored in RapidAPI's security configuration is `frd-k9Xm2pQvL8nJwR4tYhBzC7eA`. Customers never see this key — they only use their RapidAPI key.

---

## ProductHunt Launch

- **Status:** Scheduled (Tuesday or Wednesday after April 15, 2026)
- **Tagline:** Instantly detect fake or incentivized product reviews with AI
- **First comment written:** Yes (explains motivation and use case)
- **Pricing selected:** Paid with free plan
- **Funding:** Bootstrapped

---

## Marketing Efforts Completed

- Reddit comment posted in r/SideProject on fake review thread
- Reddit comment posted in r/FulfillmentByAmazon on "Has anyone else been hit with fake 1-star reviews?" thread
- dev.to article published: "I built a fake review detector API in a weekend (and listed it for sale)"
- ProductHunt launch scheduled

---

## Known Limitations

1. **Groq free tier rate limits** — if multiple customers hit the API simultaneously, requests may fail. If traffic picks up, upgrade to paid Groq or switch back to Anthropic.
2. **Render free tier cold starts** — 30-50 second delay after inactivity. Disclosed in listing.
3. **AI accuracy** — model is good but not perfect. Some genuine reviews may be flagged; some fake ones may pass. Inherent limitation of AI-based detection.
4. **No per-customer rate limiting** — one heavy free user could consume Groq quota affecting all users. Consider adding rate limiting middleware if this becomes an issue.

---

## Future Improvements (if revenue justifies it)

- Add bulk review analysis endpoint (multiple reviews in one request)
- Switch AI provider to Anthropic for better accuracy
- Add confidence intervals to the response
- Upgrade Render to paid tier to eliminate cold starts
- Add request logging to a database for analytics

---

## File Structure

```
fake-review-detector/
├── server.js         # Main Express API — single file
├── package.json      # Dependencies: express, groq-sdk (or @anthropic-ai/sdk), dotenv
├── package-lock.json
├── Procfile          # web: node server.js
├── .env              # Secret keys — NEVER commit this
├── .env.example      # Template — committed to repo
├── .gitignore        # Ignores node_modules and .env
└── CLAUDE.md         # This file
```

---

## How to Run Locally

```bash
# Install dependencies
npm install

# Create .env file with your keys (see .env.example)

# Start server
node server.js

# Test with PowerShell
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/detect-fake-review" -Headers @{"Content-Type"="application/json"; "x-api-key"="frd-k9Xm2pQvL8nJwR4tYhBzC7eA"} -Body '{"review_text": "AMAZING product!!!", "product_type": "blender"}'
```

---

## Account Info (for reference only — no secrets here)

- GitHub: flusnot
- RapidAPI: flusnot
- Render: connected via GitHub OAuth
- ProductHunt: flusnot
- PayPal payout: judahroekle@gmail.com
- dev.to: flusnot
