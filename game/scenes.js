/**
 * Scene Content and Game Data
 * 
 * This module contains room definitions and static content.
 * Dynamic content (clues, dialogue, weapons) is handled by:
 * - game/clues.js - Dynamic clue system
 * - game/dialogue.js - Adaptive dialogue system
 * - game/solutions.js - Solution profiles
 * 
 * Rooms remain mostly static, but objects and suspects
 * reference dynamic systems that adapt to the active solution.
 */

import { gameState } from './state.js';
import { getActiveClues, getClueById } from './clues.js';
import { getBestDialogue } from './dialogue.js';
import { getWeaponsForSolution } from './solutions.js';

export const rooms = {
    grandHall: {
        id: 'grandHall',
        name: 'Grand Hall',
        description: 'The entrance hall of Blackthorn Manor. Rain lashes against the windows. A single candle flickers on a side table, casting long shadows across the marble floor. The storm outside makes the manor feel like a ship adrift in darkness.',
        initialDescription: 'You stand in the grand hall of Blackthorn Manor. The storm rages outside, and you know there is no escape until morning. Charles Blackthorn lies dead in his study. Someone in this house is the killer.',
        actions: [
            { id: 'go_study', text: 'Go to the Study', location: 'study', timeCost: 1 },
            { id: 'go_kitchen', text: 'Go to the Kitchen', location: 'kitchen', timeCost: 1 },
            { id: 'go_corridor', text: 'Go to the Upstairs Corridor', location: 'corridor', timeCost: 1 },
            { id: 'examine_portrait', text: 'Examine the family portrait', object: 'portrait', timeCost: 1 }
        ]
    },
    
    study: {
        id: 'study',
        name: 'Study',
        description: 'The crime scene. Charles Blackthorn\'s body lies slumped over his desk. Books line the walls, and a fire has burned low in the hearth. The room smells of old paper and something else...',
        actions: [
            { id: 'go_hall', text: 'Return to Grand Hall', location: 'grandHall', timeCost: 1 },
            { id: 'examine_body', text: 'Examine the body', object: 'body', timeCost: 1 },
            { id: 'examine_desk', text: 'Search the desk', object: 'desk', timeCost: 1 },
            { id: 'examine_books', text: 'Examine the bookshelf', object: 'bookshelf', timeCost: 1 },
            { id: 'examine_fireplace', text: 'Examine the fireplace', object: 'fireplace', timeCost: 1 }
        ]
    },
    
    kitchen: {
        id: 'kitchen',
        name: 'Kitchen',
        description: 'A large, well-equipped kitchen. Pots and pans hang from hooks. A kettle sits on the stove. The room is warm, but there\'s an unsettling stillness. Someone was here recently.',
        actions: [
            { id: 'go_hall', text: 'Return to Grand Hall', location: 'grandHall', timeCost: 1 },
            { id: 'go_servants', text: 'Go to Servants\' Quarters', location: 'servants', timeCost: 1 },
            { id: 'examine_kettle', text: 'Examine the kettle', object: 'kettle', timeCost: 1 },
            { id: 'examine_cabinet', text: 'Search the cabinets', object: 'cabinet', timeCost: 1 },
            { id: 'talk_lydia', text: 'Talk to Lydia Crane', suspect: 'lydia', timeCost: 1 }
        ]
    },
    
    servants: {
        id: 'servants',
        name: 'Servants\' Quarters',
        description: 'A modest room with simple furnishings. A small bed, a chest of drawers, and a window overlooking the garden. This is where Lydia Crane lives.',
        actions: [
            { id: 'go_kitchen', text: 'Return to Kitchen', location: 'kitchen', timeCost: 1 },
            { id: 'examine_chest', text: 'Examine the chest of drawers', object: 'chest', timeCost: 1 },
            { id: 'examine_window', text: 'Look out the window', object: 'window', timeCost: 1 }
        ]
    },
    
    corridor: {
        id: 'corridor',
        name: 'Upstairs Corridor',
        description: 'A long, dark corridor. Portraits line the walls, their eyes seeming to follow you. Doors lead to various rooms. The floorboards creak under your weight.',
        actions: [
            { id: 'go_hall', text: 'Return to Grand Hall', location: 'grandHall', timeCost: 1 },
            { id: 'go_eleanor_room', text: 'Go to Eleanor\'s Room', location: 'eleanorRoom', timeCost: 1 },
            { id: 'go_marcus_room', text: 'Go to Marcus\'s Room', location: 'marcusRoom', timeCost: 1 },
            { id: 'talk_eleanor', text: 'Talk to Eleanor Blackthorn', suspect: 'eleanor', timeCost: 1 },
            { id: 'talk_marcus', text: 'Talk to Marcus Vale', suspect: 'marcus', timeCost: 1 },
            { id: 'talk_hale', text: 'Talk to Dr. Thomas Hale', suspect: 'hale', timeCost: 1 }
        ]
    },
    
    eleanorRoom: {
        id: 'eleanorRoom',
        name: 'Eleanor\'s Bedroom',
        description: 'An elegant bedroom. The bed is unmade, and a vanity table holds various bottles and powders. A letter lies half-hidden under a pillow.',
        actions: [
            { id: 'go_corridor', text: 'Return to Corridor', location: 'corridor', timeCost: 1 },
            { id: 'examine_vanity', text: 'Examine the vanity', object: 'vanity', timeCost: 1 },
            { id: 'examine_letter', text: 'Read the letter', object: 'letter', timeCost: 1 }
        ]
    },
    
    marcusRoom: {
        id: 'marcusRoom',
        name: 'Marcus\'s Room',
        description: 'A guest room. Business papers are scattered on a desk. A briefcase sits open, revealing financial documents. Everything is neat, almost too neat.',
        actions: [
            { id: 'go_corridor', text: 'Return to Corridor', location: 'corridor', timeCost: 1 },
            { id: 'examine_papers', text: 'Examine the business papers', object: 'papers', timeCost: 1 },
            { id: 'examine_briefcase', text: 'Search the briefcase', object: 'briefcase', timeCost: 1 }
        ]
    },
    
    gardenShed: {
        id: 'gardenShed',
        name: 'Garden Shed',
        description: 'A small shed at the edge of the garden. Gardening tools hang on the walls. The air smells of earth and something chemical.',
        actions: [
            { id: 'go_hall', text: 'Return to Grand Hall', location: 'grandHall', timeCost: 2 },
            { id: 'examine_tools', text: 'Examine the gardening tools', object: 'tools', timeCost: 1 }
        ]
    }
};

/**
 * Object definitions
 * Objects reference dynamic clues from clues.js
 */
export const objects = {
    portrait: {
        id: 'portrait',
        name: 'Family Portrait',
        description: 'A large portrait of the Blackthorn family. Charles and Eleanor stand together, but there\'s a distance between them.',
        clueId: 'family_portrait'
    },
    
    body: {
        id: 'body',
        name: 'Charles Blackthorn\'s Body',
        description: 'Charles Blackthorn, dead. His body shows signs of violence.',
        clueId: 'body_examination'
    },
    
    desk: {
        id: 'desk',
        name: 'Desk',
        description: 'Charles\'s desk. Papers are scattered across its surface.',
        clueId: null, // Dynamic based on solution
        getClueId: () => {
            if (!gameState.solution) return null;
            if (gameState.solution.id === 'A') return 'embezzlement_evidence';
            if (gameState.solution.id === 'B') return 'new_will';
            return null;
        }
    },
    
    bookshelf: {
        id: 'bookshelf',
        name: 'Bookshelf',
        description: 'Rows of books on law, business, and history.',
        clueId: null // Red herring or solution-specific
    },
    
    fireplace: {
        id: 'fireplace',
        name: 'Fireplace',
        description: 'A large fireplace with a fire poker. The fire has burned low.',
        clueId: null,
        getClueId: () => {
            if (!gameState.solution) return null;
            if (gameState.solution.id === 'B') return 'fire_poker_evidence';
            return null;
        }
    },
    
    kettle: {
        id: 'kettle',
        name: 'Kettle',
        description: 'A copper kettle, still warm. The water inside has been used recently.',
        clueId: null // Red herring
    },
    
    cabinet: {
        id: 'cabinet',
        name: 'Kitchen Cabinets',
        description: 'You search through the cabinets. Most contain normal kitchen supplies.',
        clueId: null // Red herring
    },
    
    chest: {
        id: 'chest',
        name: 'Chest of Drawers',
        description: 'Lydia\'s personal belongings. You find various items.',
        clueId: 'lydia_medicine'
    },
    
    window: {
        id: 'window',
        name: 'Window',
        description: 'You look out the window. The garden shed is visible in the distance.',
        clueId: null // Red herring
    },
    
    vanity: {
        id: 'vanity',
        name: 'Vanity Table',
        description: 'Eleanor\'s vanity. Among the cosmetics and perfumes, you find various items.',
        clueId: null,
        getClueId: () => {
            if (!gameState.solution) return null;
            if (gameState.solution.id === 'B') return 'emotional_neglect';
            return null;
        }
    },
    
    letter: {
        id: 'letter',
        name: 'Letter',
        description: 'A letter from a lawyer, dated two weeks ago.',
        clueId: null,
        getClueId: () => {
            if (!gameState.solution) return null;
            if (gameState.solution.id === 'C') return 'affair_evidence';
            return null;
        }
    },
    
    papers: {
        id: 'papers',
        name: 'Business Papers',
        description: 'Financial documents showing business transactions.',
        clueId: null,
        getClueId: () => {
            if (!gameState.solution) return null;
            if (gameState.solution.id === 'A') return 'business_documents';
            return null;
        }
    },
    
    briefcase: {
        id: 'briefcase',
        name: 'Briefcase',
        description: 'Marcus\'s briefcase. Inside, you find financial documents.',
        clueId: null,
        getClueId: () => {
            if (!gameState.solution) return null;
            if (gameState.solution.id === 'A') return 'letter_opener_missing';
            return null;
        }
    },
    
    tools: {
        id: 'tools',
        name: 'Gardening Tools',
        description: 'Standard gardening tools. Nothing unusual.',
        clueId: null // Red herring
    }
};

/**
 * Get object with dynamic clue
 * @param {string} objectId - Object ID
 * @returns {object|null} Object data with resolved clue
 */
export function getObject(objectId) {
    const obj = objects[objectId];
    if (!obj) return null;
    
    // Resolve clue ID (static or dynamic)
    let clueId = obj.clueId;
    if (!clueId && obj.getClueId) {
        clueId = obj.getClueId();
    }
    
    // Get clue from dynamic system
    let clue = null;
    if (clueId) {
        clue = getClueById(clueId);
    }
    
    return {
        ...obj,
        clue: clue
    };
}

/**
 * Suspect definitions
 * Suspects use dynamic dialogue from dialogue.js
 */
export const suspects = {
    eleanor: {
        id: 'eleanor',
        name: 'Eleanor Blackthorn',
        title: 'The Widow',
        description: 'Eleanor Blackthorn, Charles\'s wife. She appears composed, but there\'s a tension in her posture.',
        location: 'corridor',
        role: 'Widow of the victim',
        canBeKiller: true
    },
    
    marcus: {
        id: 'marcus',
        name: 'Marcus Vale',
        title: 'Business Partner',
        description: 'Marcus Vale, Charles\'s business partner. He\'s pacing, clearly agitated.',
        location: 'corridor',
        role: 'Business partner and friend',
        canBeKiller: true
    },
    
    lydia: {
        id: 'lydia',
        name: 'Lydia Crane',
        title: 'Household Maid',
        description: 'Lydia Crane, the household maid. She\'s young, nervous.',
        location: 'kitchen',
        role: 'Household servant',
        canBeKiller: false // NEVER the killer
    },
    
    hale: {
        id: 'hale',
        name: 'Dr. Thomas Hale',
        title: 'Family Physician',
        description: 'Dr. Thomas Hale, the family physician. He\'s examining his medical bag, looking troubled.',
        location: 'corridor',
        role: 'Family doctor',
        canBeKiller: true
    }
};

/**
 * Get suspect with dynamic dialogue
 * @param {string} suspectId - Suspect ID
 * @returns {object|null} Suspect data with resolved dialogue
 */
export function getSuspect(suspectId) {
    const suspect = suspects[suspectId];
    if (!suspect) return null;
    
    // Get dialogue from dynamic system
    const dialogue = getBestDialogue(suspectId);
    
    return {
        ...suspect,
        dialogue: dialogue
    };
}

/**
 * Get weapons for active solution
 * @returns {array} Array of weapon objects
 */
export function getWeapons() {
    if (!gameState.solution) {
        return [];
    }
    
    const weaponIds = getWeaponsForSolution(gameState.solution);
    
    const weaponDefinitions = {
        letterOpener: {
            id: 'letterOpener',
            name: 'Antique Letter Opener',
            description: 'A sharp antique letter opener, missing from Charles\'s desk. The desk shows signs of a struggle.'
        },
        firePoker: {
            id: 'firePoker',
            name: 'Fire Poker',
            description: 'A heavy fire poker from the study fireplace. Shows traces of blood and hair.'
        },
        syringe: {
            id: 'syringe',
            name: 'Syringe (sedative overdose)',
            description: 'A medical syringe found in Dr. Hale\'s bag. Contains traces of a powerful sedative.'
        }
    };
    
    return weaponIds.map(id => weaponDefinitions[id]).filter(Boolean);
}

/**
 * Dynamic endings based on solution
 */
export function getEnding(endingType) {
    if (!gameState.solution) {
        return {
            title: 'Game Over',
            text: 'The game has ended.'
        };
    }
    
    const solution = gameState.solution;
    const killerName = solution.killerName;
    const weaponName = solution.weaponName;
    const motive = solution.motive;
    
    const endings = {
        true: {
            title: 'The Truth Revealed',
            text: `You stand before the gathered suspects, your evidence laid out. The storm still rages outside, but inside, there is only silence.

"You killed him, ${killerName}," you say, your voice steady. "You used the ${weaponName}. ${motive}—you had to silence him."

${killerName}'s composure finally breaks. The truth hangs in the air like smoke. Justice will be served, but the manor will never be the same.

**TRUE ENDING: Justice Served**`
        },
        
        partial: {
            title: 'Incomplete Justice',
            text: `You accuse ${killerName} of the murder, and the evidence supports your claim. They are the killer.

However, you identified the wrong weapon. The true method was the ${weaponName}. While you found the truth about the murderer, the full picture remains incomplete.

${killerName} is taken into custody, but questions linger. The case is closed, but not solved.

**PARTIAL ENDING: Truth Half-Revealed**`
        },
        
        false: {
            title: 'Wrong Accusation',
            text: `You point your finger, confident in your accusation. But as the words leave your mouth, you realize your mistake.

The evidence doesn't align. Your accusation falls apart under scrutiny, and the real killer watches from the shadows, knowing they've escaped justice.

The storm continues, and the truth remains buried. You have failed.

**FALSE ENDING: Justice Denied**`
        },
        
        timeout: {
            title: 'Time Runs Out',
            text: `The clock strikes midnight. Your time is up.

You feel a presence behind you, and before you can turn, everything goes dark. The killer has silenced you, and the truth dies with you.

The storm rages on, and Blackthorn Manor keeps its secrets.

**GAME OVER: Silence Falls**`
        }
    };
    
    return endings[endingType] || endings.false;
}
