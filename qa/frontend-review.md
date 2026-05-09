# Frontend Code Review Report

## Summary
Reviewed 5 files in `/root/.openclaw/workspace/frontend/src/`. Found 7 issues across severity levels.

---

## Issues Found

### HIGH

**1. page.tsx - DialogueBox always renders null**
- **File:** `src/app/game/page.tsx` line 11
- **Issue:** `<DialogueBox />` is rendered without a `node` prop. The component returns `null` when `node` is null (DialogueBox.tsx line 88).
- **Fix:** Add state management to track current dialogue node:
  ```tsx
  const [currentDialogue, setCurrentDialogue] = useState<DialogueNode | null>(null);
  // ...
  <DialogueBox node={currentDialogue} onChoice={handleChoice} />
  ```

**2. page.tsx - Duplicate MiniMap rendering**
- **File:** `src/app/game/page.tsx` line 10
- **Issue:** `<MiniMap />` is rendered twice - once inside `HUD` component (HUD.tsx line 73) and once directly in the page. This causes UI duplication.
- **Fix:** Remove `<MiniMap />` from page.tsx since it's already included in HUD:
  ```tsx
  // Remove this line:
  <MiniMap />
  ```

**3. api.ts - No authentication token persistence**
- **File:** `src/lib/api.ts` lines 67-76
- **Issue:** After login, the token is returned but not stored or included in subsequent API requests. All authenticated endpoints will fail.
- **Fix:** Add token storage and include in headers:
  ```tsx
  const getToken = () => localStorage.getItem('auth_token');
  
  async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = getToken();
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options?.headers,
      },
      ...options,
    });
    // ...
  }
  ```

---

### MEDIUM

**4. api.ts - Duplicate type definitions**
- **File:** `src/lib/api.ts` lines 45-52
- **Issue:** `DialogueNode` and `DialogueChoice` interfaces are defined here AND in `DialogueBox.tsx` (lines 6-14). These can drift out of sync.
- **Fix:** Export types from one file and import in the other:
  ```tsx
  // DialogueBox.tsx - export types
  export type { DialogueNode, DialogueChoice };
  
  // api.ts - import instead of define
  import type { DialogueNode, DialogueChoice } from '@/components/dialogue/DialogueBox';
  ```

**5. DialogueBox.tsx - Callback in dependency array**
- **File:** `src/components/dialogue/DialogueBox.tsx` line 52
- **Issue:** `onComplete` is in the useEffect dependency array. If parent passes inline function, this causes effect to re-run on every render, resetting typing.
- **Fix:** Use useRef for stable callback or memoize in parent:
  ```tsx
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  
  useEffect(() => {
    // ... use onCompleteRef.current() instead
  }, [node, typingSpeed]);
  ```

**6. HUD.tsx - Hardcoded MiniMap coordinates**
- **File:** `src/components/ui/HUD.tsx` line 73
- **Issue:** MiniMap uses hardcoded `playerX={100} playerY={55}` instead of actual player position.
- **Fix:** Accept player position as props:
  ```tsx
  interface HUDProps {
    player?: PlayerStats;
    playerPosition?: { x: number; y: number };
    // ...
  }
  // Then use: <MiniMap playerX={playerPosition?.x ?? 100} ... />
  ```

---

### LOW

**7. page.tsx - No game state management**
- **File:** `src/app/game/page.tsx`
- **Issue:** Page has no state for player data, current mission, NPCs, or dialogue. HUD uses default props instead of real data.
- **Fix:** Add game state context or state management (React Context, Zustand, etc.) to provide player data to HUD and handle dialogue flow.

---

## Files Reviewed
| File | Issues |
|------|--------|
| `components/game/GameCanvas.tsx` | None |
| `components/dialogue/DialogueBox.tsx` | 1 medium |
| `components/ui/HUD.tsx` | 1 medium |
| `lib/api.ts` | 1 high, 1 medium |
| `app/game/page.tsx` | 3 high |
