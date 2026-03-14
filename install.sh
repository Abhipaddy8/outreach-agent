#!/bin/bash

# outreach-agent — skill installer
# Copies all skills into ~/.claude/skills/ so they're available as slash commands in Claude Code

set -e

SKILLS_DIR="$HOME/.claude/skills"
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Installing outreach-agent skills..."

mkdir -p "$SKILLS_DIR"

for skill in "$REPO_DIR/skills/"*.md; do
  name=$(basename "$skill")
  cp "$skill" "$SKILLS_DIR/$name"
  echo "  ✅ /$( echo "$name" | sed 's/\.md$//')"
done

echo ""
echo "Done. Open a new Claude Code session and run:"
echo "  /outreach      — full cold email pipeline"
echo "  /agent-teams   — spin up an autonomous agent team on cron"
