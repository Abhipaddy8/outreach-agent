---
name: content-compare
description: User wants to analyze competitors' LinkedIn content to find gaps, patterns, and opportunities.
---

# /content-compare — Competitor Content Analysis

## When to use
User wants to analyze competitors' LinkedIn content to find gaps, patterns, and opportunities.

## Setup Wizard (First Run)

Check `MEMORY.md` for `SETUP_CONTENT_COMPARE_COMPLETE: true`. If missing:

### S1 — Verify Data Source
```
Test Apify: Scrape a public LinkedIn profile activity page
  Pass: Returns post data
  Fail: Fall back to Tavily + DOM

Test Tavily fallback: Search "site:linkedin.com/posts [competitor name]"
  Pass: Returns recent post URLs
  Fail: "Neither Apify nor Tavily returning LinkedIn post data"
```

### S2 — Create Competitor List
```
Ask user: "Who are your top 3-5 competitors? Give me their names or LinkedIn URLs."
Write to config/competitors.md:

# Competitors
| # | Name | LinkedIn URL | Platform | Niche | Notes |
|---|------|-------------|----------|-------|-------|
| 1 | [name] | linkedin.com/in/[slug] | LinkedIn | [niche] | |
```

### S3 — Create Analysis File
```
Create if missing: memory/competitor-analysis.md
Write SETUP_CONTENT_COMPARE_COMPLETE: true to MEMORY.md
```

---

## Instructions

### Step 1: Scrape Competitor Posts (READ — Apify preferred)

For each competitor in `config/competitors.md`:

**With Apify:**
```
Apify scrape: competitor's activity page
Returns: last 5 posts with text, engagement data, dates
```

**With Tavily + DOM fallback:**
```
Tavily search: "[competitor name] site:linkedin.com/posts"
Extract top 5 post URLs
For each URL: tavily_extract OR DOM read if navigating via chrome
```

### Step 2: Analyze Each Competitor

Per competitor, extract:
- **Content frequency**: posts/week
- **Top format**: text, image, video, carousel, article
- **Hook patterns**: first line of their top 3 posts (what style — question, stat, story, contrarian)
- **Topics covered**: list of themes (AI/sales/outbound/hiring/product/culture)
- **Engagement range**: avg likes, avg comments on last 5 posts
- **Audience signal**: who comments on their posts (titles/roles visible in comments)

### Step 3: Gap Analysis

Compare across all competitors:
```
Topics EVERYONE covers (oversaturated — hard to differentiate):
  - [list]

Topics SOME cover (opportunity — differentiate with your angle):
  - [list]

Topics NOBODY covers (blue ocean — first mover advantage):
  - [list]

Format gaps:
  - Everyone does X, nobody does Y
  - Opportunity: try Y format with [topic]
```

Cross-reference with own `memory/content-analysis.md` (if exists from /content-reflect):
- Where do YOUR top posts overlap with competitor strengths?
- Where are YOUR top posts in competitor blind spots? (double down here)

### Step 4: Write Analysis

Update `memory/competitor-analysis.md`:
```markdown
# Competitor Content Analysis
Last updated: [date]
Competitors analyzed: [count]

## Per-Competitor Breakdown

### [Competitor 1]
- Posts/week: [X]
- Top format: [X]
- Top hooks: "[hook 1]", "[hook 2]", "[hook 3]"
- Topics: [list]
- Avg engagement: [X] likes, [X] comments
- Audience: [who engages — titles/roles]
- Strength: [what they do well]
- Weakness: [what they miss]

### [Competitor 2]
...

## Cross-Competitor Patterns
- Oversaturated topics: [list]
- Opportunity topics: [list]
- Blue ocean: [list]
- Format gaps: [list]

## Recommendations
1. [specific content opportunity tied to gap analysis]
2. [specific content opportunity]
3. [specific content opportunity]
```

---

## MCP Tools Used
- Apify MCP (READ — competitor profile scraping) OR Tavily + DOM fallback
- No WRITE operations needed — analysis only
