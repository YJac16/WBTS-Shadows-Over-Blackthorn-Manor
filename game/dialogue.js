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
 * Spoken lead lines keyed by scenario then suspect — clearer than raw notes alone
 */
const DIALOGUE_LEADS = {
    wife_poison: {
        eleanor: 'If you are looking for poison in this house, look carefully — but do not assume the widow poured it.',
        victor: 'Poison is a household weapon. A business quarrel ends with raised voices, not a silent cup.',
        thomas: 'Lady Eleanor made his drink that night. I remember because it was so unusual.',
        doctor: 'No struggle. No wounds. Only what he swallowed. He was poisoned — that much is medical fact.',
        lydia: 'I saw her carry a tray to the study. Whatever was in that cup... I wish I had looked closer.'
    },
    victor_sharp: {
        eleanor: 'Victor stormed out after shouting about the accounts. Charles meant to cut him off.',
        victor: 'We argued numbers, nothing else. A letter opener is an office tool — not proof of murder.',
        thomas: 'Shouting, then metal scraping. Then quiet. Something sharp was used in that room.',
        doctor: 'These are stab wounds from a slender blade — personal, not surgical. Find that blade.',
        lydia: 'Victor begged for one more day. Charles would not give it. That is when the shouting started.'
    },
    gardener_blunt: {
        eleanor: 'Charles was going to dismiss staff. Thomas knew his place was next — fear makes people reckless.',
        victor: 'Thomas hovered by the study with something dark in his grip. Call it a tool if you like.',
        thomas: 'The floor was wet. He fell. A heavy poker means nothing — accidents happen.',
        doctor: 'The skull was struck from behind with force. A fall does not do this. Look for a heavy iron weapon.',
        lydia: 'Thomas stood outside the study holding something long. I told myself it was gardening work.'
    },
    doctor_precision: {
        eleanor: 'Charles kept papers about medical malpractice locked away. He was ready to expose someone.',
        victor: 'Whitlock\'s reputation was cracking. Charles said he would report it — no more covering up.',
        thomas: 'The doctor stayed alone with Charles after we left. Only a physician would make a cut that neat.',
        doctor: 'Precision is my profession. That does not make every precise wound mine.',
        lydia: 'He arrived early with his bag, calm as a house call. Looking back, that calm frightens me.'
    },
    maid_knife: {
        eleanor: 'Lydia was to be dismissed for theft. Charles would not keep a thief under this roof.',
        victor: 'A servant\'s secret can cut deep. Charles was angry about missing silver — and about Lydia.',
        thomas: 'She left the kitchen late, wiping her hands, crying. A kitchen knife was missing from the block.',
        doctor: 'These cuts are frantic and domestic — a kitchen blade, not a scalpel. Ask who works the kitchen.',
        lydia: 'I serve meals. I do not steal. And I would never... I need you to believe me.'
    }
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
    const lead = DIALOGUE_LEADS[scenario.id]?.[suspectId]
        || scenario.narrativeNotes?.[suspectId]
        || '';

    let text = opener;
    if (lead) {
        text += ' ' + lead;
    }
    if (isCulprit) {
        text += ' ' + (CULPRIT_CLOSERS[suspectId] || '');
    }

    let suspicionIncrease = 5;
    if (isCulprit) {
        suspicionIncrease = 15;
    } else if (lead) {
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
    const lead = DIALOGUE_LEADS[scenario.id]?.[suspectId] || '';
    const combined = `${narrativeNote} ${lead} ${dialogue?.text || ''}`;

    if (isCulprit && !gameState.knownCharacters[suspectId].motives.includes(scenario.motive)) {
        gameState.knownCharacters[suspectId].motives.push(scenario.motive);
    }

    const opportunityHints = /alone|prepared|drink|tray|study|dismiss|staff|bag|knife|shouting|hovering|theft|silver|scalpel|poker|poison|blade|accounts|malpractice/i;
    const hasOpportunityHint = opportunityHints.test(combined) || isCulprit;

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
