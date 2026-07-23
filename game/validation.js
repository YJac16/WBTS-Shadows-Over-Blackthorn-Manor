/**
 * QA Validation Layer
 * 
 * Runtime assertions and guardrails for game logic.
 * Ensures all test cases are satisfied.
 */

import { gameState } from './state.js';
import { getAllWeapons } from './weapons.js';

// Debug mode flag (development only)
// NEVER set to true in production - scenario info must remain hidden
export const DEBUG_SHOW_SCENARIO = false;

/**
 * Validate scenario initialization
 * Assert: activeScenario !== null
 * Assert: weaponLocations has exactly 5 weapons
 */
export function validateScenarioInitialization() {
    const errors = [];
    
    if (gameState.activeScenario === null) {
        const error = 'VALIDATION ERROR: activeScenario is null. Game state is invalid.';
        console.error(error);
        errors.push(error);
    }
    
    const weaponCount = Object.keys(gameState.weaponLocations || {}).length;
    if (weaponCount !== 5) {
        const error = `VALIDATION ERROR: Expected 5 weapons, found ${weaponCount}. Weapon locations invalid.`;
        console.error(error);
        errors.push(error);
    }
    
    // Verify all weapons are present
    const allWeapons = getAllWeapons();
    const weaponIds = allWeapons.map(w => w.id);
    for (const weaponId of weaponIds) {
        if (!gameState.weaponLocations[weaponId]) {
            const error = `VALIDATION ERROR: Weapon ${weaponId} is missing from weaponLocations.`;
            console.error(error);
            errors.push(error);
        }
    }

    const charCount = Object.keys(gameState.characterLocations || {}).length;
    if (charCount !== 5) {
        const error = `VALIDATION ERROR: Expected 5 character locations, found ${charCount}.`;
        console.error(error);
        errors.push(error);
    }
    
    // Scenario info is NEVER logged to prevent exposure
    // Only log errors, never scenario details
    
    return errors.length === 0;
}

/**
 * Check if a weapon is valid for the active scenario
 * Returns true ONLY if weapon matches autopsy cause
 * @param {string} weaponId - Weapon ID
 * @param {object} activeScenario - Active scenario object
 * @returns {boolean} True if weapon is valid for scenario
 */
export function isWeaponValidForScenario(weaponId, activeScenario) {
    if (!activeScenario) {
        console.warn('VALIDATION: isWeaponValidForScenario called without activeScenario');
        return false;
    }
    
    if (!weaponId) {
        return false;
    }
    
    // Weapon is valid if it's in the scenario's validWeapons array
    return activeScenario.validWeapons.includes(weaponId);
}

/**
 * Validate time consumption
 * Assert: Time is consumed for all actions
 */
export function validateTimeConsumption(actionType, timeBefore, timeAfter) {
    if (timeAfter >= timeBefore) {
        console.error(`VALIDATION ERROR: Time not consumed for action: ${actionType}. Before: ${timeBefore}, After: ${timeAfter}`);
        return false;
    }
    return true;
}

/**
 * Validate accusation prerequisites
 * @param {string} suspectId - Suspect ID
 * @param {string} weaponId - Weapon ID
 * @returns {object} Validation result with isValid and reason
 */
export function validateAccusationPrerequisites(suspectId, weaponId) {
    const result = {
        isValid: true,
        reason: null,
        missing: []
    };
    
    // Check if weapon was discovered
    if (!gameState.foundWeapons.includes(weaponId)) {
        result.isValid = false;
        result.reason = 'Weapon not discovered';
        result.missing.push('weapon_discovery');
        return result;
    }
    
    // Check if autopsy is unlocked
    if (!gameState.autopsyUnlocked) {
        result.isValid = false;
        result.reason = 'Autopsy not performed';
        result.missing.push('autopsy');
        return result;
    }
    
    // Check if weapon is consistent with autopsy
    if (!isWeaponValidForScenario(weaponId, gameState.activeScenario)) {
        result.isValid = false;
        result.reason = 'Weapon inconsistent with autopsy';
        result.missing.push('weapon_consistency');
        return result;
    }
    
    // Check if motive is discovered
    const hasMotive = gameState.knownCharacters[suspectId]?.motives?.length > 0;
    if (!hasMotive) {
        result.isValid = false;
        result.reason = 'Motive not discovered';
        result.missing.push('motive');
    }
    
    // Check if opportunity is discovered
    const hasOpportunity = gameState.knownCharacters[suspectId]?.opportunities?.length > 0;
    if (!hasOpportunity) {
        result.isValid = false;
        result.reason = 'Opportunity not discovered';
        result.missing.push('opportunity');
    }
    
    return result;
}

/**
 * Validate suspicion increase
 * Ensure suspicion increases logically, not randomly
 * @param {number} amount - Amount to increase
 * @param {string} reason - Reason for increase
 * @returns {boolean} True if increase is valid
 */
export function validateSuspicionIncrease(amount, reason) {
    if (amount < 0) {
        console.error(`VALIDATION ERROR: Suspicion cannot decrease. Reason: ${reason}`);
        return false;
    }
    
    if (amount > 50 && !reason.includes('accusation') && !reason.includes('body')) {
        console.warn(`VALIDATION WARNING: Large suspicion increase (${amount}) for reason: ${reason}`);
    }
    
    return true;
}

/**
 * Validate character profile access
 * Ensure profiles are hidden until interaction
 * @param {string} suspectId - Suspect ID
 * @returns {boolean} True if profile should be visible
 */
export function validateCharacterProfileAccess(suspectId) {
    const profile = gameState.knownCharacters[suspectId];
    if (!profile) {
        return false;
    }
    
    // Profile must be unlocked through interaction
    return profile.unlocked;
}

/**
 * Validate replay integrity
 * Ensure all state is reset cleanly
 */
export function validateReplayIntegrity() {
    const errors = [];
    
    // Check that scenario is reset
    if (gameState.activeScenario === null) {
        errors.push('activeScenario is null after reset');
    }
    
    // Check that weapon locations are set (5 weapons)
    const weaponCount = Object.keys(gameState.weaponLocations || {}).length;
    if (weaponCount !== 5) {
        errors.push(`Weapon locations invalid: ${weaponCount} weapons found (expected 5)`);
    }
    
    // Check that journal is cleared
    if (gameState.journalEntries.length > 0) {
        errors.push('Journal entries not cleared');
    }
    
    // Check that suspicion is reset
    if (gameState.suspicionLevel !== 0) {
        errors.push(`Suspicion not reset: ${gameState.suspicionLevel}`);
    }
    
    // Check that time is reset
    if (gameState.timeRemaining !== gameState.maxTime) {
        errors.push(`Time not reset: ${gameState.timeRemaining}/${gameState.maxTime}`);
    }
    
    // Check that found weapons are cleared
    if (gameState.foundWeapons.length > 0) {
        errors.push('Found weapons not cleared');
    }
    
    // Check that autopsy is reset
    if (gameState.autopsyUnlocked) {
        errors.push('Autopsy not reset');
    }
    
    if (errors.length > 0) {
        console.error('VALIDATION ERROR: Replay integrity failed:', errors);
        return false;
    }
    
    // Scenario initialized (never expose details to player)
    
    return true;
}

/**
 * Log debug information (development only)
 * NEVER exposes scenario details to prevent player from seeing the truth
 */
export function logDebugInfo() {
    // Debug logging disabled - scenario must remain hidden
    // Only validation errors are logged, never scenario details
}

