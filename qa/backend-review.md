# Backend Code Review Report

## Summary
Reviewed 4 files in the Station Command backend for bugs, security issues, and potential runtime errors.

---

## Issues Found

### 1. HIGH: Mission Schema - userId not optional but queried as nullable
**File:** `prisma/schema.prisma` (line 45-46)  
**Severity:** High

**Issue:** The `Mission` model has `userId String` (required), but the API query in `missions/route.ts` searches for missions with `userId: null`:

```typescript
// missions/route.ts line 29-31
{ status: 'AVAILABLE', userId: null }
```

This query will never match any records because `userId` is required in the schema. This is a logic bug - the "system mission" feature won't work.

**Suggested Fix:** In `schema.prisma`, make userId optional:
```prisma
userId      String?
```

---

### 2. MEDIUM: Missing zoneId validation
**File:** `missions/route.ts` (line 12)  
**Severity:** Medium

**Issue:** `zoneId` is defined as optional with `z.string().optional()` but there's no validation that the referenced zone actually exists when creating a mission. This could create missions with invalid zone references.

**Suggested Fix:** Add zone existence check before creating mission:
```typescript
if (data.zoneId) {
  const zoneExists = await prisma.zone.findUnique({
    where: { id: data.zoneId }
  })
  if (!zoneExists) {
    return NextResponse.json({ error: 'Invalid zoneId' }, { status: 400 })
  }
}
```

---

### 3. MEDIUM: Unsafe type assertion
**File:** `missions/route.ts` (lines 23, 56)  
**Severity:** Medium

**Issue:** Using `(session.user as any).id` bypasses TypeScript type safety. If the session structure changes, this will fail silently at runtime.

**Suggested Fix:** Properly type the session in auth options or use a type guard:
```typescript
interface SessionUser extends DefaultSession['user'] {
  id: string
}
```

---

### 4. LOW: No pagination on NPCs endpoint
**File:** `npcs/route.ts` (line 15-18)  
**Severity:** Low

**Issue:** `findMany()` returns all NPCs without pagination. Could cause performance issues at scale.

**Suggested Fix:** Add pagination parameters:
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')
  
  const npcs = await prisma.nPC.findMany({
    take: limit,
    skip: offset,
    orderBy: { name: 'asc' }
  })
  // ... return with pagination metadata
}
```

---

### 5. LOW: Register endpoint returns internal fields in error
**File:** `auth/register/route.ts` (line 39)  
**Severity:** Low

**Issue:** In the catch block, validation errors return `error.errors` which could leak internal field names to attackers.

**Suggested Fix:** Sanitize or map to user-friendly messages:
```typescript
return NextResponse.json(
  { error: 'Validation error', details: error.errors.map(e => e.message) },
  { status: 400 }
)
```

---

### 6. INFO: Mission query logic could return unintended results
**File:** `missions/route.ts` (lines 27-32)  
**Severity:** Low

**Issue:** The query `{ OR: [{ userId }, { status: 'AVAILABLE', userId: null }] }` will return ALL missions belonging to the user (including completed/failed), mixed with available system missions. This may be intentional but could confuse the frontend.

**Suggested Fix:** Consider filtering by status if you only want active missions:
```typescript
where: {
  OR: [
    { userId, status: { not: 'COMPLETED' } },
    { status: 'AVAILABLE', userId: null }
  ]
}
```

---

## Files Reviewed
| File | Issues |
|------|--------|
| `auth/register/route.ts` | 1 (Low) |
| `missions/route.ts` | 4 (1 High, 2 Medium, 1 Low/Info) |
| `npcs/route.ts` | 1 (Low) |
| `prisma/schema.prisma` | 1 (High) |

---

*Review generated: 2026-03-04*
