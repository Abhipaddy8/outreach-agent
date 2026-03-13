# Outreach Agent

Autonomous cold email agent powered by Claude Code. Tell it what you want — it finds leads, enriches, verifies, writes copy, sends, and tracks.

```
You: "Find 20 AI CTOs at Series A startups and pitch my consulting offer"
Agent: researches → enriches → verifies → writes copy → sends → tracks
```

---

## Install

```bash
# 1. Install Claude Code
npm install -g @anthropic/claude-code

# 2. Clone
git clone https://github.com/Abhipaddy8/outreach-agent
cd outreach-agent

# 3. Run
claude
```

**That's it.** The agent walks you through the rest — step by step, verifying each connection before moving on.

---

## What the Agent Sets Up For You

On first run, the agent runs a **setup wizard** — 7 missions, each verified before the next starts:

| # | Mission | What It Does |
|---|---------|-------------|
| S1 | File check | Confirms all required files are present |
| S2 | Your profile | Asks your name, email, LinkedIn, offer — writes to memory |
| S3 | Tavily | Tests a live search to confirm connection |
| S4 | Prospeo | Tests email enrichment API |
| S5 | Instantly | Tests email verification |
| S6 | Gmail | Sends a test email to you — you confirm receipt |
| S7 | Done | Marks setup complete, asks what you want to do |

Each step either **passes** or tells you exactly what to fix. No guessing.

---

## After Setup

Just run `claude` and say what you want:

- *"Find 15 founders at B2B SaaS companies under 50 people"*
- *"Send a follow-up to everyone who hasn't replied in 7 days"*
- *"Research AI agencies in Europe and send them a partnership email"*

The agent breaks it into a mission, executes, and logs everything to `AERCHITECT.md`.

---

## You'll Need Accounts For

| Tool | Purpose | Free Tier |
|------|---------|-----------|
| [Composio](https://composio.dev) | Connects Gmail, Apollo, Instantly | ✅ Yes |
| [Tavily](https://tavily.com) | Research + lead discovery | ✅ 1,000 searches/mo |
| [Prospeo](https://prospeo.io) | Email enrichment | ✅ Limited credits |
| [Instantly](https://instantly.ai) | Email verification | ✅ Yes |

The agent will ask for these keys during setup — you don't need them before running.

---

## Powered By

- [Claude Code](https://claude.ai/code) — execution engine
- [Tavily](https://tavily.com) — research
- [Prospeo](https://prospeo.io) — enrichment
- [Instantly](https://instantly.ai) — verification
- [Composio](https://composio.dev) — Gmail + Apollo + Instantly connections
