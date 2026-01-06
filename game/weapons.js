/**
 * Weapon System
 * 
 * Fixed weapon locations - weapons are always in the same place.
 */

import { rooms } from './scenes.js';

/**
 * All weapon definitions
 * Matches scenario weapon IDs
 */
export const ALL_WEAPONS = {
    poison_vial: {
        id: 'poison_vial',
        name: 'Poison Vial',
        description: 'A small glass vial containing a clear, odorless liquid. The label has been removed.',
        type: 'poison'
    },
    letter_opener: {
        id: 'letter_opener',
        name: 'Antique Letter Opener',
        description: 'A sharp antique letter opener with an ornate handle. The blade is very sharp.',
        type: 'lacerations'
    },
    fireplace_poker: {
        id: 'fireplace_poker',
        name: 'Fireplace Poker',
        description: 'A heavy iron fireplace poker. Shows signs of recent use.',
        type: 'blunt_force'
    },
    scalpel: {
        id: 'scalpel',
        name: 'Surgical Scalpel',
        description: 'A precision surgical scalpel. Extremely sharp, designed for precise incisions.',
        type: 'precision_incision'
    }
};

/**
 * Fixed weapon locations
 * Weapons are always in these specific locations
 */
export function getWeaponLocations() {
    return {
        poison_vial: 'medicalRoom',        // Medical Room
        fireplace_poker: 'eleanorRoom',    // Eleanor's Room
        letter_opener: 'fireplace',        // Fireplace in Study
        scalpel: 'marcusRoom'              // Victor's Room
    };
}

/**
 * Get weapon by ID
 * @param {string} weaponId - Weapon ID
 * @returns {object|null} Weapon object or null
 */
export function getWeapon(weaponId) {
    return ALL_WEAPONS[weaponId] || null;
}

/**
 * Get all weapons
 * @returns {array} Array of all weapon objects
 */
export function getAllWeapons() {
    return Object.values(ALL_WEAPONS);
}

/**
 * Check if a weapon is in a specific room or object
 * @param {string} weaponId - Weapon ID
 * @param {string} roomId - Room ID or object ID
 * @param {object} weaponLocations - Weapon locations map
 * @returns {boolean} True if weapon is in room/object
 */
export function isWeaponInRoom(weaponId, roomId, weaponLocations) {
    return weaponLocations[weaponId] === roomId;
}

/**
 * Check if a weapon is found by examining a specific object
 * @param {string} weaponId - Weapon ID
 * @param {string} objectId - Object ID
 * @param {object} weaponLocations - Weapon locations map
 * @returns {boolean} True if weapon is found by examining object
 */
export function isWeaponInObject(weaponId, objectId, weaponLocations) {
    return weaponLocations[weaponId] === objectId;
}

