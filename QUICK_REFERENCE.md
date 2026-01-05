# Quick Reference Guide

## File Purposes

| File | Purpose | Key Exports |
|------|---------|-------------|
| `main.js` | Game initialization and main loop | `initGame()`, `updateUI()` |
| `game/state.js` | Central state management | `gameState`, `consumeTime()`, `addClue()`, `makeAccusation()` |
| `game/scenes.js` | All game content (data) | `rooms`, `objects`, `suspects`, `weapons`, `endings` |
| `game/logic.js` | Game mechanics | `navigateToLocation()`, `examineObject()`, `interrogateSuspect()` |
| `game/ui.js` | UI rendering | `renderScene()`, `renderChoices()`, `updateJournal()`, `renderEnding()` |

## Common Tasks

### Find where something is defined
- **Game state**: `game/state.js` → `gameState` object
- **Room content**: `game/scenes.js` → `rooms` object
- **Object/clue**: `game/scenes.js` → `objects` object
- **Suspect dialogue**: `game/scenes.js` → `suspects` object
- **Ending text**: `game/scenes.js` → `endings` object
- **Game mechanics**: `game/logic.js` → function definitions
- **UI rendering**: `game/ui.js` → render functions

### Change game behavior
- **Time system**: `game/state.js` → `consumeTime()`, `gameState.timeRemaining`
- **Suspicion**: `game/state.js` → `increaseSuspicion()`, `gameState.suspicion`
- **Clue collection**: `game/state.js` → `addClue()`, `game/state.js` → `examineObject()`
- **Accusation logic**: `game/state.js` → `makeAccusation()`, `canAccuse()`

### Add new content
- **Room**: Add to `rooms` in `game/scenes.js`
- **Object**: Add to `objects` in `game/scenes.js`
- **Suspect**: Add to `suspects` in `game/scenes.js`
- **Ending**: Add to `endings` in `game/scenes.js`

### Debug issues
- **Time not updating**: Check `consumeTime()` calls in `game/logic.js`
- **Clues not appearing**: Check `addClue()` in `game/logic.js` → `examineObject()`
- **Actions missing**: Check `getAvailableActions()` in `game/logic.js`
- **UI not updating**: Check `updateUI()` calls in `main.js`

## State Flow

```
User clicks → main.js (handleAction) 
           → game/logic.js (navigate/examine/interrogate)
           → game/state.js (update gameState)
           → main.js (updateUI)
           → game/ui.js (render functions)
           → DOM updates
```

## Key Constants

- **Max Time**: 12 turns (defined in `gameState.maxTime`)
- **Max Suspicion**: 100 (defined in `gameState.maxSuspicion`)
- **True Murderer**: 'eleanor' (Eleanor Blackthorn)
- **True Weapon**: 'poison'
- **Accusation Trigger**: Time <= 3 OR clues >= 6

## Module Dependencies

```
main.js
  ├── game/state.js (reads/writes gameState)
  ├── game/logic.js (uses state.js, scenes.js)
  └── game/ui.js (reads gameState)

game/logic.js
  ├── game/state.js (reads/writes gameState)
  └── game/scenes.js (reads content data)

game/ui.js
  └── game/state.js (reads gameState)

game/scenes.js
  └── (standalone, no dependencies)
```

## Important Notes

- **Never modify gameState directly** - use functions in `state.js`
- **All content in scenes.js** - don't hardcode narrative in logic
- **UI only reads state** - never writes to gameState
- **Logic functions are pure** - take input, return output, modify state
- **Time is consumed in logic** - not in UI or main



