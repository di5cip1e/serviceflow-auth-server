# Lessons: April 24, 2026

## Key Learnings

### 1. Template Literal Nesting (Important!)
**Issue:** Generating TypeScript code inside template literals caused syntax errors when using `${}` for both outer and inner templates.

**Fix:** Use runtime variables in generated code (from config.ts) instead of trying to embed all logic at generation time.

**Code:** `src/app/api/agent/generate-realtime/route.ts`

---

### 2. Directory Creation Order
**Issue:** Writing files to `web-app/src/app/page.tsx` failed because parent directories didn't exist yet.

**Fix:** Always use `fs.mkdirSync(path, { recursive: true })` before writing files.

**Code:** `src/app/api/agent/generate-realtime/route.ts` line 358-361

---

### 3. Multi-VPS Business Model
**Issue:** Derek asked about selling/hosting AI agents as a business.

**Solution:** 
- Current VPS = Builder dashboard
- New VPS = Agent hosting farm
- Charge $49-499/mo hosting + setup fees

**Action:** Documented business model for future reference.

---

### 4. PM2 for Dashboard
**Issue:** Dashboard needed to run persistently.

**Solution:** Use `pm2 start npm --name agent-builder -- start` keeps Next.js alive reliably.

---

## What to Do Differently
- Always test file generation with actual directory writes before claiming success
- Check error logs at `/root/.pm2/logs/agent-builder-error.log` when issues arise
- Use simpler generated code (load from config) to avoid template literal nesting issues