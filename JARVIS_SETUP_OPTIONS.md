# JARVIS — Ways to Get It Running (Cheap→Free, Pay Only for the Brain)

> Principle: **the LLM (Claude) is the only thing worth paying for.** Voice,
> memory, hosting, triggers, push notifications, and the front-end all have
> free open-source or free-tier options. Below are several complete stacks at
> different effort/polish levels, plus a menu of free services and tricks to
> make even the brain cheap.

---

## The one paid part: the Brain (and how to keep it cheap)

Use Claude — but spend smart:

- **Model routing by difficulty:** Haiku for simple turns (cheap), Sonnet for
  most work, Opus only for hard reasoning. A single assistant can route per-turn.
- **Prompt caching:** cache the persona + memory + tool defs → up to ~90% off
  the repeated input tokens. Huge for an always-on assistant that resends the
  same system context every turn.
- **Batch API (50% off):** for non-realtime jobs (nightly summaries, lead
  research, digests) submit as batch.
- **Claude Agent SDK / Claude Code:** if you already have a Claude subscription,
  the Agent SDK gives you the agent loop, MCP, tool use, and subagents — you may
  not need to pay per-token separately for a lot of the orchestration.
- **Short context discipline:** summarize + prune memory so you're not paying to
  resend the whole history every turn.

Everything below this line is free or free-tier.

---

## OPTION A — "Telegram Jarvis" 📱  (cheapest, fastest, zero hardware)

Talk/type to a Telegram bot from your phone or desktop. Send **voice notes** →
it transcribes, thinks, and replies with **its own voice note**. Proactive
messages just arrive as Telegram DMs.

| Layer | Free service |
|---|---|
| Front-end + push | **Telegram Bot** (100% free, voice + text, works everywhere) |
| STT (voice in) | **Groq Whisper API** (free/very cheap, fast) or faster-whisper local |
| TTS (voice out) | **Edge-TTS** (free) or **ElevenLabs free tier** (10k chars/mo) |
| Brain | Claude API (the only paid part) |
| Memory | SQLite + **sqlite-vec**, or markdown files in a git repo |
| Tools | your existing MCP servers via Agent SDK |
| Hosting | **Oracle Cloud Always Free** ARM VM (free forever) or your own PC |
| Triggers/proactive | **cron** on the VM (free) |

- ✅ No hardware, works on your phone anywhere, free except brain, build in days.
- ⚠️ Not ambient "always listening" — you open the app / push-to-talk.
- **Best starting point for most people.**

---

## OPTION B — "Desktop / Pi Jarvis" 🎙️  (ambient "Hey Jarvis", talks out loud)

The movie experience: say **"Jarvis"** out loud, it wakes, listens, answers
aloud. Runs on an always-on machine (your Mac/PC or a Raspberry Pi).

| Layer | Free service |
|---|---|
| Wake word | **openWakeWord** (open source) or **Picovoice Porcupine** free tier |
| STT | **faster-whisper** local (free) or Groq Whisper |
| TTS | **Kokoro TTS** or **Piper** local (free, great quality) or ElevenLabs free |
| Realtime loop | **Pipecat** (open source — handles STT→LLM→TTS + interruptions) |
| Brain | Claude API |
| Memory | **Chroma** / **LanceDB** local (free) |
| Hosting | your own always-on machine / Raspberry Pi (free / one-time) |
| Proactive | cron + local notifications |

- ✅ True ambient voice, mostly local + private, free except brain.
- ⚠️ Needs an always-on machine; more setup; latency depends on hardware.

---

## OPTION C — "Phone-call Jarvis" ☎️  (call it like a person)

Literally **phone Jarvis** (or have it call you for alerts). Most natural voice
feel; great for hands-free / driving.

| Layer | Service |
|---|---|
| Voice telephony | **Vapi** or **LiveKit** free credits + a phone number |
| STT/TTS | bundled by Vapi/LiveKit (Deepgram/ElevenLabs under the hood) |
| Brain | Claude API |
| Memory/tools | same as above (MCP + vector store) |

- ✅ Most "Jarvis on the phone" feeling; outbound proactive calls.
- ⚠️ Telephony minutes cost money after free credits; least free of the bunch.

---

## OPTION D — "Claude Code as the body" 🤖  (least new code — you already have it)

Use **Claude Code / the Agent SDK itself** as Jarvis' runtime. It already has
MCP tool use, subagents, memory files, skills/missions, and can run scheduled
sessions. Bolt a thin voice/chat front-end on top (Telegram or local mic).

| Layer | How |
|---|---|
| Brain + agent loop + tools | **Claude Code / Agent SDK** (you have the MCP stack already) |
| Front-end | Telegram bot or local mic → pipes prompts into a session |
| Memory | the repo's `MEMORY.md` + markdown + optional vector store |
| Proactive | scheduled sessions / **GitHub Actions cron** (free minutes) |
| Push | Telegram / **ntfy.sh** (free push) / Slack |

- ✅ Minimal new infrastructure; reuses your outreach-agent patterns; subagents
  for parallel tasks; cheapest in dev time.
- ⚠️ More "agentic orchestration" than buttery realtime voice (add Option A/B's
  voice layer for that).

---

## OPTION E — "Automation-glue Jarvis" 🔌  (no-code proactivity engine)

Best when the priority is the **proactive** side (monitors, alerts, digests)
more than live conversation.

| Layer | Free service |
|---|---|
| Trigger/workflow engine | **n8n** self-hosted (free) — webhooks, schedules, branching |
| Brain | Claude node |
| Push | **Telegram** / **Discord** / **ntfy.sh** (all free) |
| Tools | HTTP + your MCP servers |

- ✅ Visual, powerful for "watch X → do Y → ping me"; free self-host.
- ⚠️ Less conversational; pair with A/B for a voice front-end.

---

## Free / cheap service menu (mix & match)

**Speech-to-text (voice in)**
- faster-whisper / whisper.cpp — local, free
- **Groq Whisper API** — free tier, extremely fast
- Deepgram / AssemblyAI — free credits
- OpenAI Whisper API — cheap

**Text-to-speech (voice out)**
- **Edge-TTS** — free (Microsoft voices)
- **Kokoro** / **Piper** / Coqui — local, free, high quality
- **ElevenLabs** — free tier (best voice cloning for the butler vibe)
- OpenAI TTS / Google TTS — cheap

**Wake word**
- **openWakeWord** — open source, free, custom "Jarvis"
- **Picovoice Porcupine** — free tier (personal), on-device

**Realtime voice orchestration**
- **Pipecat** (OSS), **LiveKit Agents** (OSS + free tier), **Vapi** (free credits)

**Memory / vector DB**
- Local free: **Chroma**, **LanceDB**, **sqlite-vec**, FAISS
- Cloud free tier: **Supabase/pgvector**, **Qdrant Cloud**, **Pinecone**, **Turso**
- Simplest: markdown files in git (free, versioned, human-readable)

**Hosting (always-on)**
- **Oracle Cloud Always Free** — ARM VM, genuinely free forever (great choice)
- Google Cloud free tier, **fly.io** free allowance, Cloudflare Workers (cron+webhooks free)
- Raspberry Pi / old laptop — one-time cost, then free

**Triggers / automation**
- **cron** (free), **GitHub Actions** (free minutes), **Cloudflare Workers Cron**
- **n8n** self-host (free), Pipedream / Make / Zapier free tiers

**Push channel (how it reaches you)**
- **Telegram Bot** (free, best all-rounder), **Discord** (free)
- **ntfy.sh** (free open-source push to phone), Slack (free), email (free)
- Pushover (cheap one-time), WhatsApp/SMS via Twilio (cheap)

**Tools / actions** — you already have these as MCP servers:
Gmail, Tavily (web), Apify (scraping), Fireflies (meetings), Slack, Google
Drive, Apollo, Instantly/NeverBounce, GitHub. **Add Google Calendar.**

---

## Recommended path

1. **Start with Option A (Telegram) or D (Claude Code body).** Both get you a
   working, useful Jarvis in days with ~$0 infra — you only pay Claude tokens.
2. **Add ambient voice (Option B)** once you want the "Hey Jarvis" out-loud
   experience on a desk machine or Pi.
3. **Layer in Option E (n8n) or cron** for proactivity (morning brief, alerts).
4. **Option C (phone calls)** later if you want true telephony.

### Rough monthly cost
- Infra/voice/memory/hosting/push: **$0** (free tiers + open source + Oracle Free VM).
- Brain (Claude): **the only real spend** — controllable from a few $/mo (light,
  Haiku-routed, cached) to more for heavy Opus use. Caching + routing + batch
  keep it low.

---

*Companion to `JARVIS_PLAN.md`. Pick a lane in §"Recommended path" and we build
Phase 0 from there.*
