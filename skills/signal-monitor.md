# /signal-monitor — Daily Signal Tracking (Funding, Jobs, Posts)

## When to use
User wants automated daily scanning for buying signals — funding rounds, job postings, and ICP-relevant LinkedIn posts.

## Setup Wizard (First Run)

Check `MEMORY.md` for `SETUP_SIGNAL_MONITOR_COMPLETE: true`. If missing:

### S1 — Verify Search Tools
```
Test Apify: Search LinkedIn for recent posts/jobs
  Pass: Returns results
  Fail: Fall back to Tavily-only mode

Test Tavily: Search "Series A funding 2026 [industry]"
  Pass: Returns funding news
  Fail: "Tavily not available — cannot run signal monitor"
  Note: Tavily is REQUIRED (minimum). Apify is optional (adds LinkedIn signals).
```

### S2 — Define Signal Criteria
```
Ask user THREE questions:

1. "What industries/verticals? (e.g. SaaS, fintech, healthtech)"
2. "What job titles signal a need for your offer? (e.g. 'hiring SDR' means they need outbound help)"
3. "What LinkedIn topics should I watch? (e.g. 'AI SDR', 'outbound strategy')"

Write to config/signal-criteria.md:

# Signal Criteria
## Industries
- SaaS, fintech, healthtech

## Job Posting Signals
- "SDR" or "Sales Development" → they're scaling outbound
- "Head of Sales" → building sales function
- "VP Revenue" → revenue leadership hire

## LinkedIn Topic Signals
- AI SDR, outbound automation, cold email, pipeline generation
```

### S3 — Verify Prospeo (for enriching signal targets)
```
Test Prospeo API
  Pass: Can enrich founder/CEO emails from signal companies
  Fail: "Prospeo not configured — signals will be found but not enriched"
```

### S4 — Create Output Directory
```
Create if missing: signal-feeds/ directory
Write SETUP_SIGNAL_MONITOR_COMPLETE: true to MEMORY.md
```

---

## Instructions

### Step 1: Scan for Signals (READ — parallel searches)

Run 3 signal scans in parallel:

**Signal A — Funding (Priority: IMMEDIATELY)**
```
Tavily search x3 (parallel):
  "[industry] Series A funding [this month] [this year]"
  "[industry] seed round announced [this week]"
  "startup funding round [industry] [this month]"

For each funded company found:
  - Company name, funding amount, stage, investors
  - Tavily: find CEO/CFO name + LinkedIn
  - Priority: IMMEDIATELY (funded = budget available NOW)
```

**Signal B — Job Postings (Priority: TODAY)**
```
Tavily search x3 (parallel):
  "hiring [signal job title] [industry] remote"
  "[signal job title] job posting [industry] 2026"
  "linkedin jobs [signal job title] [industry]"

With Apify (if available):
  Apify scrape LinkedIn Jobs search for signal titles

For each relevant posting:
  - Company, role, location
  - Tavily: find CEO/Head of Sales
  - Priority: TODAY (actively building team = active buyer)
```

**Signal C — Relevant Posts (Priority: THIS WEEK)**
```
With Apify (if available):
  Apify scrape LinkedIn posts matching topic signals from last 48h
  Returns: author, post text, engagement, URL

With Tavily fallback:
  Search "site:linkedin.com [topic signal] [this week]"
  Extract author names + post context

For each relevant post:
  - Author name, headline, post topic
  - Draft a comment (same rules as /daily-icp-feed)
  - Priority: THIS WEEK (engagement opportunity, not urgent)
```

### Step 2: Prioritize + Deduplicate

```
Priority order:
  🔴 IMMEDIATELY — Funded companies (hot money, act today)
  🟡 TODAY — Job postings (active need, act within 24h)
  🟢 THIS WEEK — Relevant posts (engagement play, act within 7 days)

Deduplicate: if same company appears in multiple signals, merge and bump priority.
```

### Step 3: Prepare Action Items

For each signal:

**Funding signals → Email draft:**
```
Prospeo: enrich CEO/CFO email
Draft email: congratulate on funding + offer that matches their growth stage
Template: "Congrats on the [stage] — [your relevant offer]. [CTA]"
```

**Job posting signals → Email draft:**
```
Prospeo: enrich CEO/Head of Sales email
Draft email: reference their hiring + offer that solves the same problem
Template: "Noticed you're building out [function] — [your offer]. [CTA]"
```

**Post signals → Comment draft:**
```
Draft personalized comment (same rules as /daily-icp-feed Step 3)
No email — engage publicly first
```

### Step 4: Save Daily Signal Feed

Write to `signal-feeds/signals-[YYYY-MM-DD].md`:
```markdown
# Signal Feed — [date]
Generated: [timestamp]

## 🔴 IMMEDIATELY — Funding Signals
| # | Company | Stage | Amount | Target Person | Email | Action Draft |
...

## 🟡 TODAY — Job Posting Signals
| # | Company | Role Posting | Target Person | Email | Action Draft |
...

## 🟢 THIS WEEK — Post Engagement Signals
| # | Author | Post Topic | URL | Comment Draft |
...

## Summary
- Funding signals: [count]
- Job signals: [count]
- Post signals: [count]
- Total action items: [count]
```

### Step 5: User Reviews + Approves

User reviews signal feed → approves which actions to take.
- Approved emails → send via Gmail MCP
- Approved comments → post via claude-in-chrome
- Approved connections → queue via /lead-borrow Step 4

---

## Cron Setup
```
caffeinate -i
claude /loop 1d /signal-monitor   # runs daily
```

---

## MCP Tools Used
- Tavily MCP (REQUIRED — funding searches, job searches, post discovery)
- Apify MCP (optional — LinkedIn job/post scraping for richer data)
- Prospeo API (optional — email enrichment for signal targets)
- Gmail MCP (WRITE — sending approved emails)
- claude-in-chrome (WRITE — posting approved comments)
