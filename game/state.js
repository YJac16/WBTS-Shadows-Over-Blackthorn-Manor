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

import { getRandomScenario } from './scenarios.js';
import { getWeaponLocations } from './weapons.js';
import { validateScenarioInitialization, validateReplayIntegrity, logDebugInfo, validateAccusationPrerequisites, isWeaponValidForScenario } from './validation.js';

export const gameState = {
    // Active scenario (randomly selected at game start)
    activeScenario: null,
    
    // Time system
    timeRemaining: 20,
    maxTime: 20,
    
    // Suspicion system
    suspicionLevel: 0,
    maxSuspicion: 100,
    
    // Current location
    currentLocation: 'grandHall',
    
    // Investigation progress
    visitedRooms: new Set(['grandHall']),
    examinedObjects: new Set(),
    interrogatedSuspects: new Set(),
    discoveredClues: new Set(), // Clues discovered
    journalEntries: [],
    
    // Weapon system
    weaponLocations: {}, // Map of weaponId -> roomId where weapon is located
    foundWeapons: [], // Array of weapon IDs that player has found
    
    // Autopsy system
    autopsyUnlocked: false,
    causeOfDeath: null, // 'poison', 'laceration', 'blunt_trauma', 'precision_incision'
    
    // Character profile data (unlocked information)
    knownCharacters: {
        eleanor: { unlocked: false, facts: [], suspicious: [], motives: [], opportunities: [] },
        victor: { unlocked: false, facts: [], suspicious: [], motives: [], opportunities: [] },
        thomas: { unlocked: false, facts: [], suspicious: [], motives: [], opportunities: [] },
        doctor: { unlocked: false, facts: [], suspicious: [], motives: [], opportunities: [] },
        lydia: { unlocked: false, facts: [], suspicious: [], motives: [], opportunities: [] }
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
    
    // Legacy support (for compatibility)
    solution: null, // Points to activeScenario
    suspicion: 0, // Points to suspicionLevel
    collectedClues: null, // Points to discoveredClues
    characterProfiles: null, // Points to knownCharacters
    discoveredWeapons: null // Points to foundWeapons
};

/**
 * Reset game state to initial values
 * Randomly selects a new scenario and weapon locations
 */
export function resetGameState() {
    // STEP 1: Initialize scenario FIRST
    gameState.activeScenario = getRandomScenario();
    
    // STEP 2: Initialize weapon locations AFTER scenario (fixed locations)
    gameState.weaponLocations = getWeaponLocations();
    
    // STEP 3: Explicitly set starting room and view
    gameState.currentLocation = 'grandHall'; // Original starting room
    gameState.phase = 'investigation'; // Set view to room/investigation
    
    // Reset time system
    gameState.timeRemaining = 20;
    gameState.maxTime = 20;
    
    // Reset suspicion system
    gameState.suspicionLevel = 0;
    
    // Reset investigation progress
    gameState.visitedRooms = new Set(['grandHall']);
    gameState.examinedObjects = new Set();
    gameState.interrogatedSuspects = new Set();
    gameState.discoveredClues = new Set();
    gameState.journalEntries = [];
    gameState.foundWeapons = [];
    
    // Reset autopsy
    gameState.autopsyUnlocked = false;
    gameState.causeOfDeath = null;
    
    // Reset character profiles
    gameState.knownCharacters = {
        eleanor: { unlocked: false, facts: [], suspicious: [], motives: [], opportunities: [] },
        victor: { unlocked: false, facts: [], suspicious: [], motives: [], opportunities: [] },
        thomas: { unlocked: false, facts: [], suspicious: [], motives: [], opportunities: [] },
        doctor: { unlocked: false, facts: [], suspicious: [], motives: [], opportunities: [] },
        lydia: { unlocked: false, facts: [], suspicious: [], motives: [], opportunities: [] }
    };
    
    // Reset game phase
    gameState.phase = 'investigation';
    gameState.accusation = { suspect: null, weapon: null };
    gameState.gameOver = false;
    gameState.ending = null;
    
    // Legacy compatibility
    gameState.solution = gameState.activeScenario;
    gameState.suspicion = 0;
    Object.defineProperty(gameState, 'suspicion', {
        get: () => gameState.suspicionLevel,
        set: (val) => { gameState.suspicionLevel = val; }
    });
    Object.defineProperty(gameState, 'collectedClues', {
        get: () => gameState.discoveredClues
    });
    Object.defineProperty(gameState, 'characterProfiles', {
        get: () => gameState.knownCharacters
    });
    Object.defineProperty(gameState, 'discoveredWeapons', {
        get: () => new Set(gameState.foundWeapons)
    });
    
    // Validate scenario initialization
    validateScenarioInitialization();
    
    // Validate replay integrity
    validateReplayIntegrity();
    
    // Log debug info if enabled
    logDebugInfo();
    
    // Scenario loaded (debug only, not exposed to UI)
}

/**
 * Consume time
 * @param {number} amount - Amount of time to consume
 * @param {string} actionType - Type of action consuming time (for validation)
 * @returns {boolean} - True if time remains, false if game over
 */
export function consumeTime(amount = 1, actionType = 'unknown') {
    const timeBefore = gameState.timeRemaining;
    gameState.timeRemaining = Math.max(0, gameState.timeRemaining - amount);
    const timeAfter = gameState.timeRemaining;
    
    // Validate time consumption
    if (timeAfter >= timeBefore && amount > 0) {
        console.error(`VALIDATION ERROR: Time not consumed for action: ${actionType}. Before: ${timeBefore}, After: ${timeAfter}, Amount: ${amount}`);
    }
    
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
 * @param {string} reason - Reason for suspicion increase (for validation)
 */
export function increaseSuspicion(amount = 10, reason = 'unknown') {
    // Validate suspicion increase
    if (amount < 0) {
        console.error(`VALIDATION ERROR: Suspicion cannot decrease. Reason: ${reason}`);
        return;
    }
    
    if (amount > 50 && !reason.includes('accusation') && !reason.includes('body')) {
        console.warn(`VALIDATION WARNING: Large suspicion increase (${amount}) for reason: ${reason}`);
    }
    
    gameState.suspicionLevel = Math.min(gameState.maxSuspicion, gameState.suspicionLevel + amount);
}

/**
 * Add clue to journal
 * @param {string} clueId - Unique clue identifier
 * @param {string} title - Clue title
 * @param {string} text - Clue description
 */
export function addClue(clueId, title, text) {
    if (gameState.discoveredClues.has(clueId)) {
        return; // Already collected
    }
    
    gameState.discoveredClues.add(clueId);
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
    return gameState.timeRemaining <= 10 || gameState.discoveredClues.size >= 6;
}

/**
 * Make accusation
 * @param {string} suspect - Suspect ID
 * @param {string} weapon - Weapon ID
 */
export function makeAccusation(suspect, weapon) {
    
    // Consume time for making accusation
    consumeTime(1, 'accusation');
    
    gameState.accusation.suspect = suspect;
    gameState.accusation.weapon = weapon;
    
    // Determine ending based on active scenario
    if (!gameState.activeScenario) {
        gameState.ending = 'false';
        gameState.gameOver = true;
        gameState.phase = 'ending';
        increaseSuspicion(20, 'accusation_no_scenario'); // Wrong accusation increases suspicion
        return;
    }
    
    // Validate accusation prerequisites
    const validation = validateAccusationPrerequisites(suspect, weapon);
    
    // Guard: Autopsy must be unlocked
    if (!gameState.autopsyUnlocked) {
        gameState.ending = 'false';
        gameState.gameOver = true;
        gameState.phase = 'ending';
        increaseSuspicion(15, 'accusation_no_autopsy');
        console.warn('VALIDATION: Accusation attempted without autopsy');
        return;
    }
    
    const correctSuspect = suspect === gameState.activeScenario.culprit;
    const correctWeapon = gameState.activeScenario.validWeapons.includes(weapon);
    
    // Check autopsy consistency using validation function
    const weaponConsistent = isWeaponValidForScenario(weapon, gameState.activeScenario);
    
    // Check if player has discovered motive and opportunity for the suspect
    const hasMotive = gameState.knownCharacters[suspect]?.motives?.length > 0;
    const hasOpportunity = gameState.knownCharacters[suspect]?.opportunities?.length > 0;
    
    // Success requires: correct suspect, correct weapon, autopsy consistency, and evidence
    if (correctSuspect && correctWeapon && weaponConsistent && hasMotive && hasOpportunity) {
        gameState.ending = 'true';
    } else if (correctSuspect && correctWeapon && weaponConsistent) {
        // Right suspect and weapon, but missing evidence
        gameState.ending = 'partial';
        increaseSuspicion(5, 'accusation_missing_evidence');
    } else if (correctSuspect && !weaponConsistent) {
        // Right suspect but wrong weapon type (inconsistent with autopsy)
        gameState.ending = 'false_weapon_type';
        increaseSuspicion(15, 'accusation_wrong_weapon_type');
    } else if (correctSuspect && !correctWeapon) {
        // Right suspect but wrong weapon
        gameState.ending = 'partial';
        increaseSuspicion(10, 'accusation_wrong_weapon');
    } else {
        // Wrong suspect
        gameState.ending = 'false';
        increaseSuspicion(20, 'accusation_wrong_suspect');
    }
    
    gameState.gameOver = true;
    gameState.phase = 'ending';
}

/**
 * Update character profile with new information
 * @param {string} suspectId - Suspect ID
 * @param {string} fact - Fact to add
 * @param {boolean} suspicious - Whether this is suspicious behavior
 * @param {string} type - Type of information: 'fact', 'motive', 'opportunity', 'suspicious'
 */
export function updateCharacterProfile(suspectId, fact, suspicious = false, type = 'fact') {
    if (!gameState.knownCharacters[suspectId]) {
        return;
    }
    
    gameState.knownCharacters[suspectId].unlocked = true;
    
    if (type === 'motive') {
        if (!gameState.knownCharacters[suspectId].motives.includes(fact)) {
            gameState.knownCharacters[suspectId].motives.push(fact);
        }
    } else if (type === 'opportunity') {
        if (!gameState.knownCharacters[suspectId].opportunities.includes(fact)) {
            gameState.knownCharacters[suspectId].opportunities.push(fact);
        }
    } else if (suspicious) {
        if (!gameState.knownCharacters[suspectId].suspicious.includes(fact)) {
            gameState.knownCharacters[suspectId].suspicious.push(fact);
        }
    } else {
        if (!gameState.knownCharacters[suspectId].facts.includes(fact)) {
            gameState.knownCharacters[suspectId].facts.push(fact);
        }
    }
}

/**
 * Unlock autopsy
 * @param {string} causeOfDeath - Cause of death ('poison', 'laceration', 'blunt_trauma', 'precision_incision')
 */
export function unlockAutopsy() {
    if (!gameState.activeScenario) {
        return; // Cannot unlock without scenario
    }
    
    gameState.autopsyUnlocked = true;
    gameState.causeOfDeath = gameState.activeScenario.causeOfDeath;
    
    // Add autopsy clue to journal using scenario's autopsyText from narrative data
    addClue('autopsy', 'Autopsy Report', gameState.activeScenario.autopsyText);
}

/**
 * Check if a weapon is consistent with autopsy
 * @param {string} weaponId - Weapon ID
 * @returns {boolean} True if weapon matches autopsy cause of death
 */
export function isWeaponConsistentWithAutopsy(weaponId) {
    if (!gameState.autopsyUnlocked || !gameState.causeOfDeath) {
        return true; // Can't check if autopsy not unlocked
    }
    
    if (!gameState.activeScenario) {
        return false;
    }
    
    // Check if weapon is in validWeapons array from scenario
    return gameState.activeScenario.validWeapons.includes(weaponId);
}

