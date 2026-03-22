---
name: 48hr-outreach
description: Full outreach pipeline for 48-Hour Productivity Challenge — brainstorm, source leads, verify, send, track
---

# /outreach-48hr — 48-Hour Challenge Outreach Pipeline

## Overview
Automated daily outreach pipeline for the 48-Hour Productivity Challenge offer. Sources VP/Director-level leads at $20M-$100M US companies, verifies emails, sends personalized cold emails, and manages follow-ups.

## The Offer
"Give us 3 people from any department — your strongest, average, weakest. 48 hours. We'll double their output. No charge."

## Target Profile
- **Title**: VP or Director of Marketing, HR, Ops, Finance, Customer Success
- **Company size**: 100-500 employees
- **Revenue**: $20M-$100M
- **Location**: United States
- **NOT**: Tech/AI companies (they already know this stuff)
- **Industries**: Healthcare, Manufacturing, Professional Services, Financial Services, Retail, Education, Real Estate, Insurance, Logistics

## Pipeline Phases

### PHASE 0 — Daily Brainstorm (run before each batch)
1. Read `/Users/equipp/Daily Outreach/48HR_CHALLENGE_TRACKER.md`
2. Analyze: what subjects got replies? Which industries? What titles?
3. Tavily search: latest cold email tactics, AI productivity stats, industry-specific hooks
4. Pick today's angle: subject line variant, industry focus, pain point emphasis
5. Log hypothesis in tracker under today's date

### PHASE 1 — Lead Sourcing (20 leads per batch)
1. **Tavily search** for companies matching target profile:
   - `"VP Marketing" OR "Director of Operations" site:linkedin.com [industry] [city]`
   - `"$20M revenue" OR "100 employees" [industry] company`
   - Vary search terms each batch to avoid overlap
2. **Find decision maker**: Tavily search for name + title at each company
3. **Get company domain**: Extract from company website
4. **Email permutations** (try all 6):
   - first@domain.com
   - first.last@domain.com
   - flast@domain.com
   - f.last@domain.com
   - firstlast@domain.com
   - first.l@domain.com
5. **Verify via Instantly**:
   - `INSTANTLY_VERIFY_EMAIL` for each permutation
   - `INSTANTLY_CHECK_EMAIL_VERIFICATION_STATUS` to get result
   - Use first valid email found
   - If 4+ permutations fail → drop lead, move on
6. **Add to tracker** with all details

### PHASE 2 — Send Emails
1. **New contacts**: Send Email 1 (Day 0 template from tracker)
2. **Personalize**: Replace {{first_name}}, {{title}}, {{department}} with actual values
3. **Send via Gmail MCP**: `GMAIL_SEND_EMAIL` from abhipaddy8@gmail.com
4. **Update tracker**: Mark Email 1 sent date, set Email 2 due date (+3 days)

### PHASE 3 — Follow-ups
1. Check tracker for due follow-ups (Email 2 at Day 3, Email 3 at Day 7, Email 4 at Day 14)
2. Send appropriate follow-up template
3. Update tracker with sent date and next due date
4. If reply received → move to Replies section, stop sequence

### PHASE 4 — Daily Summary
1. Update tracker totals: contacts, emails sent today, follow-ups sent, replies
2. Update "What's Working" section with any patterns
3. Log what was tried today and results

## Email Rules (CRITICAL)
- Under 80 words per email
- 2-4 word subject lines
- No links in Email 1
- Interest-based CTA ("Curious?" "Worth a conversation?")
- Text opt-out in Email 4 only
- Deck sent ONLY after they reply (never in cold email)
- Always sign: `Abhishek Padmanabhan / AI Systems Engineer`
- Wednesday peak send day, Tuesday close second
- Send from: abhipaddy8@gmail.com

## Batch Schedule (IST → ET mapping)
- **Batch 1**: 6:30pm IST → 8:00am ET (US morning inbox)
- **Batch 2**: 9:15pm IST → 11:00am ET (US mid-morning + follow-ups)
- **Batch 3**: 11:45pm IST → 2:00pm ET (US afternoon + daily summary)

## Key Files
- **Tracker**: `/Users/equipp/Daily Outreach/48HR_CHALLENGE_TRACKER.md`
- **Deck PDF**: `/Users/equipp/Daily Outreach/48hr_challenge_deck.pdf`
- **Deck HTML**: `/Users/equipp/Daily Outreach/48hr_challenge_deck.html`
- **Memory**: `/Users/equipp/.claude/projects/-Users-equipp/memory/MEMORY.md`

## Status Query
When user asks "what's the outreach status?" or "how's the pipeline?":
1. Read tracker
2. Summarize: total sent, replies, follow-ups pending, meetings booked
3. Show today's hypothesis and what's working
4. List any replies or conversations

## Error Handling
- If Instantly verification is down → skip verification, note in tracker
- If Gmail MCP fails → log error, retry once, then skip
- If Tavily returns no results → broaden search terms
- If all 6 email permutations fail → drop lead, log in tracker
- Never send duplicate emails to same contact
