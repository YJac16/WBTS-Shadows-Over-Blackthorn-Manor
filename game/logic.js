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

import { gameState, consumeTime, increaseSuspicion, addClue, canAccuse, makeAccusation, updateCharacterProfile, unlockAutopsy, isWeaponConsistentWithAutopsy } from './state.js';
import { rooms, getObject, getSuspect, getWeapons, getAllWeapons, suspects } from './scenes.js';
import { getClueById } from './clues.js';
import { getBestDialogue, updateProfileFromDialogue } from './dialogue.js';
import { isWeaponInObject, getWeapon } from './weapons.js';
import { isWeaponValidForScenario } from './validation.js';

/**
 * Navigate to a new location
 * @param {string} locationId - ID of the location to move to
 * @returns {boolean} - True if navigation successful
 */
export function navigateToLocation(locationId) {
    if (!rooms[locationId]) {
        return false;
    }
    
    if (!consumeTime(1, 'navigate')) {
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
    if (obj.requiredClue && !gameState.discoveredClues.has(obj.requiredClue)) {
        return {
            error: 'You need to examine something else first.',
            description: 'Something about this object seems important, but you\'re missing a piece of the puzzle.'
        };
    }
    
    // Only consume time if we can actually examine it
    if (!consumeTime(1, 'examine')) {
        return null; // Time ran out
    }
    
    // Increase suspicion when examining objects (investigating raises suspicion)
    increaseSuspicion(5, 'examine_object');
    
    gameState.examinedObjects.add(objectId);
    
    // Check if examining the body (unlocks autopsy)
    if (objectId === 'body' && !gameState.autopsyUnlocked && gameState.activeScenario) {
        unlockAutopsy(); // Uses scenario's autopsyText
        increaseSuspicion(10, 'examine_body'); // Examining body raises suspicion significantly
    }
    
    // Track if a weapon was found during this examination
    let foundWeapon = null;
    
    // Check if a weapon is found by examining this object
    const allWeapons = getAllWeapons();
    for (const weapon of allWeapons) {
        if (isWeaponInObject(weapon.id, objectId, gameState.weaponLocations)) {
            if (!gameState.foundWeapons.includes(weapon.id)) {
                gameState.foundWeapons.push(weapon.id);
                foundWeapon = weapon;
                
                let weaponText = `Found: ${weapon.name}. ${weapon.description}`;
                if (gameState.autopsyUnlocked) {
                    const isValid = isWeaponValidForScenario(weapon.id, gameState.activeScenario);
                    if (!isValid) {
                        weaponText += ' NOTE: This weapon is INCONSISTENT with the autopsy report.';
                    }
                }
                
                addClue(`weapon_${weapon.id}`, `Weapon Found: ${weapon.name}`, weaponText);
            }
        }
    }
    
    // Add clue if object has one (from dynamic clue system)
    if (obj.clue) {
        addClue(obj.clue.id, obj.clue.title, obj.clue.text);
    }
    
    return {
        name: obj.name,
        description: obj.description,
        clue: obj.clue,
        foundWeapon: foundWeapon
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
    
    if (!consumeTime(1, 'interrogate')) {
        return null; // Time ran out
    }
    
    gameState.interrogatedSuspects.add(suspectId);
    
    // Unlock character profile (validation: profiles hidden until interaction)
    if (!gameState.knownCharacters[suspectId].unlocked) {
        gameState.knownCharacters[suspectId].unlocked = true;
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
        increaseSuspicion(dialogue.suspicionIncrease, `interrogate_${suspectId}`);
    }
    
    // Update character profile from dialogue (adds motive/opportunity)
    updateProfileFromDialogue(suspectId, dialogue);
    
    // Update character profile with dialogue text
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
    // Only check for loading state, don't block rendering
    if (!gameState.activeScenario) {
        return []; // Return empty during loading
    }
    
    // Ensure current location is set
    if (!gameState.currentLocation) {
        gameState.currentLocation = 'grandHall';
        gameState.visitedRooms.add('grandHall');
    }
    
    const location = rooms[gameState.currentLocation];
    if (!location) {
        return []; // Return empty if room not found
    }
    
    const actions = [];
    
    // Navigation and examine actions from room definition
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
            const examined = gameState.examinedObjects.has(action.object);
            actions.push({
                type: 'examine',
                id: action.id,
                text: examined ? `${action.text} (Examined)` : action.text,
                target: action.object,
                timeCost: action.timeCost || 1,
                examined: examined
            });
        }
        // Hard-coded suspect talk actions ignored — characters come from characterLocations
    });
    
    // Talk actions from randomized character placement
    const characterLocations = gameState.characterLocations || {};
    Object.entries(characterLocations).forEach(([suspectId, roomId]) => {
        if (roomId !== gameState.currentLocation) {
            return;
        }
        const suspect = suspects[suspectId];
        if (!suspect) {
            return;
        }
        const interrogated = gameState.interrogatedSuspects.has(suspectId);
        actions.push({
            type: 'interrogate',
            id: `talk_${suspectId}`,
            text: interrogated ? `Talk to ${suspect.name} (Spoken)` : `Talk to ${suspect.name}`,
            target: suspectId,
            timeCost: 1,
            interrogated: interrogated
        });
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
    // Ensure scenario is initialized (should always be true after resetGameState)
    if (!gameState.activeScenario) {
        // Return default scene to ensure text always renders
        return {
            name: 'Grand Hall',
            description: 'You stand in the grand hall of Blackthorn Manor. The storm rages outside, and you know there is no escape until morning. Charles Blackthorn lies dead in his study. Someone in this house is the killer.',
            location: rooms['grandHall'] || null
        };
    }
    
    // Ensure current location is set (fallback to grandHall)
    if (!gameState.currentLocation) {
        gameState.currentLocation = 'grandHall';
        gameState.visitedRooms.add('grandHall');
    }
    
    const location = rooms[gameState.currentLocation];
    if (!location) {
        // Fallback to grandHall if room not found
        gameState.currentLocation = 'grandHall';
        const fallbackRoom = rooms['grandHall'];
        if (fallbackRoom) {
            return {
                name: fallbackRoom.name,
                location: fallbackRoom,
                description: fallbackRoom.initialDescription || fallbackRoom.description,
                isFirstVisit: true
            };
        }
        return null;
    }
    
    // Use initial description if first visit, otherwise use regular description
    // Preserve original intro narrative text
    const isFirstVisit = !gameState.visitedRooms.has(location.id) || 
                         (gameState.visitedRooms.size === 1 && location.id === 'grandHall');
    
    let description = isFirstVisit && location.initialDescription 
        ? location.initialDescription 
        : location.description;

    // Note who is present in this room
    const present = Object.entries(gameState.characterLocations || {})
        .filter(([, roomId]) => roomId === location.id)
        .map(([suspectId]) => suspects[suspectId]?.name)
        .filter(Boolean);
    if (present.length === 1) {
        description += ` ${present[0]} is here.`;
    } else if (present.length > 1) {
        description += ` ${present.slice(0, -1).join(', ')} and ${present[present.length - 1]} are here.`;
    }
    
    return {
        name: location.name,
        location: location,
        description,
        isFirstVisit: isFirstVisit
    };
}

/**
 * Get accusation data (suspects and weapons)
 * @returns {object} - Available suspects and weapons for accusation
 */
export function getAccusationData() {
    // Guard: Only show weapons that player has found
    const allWeapons = getAllWeapons();
    const availableWeapons = allWeapons.filter(weapon => 
        gameState.foundWeapons.includes(weapon.id)
    );
    
    // Validation: Ensure only discovered weapons are shown
    if (availableWeapons.length === 0 && allWeapons.length > 0) {
        console.warn('VALIDATION: No weapons discovered yet. Player cannot make accusation.');
    }
    
    return {
        suspects: Object.values(suspects).map(s => ({
            id: s.id,
            name: s.name,
            title: s.title
        })),
        weapons: availableWeapons // Only show found weapons
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

