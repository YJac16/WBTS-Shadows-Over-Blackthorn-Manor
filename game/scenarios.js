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
        autopsyText: 'Internal poisoning detected. No external wounds. Toxic compounds found in the bloodstream. Death occurred shortly after ingestion.',
        motive: 'Removed from Charles Blackthorn\'s will days before his death.',
        narrativeNotes: {
            eleanor: 'She speaks carefully about money and loyalty, as if every word might be used against her.',
            victor: 'He insists a quiet death like this does not fit a business quarrel, and keeps steering you toward the household.',
            thomas: 'He remembers Eleanor preparing Charles\'s evening drink herself — unusual, he says.',
            doctor: 'He describes classic poison symptoms with clinical calm: no struggle marks, only what was swallowed.',
            lydia: 'She says she stayed in the kitchen, but saw Eleanor carry a tray toward the study before the storm worsened.'
        }
    },

    victor_sharp: {
        id: 'victor_sharp',
        culprit: 'victor',
        causeOfDeath: 'lacerations',
        validWeapons: ['letter_opener'],
        autopsyText: 'Clean sharp wounds consistent with stabbing. Multiple sharp-force lacerations caused fatal internal bleeding.',
        motive: 'Charles uncovered Victor\'s embezzlement and threatened exposure.',
        narrativeNotes: {
            victor: 'He grows sharp when money is mentioned and insists the books are "complicated," not criminal.',
            eleanor: 'She recalls a furious argument over accounts — Victor left the study red-faced earlier that evening.',
            thomas: 'He heard shouting from the study, then silence. Metal scraped somewhere nearby.',
            doctor: 'He confirms the wounds are jagged and personal, not surgical precision.',
            lydia: 'She overheard Victor demand "one more day" before Charles cut him off for good.'
        }
    },

    gardener_blunt: {
        id: 'gardener_blunt',
        culprit: 'thomas',
        causeOfDeath: 'blunt_force',
        validWeapons: ['fireplace_poker'],
        autopsyText: 'Severe blunt-force trauma to the back of the skull. Evidence suggests the injury was staged to look like an accident.',
        motive: 'Feared being replaced after overhearing planned staff cuts.',
        narrativeNotes: {
            thomas: 'He swears Charles slipped, but he cannot meet your eyes when he says it.',
            eleanor: 'She confirms Charles planned to restructure the staff — Thomas\'s position was uncertain.',
            victor: 'He shrugs it off as clumsiness, then adds that Thomas had been hovering near the study all evening.',
            doctor: 'He rules out a simple fall; the angle of the blow required intent.',
            lydia: 'She saw Thomas near the study with something long and dark in his hand, then told herself it was a tool.'
        }
    },

    doctor_precision: {
        id: 'doctor_precision',
        culprit: 'doctor',
        causeOfDeath: 'precision_incision',
        validWeapons: ['scalpel'],
        autopsyText: 'An extremely precise incision consistent with surgical training. The wound shows medical precision, not random violence.',
        motive: 'Charles discovered malpractice and planned to report it.',
        narrativeNotes: {
            doctor: 'He remains composed, speaking of "clinical inevitabilities," and avoids questions about his practice.',
            eleanor: 'She mentions legal papers about medical care that Charles locked away only days ago.',
            victor: 'He admits hearing malpractice rumors — Charles said he would not protect anyone this time.',
            thomas: 'He notes the doctor was alone with Charles after everyone else left the study.',
            lydia: 'She saw Dr. Whitlock arrive early, bag in hand, calm as if making a routine call.'
        }
    },

    maid_knife: {
        id: 'maid_knife',
        culprit: 'lydia',
        causeOfDeath: 'lacerations',
        validWeapons: ['kitchen_knife'],
        autopsyText: 'Deep lacerations consistent with a kitchen blade. The wounds are frantic rather than surgical, inflicted at close range.',
        motive: 'Charles threatened to dismiss her and expose a theft that would ruin her.',
        narrativeNotes: {
            lydia: 'She insists she only served dinner, but flinches when you mention missing silver or the pantry.',
            eleanor: 'She says Charles meant to dismiss Lydia — something about items vanishing from the house.',
            victor: 'He remembers Charles muttering that a servant\'s secrets can cut deeper than any ledger.',
            thomas: 'He saw Lydia leave the kitchen late, wiping her hands, eyes wet.',
            doctor: 'He says the cuts look domestic — a household blade, not a surgeon\'s instrument.'
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
