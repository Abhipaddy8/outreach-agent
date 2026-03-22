# /linkedin — LinkedIn Browser Automation

## When to use
User wants to perform LinkedIn actions: view profiles, send connection requests, send messages, check notifications, or research prospects. Uses Chrome browser automation with Abhishek's logged-in LinkedIn session.

## Instructions

### Step 1: Get Browser Context
Always start by calling `mcp__claude-in-chrome__tabs_context_mcp` to see what tabs are open.

### Step 2: Navigate to LinkedIn
- If LinkedIn tab exists, use it
- If not, create new tab: `mcp__claude-in-chrome__tabs_create_mcp` with `https://www.linkedin.com`
- Verify logged in by checking for profile icon / feed content

### Step 3: Execute Requested Action

**Profile Research:**
1. Navigate to profile URL: `mcp__claude-in-chrome__navigate`
2. Read page: `mcp__claude-in-chrome__read_page` or `mcp__claude-in-chrome__get_page_text`
3. Extract: name, title, company, headline, about section, experience, skills
4. Screenshot if needed: `mcp__claude-in-chrome__computer` with action screenshot

**Send Connection Request:**
1. Navigate to target profile
2. Find "Connect" button: `mcp__claude-in-chrome__find` with query "Connect"
3. Click Connect: `mcp__claude-in-chrome__computer` with action click
4. If "Add a note" option appears, click it
5. Type personalized note: `mcp__claude-in-chrome__form_input`
6. Click "Send": `mcp__claude-in-chrome__computer` with action click
7. Verify sent

**Send Message (existing connection):**
1. Navigate to profile
2. Click "Message" button
3. Type message in chat window: `mcp__claude-in-chrome__form_input`
4. Click Send
5. Verify delivered

**Check Notifications/Messages:**
1. Navigate to `https://www.linkedin.com/messaging/`
2. Read page for unread conversations
3. Screenshot and report back

**Search for People:**
1. Navigate to `https://www.linkedin.com/search/results/people/?keywords=[query]`
2. Read results
3. Extract names, titles, companies, profile URLs

### Safety Rules
- **Rate limits**: Max 10 connection requests per session, max 20 profile views
- **Timing**: Add 3-5 second pauses between actions (use natural reading time)
- **No automation fingerprints**: Don't rapid-fire actions, vary timing
- **Never**: Change account settings, post content, or accept requests without asking
- **Always**: Confirm before sending any message or connection request — show user the text first

### Recording
For multi-step LinkedIn workflows, use `mcp__claude-in-chrome__gif_creator` to record the session so user can review.

### Connection Note Templates

**For prospects (outreach consulting):**
```
[First Name] — noticed you're running [sales/SDR/RevOps] at [Company]. Been building AI-powered outreach systems for sales teams. Would love to connect and swap notes on what's working.
```

**For job targets:**
```
[First Name] — came across [Company]'s work in [area]. I build production AI systems (RAG, multi-agent, MCP). Would love to connect.
```

**For industry peers:**
```
[First Name] — your work on [specific thing] caught my attention. Always good to connect with people building in the same space.
```

### After Actions
Report back to user:
- What was done (profiles viewed, requests sent, messages sent)
- Any issues (rate limits, profile not found, not logged in)
- Screenshots of key actions if recorded

### Troubleshooting
- **Not logged in**: Tell user to open Chrome, log into LinkedIn manually, then retry
- **Rate limited**: Stop immediately, inform user, suggest waiting 24 hours
- **Profile not found**: Try alternative URL formats or search by name
- **Button not found**: Take screenshot, show user, ask for guidance
- If browser tools fail after 2-3 attempts, stop and ask user for help — don't loop

### MCP Tools Used
- `mcp__claude-in-chrome__tabs_context_mcp`
- `mcp__claude-in-chrome__tabs_create_mcp`
- `mcp__claude-in-chrome__navigate`
- `mcp__claude-in-chrome__read_page`
- `mcp__claude-in-chrome__get_page_text`
- `mcp__claude-in-chrome__find`
- `mcp__claude-in-chrome__computer`
- `mcp__claude-in-chrome__form_input`
- `mcp__claude-in-chrome__gif_creator`
- `mcp__claude-in-chrome__javascript_tool`
