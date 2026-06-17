# Security Policy

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities. Instead, email: **abhipaddy8@gmail.com** with subject line `[SECURITY] outreach-agent`.

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fix

You'll receive a response within 48 hours. If the issue is confirmed, a fix will be released promptly and you'll be credited in the changelog (unless you prefer otherwise).

---

## API Keys — All Placeholders

Every API key visible in this repository is a placeholder string like `ADD_YOUR_PROSPEO_KEY_HERE` or `YOUR_COMPOSIO_API_KEY`. **No real credentials are committed here.**

If you find what appears to be a real API key (a 32+ character hex string, a `sk-...` token, etc.), please report it via the email above immediately.

### Keys you need to supply yourself

| Placeholder | Where | Service |
|-------------|-------|---------|
| `ADD_YOUR_PROSPEO_KEY_HERE` | `.claude/skills/outreach/SKILL.md` | [prospeo.io](https://prospeo.io) |
| `YOUR_COMPOSIO_API_KEY` | `.mcp.json` | [composio.dev](https://composio.dev) |
| `YOUR_TAVILY_API_KEY` | `.mcp.json` | [tavily.com](https://tavily.com) |
| `YOUR_APIFY_TOKEN` | `.mcp.json` | [apify.com](https://apify.com) |

---

## Memory Directory

The `memory/` directory is **gitignored** and should never be committed. It contains session state written by Claude during skill runs — including lead names, LinkedIn profiles, and conversation drafts for real third parties. See `memory/README.md` for details.

---

## Prompt Injection

Skills in this repo instruct Claude to scrape and analyze external content (LinkedIn posts, job descriptions, articles). All skill files include an explicit trust-boundary annotation instructing Claude to treat scraped text as data only, never as instructions.

If you identify a prompt injection vector not already covered, please report it via the email above.

---

## CAN-SPAM / GDPR

Email templates in this repo include opt-out language and a physical address placeholder. Users are responsible for:
- Replacing `[Your physical mailing address]` with a real address before sending
- Maintaining a suppression list for anyone who opts out
- Ensuring lawful basis for contacting EU-based recipients under GDPR
- Complying with local regulations in their jurisdiction

This tool is designed for B2B prospecting. Use it responsibly.
