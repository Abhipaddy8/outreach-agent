# /content-source — Daily AI News → LinkedIn Post Pipeline

## When To Use
- User says `/content-source`
- User says "find me something to post about"
- User says "what's trending in AI today"
- User wants a LinkedIn post based on a real story, not self-promotion
- Morning content sourcing routine

## What This Does
Scans AI news sources for stories worth reporting on LinkedIn. Finds the PERSON behind the story. Extracts the numbers. Drafts a "reporter-style" post where YOU are the curator, not the hero. Your product/repo is a soft P.S., never the main content.

## The Pipeline

### Step 1 — Scan Sources (Tavily Search)

Run these searches in parallel:

```
1. "Anthropic" OR "Claude" new feature OR case study OR workflow — last 7 days
2. "OpenAI" new launch OR update OR case study — last 7 days
3. GitHub trending repositories — AI OR agent OR automation
4. Hacker News front page — AI agent OR LLM OR automation
5. "AI" + "case study" OR "replaced" OR "automated" + startup OR company — last 7 days
6. Product Hunt — AI tool launch today
```

Also check (if browser available):
- twitter.com/AnthropicAI — latest tweets
- twitter.com/kaborsky — Karpathy's latest
- news.ycombinator.com — top 10

### Step 2 — Filter for Post-Worthy Stories

A story is post-worthy if it has ALL THREE:

1. **A named person** — not just "a company did X" but "Austin Lau at Anthropic did X." People connect with people, not logos.
2. **A relatable constraint** — "had zero technical background" / "was a solo founder" / "had no budget" / "was doing it manually." The reader must think "that's me."
3. **Specific numbers** — "2 hours → 15 minutes" / "41% above average" / "$0 spent" / "100 variations per batch." Vague = scroll past. Specific = stop.

If a story has 2 of 3, it's usable but weaker. If it has 1 of 3, skip it.

### Step 3 — Research the Person

For each post-worthy story:

1. Find the person's LinkedIn profile (Tavily search: "[name] [company] LinkedIn")
2. Extract: title, background, relatable detail ("non-technical" / "solo" / "first marketing hire")
3. Find the UNDERDOG angle — what makes them relatable, not impressive
4. Check if they've posted about it themselves — if yes, you can reference their post

### Step 4 — Extract the Workflows + Numbers

From the source (blog post, video, GitHub README, talk):

1. Identify 3-5 discrete workflows or steps
2. For each: what tool, what it does, what the before→after is
3. Find the aggregate results (overall impact numbers)
4. Note any tips or lessons the person shared

### Step 5 — Draft the Post

Use this exact template:

```
[Company] just [released/showed/published] how [person] uses [AI tool] for [domain].

[Person's first name] [relatable constraint].
But [they were responsible for / they achieved] [impressive scope].

[emoji] Here's the [N] workflows that [result]:

1) [Workflow name]
↳ [How it works]
↳ [How it works]
↳ [Before → After number]

2) [Workflow name]
↳ [How it works]
↳ [How it works]
↳ [Before → After number]

3) [Workflow name]
↳ [How it works]
↳ [How it works]

4) [Workflow name]
↳ [How it works]
↳ [Before → After number]

[emoji] The results:
- [Shocking number]
- [Shocking number]
- [Shocking number]

[emoji] [Person]'s top tips:
1️⃣ [Tip with one-line explanation]
2️⃣ [Tip with one-line explanation]
3️⃣ [Tip with one-line explanation]

Comment "[KEYWORD]" and I'll send you:
↳ [Specific deliverable 1]
↳ [Specific deliverable 2]
↳ [Specific deliverable 3]

P.S. I build AI outreach systems that do similar things for sales teams.
Open source: github.com/Abhipaddy8/outreach-agent
```

### Step 6 — Generate Image Brief

Use the clean infographic style (NOT dark terminal):

```
White/cream background (#FEFEFE)
Portrait orientation (1080x1350px)

TOP:
  "Abhishek Padmanabhan" small text left
  "— AI SYSTEMS ENGINEER —" small text right

TITLE (big, bold):
  "[AI Tool] for
   [domain]" (domain word in purple #7C3AED)

BODY — 4 numbered sections:
  Each section:
    - Number (01, 02, 03, 04)
    - Section title (bold)
    - Tool logo badge (small rounded pill)
    - 3 bullets with ↳ arrows

FOOTER:
  "abhishek padmanabhan" left
  "Build what used to take a team." right in purple italic

Style: Clean, minimal, lots of whitespace.
Like a Notion page meets Apple marketing.
NO: dark backgrounds, emojis, gradients, neon, cartoon.
```

### Step 7 — Present to User

Show:
1. The story source (link)
2. The person + their angle
3. The draft post
4. The image gen brief
5. Suggested CTA keyword

User reviews, edits, approves. Then post.

---

## Rules

1. **You are the REPORTER, not the hero.** The post is about the person/company you found. Your product is a P.S.
2. **Never fabricate numbers.** Every stat must come from the source. If the source doesn't have numbers, find a different story.
3. **Never post about your own tools as the main content.** That's chest-beating. Save it for the P.S.
4. **Speed matters.** First person to report a story on LinkedIn wins. Aim to post within 24 hours of the news breaking.
5. **One story per post.** Don't combine multiple stories. Each post is about ONE person doing ONE thing.
6. **The image must be standalone.** Someone should understand the entire post from the image alone, without reading the text.
7. **CTA must promise specific deliverables.** Not "comment for more info." List 3-4 things they'll get.

---

## Content Calendar Integration

When running daily via `/loop` or manually each morning:

1. Source 3-5 stories
2. Rank by: recency (last 48hrs wins) → person relatability → number specificity
3. Draft #1 pick
4. Save others to `memory/content_backlog.md` for future days
5. If nothing is post-worthy today, check the backlog

---

## Files

```
memory/content_backlog.md     — stories saved for future posts
memory/content_posted.md      — stories already posted (don't repeat)
content/post_image_template_clean.md — reusable image gen brief
```

---

## Example Run

```
User: /content-source

Agent: Scanning sources...

Found 3 post-worthy stories today:

1. 🔥 Shopify CEO used Karpathy's autoresearch overnight → 53% faster
   rendering from 93 automated commits
   Person: Tobi Lutke (CEO, Shopify) — non-AI person using AI for code
   Numbers: 53% improvement, 93 commits, overnight
   Source: Twitter + GitHub

2. ⚡ Apify open-sourced 8 agent skills for scraping 50+ platforms
   Person: Apify team (no single person — weaker angle)
   Numbers: 8 skills, 50+ platforms
   Source: GitHub trending

3. 📊 Solo founder used Claude to replace 3-person content team
   Person: [name from blog post]
   Numbers: 1 person = 3 people output, $15K/month saved
   Source: Indie Hackers

Recommendation: Story #1 is strongest (named CEO, shocking
number, overnight timeline, trending topic).

Draft post ready. Want to see it?
```
