# Friday 🎙️ — continuous voice assistant (Path 2)

You **talk**, Friday **talks back out loud** — a flowing conversation, not a voice
note you tap to play. Open it on your iPhone, tap the orb once, and just speak.

- **Voice in** — the iPhone's built-in speech recognition (Web Speech API) → **free**
- **Voice out** — the iPhone's built-in text-to-speech, played automatically → **free**
- **Brain** — Claude (the only paid part), streamed so it starts speaking fast
- **No app install** — it's a web app you "Add to Home Screen"

```
you speak → browser transcribes → Claude streams a reply → phone speaks it → repeat
```

---

## 1. Get it running locally (1 minute)

```bash
cd friday
cp .env.example .env        # then paste your ANTHROPIC_API_KEY into .env
npm install
npm start
```

Open `http://localhost:3000` on the **same computer**, tap the orb, and talk.
(On desktop, use Chrome or Safari.)

---

## 2. Use it on your iPhone

iOS only allows microphone access over **HTTPS** (or `localhost`). Two easy options:

**A. Quick test — a free tunnel (no deploy):**
```bash
npx localtunnel --port 3000
# or: cloudflared tunnel --url http://localhost:3000   (free, no signup)
```
Open the `https://…` URL it prints on your iPhone in **Safari**. Tap the orb,
allow the microphone, and start talking.

**B. Always-on — a free VM:**
Run `npm start` on a free **Oracle Cloud Always-Free** VM (or any host), put it
behind HTTPS (Caddy/Cloudflare both give free certificates), and bookmark it.

**Add to Home Screen** (Share → Add to Home Screen) so Friday launches full-screen
like a real app.

---

## 3. How to talk to it

- **Tap the orb** to wake Friday (the first tap is required by iOS to unlock the mic + audio).
- **Just speak** — when you stop, Friday thinks, then answers out loud, then listens again.
- **Tap while she's talking** to interrupt (barge-in) and say something new.
- **Tap again** when idle to end the session.

The orb shows state: **blue pulse** = listening, **purple spin** = thinking,
**amber pulse** = speaking.

---

## 4. Cost & tuning

The **only** thing that costs money is Claude. Levers in `.env`:

- `JARVIS_MODEL` — `claude-opus-4-8` (default, most capable),
  `claude-sonnet-4-6` (faster/cheaper), or `claude-haiku-4-5` (fastest — best for
  snappy voice turns). Switching down is *your* choice for latency, not a forced
  downgrade.
- The system prompt is **prompt-cached**, so repeated turns are cheap.
- Replies are kept short (it's a conversation), which also keeps output tokens low.

---

## 5. What's here

```
friday/
├── server.js                 # Express + Claude, streams reply over SSE
├── persona/system-prompt.md  # Friday's personality & voice rules
├── public/
│   ├── index.html            # the orb UI (PWA)
│   ├── app.js                # the voice loop: listen → ask → speak → repeat
│   ├── styles.css
│   ├── manifest.webmanifest  # Add-to-Home-Screen
│   └── icon.svg
├── .env.example
└── package.json
```

---

## 6. Next steps (where this grows)

- **Give Friday tools.** Wire your MCP servers (Gmail, Calendar, web search, Slack)
  into `server.js` so she can *do* things, not just talk. Add Google Calendar first.
- **Memory.** Persist conversation summaries + a profile so she remembers you
  across sessions (start with a JSON file, graduate to a vector store).
- **Nicer voice (built in).** Friday already supports a natural ElevenLabs voice —
  just add `ELEVENLABS_API_KEY` to `.env` (free tier ~10k chars/month) and restart.
  No key = free on-device voice. Change `ELEVENLABS_VOICE_ID` to pick a voice.
- **Proactivity.** A cron job that has Friday greet you with a morning brief.

> A note on iOS speech recognition: Safari's Web Speech API stops after each
> utterance, so Friday restarts the mic between turns automatically. It's the
> free path. For rock-solid continuous streaming + interruptions later, move the
> voice layer to LiveKit or Pipecat with the same `server.js` brain behind it.
