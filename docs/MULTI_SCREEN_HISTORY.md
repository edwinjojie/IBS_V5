# Multi-Screen Feature History (Changelog)

## 2025-09-22
- Added slot-based window layouts with persistent preferences.
  - New layout options: grid, rows, columns; supports custom explicit rects.
  - Preferences stored in localStorage: `ms_layout`, `ms_totalSlots`, `ms_paddingPx`, `ms_nextSlotIndex`.
  - `useMultiScreen.popOutDetailedView(type, id, layoutOptions)` now accepts layout parameters.
- Updated Role Assignment UI to include layout controls and persistence.
- Extension `background.js` updated to honor explicit `left/top/width/height` options for precise placement.
- Docs updated: Feature, Behavior, Bug Fixes, Troubleshooting.

## 2025-09-21
- Fixed critical issues in multi-screen handling (see Bug Fixes doc):
  - Screen ID matching across backend/web.
  - Current screen detection via coordinates.
  - Correct fallback dimensions using `window.screen`.
  - Robust window positioning (feature string + moveTo/resizeTo retries) and verification logs.
- Added enhanced debug tools: `MultiScreenDebug`, `MultiScreenTest`.

## 2025-09-18
- Initial multi-screen implementation:
  - Detection via `getScreenDetails()` with basic fallback.
  - Role assignment backend endpoints and local state.
  - Basic pop-out detailed views with centered positioning on secondary screen.

## Notes
- Browser support: Chrome/Edge best; Firefox/Safari rely on fallbacks and may ignore precise coordinates.
- If precise placement is required, prefer the extension path where possible.
