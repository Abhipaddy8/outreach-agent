// Friday — backend "brain".
//
// A tiny Express server with one job: take the conversation so far, ask Claude,
// and stream the reply back token-by-token (Server-Sent Events) so the browser
// can start *speaking* before the whole answer is done.
//
// The brain (Claude) is the only paid part. Voice in/out happens free, on-device,
// in the browser (see public/app.js).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import Anthropic from "@anthropic-ai/sdk";

// --- minimal .env loader (no extra dependency) ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.JARVIS_MODEL || process.env.FRIDAY_MODEL || "claude-opus-4-8";
const PORT = process.env.PORT || 3000;

// Optional: natural voice via ElevenLabs. If no key is set, the browser falls
// back to the free on-device voice automatically.
const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVEN_VOICE = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // "Rachel" (a default)
const ELEVEN_MODEL = process.env.ELEVENLABS_MODEL || "eleven_turbo_v2_5"; // low-latency

if (!API_KEY) {
  console.error("\n  ✗ ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.\n");
  process.exit(1);
}

const client = new Anthropic({ apiKey: API_KEY });

// Load the Friday persona once at boot.
const SYSTEM_PROMPT = fs.readFileSync(
  path.join(__dirname, "persona", "system-prompt.md"),
  "utf8"
);

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Tell the front-end which voice to use.
app.get("/config", (_req, res) => {
  res.json({ tts: ELEVEN_KEY ? "elevenlabs" : "browser" });
});

// POST /tts  { text }  → streams natural-voice audio (audio/mpeg) from ElevenLabs.
// The ElevenLabs key never leaves the server.
app.post("/tts", async (req, res) => {
  if (!ELEVEN_KEY) {
    res.status(400).json({ error: "ElevenLabs not configured" });
    return;
  }
  const text = (req.body?.text || "").toString().trim();
  if (!text) {
    res.status(400).json({ error: "text required" });
    return;
  }
  try {
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVEN_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: ELEVEN_MODEL,
          voice_settings: { stability: 0.4, similarity_boost: 0.8 },
        }),
      }
    );
    if (!upstream.ok || !upstream.body) {
      console.error("ElevenLabs error:", upstream.status, await upstream.text().catch(() => ""));
      res.status(502).json({ error: "tts upstream " + upstream.status });
      return;
    }
    res.setHeader("Content-Type", "audio/mpeg");
    const reader = upstream.body.getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } catch (err) {
    console.error("tts error:", err?.message || err);
    if (!res.headersSent) res.status(500).json({ error: "tts failed" });
    else res.end();
  }
});

// POST /chat  { messages: [{role, content}, ...] }  → SSE stream of {text} chunks
app.post("/chat", async (req, res) => {
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  if (messages.length === 0) {
    res.status(400).json({ error: "messages array required" });
    return;
  }

  // Server-Sent Events headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  try {
    // Stream the reply. We omit `thinking` for the lowest voice latency and keep
    // replies short; the persona instructs Claude to return only its final spoken
    // answer. Caching the system prompt keeps repeated turns cheap.
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 1024,
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      // Friday's first real capability: live web search + page fetch.
      // These run server-side on Anthropic's infra — no extra API key, no MCP.
      // Claude searches automatically when a question needs current info, then
      // keeps streaming its spoken answer. We only forward text to the voice.
      tools: [
        { type: "web_search_20260209", name: "web_search" },
        { type: "web_fetch_20260209", name: "web_fetch" },
      ],
      messages,
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }
    res.write("data: [DONE]\n\n");
  } catch (err) {
    console.error("chat error:", err?.message || err);
    res.write(`data: ${JSON.stringify({ error: err?.message || "model error" })}\n\n`);
  } finally {
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`\n  Friday is listening on http://localhost:${PORT}`);
  console.log(`  Model: ${MODEL}`);
  console.log(`  Voice: ${ELEVEN_KEY ? "ElevenLabs (natural)" : "on-device (browser)"}\n`);
  console.log("  Open it on your iPhone over HTTPS (see README) and tap the orb to talk.\n");
});
