---
name: lead-borrow
description: User wants to find qualified leads from an influencer's LinkedIn post (commenters + likers) and send connection requests
---

# /lead-borrow — Borrow Leads from Influencer Posts

## When to use
User wants to find qualified leads from an influencer's LinkedIn post (commenters + likers) and send connection requests with personalized notes.

## Setup Wizard (First Run)

On first invocation, check `MEMORY.md` for `SETUP_LEAD_BORROW_COMPLETE: true`. If missing, run these checks:

### S1 — Verify Apify MCP
```
Test: Call Apify MCP to scrape a public LinkedIn post URL
Pass: Returns post data (comments, reactions)
Fail: "Add Apify MCP to .mcp.json → see docs/apify-strategy.md for config"
Fallback: If no Apify, agent CAN use DOM extraction via claude-in-chrome (works for <50 comments, risky at scale)
```

### S2 — Verify Chrome Extension
```
Test: Call mcp__claude-in-chrome__tabs_context_mcp
Pass: Returns tab list
Fail: "Open Chrome with Claude extension active"
Note: Required for WRITE operations (connection requests)
```

### S3 — Verify LinkedIn Session
```
Test: Navigate to linkedin.com/feed — check if logged in
Pass: Feed loads with profile visible
Fail: "Log into LinkedIn in Chrome first"
```

### S4 — Create Template Files
```
Create if missing:
  memory/lb_pipeline.md (pipeline queue template)
  memory/lb_conversations.md (opener + follow-up template)
Write SETUP_LEAD_BORROW_COMPLETE: true to MEMORY.md
```

---

## Instructions

### Step 1: Get Target Post
Ask user ONE question:
> "Which LinkedIn post? Give me the URL or the person's name + topic."

If URL given → use directly.
If name + topic → search their activity page to find the post.

### Step 2: Extract Engagers (READ — Apify preferred, DOM fallback)

**With Apify (safe, scalable)**:
```
Apify scrape post URL → returns all commenters + likers with:
  - Name, headline, company, profile URL
  - Comment text (for commenters)
  - Connection degree
Save raw data to memory/lb_raw_people.md
```

**Without Apify (DOM fallback — use for <50 comments)**:
```
Navigate to post via chrome automation
JS extract from .comments-comments-list:
  - article elements → name, headline, profile slug, comment text
JS click reactions count → modal opens:
  - li elements → name, headline (modal lazy-loads ~10 at a time, scroll to load more)
Save raw data to memory/lb_raw_people.md
```

**DOM extraction JS pattern (proven 2026-03-15)**:
```javascript
// Comments
const articles = document.querySelector('.comments-comments-list').querySelectorAll('article');
articles.forEach(art => {
  // Get slug from /in/ link
  // Get name from first text before •
  // Get headline from text between connection degree and timestamp
});

// Reactions modal
// Click reactions count span → modal opens
// querySelectorAll('[role="dialog"] li') → name + headline
// Modal lazy-loads — scroll 10 times with 500ms gaps to load all
```

### Step 3: Qualify (ICP Filter)

Run Identifier + Qualifier as two sub-steps:

**Identifier**: Read raw data → extract every person with: name, headline, company, source (comment/like), comment text

**Qualifier**: Apply ICP filter:
```
✅ KEEP:
  - VP Sales / Head of Sales / CRO / Director Sales / Sales Manager
  - VP Revenue / Head of BD / VP Growth
  - CEO / Founder / COO of product or service company (NOT AI/GTM tools)
  - Anyone whose comment shows they struggle with or evaluate outbound/AI for sales

❌ SKIP:
  - Works at: outbound tools, GTM agencies, AI agent companies, cold email platforms
  - SDR coaches, sales trainers, content creators, recruiters
  - Generic "Great post!" commenters (no substance)
  - Post author
```

Write qualified leads to `memory/lb_pipeline.md`:
```
| # | Name | Slug | Headline | Company | Source | Comment Text | Status |
```

### Step 4: Send Connection Requests (WRITE — Own Instance)

**For COMMENTERS:**
```
[Name] — saw your comment on [Author]'s [topic] post. Built a free open-source Claude Outbound OS that handles the full prospecting function. Think you'd find it relevant: github.com/Abhipaddy8/outreach-agent
```

**For LIKERS:**
```
[Name] — noticed you engaged with [Author]'s [topic] post. Built a free open-source outbound agent that handles prospecting end-to-end. Thought you'd find it useful: github.com/Abhipaddy8/outreach-agent
```

**Flow per lead:**
1. Navigate to linkedin.com/in/[slug]
2. Wait 3-5 seconds
3. Find Connect button (or More → Connect)
4. Click → Add a note
5. Type personalized note (use React textarea setter if needed)
6. Send
7. Update pipeline: Status = sent + timestamp

**Rate limit**: Max 10 per session. 3-5 second gaps.

### Step 5: Write Conversation Openers + Follow-ups

For each sent invite, write:

**Opener** (send when they accept, 2-3 sentences):
```
Hey [Name] — thanks for connecting. Curious — [genuine question about their role/comment]. Been deep in building the tooling side of this.
```

**Follow-up** (if no reply after 3 days):
```
No worries if you're heads down — just wanted to flag the repo in case it's useful: github.com/Abhipaddy8/outreach-agent. Happy to walk through it.
```

Save to `memory/lb_conversations.md`:
```
| # | Name | Opener | Follow-up (3 days) | Status |
```

### Step 6: Update Tracker
- Update AERCHITECT.md with new contacts
- Update MEMORY.md with follow-up dates
- Log session to lb_pipeline.md

---

## Pipeline Mode (Advanced)

When qualifier produces leads, stages 3-5 can run as an assembly line:
- As soon as one lead is qualified → Tavily finds URL → Connector sends invite → Copy writes opener
- No waiting for full batch. First come, first served.

---

## MCP Tools Used
- Apify MCP (READ — comment/liker scraping) OR claude-in-chrome (DOM fallback)
- claude-in-chrome (WRITE — connection requests)
- Tavily (find LinkedIn URLs if slugs missing)
- Prospeo (optional — email enrichment for qualified leads)
