# Memory — Outreach Agent

SETUP_COMPLETE: true

> Persistent across sessions. Agent reads this at startup. Update at end of every session.

---

## Sender Profile

- **Name**: Abhishek Padmanabhan
- **Email**: abhipaddy8@gmail.com
- **LinkedIn**: https://www.linkedin.com/in/abhishek-padmanabhan-03869556/
- **Portfolio URL**: [YOUR PORTFOLIO URL]
- **Offer**: I help businesses replace scaling SDR teams with a Claude Outbound OS

---

## What Works

- `first@domain` email pattern dominates at small startups (higher hit rate than `first.last@`)
- Interest-based CTA ("Worth a conversation?") outperforms hard CTAs ("Book a call")
- Signals-based targeting (funding + hiring signals) > spray-and-pray
- Pattern interrupt emails (lead with something unusual/valuable) beat standard intros

## What Doesn't Work

- Bare URLs in emails — always use `is_html=True` + `<a href="...">anchor text</a>`
- IT services / staffing firms — slow-moving, low-intent, location-dependent
- s3keys expire after ~4 days — re-fetch before each session if using PDF attachments

---

## Follow-Up Dates

| Date | Action | Who |
|------|--------|-----|

---

## Active Outreach Status

- **Total contacts**: 0
- **Last send**: —
- **Hot leads**: —

---

## Skills To Build (Backlog)

> Each skill should be packaged individually as its own file in `skills/` AND wired as a group slash command that chains them together.

---

### 1. `/linkedin-connect` — LinkedIn Connection Request Skill
- Use Claude in Chrome (already in outreach-agent folder — do NOT use screenshots, read DOM directly)
- Visit profile URL → click Connect → type personalised note → send
- Rate limit: 20/day, 45-90s gap between requests
- After sending: update AERCHITECT.md with status `🔗 Request Sent` + date
- Check back on a set date: did they accept? Update status to `✅ Connected` or `⏳ Pending`
- **Package as**: `skills/linkedin-connect.md` + `/linkedin-connect` slash command

### 2. `/linkedin-dm` — LinkedIn DM Skill
- Use Claude in Chrome
- Navigate to existing connection → click Message → type personalised DM → send
- Only runs AFTER connection accepted (reads AERCHITECT.md status = `✅ Connected`)
- Personalises DM based on: what they accepted from (email topic, post comment, connection note)
- Update tracker: `💬 DM Sent` + date
- **Package as**: `skills/linkedin-dm.md` + `/linkedin-dm` slash command

### 3. `/lead-borrow` — Lead Borrowing Skill (Comment Scraping Flow)

Full pipeline — chain of 5 sub-steps, each handoffs to the next:

**Step 1 — Find Influencer**
- Tavily search: top influencers posting about [target topic]
- Returns: name + LinkedIn profile URL + recent post URLs
- Filter: posts with high engagement (100+ comments preferred)

**Step 2 — Read DOM of Comments (NOT screenshots)**
- Claude in Chrome visits the post
- DOM extraction (skill already exists in outreach-agent) reads comment nodes directly
- Pulls per commenter: name, headline, LinkedIn URL, comment text
- Do NOT take all comments — qualify first

**Step 3 — Qualify in Batches of 10**
- Process 10 comments at a time
- Score each commenter: does their headline + comment signal they are a decision maker who has the problem you solve?
- Keep score ≥ 7/10. Drop the rest.
- Log qualified leads to a temp list with: name, headline, LinkedIn URL, comment text, post URL

**Step 4 — Multi-Channel Outreach**
- For each qualified lead:
  - Enrich email via Prospeo → send email referencing the post + their comment
  - Queue LinkedIn connection request (runs via `/linkedin-connect` at safe daily rate)
- Update AERCHITECT.md: source=`lead-borrow`, post URL, comment text, email sent date, LinkedIn request date

**Step 5 — Acceptance Tracking + Funnel Routing**
- On scheduled check-in date: read AERCHITECT.md, find all `🔗 Request Sent` from this batch
- Visit each LinkedIn profile via Chrome → check if connected
- If accepted → update to `✅ Connected` → trigger `/linkedin-dm` with context from their comment
- If not accepted after 14 days → mark `❌ Expired` → route to email-only follow-up
- If email replied → mark `🔥 Hot` → add to next funnel stage (agent asks user where to route them)

**Package as**: `skills/lead-borrow.md` + `/lead-borrow` slash command

---

### Group Slash Commands (Chain Skills Together)

| Command | What It Does |
|---------|-------------|
| `/lead-borrow` | Full flow: find influencer → DOM extract → qualify → email + LinkedIn connect |
| `/linkedin-connect` | Connection requests only, from AERCHITECT.md queue |
| `/linkedin-dm` | DMs to accepted connections, from AERCHITECT.md queue |
| `/follow-up` | Email follow-ups to all non-repliers past their due date |
| `/full-outreach` | Source → enrich → verify → email → queue LinkedIn → track (everything) |

---

### Implementation Notes

- **DOM reading over screenshots**: Claude in Chrome can read the DOM directly via `javascript_tool`. This is faster, more structured, and doesn't require vision model calls. Screenshots are fallback only (lazy-loaded content, infinite scroll that hasn't rendered yet).
- **Batch of 10 for qualification**: avoids hitting token limits on long comment threads. Process 10 → qualify → next 10. Keeps context clean.
- **AERCHITECT.md is the funnel**: every status transition is written back to the tracker. The funnel is implicit in the status column: `⏳ Email Sent` → `🔗 Request Sent` → `✅ Connected` → `💬 DM Sent` → `🔥 Hot` → `📅 Meeting Booked`
- **Skills live in `skills/` individually** so they can be used standalone OR chained. `/full-outreach` just calls them in sequence.

---

## Key Lessons Log

| Date | Lesson | Source |
|------|--------|--------|
| 2026-03-13 | Never paste bare URLs in emails. Use is_html=True + hyperlinked anchor text | Caught on Tetris batch |
| 2026-03-11 | first@ pattern dominates at small agencies | 100% hit rate vs first.last@ |
| 2026-03-06 | Always test-send 1 email before bulk send | PDF attachment silently failed on 66 sends |
