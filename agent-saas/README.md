# Agent SaaS Platform

## Project Structure
```
agent-saas/
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── checkout.js
│   │   └── webhook.js
│   └── services/
│       └── fastgpt.js
└── package.json
```

## Terminal Setup Commands
```bash
cd /root/.openclaw/workspace/agent-saas/backend
npm init -y
npm install express stripe axios cors dotenv
```

## Quick Start
```bash
# Backend
cd backend
node server.js

# Frontend (serve with any static server)
# Or copy frontend/* to your VPS public folder
```

## Environment Variables
Create `.env` in backend:
```
STRIPE_SECRET_KEY=sk_test_...
FASTGPT_API_KEY=...
FASTGPT_BASE_URL=https://your-sealos.cloud
PORT=3000
```