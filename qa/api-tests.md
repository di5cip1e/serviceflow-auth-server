# API Test Cases - Station Command

## Auth Endpoints

### POST /auth/register

| Test Case | Input | Expected | Edge Case |
|-----------|-------|----------|-----------|
| Valid registration | `{email, username, password}` | 201 + user object | - |
| Missing email | `{username, password}` | 400 validation error | - |
| Missing username | `{email, password}` | 400 validation error | - |
| Missing password | `{email, username}` | 400 validation error | - |
| Invalid email format | `{email: "notemail", ...}` | 400 validation error | - |
| Username too short | `{username: "ab", ...}` | 400 validation error | min 3 chars |
| Username too long | `{username: "abcdefghijklmnopqrstu", ...}` | 400 validation error | max 20 chars |
| Password too short | `{password: "short"}` | 400 validation error | min 8 chars |
| Duplicate email | existing email | 400 error | - |
| Duplicate username | existing username | 400 error | - |
| Empty request body | `{}` | 400 validation error | - |

### POST /auth/login

| Test Case | Input | Expected | Edge Case |
|-----------|-------|----------|-----------|
| Valid login | `{email, password}` | 200 + JWT token | - |
| Wrong password | valid email, wrong password | 401 unauthorized | - |
| Non-existent user | fake email | 401 unauthorized | - |
| Missing email | `{password}` | 400 validation error | - |
| Missing password | `{email}` | 400 validation error | - |
| Empty request | `{}` | 400 validation error | - |

---

## User Endpoints

### GET /users/me

| Test Case | Auth | Expected |
|-----------|------|----------|
| Valid token | Bearer JWT | 200 + user profile |
| No token | - | 401 unauthorized |
| Invalid/expired token | Bearer invalid | 401 unauthorized |

### PATCH /users/me

| Test Case | Input | Expected |
|-----------|-------|----------|
| Update username | `{username: "newname"}` | 200 + updated user |
| Update bio | `{bio: "new bio"}` | 200 + updated user |
| Update avatar | `{avatar: "url"}` | 200 + updated user |
| Update multiple fields | `{username, bio, avatar}` | 200 + all fields |
| Empty update | `{}` | 200 (no changes) |
| Duplicate username | existing username | 400 error |

---

## Mission Endpoints

### GET /missions

| Test Case | Auth | Expected |
|-----------|------|----------|
| List missions | Bearer JWT | 200 + mission array |
| No token | - | 401 unauthorized |

### POST /missions

| Test Case | Input | Expected |
|-----------|-------|----------|
| Create valid mission | `{title, description, type, difficulty}` | 201 + mission object |
| All mission types | `type: "surveillance"`, `"logistics"`, `"repair"`, `"exploration"`, `"crisis"` | 201 each |
| Valid difficulty range | `difficulty: 1-5` | 201 |
| Difficulty too low | `difficulty: 0` | 400 |
| Difficulty too high | `difficulty: 6` | 400 |
| Missing title | `{description, type, difficulty}` | 400 |
| Missing description | `{title, type, difficulty}` | 400 |
| Missing type | `{title, description, difficulty}` | 400 |
| Missing difficulty | `{title, description, type}` | 400 |
| Invalid type | `type: "invalid"` | 400 |

### GET /missions/:id

| Test Case | Auth | Expected |
|-----------|------|----------|
| Valid mission ID | Bearer JWT | 200 + mission object |
| Non-existent ID | valid UUID | 404 not found |
| Invalid ID format | "not-a-uuid" | 400 |

### PATCH /missions/:id

| Test Case | Input | Expected |
|-----------|-------|----------|
| Update mission fields | `{title: "new"}` | 200 + updated mission |
| Update status | `{status: "IN_PROGRESS"}` | 200 |
| Update non-owned mission | - | 403 or 404 |

### POST /missions/:id/start

| Test Case | Expected |
|-----------|----------|
| Start available mission | 200 + mission with `status: IN_PROGRESS`, `startTime` set |
| Start already active mission | 400 error |
| Start completed mission | 400 error |
| Non-existent mission | 404 |

### POST /missions/:id/complete

| Test Case | Expected |
|-----------|----------|
| Complete in-progress mission | 200 + `status: COMPLETED`, `endTime` set, rewards in response |
| Complete non-started mission | 400 error |
| Already completed mission | 400 error |

---

## NPC Endpoints

### GET /npcs

| Test Case | Expected |
|-----------|----------|
| List all NPCs | 200 + NPC array with `id`, `name`, `role`, `zoneId`, `positionX`, `positionY`, `spriteKey` |

### GET /npcs/:id

| Test Case | Expected |
|-----------|----------|
| Valid NPC | 200 + full NPC with `dialogueTree`, `gifts`, `schedule` |
| Non-existent NPC | 404 |

### POST /npcs/:id/dialogue

| Test Case | Input | Expected |
|-----------|-------|----------|
| Advance dialogue | `{choiceIndex: 0}` | 200 + next dialogue node |
| Invalid choice index | `{choiceIndex: 999}` | 400 or 200 with error in response |
| Non-existent NPC | - | 404 |

---

## Asset & Achievement Endpoints

### GET /assets

| Test Case | Expected |
|-----------|----------|
| List assets | 200 + asset array |

### GET /achievements

| Test Case | Expected |
|-----------|----------|
| List all achievements | 200 + achievement array |

### GET /achievements/user

| Test Case | Expected |
|-----------|----------|
| Get user achievements | 200 + array of user's unlocked achievements with `unlockedAt` |

---

## Integration Scenarios

### Full Mission Lifecycle

```
1. POST /auth/login → get JWT
2. POST /missions (create) → get mission ID
3. GET /missions/:id (verify available)
4. POST /missions/:id/start → status = IN_PROGRESS
5. POST /missions/:id/complete → status = COMPLETED
6. GET /achievements/user → verify new achievements
```

### Dialogue Flow

```
1. GET /npcs/:id → get initial dialogue
2. POST /npcs/:id/dialogue {choiceIndex: 0} → get response
3. POST /npcs/:id/dialogue {choiceIndex: 1} → continue or end
```

---

## Test Data Fixtures

Create test users and missions in `__fixtures__/`:

- `test-user.json` - Standard test account
- `test-missions.json` - One of each type/difficulty

Use database seeding or API calls to set up test state.
