# Word Card Trainer Test Plan

## Objective
Validate that the browser-based word card trainer is reliable for daily study with:

- built-in deck bootstrap
- IndexedDB persistence
- study navigation and grouping
- hidden-English reveal flow
- browser speech fallback behavior
- imported deck isolation
- regression safety for future iterations

## Test Layers

### 1. Static Quality Gates
- `npm run lint`
- `npm run test`
- `npm run build`

### 2. Browser Integration Tests
Run against a local production-like server in Chromium via DevTools MCP.

Primary flows:
- app bootstraps the built-in deck
- study card renders one record at a time
- navigation works with buttons and keyboard
- settings persist after reload
- group size changes recompute group display
- hidden-English mode hides title until reveal
- deck library reflects active deck and progress
- importing a workbook creates a separate deck

### 3. Manual Regression Checklist
- layout remains usable on desktop and narrow mobile widths
- long Japanese strings do not overflow card containers
- speech button remains non-blocking when no voice is available
- refresh preserves deck, position, and settings

## Browser Test Matrix

### Boot and Built-in Deck
Expected:
- loading state appears first
- built-in deck finishes hydration into IndexedDB
- active deck becomes `Core 9000`
- study view shows exactly one card

### Study Navigation
Expected:
- `Next` advances one card
- `Previous` returns one card
- left/right keyboard keys navigate
- current card counter and current group counter update together
- visited progress increases as new cards are viewed

### Hidden English Mode
Expected:
- enabling the setting hides the English title on study cards
- Japanese content remains visible
- tapping the reveal area restores the English title for the current card only
- moving to another card hides it again

### Group Size
Expected:
- changing group size in settings persists
- group counters recompute based on the new size
- current position remains stable after the setting change

### Persistence
Expected:
- refresh keeps:
  - active deck
  - current card position
  - visited progress
  - hidden-English preference
  - group size

### Import Workbook
Expected:
- importing a valid workbook succeeds
- imported deck appears separately in the deck list
- switching decks does not overwrite built-in progress
- imported deck opens in study view

### Error Handling
Expected:
- invalid workbook import shows an error message
- app remains usable and existing decks remain intact

## Data Fixtures

### Built-in Fixture
- `public/decks/default-deck.json`

### Import Fixture
- `/Users/syou/codex/xlsx/麦克_v2 (1).xlsx`

## Pass Criteria
Release candidate is acceptable when:

- all static quality gates pass
- all browser integration scenarios above pass
- no console errors block usage
- no state loss occurs on reload
- imported deck remains isolated from the built-in deck

## Known Non-Blocking Observation
- production bundle size is above Vite's default chunk warning threshold because `xlsx` is in the main bundle; functionality is still correct, but future optimization should split import-only code.
