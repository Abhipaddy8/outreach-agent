# Architecture — Outreach Agent

## What This System Does

End-to-end cold email outreach. Given a target (e.g. "20 AI CTOs at Series A startups"), it:
1. Finds the companies and decision makers (Tavily search)
2. Gets their verified email (Prospeo /enrich-person)
3. Verifies deliverability (Instantly)
4. Writes personalised copy and sends (Gmail MCP)
5. Tracks everything (AERCHITECT.md)

---

## MCP Tools Available

| Tool Namespace | Purpose |
|----------------|---------|
| `mcp__claude_ai_GMAIL__*` | Send emails, fetch threads, get attachments |
| `mcp__claude_ai_Apollo_MCP__*` | Search and enrich contacts |
| `mcp__claude_ai_NEVERBOUNCE_INSTANTLY__*` | Verify emails, manage sequences |
| `mcp__tavily__*` | Research companies, find decision makers |
| `mcp__claude_ai_SUPABASE_GEMINI__*` | Database queries if needed |

---

## Email Verification Rules

- **Valid**: Send
- **Catchall**: Send (domain accepts all, can't confirm individual)
- **Unknown**: Skip
- **Invalid**: Skip
- If 4+ permutations fail: drop contact entirely

---

## Targeting Principles

- **Signals-based only**: funding signal (Series A+) OR hiring signal (active job postings)
- **Company size**: 10–200 employees for best response rate
- **Title targets**: Founder, CEO, CTO, Head of AI, VP Engineering
- **Exclude**: IT services, staffing firms, system integrators, consulting firms

---

## Email Copy Principles

- Under 150 words
- Lead with value or a pattern interrupt — not "I'm Abhishek and I..."
- No bare URLs — always hyperlinked anchor text
- `is_html=True` whenever any link is present
- Interest-based CTA: "Worth a conversation?" not "Book a 30-min call"
- Always test-send to self before bulk send

---

## Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-03-11 | Signals-based targeting only | IT services firms are slow-moving, low-intent, location-dependent |
| 2026-03-11 | first@ email pattern dominates | 100% hit rate on small agencies vs first.last@ |
| 2026-03-13 | Always hyperlink URLs in email body | Bare links look amateurish |
| 2026-03-13 | Prospeo /enrich-person replaces Apollo for enrichment | Old Apollo endpoints removed March 1, 2026 |
