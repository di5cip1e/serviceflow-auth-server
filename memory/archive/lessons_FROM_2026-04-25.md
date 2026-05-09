# Lessons: April 25, 2026

## Key Learnings

### 1. Template Literal Nesting (Critical Fix)
**Issue:** Generating TypeScript code inside template literals failed when using `${}` for both outer and inner templates.

**Fix:** Use runtime variables in generated code (load from config.ts) instead of embedding all logic at generation time.

**Code:** `src/app/api/agent/generate-realtime/route.ts`

---

### 2. Directory Creation Before File Writes
**Issue:** Writing files to nested paths like `web-app/src/app/page.tsx` failed because parent directories didn't exist.

**Fix:** Always use `fs.mkdirSync(path, { recursive: true })` before writing any files.

**Code:** Line 358-366 in generate-realtime/route.ts

---

### 3. Clean Up Before Re-generation
**Issue:** EEXIST error when regenerating an agent that already exists.

**Fix:** Clean up existing agent directory at start of generation:
```javascript
if (fs.existsSync(agentDir)) {
  fs.rmSync(agentDir, { recursive: true, force: true });
}
```

---

### 4. Multi-VPS Business Model Architecture
**Insight:** Derek asked about selling AI agents as a business.

**Solution:** 
- Current VPS: Builder dashboard (where clients create agents)
- New VPS: Agent hosting farm (run client agents)
- Revenue: $49-499/mo hosting + $500-2000 one-time setup

**Scripts created:**
- `scripts/deployment/deploy.sh` - SSH-based deployment
- `scripts/deployment/setup-ssh.sh` - SSH key setup
- `scripts/deployment/nginx-agent-farm.conf` - Nginx for multi-agent hosting

---

### 5. PM2 Keeps Next.js Alive
**Insight:** Dashboard needs persistent process management.

**Solution:** Use `pm2 start npm --name agent-builder -- start` for reliable uptime.

---

## What to Do Differently
- Test file generation with actual directory writes early
- Check error logs at `/root/.pm2/logs/agent-builder-error.log` when issues arise
- Use simpler generated code structure to avoid template literal issues