# User Feedback — Apify Strategy + New Skills
Date received: 2026-03-15
Source: User testing the outreach-agent repo

---

## Core Feedback

### Architecture: READ/WRITE Split
User proposes separating LinkedIn operations:
- **Apify** for all READ operations (scraping comments, qualifying profiles, analyzing engagement) — runs on foreign proxies, account invisible
- **Own instance** (Claude in Chrome / Playwright) for WRITE operations only (connection requests, DMs, likes, comments, strategic profile visits)

**Rule**: If your name doesn't need to appear, use Apify. If it does, use your own instance.

### Current Problem Identified
`lead-borrow.md` currently uses Playwright for comment scraping (Step 2). This is the user's own LinkedIn session — unnecessarily risky for READ-ONLY operations.

### Missing Infrastructure
No Apify MCP in `.mcp.json`. Needs to be added as a dependency.

---

## 4 New Skills Requested

### 1. `/daily-icp-feed`
Daily cron that finds top 20 ICP posts, ranks by engagement, drafts personalized comments.
- Apify scrapes posts matching ICP keywords (last 24h)
- Ranks by engagement
- Checks if already commented
- Writes individual comment drafts
- User approves which to post via own instance

### 2. `/content-reflect`
Analyze own LinkedIn post performance (later YouTube).
- Apify scrapes own last 10 posts
- Engagement data (likes, comments, shares, impressions)
- Hook/topic pattern recognition
- Time of day, format, length, tone analysis
- Outputs: top 3 insights + recommendations

### 3. `/content-compare`
Competitor content analysis.
- Apify scrapes defined competitors' last 5 posts
- Title + hook patterns that perform
- Topics they cover vs don't cover
- Identify content gaps (high demand, low supply)
- Maintains competitor list in `competitors.md`

### 4. `/qualify-audience`
Qualify engagers on OWN posts as warm leads.
- Apify scrapes all likers + commenters on own post
- Qualifies by ICP (headline, company, role)
- Decision makers (score >= 7) → AERCHITECT.md as warm leads
- Email enrichment via Prospeo
- Optional: queue connection request

**Key difference**: `/lead-borrow` = other people's post audiences. `/qualify-audience` = your own post audience.

---

## 2 Skill Upgrades Requested

### 5. `/lead-borrow` — Step 2-3 from Playwright → Apify
Comment scraping moves to Apify. Connection requests stay on own instance.

### 6. `/signal-monitor` — Apify for LinkedIn signals
Daily signal tracking (funding, job postings, ICP posts) using Apify instead of own session.

---

## Implementation Priority (user's suggested order)
1. Set up Apify MCP in `.mcp.json`
2. Build `/daily-icp-feed`
3. Upgrade `lead-borrow.md` to Apify
4. Build `/qualify-audience`
5. Build `/content-reflect`
6. Build `/content-compare`
7. Build `/signal-monitor`

---

## Assessment: What Can Already Be Done

| Skill | Possible with existing setup? | Gap |
|-------|------------------------------|-----|
| `/daily-icp-feed` | MOSTLY — Tavily finds posts, agent drafts comments. Missing: engagement metrics for ranking | Apify gives engagement data |
| `/content-reflect` | PARTIAL — DOM reading own activity page works. Can't get impressions (hidden in analytics) | Apify gives full metrics |
| `/content-compare` | PARTIAL — Tavily finds competitor posts. Doing 10 competitors at scale risks session | Apify makes it invisible |
| `/qualify-audience` | YES for commenters — DOM extraction works (proved 2026-03-15, 26 commenters in 2 JS calls). LIMITED for likers (modal lazy-loads 10 at a time) | Apify gets all likers |
| `/lead-borrow` upgrade | Working today via DOM. Safe at 10 connects/session. Risky at 100+/day | Apify removes risk at scale |
| `/signal-monitor` | YES for funding/jobs via Tavily. NO for LinkedIn-specific real-time signals | Apify needed for LinkedIn signals |

## Actionable Next Steps for Repo
1. Add Apify MCP config to `.mcp.json` (requires user's Apify API key)
2. Write skill files for the 4 new skills in `skills/` directory
3. Update `lead-borrow.md` with Apify for Step 2-3
4. Add `competitors.md` template
5. Update README with new skill descriptions
