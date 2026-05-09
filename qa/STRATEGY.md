# QA Strategy - Station Command

## Philosophy

**"Verify before done, evidence-based testing."**

Every feature shipped needs proof it works—not hope it works. We test to find bugs, not to confirm everything is perfect. Evidence-based means:
- Tests must have measurable pass/fail criteria
- Bug reports need reproduction steps, not guesses
- Code review includes test coverage review

## Test Pyramid

```
        /\
       /  \      E2E (5-10%)
      /----\     Critical user journeys
     /      \
    /--------\  Integration (20-30%)
   /          \ API + database + state
  /------------\ Unit (60-70%)
 /              \ Pure functions, utilities
```

**Unit Tests (60-70%)**
- Utility functions, helpers, validation logic
- Zustand store actions and selectors
- Component rendering (isolated)

**Integration Tests (20-30%)**
- API route handlers with database
- Prisma queries and mutations
- Store + component integration

**E2E Tests (5-10%)**
- Critical user flows: registration → login → mission flow
- Browser automation for complex interactions

## When to Test

### During Development
1. **Write tests alongside code** - Test first or test concurrently
2. **Run unit tests locally** on every save (watch mode)
3. **Integration tests** before pushing

### Before Merge
- All unit tests passing
- All integration tests passing
- E2E smoke tests passing
- No new linting errors

### After Deployment (Manual)
- Smoke test production endpoints
- Verify critical user flows work

## Test Tools

| Layer | Tool | Rationale |
|-------|------|-----------|
| Unit | Vitest | Fast, modern, Jest-compatible |
| Component | React Testing Library | User-centric testing |
| E2E | Playwright | Reliable browser automation |
| API | Vitest + Supertest | Test Next.js API routes |

## Coverage Targets

- **Unit:** 80% line coverage on utils, stores
- **Integration:** All API routes covered
- **E2E:** Auth flow, mission lifecycle, NPC dialogue

## What NOT to Test

- Third-party APIs (mock them)
- CSS visual details (snapshot regression)
- Internal implementation details (test behavior)

## Bug Reporting Workflow

1. Reproduce with test case
2. File bug with template
3. Fix includes test regression
4. Verify fix passes

---
*Last updated: 2026-03-04*
