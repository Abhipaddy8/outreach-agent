# Apify Strategy — LinkedIn Scraping vs. Own Instance

> Reference document for expanding the Outreach Agent repo.
> Created: 2026-03-15

---

## Why Apify Instead of Playwright for READ Operations

Playwright (or Claude in Chrome) uses **your own browser session**. LinkedIn sees your IP, your cookie, your session. When you scrape 100+ comments from a post or bulk-visit profiles, LinkedIn detects bot-like behavior — and you've already experienced restrictions from sending too many connection requests manually.

Apify runs on **their servers with rotating proxies**. Your account never appears. You're renting someone else's infrastructure at scale. For any operation where you're only reading data (not posting, liking, or connecting), there is zero reason to risk your own account.

**Rule of thumb**: If your name doesn't need to appear, use Apify. If it does, use your own instance.

---

## Golden Rule: Apify = READ, Own Instance = WRITE

| Operation | Tool | Why |
|-----------|------|-----|
| Scrape posts, read comments | **Apify** | Foreign proxy, your account invisible |
| Qualify profiles (headline, role) | **Apify** | Bulk queries without rate-limit risk |
| Analyze comment threads | **Apify** | 25,000 requests/month, no detection |
| Analyze content performance | **Apify** | Scraping own + competitor posts |
| **Send connection request** | **Own instance** | Must come from your account |
| **Send DM** | **Own instance** | Must come from your account |
| **Like a post** | **Own instance** | Should be visible on your profile |
| **Post a comment** | **Own instance** | Should appear under your name |
| **Visit profile (strategic)** | **Own instance** | "Who viewed your profile" signal |

### Quick Reference

```
APIFY (invisible, safe, scalable)                OWN INSTANCE (visible, limited)
─────────────────────────────────                ───────────────────────────────────
Scrape comments                                  POST a comment
Qualify profiles                                 Like a post
Pull engagement data                             Send connection request
Analyze competitors                              Send DM
Measure own post performance                     Strategic profile visit
Signal monitoring (jobs, funding)                Anything where YOUR NAME should appear
```

---

## Reference Process: Lead Qualification at Scale

```
2,500 contacts in
  → Apify: extract company emails
  → Firecrawl: research profiles
  → Apify: qualify on LinkedIn (decision maker vs. employee)
  → 300 remaining → email the higher-ups
```

---

## Current Problems in the Repo

### 1. `lead-borrow.md` uses Playwright for comment scraping

Step 2 currently runs via `mcp__playwright__browser_navigate` + `mcp__playwright__browser_snapshot` — that's your own LinkedIn instance. Unnecessarily risky for READ-ONLY operations.

**Fix**: Switch Step 2 to Apify. Keep Playwright only for Step 4 (connection requests).

### 2. No Apify MCP in `.mcp.json`

Currently available: Tavily, Firecrawl, Gmail, Instantly, Apollo — but no Apify.

### 3. Cron job scenario has no dedicated skill

"Daily: find top 20 ICP posts + draft individual comments" doesn't exist as a skill anywhere.

---

## Skill Overview: What's New vs. What's Upgraded

### 4 Brand New Skills

| # | Skill | Purpose |
|---|-------|---------|
| 1 | `/daily-icp-feed` | Daily cron: find top ICP posts + draft comments |
| 2 | `/content-reflect` | Analyze own post/video performance |
| 3 | `/content-compare` | Analyze competitor content + find gaps |
| 4 | `/qualify-audience` | Qualify engagers on own posts as warm leads |

### 2 Upgraded Existing Skills

| # | Skill | Change |
|---|-------|--------|
| 5 | `/lead-borrow` (UC 3) | Step 2-3 from Playwright → Apify (safer) |
| 6 | `/signal-monitor` (UC 6) | Now uses Apify for LinkedIn signals instead of Playwright |

### Unchanged (stays as-is)

- UC 1 — Cold Email Pipeline
- UC 2 — LinkedIn Connection Requests (must use own instance)
- UC 4 — /loop
- UC 5 — /agent-teams

---

## Skill 1: `/daily-icp-feed` — Daily ICP Post Monitor

**Purpose**: Cron job that finds the most relevant ICP posts daily and prepares personalized comment drafts.

**Pipeline**:
```
Apify scrapes top 20 posts matching ICP keywords (last 24h)
  → Ranks by engagement (likes + comments)
  → Checks if already commented
  → Writes an individual comment draft for each post
  → Saves to daily-feed-[date].md
  → User decides which to post (via Chrome Extension)
```

**Tool split**:
- Apify: research + scraping
- Own instance: only posting the selected comments

**Cron setup**:
```
caffeinate -i                    # keep Mac awake
claude /loop 1d /daily-icp-feed  # runs daily at set time
```

---

## Skill 2: `/content-reflect` — Own Content Performance Analysis

**Purpose**: Analyze own LinkedIn posts (later YouTube) — what works, what doesn't.

**Pipeline**:
```
Apify scrapes own last 10 LinkedIn posts
  → Engagement data (likes, comments, shares, impressions)
  → Which hooks/topics perform
  → Pattern recognition (time of day, format, length, tone)
  → Top 3 insights + recommendations for next posts
  → Saves to content-analysis.md (updated on each run)
```

**YouTube extension** (once channel is live):
```
Apify scrapes own last 5 videos
  → CTR, watch time, retention curve
  → Which titles + thumbnails perform
  → Hook analysis (first 30 seconds)
  → Saves to youtube-analysis.md
```

---

## Skill 3: `/content-compare` — Competitor Analysis

**Purpose**: Regular analysis of top competitors — identify content gaps and patterns.

**Pipeline**:
```
Apify scrapes top 5-10 defined competitors on LinkedIn
  → Their last 5 posts + performance data
  → Title patterns that perform well
  → Hook patterns (first sentence)
  → Topics they cover vs. don't cover
  → Identify content gaps (high demand, low supply)
  → Saves to competitor-analysis.md
```

**Configuration**: Maintain competitor list in a `competitors.md` file:
```markdown
# competitors.md
| Name | LinkedIn URL | Platform | Niche |
|------|-------------|----------|-------|
| ... | ... | LinkedIn + YouTube | AI consulting DACH |
```

---

## Skill 4: `/qualify-audience` — Qualify Own Post Engagers

**Purpose**: Segment likers and commenters on own posts by ICP and feed qualified leads into the pipeline.

**Pipeline**:
```
Input: LinkedIn post URL (own post)
  → Apify scrapes all likers + commenters
  → Qualifies by ICP (headline, company, role, industry)
  → Segments:
      - Decision makers (score >= 7) → AERCHITECT.md as warm leads
      - Employees → discard
      - Irrelevant → discard
  → Email enrichment via Prospeo for decision makers
  → Optional: queue connection request via /linkedin-connect
```

**Difference from `/lead-borrow`**:
- `/lead-borrow` = scrape other people's posts (influencer audiences)
- `/qualify-audience` = scrape your own posts (your audience)

---

## Skill 5: `lead-borrow.md` UPGRADE — Apify Replaces Playwright

**Purpose**: Make the existing lead-borrow skill safer by using Apify for READ operations.

**Changes**:
```
Step 1: Firecrawl/Tavily → find influencers              (unchanged)
Step 2: Apify → scrape comments                           (NEW — replaces Playwright)
Step 3: Qualification with Apify data                     (unchanged, better data)
Step 4: Own instance → connection requests + email         (unchanged)
Step 5: Own instance → acceptance tracking                 (unchanged)
```

**Benefit**: Zero risk to your LinkedIn account when scraping 100+ comments per post.

---

## Skill 6: `/signal-monitor` — Daily Signal Tracking

**Purpose**: Combines all signal types (funding, job postings, relevant posts) into one automated daily scan.

**Pipeline**:
```
Cron: daily
  → Apify scrapes LinkedIn + web for ICP-relevant signals:

    Signal A — Funding (priority: IMMEDIATELY)
      New funding rounds in target industry (Seed, Series A, Debt)
      → Find CFO/CEO → prepare email draft

    Signal B — Job Postings (priority: TODAY)
      New openings that indicate need for your offer
      (e.g. "Sales rep wanted" → offer AI in sales)
      → Find CEO → prepare email draft

    Signal C — Relevant Posts (priority: THIS WEEK)
      ICP decision makers post about topics matching your offer
      → Prepare comment draft

  → Prioritize by urgency
  → Save to signal-feed-[date].md
  → User reviews and approves
```

---

## Implementation Order

| Priority | What | Effort | Dependency |
|----------|------|--------|------------|
| 1 | Set up Apify MCP in `.mcp.json` | 5 min | Apify API key |
| 2 | Build `/daily-icp-feed` | New skill | Apify MCP |
| 3 | Upgrade `lead-borrow.md` to Apify | Skill update | Apify MCP |
| 4 | Build `/qualify-audience` | New skill | Apify MCP |
| 5 | Build `/content-reflect` | New skill | Apify MCP + own posts |
| 6 | Build `/content-compare` | New skill | Apify MCP + competitors.md |
| 7 | Build `/signal-monitor` | New skill | Apify MCP + signal sources |

---

## Setup: Configure Apify MCP

### 1. Add to `.mcp.json`

```json
{
  "mcpServers": {
    "apify": {
      "command": "npx",
      "args": ["-y", "@apify/mcp-server-rag-web-browser"],
      "env": {
        "APIFY_TOKEN": "[YOUR_APIFY_TOKEN]"
      }
    }
  }
}
```

> Alternative: Apify Skills MCP (auto-finds the best scraper for each task, ranks by quality + cost).

### 2. Get Apify Token

1. https://console.apify.com → Settings → API Tokens
2. Add token to `.mcp.json`
3. Test: scrape a simple LinkedIn post URL

---

## Files Generated

| File | Skill | Content |
|------|-------|---------|
| `daily-feed-[date].md` | `/daily-icp-feed` | Top 20 posts + comment drafts |
| `content-analysis.md` | `/content-reflect` | Own performance analysis |
| `youtube-analysis.md` | `/content-reflect` | YouTube performance (later) |
| `competitor-analysis.md` | `/content-compare` | Competitor content analysis |
| `competitors.md` | `/content-compare` | Maintained competitor list |
| `signal-feed-[date].md` | `/signal-monitor` | Daily signals prioritized |
