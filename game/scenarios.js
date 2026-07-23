/**
 * Narrative Scenario Definitions
 *
 * Five hidden scenarios — one randomly selected per playthrough.
 * Player must NEVER see scenario IDs, names, or hints.
 */

export const SCENARIOS = {
    wife_poison: {
        id: 'wife_poison',
        culprit: 'eleanor',
        causeOfDeath: 'poison',
        validWeapons: ['poison_vial'],
        bodyObservation: 'There are no wounds on the body. His lips are faintly discolored and a half-finished drink sits nearby. Everything points to poisoning — something he ingested.',
        autopsyText: 'Internal poisoning detected. No external wounds. Toxic compounds found in the bloodstream. Death occurred shortly after ingestion. This strongly suggests he was poisoned.',
        motive: 'Removed from Charles Blackthorn\'s will days before his death.',
        narrativeNotes: {
            eleanor: 'Ask about the will if you must, but I refuse to be painted as a monster. Charles and I... we had our reckonings.',
            victor: 'A quiet death like this? That is not how a business quarrel ends. Look at the household — at what he drank.',
            thomas: 'I saw Lady Eleanor prepare Charles\'s evening drink herself that night. She never usually does that.',
            doctor: 'Clinically, this matches poison: no struggle marks, only what entered the bloodstream. He was poisoned.',
            lydia: 'I stayed in the kitchen, but I saw Lady Eleanor carry a tray toward the study before the storm worsened.'
        }
    },

    victor_sharp: {
        id: 'victor_sharp',
        culprit: 'victor',
        causeOfDeath: 'lacerations',
        validWeapons: ['letter_opener'],
        bodyObservation: 'Deep stab wounds pierce the chest and side. The cuts look personal and jagged — suggesting a sharp blade, like a letter opener or similar office weapon.',
        autopsyText: 'Clean sharp wounds consistent with stabbing. Multiple sharp-force lacerations caused fatal internal bleeding. This suggests a deliberate stabbing with a slender blade.',
        motive: 'Charles uncovered Victor\'s embezzlement and threatened exposure.',
        narrativeNotes: {
            victor: 'The accounts are complicated, not criminal. Charles and I argued about numbers — nothing more.',
            eleanor: 'Victor and Charles had a furious argument over the accounts. Victor left the study red-faced earlier that evening.',
            thomas: 'I heard shouting from the study, then silence. Something metal scraped across wood nearby.',
            doctor: 'These wounds are jagged and personal — a stabbing, not surgical precision. Look for a slender sharp blade.',
            lydia: 'I overheard Victor demand "one more day" before Charles cut him off for good. He sounded desperate.'
        }
    },

    gardener_blunt: {
        id: 'gardener_blunt',
        culprit: 'thomas',
        causeOfDeath: 'blunt_force',
        validWeapons: ['fireplace_poker'],
        bodyObservation: 'The back of the skull is crushed. This is blunt-force trauma — suggesting a heavy iron instrument, not a fall.',
        autopsyText: 'Severe blunt-force trauma to the back of the skull. Evidence suggests the injury was staged to look like an accident. A heavy blunt weapon was used.',
        motive: 'Feared being replaced after overhearing planned staff cuts.',
        narrativeNotes: {
            thomas: 'He slipped. He must have slipped. I was only doing my work — I swear it was an accident.',
            eleanor: 'Charles planned to restructure the staff. Thomas\'s position was uncertain; he had every reason to fear replacement.',
            victor: 'People say clumsiness. I say Thomas was hovering near the study all evening with that restless look.',
            doctor: 'This was no simple fall. The angle of the blow required intent — a heavy blunt instrument.',
            lydia: 'I saw Thomas near the study with something long and dark in his hand. I told myself it was only a tool.'
        }
    },

    doctor_precision: {
        id: 'doctor_precision',
        culprit: 'doctor',
        causeOfDeath: 'precision_incision',
        validWeapons: ['scalpel'],
        bodyObservation: 'A single, extremely clean incision — too precise for rage. It suggests medical training, as if a scalpel were used.',
        autopsyText: 'An extremely precise incision consistent with surgical training. The wound shows medical precision, not random violence. This suggests a scalpel in a trained hand.',
        motive: 'Charles discovered malpractice and planned to report it.',
        narrativeNotes: {
            doctor: 'Clinical inevitabilities happen. My practice is my own affair. I will not gossip about medical matters.',
            eleanor: 'Charles locked away legal papers about medical care only days ago. He was preparing something against the doctor.',
            victor: 'There were malpractice rumors. Charles said he would not protect anyone this time — not even Whitlock.',
            thomas: 'The doctor was alone with Charles after everyone else left the study. I thought nothing of it then.',
            lydia: 'Dr. Whitlock arrived early, bag in hand, calm as if making a routine call. Too calm, looking back.'
        }
    },

    maid_knife: {
        id: 'maid_knife',
        culprit: 'lydia',
        causeOfDeath: 'lacerations',
        validWeapons: ['kitchen_knife'],
        bodyObservation: 'The wounds are deep but frantic and uneven — more kitchen blade than surgeon\'s tool. This suggests a household knife used in a panic.',
        autopsyText: 'Deep lacerations consistent with a kitchen blade. The wounds are frantic rather than surgical, inflicted at close range. This suggests a kitchen knife, not a medical instrument.',
        motive: 'Charles threatened to dismiss her and expose a theft that would ruin her.',
        narrativeNotes: {
            lydia: 'I only served dinner. I know nothing about missing silver. Please — I need this position.',
            eleanor: 'Charles meant to dismiss Lydia. Items have been vanishing from the house; he was finished protecting her.',
            victor: 'Charles muttered that a servant\'s secrets can cut deeper than any ledger. He was angry about theft.',
            thomas: 'I saw Lydia leave the kitchen late, wiping her hands, eyes wet. She would not meet my gaze.',
            doctor: 'These cuts look domestic — a household blade used in haste, not a surgeon\'s instrument.'
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
