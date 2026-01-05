/**
 * Main Entry Point
 * 
 * Initializes the game and wires together all systems.
 * 
 * ARCHITECTURE:
 * - This file orchestrates the game flow
 * - Reads from gameState (game/state.js)
 * - Calls logic functions (game/logic.js) to update state
 * - Calls UI functions (game/ui.js) to render changes
 * 
 * FLOW:
 * initGame() → updateUI() → user action → handleAction() → logic function → updateUI()
 */

import { gameState, resetGameState } from './game/state.js';
import { getCurrentScene, getAvailableActions, navigateToLocation, examineObject, interrogateSuspect, getAccusationData, processAccusation } from './game/logic.js';
import { initUI, updateStats, renderScene, renderChoices, updateJournal, renderEnding, renderAccusationInterface, showExaminationResult, showInterrogationResult } from './game/ui.js';

/**
 * Initialize the game
 */
function initGame() {
    resetGameState();
    updateUI();
}

/**
 * Update all UI elements
 */
function updateUI() {
    updateStats();
    updateJournal();
    
    // Check if game is over
    if (gameState.gameOver && gameState.ending) {
        renderEnding(gameState.ending);
        return;
    }
    
    // Check if in accusation phase
    if (gameState.phase === 'accusation') {
        const accusationData = getAccusationData();
        renderAccusationInterface(accusationData, handleAccusation);
        return;
    }
    
    // Render current scene
    const sceneData = getCurrentScene();
    if (sceneData) {
        renderScene(sceneData);
    }
    
    // Render available actions
    const actions = getAvailableActions();
    renderChoices(actions, handleAction);
}

/**
 * Handle action selection
 * @param {object} action - Action object
 */
function handleAction(action) {
    if (gameState.gameOver) {
        return;
    }
    
    switch (action.type) {
        case 'navigate':
            if (navigateToLocation(action.target)) {
                updateUI();
            } else {
                // Time ran out
                updateUI();
            }
            break;
            
        case 'examine':
            const examineResult = examineObject(action.target);
            // Always update stats to show time consumption
            updateStats();
            if (examineResult) {
                if (examineResult.error) {
                    // Prerequisite not met - don't consume time, just show error
                    showExaminationResult(examineResult);
                } else {
                    // Successful examination - time was consumed
                    showExaminationResult(examineResult);
                    updateUI();
                }
            } else {
                // Time ran out or examination failed
                if (gameState.timeRemaining <= 0) {
                    updateUI();
                } else {
                    // Update UI even if examination failed for other reasons
                    updateUI();
                }
            }
            break;
            
        case 'interrogate':
            const interrogateResult = interrogateSuspect(action.target);
            // Always update stats to show time consumption
            updateStats();
            if (interrogateResult) {
                showInterrogationResult(interrogateResult);
                updateUI();
            } else {
                // Time ran out or interrogation failed
                if (gameState.timeRemaining <= 0) {
                    updateUI();
                } else {
                    // Update UI even if interrogation failed for other reasons
                    updateUI();
                }
            }
            break;
            
        case 'accuse':
            gameState.phase = 'accusation';
            updateUI();
            break;
            
        default:
            console.warn('Unknown action type:', action.type);
    }
}

/**
 * Handle final accusation
 * @param {string} suspectId - Accused suspect
 * @param {string} weaponId - Accused weapon
 */
function handleAccusation(suspectId, weaponId) {
    processAccusation(suspectId, weaponId);
    updateUI();
}

// Listen for game state changes (e.g., when going back from accusation)
window.addEventListener('gameStateChanged', () => {
    updateUI();
});

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initUI();
        initGame();
    });
} else {
    initUI();
    initGame();
}

// Export for potential external use
export { initGame, updateUI };

