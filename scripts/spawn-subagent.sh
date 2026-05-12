#!/bin/bash
# spawn-subagent.sh — Spawn a subagent using ring-spawner (openrouter/inclusionai/ring-2.6-1t:free)
# Usage: ./spawn-subagent.sh "task description" [label] [timeout_seconds]
# Example: ./spawn-subagent.sh "echo hello" mytest 60

set -e

TASK="${1:-echo "No task provided"}"
LABEL="${2:-ring-subagent}"
TIMEOUT="${3:-300}"

echo "Spawning subagent: $LABEL"
echo "Task: $TASK"
echo "Timeout: ${TIMEOUT}s"
echo ""

openclaw agent --agent ring-spawner --message "$TASK" --timeout "$TIMEOUT" --json 2>&1
