# ServiceFlow Auth Server
Authentication and subscription management API for ServiceFlow.

## Quick Deploy on Hostinger

1. **Create GitHub Repository**
   - Create a new repo (e.g., `serviceflow-auth`)
   - Push this code: `git remote add origin <your-repo>` then `git push -u origin main`

2. **Deploy on Hostinger**
   - Log into hPanel → Websites → Your Website → **Set up Node.js app**
   - Select **Import Git Repository**
   - Paste your GitHub repo URL
   - Node.js version: **18** or **20**
   - Application root: `/` or `serviceflow-auth`
   - Startup file: `server.js`
   - Install command: `npm install`

3. **Environment Variables**
   In Hostinger Node.js settings, add:
   ```
   PORT=3001
   JWT_SECRET=your-secure-random-string-min-32-chars
   ```

4. **Done!** Your API will be live at `https://your-domain.com:3001`

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | No | Create account |
| POST | /auth/login | No | Login, get JWT |
| GET | /subscription | Yes | Get plan & features |
| POST | /auth/device | No | Register device |
| POST | /subscription/create | Yes | Create subscription |
| POST | /subscription/cancel | Yes | Cancel subscription |
| GET | /health | No | Health check |

## Plans

- **free**: 10 customers, 50 jobs
- **basic**: 100 customers, 500 jobs, exports
- **premium**: Unlimited everything

## Usage in ServiceFlow App

```typescript
// Check subscription on app launch
const checkAuth = async () => {
  const deviceId = await getDeviceId();
  const res = await fetch('https://your-auth-domain.com/auth/device', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId })
  });
  const data = await res.json();
  if (!data.allowed) {
    // Show subscription screen
  }
};
```
