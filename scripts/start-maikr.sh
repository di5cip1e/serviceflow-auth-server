#!/bin/bash
cd /root/.openclaw/workspace/agent-saas/backend
NODE_ENV=production pm2 startOrRestart ecosystem.config.js 2>/dev/null || \
(pm2 start server.js --name maikr-backend -- max-ports 1 && \
 pm2 start ollama-router.js --name ollama-router && \
 pm2 save)
