# /tetris-mission — Add TechStack Tetris Missions

## When to use
User wants to add new missions, worlds, or content to TechStack Tetris — including block data, spec sections, and MCP code steps.

## Key Paths
- **Browser game**: `/Users/equipp/TECH INTERVIEW TETRIS/techstack-tetris/`
- **MCP server**: `/Users/equipp/TECH INTERVIEW TETRIS/techstack-tetris-mcp/`
- **Mission definitions (browser)**: `/Users/equipp/TECH INTERVIEW TETRIS/techstack-tetris/src/data/missions.json`
- **Block + spec data (browser)**: `/Users/equipp/TECH INTERVIEW TETRIS/techstack-tetris/src/data/missionGameData.js`
- **Code steps (MCP server)**: `/Users/equipp/TECH INTERVIEW TETRIS/techstack-tetris-mcp/src/missions.js`
- **App component**: `/Users/equipp/TECH INTERVIEW TETRIS/techstack-tetris/src/App.js`
- **Game screen**: `/Users/equipp/TECH INTERVIEW TETRIS/techstack-tetris/src/GameScreen.js`
- **Spec writer**: `/Users/equipp/TECH INTERVIEW TETRIS/techstack-tetris/src/SpecWriter.js`
- **Architecture doc**: `/Users/equipp/TECH INTERVIEW TETRIS/techstack-tetris/ARCHITECTURE.md`

## Instructions

### Step 1: Understand the Request
Ask (if not already clear):
- **What missions?** New world or adding to existing world?
- **Client + title + brief** for each mission
- **How many blocks/steps** per mission (typically 5-7)
- **Block names** — the pipeline components the player assembles

### Step 2: Write Three Data Layers

Every mission needs content in THREE files:

#### Layer 1: missions.json (Browser — mission metadata)
Location: `techstack-tetris/src/data/missions.json`

```json
{
  "id": "X-Y",
  "title": "Mission Title",
  "client": "Company Name",
  "brief": "2-3 sentence scenario. Always written as: Company has problem. Stakes are high. You have been hired to fix it.",
  "task": "One-line task description.",
  "slots": ["Slot Name 1", "Slot Name 2", ...],
  "blocks": ["Block Name 1", "Block Name 2", ...]
}
```

Rules:
- `slots` = display names shown as empty slots on the board
- `blocks` = names shown on the draggable blocks
- Keep `id` format as `{world}-{mission}` (e.g. "3-2")
- Brief must be dramatic, specific, include real numbers when possible

#### Layer 2: missionGameData.js (Browser — block content + spec sections)
Location: `techstack-tetris/src/data/missionGameData.js`

Each mission entry in the `MISSION_GAME_DATA` object:

```js
'X-Y': {
  pipelineNodes: [
    { icon: 'emoji', label: 'Short Label' },
    // One per block, shown as pipeline visualization
  ],
  blockData: {
    'Block Name': {
      displayName: 'One line describing what this component does',
      correctSlot: 0, // zero-indexed position in pipeline
      correctMsg: '3-5 sentences explaining why this is correct, how it works in production, and what happens at scale. Include the specific client context.',
      wrongMsg: '1-2 sentences hinting at correct placement without giving it away.',
      interviewTip: 'In an interview say: "..." — a quotable sentence the player can use in real interviews.',
    },
    // One per block
  },
  specSections: [
    {
      slotName: 'Block Name',
      correct: 'Architectural spec fragment (2-3 sentences). Describes the RIGHT approach with specific technologies, patterns, and trade-offs.',
      wrong: [
        'Plausible but flawed approach 1 — a common junior mistake.',
        'Plausible but flawed approach 2 — sounds good but has a fatal flaw.',
      ],
      hint: 'Question that guides the player toward the right answer without giving it away.',
    },
    // One per block
  ],
},
```

Rules for blockData:
- `displayName` = what appears on the block (one line, starts with verb)
- `correctSlot` = zero-indexed position in the pipeline
- `correctMsg` = deep explanation, mention the client by name, reference scale
- `interviewTip` = always starts with `In an interview say: "..."`

Rules for specSections:
- `correct` = specific technologies, real patterns, production reasoning
- `wrong` options must be PLAUSIBLE — not obviously stupid
- `hint` = a question, not a statement

#### Layer 3: missions.js (MCP Server — code steps)
Location: `techstack-tetris-mcp/src/missions.js`

Each mission in the `MISSIONS` object:

```js
'X-Y': {
  id: 'X-Y',
  title: 'Mission Title',
  client: 'Company',
  description: 'One-line task description.',
  runtime: 'node',
  setup: 'npm init -y && npm install relevant-packages',
  steps: [
    {
      id: 'step-1',
      title: 'Block Name',
      instruction: 'What the player needs to build in this step.',
      scaffoldFile: 'filename.js',
      scaffold: `// filename.js — Component Name
// Brief description

const dependency = require('package');

async function mainFunction(params) {
  // TODO: Description of what to implement
  __BLANK_1__
}

module.exports = { mainFunction };
`,
      blanks: {
        '__BLANK_1__': {
          correct: `3-8 lines of real, working Node.js code`,
          wrong: [
            `Plausible but flawed option 1 (common junior mistake)`,
            `Plausible but flawed option 2 (sounds right but has a bug)`,
          ],
          hint: 'Explains why the wrong approaches fail without giving the answer.',
        },
      },
      expectedOutput: 'What the player should see when this step runs correctly',
      validation: {
        type: 'file_contains',
        file: 'filename.js',
        patterns: ['key_function', 'key_pattern', 'key_variable'],
      },
    },
    // One step per block
  ],
},
```

Rules for code steps:
- Scaffold must be REALISTIC production Node.js — not toy code
- Only ONE `__BLANK_1__` per step (keeps it focused)
- Correct code: 3-8 lines, uses real APIs/patterns
- Wrong code: plausible junior mistakes (e.g., `jwt.decode` instead of `jwt.verify`)
- Validation patterns: 3-5 strings that MUST appear in the correct code
- `scaffoldFile` should be a meaningful name (e.g., `auth.js`, `chunker.js`)

### Step 3: Wire New World (if adding a whole world)

If adding a new world (not just missions to existing world):

1. **missions.json**: Add new world object to the `worlds` array
2. **App.js**: Add world color to `worldColors` array, update footer count
3. **ARCHITECTURE.md**: Update mission count and world list

World color palette used so far:
- World 1: `#00FF9D` (green)
- World 2: `#00D4FF` (cyan)
- World 3: `#FF6B35` (orange)
- World 4: `#FF4444` (red)
- World 5: `#C084FC` (purple)
- World 6: `#FFD700` (gold)

### Step 4: Validate
After writing all three layers, verify:
- [ ] Mission ID in missions.json matches missionGameData.js key matches missions.js key
- [ ] Block count matches across all three files
- [ ] Block names are consistent (same names in blocks array, blockData keys, specSections slotNames, and step titles)
- [ ] `correctSlot` values are sequential (0, 1, 2, ...)
- [ ] Every specSection has exactly 2 wrong options
- [ ] Every code step has validation patterns that match the correct code
- [ ] No duplicate mission IDs

### Step 5: Build + Deploy (if requested)
```bash
cd "/Users/equipp/TECH INTERVIEW TETRIS/techstack-tetris"
npm run build
npx vercel deploy --prod ./build --yes
```

## Parallelization Strategy
For bulk mission creation (5+ missions), use parallel agents:
- One agent per world (5 missions each)
- Each writes to a temp file: `temp-worldN.js`
- Merge agent combines temp files into the real files
- Delete temp files after merge

## Quality Checklist
- Briefs are dramatic and specific (real company problems)
- Wrong options are genuinely tempting (not obviously wrong)
- Interview tips are quotable in a real interview
- Code scaffolds use real npm packages
- Spec sections describe architecture, not syntax
- Hints are questions, not answers
