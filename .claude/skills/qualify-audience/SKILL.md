---
name: qualify-audience
description: User wants to find warm leads from people who engaged with their OWN LinkedIn posts. Different from /lead-borrow (which 
---

# /qualify-audience — Qualify Engagers on Own Posts

## When to use
User wants to find warm leads from people who engaged with their OWN LinkedIn posts. Different from /lead-borrow (which scrapes OTHER people's posts).

## Setup Wizard (First Run)

Check `MEMORY.md` for `SETUP_QUALIFY_AUDIENCE_COMPLETE: true`. If missing:

### S1 — Verify Data Source
```
Test Apify: Scrape a LinkedIn post URL for likers + commenters
  Pass: Returns full list with names, headlines, profile URLs
  Fail: Fall back to DOM extraction

Test DOM fallback: Navigate to own post → extract comments + reactions modal
  Pass: Comments extracted, reactions modal opens
  Fail: "Cannot access LinkedIn — log in first"
```

### S2 — Define ICP Scoring
```
Ask user: "Describe your ideal customer — what titles, company types, and signals matter?"
Write to config/icp-scoring.md:

# ICP Scoring Criteria
Score 7+ = qualified warm lead → add to AERCHITECT.md

| Signal | Points | Example |
|--------|--------|---------|
| Title: VP/Director/Head of Sales | +3 | VP Sales, Head of BD |
| Title: CEO/Founder (product co) | +3 | CEO of SaaS company |
| Title: CRO | +4 | Chief Revenue Officer |
| Company: product/service (not GTM tool) | +2 | Fintech, healthtech, logistics |
| Comment shows pain with outbound | +2 | "struggling with pipeline" |
| Company size 10-500 | +1 | Mid-market |
| Works at GTM/outbound/AI agent tool | -10 | Competing tool — hard exclude |
| SDR coach/trainer/influencer | -5 | Not a buyer |
| Generic comment ("Great post!") | -1 | No signal |
```

### S3 — Verify Prospeo (optional — email enrichment)
```
Test: POST to https://api.prospeo.io/enrich-person with a test LinkedIn URL
  Pass: Returns email
  Fail: "Prospeo API key missing or invalid — email enrichment will be skipped"
  Note: Optional — skill works without it (just won't have emails)
```

### S4 — Create Output Files
```
Create if missing: memory/audience-qualified.md
Write SETUP_QUALIFY_AUDIENCE_COMPLETE: true to MEMORY.md
```

---

## Instructions

### Step 1: Get Post URL
Ask user: "Which of your posts? Give me the URL."

### Step 2: Extract All Engagers (READ — Apify preferred, DOM fallback)

**With Apify:**
```
Apify scrape post URL → returns:
  Commenters: name, headline, profile URL, comment text
  Likers: name, headline, profile URL
  All of them — no lazy-loading limits
```

**With DOM fallback (proven 2026-03-15):**
```
Comments:
  JS: document.querySelector('.comments-comments-list').querySelectorAll('article')
  → Extract name, headline, slug, comment text per article
  → Click "Load more comments" buttons until all loaded
  Works well — got 26 commenters in 2 JS calls

Likers:
  JS: Click reactions count span → modal opens
  JS: Scroll modal 10 times with 500ms gaps to lazy-load
  JS: querySelectorAll('[role="dialog"] li') → name, headline
  Limitation: modal lazy-loads ~10 at a time, may not get all
```

Save raw list to `memory/audience-raw.md`.

### Step 3: Score + Qualify

Read `config/icp-scoring.md` for criteria.
Score each person. Segment:

```
Score 7+  → QUALIFIED — warm lead, add to pipeline
Score 3-6 → MAYBE — review manually
Score <3  → SKIP — not ICP
```

### Step 4: Enrich Qualified Leads (Optional)

For each qualified lead (score 7+):
```
Prospeo /enrich-person with LinkedIn URL
  → If email found: add to AERCHITECT.md with email
  → If unavailable: still add to AERCHITECT.md, mark email pending
```

### Step 5: Route to Pipeline

For qualified leads, offer user two paths:
```
Path A — Connection Request:
  Queue via /lead-borrow Step 4 (own instance)
  Note template: "[Name] — loved your [comment/reaction] on my [topic] post. Wanted to connect directly."

Path B — Email:
  If Prospeo found email → draft personalized email
  Use outreach.md pipeline (Instantly verify → Gmail send)
```

### Step 6: Save Results

Write to `memory/audience-qualified.md`:
```
# Audience Qualification — [post URL]
Date: [date]
Total engagers: [count]
Qualified (7+): [count]
Maybe (3-6): [count]
Skipped (<3): [count]

## Qualified Leads
| # | Name | Headline | Company | Score | Source | Email | Status |
```

Update AERCHITECT.md with qualified leads.

---

## Key Difference from /lead-borrow
- `/lead-borrow` = scrape SOMEONE ELSE's post → their audience → cold outreach
- `/qualify-audience` = scrape YOUR OWN post → your audience → warm outreach (they already engaged with you)

Warm leads convert 3-5x higher. Prioritize this over lead-borrow when you have posts with 50+ engagers.

---

## MCP Tools Used
- Apify MCP (READ — full engager list) OR claude-in-chrome (DOM fallback)
- Prospeo API (optional — email enrichment)
- Instantly (optional — email verification)
- Gmail MCP (optional — if routing to email)
- claude-in-chrome (WRITE — connection requests if Path A chosen)
