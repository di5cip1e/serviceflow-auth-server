# M.ai.K.R Beta Test Plan

## Purpose
Comprehensive end-to-end test of every feature, page, API endpoint, tool, and integration for each beta account. Run this after any major change or before a release.

## Test Accounts

| # | Name | Email | Plan | Agent | Agent ID |
|---|------|-------|------|-------|----------|
| 1 | Beta Alpha | beta-alpha@maikr.pro | Growth | AlphaBot | 4f13c8ec-775c-40cc-a45f-22ed1f399312 |
| 2 | Beta Bravo | beta-bravo@maikr.pro | Value | BravoAssist | 12cae410-7b44-42c4-abcc-05eb71ef8e4a |
| 3 | Beta Charlie | beta-charlie@maikr.pro | Growth | CharlieHelper | f4676f7c-d195-4c48-acaa-c75a1f3ba5cb |
| 4 | Beta Delta | beta-delta@maikr.pro | Scale | DeltaGuide | 32407ee6-6394-4514-b225-0d1c491edbc4 |
| 5 | Beta Echo | beta-echo@maikr.pro | Value | EchoSupport | 6f398242-fd36-4f80-ace7-4fadb2a07ea9 |

**Password (all):** `beta1234!`
**Base URL:** `https://maikr.pro`

---

## Test Sections

### Section 1: Public Pages (No Auth)
| ID | Test | URL | Expected |
|----|------|-----|----------|
| 1.1 | Landing page loads | `GET /` | 200, contains "M.ai.K.R" |
| 1.2 | Login page loads | `GET /login` | 200, contains login form |
| 1.3 | Register page loads | `GET /register` | 200, contains register form |
| 1.4 | Build step 1 loads | `GET /build` | 200, contains form |
| 1.5 | Privacy page loads | `GET /privacy.html` | 200 |
| 1.6 | Terms page loads | `GET /terms.html` | 200 |
| 1.7 | Health endpoint | `GET /health` | 200, `{"status":"ok"}` |
| 1.8 | 404 handling | `GET /nonexistent` | 404 or redirect |

### Section 2: Authentication
| ID | Test | API | Expected |
|----|------|-----|----------|
| 2.1 | Login (each account) | `POST /api/auth/login` | 200, `{success:true, user:{...}}` |
| 2.2 | Login wrong password | `POST /api/auth/login` (bad pw) | 401 |
| 2.3 | Login nonexistent email | `POST /api/auth/login` (fake) | 401 |
| 2.4 | Get current user | `GET /api/auth/me` | 200, user object |
| 2.5 | Logout | `POST /api/auth/logout` | 200, session cleared |
| 2.6 | Protected page redirects to login | `GET /dashboard` (no session) | 302 → /login |
| 2.7 | Change password | `POST /api/auth/change-password` | 200, can login with new pw |
| 2.8 | Rate limiting | 6 rapid login attempts | 429 on 6th |

### Section 3: Protected Pages (With Auth)
| ID | Test | URL | Expected |
|----|------|-----|----------|
| 3.1 | Dashboard/Command Center | `GET /dashboard` | 200, command center HTML |
| 3.2 | Chat page | `GET /chat.html` | 200, chat interface |
| 3.3 | Observe page | `GET /observe.html` | 200, observability UI |
| 3.4 | Swarm page | `GET /swarm.html` | 200, swarm UI |
| 3.5 | Channels page | `GET /channels.html` | 200, channels UI |
| 3.6 | MCP page | `GET /mcp.html` | 200, MCP UI |
| 3.7 | Optimization page | `GET /optimization.html` | 200, optimization UI |
| 3.8 | Settings page | `GET /settings.html` | 200, settings UI |
| 3.9 | Old dashboard.html redirect | `GET /dashboard.html` | 302 → /dashboard |
| 3.10 | Old command-center.html redirect | `GET /command-center.html` | 302 → /dashboard |

### Section 4: Agent API
| ID | Test | API | Expected |
|----|------|-----|----------|
| 4.1 | Get agent info | `GET /api/get-agent?agentId={id}` | 200, agent object |
| 4.2 | Get agent by session | `GET /api/get-agent?session_id={sid}` | 200, agent object |
| 4.3 | Agent info endpoint | `GET /api/agent-info?agentId={id}` | 200, agent details |
| 4.4 | Agent memory (empty) | `GET /api/agent-memory?agentId={id}` | 200, array |
| 4.5 | Update agent | `POST /api/update-agent` | 200, success |
| 4.6 | Data opt-out | `POST /api/agent/{id}/data-opt-out` | 200, success |
| 4.7 | Invalid agent ID | `GET /api/get-agent?agentId=invalid` | 404 |

### Section 5: Chat / Swarm (Core Feature)
| ID | Test | API | Expected |
|----|------|-----|----------|
| 5.1 | Basic chat | `POST /api/swarm` | 200, `{response, routing}` |
| 5.2 | Chat with conversationId | `POST /api/swarm` (with convId) | 200, response |
| 5.3 | Chat stores history | `GET /api/agent-memory` after chat | History contains messages |
| 5.4 | Swarm status | `GET /api/swarm/status` | 200, agent statuses |
| 5.5 | Swarm routing log | `GET /api/swarm/routing-log` | 200, array |
| 5.6 | Multi-turn conversation | 3x `POST /api/swarm` same convId | Context maintained |
| 5.7 | Empty message | `POST /api/swarm` (empty) | 400 |
| 5.8 | Missing agentId | `POST /api/swarm` (no agentId) | 400/404 |

### Section 6: MCP (Model Context Protocol)
| ID | Test | API | Expected |
|----|------|-----|----------|
| 6.1 | List templates | `GET /api/mcp/templates` | 200, 5 templates |
| 6.2 | List servers (empty) | `GET /api/mcp/servers/{agentId}` | 200, empty array |
| 6.3 | List tools (empty) | `GET /api/mcp/servers/{agentId}/tools` | 200, empty array |
| 6.4 | Create MCP server | `POST /api/mcp/servers` | 200/201, server object |
| 6.5 | Connect MCP server | `POST /api/mcp/servers/{agentId}/{name}/connect` | 200, connected |
| 6.6 | Test MCP connection | `POST /api/mcp/servers/{agentId}/{name}/test` | 200, test result |
| 6.7 | List tools (after connect) | `GET /api/mcp/servers/{agentId}/tools` | 200, tools array |
| 6.8 | Call MCP tool | `POST /api/mcp/servers/{agentId}/{name}/call` | 200, tool result |
| 6.9 | Disconnect server | `POST /api/mcp/servers/{agentId}/{name}/disconnect` | 200 |
| 6.10 | Delete MCP server | `DELETE /api/mcp/servers/{agentId}/{name}` | 200 |
| 6.11 | MCP tools in chat | `POST /api/swarm` (agent with MCP) | Tools available in prompt |

### Section 7: Channels (Omnichannel)
| ID | Test | API | Expected |
|----|------|-----|----------|
| 7.1 | Channels page loads | `GET /channels.html` (auth) | 200 |
| 7.2 | Twilio webhook (SMS) | `POST /api/twilio/webhook` | 200, TwiML |
| 7.3 | Slack webhook | `POST /api/slack/events` | 200 (challenge) |
| 7.4 | Channel status | `GET /api/channels/status` | 200, channel states |

### Section 8: Credits & Billing
| ID | Test | API | Expected |
|----|------|-----|----------|
| 8.1 | Credit status | `GET /api/credits/status/{agentId}` | 200, token/credit balances |
| 8.2 | Credit transactions | `GET /api/credits/transactions/{agentId}` | 200, array |
| 8.3 | Credit packs | `GET /api/credits/packs` | 200, pack list |
| 8.4 | Deduct outcome credit | `POST /api/credits/deduct-outcome` | 200, new balance |
| 8.5 | Token usage recorded | `GET /api/observe/usage/{agentId}` | 200, usage data |

### Section 9: Observability
| ID | Test | API | Expected |
|----|------|-----|----------|
| 9.1 | Summary | `GET /api/observe/summary` | 200, overview stats |
| 9.2 | Traces | `GET /api/observe/traces/{agentId}` | 200, trace array |
| 9.3 | Usage | `GET /api/observe/usage/{agentId}` | 200, usage stats |
| 9.4 | RAG scores | `GET /api/observe/rag-scores/{agentId}` | 200, scores |
| 9.5 | Intent distribution | `GET /api/observe/intent-distribution/{agentId}` | 200, distribution |

### Section 10: Optimization
| ID | Test | API | Expected |
|----|------|-----|----------|
| 10.1 | Pending proposals | `GET /api/optimization/pending` | 200, array |
| 10.2 | History | `GET /api/optimization/history/{agentId}` | 200, array |
| 10.3 | Run optimization | `POST /api/optimization/run` | 200, proposals created |
| 10.4 | Approve proposal | `POST /api/optimization/{id}/approve` | 200 |
| 10.5 | Reject proposal | `POST /api/optimization/{id}/reject` | 200 |

### Section 11: Admin
| ID | Test | API | Expected |
|----|------|-----|----------|
| 11.1 | Overview | `GET /api/admin/overview` | 200, stats |
| 11.2 | Agents list | `GET /api/admin/agents` | 200, agent list |
| 11.3 | Agent detail | `GET /api/admin/agents/{id}` | 200, agent detail |
| 11.4 | Update tier | `POST /api/admin/agents/{id}/tier` | 200, tier updated |
| 11.5 | Daily stats | `GET /api/admin/daily-stats` | 200, daily data |
| 11.6 | Plans | `GET /api/admin/plans` | 200, plan list |
| 11.7 | System info | `GET /api/admin/system` | 200, system stats |

### Section 12: Documents / RAG
| ID | Test | API | Expected |
|----|------|-----|----------|
| 12.1 | Upload document | `POST /api/documents/upload` | 200, doc ID |
| 12.2 | List documents | `GET /api/documents` | 200, doc list |
| 12.3 | Delete document | `DELETE /api/documents/{id}` | 200 |
| 12.4 | RAG context in chat | `POST /api/swarm` (after upload) | Context included |

### Section 13: Checkout / Stripe
| ID | Test | API | Expected |
|----|------|-----|----------|
| 13.1 | Create checkout session | `POST /create-checkout-session` | 200, session URL |
| 13.2 | Webhook signature verify | `POST /webhook` (Stripe sig) | 200 or 400 |
| 13.3 | Success page | `GET /success.html` | 200 |

### Section 14: Security
| ID | Test | API | Expected |
|----|------|-----|----------|
| 14.1 | SQL injection attempt | `GET /api/get-agent?agentId=' OR 1=1--` | 400/404 |
| 14.2 | XSS in chat | `POST /api/swarm` (script tag) | Sanitized response |
| 14.3 | Auth bypass | `GET /dashboard` (no cookie) | 302 → /login |
| 14.4 | API key auth | `GET /api/credits/status/{id}` (API key) | 200 |
| 14.5 | CORS headers | `OPTIONS /api/swarm` | Proper CORS |

---

## Running the Test

```bash
# Run all tests for all 5 accounts simultaneously:
node backend/test-runner.js

# Run for a specific account:
node backend/test-runner.js --account=beta-alpha@maikr.pro

# Run a specific section:
node backend/test-runner.js --section=5

# Output format:
node backend/test-runner.js --format=json
```

## Expected Results
- All 5 accounts should pass all sections
- Total: ~70+ test cases per account
- Full run should complete in < 5 minutes
- Zero failures expected on a healthy system
