# Outreach Agent

An autonomous cold email agent powered by Claude Code. You tell it what you want in plain English. It researches targets, finds verified emails, writes personalised copy, sends, and tracks everything — session after session, with memory.

```
You: "Find 20 AI CTOs at Series A startups and pitch my consulting offer"

Agent:
  → Searches Tavily for matching companies
  → Finds decision maker names + roles
  → Enriches via Prospeo to get verified emails
  → Verifies deliverability via Instantly
  → Writes personalised HTML emails per contact
  → Sends via Gmail MCP
  → Logs every contact to AERCHITECT.md
  → Updates MEMORY.md with follow-up dates
```

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
│                                 Contains: startup protocol, setup wizard,
│                                 execution rules, pipeline overview
│
├── MEMORY.md                   ← Persistent memory across sessions.
│                                 Contains: sender profile, what works,
│                                 follow-up dates, lesson log, campaign status
│
├── AERCHITECT.md               ← Full contact tracker.
│                                 Contains: all contacts, replies, batch progress,
│                                 avatar intelligence, session log
│
├── .mcp.json                   ← MCP server connections.
│                                 Composio (Gmail/Apollo/Instantly) + Tavily
│
├── .gitignore                  ← Excludes .env, data exports, .DS_Store
│
├── .ai-guide/
│   ├── missions.md             ← Active + completed mission queue.
│   │                             Agent writes missions here before executing.
│   │                             Setup wizard missions pre-populated.
│   └── architecture.md        ← System design + decisions log.
│                                 Agent checks before making choices.
│
└── skills/
    └── outreach.md             ← Full pipeline instructions.
                                  Every API call, fallback, and rule.
                                  Agent reads this during execution.
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

## Use Cases

### Job Search
```
"Find 15 CTOs at funded AI startups hiring remote engineers
 and send them my portfolio"
```
Agent finds companies with hiring signals, enriches emails, sends portfolio with personalised hook per company.

### Consulting Outreach
```
"Find VP Sales at B2B SaaS companies 50-200 employees
 and pitch my AI outreach system"
```
Agent targets by title + company size + industry, writes copy that references their specific growth challenge.

### Follow-Ups
```
"Send a follow-up to everyone who hasn't replied in 7 days"
```
Agent reads AERCHITECT.md, filters contacts sent 7+ days ago with no reply, writes a short follow-up, sends.

### Pattern Interrupt
```
"Send the TechStack Tetris game to 20 AI engineers as a
 conversation starter"
```
Agent writes a value-first email with the game link hyperlinked (not bare URL), no hard ask, soft CTA.

### Agency Partnership
```
"Find AI development agencies in Europe under 50 people
 and pitch open source tools collaboration"
```
Agent searches by geography + company type + size, personalises per agency.

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

## Adding Your Own Skills

Drop a new `.md` file into `skills/` and reference it in `CLAUDE.md`. The agent reads `skills/` at startup.

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
