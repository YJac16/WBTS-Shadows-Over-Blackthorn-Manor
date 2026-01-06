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
import { getClueById } from './clues.js';
import { getBestDialogue } from './dialogue.js';
import { getAllWeapons as getAllWeaponsFromModule } from './weapons.js';

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
            { id: 'go_garden', text: 'Go to the Garden', location: 'garden', timeCost: 1 },
            { id: 'examine_portrait', text: 'Examine the family portrait', object: 'portrait', timeCost: 1 }
        ]
    },
    
    study: {
        id: 'study',
        name: 'Study',
        initialDescription: 'You stand in the study of Blackthorn Manor. Charles Blackthorn lies dead at his desk. The storm rages outside, and you know there is no escape until morning. Someone in this house is the killer. The investigation begins here.',
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
            { id: 'examine_window', text: 'Look out the window', object: 'window', timeCost: 1 },
            { id: 'talk_lydia', text: 'Talk to Lydia Crane', suspect: 'lydia', timeCost: 1 }
        ]
    },
    
    corridor: {
        id: 'corridor',
        name: 'Upstairs Corridor',
        description: 'A long, dark corridor. Portraits line the walls, their eyes seeming to follow you. Doors lead to various rooms. The floorboards creak under your weight.',
        actions: [
            { id: 'go_hall', text: 'Return to Grand Hall', location: 'grandHall', timeCost: 1 },
            { id: 'go_eleanor_room', text: 'Go to Eleanor\'s Room', location: 'eleanorRoom', timeCost: 1 },
            { id: 'go_marcus_room', text: 'Go to Victor\'s Room', location: 'marcusRoom', timeCost: 1 },
            { id: 'go_medical_room', text: 'Go to Medical Room', location: 'medicalRoom', timeCost: 1 },
            { id: 'talk_eleanor', text: 'Talk to Eleanor Blackthorn', suspect: 'eleanor', timeCost: 1 },
            { id: 'talk_victor', text: 'Talk to Victor Hale', suspect: 'victor', timeCost: 1 },
            { id: 'talk_doctor', text: 'Talk to Dr. Adrian Whitlock', suspect: 'doctor', timeCost: 1 }
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
        name: 'Victor\'s Room',
        description: 'A guest room. Business papers are scattered on a desk. A briefcase sits open, revealing financial documents. Everything is neat, almost too neat.',
        actions: [
            { id: 'go_corridor', text: 'Return to Corridor', location: 'corridor', timeCost: 1 },
            { id: 'examine_papers', text: 'Examine the business papers', object: 'papers', timeCost: 1 },
            { id: 'examine_briefcase', text: 'Search the briefcase', object: 'briefcase', timeCost: 1 }
        ]
    },
    
    garden: {
        id: 'garden',
        name: 'Garden',
        description: 'The manor\'s garden stretches before you. Well-tended flower beds and hedges line the paths. A small shed stands at the far edge. The storm has left everything damp and dark.',
        actions: [
            { id: 'go_hall', text: 'Return to Grand Hall', location: 'grandHall', timeCost: 1 },
            { id: 'go_gardenShed', text: 'Go to Garden Shed', location: 'gardenShed', timeCost: 1 },
            { id: 'talk_thomas', text: 'Talk to Thomas Reed', suspect: 'thomas', timeCost: 1 }
        ]
    },
    
    gardenShed: {
        id: 'gardenShed',
        name: 'Garden Shed',
        description: 'A small shed at the edge of the garden. Gardening tools hang on the walls. The air smells of earth and something chemical.',
        actions: [
            { id: 'go_garden', text: 'Return to Garden', location: 'garden', timeCost: 1 },
            { id: 'examine_tools', text: 'Examine the gardening tools', object: 'tools', timeCost: 1 }
        ]
    },
    
    medicalRoom: {
        id: 'medicalRoom',
        name: 'Medical Room',
        description: 'A small medical room with a bed, medical supplies, and equipment. The room is clean and organized, but something feels off. Dr. Whitlock\'s medical bag sits on a table.',
        actions: [
            { id: 'go_corridor', text: 'Return to Corridor', location: 'corridor', timeCost: 1 },
            { id: 'examine_medical_bag', text: 'Examine the medical bag', object: 'medical_bag', timeCost: 1 },
            { id: 'examine_medical_supplies', text: 'Examine medical supplies', object: 'medical_supplies', timeCost: 1 },
            { id: 'talk_doctor', text: 'Talk to Dr. Adrian Whitlock', suspect: 'doctor', timeCost: 1 }
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
        description: 'A large portrait of the Blackthorn family. Charles and Eleanor stand together, but there\'s a distance between them. Behind the portrait, you discover something hidden.',
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
    
    victor: {
        id: 'victor',
        name: 'Victor Hale',
        title: 'Business Associate',
        description: 'Victor Hale, Charles\'s business associate. He\'s pacing, clearly agitated.',
        location: 'corridor',
        role: 'Business associate and partner',
        canBeKiller: true
    },
    
    thomas: {
        id: 'thomas',
        name: 'Thomas Reed',
        title: 'Gardener',
        description: 'Thomas Reed, the manor\'s gardener and cleaner. He keeps to himself, working in the gardens and sheds.',
        location: 'garden',
        role: 'Gardener and cleaner',
        canBeKiller: true
    },
    
    doctor: {
        id: 'doctor',
        name: 'Dr. Adrian Whitlock',
        title: 'Family Physician',
        description: 'Dr. Adrian Whitlock, the family physician. He\'s examining his medical bag, looking troubled.',
        location: 'medicalRoom',
        role: 'Family doctor',
        canBeKiller: true
    },
    
    lydia: {
        id: 'lydia',
        name: 'Lydia Crane',
        title: 'The Maid',
        description: 'Lydia Crane, the manor\'s maid. She seems nervous and keeps to herself.',
        location: 'servants',
        role: 'Household maid',
        canBeKiller: false
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
 * Get all possible weapons (imported from weapons.js)
 * @returns {array} Array of all weapon objects
 */
export function getAllWeapons() {
    return getAllWeaponsFromModule();
}

/**
 * Get weapons for active solution (legacy function for compatibility)
 * @returns {array} Array of weapon objects
 */
export function getWeapons() {
    return getAllWeapons();
}

/**
 * Dynamic endings based on active scenario
 */
export function getEnding(endingType) {
    const scenario = gameState.activeScenario || gameState.solution;
    
    if (!scenario) {
        return {
            title: 'Game Over',
            text: 'The game has ended.'
        };
    }
    
    // Get killer name from suspects
    const killerId = scenario.culprit;
    const killerSuspect = suspects[killerId];
    const killerName = killerSuspect?.name || 'Unknown';
    
    // Get weapon name from found weapon or scenario
    const weaponId = scenario.validWeapons[0]; // First valid weapon
    const weaponObj = getAllWeapons().find(w => w.id === weaponId);
    const weaponName = weaponObj?.name || 'Unknown Weapon';
    
    const motive = scenario.motive;
    const accusedSuspect = gameState.accusation.suspect;
    const accusedWeapon = gameState.accusation.weapon;
    
    // Get accused suspect name
    const accusedSuspectName = suspects[accusedSuspect]?.name || 'Unknown';
    const accusedWeaponObj = getAllWeapons().find(w => w.id === accusedWeapon);
    const accusedWeaponName = accusedWeaponObj?.name || 'Unknown Weapon';
    
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
            text: `You accuse ${accusedSuspectName} of the murder. ${accusedSuspectName === killerName ? 'They are indeed the killer.' : 'But your accusation is wrong.'}

${accusedSuspectName === killerName 
    ? `However, you identified the wrong weapon. The true method was the ${weaponName}. While you found the truth about the murderer, the full picture remains incomplete.`
    : `The evidence doesn't support your claim. The real killer remains at large.`}

${accusedSuspectName === killerName 
    ? `${killerName} is taken into custody, but questions linger. The case is closed, but not solved.`
    : `The storm continues, and the truth remains buried.`}

**PARTIAL ENDING: Truth Half-Revealed**`
        },
        
        false_weapon_type: {
            title: 'Inconsistent Evidence',
            text: `You accuse ${accusedSuspectName} using the ${accusedWeaponName}.

But wait—the autopsy report contradicts your accusation. The cause of death doesn't match this weapon type. Your theory falls apart.

${accusedSuspectName === killerName 
    ? `You were on the right track about the killer, but the weapon evidence doesn't align. The autopsy is clear: this weapon could not have caused the death.`
    : `Your accusation is wrong on multiple levels. The evidence doesn't support your theory.`}

The investigation continues, but your credibility has been damaged. Time is running out.

**FAILED: Evidence Inconsistency**`
        },
        
        false: {
            title: 'Wrong Accusation',
            text: `You point your finger at ${accusedSuspectName}, confident in your accusation. But as the words leave your mouth, you realize your mistake.

The evidence doesn't align. Your accusation falls apart under scrutiny, and the real killer watches from the shadows, knowing they've escaped justice.

${gameState.timeRemaining > 0 
    ? `You still have time to reconsider, but suspicion is mounting.`
    : `Time has run out. The truth remains buried.`}

The storm continues, and Blackthorn Manor keeps its secrets.

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
