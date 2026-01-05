/**
 * Adaptive Dialogue System
 * 
 * Dialogue adapts based on the active solution.
 * If a character is the killer, they lie defensively.
 * If innocent, they may still hide unrelated secrets.
 */

import { gameState } from './state.js';

/**
 * Base dialogue templates
 * These adapt based on gameState.solution
 */
export const DIALOGUE_TEMPLATES = {
    marcus: {
        initial: {
            text: (isKiller) => isKiller 
                ? '"This is terrible. Charles and I had our meeting scheduled for tomorrow. Now everything is... ruined." He seems genuinely distressed, but there\'s something off about his reaction.'
                : '"This is a disaster. Charles and I had a meeting scheduled for tomorrow. Now everything is..." He stops, realizing how that sounds.',
            suspicionIncrease: 5
        },
        after_embezzlement: {
            text: (isKiller) => isKiller
                ? '"Those documents? They\'re forgeries. Someone is trying to frame me. I would never..." His voice cracks slightly. "I had every reason to keep Charles alive."'
                : '"Yes, my business was struggling. But killing Charles wouldn\'t help me. His signature was what I needed." He seems desperate.',
            suspicionIncrease: (isKiller) => isKiller ? 15 : 10,
            requiredClue: 'embezzlement_evidence'
        },
        after_letter_opener: {
            text: (isKiller) => isKiller
                ? '"A letter opener? I don\'t know what you\'re talking about. I haven\'t been in the study since this morning." His hands are shaking.'
                : '"A letter opener? I saw it on his desk earlier. But I haven\'t touched it."',
            suspicionIncrease: (isKiller) => isKiller ? 20 : 5,
            requiredClue: 'letter_opener_missing'
        }
    },
    
    eleanor: {
        initial: {
            text: (isKiller) => isKiller
                ? '"I can\'t believe he\'s gone. We had our differences, but... this is terrible." Her voice is measured, almost rehearsed. Too calm.'
                : '"I can\'t believe he\'s gone. We had our differences, but... this is terrible." Her voice is measured, almost rehearsed.',
            suspicionIncrease: 5
        },
        after_will: {
            text: (isKiller) => isKiller
                ? '"A new will? I had no idea. He never mentioned it to me." Her composure cracks slightly. "But that doesn\'t mean I would... I loved him."'
                : '"A new will? I had no idea. He never mentioned it to me." Her composure cracks slightly. "But that doesn\'t mean I would..." She trails off.',
            suspicionIncrease: (isKiller) => isKiller ? 15 : 10,
            requiredClue: 'new_will'
        },
        after_fire_poker: {
            text: (isKiller) => isKiller
                ? '"The fire poker? I haven\'t touched it. Someone must have... someone is trying to frame me!" Her voice rises with panic.'
                : '"The fire poker? I haven\'t touched it. Someone must have moved it."',
            suspicionIncrease: (isKiller) => isKiller ? 20 : 5,
            requiredClue: 'fire_poker_evidence'
        }
    },
    
    hale: {
        initial: {
            text: (isKiller) => isKiller
                ? '"I\'ve seen many deaths, but this one... the symptoms suggest something unnatural. But I can\'t be certain." He avoids eye contact.'
                : '"I\'ve seen many deaths, but this one... the symptoms suggest poisoning. But I can\'t be certain without proper tests."',
            suspicionIncrease: 0
        },
        after_syringe: {
            text: (isKiller) => isKiller
                ? '"That syringe? It\'s standard medical equipment. I use it for... for patient care. There\'s nothing suspicious about it." He\'s defensive.'
                : '"That syringe? It\'s standard medical equipment. I use it for patient care. But I haven\'t used it today."',
            suspicionIncrease: (isKiller) => isKiller ? 20 : 5,
            requiredClue: 'syringe_evidence'
        },
        after_affair: {
            text: (isKiller) => isKiller
                ? '"Those letters? They\'re... they\'re private. Personal matters. Nothing to do with Charles\'s death." He looks guilty.'
                : '"Those letters? They\'re private. Personal matters. Nothing to do with Charles\'s death."',
            suspicionIncrease: (isKiller) => isKiller ? 15 : 10,
            requiredClue: 'affair_evidence'
        }
    },
    
    lydia: {
        initial: {
            text: () => '"I found him. I brought his tea, and there he was... I screamed. I didn\'t touch anything, I swear."',
            suspicionIncrease: 0
        },
        after_medicine: {
            text: () => '"That bottle? It\'s medicine. For my... for my condition. It\'s not poison, I swear." She looks terrified.',
            suspicionIncrease: 0,
            requiredClue: 'lydia_medicine'
        }
    }
};

/**
 * Get dialogue for a suspect
 * @param {string} suspectId - Suspect ID
 * @param {string} dialogueKey - Dialogue key (e.g., 'initial', 'after_clue')
 * @returns {object|null} Dialogue data or null
 */
export function getDialogue(suspectId, dialogueKey = 'initial') {
    if (!gameState.solution) {
        return null;
    }
    
    const suspectDialogues = DIALOGUE_TEMPLATES[suspectId];
    if (!suspectDialogues || !suspectDialogues[dialogueKey]) {
        return null;
    }
    
    const dialogueTemplate = suspectDialogues[dialogueKey];
    const isKiller = gameState.solution.killer === suspectId;
    
    // Get text (function or string)
    let text = dialogueTemplate.text;
    if (typeof text === 'function') {
        text = text(isKiller);
    }
    
    // Get suspicion increase (function or number)
    let suspicionIncrease = dialogueTemplate.suspicionIncrease || 0;
    if (typeof suspicionIncrease === 'function') {
        suspicionIncrease = suspicionIncrease(isKiller);
    }
    
    return {
        text: text,
        suspicionIncrease: suspicionIncrease,
        requiredClue: dialogueTemplate.requiredClue || null
    };
}

/**
 * Get best available dialogue for a suspect
 * Checks collected clues and returns most advanced dialogue
 * @param {string} suspectId - Suspect ID
 * @returns {object|null} Dialogue data or null
 */
export function getBestDialogue(suspectId) {
    if (!gameState.solution) {
        return null;
    }
    
    const suspectDialogues = DIALOGUE_TEMPLATES[suspectId];
    if (!suspectDialogues) {
        return null;
    }
    
    // Get all dialogue keys, sorted by priority (most specific first)
    const dialogueKeys = Object.keys(suspectDialogues).sort((a, b) => {
        // Prioritize dialogues with requiredClue
        const aHasClue = suspectDialogues[a].requiredClue ? 1 : 0;
        const bHasClue = suspectDialogues[b].requiredClue ? 1 : 0;
        return bHasClue - aHasClue;
    });
    
    // Find the most advanced dialogue the player has unlocked
    for (const key of dialogueKeys) {
        const dialogue = suspectDialogues[key];
        if (!dialogue.requiredClue || gameState.collectedClues.has(dialogue.requiredClue)) {
            return getDialogue(suspectId, key);
        }
    }
    
    // Fallback to initial
    return getDialogue(suspectId, 'initial');
}


