# Architecture Documentation

## Project Structure

```
├── index.html          # Main HTML entry point
├── style.css          # Game styling (Āthariq brand)
├── main.js            # Game initialization and main loop
├── game/
│   ├── state.js       # Central game state management
│   ├── scenes.js      # All game content (data-driven)
│   ├── logic.js       # Core game mechanics
│   └── ui.js          # UI rendering system
└── assets/
    ├── images/        # Image assets
    └── sounds/        # Sound assets (optional)
```

## System Architecture

### State Management (`game/state.js`)

The entire game state is managed in a single `gameState` object:

```javascript
gameState = {
    timeRemaining: 12,           // Turns remaining
    suspicion: 0,                 // Suspicion level
    currentLocation: 'grandHall', // Current room
    visitedRooms: Set,            // Tracked rooms
    examinedObjects: Set,         // Examined items
    interrogatedSuspects: Set,    // Spoken suspects
    collectedClues: Set,          // Discovered clues
    journalEntries: [],           // Clue journal data
    phase: 'investigation',       // Current game phase
    accusation: {                 // Accusation data
        suspect: null,
        weapon: null
    },
    gameOver: false,              // Game completion flag
    ending: null,                 // Ending type
    trueSolution: {               // Hidden solution
        murderer: 'eleanor',
        weapon: 'poison'
    }
}
```

**Key Functions:**
- `resetGameState()` - Initialize new game
- `consumeTime(amount)` - Decrease time, returns false if time runs out
- `increaseSuspicion(amount)` - Raise suspicion level
- `addClue(id, title, text)` - Add clue to journal
- `canAccuse()` - Check if accusation phase can begin
- `makeAccusation(suspect, weapon)` - Process final accusation

### Content System (`game/scenes.js`)

All game content is data-driven and stored in exported objects:

- **`rooms`** - Room definitions with descriptions and actions
- **`objects`** - Examinable objects with clues and prerequisites
- **`suspects`** - Suspect information with dialogue trees
- **`weapons`** - Available weapons for accusation
- **`endings`** - Ending text for each outcome

**Adding New Content:**
1. Add room to `rooms` object with `id`, `name`, `description`, `actions`
2. Add object to `objects` object with `id`, `name`, `description`, optional `clue` and `requiredClue`
3. Add suspect to `suspects` object with `id`, `name`, `dialogues` (keyed by clue requirements)
4. Add ending to `endings` object with `title` and `text`

### Game Logic (`game/logic.js`)

Pure functions that handle game mechanics:

- **`navigateToLocation(locationId)`** - Move to new room, consumes time
- **`examineObject(objectId)`** - Examine object, adds clue if available
- **`interrogateSuspect(suspectId)`** - Talk to suspect, returns dialogue
- **`getAvailableActions()`** - Get actions for current location
- **`getCurrentScene()`** - Get scene data for current location
- **`getAccusationData()`** - Get suspects and weapons for accusation
- **`processAccusation(suspect, weapon)`** - Handle final accusation

**Important:** All logic functions read from and write to `gameState`. They don't directly manipulate the DOM.

### UI System (`game/ui.js`)

Rendering functions that update the DOM based on game state:

- **`updateStats()`** - Update time and suspicion displays
- **`renderScene(sceneData)`** - Display current location and description
- **`renderChoices(actions, onActionClick)`** - Render action buttons
- **`updateJournal()`** - Update clue journal sidebar
- **`showModal(text, actions)`** - Display modal dialog
- **`renderEnding(endingId)`** - Display ending screen
- **`renderAccusationInterface(data, onAccuse)`** - Show accusation selection

**Important:** UI functions only read from `gameState` and trigger callbacks. They don't modify game state directly.

### Main Loop (`main.js`)

Initializes game and handles action flow:

1. **`initGame()`** - Reset state and render initial UI
2. **`updateUI()`** - Refresh all UI elements based on current state
3. **`handleAction(action)`** - Process player actions (navigate, examine, interrogate, accuse)
4. **`handleAccusation(suspect, weapon)`** - Process final accusation

**Flow:**
```
User clicks action → handleAction() → logic function → updateUI() → render functions
```

## Data Flow

```
gameState (source of truth)
    ↓
logic.js (reads/writes state)
    ↓
main.js (orchestrates)
    ↓
ui.js (reads state, renders DOM)
    ↓
User interaction
    ↓
main.js (handles action)
    ↓
logic.js (updates state)
    ↓
updateUI() (re-renders)
```

## Key Design Patterns

### 1. Centralized State
All game state lives in one object (`gameState`). No scattered variables.

### 2. Data-Driven Content
All narrative content is in `scenes.js` as data structures, not hardcoded in logic.

### 3. Separation of Concerns
- **State**: Data storage
- **Logic**: Game rules and mechanics
- **UI**: Presentation and rendering
- **Main**: Orchestration

### 4. Pure Functions
Logic functions are mostly pure - they take inputs and return outputs, with side effects only on `gameState`.

### 5. Event-Driven UI
UI updates are triggered by state changes, not by direct DOM manipulation in logic.

## Extending the Game

### Adding a New Room

1. Add to `rooms` object in `scenes.js`:
```javascript
newRoom: {
    id: 'newRoom',
    name: 'New Room',
    description: 'Room description...',
    actions: [
        { id: 'go_hall', text: 'Return to Hall', location: 'grandHall', timeCost: 1 },
        { id: 'examine_item', text: 'Examine Item', object: 'itemId', timeCost: 1 }
    ]
}
```

2. Add navigation actions from other rooms to reach it.

### Adding a New Suspect

1. Add to `suspects` object in `scenes.js`:
```javascript
newSuspect: {
    id: 'newSuspect',
    name: 'Name',
    title: 'Title',
    description: 'Description...',
    location: 'corridor',
    dialogues: {
        initial: {
            text: 'Initial dialogue...',
            suspicionIncrease: 5
        },
        after_clue: {
            text: 'Dialogue after clue...',
            suspicionIncrease: 10,
            requiredClue: 'clue_id'
        }
    },
    clues: ['clue_id_1', 'clue_id_2']
}
```

2. Add interrogation action to the room where suspect is located.

### Adding a New Ending

1. Add to `endings` object in `scenes.js`:
```javascript
newEnding: {
    title: 'Ending Title',
    text: 'Ending text...'
}
```

2. Update `makeAccusation()` in `state.js` to set `gameState.ending = 'newEnding'` when conditions are met.

## True Solution

The true solution is stored in `gameState.trueSolution`:
- **Murderer**: Eleanor Blackthorn (`'eleanor'`)
- **Weapon**: Poison (`'poison'`)

To change the solution, update `gameState.trueSolution` in `state.js` and adjust clues/evidence in `scenes.js` accordingly.

## Deployment Notes

- Railway uses `$PORT` environment variable
- Preview command: `vite preview --port $PORT --host`
- Build output goes to `dist/` directory
- All assets are bundled by Vite

## Common Issues & Solutions

### Time not updating
- Check `consumeTime()` is called in logic functions
- Verify `updateStats()` is called after state changes

### Clues not appearing
- Ensure `addClue()` is called in `examineObject()`
- Check object has a `clue` property defined
- Verify `updateJournal()` is called after clue addition

### Actions not showing
- Check `getAvailableActions()` includes the action
- Verify action is in room's `actions` array
- Ensure prerequisites are met (for objects with `requiredClue`)

### Accusation not working
- Verify `canAccuse()` returns true (time <= 3 or clues >= 6)
- Check `gameState.phase` is set to `'accusation'`
- Ensure both suspect and weapon are selected before final accusation



