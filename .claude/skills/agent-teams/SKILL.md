---
name: agent-teams
description: User wants to spin up an autonomous agent team that runs on a cron schedule.
---

# /agent-teams — Autonomous Agent Team Creator

## When to use
User wants to spin up an autonomous agent team that runs on a cron schedule.
Takes a brief → creates missions doc → creates memory doc → creates CronJob for the orchestrator.

## Instructions

### Step 1: Parse the Brief
Read the user's args. Extract:
- **Goal**: What should this team accomplish?
- **Waves**: Logical phases of work (infer from goal, default 3)
- **Interval**: How often the orchestrator runs (ask if not specified, suggest 30 min)
- **Tools**: Does it need Chrome? Which APIs? (user provides keys in .env)

If args are missing or vague, ask ONE question: "What do you want this team to do, and how often should it run?"

---

### Step 2: Create Directory Structure
```bash
mkdir -p .ai-guide/memory
```

---

### Step 3: Write `.ai-guide/missions.md`
Generate a mission map from the brief. Format:

```markdown
# Missions — [Goal Name]
Last updated: [date]

## Wave 1 — [Name] ▶
**Goal**: [What to do]
**Done when**: [Clear success criteria]
**Notes**: (orchestrator writes here after run)

## Wave 2 — [Name]
**Goal**: [What to do]
**Done when**: [Clear success criteria]
**Notes**:

## Wave 3 — [Name]
**Goal**: [What to do]
**Done when**: [Clear success criteria]
**Notes**:

---
## Decisions Log
(Orchestrator appends after each run: what was done, what was found, what changed)
```

---

### Step 4: Write `.ai-guide/agent-team.md`
Generate a team roster from the brief. Format:

```markdown
# Agent Team — [Goal Name]

## Lead Orchestrator
Runs on cron. Reads missions.md, executes active mission, updates memory.

## Specialist Roles (if applicable)
[Infer from goal — e.g. Researcher, Writer, Outreach Sender, Reply Monitor]
[List what each one does and what tools they use]

## API Keys Required
[List what the user needs in their .env — they provide their own]

## Handoff Protocol
Each agent writes its output to .ai-guide/memory/session.md before stopping.
Next agent reads session.md to pick up state.
```

---

### Step 5: Write `.ai-guide/memory/session.md`
Create blank persistent memory template:

```markdown
# Session Memory

## Last Run
Date:
Agent:
Action taken:

## Current State
(What's been done, what's in progress)

## Output / Results So Far
(Links, files, data found)

## Blockers
(Anything that needs human input — orchestrator writes here and stops)

## Next Action
(What the orchestrator should do on next wake)
```

---

### Step 6: CronCreate
Call CronCreate with:
- **interval**: User's chosen interval (e.g. "30min", "1h", "daily at 9am")
- **prompt**: The orchestrator standing prompt below — fill in [PROJECT_DIR] with cwd

**Orchestrator Standing Prompt** (use this verbatim, fill in the path):
```
You are the Lead Orchestrator for this agent team.
Project dir: [PROJECT_DIR]

On every run, do this in order:
1. Read [PROJECT_DIR]/.ai-guide/missions.md — find the mission marked ▶ (active)
2. Read [PROJECT_DIR]/.ai-guide/memory/session.md — understand current state and last action
3. Execute the active mission using whatever tools are needed
4. Write a concise update to [PROJECT_DIR]/.ai-guide/memory/session.md:
   - Last Run: today's date + what you did
   - Current State: updated
   - Output: anything found/created/sent
   - Blockers: anything you couldn't do (stop here if blocker)
   - Next Action: what to do next run
5. If mission is complete: edit missions.md — mark current ▶ as ✅, mark next mission ▶
6. If all missions ✅: write "TEAM COMPLETE" to memory/session.md and do not reschedule
7. If blocker: write it clearly under Blockers in memory/session.md and stop — wait for human
```

---

### Step 7: Brief the User

Print this after everything is created:

```
✅ Agent team created.

Team: [Goal Name]
Missions: [N] waves — Wave 1 active
Cron: every [interval]

Files:
  .ai-guide/missions.md     ← mission progress
  .ai-guide/agent-team.md   ← team roster
  .ai-guide/memory/session.md ← persistent state

Before you step away:
  1. Run in terminal:  caffeinate -i
  2. Every 40-50 min:  /compact  (prevents context overflow)
  3. To check progress: read .ai-guide/memory/session.md
  4. If team hits a blocker: it will write it to session.md and wait for you

Your team fires in [interval].
```
