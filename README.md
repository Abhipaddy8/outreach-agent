# Outreach Agent

A fully autonomous, multi-channel outreach system built on Claude Code. It replaces the entire outbound stack — lead research, email enrichment, verification, personalised copy, sending, LinkedIn connection requests, follow-up sequencing, and long-term memory — with a single agent you talk to in plain English.

This is not a wrapper around a SaaS tool. There is no dashboard, no monthly seat fee, no "credits" tier wall. It's an agent that reads files, calls APIs, controls a browser, and writes its own task queue. You own the whole stack.

**What it can do in a single session:**
- Source 50 leads from LinkedIn posts, funding announcements, job boards, or competitor reviews
- Find verified decision maker emails via Prospeo or Apollo — one credit per person, no waste
- Write and send personalised HTML emails referencing the exact signal that surfaced each lead
- Send LinkedIn connection requests via your real Chrome session — no PhantomBuster, no Heyreach
- Schedule follow-ups, write them to memory, and execute them automatically in the next session
- Run on a daily loop with `/loop` — sourcing new leads, sending follow-ups, updating the tracker — without you touching it

**The architecture in one line:**
> `CLAUDE.md` is the brain. `MEMORY.md` is what it remembers. `missions.md` is what it's doing. `AERCHITECT.md` is everything it's ever sent.

```
You: "Find 20 AI CTOs at Series A startups, email them today,
      and remind me to send LinkedIn requests in 7 days"

Agent:
  → Tavily: searches for Series A AI companies + CTO names
  → Prospeo: /enrich-person → verified email per contact (1 credit each)
  → Instantly: verifies deliverability, drops invalids
  → Gmail: writes personalised HTML email per contact, test-sends to you first
  → AERCHITECT.md: logs all 20 contacts with send date + LinkedIn URLs
  → MEMORY.md: writes "LinkedIn follow-up due 2026-03-20 — 20 contacts from Wave 1"
  → missions.md: marks Wave 1 complete, queues Wave 2
```

Seven days later, fresh session, you type nothing:
```
Agent reads MEMORY.md → LinkedIn follow-up due today
Agent: "You have 20 contacts from Wave 1 due for LinkedIn requests. Go?"
You: "Go"
Agent opens Chrome → visits each profile → sends personalised connection request → updates tracker
```

---

## Table of Contents

- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
  - [The Brain — CLAUDE.md](#the-brain--claudemd)
  - [Persistent Memory — MEMORY.md](#persistent-memory--memorymd)
  - [Mission Queue — missions.md](#mission-queue--ai-guidemissionsmd)
  - [Contact Tracker — AERCHITECT.md](#contact-tracker--aerchitectmd)
  - [Pipeline Instructions — skills/outreach.md](#pipeline-instructions--skillsoutreachmd)
  - [System Decisions — architecture.md](#system-decisions--ai-guidearchitecturemd)
- [File Structure](#file-structure)
- [Setup Wizard (First Run)](#setup-wizard-first-run)
- [Email Outreach — Approaches, Use Cases & Long-Chain Workflows](#email-outreach--approaches-use-cases--long-chain-workflows)
  - [Approach 1 — Direct Query (Apollo or Prospeo)](#approach-1--direct-query-apollo-or-prospeo)
  - [Approach 2 — Research First, Then Enrich](#approach-2--research-first-then-enrich-tavily--apollo-or-prospeo)
  - [Approach 3 — Credit-Efficient (Tavily → Enrich Once)](#approach-3--credit-efficient-tavily-finds-everything-enrich-once)
  - [Long-Chain Use Cases](#long-chain-use-cases)
  - [/loop — Self-Running Workflows](#loop--self-running-workflows)
  - [/agent-teams — Autonomous Agent Teams on Cron](#agent-teams--autonomous-agent-teams-on-cron)
- [LinkedIn Outreach](#linkedin-outreach)
  - [Claude in Chrome](#option-a--claude-in-chrome-recommended)
  - [Playwright (Headless)](#option-b--playwright-headless--automated)
  - [Full Multi-Channel Pipeline](#full-multi-channel-pipeline-example)
- [Lead Generation — LinkedIn Comment Scraping](#lead-generation--finding-interested-people-before-they-know-you-exist)
  - [The Pipeline](#the-pipeline)
  - [How DOM Extraction Works](#how-dom-extraction-works)
  - [Use Cases](#use-cases)
- [Tools Required](#tools-required)
- [Rules The Agent Never Breaks](#rules-the-agent-never-breaks)
- [Skills — Slash Commands](#skills--slash-commands)
  - [/outreach — Cold Email Pipeline](#outreach--cold-email-pipeline)
  - [/lead-borrow — Borrow Leads from Influencer Posts](#lead-borrow--borrow-leads-from-influencer-posts)
  - [/daily-icp-feed — Daily ICP Post Monitor](#daily-icp-feed--daily-icp-post-monitor)
  - [/qualify-audience — Qualify Your Own Post Engagers](#qualify-audience--qualify-your-own-post-engagers)
  - [/content-reflect — Own Content Performance](#content-reflect--own-content-performance)
  - [/content-compare — Competitor Analysis](#content-compare--competitor-analysis)
  - [/signal-monitor — Daily Signal Tracking](#signal-monitor--daily-signal-tracking)
  - [/agent-teams — Autonomous Agent Teams](#agent-teams--autonomous-agent-teams)
  - [Scaling with Apify](#scaling-with-apify)
- [Autoresearch — Autonomous Optimization Loop](#autoresearch--autonomous-optimization-loop)
  - [The Loop](#the-autoresearch-loop)
  - [What It Optimizes](#what-autoresearch-optimizes)
  - [Example Session](#autoresearch-example-session)
- [Apify Agent Skills — Scraping Superpowers](#apify-agent-skills--scraping-superpowers)
  - [The 8 Skills](#the-8-apify-skills)
  - [How They Map to Outreach Skills](#how-apify-maps-to-outreach-skills)
  - [Power Combos](#apify-power-combos)
- [Adding Your Own Skills](#adding-your-own-skills)
- [Contributing](#contributing)

---

## Quick Start

```bash
npm install -g @anthropic/claude-code
git clone https://github.com/Abhipaddy8/outreach-agent
cd outreach-agent
claude
```

The agent handles the rest. On first run it walks you through a verified setup wizard — 7 steps, each tested before the next begins.

---

## How It Works

### The Brain — `CLAUDE.md`

Every Claude Code session starts by reading `CLAUDE.md`. This file is the agent's operating system — it tells the agent:

- What it is and what it does
- How to behave on startup (check setup, read missions, ask user)
- The rules it must never break (no bare URLs, always test-send first, etc.)
- The full pipeline in order
- Where every file lives and what it's for

`CLAUDE.md` is not code. It's a prompt. But it's authoritative — the agent treats it as law.

---

### Persistent Memory — `MEMORY.md`

This is what makes the agent stateful across sessions. Claude Code has no built-in memory between sessions — every conversation starts fresh. `MEMORY.md` solves this.

At the **start of every session**, the agent reads `MEMORY.md` and loads:
- Your sender profile (name, email, LinkedIn, offer)
- What's working and what isn't
- Follow-up dates (who to chase and when)
- Lessons from past mistakes
- Active lead counts and campaign status

At the **end of every session**, the agent writes back to `MEMORY.md`:
- New contacts added
- Replies received
- Follow-up dates scheduled
- Any new lessons learned

**Example — how memory comes back:**

```
Session 1 (Monday):
  You: "Send 20 emails to AI CTOs"
  Agent sends 20 emails, writes to MEMORY.md:
    Follow-up due: 2026-03-20 — 20 contacts from Wave 1

Session 2 (Thursday, different terminal, fresh context):
  Agent reads MEMORY.md → sees follow-up due Mar 20
  Agent: "You have 20 contacts due for follow-up on Mar 20. Want me to send that now?"
```

The agent never forgets. It just reads the file.

---

### Mission Queue — `.ai-guide/missions.md`

Every piece of work gets written as a **mission** before execution starts. This file is the agent's task queue.

When you tell the agent what you want:
1. Agent writes it as a mission with steps
2. Marks it `▶ Active`
3. Executes step by step, ticking off each one
4. Marks `✅ Complete` when done
5. Asks what's next

**Mission format:**
```markdown
## Wave 1 — AI CTO Outreach
▶ Status: Active
**Goal**: Find 20 AI CTOs at Series A startups and send consulting pitch

Steps:
- [x] Tavily search: "AI startup Series A CTO 2025"
- [x] Extract 20 decision makers with company domains
- [x] Enrich emails via Prospeo
- [x] Verify via Instantly — drop invalids
- [ ] Write personalised copy per contact
- [ ] Send via Gmail
- [ ] Update AERCHITECT.md
```

If a session ends mid-mission, the next session picks up exactly where it left off — the mission file shows which steps are done and which aren't.

---

### Contact Tracker — `AERCHITECT.md`

Every contact the agent ever touches lives here. It's a running log of the entire outreach operation.

**What it tracks:**
- Every contact: name, title, company, email, verification status
- Every send: timestamp, subject, touchpoint number
- Every reply: what they said, what was sent back, current status
- Batch progress: which waves have been sent
- Session log: what happened in each session
- Avatar intelligence: which company types respond, which don't

**Why it matters:** After 10+ waves of outreach, you start to see patterns. The avatar intelligence section evolves automatically as the agent logs what's working.

---

### Pipeline Instructions — `skills/outreach.md`

The agent's step-by-step execution manual. Every tool call, API endpoint, fallback strategy, and rule lives here.

**Covers:**
- Tavily search queries for lead discovery
- Prospeo `/enrich-person` API (exact request format, headers, response parsing)
- Email permutation fallback strategy (`first@` → `first.last@` → `flast@` → ...)
- Instantly verification flow
- Gmail send rules (HTML only, no bare URLs, test-send first)
- PDF attachment via s3key (how to extract and reuse across sends)
- AERCHITECT.md update instructions

When you add a new tool or change an API, you update this file — the agent reads it fresh every session.

---

### System Decisions — `.ai-guide/architecture.md`

A log of every architectural decision made. When the agent encounters a choice, it checks here first to avoid repeating past mistakes.

**Example entries:**
```
2026-03-13 — Never paste bare URLs in emails
  Reason: Caught on a 20-person send batch. Looks amateurish, hurts deliverability.
  Rule: Always is_html=True + <a href="...">anchor text</a>

2026-03-11 — first@ pattern dominates at small agencies
  Reason: 100% hit rate vs first.last@ on 6/6 small Indian agencies
  Rule: Always try first@ before first.last@
```

---

## File Structure

```
outreach-agent/
│
├── CLAUDE.md                   ← Agent brain. Read first, every session.
├── MEMORY.md                   ← Persistent memory across sessions.
├── AERCHITECT.md               ← Full contact tracker.
├── .mcp.json                   ← MCP servers (Gmail, Tavily, Instantly, Apollo, Apify)
├── .gitignore                  ← Excludes .env, data exports, .DS_Store
├── install.sh                  ← Installs all 10 skills as slash commands
│
├── .ai-guide/
│   ├── missions.md             ← Active + completed mission queue.
│   ├── architecture.md         ← System design + decisions log.
│   └── decisions.md            ← Architectural decisions with reasoning.
│
├── skills/                     ← 16 skill files (agent reads + executes)
│   ├── outreach.md             ← /outreach — full cold email pipeline
│   ├── agent-teams.md          ← /agent-teams — autonomous agent teams on cron
│   ├── lead-borrow.md          ← /lead-borrow — borrow leads from influencer posts
│   ├── daily-icp-feed.md       ← /daily-icp-feed — daily ICP post monitor
│   ├── content-reflect.md      ← /content-reflect — own content performance
│   ├── content-compare.md      ← /content-compare — competitor content analysis
│   ├── qualify-audience.md     ← /qualify-audience — qualify own post engagers
│   ├── signal-monitor.md       ← /signal-monitor — daily signal tracking
│   ├── autoresearch.md         ← /autoresearch — Karpathy optimization loop (NEW)
│   ├── apify-skills.md         ← /apify — Apify scraping skills (NEW)
│   ├── linkedin.md             ← /linkedin — browser automation
│   ├── linkedin-connect.md     ← LinkedIn connection flow
│   ├── leadthunder.md          ← /leadthunder — mine LinkedIn post commenters
│   ├── deck.md                 ← /deck — build PDF decks
│   ├── 48hr-outreach.md        ← 48hr productivity challenge pipeline
│   └── tetris-mission.md       ← TechStack Tetris mission builder
│
├── memory/                     ← Agent's long-term memory
│   ├── optimization-log.md     ← Autoresearch experiment log (NEW)
│   ├── baselines.md            ← Current winning copy versions (NEW)
│   ├── competitor-analysis.md  ← Competitor research results
│   ├── content-analysis.md     ← Own content performance data
│   ├── lb_pipeline.md          ← Lead borrow pipeline state
│   └── lb_conversations.md     ← Lead borrow conversation openers
│
├── config/                     ← User-configured settings
│   └── competitors.md          ← Competitor list
│
└── docs/
    └── apify-strategy.md       ← Apify READ/WRITE architecture reference
```

---

## Setup Wizard (First Run)

On first run the agent detects that `MEMORY.md` has unfilled placeholders and runs 7 setup missions. Each one tests the connection before moving on — no guessing, no silent failures.

| Mission | What It Does | Pass Condition |
|---------|-------------|----------------|
| S1 — File Check | Reads all 6 required files | All files exist and readable |
| S2 — Sender Profile | Asks your name, email, LinkedIn, offer | Written to MEMORY.md, no placeholders remain |
| S3 — Tavily | Runs a live test search | Returns ≥1 result |
| S4 — Prospeo | Calls `/enrich-person` with a test contact | Returns email or LinkedIn URL |
| S5 — Instantly | Verifies a test email address | Returns valid/invalid/catchall status |
| S6 — Gmail | Sends a test email to yourself | You confirm receipt |
| S7 — Done | Writes `SETUP_COMPLETE: true` to MEMORY.md | Never runs again |

If any step fails, the agent tells you exactly what to fix — not a generic error, a specific instruction.

---

## Email Outreach — Approaches, Use Cases & Long-Chain Workflows

There are three ways to source leads for email outreach, each with different speed, cost, and accuracy tradeoffs. Then there are long-chain workflows where the agent runs entire multi-week campaigns on its own — using `/loop`, `MEMORY.md`, and `missions.md` to stay on course without you touching it.

---

### Approach 1 — Direct Query (Apollo or Prospeo)

**Fastest. Best when you know exactly who you want.**

You describe the target. The agent queries Apollo directly — title, industry, company size, geography — and gets back verified contacts in one call. No research step. No wasted credits.

```
"Find 20 VP Sales at B2B SaaS companies in the US,
 50-200 employees, using Apollo. Verified emails only."
```

```
Agent:
  → APOLLO_PEOPLE_SEARCH: title=VP Sales, industry=SaaS,
    employee_count=50-200, location=US, contact_email_status=verified
  → APOLLO_BULK_PEOPLE_ENRICHMENT on returned IDs
  → Instantly verify each email
  → Send
```

**When to use:** You have a tight ICP, you trust Apollo's database, and you want results in under 5 minutes.

**Credit cost:** 1 Apollo enrichment credit per contact. Verification is separate (Instantly).

---

### Approach 2 — Research First, Then Enrich (Tavily → Apollo or Prospeo)

**More targeted. Best when you want context before enrichment.**

Tavily finds the companies and decision makers first — from news, lists, LinkedIn, job boards, industry articles. The agent builds a shortlist of exactly who it wants, then enriches only those people. You're not paying to enrich a database query — you're paying to enrich a pre-qualified list.

```
"Use Tavily to find AI companies in Southeast Asia
 that recently raised Series A, then find their CTOs
 and send them my portfolio"
```

```
Agent:
  → tavily_search: "AI startup Series A Southeast Asia 2025"
  → tavily_extract: pulls company names + domains from results
  → tavily_search per company: "[Company] CTO OR CEO LinkedIn"
  → Builds shortlist: name + company domain
  → Prospeo /enrich-person for each → verified email
  → Instantly verify
  → Send
```

**When to use:** Niche targets (specific geography, funding stage, recent news), where Apollo's database may be thin or outdated. Also good when you want to reference something specific (e.g. their funding news) in the email.

**Credit cost:** 0 Tavily credits used on research (API allowance). 1 Prospeo credit per enrichment.

---

### Approach 3 — Credit-Efficient: Tavily Finds Everything, Enrich Once

**Most cost-efficient. Best for volume campaigns.**

The expensive part of any pipeline is enrichment. If you ask Apollo to find and enrich 50 people, you're spending 50 credits. But if Tavily already found the name AND the company domain, you only need one Prospeo call per person — `/enrich-person` with `first_name + last_name + company_website`. No Apollo needed at all for sourcing.

```
"Find 50 founders of bootstrapped SaaS companies
 that launched in the last 2 years. Use Tavily only
 for research. Then enrich emails via Prospeo."
```

```
Agent:
  → tavily_search: "bootstrapped SaaS founder launched 2023 2024"
  → tavily_extract: article lists, ProductHunt launches, Indie Hackers
  → For each result: extract founder name + company website
  → Prospeo /enrich-person: { first_name, last_name, company_website }
    → 1 credit. Returns verified email + LinkedIn + title.
  → Instantly verify
  → Send
```

**Credit math:**
```
50 contacts via Apollo search + enrich  = ~50-100 Apollo credits
50 contacts via Tavily → Prospeo enrich = 50 Prospeo credits (0 Apollo)

Tavily research: free (within monthly allowance)
Prospeo credits: ~$0.02 each at scale
```

**When to use:** Any campaign over 20 contacts where you don't need Apollo's filtering. Especially good for niche targets found in articles, lists, community posts, or directories.

---

### Long-Chain Use Cases

These are multi-step, multi-day workflows the agent runs as a single mission — each step triggers the next, memory carries state, missions track progress.

---

#### Chain 1 — Weekly New Leads + Auto Follow-Up

```
"Every Monday find 20 new AI startup CTOs, send Wave 1 email.
 Every Thursday send Wave 2 follow-up to anyone who didn't reply.
 Keep doing this until I say stop."
```

**What the agent builds:**

```
missions.md:
  ▶ Weekly Outreach Loop
    - [ ] Monday: Source 20 new CTOs via Tavily → enrich → verify → send Wave 1
    - [ ] Thursday: Read AERCHITECT.md → filter no-reply Wave 1 → send Wave 2
    - [ ] Repeat

MEMORY.md written after each run:
  "Wave 1 sent: 2026-03-17 — 20 contacts"
  "Wave 2 due: 2026-03-20 — follow up with non-repliers"
```

**With `/loop`:** Run `claude /loop 1d` and the agent checks MEMORY.md daily, executes whatever is due that day, and logs back. It never forgets where it is because missions.md tracks every step and MEMORY.md carries the dates. See [/loop](#loop---self-running-workflows) below.

---

#### Chain 2 — Funding Signal → Immediate Outreach

```
"Monitor for AI startups that announce Series A funding.
 When one appears, find the CTO, send an email within 24 hours
 referencing their funding announcement."
```

```
Agent (daily loop):
  → tavily_search: "AI startup Series A announced site:techcrunch.com OR site:venturebeat.com"
  → Compare results to AERCHITECT.md — skip already-contacted companies
  → For new ones: enrich CTO email via Prospeo
  → Send email: "Congrats on the Series A — [personalised hook]"
  → Log to AERCHITECT.md with funding signal source
  → Write to MEMORY.md: next check due tomorrow
```

**Why timing matters:** Companies that just raised are actively hiring, building, and buying. Your email lands when they have budget and urgency.

---

#### Chain 3 — Job Posting Signal → Engineer Outreach

```
"Find AI companies that posted a backend engineer job in the last 7 days.
 Find the CTO or VP Engineering. Send them my portfolio.
 7 days later, follow up if no reply."
```

```
Agent:
  → tavily_search: "AI startup hiring backend engineer site:linkedin.com/jobs OR lever.co OR greenhouse.io"
  → Extract company names from job postings
  → Find CTO/VP Eng per company via Prospeo
  → Send Wave 1: portfolio email with job posting signal as hook
  → Log to AERCHITECT.md: source=job posting, role=backend engineer
  → Write to MEMORY.md: "Wave 2 due 2026-03-20 for [N] contacts"

7 days later (new session):
  → Agent reads MEMORY.md → Wave 2 due today
  → Reads AERCHITECT.md → filters no-reply job-signal contacts
  → Sends follow-up
```

---

#### Chain 4 — Event → Post-Event Outreach

```
"Find people who attended or spoke at SaaStr 2025.
 Find their emails. Send them an email referencing SaaStr
 and what they spoke about or posted about it."
```

```
Agent:
  → tavily_search: "SaaStr 2025 speakers attendees LinkedIn"
  → tavily_extract: speaker list pages, LinkedIn post aggregators
  → For each speaker: name + company → Prospeo enrich
  → tavily_search per person: "[Name] SaaStr 2025 talk OR post"
  → Personalise email: reference their session topic or post
  → Send
  → Log source: SaaStr 2025
```

---

#### Chain 5 — Competitor Customer → Switcher Campaign

```
"Find people who mention using [Competitor] on LinkedIn or in reviews.
 Send them a comparison email showing why we're better."
```

```
Agent:
  → tavily_search: "[Competitor] review site:g2.com OR capterra.com"
  → tavily_search: "using [Competitor] site:linkedin.com"
  → Extract reviewer names + companies
  → Prospeo enrich emails
  → Send: lead with their specific pain point (from the review text)
  → Log to AERCHITECT.md: source=competitor review
```

---

#### Chain 6 — Content → Inbound Nurture Loop

```
"I'm publishing a blog post about [topic] every week.
 After each post goes live, find 20 people who would care
 about that topic and send them the post with a personal note."
```

```
Agent (weekly, triggered by you):
  → You: "Post is live: [URL]"
  → Agent reads post via tavily_extract
  → Identifies the core topic + who it's for
  → tavily_search: decision makers in that audience
  → Prospeo enrich
  → Email: "Wrote something you might find useful" + link to post
  → Tracks in AERCHITECT.md by post URL
```

---

### `/loop` — Self-Running Workflows

For campaigns that should run on a schedule without you starting each session, use `/loop`.

```bash
claude /loop 1d    # runs the agent daily
claude /loop 12h   # runs every 12 hours
claude /loop 1w    # runs weekly
```

**How it works with missions + memory:**

```
You set up the mission once:
  "Every day: check MEMORY.md for what's due,
   source 20 new leads, send due follow-ups,
   update tracker, write tomorrow's tasks to MEMORY.md"

Agent runs on loop:
  Day 1: Sources 20 leads → sends Wave 1 → writes "Wave 2 due Day 8" to MEMORY.md
  Day 8: Reads MEMORY.md → sees Wave 2 due → sends follow-ups → writes "Wave 3 due Day 15"
  Day 15: Sends Wave 3 (breakup email) → marks contacts closed or hot

You check in when you want. The campaign runs itself.
```

**Why it stays on course:**

- `missions.md` — every task written before execution. If the loop crashes mid-step, next run reads missions.md and continues from the last ✅ step
- `MEMORY.md` — every follow-up date written after each send. The agent always knows what's due and when
- `AERCHITECT.md` — every contact logged. The agent never re-contacts the same person because it checks the tracker before every send

The combination of these three files makes the agent stateful across arbitrary time gaps. A `/loop` that ran yesterday picks up exactly where it left off today — even if the session crashed, the machine rebooted, or you paused for a week.

---

### `/agent-teams` — Autonomous Agent Teams on Cron

`/loop` runs one agent on a schedule. `/agent-teams` builds a **full team** — multiple agents with defined roles, a shared mission queue, and persistent memory — all wired to cron and running while you sleep.

The difference: `/loop` re-runs the same prompt. `/agent-teams` creates a structured wave-by-wave mission plan, writes it to disk, and the orchestrator agent wakes up every N minutes to read the plan, execute the next step, write its results to memory, and advance the mission. The team never loses state — even if your laptop restarts, the next cron run reads the files and continues exactly where it left off.

**Use cases:**
- Run a 3-wave outreach campaign fully unattended — research wave, send wave, follow-up wave
- Scrape LinkedIn posts overnight, qualify leads, have emails ready to review in the morning
- Monitor for funding signals daily, enrich and send within 24 hours automatically
- Any multi-step job you'd currently babysit manually

---

#### How It Works

```
You: /agent-teams "run a 3-wave outreach campaign targeting AI CTOs at funded startups"

Agent creates:
  .ai-guide/missions.md       ← Wave 1 (▶ active), Wave 2, Wave 3 defined
  .ai-guide/agent-team.md     ← Orchestrator role + any specialist agents
  .ai-guide/memory/session.md ← Blank state file — agents write here after every run

CronCreate fires every 30 min with this standing prompt:
  "Read missions.md. Find ▶. Execute it.
   Write what you did to memory/session.md.
   Mark ✅, activate next ▶. Stop if blocker."
```

Every cron run:
1. Reads `missions.md` — finds the active wave
2. Reads `memory/session.md` — picks up from where the last run stopped
3. Executes the mission (research, enrich, send, follow-up — whatever the wave requires)
4. Writes structured output back to `memory/session.md`
5. Advances `missions.md` to the next wave if done

---

#### Setup

**Step 1 — Install the skill**

If you haven't cloned the repo yet:

```bash
git clone https://github.com/Abhipaddy8/outreach-agent
cd outreach-agent
./install.sh
```

If you already have the repo cloned, install with a single curl — no pull required:

```bash
curl -o ~/.claude/skills/agent-teams.md https://raw.githubusercontent.com/Abhipaddy8/outreach-agent/main/skills/agent-teams.md
```

Either way, the `/agent-teams` command is now available in any Claude Code session.

**Step 2 — Keep your laptop awake**

Agent teams run on cron. Cron only fires while the Claude Code session is active and the laptop is on. If your Mac sleeps, cron pauses.

Before you start a team and step away, run this in a separate terminal window and leave it open:

```bash
caffeinate -i
```

This prevents your Mac from sleeping for as long as the terminal stays open. Kill it with `Ctrl+C` when you're done for the day.

> **Why this matters:** A cron set to every 30 minutes will miss its window if your Mac is asleep. `caffeinate -i` keeps the CPU active so cron fires on schedule. It does not prevent your screen from dimming — just prevents the system from sleeping.

**Step 3 — Watch your context window**

Claude Code has a context window limit. If an agent team runs for many hours across many cron fires, the context fills up. When it does, the agent starts losing track of earlier steps.

To prevent this, run `/compact` every 40–50 minutes while the team is active. `/compact` summarises the conversation history and frees up context — the agent keeps working without losing the thread.

```
Every ~45 minutes while team is running:
  1. Type /compact in the Claude Code session
  2. Session compresses — agent continues
  3. On next cron fire, agent reads missions.md + session.md to re-orient
```

Because the agent writes its state to `memory/session.md` after every run, `/compact` doesn't break anything. The files are the memory — not the conversation.

---

#### How to Use It

Give it a plain English brief — the skill figures out the wave structure:

```
/agent-teams "research 30 VC-backed AI startups, find their CTOs,
              enrich emails, and send a personalised pitch —
              run every 30 minutes"
```

Or be more specific:

```
/agent-teams "
  Wave 1: Use Tavily to find 20 AI companies that raised Series A in 2025.
           Extract CEO or CTO name + company domain. Write to session.md.
  Wave 2: Enrich emails via Prospeo for everyone in session.md.
           Verify via Instantly. Drop invalids.
  Wave 3: Send personalised HTML email to all verified contacts.
           Update AERCHITECT.md. Write follow-up dates to MEMORY.md.
  Interval: every 45 minutes
"
```

After running `/agent-teams`, it will print a summary of the team, the files it created, and the cron schedule. That's your confirmation it's running.

---

#### Checking Progress

While the team runs, check `memory/session.md` to see what the last run did:

```
.ai-guide/memory/session.md

## Last Run
Date: 2026-03-14
Action: Completed Wave 1 — found 20 companies, wrote to session.md

## Current State
Wave 1 complete. Wave 2 active.

## Output
20 companies: [Company A, Company B, ...]

## Next Action
Enrich emails via Prospeo for 20 contacts in session.md
```

Check `missions.md` to see wave progress:

```
## Wave 1 — Research ✅
## Wave 2 — Enrich ▶
## Wave 3 — Send
```

---

#### If the Team Hits a Blocker

If the orchestrator can't proceed — API key missing, rate limit hit, ambiguous instruction — it writes the blocker to `memory/session.md` under **Blockers** and stops. It does not retry. It does not guess.

```
## Blockers
Prospeo API returned 401 — key may be expired or missing.
Waiting for human. No action taken on Wave 2.
```

Read the file, fix the issue, then trigger the orchestrator once manually to resume:

```
Paste the orchestrator prompt directly into the Claude Code session.
The agent reads session.md, sees the blocker is resolved, and continues.
```

---

#### Example Teams

**Outreach campaign (3 waves):**
```
/agent-teams "Wave 1: research 20 AI CTOs. Wave 2: enrich + verify emails.
              Wave 3: send personalised email + update tracker. Every 30 min."
```

**Overnight lead scraper:**
```
/agent-teams "Scrape comments from the top 5 LinkedIn posts about AI sales tools.
              Extract founder/CEO commenters. Enrich their emails.
              Save qualified leads to session.md. Run every 20 min."
```

**Funding signal monitor:**
```
/agent-teams "Every hour: search Tavily for AI startups that announced Series A today.
              Cross-check AERCHITECT.md — skip already-contacted companies.
              For new ones: enrich CTO email, send funding congrats email."
```

---

#### Cron Behaviour

- Cron jobs created by `/agent-teams` auto-expire after **3 days**
- After 3 days, restart the session and run `/agent-teams` again with the same brief — it reads the existing `missions.md` and continues from the last completed wave
- To cancel a team early: `CronList` to find the job ID, then `CronDelete <id>`

---

## Tools Required

| Tool | Purpose | Get It |
|------|---------|--------|
| [Claude Code](https://claude.ai/code) | Execution engine | `npm i -g @anthropic/claude-code` |
| [Composio](https://composio.dev) | Connects Gmail, Apollo, Instantly | composio.dev — free tier |
| [Tavily](https://tavily.com) | Research + lead discovery | tavily.com — 1,000 searches/mo free |
| [Prospeo](https://prospeo.io) | Email enrichment from name + domain | prospeo.io — limited free credits |
| [Instantly](https://instantly.ai) | Email verification | instantly.ai — free tier |

---

## Rules The Agent Never Breaks

These are baked into `CLAUDE.md` and enforced every session:

1. **No bare URLs** — always `is_html=True` + `<a href="...">anchor text</a>`
2. **Test-send first** — sends 1 email to self before any bulk send
3. **4+ permutation failures = drop** — if email can't be found, move on
4. **Update tracker after every batch** — AERCHITECT.md is always current
5. **Update memory at session end** — follow-up dates and lessons always written back

---

## LinkedIn Outreach

LinkedIn outreach is built into this agent's pipeline — but it works differently from email. There's no API key to add, no third-party tool required. You do not need Heyreach, PhantomBuster, Expandi, or any LinkedIn automation SaaS. The agent uses your real, logged-in Chrome session.

That said, if you already have a Heyreach or PhantomBuster API key and want to use it, you can — just tell the agent: *"Add LinkedIn outreach via Heyreach API"* and provide the key. The agent will add it as a skill and use it. Both paths work.

---

### Two Ways LinkedIn Works Here

#### Option A — Claude in Chrome (Recommended)

Claude in Chrome is a browser extension that lets the agent see and control your Chrome browser in real time. It uses your actual logged-in LinkedIn session — no credentials stored, no scraping, no API limits. It reads the page visually and clicks, types, and scrolls like a human.

**How to set it up:**
1. Install the [Claude in Chrome extension](https://chromewebstore.google.com/detail/claude-code/...)
2. Log in to LinkedIn in Chrome as normal
3. Tell the agent: *"Use Claude in Chrome for LinkedIn"*

**How it sends connection requests:**
```
Agent reads AERCHITECT.md → finds contacts flagged for LinkedIn follow-up
  → Opens Chrome tab to linkedin.com/search/results/people/
  → Searches by name + company
  → Navigates to profile
  → Clicks "Connect" → clicks "Add a note"
  → Types a personalised message (generated from MEMORY.md context)
  → Clicks "Send"
  → Updates AERCHITECT.md: touchpoint added, date logged
  → Waits 45–90 seconds before next request (human-like pacing)
```

**Commands you can give it:**
- `"Send connection requests to everyone in AERCHITECT.md flagged for LinkedIn"`
- `"Connect with the 10 people from Wave 1 who haven't replied to email"`
- `"Visit each profile, check their current role, update the tracker"`
- `"Send a LinkedIn DM to Divam Jain at Zeplyn"`

**Limits to respect (built into the agent):**
- Max 20 connection requests per day (LinkedIn's safe threshold)
- 45–90 second gap between each action
- Stop if LinkedIn shows a "limit reached" warning
- Never run during unsociable hours (agent checks system time)

---

#### Option B — Playwright (Headless / Automated)

Playwright runs a headless Chromium browser in the background. No visible window. Good for running scheduled LinkedIn tasks without being at your computer.

**How it works:**
```
Agent launches Playwright browser
  → Loads LinkedIn session from saved cookies (you export these once)
  → Navigates to target profile URLs
  → Clicks Connect → types message → sends
  → Closes browser, logs results to AERCHITECT.md
```

**To use Playwright:**
1. Install: `npm install playwright`
2. Export your LinkedIn cookies once: `npx playwright codegen linkedin.com` — log in, save cookies to `data/linkedin-cookies.json`
3. Tell the agent: *"Use Playwright for LinkedIn outreach"*

**Playwright vs Claude in Chrome:**

| | Claude in Chrome | Playwright |
|--|-----------------|------------|
| Setup | Install extension | `npm install playwright` + cookie export |
| Runs | Visible Chrome window | Headless, background |
| Detection risk | Lower (real browser, real session) | Slightly higher (automated signals) |
| Best for | Interactive sessions, one-off sends | Scheduled, unattended runs |
| Scheduling | Agent sets a reminder in MEMORY.md | Can run via cron or agent trigger |

---

### Full Multi-Channel Pipeline Example

```
You: "Find 50 CTOs at AI startups, send them an email,
      add them to the tracker, and on March 20 remind me
      to send LinkedIn connection requests"
```

**What the agent does:**

```
Mission: Wave 1 — AI CTO Multi-Channel

Step 1 — Research (Tavily)
  → Searches "AI startup CTO 2025 Series A"
  → Extracts 50 names + company domains + LinkedIn URLs

Step 2 — Enrich (Prospeo)
  → POST /enrich-person for each
  → Gets verified email per contact

Step 3 — Verify (Instantly)
  → Checks deliverability
  → Drops invalids, keeps Valid + Catchall

Step 4 — Email Send (Gmail)
  → Writes personalised HTML email per contact
  → Test-sends to self first
  → Sends to all verified contacts
  → Logs to AERCHITECT.md: email sent, date, subject

Step 5 — Tracker Update (AERCHITECT.md)
  → Adds all 50 contacts with status: ✉️ Email Sent
  → Flags each with LinkedIn URL for follow-up
  → Sets follow-up date: 2026-03-20

Step 6 — Memory Update (MEMORY.md)
  → Writes: "2026-03-20 — LinkedIn connection requests due for Wave 1 (50 contacts)"
```

**On March 20, new session:**
```
Agent reads MEMORY.md → sees LinkedIn follow-up due today
Agent: "You have 50 contacts from Wave 1 due for LinkedIn connection requests.
        Want me to start now? I'll use Claude in Chrome at 20/day."

You: "Go"

Agent runs Claude in Chrome:
  → Reads all 50 LinkedIn URLs from AERCHITECT.md
  → Sends connection requests in batches of 20/day
  → Personalises each note: "Hi [Name], I emailed you last week about [topic]..."
  → Updates AERCHITECT.md per send: LinkedIn Request Sent, date
  → Schedules Day 2 + Day 3 reminder in MEMORY.md for remaining 30
```

---

### LinkedIn Skill File

To activate LinkedIn outreach, tell the agent:

```
"Add LinkedIn as a skill using Claude in Chrome"
```

The agent will create `skills/linkedin.md` with the full pipeline and reference it in `CLAUDE.md`. From that point on, any outreach request can include a LinkedIn step automatically.

Or add it manually: drop `skills/linkedin.md` into the skills folder with your preferred method (Claude in Chrome or Playwright) and the agent will pick it up on next session start.

---

## Lead Generation — Finding Interested People Before They Know You Exist

The fastest way to find high-intent leads isn't a database. It's a LinkedIn post.

When a business owner or executive comments on a post about a topic — AI, sales, hiring, operations — they're raising their hand. They care about that problem right now. They're not a cold lead. They're a warm one. You're not interrupting them; you're continuing a conversation they already started in public.

This agent can do the entire pipeline automatically: find the posts, extract the commenters, qualify them, enrich their emails, and send outreach that references the exact post they commented on.

---

### The Pipeline

```
Step 1 — Find the post (Tavily)
  Agent searches for top influencers in your target niche
  Gets their LinkedIn profile URLs

Step 2 — Visit the post (Claude in Chrome)
  Agent navigates to the influencer's recent posts
  Identifies the most relevant post (by topic + engagement)
  Opens the comments section

Step 3 — Extract commenters (DOM + Screenshots)
  Agent runs DOM extraction on the comments section
  Pulls: commenter name, headline, LinkedIn profile URL, comment text
  Takes screenshots of comment batches as backup

Step 4 — Qualify (AI analysis)
  Agent analyzes each commenter's headline + comment text
  Scores them: are they a business owner / decision maker? Do they signal a problem you solve?
  Keeps high-intent leads, drops irrelevant ones

Step 5 — Enrich (Prospeo)
  For each qualified lead: POST /enrich-person with name + company domain
  Gets verified email

Step 6 — Outreach (Email or LinkedIn)
  Option A — Email: personalised copy referencing the exact post + their comment
  Option B — LinkedIn: connection request referencing the post
  Option C — Both: email first, LinkedIn follow-up 7 days later

Step 7 — Track (AERCHITECT.md)
  Every lead logged with source post URL, comment text, enrichment status, send date
```

---

### How DOM Extraction Works

When Claude in Chrome visits a LinkedIn post, the agent runs JavaScript directly in the page context to extract structured data from the DOM — no scraping library needed, no third-party tool.

**What the agent extracts per commenter:**
```javascript
// Agent runs this in the browser via Claude in Chrome
document.querySelectorAll('.comments-comment-item').forEach(comment => {
  const name    = comment.querySelector('.comments-post-meta__name').innerText
  const headline= comment.querySelector('.comments-post-meta__headline').innerText
  const profileUrl = comment.querySelector('a.app-aware-link').href
  const commentText = comment.querySelector('.comments-comment-item__main-content').innerText
  // ...
})
```

This gives the agent a clean list of:
- Full name
- Current headline (e.g. "CEO at Acme | Helping B2B teams close faster")
- LinkedIn profile URL
- Exactly what they wrote in the comment

**Screenshots as backup:** For comment sections that lazy-load or paginate, the agent takes screenshots of each batch and uses vision to extract names and headlines from the image — useful when DOM access is blocked or inconsistent.

---

### How to Instruct the Agent

```
"Find the top 3 LinkedIn influencers posting about AI sales tools,
 go to their most recent posts, extract all the commenters
 who are founders or heads of sales, enrich their emails,
 and send them a short email referencing the post"
```

The agent will:
1. Use Tavily to find influencer profiles (`"top LinkedIn influencers AI sales 2025 site:linkedin.com"`)
2. Open each profile in Chrome, scan recent posts for topic match
3. Extract comments via DOM
4. Filter by headline keywords (Founder, CEO, Head of Sales, VP, Director)
5. Enrich via Prospeo
6. Write email: *"I saw your comment on [Influencer]'s post about [topic] — [your pitch]"*
7. Send + track

---

### Use Cases

#### B2B SaaS — Find Buyers Actively Researching Your Category
```
Target post topic: "Is your sales team ready for AI?"
Target commenter: VP Sales, Head of Revenue, CRO at 50-500 employee companies

Outreach angle:
"Hi [Name] — saw your comment on [Influencer]'s post about AI in sales.
 You mentioned [what they said]. We've built a system that does exactly that —
 [one-line result]. Worth a 15-min look?"
```

#### Recruiting / Staffing — Find Hiring Managers Complaining About Talent
```
Target post topic: "Why is hiring engineers so hard right now?"
Target commenter: CTO, VP Engineering, Founder who mentions hiring pain

Outreach angle:
"Saw you comment on [Influencer]'s post about the engineer hiring crunch.
 You said [their words]. I'm an AI systems engineer open to contract work —
 happy to jump on a call if the timing's right."
```

#### Agency / Consulting — Find Founders Struggling With Your Problem
```
Target post topic: "Our outbound completely dried up in 2025"
Target commenter: Founder, CEO, Head of Growth at B2B product companies

Outreach angle:
"[Name] — saw your comment on [post] about outbound dying.
 We've replaced the entire SDR function with an AI system for 3 companies.
 Happy to show you how if you're open to it."
```

#### SaaS Partnerships — Find Complementary Tool Builders
```
Target post topic: "Best AI tools for operations teams"
Target commenter: Founders of adjacent SaaS tools (not direct competitors)

Outreach angle:
"Saw you engage with [Influencer]'s post on AI ops tools.
 We're building in the same space — looks like our tools are complementary.
 Would love to explore a partnership or integration."
```

#### Investor Outreach — Find Active Investors Commenting on Startup Posts
```
Target post topic: "What makes an AI startup fundable in 2025?"
Target commenter: Partners at VC firms, angel investors, scouts

Outreach angle:
"Noticed your comment on [post] about what makes AI startups fundable.
 You mentioned [their point]. We've hit [traction metric] —
 would love to share what we're building."
```

---

### Full Prompt Example (Copy + Paste)

```
Find the top 5 LinkedIn influencers who post about [YOUR TOPIC].
For each, visit their 3 most recent posts and extract all commenters.
Filter for: [TARGET TITLES] at companies with [HEADCOUNT] employees.
For each qualified commenter:
  - Get their LinkedIn URL from the DOM
  - Enrich their email via Prospeo
  - Log to AERCHITECT.md with: name, company, comment text, post URL
Then send each one an email that:
  - References the specific post they commented on
  - Quotes or paraphrases what they said
  - Connects it to [YOUR OFFER]
  - Ends with a soft CTA
Use is_html=True, no bare URLs, test-send to me first.
Set a LinkedIn follow-up reminder for 7 days from now.
```

---

### Why This Works Better Than Database Outreach

| Method | Intent Signal | Personalisation | Response Rate |
|--------|--------------|-----------------|---------------|
| Apollo / database search | None — cold by definition | Generic | 1–3% |
| Job posting signals | Hiring intent only | Moderate | 3–7% |
| LinkedIn comment scraping | Active, public, topic-specific | Very high — you reference their exact words | 8–20% |

When someone comments on a post, they've told you:
- They care about this topic right now
- They're active on LinkedIn
- They're comfortable engaging publicly

Your outreach isn't cold. It's the continuation of a conversation they already started.

---

## Skills — Slash Commands

The outreach agent ships with 8 skills. Each one is a complete pipeline you invoke with a slash command. Type it and the agent runs the full workflow — setup wizard on first run, then execution.

Every skill works at two scales:

- **Small scale (default)** — uses Tavily for research and your own Chrome session for LinkedIn. Free, works immediately, good for 10-20 leads per session. No extra APIs needed.
- **Larger scale (with Apify)** — add Apify MCP for LinkedIn scraping on foreign proxies. Your account stays invisible for READ operations. Handles 100+ comments, bulk profile qualification, competitor monitoring. See [Scaling with Apify](#scaling-with-apify).

---

### `/outreach` — Cold Email Pipeline

The core skill. Finds leads, enriches emails, verifies, writes personalised copy, sends.

```
You: /outreach
Agent: "Campaign type? Target criteria? How many?"
You: "10 AI CTOs at Series A startups, job application angle"

Agent runs:
  Tavily → find companies + decision makers
  Prospeo → enrich email (linkedin_url method, 1 credit each)
  Instantly → verify deliverability
  Gmail → send personalised HTML email per contact
  AERCHITECT.md → log everything
```

**Invoke**: `/outreach` — agent asks 3 questions, then executes.

**On a cron (agent-teams)**:
```
You: /agent-teams
Brief: "Source 20 leads, enrich, verify, send cold emails. Run every 8 hours.
       Target: VP Sales at 50-500 employee B2B SaaS. Angle: outreach agent repo."
```
The orchestrator wakes every 8 hours, reads the mission, runs the outreach pipeline, updates the tracker, queues the next batch.

---

### `/lead-borrow` — Borrow Leads from Influencer Posts

Find an influencer's LinkedIn post about your topic. Extract everyone who commented or liked it. Qualify them against your ICP. Send connection requests to the fits.

```
You: /lead-borrow
Agent: "Which LinkedIn post?"
You: "Jason Bay's AI SDR post"

Agent runs:
  Navigate to post → extract commenters (DOM) + likers (reactions modal)
  Identifier agent: reads every name, headline, company
  Qualifier agent: applies ICP filter — keeps sales leaders, drops GTM vendors
  Connector: sends 10 personalised connection requests
  Copy agent: writes conversation openers for when they accept
```

**How it extracts**: By default, uses JavaScript DOM extraction on your logged-in LinkedIn session. Gets commenter names, headlines, profile slugs, and comment text in 2-3 JS calls. Likers are limited (~10 at a time due to modal lazy-loading). With Apify, gets all likers and commenters at scale with zero risk to your account.

**Invoke**: `/lead-borrow` — give it a post URL or person + topic, agent handles the rest.

**On a cron (agent-teams)**:
```
You: /agent-teams
Brief: "Every day, find Jason Bay's latest post, extract commenters,
       qualify against ICP, send 10 connection requests. Run daily at 9am IST."
```

---

### `/daily-icp-feed` — Daily ICP Post Monitor

Finds the top 20 LinkedIn posts matching your ICP keywords from the last 24 hours. Ranks by engagement. Drafts a personalised comment for each one. You approve which to post.

```
You: /daily-icp-feed

Agent runs:
  Tavily/Apify → search LinkedIn for ICP keywords (AI SDR, outbound, cold email)
  Rank by engagement score: (comments × 3) + (likes × 1) + (shares × 2)
  Check memory → skip posts already commented on
  Draft personalised 2-4 sentence comment per post (peer tone, no "Great post!" energy)
  Save to daily-feeds/feed-[date].md
  You review → approve → agent posts via Chrome
```

**First run setup**: Agent asks you to define your ICP keywords and saves them to `config/icp-keywords.md`. These persist across sessions.

**Invoke**: `/daily-icp-feed` — agent finds posts and drafts comments. You approve before anything gets posted.

**On a cron (agent-teams)**:
```
You: /agent-teams
Brief: "Run /daily-icp-feed every day at 6pm IST.
       Keywords: AI SDR, outbound automation, cold email, sales pipeline.
       Save feed to daily-feeds/. I'll review and post manually."
```

---

### `/qualify-audience` — Qualify Your Own Post Engagers

After you post on LinkedIn and get engagement, this skill scrapes everyone who liked or commented, scores them against your ICP, and routes qualified leads into your outreach pipeline.

```
You: /qualify-audience
Agent: "Which of your posts?"
You: [paste LinkedIn post URL]

Agent runs:
  DOM/Apify → extract all likers + commenters
  Score each person against ICP criteria (config/icp-scoring.md)
  Score 7+ → qualified warm lead
  Prospeo → enrich email for qualified leads
  Route: connection request (warm note) OR email (if email found)
  Save to AERCHITECT.md as warm leads
```

**Key difference from `/lead-borrow`**: Lead-borrow scrapes OTHER people's posts (cold audience). Qualify-audience scrapes YOUR posts (warm audience — they already engaged with you). Warm leads convert 3-5x higher.

**First run setup**: Agent asks you to define your ICP scoring criteria — what titles, company types, and signals earn points. Saves to `config/icp-scoring.md`.

**Invoke**: `/qualify-audience` — give it your post URL, agent qualifies and routes.

**On a cron (agent-teams)**:
```
You: /agent-teams
Brief: "Every 2 days, check my latest LinkedIn post, qualify all engagers,
       enrich emails for anyone scoring 7+, draft connection notes.
       Save qualified leads to AERCHITECT.md."
```

---

### `/content-reflect` — Own Content Performance

Analyses your last 10 LinkedIn posts to find what's working, what's not, and what to post next.

```
You: /content-reflect

Agent runs:
  DOM/Apify → scrape your activity page
  Extract per post: text, likes, comments, shares, date, format
  Analyse: which hooks perform, which formats get comments, best posting times
  Compare top 3 vs bottom 3 posts → find the pattern
  Write recommendations for next 3 posts
  Save to memory/content-analysis.md
```

**What it tells you**: Your best hook type (question vs stat vs contrarian), best format (text vs image vs carousel), best posting time, and which topics your audience actually engages with vs scrolls past.

**Invoke**: `/content-reflect` — no input needed, agent reads your profile.

**On a cron (agent-teams)**:
```
You: /agent-teams
Brief: "Run /content-reflect every Sunday evening.
       Analyse my last 10 posts, update content-analysis.md,
       recommend 3 posts for the coming week."
```

---

### `/content-compare` — Competitor Analysis

Analyses your competitors' LinkedIn content to find gaps and opportunities you can exploit.

```
You: /content-compare

Agent runs:
  Tavily/Apify → scrape each competitor's last 5 posts
  Analyse: content frequency, hook patterns, topics, engagement, audience
  Cross-compare all competitors:
    → Topics everyone covers (oversaturated)
    → Topics some cover (differentiation opportunity)
    → Topics nobody covers (blue ocean)
  Write recommendations tied to specific gaps
  Save to memory/competitor-analysis.md
```

**First run setup**: Agent asks for your top 3-5 competitors. Saves to `config/competitors.md` — a simple table with name, LinkedIn URL, niche. Persists across sessions. Add or remove competitors anytime.

**Invoke**: `/content-compare` — agent reads competitor list and analyses.

**On a cron (agent-teams)**:
```
You: /agent-teams
Brief: "Run /content-compare every 2 weeks on Monday.
       Competitors: [list]. Update competitor-analysis.md.
       Flag any new content gaps since last run."
```

---

### `/signal-monitor` — Daily Signal Tracking

Scans the web daily for buying signals — funding rounds, job postings, and ICP-relevant LinkedIn posts. Prioritises by urgency. Drafts an action item for each signal.

```
You: /signal-monitor

Agent runs:
  Tavily → scan funding news (Series A, Seed in target industries)
  Tavily → scan job postings (titles that signal need for your offer)
  Tavily/Apify → scan LinkedIn posts from ICP decision makers
  Prioritise:
    🔴 IMMEDIATELY — funded company (hot money, act today)
    🟡 TODAY — job posting (active need)
    🟢 THIS WEEK — relevant post (engagement play)
  Prospeo → enrich CEO/CTO emails for funding + job signals
  Draft email or comment for each signal
  Save to signal-feeds/signals-[date].md
  You review and approve
```

**First run setup**: Agent asks 3 questions — target industries, job titles that signal a need, and LinkedIn topics to watch. Saves to `config/signal-criteria.md`.

**Invoke**: `/signal-monitor` — agent scans and builds the signal feed. You approve actions.

**On a cron (agent-teams)**:
```
You: /agent-teams
Brief: "Run /signal-monitor every day at 7am IST.
       Industries: SaaS, fintech.
       Job signals: SDR, Head of Sales.
       LinkedIn topics: AI SDR, outbound, pipeline.
       Save to signal-feeds/. I'll review and approve sends."
```

---

### `/agent-teams` — Autonomous Agent Teams

Not an outreach skill — a meta-skill. Takes any brief and turns it into a self-running agent team with missions, memory, and a cron schedule.

```
You: /agent-teams
Brief: "Find 20 leads per day, email them, follow up after 3 days.
       Run every 8 hours for 3 days."

Agent creates:
  .ai-guide/missions.md → 3 waves (source, send, follow-up)
  .ai-guide/agent-team.md → team roster (researcher, sender, follow-up agent)
  .ai-guide/memory/session.md → persistent state between runs
  CronJob → fires orchestrator every 8 hours
  Orchestrator reads mission → fires sub-agent → validates → advances
```

**Any skill can become a cron job** by wrapping it in an agent-team brief. The examples under each skill above show how.

**Invoke**: `/agent-teams` — describe what you want automated.

---

### Scaling with Apify

Every skill works out of the box with Tavily (web search) and your own Chrome session (DOM extraction). This is fine for 10-20 leads per session, 1-2 posts per day.

When you need more:

| Scale | What changes | Why |
|-------|-------------|-----|
| 50+ comments per post | Add Apify | DOM extraction risks your LinkedIn account at volume |
| 100+ profile qualifications | Add Apify | Bulk profile visits get flagged. Apify uses rotating proxies |
| Daily competitor monitoring | Add Apify | 5 competitors × 5 posts = 25 page loads per day on your session |
| All 77 likers from a post | Add Apify | LinkedIn's reactions modal lazy-loads ~10 at a time. Apify gets all |

**The golden rule**: If your name doesn't need to appear, use Apify. If it does (connection request, DM, comment, like), use your own Chrome session.

**Setup** (5 minutes):
1. Get an API key at [console.apify.com](https://console.apify.com)
2. Add to `.mcp.json`:
```json
{
  "mcpServers": {
    "apify": {
      "command": "npx",
      "args": ["-y", "@apify/mcp-server-rag-web-browser"],
      "env": {
        "APIFY_TOKEN": "your-token-here"
      }
    }
  }
}
```
3. Skills automatically detect Apify and use it for READ operations. No code changes needed.

See `docs/apify-strategy.md` for the full architecture reference.

---

## Autoresearch — Autonomous Optimization Loop

Inspired by [Karpathy's autoresearch](https://github.com/karpathy/autoresearch) (42K stars). The same concept — AI agent runs experiments in a loop, scores results, keeps winners, reverts losers — applied to outreach instead of ML training.

**The idea:** Your agent sent 200 emails last week. Some subject lines got 50% opens, others got 12%. Some ICPs replied at 8%, others at 0%. Instead of you manually figuring out what works, the agent runs the optimization loop for you.

### The Autoresearch Loop

```
1. Define metric      → what are we optimizing? (reply rate, open rate, meetings)
2. Read baseline      → pull current performance from AERCHITECT.md
3. Generate hypothesis → "shorter subject lines get more opens"
4. Create variant     → write new version with ONE change
5. Run experiment     → send variant to next 20 contacts
6. Score result       → compare variant vs baseline after 3-7 days
7. Keep or revert     → winner becomes new baseline
8. Log finding        → write to memory/optimization-log.md
9. Loop               → next hypothesis, repeat
```

### What Autoresearch Optimizes

| What | Variables Tested | Metric |
|------|-----------------|--------|
| **Subject lines** | Length, format, personalization | Open rate |
| **Email body** | Word count, CTA type, structure | Reply rate |
| **ICP targeting** | Industry, company size, job title, geography | Reply rate + meetings |
| **LinkedIn notes** | Length, approach, tone | Acceptance rate |
| **Follow-up timing** | Day gaps, number of touches | Follow-up reply rate |
| **Send timing** | Day of week, time of day | Open rate |

### Autoresearch Example Session

```
You: /autoresearch

Agent: Reading your outreach data from AERCHITECT.md...

Current baselines:
- Subject: "your team's AI gap" → 42% open rate (89 sends)
- Body: 78 words, pain→solution→CTA → 4.5% reply rate
- ICP: VP/Director at $20M+ US companies → 2 meetings from 89 contacts

Hypothesis: Shorter subject lines (2-3 words) outperform 4+ word subjects.
Source: Clay/Instantly 2026 data — 46% open rate for 2-4 word subjects.

Variant: "quick thought"
Control: "your team's AI gap"

I'll test on next 20 contacts. Scoring in 5 days. Proceed?
```

Every experiment is logged in `memory/optimization-log.md`. Every winner is saved in `memory/baselines.md`. The agent never loses what it learns.

Run `/autoresearch` → full details in `skills/autoresearch.md`

---

## Apify Agent Skills — Scraping Superpowers

[Apify](https://github.com/apify/agent-skills) open-sourced 8 agent skills that give your outreach agent instant access to scraping across 50+ platforms. No custom integrations. Each skill is a markdown file your agent reads and executes.

### The 8 Apify Skills

| Skill | What It Scrapes | Outreach Use Case |
|-------|----------------|-------------------|
| **Lead Generation** | Google Maps, LinkedIn, Instagram, TikTok, Facebook, YouTube | Find leads by location, industry, social activity |
| **Competitor Intelligence** | Pricing pages, social posts, ads, positioning | See what competitors post, how they price, what ads run |
| **Brand Monitoring** | Reviews, ratings, sentiment across 10+ platforms | Companies with dropping ratings = they need your help |
| **E-commerce** | Amazon, Walmart, eBay, IKEA, 50+ marketplaces | Find sellers by category, track pricing, read reviews |
| **Influencer Discovery** | Instagram, TikTok, YouTube, Facebook | Find micro-influencers your ICP follows |
| **Content Analytics** | Engagement metrics across all social | Measure what's working in your content |
| **Trend Analysis** | Google Trends + social platforms | Spot emerging trends before they peak |
| **Ultimate Scraper** | Any website, AI-powered | Catch-all for custom scraping jobs |

### How Apify Maps to Outreach Skills

```
Apify Lead Generation    →  /outreach (more sources beyond Tavily)
Apify Competitor Intel   →  /content-compare (real data, not guesses)
Apify Brand Monitoring   →  /signal-monitor (reputation drops = buying signals)
Apify Influencer         →  /lead-borrow (find whose audience = your ICP)
Apify Content Analytics  →  /content-reflect (real metrics on your posts)
Apify Trend Analysis     →  /daily-icp-feed (trending topics = content ideas)
Apify Ultimate Scraper   →  everything (catch-all for custom research)
```

### Apify Power Combos

**Lead Gen + Enrichment Pipeline:**
```
Apify Google Maps → 50 businesses in Austin
→ Extract owner names
→ Prospeo enrich → verified emails
→ Gmail send personalized outreach
```

**Competitor Intel + Content Strategy:**
```
Apify scrape competitor's last 100 posts
→ /content-compare analysis
→ Generate 5 posts filling their gaps
```

**Signal Monitoring + Outreach:**
```
Apify brand monitoring → companies with dropping ratings
→ /signal-monitor flags as hot leads
→ /outreach: "noticed your reviews mention [pain] — we fix that"
```

Setup: `npm install -g apify-cli && export APIFY_TOKEN=your_token`
Get token: [console.apify.com](https://console.apify.com/account/integrations)

Full details in `skills/apify-skills.md`

---

## Adding Your Own Skills

Skills are `.md` files that tell the agent what to do. Drop one into `.claude/skills/` with YAML frontmatter and it becomes a slash command.

```
.claude/skills/
├── my-new-skill/
│   └── SKILL.md
```

SKILL.md format:
```yaml
---
name: my-new-skill
description: What this skill does (one line — Claude uses this to decide when to load it)
---

# /my-new-skill — Human-readable title

## When to use
Describe when the agent should use this skill.

## Setup Wizard (First Run)
Check dependencies, test APIs, create config files.

## Instructions
Step-by-step pipeline the agent follows.
```

Run `./install.sh` to install your new skill globally. Or just restart Claude Code — project-level skills in `.claude/skills/` are auto-discovered.

Example — add a LinkedIn skill:
```
skills/
├── outreach.md      ← cold email pipeline
└── linkedin.md      ← LinkedIn DM pipeline (new)
```

In `CLAUDE.md`:
```
## SKILLS AVAILABLE
- Cold email: skills/outreach.md
- LinkedIn DM: skills/linkedin.md
```

The agent will use whichever skill matches the user's request.

---

## Contributing

PRs welcome. If you add a new tool integration (Apollo, Hunter, Lemlist, etc.), add it to `skills/outreach.md` and update `.mcp.json` with the connection config.
