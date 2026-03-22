# /apify — Apify Agent Skills Integration

## What This Is
Apify open-sourced 8 agent skills — markdown files that give AI agents instant access to scraping across 50+ platforms. This skill file maps each Apify skill to the outreach-agent pipeline and shows how to use them.

## When To Use
- User says /apify
- User needs leads from Google Maps, Instagram, TikTok, YouTube, Facebook
- User needs competitor intelligence (pricing, ads, content strategy)
- User needs brand monitoring (reviews, ratings, sentiment)
- User needs e-commerce data (pricing across Amazon, Walmart, etc.)
- User wants to find influencers
- User needs trend data
- Any research task that goes beyond what Tavily web search can do

## Setup
```
# Install Apify CLI
npm install -g apify-cli

# Set API token
export APIFY_TOKEN=your_token_here

# Or add to .env in outreach-agent root
echo "APIFY_TOKEN=your_token_here" >> .env
```

Get your free API token at: https://console.apify.com/account/integrations

## The 8 Skills

### 1. Lead Generation (`apify-lead-generation`)
**What it does**: Scrape B2B/B2C leads from Google Maps, websites, Instagram, TikTok, Facebook, LinkedIn, YouTube, Google Search
**How outreach-agent uses it**: Supercharges the /outreach research phase. Instead of just Tavily web search, pull actual business listings with phone, email, website, reviews.
**Best for**: Local business leads, restaurant/retail/service business prospecting, geographic targeting
**Use cases**:
- "Find 50 digital marketing agencies in Austin, TX from Google Maps"
- "Get all SaaS companies that posted on Instagram about AI this week"
- "Scrape LinkedIn company pages for Series A startups in healthcare"

**Apify Actors to use**:
- `apify/google-maps-scraper` — businesses by location + category
- `apify/instagram-scraper` — profiles, posts, hashtags
- `apify/google-search-scraper` — SERP results with snippets

### 2. Competitor Intelligence (`apify-competitor-intelligence`)
**What it does**: Analyze competitor strategies, content, pricing, ads, market positioning across Google Maps, Booking, Facebook, Instagram, YouTube, TikTok
**How outreach-agent uses it**: Powers /content-compare with real data instead of manual browsing. Get actual post engagement numbers, ad copy, pricing pages.
**Best for**: Understanding what competitors are doing on social, what ads they're running, how they price
**Use cases**:
- "Analyze the last 50 LinkedIn posts from [competitor] — what's getting engagement?"
- "Scrape [competitor]'s pricing page and compare to ours"
- "Find all Facebook ads [competitor] is running right now"

### 3. Brand Reputation Monitoring (`apify-brand-reputation-monitoring`)
**What it does**: Track reviews, ratings, sentiment, brand mentions across Google Maps, Booking, TripAdvisor, Facebook, Instagram, YouTube, TikTok
**How outreach-agent uses it**: Feed into /signal-monitor — companies with declining reviews = opportunity for your services
**Best for**: Finding companies with pain (bad reviews = they need help)
**Use cases**:
- "Monitor mentions of [brand] across all social platforms"
- "Find companies with Google Maps ratings dropping below 4.0 in [industry]"
- "Track sentiment on [competitor]'s latest product launch"

### 4. E-commerce Intelligence (`apify-ecommerce`)
**What it does**: Scrape pricing, reviews, product data from Amazon, Walmart, eBay, IKEA, 50+ marketplaces
**How outreach-agent uses it**: For clients selling to e-commerce companies — find businesses by their product categories, pricing strategies, review volume
**Best for**: E-commerce client prospecting, market research, competitive pricing
**Use cases**:
- "Find all sellers in [category] on Amazon with 100-1000 reviews"
- "Track price changes for [product type] across Walmart and Amazon"
- "Find e-commerce brands with poor customer reviews — they need our help"

### 5. Influencer Discovery (`apify-influencer-discovery`)
**What it does**: Find and evaluate influencers, verify authenticity, track performance across Instagram, Facebook, YouTube, TikTok
**How outreach-agent uses it**: Powers /lead-borrow with real influencer data. Find who has your ICP as followers, then borrow their audience.
**Best for**: Finding micro-influencers your ICP follows, verifying engagement is real
**Use cases**:
- "Find 20 micro-influencers in the sales/GTM space with 5K-50K followers"
- "Verify if [influencer]'s engagement is real or bot-inflated"
- "Find YouTube creators talking about outbound sales — their commenters are my ICP"

### 6. Content Analytics (`apify-content-analytics`)
**What it does**: Track engagement metrics, campaign ROI, content performance across Instagram, Facebook, YouTube, TikTok
**How outreach-agent uses it**: Powers /content-reflect with actual numbers. Get real engagement data on your own posts.
**Best for**: Measuring what's working in your content strategy
**Use cases**:
- "Get engagement metrics on my last 20 LinkedIn posts"
- "Compare my video performance vs [competitor]'s on YouTube"
- "Which hashtags are driving the most reach on Instagram?"

### 7. Trend Analysis (`apify-trend-analysis`)
**What it does**: Discover and track emerging trends across Google Trends, Instagram, Facebook, YouTube, TikTok
**How outreach-agent uses it**: Powers /daily-icp-feed with trend data. Find what's trending in your ICP's world before it goes mainstream.
**Best for**: Content ideas, timing your outreach around trending topics
**Use cases**:
- "What's trending in AI automation on TikTok this week?"
- "Google Trends for 'staff augmentation' — is demand going up or down?"
- "Find emerging hashtags in the SaaS space on Instagram"

### 8. Ultimate Scraper (`apify-ultimate-scraper`)
**What it does**: Universal AI-powered web scraper for ANY platform. The catch-all.
**How outreach-agent uses it**: When no specific skill fits — scrape any website, any platform.
**Best for**: Custom scraping jobs that don't fit the other 7 skills
**Use cases**:
- "Scrape all companies listed on [industry directory]"
- "Get all speakers from [conference website]"
- "Extract job postings from [company careers page]"

## How Each Apify Skill Maps to Existing Outreach Skills

| Apify Skill | Outreach Skill It Supercharges | How |
|-------------|-------------------------------|-----|
| Lead Generation | /outreach | More lead sources beyond Tavily |
| Competitor Intelligence | /content-compare | Real engagement data, not guesses |
| Brand Monitoring | /signal-monitor | Reputation drops = buying signals |
| E-commerce | /outreach (e-commerce clients) | Find sellers by category/reviews |
| Influencer Discovery | /lead-borrow | Find whose audience matches your ICP |
| Content Analytics | /content-reflect | Real metrics on your content |
| Trend Analysis | /daily-icp-feed | Trending topics = content ideas |
| Ultimate Scraper | All skills | Catch-all for custom research |

## API Pattern

All Apify skills use the same pattern:
```python
import requests

API_TOKEN = "your_apify_token"

# Start an Actor run
response = requests.post(
    f"https://api.apify.com/v2/acts/apify~google-maps-scraper/runs",
    headers={"Authorization": f"Bearer {API_TOKEN}"},
    json={
        "searchStringsArray": ["AI agency"],
        "locationQuery": "Austin, TX",
        "maxCrawledPlacesPerSearch": 50
    }
)
run_id = response.json()["data"]["id"]

# Get results
results = requests.get(
    f"https://api.apify.com/v2/actor-runs/{run_id}/dataset/items",
    headers={"Authorization": f"Bearer {API_TOKEN}"}
).json()
```

Or via Claude Code with MCP, just describe what you need and the agent will call the right Actor.

## Combining Skills (Power Moves)

### Lead Gen + Enrichment Pipeline
```
Apify Google Maps → 50 businesses in Austin
→ Extract owner names from websites
→ Prospeo enrich → verified emails
→ Gmail send personalized outreach
```

### Competitor Intel + Content Strategy
```
Apify scrape competitor's last 100 posts
→ /content-compare analysis
→ Generate 5 posts that fill gaps they're missing
→ Schedule via /content-reflect
```

### Signal Monitoring + Outreach
```
Apify brand monitoring → find companies with dropping ratings
→ /signal-monitor flags them as hot leads
→ /outreach sends "noticed your reviews mention [pain] — we fix that"
```

## Repo Reference
GitHub: https://github.com/apify/agent-skills
Each skill has its own SKILL.md file with detailed Actor IDs and parameters.
