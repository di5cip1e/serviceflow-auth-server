# Lessons: May 11, 2026

## Bug Fixes
- **swarm.html routing**: Use `/api/route-test` not `/api/swarm/route-test` — the swarm router mounts at `/api/chat` not `/api/swarm`
- **Duplicate require in routes.js**: `const mcpRegistry = require('./registry')` appeared twice — second declaration shadows first, syntax error. Always dedupe requires before shipping.
- **Route mounting prefix mismatch**: `app.use('/api', mcpRoutes)` fails when mcpRoutes has paths like `/templates`. Express matches paths at the route level — if the router itself starts with `/templates` and you mount at `/api`, the full path is `/api/templates`. But swarm router has catch-all `/*` at `/api/chat/*`. Solution: use `app.use('/api/mcp', mcpRoutes)` when route paths are `/templates` etc., not just `/api`.
- **Import vs class instantiation in stateMachine.js**: `const IntentClassifier = require(...)` + `new IntentClassifier()` failed because the module exports named functions (`classify`, `getKeywords`), not a class. Fixed by destructuring: `const { classify } = require(...)`.

## Architecture Decisions
- **Phase 2 swarm routing**: Keyword matching first (0.8 threshold), then Ollama LLM for ambiguous cases. 3s timeout on LLM calls — fail-open to keyword matching if Ollama slow.
- **Twilio 15s timeout**: Set AbortSignal to 12s to leave 3s buffer for response. Twilio webhook times out at 15s — hard limit.
- **MCP client**: Plain child_process.spawn JSON-RPC over stdio — no external MCP SDK. 30s timeout per call. Parse stdout line-by-line (each JSON-RPC response is a newline-delimited JSON object).

## Sub-Agent Patterns
- **Pixel write tool**: `content: undefined` — the write tool requires an explicit `content` string parameter. Empty string is valid, undefined is not. Always pass content explicitly in prompts.
- **Prism/Circuit contrast**: Prism delivered clean frontend (channels.html, 121L) on first try. Circuit delivered clean backend (Phase 3) on first try. Match agents to domain.
- **Prism mcp.html failure**: Second consecutive empty delivery. Tool-use issue (content: undefined on write). Must build frontend files directly if Prism fails twice.

## Phase 4 MCP Wire-Up Still Needed
- `buildToolsSchema(agentId)` and `getToolsForAgent(agentId)` — these need wiring into swarmRouter.js system prompts so the LLM actually sees MCP tool names.
- The MCP client is live and routes are live, but the LLM doesn't know what tools are available yet.
