# Fix self-improving heartbeat state
path = "/root/.openclaw/workspace/self-improving/heartbeat-state.md"
with open(path) as f:
    content = f.read()
old = """last_heartbeat_started_at: 2026-06-06T01:08:00Z
last_reviewed_change_at: 2026-06-01T05:38:00Z
last_heartbeat_result: HEARTBEAT_OK
last_actions: 2026-06-06 01:08 — No self-improving file changes since last review. ClawHub: all 5 skills reachable, v1.0.0 unchanged. No proactivity triggers. Nothing needs attention."""
new = """last_heartbeat_started_at: 2026-06-06T13:08:00Z
last_reviewed_change_at: 2026-06-01T05:38:00Z
last_heartbeat_result: HEARTBEAT_OK
last_actions: 2026-06-06 13:08 — No self-improving file changes since last review. ClawHub: all 5 skills reachable, v1.0.0 unchanged. No stars/reviews. No proactivity triggers. Nothing needs attention."""
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("heartbeat-state done")

# Fix clawhub stats
path = "/root/.openclaw/workspace/memory/clawhub-stats.md"
with open(path) as f:
    content = f.read()
old = """| 2026-06-06 11:38 | All 5 reachable, v1.0.0 unchanged. No stars/reviews visible via CLI. |

Last checked: 2026-06-06 11:38 UTC"""
new = """| 2026-06-06 11:38 | All 5 reachable, v1.0.0 unchanged. No stars/reviews visible via CLI. |
| 2026-06-06 13:08 | All 5 reachable, v1.0.0 unchanged. No stars/reviews visible via CLI. |

Last checked: 2026-06-06 13:08 UTC"""
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("clawhub-stats done")
