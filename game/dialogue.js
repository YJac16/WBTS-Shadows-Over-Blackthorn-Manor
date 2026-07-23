/**
 * Adaptive Dialogue System
 *
 * Full spoken lines per character per scenario.
 * Culprits stay guarded; innocents lead the narrative trail.
 */

import { gameState } from './state.js';

const BASE_OPENERS = {
    eleanor: 'I can\'t believe he\'s gone. We had our differences, but this is terrible.',
    victor: 'This is a disaster. Charles and I had unfinished business — important business.',
    thomas: 'I... I don\'t know what happened. I was just doing my work.',
    doctor: 'I examined the body. The cause of death is clear, but the circumstances are troubling.',
    lydia: 'I was in the kitchen most of the evening. This is all so terrible.'
};

const CULPRIT_CLOSERS = {
    eleanor: 'I had my reasons, but I never wanted it to come to this.',
    victor: 'Charles and I had our disagreements, but this... this is beyond anything I expected.',
    thomas: 'I didn\'t mean for it to happen this way. It was an accident, I swear!',
    doctor: 'I\'ve dedicated my life to medicine, but sometimes circumstances force difficult choices.',
    lydia: 'I only wanted to keep my place here. He left me no choice — you have to understand.'
};

/**
 * Get dialogue for a suspect based on active scenario
 * @param {string} suspectId
 * @returns {object}
 */
export function getBestDialogue(suspectId) {
    const opener = BASE_OPENERS[suspectId] || '...';

    if (!gameState.activeScenario) {
        return {
            text: opener,
            suspicionIncrease: 5
        };
    }

    const scenario = gameState.activeScenario;
    const isCulprit = suspectId === scenario.culprit;
    const narrativeNote = scenario.narrativeNotes?.[suspectId] || '';

    let text = opener;
    if (narrativeNote) {
        text += ' ' + narrativeNote;
    }
    if (isCulprit) {
        text += ' ' + (CULPRIT_CLOSERS[suspectId] || '');
    }

    let suspicionIncrease = 5;
    if (isCulprit) {
        suspicionIncrease = 15;
    } else if (narrativeNote) {
        suspicionIncrease = 8;
    }

    return {
        text: text.trim(),
        suspicionIncrease
    };
}

/**
 * Update character profile based on dialogue
 * Adds motive and opportunity clues when appropriate
 * @param {string} suspectId
 * @param {object} dialogue
 */
export function updateProfileFromDialogue(suspectId, dialogue) {
    if (!gameState.activeScenario || !gameState.knownCharacters[suspectId]) {
        return;
    }

    const scenario = gameState.activeScenario;
    const isCulprit = suspectId === scenario.culprit;
    const narrativeNote = scenario.narrativeNotes?.[suspectId] || '';

    if (isCulprit && !gameState.knownCharacters[suspectId].motives.includes(scenario.motive)) {
        gameState.knownCharacters[suspectId].motives.push(scenario.motive);
    }

    const opportunityHints = /alone|prepared|with Charles|arrive|tray|study|dismiss|staff|bag|knife|drink|shouting|hovering|theft|silver/i;
    const hasOpportunityHint = opportunityHints.test(narrativeNote) || isCulprit;

    if (hasOpportunityHint) {
        let opportunity;
        if (suspectId === 'doctor') {
            opportunity = 'Had medical access to the victim and was alone with him.';
        } else if (suspectId === 'lydia') {
            opportunity = 'Had free run of the kitchen and access to the study wing that evening.';
        } else if (suspectId === 'eleanor') {
            opportunity = 'Prepared Charles\'s drink and moved freely through the household.';
        } else if (suspectId === 'victor') {
            opportunity = 'Was alone with Charles during a private argument in the study.';
        } else if (suspectId === 'thomas') {
            opportunity = 'Was seen near the study with a heavy tool around the time of death.';
        } else {
            opportunity = 'Had access to the victim at the time of death.';
        }

        if (!gameState.knownCharacters[suspectId].opportunities.includes(opportunity)) {
            gameState.knownCharacters[suspectId].opportunities.push(opportunity);
        }
    }

    if (isCulprit && gameState.knownCharacters[suspectId].opportunities.length === 0) {
        gameState.knownCharacters[suspectId].opportunities.push(
            'Had access to the victim at the time of death.'
        );
    }
}
