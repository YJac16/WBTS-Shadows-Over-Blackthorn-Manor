/**
 * Adaptive Dialogue System
 * 
 * Dialogue adapts based on the active scenario's narrativeNotes.
 * Uses scenario.narrativeNotes to provide character-specific dialogue.
 */

import { gameState } from './state.js';
import { SCENARIOS } from './scenarios.js';

/**
 * Base dialogue templates
 * These provide full dialogue text for each character
 */
const BASE_DIALOGUE = {
    eleanor: {
        initial: {
            text: 'I can\'t believe he\'s gone. We had our differences, but... this is terrible. Charles and I were married for years. Despite everything, I never wanted this.',
            suspicionIncrease: 5
        }
    },
    victor: {
        initial: {
            text: 'This is a disaster. Charles and I had a meeting scheduled for tomorrow. Now everything is... uncertain. We had business matters to discuss, important ones.',
            suspicionIncrease: 5
        }
    },
    thomas: {
        initial: {
            text: 'I... I don\'t know what happened. I was just doing my work in the garden. This is terrible. I\'ve worked here for years, and now...',
            suspicionIncrease: 5
        }
    },
    doctor: {
        initial: {
            text: 'I examined the body. The cause of death is clear, but the circumstances are troubling. As a physician, I\'ve seen many things, but this... this is different.',
            suspicionIncrease: 5
        }
    },
    lydia: {
        initial: {
            text: 'I... I don\'t know anything about what happened. I was in the kitchen most of the evening, preparing dinner. This is all so terrible. I\'ve worked here for so long, and now...',
            suspicionIncrease: 3
        }
    }
};

/**
 * Get dialogue for a suspect based on active scenario
 * @param {string} suspectId - Suspect ID
 * @returns {object|null} Dialogue data or null
 */
export function getBestDialogue(suspectId) {
    if (!gameState.activeScenario) {
        // Fallback to base dialogue
        const baseDialogue = BASE_DIALOGUE[suspectId];
        if (baseDialogue && baseDialogue.initial) {
            return {
                text: baseDialogue.initial.text,
                suspicionIncrease: baseDialogue.initial.suspicionIncrease || 5
            };
        }
        return {
            text: '...',
            suspicionIncrease: 0
        };
    }
    
    const scenario = gameState.activeScenario;
    const isCulprit = suspectId === scenario.culprit;
    
    // Get narrative note for this character
    const narrativeNote = scenario.narrativeNotes[suspectId];
    
    if (narrativeNote) {
        // Build dialogue text from narrative note and character-specific dialogue
        let text = '';
        
        // Get base dialogue for this character
        const baseDialogue = BASE_DIALOGUE[suspectId];
        const baseText = baseDialogue?.initial?.text || '';
        
        // Build full dialogue based on narrative note and character
        if (suspectId === 'eleanor') {
            if (isCulprit) {
                text = baseText + ' ' + narrativeNote + ' I had my reasons, but I never wanted it to come to this.';
            } else {
                text = baseText + ' ' + narrativeNote;
            }
        } else if (suspectId === 'victor') {
            if (isCulprit) {
                text = baseText + ' ' + narrativeNote + ' Charles and I had our disagreements, but this... this is beyond anything I expected.';
            } else {
                text = baseText + ' ' + narrativeNote;
            }
        } else if (suspectId === 'thomas') {
            if (isCulprit) {
                text = baseText + ' ' + narrativeNote + ' I didn\'t mean for it to happen this way. It was an accident, I swear!';
            } else {
                text = baseText + ' ' + narrativeNote;
            }
        } else if (suspectId === 'doctor') {
            if (isCulprit) {
                text = baseText + ' ' + narrativeNote + ' I\'ve dedicated my life to medicine, but sometimes circumstances force difficult choices.';
            } else {
                text = baseText + ' ' + narrativeNote;
            }
        } else {
            // Fallback
            text = baseText || narrativeNote;
        }
        
        // Calculate suspicion increase based on whether they're the culprit
        let suspicionIncrease = 5;
        if (isCulprit) {
            suspicionIncrease = 15; // Higher suspicion for culprit
        } else if (narrativeNote.includes('Mentions') || narrativeNote.includes('Confirms')) {
            suspicionIncrease = 8; // Medium suspicion for those with relevant info
        }
        
        return {
            text: text,
            suspicionIncrease: suspicionIncrease
        };
    }
    
    // Fallback to base dialogue
    const baseDialogue = BASE_DIALOGUE[suspectId];
    if (baseDialogue && baseDialogue.initial) {
        return {
            text: baseDialogue.initial.text,
            suspicionIncrease: baseDialogue.initial.suspicionIncrease || 5
        };
    }
    
    return {
        text: '...',
        suspicionIncrease: 0
    };
}

/**
 * Update character profile based on dialogue
 * Adds motive and opportunity clues when appropriate
 * @param {string} suspectId - Suspect ID
 * @param {object} dialogue - Dialogue data
 */
export function updateProfileFromDialogue(suspectId, dialogue) {
    if (!gameState.activeScenario) {
        return;
    }
    
    const scenario = gameState.activeScenario;
    const isCulprit = suspectId === scenario.culprit;
    
    // If this is the culprit, add motive clue
    if (isCulprit && !gameState.knownCharacters[suspectId].motives.includes(scenario.motive)) {
        gameState.knownCharacters[suspectId].motives.push(scenario.motive);
    }
    
    // Add opportunity if they were alone with Charles or had access
    const narrativeNote = scenario.narrativeNotes[suspectId];
    if (narrativeNote) {
        // Check for various opportunity indicators
        const hasOpportunity = narrativeNote.includes('alone') || 
                               narrativeNote.includes('prepared') || 
                               narrativeNote.includes('with Charles') ||
                               narrativeNote.includes('arrive') ||
                               narrativeNote.includes('medical') ||
                               (suspectId === scenario.culprit); // Culprit always had opportunity
        
        if (hasOpportunity) {
            const opportunity = suspectId === 'doctor' 
                ? 'Had medical access to the victim and was alone with him.'
                : 'Had access to the victim at the time of death.';
            if (!gameState.knownCharacters[suspectId].opportunities.includes(opportunity)) {
                gameState.knownCharacters[suspectId].opportunities.push(opportunity);
            }
        }
    }
    
    // For the culprit, always ensure they have opportunity
    if (isCulprit && gameState.knownCharacters[suspectId].opportunities.length === 0) {
        const opportunity = suspectId === 'doctor' 
            ? 'Had medical access to the victim and was alone with him.'
            : 'Had access to the victim at the time of death.';
        gameState.knownCharacters[suspectId].opportunities.push(opportunity);
    }
}
