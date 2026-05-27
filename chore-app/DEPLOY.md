# Deployment Guide — Chore Manager

## Prerequisites
- Ubuntu VPS (Hostinger or similar)
- Node.js 18+ installed
- nginx installed
- PM2 installed globally

## Step 1: Copy Project to VPS

```bash
# From your local machine or via git
scp -r ./chore-app root@YOUR_VPS_IP:/var/www/chore-app

# Or clone from a git repo
git clone YOUR_REPO_URL /var/www/chore-app
```

## Step 2: Install Dependencies

```bash
cd /var/www/chore-app
npm install
```

## Step 3: Set Up Environment Variables

Create `/var/www/chore-app/.env`:

```env
OPENAI_API_KEY=sk-your-key-here
```

## Step 4: Initialize Database

```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

## Step 5: Build for Production

```bash
npm run build
```

## Step 6: Start with PM2

```bash
# Install PM2 globally if not already
npm install -g pm2

# Start the Next.js app
pm2 start npm --name "chore-app" -- start

# Save PM2 process list
pm2 save

# Enable PM2 startup on reboot
pm2 startup systemd
```

### Useful PM2 Commands

```bash
pm2 status              # Check status
pm2 logs chore-app      # View logs
pm2 restart chore-app   # Restart
pm2 stop chore-app      # Stop
pm2 delete chore-app    # Remove from PM2
```

## Step 7: Configure Nginx Reverse Proxy

Create `/etc/nginx/sites-available/chore-app`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Proxy to Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/chore-app /etc/nginx/sites-enabled/
nginx -t              # Test config
systemctl reload nginx
```

## Step 8: SSL with Let's Encrypt (Recommended)

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

## Updating the App

```bash
cd /var/www/chore-app
git pull              # or copy new files
npm install           # if deps changed
npx prisma migrate deploy  # if schema changed
npm run build
pm2 restart chore-app
```

## Architecture Summary

| Component | Port | Managed By |
|-----------|------|------------|
| Next.js App | 3000 | PM2 |
| Nginx | 80/443 | systemd |
| SQLite DB | filesystem | Prisma |
