# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15 frontend for the Lost Ark Achievement Checklist application. Korean language UI targeting Korean players. Part of a two-project monorepo (backend is `loa-cloud-api/` at the sibling directory level).

## Commands

```bash
npm run dev      # Dev server with Turbopack (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

**Tech stack:** Next.js 15, React 19, TanStack React Query 5, Tailwind CSS 4, Lucide React icons

**Data flow:**
1. Achievements fetched via `/api/achievements` (cached 1hr client-side, 1hr server-side)
2. User progress fetched via `/api/user-progress?nickname={n}` (cached 5min)
3. Toggles queued locally in a Map, batch-saved after 3s debounce to `/api/user-progress/batch`
4. LocalStorage backup (`pending_updates_{nickname}`) for recovery on page unload

**API proxy:** `next.config.mjs` rewrites `/api/*` to backend (`http://localhost:8787` in dev, production URL otherwise)

## Key Files

| File | Purpose |
|------|---------|
| `src/app/page.jsx` | Main checklist page - nickname input, search/filter, achievement toggling |
| `src/app/ship-calculator/page.jsx` | Ship upgrade calculator - resource requirements, currency costs |
| `src/app/ship-calculator/shipData.js` | Ship data (8 ships, upgrade levels, resources, currencies) |
| `src/hooks/useSupabaseQueries.js` | React Query hooks: `useAchievements()`, `useUserProgress()`, `useBatchUpdateProgress()` |
| `src/app/QueryClientWrapper.jsx` | TanStack Query provider with staleTime/cacheTime config |
| `src/components/ui/` | Reusable components: Button, Card, Checkbox |
| `next.config.mjs` | API rewrites for dev/prod routing |

## Development Patterns

**Client components:** Pages with interactivity use `'use client'` directive at top

**React Query caching:**
- Achievements: `staleTime: 60min`, `cacheTime: 120min`
- User progress: `staleTime: 5min`, `cacheTime: 10min`

**Batch update flow:**
```javascript
// Changes queued in pendingUpdates Map
pendingUpdates.set(achievementId, { achievementId, isCompleted });
// Debounced save after 3 seconds
// On page unload: saved to localStorage for recovery
```

**LocalStorage keys:**
- `checklist_nickname` - Current player nickname
- `pending_updates_{nickname}` - Unsaved batch updates
- `ship_calculator_*` - Ship calculator state

## Environment Variables

`.env.local`:
```
NEXT_PUBLIC_API_URL=https://loa-cloud-api.dbzos321.workers.dev
```

## Korean Terminology

- 업적 (achievement), 닉네임 (nickname), 체크리스트 (checklist)
- 선박 (ship), 자원 (resource), 재화 (currency)

## Git Conventions

Commit prefixes: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
