/**
 * Allowed Solution Profiles
 * 
 * EXACTLY THREE solutions are allowed. No others.
 * Each playthrough randomly selects ONE solution at game start.
 * All narrative logic adapts to the selected solution.
 */

export const SOLUTION_PROFILES = {
    A: {
        id: 'A',
        killer: 'marcus',
        killerName: 'Marcus Vale',
        weapon: 'letterOpener',
        weaponName: 'Antique Letter Opener',
        motive: 'Embezzlement discovered by Charles',
        description: 'Marcus killed Charles to prevent exposure of his embezzlement scheme.'
    },
    B: {
        id: 'B',
        killer: 'eleanor',
        killerName: 'Eleanor Blackthorn',
        weapon: 'firePoker',
        weaponName: 'Fire Poker',
        motive: 'Will rewrite and years of emotional neglect',
        description: 'Eleanor killed Charles after discovering he was rewriting his will to disinherit her.'
    },
    C: {
        id: 'C',
        killer: 'hale',
        killerName: 'Dr. Thomas Hale',
        weapon: 'syringe',
        weaponName: 'Syringe (sedative overdose)',
        motive: 'Affair exposure and medical malpractice risk',
        description: 'Dr. Hale killed Charles to prevent exposure of their affair and his medical malpractice.'
    }
};

/**
 * Get a random solution profile
 * @returns {object} Selected solution profile
 */
export function getRandomSolution() {
    const solutions = Object.values(SOLUTION_PROFILES);
    const randomIndex = Math.floor(Math.random() * solutions.length);
    return solutions[randomIndex];
}

/**
 * Get solution by ID
 * @param {string} solutionId - Solution ID ('A', 'B', or 'C')
 * @returns {object|null} Solution profile or null
 */
export function getSolutionById(solutionId) {
    return SOLUTION_PROFILES[solutionId] || null;
}

/**
 * Check if a suspect can be the killer
 * @param {string} suspectId - Suspect ID
 * @returns {boolean} True if suspect can be killer
 */
export function canBeKiller(suspectId) {
    // Lydia is NEVER the killer
    if (suspectId === 'lydia') {
        return false;
    }
    
    // Only marcus, eleanor, or hale can be killers
    return ['marcus', 'eleanor', 'hale'].includes(suspectId);
}

/**
 * Get all valid killer IDs
 * @returns {array} Array of valid killer IDs
 */
export function getValidKillers() {
    return ['marcus', 'eleanor', 'hale'];
}

/**
 * Get weapons for a solution
 * @param {object} solution - Solution profile
 * @returns {array} Array of weapon IDs valid for this solution
 */
export function getWeaponsForSolution(solution) {
    const weaponMap = {
        'A': ['letterOpener'],
        'B': ['firePoker'],
        'C': ['syringe']
    };
    
    return weaponMap[solution.id] || [];
}


