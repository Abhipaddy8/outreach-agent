# Skill: LinkedIn Connection Request with Note

Send personalised LinkedIn connection requests using DOM automation. No click-through scraping. Works for both direct-connect and More-dropdown profiles.

---

## Trigger
User wants to send LinkedIn connection requests to a list of profiles with a personalised note.

---

## Pre-flight
- Load tab context: `mcp__claude-in-chrome__tabs_context_mcp`
- Confirm LinkedIn is logged in as Abhishek
- Freebie link: `https://github.com/Abhipaddy8/outreach-agent`
- Note template (keep under 230 chars):
  > "[First name] — saw your comment on [post/context]. Built a free open-source Claude Outbound OS that [relevant angle]. Worth a look: github.com/Abhipaddy8/outreach-agent"

---

## Per-profile flow (pure JS, minimal screenshots)

### Step 1 — Navigate
```
mcp__claude-in-chrome__navigate → https://www.linkedin.com/in/[handle]
wait 3s
```

### Step 2 — Detect connect type (JS)
```js
const directBtn = Array.from(document.querySelectorAll('button'))
  .find(b => b.getAttribute('aria-label')?.startsWith('Invite')
          && b.innerText.trim() === 'Connect'
          && b.getAttribute('aria-label')?.toLowerCase().includes('[firstname_lower]'));

const moreBtn = Array.from(document.querySelectorAll('button'))
  .find(b => b.getAttribute('aria-label') === 'More actions' && b.innerText.trim() === 'More');
```

**Case A — Direct connect**: `directBtn` found → click it
**Case B — More dropdown**: Only `moreBtn` found → click More → scroll 2 ticks down → click Connect at dropdown item 3

### Step 3 — Modal: Add a note (JS)
```js
// Wait for modal, click Add a note
const modal = document.querySelector('[role="dialog"]');
const addNote = Array.from(modal.querySelectorAll('button')).find(b => b.innerText.trim() === 'Add a note');
addNote.click();
```

### Step 4 — Type note (JS — React synthetic event required)
```js
const textarea = document.getElementById('custom-message'); // id="custom-message", max ~300 chars
const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
setter.call(textarea, YOUR_NOTE_HERE);
textarea.dispatchEvent(new Event('input', { bubbles: true }));
textarea.dispatchEvent(new Event('change', { bubbles: true }));
```

### Step 5 — Send (JS)
```js
const sendBtn = Array.from(document.querySelectorAll('button'))
  .find(b => b.getAttribute('aria-label') === 'Send invitation');
// Only click if enabled
if (sendBtn && !sendBtn.disabled) sendBtn.click();
```

### Step 6 — Confirm (JS)
```js
const pending = Array.from(document.querySelectorAll('button'))
  .find(b => b.innerText.trim().toLowerCase().includes('pending'));
const modal = document.querySelector('[role="dialog"]');
// Success = pending btn exists + modal closed
```

---

## More dropdown detail (Case B)
1. `button[aria-label="More actions"][innerText="More"]` → click
2. Scroll page 2 ticks down — reveals full dropdown
3. Connect is 3rd item, approx coordinate (491, 443) after scroll
4. Alternatively: wait for `.artdeco-dropdown--is-open` then find li with "Connect" text

---

## Profiles that are follow-only (no connect available)
- Kyle Norton (/in/kylecnorton) — 41K followers, More dropdown has no Connect

---

## Notes
- Never use `button.innerText === 'Connect'` alone — it matches sidebar "People you may know" cards
- Always scope to profile-specific aria-label: `aria-label="Invite [Full Name] to connect"`
- Screenshot only needed if something fails — not as a pre-check
- LinkedIn rate limits: don't send more than ~20 requests/day
