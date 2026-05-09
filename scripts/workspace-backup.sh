#!/bin/bash
# workspace-backup.sh — auto-commit and push workspace changes
# Set GIT_TERMINAL_PROMPT=0 to prevent credential prompts
export GIT_TERMINAL_PROMPT=0
cd /root/.openclaw/workspace
TIMESTAMP=$(date -u '+%Y-%m-%d %H:%M UTC')
git add . --ignore-errors
# Only commit if there are actual staged changes
if git diff --staged --quiet 2>/dev/null; then
  echo "[$TIMESTAMP] No changes to commit"
else
  git commit -m "Auto-backup: $TIMESTAMP" --allow-empty 2>&1
  git push 2>&1
fi
