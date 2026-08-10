/**
 * Persist game progress in localStorage so refresh does not restart.
 */

import { gameState, applyLoadedState, resetGameState } from './state.js';
import { getScenarioById } from './scenarios.js';

const SAVE_KEY = 'wbts_blackthorn_save_v1';

/**
 * Serialize gameState for storage
 * @returns {object}
 */
export function serializeGameState() {
    return {
        version: 1,
        activeScenarioId: gameState.activeScenario?.id || null,
        timeRemaining: gameState.timeRemaining,
        maxTime: gameState.maxTime,
        suspicionLevel: gameState.suspicionLevel,
        maxSuspicion: gameState.maxSuspicion,
        currentLocation: gameState.currentLocation,
        visitedRooms: Array.from(gameState.visitedRooms || []),
        examinedObjects: Array.from(gameState.examinedObjects || []),
        interrogatedSuspects: Array.from(gameState.interrogatedSuspects || []),
        discoveredClues: Array.from(gameState.discoveredClues || []),
        journalEntries: gameState.journalEntries || [],
        weaponLocations: gameState.weaponLocations || {},
        foundWeapons: gameState.foundWeapons || [],
        characterLocations: gameState.characterLocations || {},
        autopsyUnlocked: gameState.autopsyUnlocked,
        causeOfDeath: gameState.causeOfDeath,
        knownCharacters: gameState.knownCharacters,
        phase: gameState.phase,
        accusation: gameState.accusation,
        gameOver: gameState.gameOver,
        ending: gameState.ending
    };
}

/**
 * Save current game to localStorage
 */
export function saveGame() {
    try {
        if (!gameState.activeScenario) {
            return;
        }
        // Do not keep finished games as resumable saves
        if (gameState.gameOver) {
            clearSave();
            return;
        }
        localStorage.setItem(SAVE_KEY, JSON.stringify(serializeGameState()));
    } catch (err) {
        console.warn('Could not save game:', err);
    }
}

/**
 * Load saved game into gameState
 * @returns {boolean} True if a valid in-progress save was restored
 */
export function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) {
            return false;
        }

        const data = JSON.parse(raw);
        if (!data || data.gameOver || !data.activeScenarioId) {
            clearSave();
            return false;
        }

        const scenario = getScenarioById(data.activeScenarioId);
        if (!scenario) {
            clearSave();
            return false;
        }

        if (!data.characterLocations || Object.keys(data.characterLocations).length !== 5) {
            clearSave();
            return false;
        }

        if (!data.weaponLocations || Object.keys(data.weaponLocations).length !== 5) {
            clearSave();
            return false;
        }

        applyLoadedState({
            ...data,
            activeScenario: scenario
        });

        return true;
    } catch (err) {
        console.warn('Could not load save:', err);
        clearSave();
        return false;
    }
}

/**
 * Whether a resumable in-progress save exists
 * @returns {boolean}
 */
export function hasSave() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) {
            return false;
        }
        const data = JSON.parse(raw);
        return Boolean(data && !data.gameOver && data.activeScenarioId);
    } catch {
        return false;
    }
}

/**
 * Clear saved game
 */
export function clearSave() {
    try {
        localStorage.removeItem(SAVE_KEY);
    } catch (err) {
        console.warn('Could not clear save:', err);
    }
}

/**
 * Start a new run (clears save and resets state)
 */
export function startNewGame() {
    clearSave();
    resetGameState();
    saveGame();
}
