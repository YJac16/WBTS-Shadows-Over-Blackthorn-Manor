/**
 * Narrative Scenario Definitions
 * 
 * Central source of truth for all game scenarios.
 * All game logic derives from these definitions.
 */

/**
 * Canonical Scenario Definitions
 * 
 * Four hidden scenarios - one randomly selected per playthrough.
 * Player must NEVER see scenario IDs, names, or hints.
 * All logic derives from these definitions.
 * 
 * Scenario A - Poison: Eleanor, will removal, poison vial
 * Scenario B - Sharp Force: Victor, embezzlement, letter opener
 * Scenario C - Blunt Force: Thomas, fear of replacement, fireplace poker
 * Scenario D - Precision Incision: Doctor, malpractice cover-up, scalpel
 */
export const SCENARIOS = {
    // Scenario A – Poison
    wife_poison: {
        id: 'wife_poison',
        culprit: 'eleanor',
        causeOfDeath: 'poison',
        validWeapons: ['poison_vial'], // Only poison vial is correct
        autopsyText: 'Internal poisoning detected. No external wounds. Toxic compounds found in the bloodstream. Death occurred shortly after ingestion.',
        motive: 'Removed from Charles Blackthorn\'s will days before his death.',
        narrativeNotes: {
            eleanor: 'Defensive. Mentions betrayal and financial uncertainty.',
            victor: 'Dismisses poisoning as unlikely.',
            thomas: 'Mentions Eleanor prepared Charles\'s drink.',
            doctor: 'Explains poison symptoms clinically.',
            lydia: 'Claims she was in the kitchen all evening. Seems genuinely frightened.'
        }
    },

    // Scenario B – Sharp Force
    businessman_sharp: {
        id: 'businessman_sharp',
        culprit: 'victor',
        causeOfDeath: 'lacerations',
        validWeapons: ['letter_opener'],
        autopsyText: 'Clean sharp wounds consistent with stabbing. Multiple sharp-force lacerations caused fatal internal bleeding.',
        motive: 'Charles uncovered Victor\'s embezzlement and threatened exposure.',
        narrativeNotes: {
            victor: 'Aggressive. Avoids financial questions.',
            eleanor: 'Mentions heated argument over money.',
            thomas: 'Heard shouting from the study.',
            doctor: 'Confirms wounds are not surgical.',
            lydia: 'Heard raised voices but didn\'t see anything. Stayed in the kitchen.'
        }
    },

    // Scenario C – Blunt Force
    gardener_blunt: {
        id: 'gardener_blunt',
        culprit: 'thomas',
        causeOfDeath: 'blunt_force',
        validWeapons: ['fireplace_poker'],
        autopsyText: 'Severe blunt-force trauma to the back of the skull. Evidence suggests the injury was staged to look like an accident.',
        motive: 'Feared being replaced after overhearing staff changes.',
        narrativeNotes: {
            thomas: 'Overly nervous. Claims it was an accident.',
            eleanor: 'Confirms Charles planned staff restructuring.',
            victor: 'Dismisses the death as clumsiness.',
            doctor: 'Rules out accidental fall.',
            lydia: 'Saw Thomas near the study earlier. Didn\'t think much of it at the time.'
        }
    },

    // Scenario D – Precision Incision
    doctor_precision: {
        id: 'doctor_precision',
        culprit: 'doctor',
        causeOfDeath: 'precision_incision',
        validWeapons: ['scalpel'],
        autopsyText: 'An extremely precise incision consistent with surgical training. The wound shows medical precision, not random violence.',
        motive: 'Charles discovered malpractice and planned to report it.',
        narrativeNotes: {
            doctor: 'Calm, analytical, subtly defensive.',
            eleanor: 'Mentions legal documents involving medical care.',
            victor: 'Admits knowledge of malpractice rumors.',
            thomas: 'Notes doctor was alone with Charles.',
            lydia: 'Saw the doctor arrive earlier. He seemed calm, professional.'
        }
    }
};

/**
 * Get a random scenario
 * @returns {object} Selected scenario
 */
export function getRandomScenario() {
    const scenarios = Object.values(SCENARIOS);
    const randomIndex = Math.floor(Math.random() * scenarios.length);
    return scenarios[randomIndex];
}

/**
 * Get scenario by ID
 * @param {string} scenarioId - Scenario ID
 * @returns {object|null} Scenario or null
 */
export function getScenarioById(scenarioId) {
    return SCENARIOS[scenarioId] || null;
}

/**
 * Get all scenario IDs
 * @returns {array} Array of scenario IDs
 */
export function getAllScenarioIds() {
    return Object.keys(SCENARIOS);
}

