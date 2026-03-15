#!/bin/bash
# update-skills.sh — Pull latest skills from GitHub into .claude/skills/
# Run this if you already cloned the repo and want new/updated skills

REPO="Abhipaddy8/outreach-agent"
BRANCH="main"
BASE_URL="https://raw.githubusercontent.com/$REPO/$BRANCH"

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

echo "Updating outreach-agent skills..."
echo ""

for skill in "${SKILLS[@]}"; do
  mkdir -p ".claude/skills/$skill"
  echo -n "  $skill... "

  HTTP_CODE=$(curl -sL -w "%{http_code}" -o ".claude/skills/$skill/SKILL.md" \
    "$BASE_URL/.claude/skills/$skill/SKILL.md")

  if [ "$HTTP_CODE" = "200" ]; then
    echo "✅"
  else
    echo "❌ (HTTP $HTTP_CODE)"
    rm -f ".claude/skills/$skill/SKILL.md"
  fi
done

echo ""
echo "Done. Restart Claude Code or start a new session to load updated skills."
echo ""
echo "Available skills:"
for skill in "${SKILLS[@]}"; do
  if [ -f ".claude/skills/$skill/SKILL.md" ]; then
    echo "  /$skill"
  fi
done
