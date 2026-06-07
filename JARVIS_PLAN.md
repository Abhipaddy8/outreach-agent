# JARVIS — Personal AI Assistant: Brainstorm & Build Plan

> Goal: build an assistant that *acts and behaves like Jarvis from Iron Man* — a
> conversational, always-available, proactive AI chief-of-staff that understands
> context, controls your tools, remembers everything, and takes initiative.
>
> Status: **Planning / brainstorm** — carried over from a Claude Code session.
> Owner: nicktobing. This doc is the seed for the repo.

---

## 1. What "Jarvis" actually means (decompose the fantasy)

The movie Jarvis is a bundle of distinct, buildable capabilities. Separating
them is the whole trick — each is a real engineering problem with real tools.

| Jarvis trait (movie) | Real-world capability | Buildable today? |
|---|---|---|
| Talks naturally, always listening | Voice in (STT) + voice out (TTS) + wake word | ✅ Yes |
| Understands intent, reasons | LLM core (Claude) with tool use | ✅ Yes |
| "Run diagnostics", "pull up the file" | Tool/function calling over your systems (MCP) | ✅ Yes |
| Remembers you, your projects, history | Persistent memory + retrieval (RAG) | ✅ Yes |
| Anticipates, warns, suggests proactively | Event triggers + scheduled agents | ✅ Yes (partial) |
| Controls the house/suit | IoT / device & app control | ⚠️ Partial (depends on devices) |
| Personality, wit, loyalty | System prompt + persona + voice design | ✅ Yes |
| Sees what you see (HUD, cameras) | Vision (camera, screen) | ✅ Yes (multimodal) |
| Real-time, sub-second | Low-latency streaming pipeline | ⚠️ Hard but doable |

The realistic 2026 build is a **multimodal, voice-driven, memory-backed agent
orchestrator** — not AGI, but genuinely Jarvis-like for *your* life and work.

---

## 2. Capability pillars (the architecture in plain terms)

```
        ┌─────────────────────────────────────────────────────┐
        │                    YOU (voice / text / screen)       │
        └───────────────┬─────────────────────┬───────────────┘
                        │ speak / type        │ see
                ┌───────▼────────┐    ┌────────▼─────────┐
                │  VOICE LAYER   │    │  VISION LAYER    │
                │  STT • TTS •   │    │  camera • screen │
                │  wake word     │    │  multimodal LLM  │
                └───────┬────────┘    └────────┬─────────┘
                        │                      │
                ┌───────▼──────────────────────▼─────────┐
                │            THE BRAIN (LLM core)         │
                │   Claude (Opus/Sonnet) + reasoning +    │
                │   tool routing + persona/system prompt  │
                └───┬──────────────┬──────────────────┬───┘
                    │              │                  │
            ┌───────▼─────┐ ┌──────▼───────┐  ┌───────▼────────┐
            │   MEMORY    │ │    TOOLS     │  │  PROACTIVITY   │
            │ short-term  │ │ (MCP servers)│  │ triggers •     │
            │ long-term   │ │ email, cal,  │  │ cron • webhooks│
            │ vector RAG  │ │ slack, web,  │  │ monitors       │
            │ profile     │ │ files, etc.  │  │                │
            └─────────────┘ └──────────────┘  └────────────────┘
```

### Pillar A — The Brain (LLM core)
- **Model:** Claude (Opus 4.x for hard reasoning, Sonnet/Haiku for fast/cheap
  turns). Route by task difficulty to control cost + latency.
- **Tool use / function calling:** the brain decides *which tool* to call.
- **Persona:** a strong system prompt defines Jarvis' tone — calm, precise,
  dry wit, proactive, addresses you by name ("sir"/your name), concise.

### Pillar B — Voice layer (what makes it *feel* like Jarvis)
- **Speech-to-text (STT):** Whisper / Deepgram / AssemblyAI (streaming).
- **Text-to-speech (TTS):** ElevenLabs (best quality + custom voice), or
  OpenAI/PlayHT/Cartesia. Pick/clone a calm British-butler voice for the vibe.
- **Wake word:** "Jarvis" via Picovoice Porcupine (on-device, low power).
- **Turn-taking / barge-in:** let the user interrupt; use a realtime pipeline.
- **Fast path:** providers like Vapi, LiveKit Agents, or Pipecat give you a
  ready realtime voice-agent loop (STT→LLM→TTS) with interruption handling.

### Pillar C — Memory (so it knows you)
- **Short-term:** the current conversation/session context.
- **Long-term profile:** facts about you, preferences, projects, people
  (a structured `PROFILE.md` + DB).
- **Episodic memory:** log of past interactions, decisions, outcomes.
- **Semantic/RAG:** vector store (Pinecone / pgvector / Chroma / Weaviate) so it
  can retrieve relevant past context and documents on demand.
- **Memory write policy:** end-of-session summarization → distill what's worth
  keeping → store. (This is how it "remembers everything" without bloating.)

### Pillar D — Tools / actions (so it can *do* things)
This is where your existing MCP stack is gold. Jarvis = an orchestrator over
all of these. Already available in your ecosystem:
- **Email** — Gmail (send, read, draft)
- **Web** — Tavily (search, crawl, extract, research)
- **Scraping / data** — Apify (50+ platform actors)
- **Meetings** — Fireflies (transcripts, summaries, soundbites)
- **Chat / comms** — Slack (send, read, schedule, canvases)
- **Files / docs** — Google Drive (read, create, search)
- **Project mgmt** — Asana-like + a project/financials server
- **CRM / coaching** — client activity, tasks, messaging server
- **Leads / sales** — Apollo, Instantly/NeverBounce, outreach pipeline
- **Code / repos** — GitHub MCP
- **Calendar** — (add Google Calendar MCP — key for a chief-of-staff)
- **Home / IoT** — (optional: Home Assistant MCP for the "control the house" bit)

### Pillar E — Proactivity (the part most assistants miss)
Jarvis doesn't just respond — it *initiates*. Build this with:
- **Scheduled agents (cron):** morning brief, end-of-day summary, follow-up
  reminders, "you have 3 meetings and 2 unanswered DMs".
- **Event triggers / webhooks:** new email from a VIP → alert; CI fails →
  notify; lead replies → draft response; calendar event soon → prep notes.
- **Monitors:** funding signals, inbox, Slack mentions, deal stages.
- **Push channel:** how does it reach you? (Slack DM, SMS/WhatsApp, phone call
  via Vapi, push notification, or just speak if you're at the desk.)

### Pillar F — Vision / multimodal (optional, high "wow")
- **Screen awareness:** screenshot → multimodal LLM ("what am I looking at?").
- **Camera:** identify objects/people, read documents.
- **The HUD:** a minimal always-on UI overlay (desktop widget / menu bar app).

---

## 3. Tech stack options (pick a lane)

### Option 1 — "Fastest to a talking Jarvis" (recommended start)
- **Voice loop:** Vapi or LiveKit Agents or Pipecat (handles STT/TTS/turns).
- **Brain:** Claude via API with tool use.
- **Tools:** your existing MCP servers, exposed to the agent.
- **Memory:** start with files + a simple vector DB (Chroma/pgvector).
- **Host:** a small always-on box (Mac mini / cloud VM / Raspberry Pi for wake
  word front-end).
- Time to first "it talks and does one real task": **days, not months.**

### Option 2 — "Claude Agent SDK as the spine"
- Use the **Claude Agent SDK** to build the agent loop, tool routing, subagents,
  and long-running tasks. Bolt the voice layer on the front. Best if you want
  deep, code-driven control and multi-agent orchestration.

### Option 3 — "Off-the-shelf glue"
- Wire existing pieces: a voice agent platform + n8n/Make for triggers +
  Claude for brains. Least code, less flexible, fast to demo.

> Recommendation: **Option 1 now**, evolve toward **Option 2** as complexity
> grows (subagents, autoresearch loops, long-running missions).

---

## 4. What you already have vs. what's missing

**Have (huge head start):**
- Rich MCP tool ecosystem (email, web, scraping, meetings, Slack, Drive, CRM,
  GitHub, leads).
- An agent-orchestration mindset + skills/missions pattern (this repo).
- Claude as the brain.

**Need to add:**
- [ ] Voice layer (STT + TTS + wake word) — the single biggest "Jarvis feel"
- [ ] Calendar MCP (Google Calendar) — essential for a chief-of-staff
- [ ] Persistent memory store (vector DB + profile schema)
- [ ] Proactive trigger system (cron + webhooks + a push channel to reach you)
- [ ] A persona/system prompt that nails the Jarvis voice & behavior
- [ ] An always-on host to run it
- [ ] (Optional) vision/screen awareness, IoT control

---

## 5. Phased roadmap

### Phase 0 — Persona + text MVP (week 1)
- Define Jarvis persona (tone, name for you, boundaries, proactivity rules).
- Text-only chat that can call 3–4 of your real tools (email, calendar, web,
  Slack). Prove the brain + tools loop.

### Phase 1 — Give it a voice (week 1–2)
- Add STT + TTS + wake word. Now you *talk* to it and it talks back.
- One real end-to-end voice task: "Jarvis, what's on my calendar and any urgent
  emails?" → it speaks the answer.

### Phase 2 — Memory (week 2–3)
- Profile + vector store + end-of-session summarization. It remembers you,
  your projects, and past conversations.

### Phase 3 — Proactivity (week 3–4)
- Morning brief, follow-up reminders, VIP-email/Slack alerts, deal-stage nudges.
- Pick a push channel so it can reach you when you're away.

### Phase 4 — Multimodal + polish (month 2+)
- Screen/camera vision, a HUD/menu-bar app, custom voice, faster latency,
  multi-agent subtasks via Agent SDK.

---

## 6. Key decisions to make (answer these to start)

1. **Where does Jarvis live?** Desktop app / menu-bar, phone, a dedicated
   device, or "in Slack/WhatsApp"? (Determines the front-end + push channel.)
2. **Voice provider + voice identity?** ElevenLabs custom British-butler voice
   vs. faster/cheaper default.
3. **How proactive?** Suggest-only, or allowed to *act* autonomously (send
   emails, book meetings) within guardrails?
4. **Work-only or whole-life?** Just the outreach/business stack, or also
   personal calendar, home, finances?
5. **Privacy / always-listening?** On-device wake word + cloud only after wake,
   or push-to-talk?
6. **Budget tolerance?** Realtime voice + frontier LLM on every turn adds up —
   route models by difficulty, cache, and use cheaper models for small turns.

---

## 7. Risks & realities (so it doesn't disappoint)

- **Latency:** true sub-second voice is hard; aim for ~1–2s and barge-in.
- **Cost:** always-on + frontier model + premium TTS = real monthly spend.
  Mitigate with model routing, caching, on-device wake word.
- **Proactive ≠ annoying:** strong guardrails on when it interrupts you.
- **Autonomy risk:** anything that *sends* or *spends* needs confirmation rules.
- **Memory hygiene:** summarize and prune; don't store everything raw.
- **Reliability:** tools fail — Jarvis must degrade gracefully, not crash.

---

## 8. Suggested repo structure (for the new nicktobing repo)

```
jarvis/
├── README.md                # vision + setup
├── JARVIS_PLAN.md           # this document
├── persona/
│   └── system-prompt.md     # the Jarvis personality + behavior rules
├── brain/
│   └── agent.py             # LLM loop + tool routing (Agent SDK or custom)
├── voice/
│   ├── stt.py               # speech-to-text
│   ├── tts.py               # text-to-speech
│   └── wakeword.py          # "Jarvis" detection
├── memory/
│   ├── profile.md           # who you are, preferences, people, projects
│   ├── store.py             # vector DB read/write
│   └── summarize.py         # end-of-session distillation
├── tools/
│   └── mcp.json             # all MCP servers (email, calendar, slack, web...)
├── proactive/
│   ├── schedules.md         # cron jobs (morning brief, follow-ups)
│   └── triggers.py          # webhooks / monitors / push channel
└── config/
    └── settings.md          # decisions from section 6
```

---

## 9. Immediate next steps

1. Start a new Claude Code web session on a fresh `nicktobing` repo (e.g.
   `jarvis` or `jarvis-assistant`).
2. Drop this `JARVIS_PLAN.md` in at the root.
3. Answer the 6 decisions in section 6.
4. Build **Phase 0** (persona + text MVP wired to 2–3 real tools).
5. Add the voice layer (Phase 1) — that's the moment it *becomes* Jarvis.

---

*Generated as a planning seed. Refine the decisions in §6 and we build from there.*
