# Outreach Agent

An autonomous cold email agent powered by Claude Code + NPC Guide. Tell it what you want. It finds leads, enriches, verifies, writes copy, sends, and tracks — all on its own.

---

## What It Does

```
You: "Find 20 AI CTOs at Series A startups and send them a follow-up"
Agent: researches → enriches → verifies → writes copy → sends 20 emails → updates tracker
```

---

## Setup (5 minutes)

### 1. Install Claude Code
```bash
npm install -g @anthropic/claude-code
```

### 2. Clone this repo
```bash
git clone https://github.com/YOUR_USERNAME/outreach-agent
cd outreach-agent
```

### 3. Add your API keys to `.mcp.json`
- **Composio API key** — connects Gmail, Apollo, Instantly/NeverBounce
- **Tavily API key** — research and lead discovery

### 4. Fill in your profile in `MEMORY.md`
- Your name, email, LinkedIn, offer, portfolio URL

### 5. Run
```bash
claude
```

The agent will ask: **"What do you want to do with your outreach today?"**

---

## File Structure

```
outreach-agent/
├── CLAUDE.md              ← agent brain (reads this first)
├── MEMORY.md              ← persistent memory across sessions
├── AERCHITECT.md          ← full contact tracker
├── .mcp.json              ← API connections
├── .ai-guide/
│   ├── missions.md        ← active + completed missions
│   └── architecture.md    ← system design + decisions log
└── skills/
    └── outreach.md        ← full pipeline instructions
```

---

## Example Requests

- "Find 15 founders at B2B SaaS companies under 50 people and pitch my consulting offer"
- "Send a follow-up to everyone who hasn't replied in 7 days"
- "Research AI agencies in Europe and send them a partnership email"
- "Find CTOs at funded AI startups and send them my portfolio"

---

## How It Works

1. You tell the agent what you want
2. Agent writes it as a **mission** in `.ai-guide/missions.md`
3. Agent executes: research → enrich → verify → send → track
4. All sends logged in `AERCHITECT.md`
5. At end of session, `MEMORY.md` updated with follow-up dates + lessons

---

## Powered By

- [Claude Code](https://claude.ai/code) — the execution engine
- [NPC Guide](https://github.com/npc-guide) — mission orchestration
- [Tavily](https://tavily.com) — research + lead discovery
- [Prospeo](https://prospeo.io) — email enrichment
- [Instantly](https://instantly.ai) — email verification
- Gmail API via Composio — sending
