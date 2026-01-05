/**
 * Central Game State Management
 * 
 * This module manages the entire game state in a single object.
 * All game logic reads from and writes to this state.
 * 
 * IMPORTANT: This is the SINGLE SOURCE OF TRUTH for game state.
 * - Never create duplicate state variables elsewhere
 * - All state changes should go through functions in this file
 * - UI reads from this, logic writes to this
 * 
 * SOLUTION SYSTEM:
 * - Each playthrough randomly selects ONE solution profile
 * - Solution is stored in gameState.solution
 * - All narrative logic adapts to the active solution
 */

import { getRandomSolution } from './solutions.js';

export const gameState = {
    // Time system
    timeRemaining: 20,
    maxTime: 20,
    
    // Suspicion system
    suspicion: 0,
    maxSuspicion: 100,
    
    // Current location
    currentLocation: 'grandHall',
    
    // Investigation progress
    visitedRooms: new Set(['grandHall']),
    examinedObjects: new Set(),
    interrogatedSuspects: new Set(),
    collectedClues: new Set(),
    discoveredWeapons: new Set(), // Weapons discovered through evidence
    
    // Clue journal entries
    journalEntries: [],
    
    // Character profile data (unlocked information)
    characterProfiles: {
        eleanor: { unlocked: false, facts: [], suspicious: [] },
        marcus: { unlocked: false, facts: [], suspicious: [] },
        lydia: { unlocked: false, facts: [], suspicious: [] },
        hale: { unlocked: false, facts: [], suspicious: [] }
    },
    
    // Game phase
    phase: 'investigation', // 'investigation' | 'accusation' | 'ending'
    
    // Accusation data
    accusation: {
        suspect: null,
        weapon: null
    },
    
    // Game completion
    gameOver: false,
    ending: null,
    
    // Active solution (randomly selected at game start)
    solution: null
};

/**
 * Reset game state to initial values
 * Randomly selects a new solution profile
 */
export function resetGameState() {
    gameState.timeRemaining = 20;
    gameState.suspicion = 0;
    gameState.currentLocation = 'grandHall';
    gameState.visitedRooms = new Set(['grandHall']);
    gameState.examinedObjects = new Set();
    gameState.interrogatedSuspects = new Set();
    gameState.collectedClues = new Set();
    gameState.discoveredWeapons = new Set();
    gameState.journalEntries = [];
    gameState.characterProfiles = {
        eleanor: { unlocked: false, facts: [], suspicious: [] },
        marcus: { unlocked: false, facts: [], suspicious: [] },
        lydia: { unlocked: false, facts: [], suspicious: [] },
        hale: { unlocked: false, facts: [], suspicious: [] }
    };
    gameState.phase = 'investigation';
    gameState.accusation = { suspect: null, weapon: null };
    gameState.gameOver = false;
    gameState.ending = null;
    
    // Randomly select solution for this playthrough
    gameState.solution = getRandomSolution();
}

/**
 * Consume time
 * @param {number} amount - Amount of time to consume
 * @returns {boolean} - True if time remains, false if game over
 */
export function consumeTime(amount = 1) {
    gameState.timeRemaining = Math.max(0, gameState.timeRemaining - amount);
    
    if (gameState.timeRemaining <= 0) {
        gameState.gameOver = true;
        gameState.phase = 'ending';
        gameState.ending = 'timeout';
        return false;
    }
    
    return true;
}

/**
 * Increase suspicion
 * @param {number} amount - Amount to increase suspicion
 */
export function increaseSuspicion(amount = 10) {
    gameState.suspicion = Math.min(gameState.maxSuspicion, gameState.suspicion + amount);
}

/**
 * Add clue to journal
 * @param {string} clueId - Unique clue identifier
 * @param {string} title - Clue title
 * @param {string} text - Clue description
 */
export function addClue(clueId, title, text) {
    if (gameState.collectedClues.has(clueId)) {
        return; // Already collected
    }
    
    gameState.collectedClues.add(clueId);
    gameState.journalEntries.push({
        id: clueId,
        title,
        text,
        timestamp: gameState.maxTime - gameState.timeRemaining
    });
}

/**
 * Check if player can make accusation
 * Conditions: Low time remaining or enough clues collected
 */
export function canAccuse() {
    return gameState.timeRemaining <= 10 || gameState.collectedClues.size >= 6;
}

/**
 * Make accusation
 * @param {string} suspect - Suspect ID
 * @param {string} weapon - Weapon ID
 */
export function makeAccusation(suspect, weapon) {
    gameState.accusation.suspect = suspect;
    gameState.accusation.weapon = weapon;
    gameState.phase = 'ending';
    
    // Determine ending based on active solution
    if (!gameState.solution) {
        gameState.ending = 'false';
        gameState.gameOver = true;
        return;
    }
    
    const correctSuspect = suspect === gameState.solution.killer;
    const correctWeapon = weapon === gameState.solution.weapon;
    
    if (correctSuspect && correctWeapon) {
        gameState.ending = 'true';
    } else if (correctSuspect && !correctWeapon) {
        gameState.ending = 'partial';
    } else {
        gameState.ending = 'false';
    }
    
    gameState.gameOver = true;
}

/**
 * Update character profile with new information
 * @param {string} suspectId - Suspect ID
 * @param {string} fact - Fact to add
 * @param {boolean} suspicious - Whether this is suspicious behavior
 */
export function updateCharacterProfile(suspectId, fact, suspicious = false) {
    if (!gameState.characterProfiles[suspectId]) {
        return;
    }
    
    gameState.characterProfiles[suspectId].unlocked = true;
    
    if (suspicious) {
        if (!gameState.characterProfiles[suspectId].suspicious.includes(fact)) {
            gameState.characterProfiles[suspectId].suspicious.push(fact);
        }
    } else {
        if (!gameState.characterProfiles[suspectId].facts.includes(fact)) {
            gameState.characterProfiles[suspectId].facts.push(fact);
        }
    }
}

