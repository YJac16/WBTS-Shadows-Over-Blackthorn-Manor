# Whispers Before the Silence: Shadows Over Blackthorn Manor

**Episode 1** of the Whispers Before the Silence mystery series  
Published under the Āthariq label

A standalone, browser-based, choice-driven murder mystery game.

## Game Overview

You are an investigator trapped at Blackthorn Manor during a violent storm. Charles Blackthorn has been murdered, and you must discover the truth before time runs out.

### Core Mechanics

- **Time System**: You have 12 turns to solve the mystery
- **Investigation**: Explore rooms, examine objects, interrogate suspects
- **Clue Journal**: Automatically tracks discovered clues
- **Suspicion System**: Your actions can raise suspicion
- **Multiple Endings**: Your choices determine the outcome

### Suspects

- Eleanor Blackthorn — the widow
- Marcus Vale — business partner
- Lydia Crane — household maid
- Dr. Thomas Hale — family physician

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The game will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment (Railway)

The project is configured for Railway deployment:

### Railway Configuration

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
npm start
```
(Or alternatively: `vite preview --port $PORT --host`)

**Port:** Uses Railway's `$PORT` environment variable automatically

### Setup Instructions

1. **Connect Repository:**
   - Go to [Railway](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository: `YJac16/WBTS-Shadows-Over-Blackthorn-Manor`

2. **Configure Build Settings:**
   - Railway will auto-detect the build settings from `package.json`
   - Build Command: `npm run build`
   - Start Command: `npm start`

3. **Deploy:**
   - Railway will automatically build and deploy
   - The game will be available at your Railway-provided URL

### Alternative: Manual Configuration

If Railway doesn't auto-detect, manually set:
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Root Directory:** `/` (default)

The game will automatically adapt to Railway's public URL and port.

## Project Structure

```
├── index.html          # Main HTML entry point
├── style.css          # Game styling (Āthariq brand)
├── main.js            # Game initialization
├── game/
│   ├── state.js       # Central game state management
│   ├── scenes.js      # All game content (rooms, suspects, clues, endings)
│   ├── logic.js       # Core game mechanics
│   └── ui.js          # UI rendering system
└── assets/
    ├── images/        # Image assets (placeholder)
    └── sounds/        # Sound assets (optional)
```

## Extending the Game

### Adding a New Room

1. Add room object to `game/scenes.js` in the `rooms` object
2. Add navigation actions from other rooms
3. Add room-specific objects and clues

### Adding a New Suspect

1. Add suspect object to `game/scenes.js` in the `suspects` object
2. Add dialogue options with `requiredClue` conditions
3. Add suspect to appropriate room's actions

### Creating New Endings

1. Add ending object to `game/scenes.js` in the `endings` object
2. Update `game/state.js` to handle new ending conditions
3. Add ending rendering in `game/ui.js`

## Design Philosophy

- **Atmosphere over action**: Tension comes from time pressure and uncertainty
- **Minimal UI**: Dark background, soft text, no bright colors
- **Text-first**: Narrative drives the experience
- **Choice and consequence**: Every decision matters

## Code Architecture

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

### Quick Reference

- **State Management**: All game state in `game/state.js` → `gameState` object
- **Content**: All narrative content in `game/scenes.js` (rooms, objects, suspects, endings)
- **Logic**: Game mechanics in `game/logic.js` (pure functions that read/write state)
- **UI**: Rendering in `game/ui.js` (reads state, updates DOM)
- **Main**: Orchestration in `main.js` (initializes, handles actions, updates UI)

### Data Flow

```
gameState → logic.js → main.js → ui.js → DOM → User → main.js → logic.js → gameState
```

## License

Copyright © Āthariq. All rights reserved.

