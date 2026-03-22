# /autoresearch — Autonomous Outreach Optimization Loop

## What This Is

This applies Karpathy's autoresearch concept — an AI agent that runs experiments in a loop, scores results, keeps winners, and reverts losers — to outreach. Instead of optimizing ML training code, it optimizes email copy, subject lines, ICP targeting, and LinkedIn connection notes. The loop runs continuously: hypothesize, test, measure, keep or revert, repeat.

## When To Use

- User says `/autoresearch`
- User wants to optimize reply rates, open rates, or conversion
- User says "make my outreach better" or "what's working"
- User says "run experiments" or "test this copy"

## The Loop (How It Works)

Every cycle follows the same 9-step process. No exceptions.

### Step 1 — Define the Metric

Ask: what are we optimizing? Pick ONE.

| Metric | How to measure | Good baseline |
|--------|---------------|---------------|
| Open rate | Opens / sends | 40-50% |
| Reply rate | Replies / sends | 5-10% |
| Positive reply rate | Interested replies / sends | 2-5% |
| Meeting conversion | Meetings booked / sends | 1-3% |
| LinkedIn acceptance rate | Accepted / sent | 30-50% |

If the user doesn't specify, default to **reply rate** — it's the most actionable.

### Step 2 — Read the Baseline

Pull current performance from `AERCHITECT.md` and any campaign trackers. Extract:
- Total sends per campaign
- Opens (if available)
- Replies (count + rate)
- Positive vs negative replies
- Current copy (subject line, body, CTA)
- Current ICP (titles, company size, geography, industry)

If data is insufficient (< 20 sends on any campaign), say so and recommend waiting.

### Step 3 — Generate a Hypothesis

Based on the data, generate ONE testable hypothesis. Format:

> "Changing [specific variable] from [current] to [proposed] will improve [metric] because [reasoning]."

Sources for hypotheses:
- Past experiment results in `memory/optimization-log.md`
- Known best practices from MEMORY.md (2-4 word subjects, under 80 words, interest-based CTAs)
- Patterns in what's working vs what's not across campaigns
- Industry benchmarks

Never generate a hypothesis that contradicts a proven winner from a past experiment unless you have a specific reason logged.

### Step 4 — Create the Variant

Write the new version with exactly ONE change from the baseline. If testing subject lines, keep the body identical. If testing body length, keep the subject identical.

Show both versions side by side:

```
BASELINE: [current version]
VARIANT:  [new version]
CHANGE:   [what exactly is different]
```

### Step 5 — Run the Experiment

Send the variant to the next batch. Requirements:
- Minimum 20 contacts per variant
- Same ICP profile as baseline (unless ICP is the variable being tested)
- Same sending time window
- Same sender identity

Tag these contacts in AERCHITECT.md with the experiment number so results can be traced.

### Step 6 — Score the Result

After 3-7 days (never before 3 days — replies take time):
- Pull metrics for both baseline and variant
- Calculate the difference
- Determine statistical significance (with 20+ contacts, a 2x difference is meaningful; a 10% difference is noise)

### Step 7 — Keep or Revert

| Result | Action |
|--------|--------|
| Variant wins by > 30% | KEEP — variant becomes new baseline |
| Variant wins by 10-30% | KEEP TENTATIVELY — run one more batch to confirm |
| Within 10% either way | INCONCLUSIVE — need more data or the variable doesn't matter |
| Baseline wins by > 10% | REVERT — discard variant, log the learning |

### Step 8 — Log the Finding

Write the result to `memory/optimization-log.md` using the format below. This is non-negotiable — every experiment gets logged, winners and losers alike.

### Step 9 — Loop

Generate the next hypothesis based on:
1. What hasn't been tested yet
2. What the last result suggests trying next
3. The optimization priority (fix worst-performing metric first)

Return to Step 3.

---

## What Can Be Optimized

### Subject Lines
- **Length**: 2 words vs 4 words vs 6 words
- **Format**: question ("got 5 min?") vs statement ("your team's AI gap") vs number ("47% faster")
- **Personalization**: generic vs company name vs signal reference
- **Case**: lowercase vs title case
- **Metric**: open rate

### Email Body
- **Length**: 50 words vs 80 words vs 120 words
- **CTA type**: question ("Worth a conversation?") vs direct ("Let's do 15 min Tuesday") vs curiosity ("Curious?")
- **Personalization depth**: generic pain point vs signal-specific vs hyper-personal (references their content/funding/hire)
- **Structure**: pain > solution > CTA vs proof > offer > CTA vs story > CTA vs single proof point > CTA
- **Proof format**: stat ("47% faster") vs case study ("did this for X") vs social proof ("Y companies use this")
- **Metric**: reply rate

### ICP Targeting
- **Industries**: SaaS vs healthcare vs fintech vs e-commerce vs professional services
- **Company size**: 1-50 vs 50-200 vs 200-500 vs 500+
- **Job titles**: CEO vs CTO vs VP Engineering vs VP Sales vs Head of AI
- **Geography**: US vs UK vs EU vs AU vs India
- **Signals**: recently funded vs hiring vs posted on LinkedIn vs launched product
- **Metric**: reply rate + meeting conversion

### LinkedIn Connection Notes
- **Length**: 1 sentence vs 2 sentences vs 3 sentences
- **Approach**: compliment their content vs mutual interest vs direct value offer vs repo/tool share
- **Personalization**: name only vs name + company vs name + specific post reference
- **Metric**: acceptance rate

### Follow-Up Timing
- **Gap between touches**: 3 days vs 5 days vs 7 days
- **Total touches**: 3 vs 4 vs 5 vs 7
- **Follow-up angle**: same thread vs new angle vs breakup email timing
- **Metric**: reply rate on follow-ups specifically

### Send Timing
- **Day of week**: Monday vs Tuesday vs Thursday
- **Time of day**: 8am vs 10am vs 2pm (recipient's timezone)
- **Metric**: open rate

---

## File Structure

```
memory/
  optimization-log.md   — every experiment logged with result
  baselines.md          — current winning versions of all copy
```

### memory/baselines.md Format

```markdown
# Current Winning Baselines
Last updated: [date]

## Subject Line
**Winner**: "quick thought"
**Open rate**: 48% (N=34)
**Established**: Experiment #3, [date]

## Email Body (Email 1)
**Winner**: [full copy]
**Reply rate**: 6.2% (N=48)
**Established**: Experiment #5, [date]

## ICP
**Winner**: VP/Director, $20M-$100M US companies, 100-500 employees
**Reply rate**: 4.5% (N=89)
**Established**: baseline (pre-experiments)

## LinkedIn Note
**Winner**: [full copy]
**Acceptance rate**: 38% (N=25)
**Established**: Experiment #2, [date]
```

### memory/optimization-log.md Format

Each entry:

```markdown
### Experiment #[N] — [Date]
**Optimizing**: [subject line / email body / ICP / LinkedIn note / follow-up timing]
**Hypothesis**: [what we think will work better and why]
**Baseline**: [current version] — [metric]: [value] (N=[sample size])
**Variant**: [new version]
**Sample size**: [N contacts sent variant]
**Result after [X] days**:
  - Baseline: [metric] = [value]
  - Variant: [metric] = [value]
  - Delta: [+/- percentage]
**Decision**: KEEP / REVERT / INCONCLUSIVE
**Learning**: [one sentence takeaway that informs future hypotheses]
```

---

## Autonomous Mode — CronCreate + Agent Teams

This is NOT a description of what should happen. This is how to ACTUALLY set it up to run autonomously using Claude Code's `CronCreate` and `/agent-teams`.

### Option A — Daily Cron (simplest)

Set up a cron that runs the autoresearch scoring + hypothesis loop every day at a fixed time.

**To activate**, run this in Claude Code:

```
Use CronCreate to schedule a daily autoresearch loop.

Cron prompt:
"You are the autoresearch agent. Run the daily optimization check:

STEP 1 — SCORE PENDING EXPERIMENTS
Read memory/optimization-log.md. Find any experiment with status RUNNING or QUEUED.
For each:
  - Check if it has 20+ sends (read AERCHITECT.md, search for the experiment tag)
  - Check if it's 3+ days old
  - If BOTH: pull the metrics, compare baseline vs variant, decide KEEP/REVERT/INCONCLUSIVE
  - Write the result back to memory/optimization-log.md
  - If KEEP: update memory/baselines.md with the new winner
  - If REVERT: log the learning, no changes to baselines

STEP 2 — PICK NEXT OPTIMIZATION TARGET
Priority order:
  1. Metric furthest below benchmark (benchmarks: reply rate 5-10%, open rate 40-50%, LinkedIn accept 30-50%)
  2. Campaign with most data (optimize high-volume first)
  3. Variable not tested in longest time

STEP 3 — GENERATE HYPOTHESIS
Based on:
  - What hasn't been tested yet (check optimization-log.md for past experiments)
  - What the last result suggests trying
  - Known best practices from MEMORY.md

Format: 'Changing [variable] from [current] to [proposed] will improve [metric] because [reasoning]'

STEP 4 — CREATE VARIANT
Write the variant copy. Show both baseline and variant side by side.
Tag it as the next experiment number.
Set status to QUEUED in optimization-log.md.

STEP 5 — SUMMARY
Print: what was scored, what was decided, what's next.
"

Schedule: daily
Interval: 24h (or use specific time like "9am IST")
```

The cron auto-expires after 3 days. Re-run `/autoresearch` to recreate it.

### Option B — Agent Teams (more powerful)

For a full autonomous loop where scoring, hypothesis generation, and variant deployment happen as a coordinated team:

**To activate**, create an agent team brief:

```
Use /agent-teams to create an autoresearch team.

Brief: "Autonomous outreach optimization team that scores experiments,
generates hypotheses, and deploys variants."

Team structure:
- Scorer Agent: reads AERCHITECT.md + optimization-log.md, scores any
  experiment with 20+ sends and 3+ days old. Writes results back.
- Hypothesis Agent: reads optimization-log.md (all past experiments),
  reads baselines.md (current winners), generates next hypothesis.
  Picks the metric furthest below benchmark.
- Variant Agent: takes the hypothesis, writes the variant copy,
  updates optimization-log.md with QUEUED status, prepares the
  variant for the next outreach batch.

Coordination:
  Scorer runs first → Hypothesis reads scorer output → Variant reads hypothesis output.
  Sequential, not parallel (each depends on the previous).

Schedule: CronCreate with 24h interval.

Memory files:
  - memory/optimization-log.md (read + write)
  - memory/baselines.md (read + write)
  - AERCHITECT.md (read only)
  - MEMORY.md (read only)
```

This creates a self-sustaining loop:
```
Day 1: You run /autoresearch manually → baseline established, Experiment #1 queued
Day 2: Cron fires → Scorer: "not enough data yet (only 10 sends)" → waits
Day 3: Cron fires → Scorer: "20 sends, 4 days old, scoring..." → KEEP/REVERT
                   → Hypothesis: "Next test: shorter subject lines"
                   → Variant: writes new copy, tags as Experiment #2
Day 4: Next outreach batch uses Experiment #2 variant automatically
Day 7: Cron scores Experiment #2 → loop continues
```

### Option C — Manual with Reminders

If you don't want full autonomy, the cron can just REMIND you:

```
Use CronCreate with prompt:
"Check memory/optimization-log.md for experiments ready to score
(20+ sends, 3+ days old). If any found, tell me what needs scoring
and suggest next steps. Don't auto-score — just flag it."

Schedule: every 3 days
```

### Which Option to Pick

| Situation | Option |
|-----------|--------|
| You're sending 20+ emails/day and want hands-off optimization | **B — Agent Teams** |
| You're sending 5-10/day and want daily check-ins | **A — Daily Cron** |
| You want to stay in control but not forget to score | **C — Manual with Reminders** |
| You're just starting and have < 50 total sends | **Don't use autonomous mode yet** — run `/autoresearch` manually until you have baseline data |

---

## Safety Rules

1. **One variable at a time.** Never test subject AND body simultaneously. You won't know what caused the change.
2. **Minimum 20 contacts per variant** before scoring. Anything less is noise.
3. **Wait at least 3 days** before judging. Replies come in waves — Day 1 opens, Day 2-3 replies, Day 5-7 follow-up replies.
4. **Never change sender name or email address** as a test variable. That's identity, not copy.
5. **Log everything.** Failed experiments are data. A subject line that bombed tells you as much as one that won.
6. **Save a copy of the baseline** before overwriting in baselines.md. Use the optimization log as the historical record.
7. **Don't overfit to small samples.** If 3/20 replied to variant A and 2/20 replied to variant B, that's not a meaningful difference. Call it inconclusive and run a bigger batch.
8. **Respect sending limits.** Never exceed daily send caps (Gmail: 50/day, Instantly: per account limits) just to get faster experiment data.
9. **Never run more than 2 active experiments** at the same time (they must be testing different channels — e.g., one email experiment + one LinkedIn experiment is fine).

---

## Example Session

```
User: /autoresearch

Agent: Reading outreach data from AERCHITECT.md...

Campaigns found: 7 active
Total sends: 412
Overall reply rate: 2.4% (10 replies / 412 sends)

Current baselines:
- Subject line: "your team's AI gap" — 42% open rate (89 sends)
- Email body: 78 words, pain > solution > CTA — 4.5% reply rate (89 sends)
- ICP: VP/Director at $20M-$100M US companies — 2 meetings / 89 contacts
- LinkedIn note: 2 sentences, value + repo link — 20% acceptance (5/25)

Checking optimization-log.md for unscored experiments... none found.

Weakest metric: LinkedIn acceptance rate (20%) — well below 30-40% benchmark.

Generating hypothesis...

Hypothesis: "Shorter LinkedIn notes (1 sentence, compliment-only, no link)
will outperform 2-sentence notes with repo link because links in
connection requests feel transactional."

Baseline note (current):
  "Hey [Name] — built an open source AI outreach agent, thought you'd
   find it useful: github.com/Abhipaddy8/outreach-agent. Would love
   to connect."
  Acceptance rate: 20% (5/25)

Variant note:
  "Hey [Name] — loved your take on [specific post/topic]. Would be
   great to connect."
  Change: removed link, shortened to 1 sentence, added content reference.

Plan: Send variant to next 20 LinkedIn connects, score after 5 days.

Shall I proceed, or do you want to optimize a different metric first?
```

```
User: proceed

Agent: Variant queued for next 20 LinkedIn connects.
Experiment #1 logged to memory/optimization-log.md.
Will score after 5 days (2026-03-27).

Next check-in: March 27.
```

```
[5 days later]
User: /autoresearch

Agent: Experiment #1 ready for scoring.

Results after 5 days:
- Baseline (2-sentence + link): 20% acceptance (5/25)
- Variant (1-sentence compliment): 45% acceptance (9/20)
- Delta: +125%

Decision: KEEP. Variant becomes new baseline.
Updated memory/baselines.md.

Learning: Removing links and leading with a genuine compliment
more than doubles LinkedIn acceptance rate.

Generating next hypothesis...

Hypothesis: "Subject lines with lowercase and 2 words will outperform
4-word title case subjects."
Based on: 2-4 word subjects show 46% open rate in 2026 benchmarks.
Current subject "your team's AI gap" is 4 words, title case, at 42%.

Variant: "quick question"
Control: "your team's AI gap"

Ready to run on next 25 email sends. Proceed?
```
