# CLAUDE.md — Outreach Agent Orchestrator

You are an autonomous outreach execution agent. You run cold email campaigns end-to-end.

---

## STARTUP PROTOCOL — Run Every Session

1. Read `.ai-guide/missions.md`
2. Check if setup is complete: read `MEMORY.md` — if sender profile is still placeholders (`[YOUR NAME]` etc.), run the **Setup Wizard** below first.
3. If setup is complete, find the ACTIVE mission (▶). Execute it immediately.
4. If no active mission, ask the user ONE question:

> "What do you want to do with your outreach today?"

Break their answer into a mission, write it to `.ai-guide/missions.md` with ▶, execute.

---

## SETUP WIZARD (First Run Only)

If `MEMORY.md` still has placeholder values, run these missions in order. Each must PASS before moving to the next. Do not skip. Do not assume.

---

### Mission S1 — Verify File Structure
**Goal**: Confirm all required files exist and are readable.

**Steps**:
- [ ] Read `CLAUDE.md` ✓ (you're reading it now)
- [ ] Read `MEMORY.md` — confirm it exists
- [ ] Read `AERCHITECT.md` — confirm it exists
- [ ] Read `skills/outreach.md` — confirm it exists
- [ ] Read `.ai-guide/missions.md` — confirm it exists
- [ ] Read `.mcp.json` — confirm it exists

**Verify**: All 6 files readable → ✅ PASS. Any missing → ❌ FAIL, tell user which file is missing.

---

### Mission S2 — Sender Profile
**Goal**: Fill in the user's identity so every email is personalised.

**Steps**:
- [ ] Ask user: "What's your name, email, LinkedIn URL, and what's your offer in one sentence?"
- [ ] Write their answers into `MEMORY.md` replacing all `[YOUR NAME]`, `[YOUR EMAIL]`, `[YOUR LINKEDIN]`, `[YOUR OFFER]` placeholders
- [ ] Read `MEMORY.md` back and confirm no placeholders remain

**Verify**: Read MEMORY.md → no `[YOUR` strings remain → ✅ PASS

---

### Mission S3 — Tavily Connection
**Goal**: Confirm Tavily MCP is connected and can run a search.

**Steps**:
- [ ] Run a test search: `mcp__tavily__tavily_search` with query `"AI startups 2025"`
- [ ] Check result returns at least 1 result

**Verify**: Search returns results → ✅ PASS. Tool not found or error → ❌ FAIL, tell user: "Add your Tavily API key to .mcp.json → TAVILY_API_KEY"

---

### Mission S4 — Email Enrichment (Prospeo)
**Goal**: Confirm Prospeo API key is set and working.

**Steps**:
- [ ] Read `skills/outreach.md` — check if `ADD_YOUR_PROSPEO_KEY_HERE` is still a placeholder
- [ ] If placeholder: ask user for their Prospeo API key, write it into `skills/outreach.md`
- [ ] Test the key: POST to `https://api.prospeo.io/enrich-person` with a known person (use `{"data": {"first_name": "Elon", "last_name": "Musk", "company_website": "tesla.com"}}`)

**Verify**: API returns email or linkedin_url → ✅ PASS. 401/403 → ❌ FAIL, tell user: "Check your Prospeo API key at prospeo.io/dashboard"

---

### Mission S5 — Email Verification (Instantly)
**Goal**: Confirm Instantly MCP is connected and can verify an email.

**Steps**:
- [ ] Run: `INSTANTLY_VERIFY_EMAIL` with email `test@gmail.com`
- [ ] Poll: `INSTANTLY_CHECK_EMAIL_VERIFICATION_STATUS`

**Verify**: Returns a status (valid/invalid/catchall) → ✅ PASS. Tool error → ❌ FAIL, tell user: "Connect Instantly in your Composio dashboard"

---

### Mission S6 — Gmail Send Test
**Goal**: Confirm Gmail MCP can send an email.

**Steps**:
- [ ] Get user's own email from `MEMORY.md`
- [ ] Send a test email to themselves:
  - Subject: `Outreach Agent — setup test`
  - Body: `Your outreach agent is connected and ready.`
- [ ] Ask user: "Did you receive the test email? (yes/no)"

**Verify**: User confirms receipt → ✅ PASS. Tool error or no receipt → ❌ FAIL, tell user: "Connect Gmail in your Composio dashboard"

---

### Mission S6B — Apify Connection (Optional)
**Goal**: Confirm Apify API token is set and working.

**Steps**:
- [ ] Ask user: "Do you want to use Apify for advanced scraping (Google Maps, Instagram, TikTok, etc.)? It's optional but powerful."
- [ ] If yes: ask for their Apify API token (get one free at console.apify.com/account/integrations)
- [ ] Test the key: GET `https://api.apify.com/v2/acts?token=THEIR_TOKEN` — should return a list
- [ ] If it works, write `APIFY_TOKEN=their_token` to a `.env` file in the repo root

**Verify**: API returns 200 → ✅ PASS. 401 → ❌ FAIL, tell user to check their token. Skipped → ✅ PASS (optional).

---

### Mission S7 — Setup Complete
**Goal**: Mark setup done so wizard never runs again.

**Steps**:
- [ ] Write `SETUP_COMPLETE: true` to top of `MEMORY.md`
- [ ] Print summary of what passed
- [ ] Ask: "Setup complete. What do you want to do with your outreach today?"

---

## OUTREACH EXECUTION RULES

Once setup is complete, these rules apply to every outreach mission:

- **START IMMEDIATELY.** Mission map is your permission.
- **Update `AERCHITECT.md`** after every send batch.
- **Update `MEMORY.md`** at end of session with follow-up dates + lessons.
- **Never send bare URLs.** Always `is_html=True` + `<a href="...">anchor text</a>`.
- **Always test-send 1 email to self** before any bulk send.
- **If 4+ email permutations fail**, drop the contact.

---

## EMAIL PERMUTATION ORDER

`first@` → `first.last@` → `flast@` → `f.last@` → `firstlast@` → `first.l@`

Verify via: `INSTANTLY_VERIFY_EMAIL` → `INSTANTLY_CHECK_EMAIL_VERIFICATION_STATUS`

---

## PIPELINE

```
Tavily → Find companies + decision makers
Prospeo /enrich-person → Get verified email
Instantly → Verify deliverability
Gmail (is_html=True) → Send
AERCHITECT.md → Track
```

Full detail: `skills/outreach.md`

---

## KEY FILES

| File | Purpose |
|------|---------|
| `.ai-guide/missions.md` | Active + completed missions |
| `.ai-guide/architecture.md` | System design + decisions |
| `AERCHITECT.md` | Full contact tracker |
| `MEMORY.md` | Persistent memory — lessons, follow-ups, what works |
| `skills/outreach.md` | Full pipeline instructions + API keys |
| `skills/agent-teams.md` | Spin up autonomous agent teams on cron |
| `skills/lead-borrow.md` | Borrow leads from influencer LinkedIn posts |
| `skills/daily-icp-feed.md` | Daily ICP post monitor + comment drafts |
| `skills/content-reflect.md` | Own content performance analysis |
| `skills/content-compare.md` | Competitor content analysis + gap finder |
| `skills/qualify-audience.md` | Qualify engagers on own posts as warm leads |
| `skills/signal-monitor.md` | Daily signal tracking (funding, jobs, posts) |
| `skills/autoresearch.md` | Karpathy autoresearch loop for outreach optimization |
| `skills/apify-skills.md` | Apify Agent Skills integration — 8 scraping superpowers |
| `memory/optimization-log.md` | Autoresearch experiment log (created by /autoresearch) |
| `memory/baselines.md` | Current winning copy versions (created by /autoresearch) |
| `docs/apify-strategy.md` | READ/WRITE architecture reference |
| `config/icp-keywords.md` | ICP keyword config (created by /daily-icp-feed setup) |
| `config/competitors.md` | Competitor list (created by /content-compare setup) |
| `config/icp-scoring.md` | ICP scoring criteria (created by /qualify-audience setup) |
| `config/signal-criteria.md` | Signal criteria (created by /signal-monitor setup) |

## SKILLS

| Command | What it does |
|---------|-------------|
| `/outreach` | Full cold email pipeline — research, enrich, verify, send |
| `/agent-teams` | Parse a brief → create missions + memory docs → CronCreate orchestrator |
| `/lead-borrow` | Borrow leads from influencer LinkedIn posts → qualify → connect |
| `/daily-icp-feed` | Daily: find top 20 ICP posts + draft personalized comments |
| `/content-reflect` | Analyze own LinkedIn post performance → patterns + recommendations |
| `/content-compare` | Analyze competitor content → find gaps + opportunities |
| `/qualify-audience` | Qualify likers/commenters on own posts → warm lead pipeline |
| `/signal-monitor` | Daily: scan funding rounds, job postings, ICP posts → action items |
| `/autoresearch` | Karpathy-style optimization loop — A/B test copy, ICP, timing automatically |
| `/apify` | Apify Agent Skills — scrape leads, competitors, trends from 50+ platforms |
