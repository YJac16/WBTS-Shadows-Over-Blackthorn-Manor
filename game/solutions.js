/**
 * Scenario Profiles
 * 
 * EXACTLY FOUR scenarios are allowed. No others.
 * Each playthrough randomly selects ONE scenario at game start.
 * All narrative logic adapts to the selected scenario.
 * 
 * Scenarios:
 * - Wife (Eleanor) - Poison
 * - Business Associate (Marcus) - Sharp Laceration
 * - Gardener (James) - Blunt Force
 * - Doctor (Hale) - Precision Incision
 */

export const SCENARIO_PROFILES = {
    wife_poison: {
        id: 'wife_poison',
        killer: 'eleanor',
        killerName: 'Eleanor Blackthorn',
        weapon: 'poisonVial',
        weaponName: 'Poison Vial',
        causeOfDeath: 'poison',
        validWeaponTypes: ['poisonVial', 'syringe'], // Poison can be vial or syringe
        motive: 'Will rewrite and years of emotional neglect',
        description: 'Eleanor killed Charles with poison after discovering he was rewriting his will to disinherit her.'
    },
    business_sharp: {
        id: 'business_sharp',
        killer: 'marcus',
        killerName: 'Marcus Vale',
        weapon: 'letterOpener',
        weaponName: 'Antique Letter Opener',
        causeOfDeath: 'laceration',
        validWeaponTypes: ['letterOpener'],
        motive: 'Embezzlement discovered by Charles',
        description: 'Marcus killed Charles with a sharp object to prevent exposure of his embezzlement scheme.'
    },
    gardener_blunt: {
        id: 'gardener_blunt',
        killer: 'james',
        killerName: 'James Blackwood',
        weapon: 'firePoker',
        weaponName: 'Fireplace Poker',
        causeOfDeath: 'blunt_trauma',
        validWeaponTypes: ['firePoker'],
        motive: 'Blackmail and financial desperation',
        description: 'James killed Charles with blunt force to prevent exposure of his past crimes.'
    },
    doctor_precision: {
        id: 'doctor_precision',
        killer: 'hale',
        killerName: 'Dr. Thomas Hale',
        weapon: 'scalpel',
        weaponName: 'Surgical Scalpel',
        causeOfDeath: 'precision_incision',
        validWeaponTypes: ['scalpel'],
        motive: 'Affair exposure and medical malpractice risk',
        description: 'Dr. Hale killed Charles with a precision incision to prevent exposure of their affair and his medical malpractice.'
    }
};

/**
 * Get a random scenario profile
 * @returns {object} Selected scenario profile
 */
export function getRandomScenario() {
    const scenarios = Object.values(SCENARIO_PROFILES);
    const randomIndex = Math.floor(Math.random() * scenarios.length);
    return scenarios[randomIndex];
}

/**
 * Get scenario by ID
 * @param {string} scenarioId - Scenario ID
 * @returns {object|null} Scenario profile or null
 */
export function getScenarioById(scenarioId) {
    return SCENARIO_PROFILES[scenarioId] || null;
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
    
    // Only eleanor, marcus, james, or hale can be killers
    return ['eleanor', 'marcus', 'james', 'hale'].includes(suspectId);
}

/**
 * Get all valid killer IDs
 * @returns {array} Array of valid killer IDs
 */
export function getValidKillers() {
    return ['eleanor', 'marcus', 'james', 'hale'];
}

/**
 * Get valid weapon types for a cause of death
 * @param {string} causeOfDeath - Cause of death from autopsy
 * @returns {array} Array of valid weapon IDs
 */
export function getValidWeaponTypesForCause(causeOfDeath) {
    const causeMap = {
        'poison': ['poisonVial', 'syringe'],
        'laceration': ['letterOpener'],
        'blunt_trauma': ['firePoker'],
        'precision_incision': ['scalpel']
    };
    
    return causeMap[causeOfDeath] || [];
}

// Legacy function for compatibility
export function getRandomSolution() {
    return getRandomScenario();
}

export function getSolutionById(solutionId) {
    // Try to find by old ID format first
    const oldMap = {
        'A': 'business_sharp',
        'B': 'wife_poison',
        'C': 'doctor_precision'
    };
    
    if (oldMap[solutionId]) {
        return getScenarioById(oldMap[solutionId]);
    }
    
    return getScenarioById(solutionId);
}


