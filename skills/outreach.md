# Skill: Outreach Pipeline

Full end-to-end cold email pipeline.

---

## Step 1 — Research (Tavily)

Find companies matching the target criteria:
```
mcp__tavily__tavily_search: "[niche] companies [location] [size] [year] founder CEO"
mcp__tavily__tavily_extract: extract decision maker names from list articles
```

Extract per company: company name, website domain, founder/CTO name, LinkedIn URL.

---

## Step 2 — Email Enrichment (Prospeo)

**API Key**: `ADD_YOUR_PROSPEO_KEY_HERE`
**Endpoint**: `POST https://api.prospeo.io/enrich-person`

```bash
Headers:
  X-KEY: YOUR_API_KEY
  Content-Type: application/json

Body:
{
  "data": {
    "first_name": "Jane",
    "last_name": "Smith",
    "company_website": "acme.com"
  }
}
```

Returns: `email` (verified), `linkedin_url`, `current_job_title`, `location`

**IMPORTANT — Deprecated endpoints (removed March 1, 2026)**
Do NOT use: `/email-finder`, `/linkedin-email-finder`, `/domain-search`
Use ONLY: `/enrich-person` or `/bulk-enrich-person`

---

## Step 3 — Email Permutation Fallback

If Prospeo fails or no credits, try manual permutations in this order:
1. `first@domain.com`
2. `first.last@domain.com`
3. `flast@domain.com`
4. `f.last@domain.com`
5. `firstlast@domain.com`
6. `first.l@domain.com`

Verify each via Instantly:
```
INSTANTLY_VERIFY_EMAIL → INSTANTLY_CHECK_EMAIL_VERIFICATION_STATUS
```
If 4+ fail: drop contact, move on.

---

## Step 4 — Write Email Copy

**Rules (non-negotiable):**
- Under 150 words
- `is_html=True` whenever any link is present
- **Never paste bare URLs** — always `<a href="https://...">anchor text</a>`
- Personalise the hook to their company/role/challenge
- Interest CTA: "Worth a quick conversation?" not "Book a call"
- No attachment in first email unless specifically required

**HTML email template:**
```html
Hi [First Name],<br><br>

[Personalised hook — reference their company or something specific]<br><br>

[Value line — what you've built or what you bring]<br><br>

[CTA — one soft question]<br><br>

[Your name]
```

---

## Step 5 — Send via Gmail

```python
mcp__claude_ai_GMAIL__GMAIL_SEND_EMAIL(
  recipient_email="contact@company.com",
  subject="[subject line]",
  body="[html body]",
  is_html=True
)
```

**Always test-send to self first.** Verify the email looks correct before bulk send.
Send in parallel batches of up to 10.

---

## Step 6 — Update AERCHITECT.md

After every batch, update:
1. **Header**: `Total Contacts` count
2. **Status Board**: Add new rows with sequential numbers, emails, NB status
3. **Batch Progress**: Add new batch row
4. **Session Log**: Add entry with date, action, details

---

## Attachments (PDF via s3key)

Portfolio PDF s3key: `ADD_YOUR_S3KEY_HERE`
> Note: s3keys expire after ~4 days. Re-fetch via:
> `GMAIL_FETCH_EMAILS` (find sent email with PDF) → `GMAIL_GET_ATTACHMENT` → copy s3key

```python
attachment={
  "name": "Portfolio.pdf",
  "s3key": "YOUR_S3KEY",
  "mimetype": "application/pdf"
}
```

---

## MCP Tools Reference

| Tool | Purpose |
|------|---------|
| `mcp__tavily__tavily_search` | Find companies + decision makers |
| `mcp__tavily__tavily_extract` | Extract structured data from pages |
| `mcp__claude_ai_GMAIL__GMAIL_SEND_EMAIL` | Send emails |
| `mcp__claude_ai_GMAIL__GMAIL_FETCH_EMAILS` | Fetch sent/received emails |
| `mcp__claude_ai_GMAIL__GMAIL_GET_ATTACHMENT` | Extract s3key from attachment |
| `mcp__claude_ai_NEVERBOUNCE_INSTANTLY__INSTANTLY_VERIFY_EMAIL` | Verify email |
| `mcp__claude_ai_NEVERBOUNCE_INSTANTLY__INSTANTLY_CHECK_EMAIL_VERIFICATION_STATUS` | Get verify result |
| `mcp__claude_ai_Apollo_MCP__APOLLO_PEOPLE_SEARCH` | Search contacts in Apollo |
| `mcp__claude_ai_Apollo_MCP__APOLLO_BULK_PEOPLE_ENRICHMENT` | Enrich from Apollo |
