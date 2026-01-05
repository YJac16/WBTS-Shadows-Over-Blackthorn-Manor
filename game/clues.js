/**
 * Dynamic Clue System
 * 
 * Clues adapt based on the active solution.
 * Each clue defines which suspects it supports or contradicts.
 * Clues are filtered and modified based on gameState.solution.
 */

import { gameState } from './state.js';

/**
 * Base clue definitions
 * These are templates that adapt to the active solution
 */
export const CLUE_TEMPLATES = {
    // Body examination clues
    body_examination: {
        id: 'body_examination',
        title: 'Cause of Death',
        baseText: 'Charles Blackthorn\'s body shows signs of {method}.',
        supports: ['marcus', 'eleanor', 'hale'], // All can kill
        contradicts: [],
        requiredForSolution: true
    },
    
    // Marcus-specific clues (Solution A)
    embezzlement_evidence: {
        id: 'embezzlement_evidence',
        title: 'Embezzlement Evidence',
        baseText: 'Financial documents reveal discrepancies in Marcus Vale\'s accounts. Large sums are unaccounted for.',
        supports: ['marcus'],
        contradicts: ['eleanor', 'hale', 'lydia'],
        requiredForSolution: ['A']
    },
    
    letter_opener_missing: {
        id: 'letter_opener_missing',
        title: 'Missing Letter Opener',
        baseText: 'An antique letter opener is missing from Charles\'s desk. The desk shows signs of a struggle.',
        supports: ['marcus'],
        contradicts: ['eleanor', 'hale', 'lydia'],
        requiredForSolution: ['A']
    },
    
    business_documents: {
        id: 'business_documents',
        title: 'Business Documents',
        baseText: 'Charles was preparing to expose Marcus\'s embezzlement. Documents show he planned to cut ties.',
        supports: ['marcus'],
        contradicts: ['eleanor', 'hale', 'lydia'],
        requiredForSolution: ['A']
    },
    
    // Eleanor-specific clues (Solution B)
    new_will: {
        id: 'new_will',
        title: 'New Will Draft',
        baseText: 'A draft of a new will disinheriting Eleanor was found. It would have left her with nothing.',
        supports: ['eleanor'],
        contradicts: ['marcus', 'hale', 'lydia'],
        requiredForSolution: ['B']
    },
    
    fire_poker_evidence: {
        id: 'fire_poker_evidence',
        title: 'Fire Poker Evidence',
        baseText: 'The fire poker shows signs of recent use. There are traces of blood and hair on it.',
        supports: ['eleanor'],
        contradicts: ['marcus', 'hale', 'lydia'],
        requiredForSolution: ['B']
    },
    
    emotional_neglect: {
        id: 'emotional_neglect',
        title: 'Years of Neglect',
        baseText: 'Evidence suggests years of emotional neglect. Letters and diaries reveal a broken marriage.',
        supports: ['eleanor'],
        contradicts: ['marcus', 'hale', 'lydia'],
        requiredForSolution: ['B']
    },
    
    // Hale-specific clues (Solution C)
    syringe_evidence: {
        id: 'syringe_evidence',
        title: 'Syringe Found',
        baseText: 'A syringe is found in Dr. Hale\'s medical bag. It contains traces of a powerful sedative.',
        supports: ['hale'],
        contradicts: ['marcus', 'eleanor', 'lydia'],
        requiredForSolution: ['C']
    },
    
    affair_evidence: {
        id: 'affair_evidence',
        title: 'Affair Evidence',
        baseText: 'Letters reveal an affair between Dr. Hale and Eleanor. Charles discovered this.',
        supports: ['hale'],
        contradicts: ['marcus', 'eleanor', 'lydia'],
        requiredForSolution: ['C']
    },
    
    malpractice_risk: {
        id: 'malpractice_risk',
        title: 'Medical Malpractice',
        baseText: 'Evidence suggests Dr. Hale made a critical error in treating a patient. Charles knew and threatened exposure.',
        supports: ['hale'],
        contradicts: ['marcus', 'eleanor', 'lydia'],
        requiredForSolution: ['C']
    },
    
    // Red herrings (appear in all solutions but don't point to true killer)
    family_portrait: {
        id: 'family_portrait',
        title: 'Family Portrait',
        baseText: 'The family portrait shows tension between Charles and Eleanor. Their body language suggests a strained relationship.',
        supports: [],
        contradicts: [],
        requiredForSolution: [] // Red herring
    },
    
    lydia_medicine: {
        id: 'lydia_medicine',
        title: 'Lydia\'s Medicine',
        baseText: 'A bottle of medicine found in Lydia\'s room. It\'s for a personal condition, not related to the murder.',
        supports: [],
        contradicts: [],
        requiredForSolution: [] // Red herring
    },
    
    business_troubles: {
        id: 'business_troubles',
        title: 'Business Troubles',
        baseText: 'Marcus\'s business was struggling, but killing Charles wouldn\'t help—he needed Charles\'s signature.',
        supports: [],
        contradicts: ['marcus'], // Contradicts if Marcus is NOT the killer
        requiredForSolution: [] // Red herring
    }
};

/**
 * Get clues for the active solution
 * Filters and adapts clues based on gameState.solution
 * @returns {object} Object mapping clue IDs to clue data
 */
export function getActiveClues() {
    if (!gameState.solution) {
        return {};
    }
    
    const activeClues = {};
    const solution = gameState.solution;
    
    Object.values(CLUE_TEMPLATES).forEach(template => {
        // Check if clue is required for this solution
        const isRequired = template.requiredForSolution === true || 
                          (Array.isArray(template.requiredForSolution) && 
                           template.requiredForSolution.includes(solution.id));
        
        // Check if clue contradicts the solution
        const contradictsSolution = template.contradicts.includes(solution.killer);
        
        // Include clue if:
        // 1. It's required for this solution, OR
        // 2. It's a red herring (not required, doesn't contradict), OR
        // 3. It supports the killer (but isn't required)
        const shouldInclude = isRequired || 
                             (!contradictsSolution && template.requiredForSolution.length === 0) ||
                             (template.supports.includes(solution.killer) && !isRequired);
        
        if (shouldInclude) {
            // Adapt clue text based on solution
            let text = template.baseText;
            
            // Replace placeholders
            if (solution.id === 'A') {
                text = text.replace('{method}', 'a sharp object—likely a letter opener');
            } else if (solution.id === 'B') {
                text = text.replace('{method}', 'blunt force trauma—consistent with a fire poker');
            } else if (solution.id === 'C') {
                text = text.replace('{method}', 'sedative overdose—consistent with medical injection');
            }
            
            activeClues[template.id] = {
                id: template.id,
                title: template.title,
                text: text,
                supports: template.supports,
                contradicts: template.contradicts,
                requiredForSolution: isRequired
            };
        }
    });
    
    return activeClues;
}

/**
 * Get clue by ID for active solution
 * @param {string} clueId - Clue ID
 * @returns {object|null} Clue data or null
 */
export function getClueById(clueId) {
    const activeClues = getActiveClues();
    return activeClues[clueId] || null;
}

/**
 * Get clues that support a suspect
 * @param {string} suspectId - Suspect ID
 * @returns {array} Array of clue IDs
 */
export function getCluesSupporting(suspectId) {
    const activeClues = getActiveClues();
    return Object.values(activeClues)
        .filter(clue => clue.supports.includes(suspectId))
        .map(clue => clue.id);
}

/**
 * Get clues that contradict a suspect
 * @param {string} suspectId - Suspect ID
 * @returns {array} Array of clue IDs
 */
export function getCluesContradicting(suspectId) {
    const activeClues = getActiveClues();
    return Object.values(activeClues)
        .filter(clue => clue.contradicts.includes(suspectId))
        .map(clue => clue.id);
}


