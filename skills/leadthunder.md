# /leadthunder — LinkedIn Lead Mining + Connection Campaign

Mine ICP-matched commenters from any LinkedIn post and send personalised connection requests — all via DOM, no click-through scraping.

---

## When to use
User wants to find warm leads from a LinkedIn post and send connection requests with a freebie/offer note.

---

## Phase 1 — Mine Leads from Post Comments

### Step 1: Get context + navigate
```
mcp__claude-in-chrome__tabs_context_mcp  (createIfEmpty: true)
mcp__claude-in-chrome__navigate → [POST_URL]
wait 4s
```

### Step 2: Scroll to load comments (JS)
```js
// Scroll 4 times with 1.5s pauses to load comment nodes
for (let i = 0; i < 4; i++) {
  window.scrollBy(0, 800);
  await new Promise(r => setTimeout(r, 1500));
}
```
Run as 4 separate scrollBy calls with waits between them if async isn't available.

### Step 3: Extract + filter ICP commenters (JS)
```js
const ICP_KEYWORDS = [
  'founder','co-founder','ceo','chief executive',
  'head of sales','vp sales','vp of sales','vice president sales',
  'cro','chief revenue','director of sales','director of revenue',
  'sales leader','sales manager','revenue',
  'gm','general manager'
];

const nodes = Array.from(document.querySelectorAll('article.comments-comment-entity'));
const results = [];
const seen = new Set();

nodes.forEach(node => {
  const lines = node.innerText.split('\n').map(l => l.trim()).filter(Boolean);
  const name = lines[0] || '';
  const headline = lines[1] || '';

  // Get profile URL from anchor tags in the node
  const anchor = node.querySelector('a[href*="/in/"]');
  const url = anchor ? anchor.getAttribute('href').split('?')[0] : '';

  if (!name || seen.has(name)) return;
  const headlineLower = headline.toLowerCase();
  if (ICP_KEYWORDS.some(kw => headlineLower.includes(kw))) {
    seen.add(name);
    results.push({ name, headline, url });
  }
});

JSON.stringify(results, null, 2);
```

### Step 4: Parse + present
Return a clean table:
| # | Name | Headline | LinkedIn URL |
Build from JS results. Filter out empties / duplicates. Max 15.

### Step 5: Write to AERCHITECT.md
Add each contact to the Status Board with:
- Source: `[Post author] post comment`
- Status: `⬜ Not contacted`

---

## Phase 2 — Send Connection Requests

Work through the list one by one. For each profile:

### Step A: Navigate
```
mcp__claude-in-chrome__navigate → https://www.linkedin.com/in/[handle]
wait 3s
```

### Step B: Detect connect type (JS)
```js
const firstName = '[FIRST_NAME]'.toLowerCase();

const directBtn = Array.from(document.querySelectorAll('button'))
  .find(b => b.getAttribute('aria-label')?.toLowerCase().includes('invite')
          && b.getAttribute('aria-label')?.toLowerCase().includes(firstName)
          && b.innerText.trim() === 'Connect');

const moreBtn = Array.from(document.querySelectorAll('button'))
  .find(b => b.getAttribute('aria-label') === 'More actions' && b.innerText.trim() === 'More');

`direct: ${!!directBtn} | more: ${!!moreBtn}`;
```

**Case A — direct**: click `directBtn`
**Case B — more only**: click `moreBtn` → scroll 200px → click item[2] from dropdown (always Connect)

### Step C: More dropdown (Case B) — JS
```js
// Click More
Array.from(document.querySelectorAll('button'))
  .find(b => b.getAttribute('aria-label') === 'More actions' && b.innerText.trim() === 'More').click();

// Scroll to reveal
window.scrollBy(0, 200);

// Wait, then click Connect (always item index 2)
// Verify with: items.map((el,i) => `${i}: "${el.textContent?.trim().substring(0,40)}"`)
Array.from(document.querySelectorAll('.artdeco-dropdown--is-open .artdeco-dropdown__item'))[2].click();
```

**IMPORTANT**: Use `.textContent` (not `.innerText`) to read dropdown items — innerText returns empty on LinkedIn dropdowns.
Dropdown order is always: 0=Send profile, 1=Save to PDF, 2=Connect, 3=Report/Block, 4=About

### Step D: Modal — Add a note (JS)
```js
const modal = document.querySelector('[role="dialog"]');
const addNote = Array.from(modal.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Add a note');
addNote.click();
```

### Step E: Set note text — React synthetic event trick (JS)
```js
const note = YOUR_NOTE_HERE; // keep under 230 chars
const textarea = document.getElementById('custom-message');
const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
setter.call(textarea, note);
textarea.dispatchEvent(new Event('input', { bubbles: true }));
textarea.dispatchEvent(new Event('change', { bubbles: true }));
```
**Why**: LinkedIn uses React — direct `textarea.value = x` doesn't trigger React's state update. Must use the native setter + dispatch events.

### Step F: Send (JS)
```js
const sendBtn = Array.from(document.querySelectorAll('button'))
  .find(b => b.getAttribute('aria-label') === 'Send invitation');
if (sendBtn && !sendBtn.disabled) { sendBtn.click(); 'sent ✓'; }
else { `disabled: ${sendBtn?.disabled}`; }
```

### Step G: Confirm (JS)
```js
const pending = Array.from(document.querySelectorAll('button'))
  .find(b => b.innerText?.trim().toLowerCase().includes('pending'));
const modal = document.querySelector('[role="dialog"]');
`pending: ${!!pending} | modal closed: ${!modal}`;
```
Success = modal closed. Pending button may or may not appear immediately — modal closing is enough.

---

## Note Template

```
[First name] — saw your comment on [post author]'s [topic] post. Built a free open-source Claude Outbound OS that [relevant angle for their role]. Worth a look: github.com/Abhipaddy8/outreach-agent
```

**Role-based angles**:
- Founder/CEO → "automates founder-led outreach without hiring SDRs"
- VP Sales/CRO → "replaces SDR headcount with autonomous outreach"
- Sales Leader → "helps sales teams scale outreach without growing the team"
- SDR team builder → "helps founders scale outreach without growing SDR headcount"
- Revenue fixer → "automates outreach for revenue teams fixing large pipelines"
- 2x exit CEO → "that serial founders use to scale GTM without SDR overhead"

Keep under 230 chars. Count with: `note.length`

---

## Edge Cases

| Situation | What to do |
|-----------|-----------|
| No Connect in More dropdown | Profile is follow-only — skip, note in tracker |
| Direct connect sends without modal | Invite sent without note — mark "no note" in tracker |
| Profile URL is `/in/ACoAAA...` (obfuscated) | Click through to profile to get clean URL, or skip |
| `textContent` shows no items | Dropdown not yet open — scroll more and retry |
| Send button stays disabled | Textarea value didn't register — re-run Step E |

---

## Rate Limits
- Max ~20 connection requests/day on LinkedIn
- Don't send more than 10 per session
- Space sessions across days if batch > 10

---

## After Each Session
Update `AERCHITECT.md`:
- Mark each sent contact as `🟡 Connect Pending`
- Note: "with note" or "no note (direct send)"

Update memory `project_status.md`:
- Move sent contacts from "Remaining" to "Connection requests sent" table

---

## Tools Used
- `mcp__claude-in-chrome__tabs_context_mcp`
- `mcp__claude-in-chrome__navigate`
- `mcp__claude-in-chrome__javascript_tool`
