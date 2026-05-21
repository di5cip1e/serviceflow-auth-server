# Onboarding Wizard — Design Specification

> Based on SaaS best practices + M.ai.K.R architecture

## User Flow

```
Pay → Success Page → "Let's Set Up Your Agent" → Wizard Step 1 → 2 → 3 → 4 → 5 → Dashboard
```

## Steps

### Step 1: Welcome & Overview
- Big congratulations animation/confetti
- "Your agent [AgentName] is being created..."
- Animated progress bar showing provisioning status
- Auto-advance when agent is ready (poll /api/get-agent)

### Step 2: Connect a Channel
- Options: Telegram, Slack, WhatsApp, SMS, Web Chat
- Show connection instructions for each
- Web Chat is always available (instant)
- Others require webhook setup
- "Skip for now" button

### Step 3: Test Your Agent
- Embedded chat widget
- Pre-filled: "Hi, introduce yourself!"
- Show typing indicator + agent response
- "Looks good!" button to continue

### Step 4: Find Your First Leads Button
- Show the Lead Generation feature
- "Find your first leads" button (if Growth+)
- Or "Upgrade to unlock leads" (if Value)
- Auto-runs lead search, shows results after

### Step 5: You're Live! Dashboard
- Celebration screen
- Summary: Agent created, Channel connected, Leads found
- "Go to Dashboard" CTA
- Optional: Share on social media

## Technical Design

### New Files:
- `frontend/onboarding-wizard.html` — Full wizard SPA
- `backend/routes/onboarding.js` — Status & step tracking API
- `backend/services/onboardingService.js` — Step progression logic

### Modified Files:
- `frontend/success.html` — Add "Start Setup" button linking to wizard
- `backend/routes/webhook.js` — WebSocket for real-time provisioning status

### API Endpoints:
- `GET /api/onboarding/:agentId/status` — Get current step & completion status
- `POST /api/onboarding/:agentId/step/:stepId/complete` — Mark step complete
- `GET /api/onboarding/:agentId/provisioning` — Poll provisioning progress

## UI Design
- Full-screen overlay wizard (not a separate page)
- Progress bar at top (5 steps, circular indicators)
- Dark theme matching dark-premium.css
- Smooth transitions between steps (CSS animations)
- Mobile responsive (stackable cards)
- Confetti animation on completion

## State Management
- Store progress in localStorage (survive refresh)
- Sync with backend on each step completion
- Allow going back to previous steps
- Auto-save at each step
