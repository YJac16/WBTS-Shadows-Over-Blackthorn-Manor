/**
 * Dynamic Clue System
 *
 * Clues adapt based on the active scenario.
 */

import { gameState } from './state.js';

export const CLUE_TEMPLATES = {
    body_examination: {
        id: 'body_examination',
        title: 'Cause of Death',
        baseText: 'Charles Blackthorn\'s body shows signs of {method}.',
        supports: ['eleanor', 'victor', 'thomas', 'doctor', 'lydia'],
        contradicts: [],
        requiredForSolution: true
    },

    embezzlement_evidence: {
        id: 'embezzlement_evidence',
        title: 'Embezzlement Evidence',
        baseText: 'Financial documents reveal discrepancies in Victor Hale\'s accounts. Large sums are unaccounted for.',
        supports: ['victor'],
        contradicts: ['eleanor', 'thomas', 'doctor', 'lydia'],
        requiredForSolution: ['victor_sharp']
    },

    letter_opener_missing: {
        id: 'letter_opener_missing',
        title: 'Missing Letter Opener',
        baseText: 'An antique letter opener is missing from its usual place among the papers. Someone moved it recently.',
        supports: ['victor'],
        contradicts: ['eleanor', 'thomas', 'doctor', 'lydia'],
        requiredForSolution: ['victor_sharp']
    },

    business_documents: {
        id: 'business_documents',
        title: 'Business Documents',
        baseText: 'Charles was preparing to expose Victor\'s embezzlement. Documents show he planned to cut ties.',
        supports: ['victor'],
        contradicts: ['eleanor', 'thomas', 'doctor', 'lydia'],
        requiredForSolution: ['victor_sharp']
    },

    new_will: {
        id: 'new_will',
        title: 'New Will Draft',
        baseText: 'A draft of a new will disinheriting Eleanor was found. It would have left her with nothing.',
        supports: ['eleanor'],
        contradicts: ['victor', 'thomas', 'doctor', 'lydia'],
        requiredForSolution: ['wife_poison']
    },

    fire_poker_evidence: {
        id: 'fire_poker_evidence',
        title: 'Fire Poker Evidence',
        baseText: 'The fireplace shows disturbance. Ash and soot suggest a heavy iron tool was used and wiped hastily.',
        supports: ['thomas'],
        contradicts: ['eleanor', 'victor', 'doctor', 'lydia'],
        requiredForSolution: ['gardener_blunt']
    },

    emotional_neglect: {
        id: 'emotional_neglect',
        title: 'Years of Neglect',
        baseText: 'Letters and diaries reveal a broken marriage — and Eleanor\'s growing desperation about money.',
        supports: ['eleanor'],
        contradicts: ['victor', 'thomas', 'doctor', 'lydia'],
        requiredForSolution: ['wife_poison']
    },

    malpractice_letter: {
        id: 'malpractice_letter',
        title: 'Malpractice Letter',
        baseText: 'A letter from Charles threatens to report Dr. Whitlock for medical malpractice unless he resigns.',
        supports: ['doctor'],
        contradicts: ['eleanor', 'victor', 'thomas', 'lydia'],
        requiredForSolution: ['doctor_precision']
    },

    scalpel_missing: {
        id: 'scalpel_missing',
        title: 'Missing Scalpel',
        baseText: 'One slot in the medical bag is empty. A surgical scalpel is unaccounted for.',
        supports: ['doctor'],
        contradicts: ['eleanor', 'victor', 'thomas', 'lydia'],
        requiredForSolution: ['doctor_precision']
    },

    poison_trace: {
        id: 'poison_trace',
        title: 'Toxic Compound',
        baseText: 'Among the medical supplies sits an unmarked vial residue — consistent with a tasteless poison.',
        supports: ['eleanor'],
        contradicts: ['victor', 'thomas', 'doctor', 'lydia'],
        requiredForSolution: ['wife_poison']
    },

    lydia_theft_note: {
        id: 'lydia_theft_note',
        title: 'Dismissal Threat',
        baseText: 'A note in Charles\'s hand: Lydia is to be dismissed for theft. Exposure would ruin her.',
        supports: ['lydia'],
        contradicts: ['eleanor', 'victor', 'thomas', 'doctor'],
        requiredForSolution: ['maid_knife']
    },

    missing_knife: {
        id: 'missing_knife',
        title: 'Missing Kitchen Knife',
        baseText: 'A carving knife is missing from the kitchen block. The slot is empty and recently wiped.',
        supports: ['lydia'],
        contradicts: ['eleanor', 'victor', 'thomas', 'doctor'],
        requiredForSolution: ['maid_knife']
    },

    family_portrait: {
        id: 'family_portrait',
        title: 'Family Portrait',
        baseText: 'The family portrait shows tension between Charles and Eleanor. Their body language suggests a strained relationship.',
        supports: [],
        contradicts: [],
        requiredForSolution: []
    },

    lydia_medicine: {
        id: 'lydia_medicine',
        title: 'Lydia\'s Medicine',
        baseText: 'A bottle of medicine found in Lydia\'s room. It\'s for a personal condition — not proof of murder on its own.',
        supports: [],
        contradicts: [],
        requiredForSolution: []
    }
};

function getScenario() {
    return gameState.activeScenario || gameState.solution;
}

/**
 * Get clues for the active scenario
 */
export function getActiveClues() {
    const scenario = getScenario();
    if (!scenario) {
        return {};
    }

    const activeClues = {};
    const culprit = scenario.culprit;

    Object.values(CLUE_TEMPLATES).forEach(template => {
        const isRequired = template.requiredForSolution === true ||
            (Array.isArray(template.requiredForSolution) &&
                template.requiredForSolution.includes(scenario.id));

        const contradictsCulprit = template.contradicts.includes(culprit);
        const isRedHerring = Array.isArray(template.requiredForSolution) &&
            template.requiredForSolution.length === 0;

        const shouldInclude = isRequired ||
            (isRedHerring && !contradictsCulprit) ||
            (template.supports.includes(culprit) && !contradictsCulprit);

        if (shouldInclude) {
            activeClues[template.id] = {
                id: template.id,
                title: template.title,
                text: template.baseText,
                supports: template.supports,
                contradicts: template.contradicts,
                requiredForSolution: isRequired
            };
        }
    });

    return activeClues;
}

/**
 * Get clue by ID for active scenario
 */
export function getClueById(clueId) {
    if (clueId === 'body_examination') {
        if (!getScenario()) {
            return null;
        }

        const scenario = getScenario();
        let methodText = 'violence.';
        switch (scenario.causeOfDeath) {
            case 'poison':
                methodText = 'internal poisoning. No external wounds visible.';
                break;
            case 'lacerations':
                methodText = 'sharp-force trauma. Multiple lacerations suggest a stabbing.';
                break;
            case 'blunt_force':
                methodText = 'blunt-force trauma. Severe trauma to the skull.';
                break;
            case 'precision_incision':
                methodText = 'a precise surgical incision. The wound shows medical precision.';
                break;
        }

        return {
            id: 'body_examination',
            title: 'Cause of Death',
            text: `Charles Blackthorn's body shows signs of ${methodText}`,
            supports: [],
            contradicts: [],
            requiredForSolution: true
        };
    }

    const activeClues = getActiveClues();
    if (activeClues[clueId]) {
        return activeClues[clueId];
    }

    // Fallback: return template even if not filtered in (so object getClueId still works)
    const template = CLUE_TEMPLATES[clueId];
    if (template) {
        return {
            id: template.id,
            title: template.title,
            text: template.baseText,
            supports: template.supports,
            contradicts: template.contradicts,
            requiredForSolution: false
        };
    }

    return null;
}

export function getCluesSupporting(suspectId) {
    const activeClues = getActiveClues();
    return Object.values(activeClues)
        .filter(clue => clue.supports.includes(suspectId))
        .map(clue => clue.id);
}

export function getCluesContradicting(suspectId) {
    const activeClues = getActiveClues();
    return Object.values(activeClues)
        .filter(clue => clue.contradicts.includes(suspectId))
        .map(clue => clue.id);
}
