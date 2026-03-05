# Station Command - Security Checklist

## Gateway Configuration

| Setting | Value | Rationale |
|---------|-------|-----------|
| `gateway.bind` | `loopback` | Bind to localhost only - prevents external access |
| `gateway.auth.mode` | `token` | Require authentication for all API calls |
| `gateway.expose` | `false` | Do not expose to public internet |

## Network Security

- [ ] **No public exposure** - Gateway binds to loopback (127.0.0.1)
- [ ] **Tailscale Serve only** - If remote access needed, use tailnet-only
- [ ] **Firewall rules** - Block inbound ports except established connections
- [ ] **No Tailscale Funnel** - Never expose to public internet

## Authentication

- [ ] **NEXTAUTH_SECRET** - Generated with `openssl rand -base64 32`
- [ ] **NEXTAUTH_URL** - Set correctly for production (not localhost)
- [ ] **Token-based auth** - All endpoints require valid tokens

## Database Security

- [ ] **Strong passwords** - PostgreSQL password is not default/dev_password
- [ ] **SSL/TLS** - Database connections use SSL in production
- [ ] **Least privilege** - App uses dedicated DB user with minimal permissions
- [ ] **No public DB** - Database is not exposed to internet

## Environment Variables

- [ ] **.env not committed** - Never commit `.env` to git
- [ ] **Secrets in vault** - Use Vercel/Railway secrets, not plain text
- [ ] **.env.example** - Only contains placeholder values, no real secrets

## Application Security

- [ ] **Output: standalone** - Next.js builds to standalone mode
- [ ] **No sensitive logs** - Don't log secrets or credentials
- [ ] **Input validation** - All user input is validated/sanitized
- [ ] **CORS configured** - Only allow trusted origins

## Docker Security

- [ ] **Non-root user** - Container runs as `nextjs` user (UID 1001)
- [ ] **Minimal base image** - Using `node:18-alpine` (small footprint)
- [ ] **No secrets in image** - Build args don't contain sensitive data
- [ ] **Health checks** - Container has health check defined

## Deployment Security

- [ ] **Vercel secrets** - All env vars set in Vercel dashboard
- [ ] **Railway secrets** - All env vars set in Railway variables
- [ ] **No debug mode** - `NODE_ENV=production` in deployed apps
- [ ] **HTTPS only** - Force HTTPS in production

## Monitoring

- [ ] **Log monitoring** - Set up alerts for errors
- [ ] **Uptime checks** - Monitor service availability
- [ ] **Audit logs** - Review access logs periodically

## Quick Security Commands

```bash
# Generate secure secret
openssl rand -base64 32

# Check open ports (should only show loopback)
netstat -tlnp | grep LISTEN

# Verify no .env in git
git status | grep .env
```

---

## Incident Response

If you suspect a security issue:

1. **Don't panic** - Assess the situation calmly
2. **Contain** - Disable the affected service if needed
3. **Document** - Note what happened, when, and what data might be affected
4. **Report** - Alert the team immediately
5. **Recover** - Restore from backups if necessary
6. **Learn** - Update this checklist to prevent recurrence

## Contact

For security concerns, contact the infrastructure team immediately.
Do not discuss potential vulnerabilities in public channels.
