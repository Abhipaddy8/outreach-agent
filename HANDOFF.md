# HANDOFF — Web → Terminal CLI

**Date:** 2026-04-27
**From:** Claude Code (web session) in `/home/user/outreach-agent`
**To:** Claude Code (terminal CLI) on Windows, project folder `C:\Users\cleve\OneDrive\Desktop\Outreach System V1+V2`
**Branch:** `claude/review-linkedin-outreach-dgIul`

> **First action for the new session:** read this file, then read `CLAUDE.md`, `MEMORY.md`, and `.ai-guide/missions.md`. Then continue from "Next steps" at the bottom.

---

## 1. Context — what we evaluated

User asked whether **Gojiberry.ai's LinkedIn MCP** (https://gojiberry.ai/how-to-do-outreach-claude-linkedin-mcp) was a useful addition to this repo or a competitor.

**Conclusion:** ~90% overlap with what's already in this repo. Gojiberry is a competing managed SaaS, not a complement. Don't subscribe.

| Gojiberry feature | Already covered by |
|---|---|
| Buying signals | `/signal-monitor` + `config/signal-criteria.md` |
| ICP scoring | `/qualify-audience` + `config/icp-scoring.md` |
| Lead enrichment | `skills/outreach.md` (Prospeo + Instantly) |
| Personalized DMs | `skills/lead-borrow.md`, `skills/linkedin-connect.md` |
| Auto connect/follow-up | `/linkedin-connect` via claude-in-chrome |
| List building from prompt | `/outreach`, `/lead-borrow`, `/daily-icp-feed` |

**Real gaps in this repo vs Gojiberry:**
1. No always-on signal scanning (we run on cron/session-fire, not 24/7 server)
2. No CRM push (HubSpot/Pipedrive)
3. Multiple MCPs vs one bundled endpoint
4. No UI dashboard

---

## 2. Decisions made this session

### Decision 1 — Build an inbox-watcher + auto-reply skill ✅
This is the highest-ROI gap. Closes the "keep conversing until booked" loop that Gojiberry has and we don't.

### Decision 2 — Use TidyCal for booking ✅
User has TidyCal API access. Cleaner than Cal.com/Calendly for this stack. Will add as a thin REST skill (`skills/tidycal.md`), no MCP needed.

### Decision 3 — Skip Octoparse and PhantomBuster ✅
Apify (already in `.mcp.json`) covers both. Adding either would fragment the scraping stack. If headless-LinkedIn-without-Chrome-session ever becomes a real bottleneck, revisit Bright Data — not Octoparse.

### Decision 4 — Tools to add later (priority order)
1. **Calendly/TidyCal** — booking link injection (in progress)
2. **Cron-on-cloud** (Modal / Railway / GitHub Actions) — so signal scanning fires when laptop is closed
3. **Twilio/WhatsApp** — SMS follow-up after email cold
4. **Smartlead/Lemlist** — multi-inbox warmup (only if Gmail single-inbox volume caps us)
5. **Whisper + meetings MCP** — call transcription → MEMORY.md
6. **Perplexity MCP** — better company research with citations

---

## 3. Auto-reply skill — full design (not yet built)

**File to create:** `skills/auto-reply.md`
**Trigger:** cron every 15 min via `/agent-teams`
**State storage:** `memory/conversations/<lead-slug>.md` (one file per lead)
**Approval queue:** `memory/reply_queue.md`

### Flow
1. **Watch** — Gmail MCP `list_messages`, filter to threads where we sent first email (cross-ref `AERCHITECT.md`). Phase 2: LinkedIn DMs via claude-in-chrome.
2. **Classify reply intent** — positive / objection / OOO / unsubscribe / question / not-interested.
3. **Load context** — conversation file + `MEMORY.md` (offer, objection handlers).
4. **Draft + gate**:
   - **Auto-send** for low-risk replies: OOO acknowledgment, scheduling reply with TidyCal link, polite "noted, will follow up Q3"
   - **Queue for approval** for anything substantive — written to `memory/reply_queue.md`, user runs `/approve <id>` to send
5. **Booking trigger** — when intent ≥ "interested in chat", inject TidyCal link, mark thread `awaiting_booking`. Poll TidyCal API every 15 min for confirmation → mark `booked` → stop replying.
6. **Stop conditions** — booked, unsubscribed, 5 turns without progress, or explicit "not interested".

### Open questions for user (must answer before coding)
- **Auto-send threshold:** queue-everything-first-2-weeks, or trust auto-send from day one for low-risk classes? *(Recommendation: queue-first.)*
- **LinkedIn DM watcher:** include from day one, or email-only first? *(Recommendation: email-only first; LinkedIn DM polling needs Chrome session running, more fragile.)*
- **TidyCal API token:** where to store? `.env` file in repo root (matches Apify pattern from CLAUDE.md Mission S6B), or in `skills/tidycal.md` (matches Prospeo pattern)? *(Recommendation: `.env` — secrets out of skill files.)*

---

## 4. TidyCal integration — design

**File to create:** `skills/tidycal.md`
**Auth:** `TIDYCAL_API_TOKEN` in `.env` (user to paste)

### Endpoints to wrap
- `GET https://api.tidycal.com/v1/bookings` — poll for new bookings → triggers `booked` state in conversation file
- `GET https://api.tidycal.com/v1/booking-types/{id}` — fetch booking link to inject into outgoing replies
- `GET https://api.tidycal.com/v1/booking-types` — list available booking types (run once, cache user's chosen type ID in `MEMORY.md`)

### Polling vs webhook
Start with polling (15 min cadence inside auto-reply cron). Webhook is nicer but needs a public endpoint — defer until we have cloud cron running.

---

## 5. Files to create when work resumes

```
skills/auto-reply.md          # the orchestrator skill
skills/tidycal.md             # thin TidyCal REST wrapper
memory/conversations/         # directory; one .md per lead
memory/reply_queue.md         # approval queue template
.env                          # add TIDYCAL_API_TOKEN here (gitignored)
```

Also update:
- `CLAUDE.md` — add `/auto-reply` row to SKILLS table
- `CLAUDE.md` — add Mission S8 (TidyCal connection test) to Setup Wizard
- `.gitignore` — confirm `.env` is ignored

---

## 6. Repo state at handoff

- **Branch:** `claude/review-linkedin-outreach-dgIul`
- **Working tree:** clean before this commit
- **MCPs configured (`.mcp.json`):** gmail, tavily, instantly-neverbounce, apollo, apify
- **MCPs to add later:** none yet — TidyCal is REST-only, no MCP planned

---

## 7. Next steps for the new CLI session

1. `cd "C:\Users\cleve\OneDrive\Desktop\Outreach System V1+V2"` (or wherever you cloned this repo locally)
2. `git pull origin claude/review-linkedin-outreach-dgIul`
3. `claude` (start CLI)
4. `/add-dir` any other folder you want accessible (the web session couldn't do this)
5. Read this file, `CLAUDE.md`, `MEMORY.md`, `.ai-guide/missions.md`
6. **Ask user the 3 open questions in section 3** ("Open questions for user")
7. Once answered, build `skills/tidycal.md` first (smaller, dependency-free), then `skills/auto-reply.md` on top of it
8. Test both: send a test email to user's own inbox, reply to it, watch the cron pick it up and queue a draft
9. Commit each skill as a separate commit on this branch

---

## 8. Things explicitly NOT decided / not to do

- **Don't subscribe to Gojiberry** — overlapping SaaS.
- **Don't add Octoparse or PhantomBuster** — Apify covers it.
- **Don't build the UI dashboard yet** — markdown files are sufficient for solo operator. Revisit if multiple users.
- **Don't auto-send replies in week 1** — queue-for-approval until trust is built (pending user confirmation).
- **Don't add LinkedIn DM watching in v1** — email only, LinkedIn comes after email loop is stable.
