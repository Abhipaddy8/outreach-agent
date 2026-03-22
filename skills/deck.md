# /deck — Build PDF Decks

## When to use
User wants to create a presentation deck as a PDF. Could be for consulting pitches, client proposals, portfolio presentations, or any visual document.

## Instructions

### Step 1: Ask User (brief)
Ask in one message:
- **Purpose**: What is this deck for? (consulting pitch, client proposal, portfolio, etc.)
- **Audience**: Who will read it?
- **Key points**: What must be included? (or let user provide rough outline)
- **Style**: Dark theme (default), light theme, or brand-specific?

### Step 2: Build HTML
Create an HTML file with embedded CSS at `/Users/equipp/Daily Outreach/[descriptive_name]_Deck.html`

**Design system (default dark theme):**
- Page: A4 landscape, `@page { size: A4 landscape; margin: 0; }`
- Background: `#0A0A0A`, text: `#E8E8E8`
- Accent: `#00D4AA` (teal/green), secondary: `#FF6B35` (orange for warnings/problems)
- Font: Helvetica Neue, Arial, sans-serif
- Cards: `background: #141414; border: 1px solid #222; border-radius: 12px;`
- Tags: `background: #1A2A25; color: #00D4AA; border-radius: 20px;`

**Slide structure:**
- Each slide is a `<div class="slide">` with `page-break-after: always`
- Slide dimensions: `width: 297mm; height: 210mm; padding: 40px 50px;`
- Footer on each slide (except title/CTA): name + email

**Standard slide types:**
1. **Title slide**: Big headline, subtitle, author info
2. **Problem slide**: Stats in boxes + bullet points
3. **Solution/Process slide**: 3-4 step cards in a row
4. **Two-column comparison**: Before/After or Old/New
5. **Results slide**: Metric cards with before/after numbers
6. **Pricing slide**: 3 tier cards (basic/featured/premium)
7. **CTA slide**: Centered headline + contact info + tags

**Abhishek's contact info (always on CTA slide):**
```
Abhishek Padmanabhan
abhipaddy8@gmail.com
linkedin.com/in/abhishek-padmanabhan-03869556
```

### Step 3: Convert to PDF
```bash
cd "/Users/equipp/Daily Outreach" && python3 -c "from weasyprint import HTML; HTML('[filename].html').write_pdf('[filename].pdf')"
```

### Step 4: Get s3key (if needed for email sends)
Tell user: "To use this deck in email campaigns, send it to yourself in Gmail, then I'll extract the s3key."

When user confirms sent:
1. `mcp__claude_ai_GMAIL__GMAIL_FETCH_EMAILS` — query: `from:me to:me has:attachment after:YYYY/MM/DD`
2. `mcp__claude_ai_GMAIL__GMAIL_GET_ATTACHMENT` — extract s3key from the attachment
3. Store s3key in AERCHITECT.md under the relevant campaign section

### Key Notes
- weasyprint is installed locally and works
- Always preview HTML structure before converting (check slide count, content completeness)
- Max ~7-8 slides for pitch decks — respect attention spans
- Bold claims need proof points on the same or next slide
