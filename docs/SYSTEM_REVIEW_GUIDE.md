# System Review Guide (IBS v5)

Audience: Senior software engineers and technical reviewers assessing architecture, code quality, and operational readiness of IBS v5.

## 1. Executive Summary
- Product: Real-time airline operations dashboard.
- Frontend: Next.js 15 (React 18, TypeScript, Tailwind).
- Backend: Express.js + MongoDB (in `data-services/`).
- Key differentiators: Multi-screen window management with slot-based layouts, rich analytics, role-based access, modular UI.
- Overall assessment: Modern, modular, well-documented. Production-readiness depends on browser/extension path for multi-screen positioning and hardening of backend auth/caching.

## 2. Repository Layout
```
ibs_v5/
├─ app/                 # Next.js App Router pages and routes
├─ components/          # UI and feature components (Radix-based)
├─ hooks/               # Custom React hooks (incl. multi-screen)
├─ services/            # Frontend API clients
├─ lib/                 # Utilities (UUID, Mongo client helper, etc.)
├─ data-services/       # Backend API (Express, Mongoose models)
├─ extension/           # Chrome MV3 extension enabling precise window placement
├─ docs/                # Documentation (features, behavior, troubleshooting, history)
├─ public/              # Static assets
├─ styles/              # Global styles (Tailwind)
└─ README.md
```

## 3. Architecture Overview
- Frontend SPA/SSR via Next.js; component-driven with Tailwind and Radix primitives.
- Backend API exposes flight/alerts/metrics endpoints; JWT auth; MongoDB persistence.
- Extension (optional) enhances multi-screen precision via Chrome windows/system.display APIs.
- Communication patterns: fetch-based REST, `window.postMessage` for cross-window comms.

### High-Level Diagram
```
Browser (Next.js app) ── REST ──> Express API ──> MongoDB
           │                                  
           ├─ window.open/moveTo ────┐        
           └─ postMessage <──────────┴─ Detailed windows
           
Optional: Chrome Extension for screen enumeration and precise placement
```

### Architecture Decisions (ADRs)
- Next.js App Router for file-based routing and SSR where needed.
- Client-heavy UX with hooks; server kept simple REST to ease ops.
- Multi-screen via progressive enhancement: Web API path first, Extension path for precision.
- LocalStorage used for non-sensitive preferences (layout/slots), JWT for auth-protected APIs.

## 4. Code Quality Review
- TypeScript usage: Strong typing for hooks/components; avoid `any`; interfaces defined per feature.
- Naming & structure: Clear verbs for functions, nouns for models/components; modular hooks (`use-multi-screen*`).
- Error handling: Try/catch around network and window operations; logs are actionable.
- Comments & docs: Extensive docs in `docs/` and inline where non-obvious.
- Opportunities:
  - Add stricter TS config: enable `noUncheckedIndexedAccess`.
  - Centralize API response types in `services/api.ts`.
  - Consider ESLint rules for imports and complexity thresholds.

## 5. Dependency & Tooling Snapshot
- Frontend: Next.js 15, React 18, TypeScript 5, Tailwind 3.4, Radix primitives, Lucide icons.
- Backend: Express, Mongoose, bcrypt/jwt.
- Build: Next built-in; PostCSS.
- Extension: Chrome MV3 APIs (`windows`, `system.display`).
- Suggested upgrades:
  - Lock versions in `package.json` ranges for reproducibility.
  - Add `npm run type-check` script if missing.

## 6. API Inventory (Backend)
- Auth:
  - `POST /api/login` → JWT
  - `GET /api/verify` → token validity
- Screens (multi-screen mgmt):
  - `POST /api/screens/link` → persist screen geometry
  - `POST /api/screens/role` → assign general/detailed
  - `GET /api/screens/session/:sessionId`
  - `GET /api/screens/device/:deviceId/session/:sessionId`
- Flights, Alerts, Metrics: standard CRUD/read endpoints (see README examples).

Notes:
- All screen endpoints require JWT; ensure middleware coverage.
- Add input validation (e.g., zod/joi) to harden.

## 7. Data Models (Indicative)
- Screens collection: sessionId, deviceId, screenId, left, top, width, height, role, timestamps.
- Flights/Alerts/Metrics: see README schemas. Ensure proper indexes on frequently queried fields.

## 8. Multi-Screen Feature (Core Differentiator)
- Hooks:
  - `hooks/use-multi-screen.ts` (primary)
  - `hooks/use-multi-screen-fixed.ts` (enhanced detection/placement)
  - `hooks/use-multi-screen-extension.ts` (extension path)
- Roles: `general` vs `detailed` screen.
- Layouts: grid/rows/columns; prefs in localStorage (`ms_layout`, `ms_totalSlots`, `ms_paddingPx`, `ms_nextSlotIndex`).
- API:
```ts
await popOutDetailedView('alerts', undefined, {
  layout: 'grid', totalSlots: 4, paddingPx: 16
  // slotIndex optional (auto-cycles); explicitRect optional override
})
```
- Extension honors `{ left, top, width, height }` for precise placement.
- Debug: `MultiScreenDebug`, `MultiScreenTest` for manual verification.

Risks:
- Firefox/Safari limited APIs; fallbacks approximate.
- Popup blockers can prevent window creation; communicate clearly in UI.

## 9. Security Review
- JWT-based auth, stored in localStorage; consider httpOnly cookies for production.
- Screen geometry data is non-sensitive but linkable to device/session; avoid leaking beyond scope.
- CORS enabled; verify origin restrictions for production.
- Extension permissions: `windows`, `system.display`, `storage`; scope to required host matches.
- Recommendations:
  - Add rate limiting and input validation for screen endpoints.
  - Rotate JWT secrets and enforce token expiry.

## 10. Performance Review
- Frontend: Memoization of heavy hooks, lazy loading of debug tooling.
- Backend: Simple REST; ensure indexes for screens, flights, alerts.
- Multi-screen: compute-light; retries for window positioning spaced with timeouts.
- Recommendations:
  - Cache screen roles per device/session (client + server) to reduce calls.
  - Measure bundle size; code-split large components.

## 11. Testing Strategy
- Manual: Use debug/test components to validate positioning and layout slotting.
- Unit (suggested):
  - Layout rectangle calculation for various totalSlots/layouts.
  - Screen matching logic with different ID formats.
- Integration:
  - `screens/role` and `screens/link` endpoints with auth middleware.
- E2E (best-effort):
  - Playwright flows for pop-out, verify postMessage handling.

## 12. Build, Run, Deploy
- Dev:
  - Frontend: `npm run dev` (3000)
  - Backend: `cd data-services && npm start` (3001)
  - Seed: `npm run seed`
- Prod:
  - Frontend: `npm run build && npm start`
  - Backend: process manager (PM2/systemd), env secrets, logging.
- Extension:
  - Load unpacked in Chrome; verify permissions; observe console logs.

## 13. Observability & Debugging
- Console logs around detection, role assignment, pop-out flows.
- Position verification: logs expected vs actual window coordinates.
- Add structured logging and correlation IDs on backend in future.

## 14. Risks & Mitigations
- Browser API variance → Provide extension path + graceful fallbacks.
- Popup blockers → UX prompts/testing tools to guide enabling.
- Backend dependency (roles) → Cache locally, offline-friendly UI messages.
- Future scaling → Extract screen role service, add Redis cache if needed.

## 15. Roadmap (Suggested)
- Cross-browser support improvements; permissions prompts for Window Placement API.
- Workspace presets and restore last layout.
- Centralized settings UI for layout/roles.
- Telemetry: success rate of window placement by browser/OS.
- Automated CI: unit/integration test suites.

## 16. Reviewer Checklist
- Architecture separation and correctness.
- Code quality: TypeScript strictness, linting, naming, error handling.
- Security posture: JWT handling, CORS, input validation, extension perms.
- Multi-screen reliability across browsers; extension behavior validated.
- Operational readiness: `.env` configs, seeding, start scripts, logs.

## 17. Quick File Index
- Frontend entry: `app/dashboard/page.tsx`
- Multi-screen hooks: `hooks/use-multi-screen*.ts`
- Debug tools: `components/multi-screen-debug.tsx`, `components/multi-screen-test.tsx`
- Backend: `data-services/index.js`, `data-services/models.js`
- Extension: `extension/manifest.json`, `extension/background.js`, `extension/content-script.js`, `extension/injected-script.js`
- Docs: `docs/MULTI_SCREEN_*.md`, `docs/SYSTEM_REVIEW_GUIDE.md`

## 18. References
- README.md (root)
- docs/MULTI_SCREEN_FEATURE.md, docs/MULTI_SCREEN_BEHAVIOR.md, docs/MULTI_SCREEN_TROUBLESHOOTING.md, docs/MULTI_SCREEN_HISTORY.md
- data-services/ (API & models)
- extension/ (MV3 extension)
