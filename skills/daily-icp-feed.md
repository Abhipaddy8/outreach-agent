# /daily-icp-feed — Daily ICP Post Monitor + Comment Drafts

## When to use
User wants a daily feed of top ICP-relevant LinkedIn posts with personalized comment drafts ready to post.

## Setup Wizard (First Run)

Check `MEMORY.md` for `SETUP_DAILY_ICP_FEED_COMPLETE: true`. If missing:

### S1 — Verify Apify MCP (preferred) or Tavily (fallback)
```
Test Apify: Scrape a LinkedIn search results page for recent posts
  Pass: Returns post data with engagement counts
  Fail: Check Tavily fallback

Test Tavily: Search "site:linkedin.com [ICP keyword] 2026"
  Pass: Returns LinkedIn post URLs
  Fail: "Neither Apify nor Tavily available — cannot run this skill"
```

### S2 — Define ICP Keywords
```
Ask user: "What keywords define your ICP's posts? (e.g. 'AI SDR', 'outbound automation', 'cold email')"
Write to config/icp-keywords.md:
  | # | Keyword | Platform | Priority |
  |---|---------|----------|----------|
  | 1 | AI SDR | LinkedIn | High |
  | 2 | outbound automation | LinkedIn | High |
  | 3 | cold email strategy | LinkedIn | Medium |
```

### S3 — Define Sender Context
```
Read MEMORY.md for sender name + offer
If missing: ask "What's your name and what do you offer? (for comment personalization)"
```

### S4 — Create Output Template
```
Create if missing: daily-feeds/ directory
Write SETUP_DAILY_ICP_FEED_COMPLETE: true to MEMORY.md
```

---

## Instructions

### Step 1: Find Top ICP Posts (READ — Apify preferred, Tavily fallback)

**With Apify:**
```
For each keyword in config/icp-keywords.md:
  Apify scrape LinkedIn search: "[keyword]" filter:last 24h
  Returns: post URL, author, headline, post text preview, likes, comments, shares
  Rank by engagement score: (comments × 3) + (likes × 1) + (shares × 2)
```

**With Tavily (fallback):**
```
For each keyword:
  tavily_search: "site:linkedin.com/posts [keyword] [today's date range]"
  Returns: URLs + snippets (no engagement data — rank by recency instead)
  tavily_extract on top 5 URLs for full post text
```

Merge all results → deduplicate by URL → sort by engagement score → take top 20.

### Step 2: Check Already Commented

Read `memory/comments-posted.md` (or create if missing).
Remove any post where we've already commented.

### Step 3: Draft Personalized Comments

For each of the remaining top 20 posts, draft a comment:

**Comment rules:**
- 2-4 sentences max
- First sentence: directly respond to their specific point (show you read it)
- Second sentence: add your own insight or experience
- Third sentence (optional): soft mention of what you've built, only if naturally relevant
- NO links in comments (kills engagement)
- NO "Great post!" energy
- Peer tone — you're a practitioner, not a fan

**Example:**
```
Post: "AI isn't going to replace SDRs"
Comment: "The augmentation angle is the one most teams miss. We're seeing the biggest wins when AI handles the research + enrichment layer and humans do the actual conversations. The 'AI SDR' framing is wrong — it's more like AI ops support for human sellers."
```

### Step 4: Save Daily Feed

Write to `daily-feeds/feed-[YYYY-MM-DD].md`:
```
# Daily ICP Feed — [date]
Generated: [timestamp]
Keywords searched: [list]
Posts found: [count] → Top 20 after dedup

## Post 1
Author: [name] | [headline]
URL: [linkedin post URL]
Engagement: [likes] likes, [comments] comments
Preview: [first 100 chars of post]
**Draft comment:**
> [personalized comment draft]
Status: [ ] Ready to post

## Post 2
...
```

### Step 5: User Approves + Posts

User reviews the feed, selects which comments to post.
For approved comments → use claude-in-chrome to navigate to post → type comment → post.
Log to `memory/comments-posted.md`: date | post URL | comment text | status.

---

## Cron Setup
```
caffeinate -i
claude /loop 1d /daily-icp-feed   # runs daily
```
Or via agent-teams: write as a daily mission with orchestrator prompt.

---

## MCP Tools Used
- Apify MCP (READ — LinkedIn post scraping + engagement data) OR Tavily (fallback)
- claude-in-chrome (WRITE — posting approved comments)
