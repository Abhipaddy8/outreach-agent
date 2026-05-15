# Repo Improvements — Security Audit (May 2026)

Triggered by community security review. All file fixes committed in `148dc61`.

---

## Done ✅

| Fix | Commit |
|-----|--------|
| Prospeo API key replaced with `ADD_YOUR_PROSPEO_KEY_HERE` | 148dc61 |
| `memory/` added to `.gitignore` | 148dc61 |
| 6 PII memory files untracked and removed from repo | 148dc61 |
| Trust-boundary annotations added to 4 skills (qualify-audience, lead-borrow, signal-monitor, daily-icp-feed) | 148dc61 |
| CAN-SPAM opt-out footer added to every email template (not Email 4 only) | 148dc61 |
| `update-skills.sh` hardened: `set -e`, `--fail`, `--proto '=https'`, `--tlsv1.2` | 148dc61 |
| `.mcp.json` package versions pinned (no more `@latest`) | 148dc61 |
| `SECURITY.md` added with vulnerability reporting + key placeholder table | 148dc61 |

---

## Still Needs Action — 2 Items

### 1. Rotate the Prospeo Key (do this now)

Go to **prospeo.io → API keys → regenerate**.

The old key `6606f927ebdb27e9ff3cb3c4dab84356` is in 7 forks and in git history — it is compromised regardless of history cleanup. After rotating, paste the new key into `.claude/skills/outreach/SKILL.md:26`.

### 2. History Rewrite ✅ Done

`git filter-repo` scrubbed the key from all 16 commits. Force-pushed to GitHub on 2026-05-15.

File a GitHub support request to purge cached views:
`github.com/contact` → "I need to remove sensitive data from a public repository."

> Key still exists in the 7 forks. **Rotating the key at prospeo.io is still required.**

---

## Original Findings (from community reviewer)

### 1. Live Prospeo API Key in Public Git History — CRITICAL
- Key was hardcoded in `.claude/skills/outreach/SKILL.md:26`
- Was present since commit `198f1f7`, retrievable from 7 forks
- **Fixed**: Replaced with placeholder in file. Scrubbed from all git history via `git filter-repo`. Push pending.
- **Still required**: Rotate the key at prospeo.io — forks still have old history.

### 2. PII of Third Parties in Repo — HIGH
- `memory/lb_pipeline.md`: 3 named leads + 20 named "skipped" leads with LinkedIn slugs, headlines, rejection reasons
- `memory/lb_conversations.md`: verbatim comment quotes, personalized openers per person
- GDPR risk: people didn't consent to being published. Rejection reasons are editorial judgments.
- **Fixed**: Both files untracked and removed. `memory/` is now gitignored.

### 3. update-skills.sh — Curl-Pipe-Bash with No Integrity Check — MEDIUM
- No `set -e`, no `--fail` on curl, no checksum verification
- A compromised CDN or MITM could push malicious skill content that runs in the next Claude session with full Gmail + Chrome MCP access
- **Fixed**: Added `set -e`, `--fail`, `--proto '=https'`, `--tlsv1.2`

### 4. CAN-SPAM / GDPR Non-Compliance — MEDIUM
- Opt-out language only in Email 4 of the 48hr sequence
- No physical address in any template
- No suppression list logic
- **Fixed**: Opt-out footer added to every email template. Users must fill in `[Your physical mailing address]`.

### 5. Prompt Injection Surface — LOW-MEDIUM
- qualify-audience, lead-borrow, signal-monitor, daily-icp-feed all ingest raw LinkedIn comment/post text into Claude's context
- Same session has Gmail MCP and Chrome MCP live with write access
- No sanitization or trust-boundary annotation in original skill files
- **Fixed**: Trust-boundary block added to all 4 skills instructing Claude to treat scraped text as data, never as commands.

### 6. npx @latest in .mcp.json — LOW
- All 5 MCP servers used `@latest` — no version pin
- Supply chain risk: a compromised package version auto-installs on next session start
- **Fixed**: All packages pinned to specific versions.
