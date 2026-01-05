/**
 * Core Game Logic
 * 
 * This module handles game mechanics:
 * - Room navigation
 * - Object examination
 * - Suspect interrogation
 * - Clue collection
 * - Accusation handling
 */

import { gameState, consumeTime, increaseSuspicion, addClue, canAccuse, makeAccusation, updateCharacterProfile } from './state.js';
import { rooms, getObject, getSuspect, getWeapons, getAllWeapons, suspects } from './scenes.js';
import { getClueById } from './clues.js';
import { getBestDialogue } from './dialogue.js';

/**
 * Navigate to a new location
 * @param {string} locationId - ID of the location to move to
 * @returns {boolean} - True if navigation successful
 */
export function navigateToLocation(locationId) {
    if (!rooms[locationId]) {
        return false;
    }
    
    if (!consumeTime()) {
        return false; // Time ran out
    }
    
    gameState.currentLocation = locationId;
    gameState.visitedRooms.add(locationId);
    
    return true;
}

/**
 * Examine an object
 * @param {string} objectId - ID of the object to examine
 * @returns {object|null} - Object data or null if examination failed
 */
export function examineObject(objectId) {
    const obj = getObject(objectId);
    
    if (!obj) {
        return null;
    }
    
    // Check if object has prerequisite clue
    if (obj.requiredClue && !gameState.collectedClues.has(obj.requiredClue)) {
        return {
            error: 'You need to examine something else first.',
            description: 'Something about this object seems important, but you\'re missing a piece of the puzzle.'
        };
    }
    
    // Only consume time if we can actually examine it
    if (!consumeTime()) {
        return null; // Time ran out
    }
    
    // Increase suspicion when examining objects (investigating raises suspicion)
    increaseSuspicion(5);
    
    gameState.examinedObjects.add(objectId);
    
    // Add clue if object has one (from dynamic clue system)
    if (obj.clue) {
        addClue(obj.clue.id, obj.clue.title, obj.clue.text);
        // Don't update character profiles here - only update when speaking with suspects
        
        // Discover weapons based on clues found (only specific evidence clues)
        if (obj.clue.id === 'letter_opener_missing') {
            gameState.discoveredWeapons.add('letterOpener');
        } else if (obj.clue.id === 'fire_poker_evidence') {
            gameState.discoveredWeapons.add('firePoker');
        } else if (obj.clue.id === 'syringe_evidence') {
            gameState.discoveredWeapons.add('syringe');
        }
        // Note: body_examination describes the method but doesn't discover the weapon
        // Players must find specific evidence to discover weapons
    }
    
    return {
        name: obj.name,
        description: obj.description,
        clue: obj.clue
    };
}

/**
 * Interrogate a suspect
 * @param {string} suspectId - ID of the suspect to interrogate
 * @returns {object|null} - Dialogue data or null if interrogation failed
 */
export function interrogateSuspect(suspectId) {
    const suspect = getSuspect(suspectId);
    
    if (!suspect) {
        return null;
    }
    
    if (!consumeTime()) {
        return null; // Time ran out
    }
    
    gameState.interrogatedSuspects.add(suspectId);
    
    // Unlock character profile
    if (!gameState.characterProfiles[suspectId].unlocked) {
        gameState.characterProfiles[suspectId].unlocked = true;
    }
    
    // Get dialogue from dynamic system
    const dialogue = getBestDialogue(suspectId);
    
    if (!dialogue) {
        return {
            suspect: suspect,
            dialogue: { text: '...', suspicionIncrease: 0 }
        };
    }
    
    // Increase suspicion based on dialogue
    if (dialogue.suspicionIncrease) {
        increaseSuspicion(dialogue.suspicionIncrease);
    }
    
    // Update character profile
    updateCharacterProfile(suspectId, dialogue.text, dialogue.suspicionIncrease > 10);
    
    return {
        suspect: suspect,
        dialogue: dialogue
    };
}

/**
 * Get available actions for current location
 * @returns {array} - Array of available actions
 */
export function getAvailableActions() {
    const location = rooms[gameState.currentLocation];
    if (!location) {
        return [];
    }
    
    const actions = [];
    
    // Add location navigation actions
    location.actions.forEach(action => {
        if (action.location) {
            actions.push({
                type: 'navigate',
                id: action.id,
                text: action.text,
                target: action.location,
                timeCost: action.timeCost || 1
            });
        } else if (action.object) {
            // Check if object has been examined
            const examined = gameState.examinedObjects.has(action.object);
            actions.push({
                type: 'examine',
                id: action.id,
                text: examined ? `${action.text} (Examined)` : action.text,
                target: action.object,
                timeCost: action.timeCost || 1,
                examined: examined
            });
        } else if (action.suspect) {
            const interrogated = gameState.interrogatedSuspects.has(action.suspect);
            actions.push({
                type: 'interrogate',
                id: action.id,
                text: interrogated ? `${action.text} (Spoken)` : action.text,
                target: action.suspect,
                timeCost: action.timeCost || 1,
                interrogated: interrogated
            });
        }
    });
    
    // Add accusation action if conditions are met
    if (canAccuse() && gameState.phase === 'investigation') {
        actions.push({
            type: 'accuse',
            id: 'accuse',
            text: 'Make an Accusation',
            timeCost: 0
        });
    }
    
    return actions;
}

/**
 * Get current scene data
 * @returns {object} - Current scene information
 */
export function getCurrentScene() {
    const location = rooms[gameState.currentLocation];
    if (!location) {
        return null;
    }
    
    // Use initial description if first visit, otherwise use regular description
    const isFirstVisit = !gameState.visitedRooms.has(location.id) || 
                         (gameState.visitedRooms.size === 1 && location.id === 'grandHall');
    
    return {
        location: location,
        description: isFirstVisit && location.initialDescription 
            ? location.initialDescription 
            : location.description,
        isFirstVisit: isFirstVisit
    };
}

/**
 * Get accusation data (suspects and weapons)
 * @returns {object} - Available suspects and weapons for accusation
 */
export function getAccusationData() {
    // Only show weapons that have been discovered through evidence
    const allWeapons = getAllWeapons();
    const availableWeapons = allWeapons.filter(weapon => 
        gameState.discoveredWeapons.has(weapon.id)
    );
    
    return {
        suspects: Object.values(suspects).map(s => ({
            id: s.id,
            name: s.name,
            title: s.title
        })),
        weapons: availableWeapons // Only show discovered weapons
    };
}

/**
 * Process accusation
 * @param {string} suspectId - Accused suspect
 * @param {string} weaponId - Accused weapon
 */
export function processAccusation(suspectId, weaponId) {
    makeAccusation(suspectId, weaponId);
}

