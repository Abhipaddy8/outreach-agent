---
name: content-reflect
description: User wants to analyze their own LinkedIn posts (later YouTube) to understand what's working, what's not, and what to pos
---

# /content-reflect — Own Content Performance Analysis

## When to use
User wants to analyze their own LinkedIn posts (later YouTube) to understand what's working, what's not, and what to post next.

## Setup Wizard (First Run)

Check `MEMORY.md` for `SETUP_CONTENT_REFLECT_COMPLETE: true`. If missing:

### S1 — Verify Data Source
```
Test Apify: Scrape user's own LinkedIn activity page
  Pass: Returns post list with engagement data
  Fail: Fall back to DOM extraction

Test DOM fallback: Navigate to linkedin.com/in/[user-slug]/recent-activity/all/
  Pass: Activity page loads, posts visible
  Fail: "Cannot access LinkedIn — log in first"
```

### S2 — Get User's LinkedIn Profile
```
Read MEMORY.md for LinkedIn URL
If missing: ask "What's your LinkedIn profile URL?"
Extract slug for activity page navigation
```

### S3 — Create Analysis File
```
Create if missing: memory/content-analysis.md (with header template)
Write SETUP_CONTENT_REFLECT_COMPLETE: true to MEMORY.md
```

---

## Instructions

### Step 1: Scrape Own Posts (READ — Apify preferred, DOM fallback)

**With Apify:**
```
Apify scrape: user's LinkedIn activity page
Returns per post: text preview, post date, likes, comments, shares, impressions (if available)
Pull last 10 posts minimum
```

**With DOM fallback:**
```
Navigate to linkedin.com/in/[slug]/recent-activity/all/
JS extract from each post in feed:
  - Post text (first 200 chars)
  - Reaction count (span with reaction count)
  - Comment count
  - Repost count
  - Post date
Scroll to load 10 posts, extract each
```

**DOM extraction pattern:**
```javascript
const posts = document.querySelectorAll('.profile-creator-shared-feed-update__container');
posts.forEach(post => {
  const text = post.querySelector('.feed-shared-update-v2__description')?.textContent;
  const reactions = post.querySelector('.social-details-social-counts__reactions-count')?.textContent;
  const comments = post.querySelector('.social-details-social-counts__comments')?.textContent;
});
```

### Step 2: Analyze Patterns

For each post, extract:

**Quantitative:**
- Engagement rate: (likes + comments × 3 + shares × 2) / estimated reach
- Comment-to-like ratio (high ratio = discussion driver, low = passive consumption)
- Best performing post (absolute engagement)

**Qualitative:**
- Hook analysis: what was the first line? (question, stat, contrarian take, story)
- Format: text-only vs image vs video vs carousel
- Length: short (<100 words) vs medium (100-300) vs long (300+)
- Topic category: build log, opinion, tool review, personal story, industry take
- Time of posting: morning/afternoon/evening, day of week
- CTA: open question, link, none

### Step 3: Pattern Recognition

Compare top 3 vs bottom 3 posts:
```
What do the winners have in common?
  - Hook type
  - Format
  - Length
  - Topic
  - Time posted

What do the losers have in common?
  - Same analysis
```

### Step 4: Write Analysis

Update `memory/content-analysis.md`:
```markdown
# Content Performance Analysis
Last updated: [date]
Posts analyzed: [count]
Period: [date range]

## Top 3 Posts
| # | Date | Hook (first line) | Format | Likes | Comments | Why it worked |
...

## Bottom 3 Posts
| # | Date | Hook (first line) | Format | Likes | Comments | Why it underperformed |
...

## Patterns
- Best hook type: [X]
- Best format: [X]
- Best length: [X]
- Best posting time: [X]
- Topic that resonates most: [X]

## Recommendations for Next 3 Posts
1. [specific recommendation tied to a pattern]
2. [specific recommendation]
3. [specific recommendation]
```

### Step 5: YouTube Extension (Future)

When YouTube channel is live, add:
```
Apify scrape own last 5 videos
  → CTR, watch time, retention curve
  → Title + thumbnail analysis
  → Hook analysis (first 30 seconds)
  → Save to memory/youtube-analysis.md
```

---

## MCP Tools Used
- Apify MCP (READ — scrape own activity page) OR claude-in-chrome (DOM fallback)
- No WRITE operations needed — analysis only
