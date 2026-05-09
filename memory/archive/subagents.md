# Access-Controlled Sub-Agents for New Projects

This file defines the sub-agents that are automatically accessible in a new OpenClaw project session. The Director will ensure these agents are spawned or available as needed.

- test-auth-flows-agent: verifies login/logout flow and API authentication endpoints
- fix-nginx-routing-agent: responsible for configuring/reconfiguring gateway routing for front-end/back-end separation
- analyze-frontend-errors-agent: scans browser console, network logs, and render boundaries for UI stability
- test-api-response-agent: validates API responses (auth and protected endpoints) from external perspective
- compute-stats-agent: validates and hardens metrics/stat aggregation with edge cases
- memory-manager-agent: ensures memory/persistence layer alignment across sessions

Access policy:
- These agents are accessible by the Director in MAIN session unless explicitly restricted by project scope.
- If a project disables any agent, you can override for debugging but default is enabled for new sessions.

Usage:
- When starting a new project, the Director will ensure these agents exist in the session context and can be spawned on demand.

Notes:
- This file should be updated whenever new agents are added or access rules change.
