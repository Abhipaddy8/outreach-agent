# CLAUDE.md — Friday (voice assistant)

Project context for Claude Code. Read this first; it's where we are and where we're going.

## What Friday is
A continuous **voice-chat assistant** in the spirit of Tony Stark's Friday. You open it
in a browser (especially iPhone Safari), tap the orb once, and **talk** — it transcribes
your speech, asks Claude, and **speaks the reply out loud automatically** (not a voice
note you tap). Then it listens again.

Design principle: **the brain (Claude) is the only paid part.** Voice in/out is free
on-device by default; everything else uses free/open tooling.

```
you speak → browser STT → Claude (streamed) → spoken reply → repeat
```

## How it works
- `server.js` — Express backend. `POST /chat` streams Claude's reply over SSE so the
  browser can start speaking before the full answer lands. Also `POST /tts` (ElevenLabs
  proxy) and `GET /config` (tells the front-end which voice mode to use).
- `persona/system-prompt.md` — Friday's personality + voice rules (concise, plain spoken
  sentences, dry wit, final-answer-only). Loaded at boot and prompt-cached.
- `public/index.html` + `app.js` + `styles.css` — the orb UI (a PWA). `app.js` runs the
  voice loop: listen → ask → speak → repeat, with a speech queue and barge-in.

## Run it
```bash
cp .env.example .env     # add ANTHROPIC_API_KEY (and optionally ELEVENLABS_API_KEY)
npm install
npm start                # http://localhost:3000
```
For iPhone use: serve over HTTPS (deploy to Render, or `npx cloudflared tunnel --url http://localhost:3000`).

## Key decisions made so far
- Assistant is named **Friday** (not Jarvis). She answers to "Friday".
- **Voice front-end approach (Path 2):** continuous in-browser conversation using the Web
  Speech API for STT, with TTS spoken aloud automatically. Chosen over Telegram voice-notes
  (which you'd have to tap to play) and over a Siri-Shortcut bridge (turn-based).
- **Brain:** `claude-opus-4-8` by default (configurable via `JARVIS_MODEL` env). Streamed,
  short replies for low latency, system prompt prompt-cached.
- **Tools:** Claude's built-in server-side **web search + web fetch** are wired in
  (`web_search_20260209` / `web_fetch_20260209`) — no extra key, no MCP. She searches live
  when a question needs current info.
- **Voice:** optional **ElevenLabs** natural voice (set `ELEVENLABS_API_KEY`); falls back to
  free on-device voice if absent. Speaking rate bumped up for snappier delivery.
- Persona tuned to be **wittier/more characterful** while staying brief.

## Conventions
- Keep replies a voice user would tolerate: short, plain spoken sentences, no markdown.
- Never put secrets in the repo — keys live in `.env` (gitignored).
- After changing `server.js` or `persona/`, restart the server. After changing anything in
  `public/`, reload the browser page.
- `node --check server.js public/app.js` before committing JS changes.

## Where we're headed (next steps, roughly in priority order)
1. **Give Friday actions, not just lookups** — wire a real tool she can *do* something with:
   - Google Calendar ("what's my day?") — likely the highest-value first action.
   - Gmail (draft / send) and/or a richer web-research flow.
   These can come via MCP servers or direct API tools in `server.js`.
2. **Memory** — persist a user profile + rolling conversation summary so she remembers you
   across sessions (start with a JSON file, graduate to a vector store).
3. **Proactivity** — a scheduled "morning brief" she greets you with.
4. **Phone polish** — deploy to Render for an always-on iPhone install; optionally move the
   voice layer to LiveKit/Pipecat later for rock-solid continuous streaming + interruptions.

## Repo note
This lives at `nicktobing/friday`. It was bootstrapped in a Claude Code web session that was
bound to the public `Abhipaddy8/outreach-agent` template, then pushed here.
