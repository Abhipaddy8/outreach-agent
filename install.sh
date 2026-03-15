#!/bin/bash

# outreach-agent — skill installer
# Sets up skills as slash commands in Claude Code (global + project-level)

set -e

GLOBAL_SKILLS="$HOME/.claude/skills"
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_SKILLS="$REPO_DIR/.claude/skills"

SKILLS=(
  outreach
  agent-teams
  lead-borrow
  daily-icp-feed
  content-reflect
  content-compare
  qualify-audience
  signal-monitor
)

echo "Installing outreach-agent skills..."
echo ""

# Install to global ~/.claude/skills/ (available in all projects)
echo "Global install (~/.claude/skills/):"
for skill in "${SKILLS[@]}"; do
  if [ -f "$PROJECT_SKILLS/$skill/SKILL.md" ]; then
    mkdir -p "$GLOBAL_SKILLS/$skill"
    cp "$PROJECT_SKILLS/$skill/SKILL.md" "$GLOBAL_SKILLS/$skill/SKILL.md"
    echo "  ✅ /$skill"
  elif [ -f "$REPO_DIR/skills/$skill.md" ]; then
    # Fallback: convert flat .md to SKILL.md format
    mkdir -p "$GLOBAL_SKILLS/$skill"
    desc=$(grep -A1 "## When to use" "$REPO_DIR/skills/$skill.md" 2>/dev/null | tail -1 | head -c 120)
    {
      echo "---"
      echo "name: $skill"
      echo "description: $desc"
      echo "---"
      echo ""
      cat "$REPO_DIR/skills/$skill.md"
    } > "$GLOBAL_SKILLS/$skill/SKILL.md"
    echo "  ✅ /$skill (converted)"
  else
    echo "  ❌ /$skill (not found)"
  fi
done

# Verify project-level skills exist
echo ""
echo "Project-level install (.claude/skills/):"
for skill in "${SKILLS[@]}"; do
  if [ -f "$PROJECT_SKILLS/$skill/SKILL.md" ]; then
    echo "  ✅ /$skill"
  else
    echo "  ❌ /$skill (missing)"
  fi
done

echo ""
echo "Done. Start a new Claude Code session to load skills."
echo ""
echo "Available commands:"
echo "  /outreach          — full cold email pipeline"
echo "  /agent-teams       — spin up autonomous agent teams"
echo "  /lead-borrow       — borrow leads from influencer posts"
echo "  /daily-icp-feed    — daily ICP post monitor + comment drafts"
echo "  /content-reflect   — own content performance analysis"
echo "  /content-compare   — competitor content analysis"
echo "  /qualify-audience   — qualify engagers on own posts"
echo "  /signal-monitor    — daily signal tracking (funding, jobs, posts)"
