/**
 * Weapon System
 *
 * Weapons are randomized into examinable object slots each playthrough.
 */

import { rooms } from './scenes.js';

/**
 * All weapon definitions — one correct murder weapon per scenario
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
    },
    kitchen_knife: {
        id: 'kitchen_knife',
        name: 'Kitchen Knife',
        description: 'A sturdy kitchen carving knife. The blade shows faint traces of recent cleaning.',
        type: 'lacerations'
    }
};

/**
 * Collect examinable object IDs from all rooms
 * @returns {string[]}
 */
export function getExaminableSlots() {
    const slots = new Set();
    Object.values(rooms).forEach(room => {
        (room.actions || []).forEach(action => {
            if (action.object) {
                slots.add(action.object);
            }
        });
    });
    return Array.from(slots);
}

/**
 * Shuffle array in place (Fisher–Yates)
 * @param {array} arr
 * @returns {array}
 */
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Randomly place each weapon in a unique examinable object slot
 * @returns {object} Map of weaponId -> objectId
 */
export function randomizeWeaponLocations() {
    const weaponIds = Object.keys(ALL_WEAPONS);
    const slots = shuffle(getExaminableSlots());

    if (slots.length < weaponIds.length) {
        console.error('VALIDATION ERROR: Not enough examinable slots for weapons.');
    }

    const locations = {};
    weaponIds.forEach((weaponId, index) => {
        locations[weaponId] = slots[index % slots.length];
    });
    return locations;
}

/**
 * @deprecated Use randomizeWeaponLocations — kept for compatibility
 */
export function getWeaponLocations() {
    return randomizeWeaponLocations();
}

/**
 * Get weapon by ID
 * @param {string} weaponId
 * @returns {object|null}
 */
export function getWeapon(weaponId) {
    return ALL_WEAPONS[weaponId] || null;
}

/**
 * Get all weapons
 * @returns {array}
 */
export function getAllWeapons() {
    return Object.values(ALL_WEAPONS);
}

/**
 * Check if a weapon is in a specific room or object
 */
export function isWeaponInRoom(weaponId, roomId, weaponLocations) {
    return weaponLocations[weaponId] === roomId;
}

/**
 * Check if a weapon is found by examining a specific object
 */
export function isWeaponInObject(weaponId, objectId, weaponLocations) {
    return weaponLocations[weaponId] === objectId;
}
