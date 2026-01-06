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
import { rooms } from './game/scenes.js';

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
    // Only show loading if scenario is truly not initialized (shouldn't happen after resetGameState)
    if (!gameState.activeScenario) {
        showLoadingState();
        return;
    }
    
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
    
    // Render current scene - room rendering does NOT depend on scenario data
    const sceneData = getCurrentScene();
    
    if (sceneData && sceneData.name && sceneData.description) {
        renderScene(sceneData);
    } else {
        // Fallback: render default intro scene to ensure text always appears
        const sceneDisplay = document.getElementById('scene-display');
        if (sceneDisplay) {
            sceneDisplay.innerHTML = `
                <div class="location">Grand Hall</div>
                <p>You stand in the grand hall of Blackthorn Manor. The storm rages outside, and you know there is no escape until morning. Charles Blackthorn lies dead in his study. Someone in this house is the killer.</p>
            `;
        }
    }
    
    // Render available actions - preserve original navigation buttons
    const actions = getAvailableActions();
    if (actions && actions.length > 0) {
        renderChoices(actions, handleAction);
    } else {
        // Fallback: show default actions if getAvailableActions fails
        const choicesContainer = document.getElementById('choices-container');
        if (choicesContainer && choicesContainer.children.length === 0) {
            // Use the actual room data if available
            const currentRoom = rooms[gameState.currentLocation] || rooms['grandHall'];
            if (currentRoom && currentRoom.actions) {
                choicesContainer.innerHTML = '';
                currentRoom.actions.forEach(action => {
                    const button = document.createElement('button');
                    button.className = 'choice-button';
                    button.textContent = action.text;
                    if (action.location) {
                        button.addEventListener('click', () => handleAction({ type: 'navigate', target: action.location }));
                    } else if (action.object) {
                        button.addEventListener('click', () => handleAction({ type: 'examine', target: action.object }));
                    } else if (action.suspect) {
                        button.addEventListener('click', () => handleAction({ type: 'interrogate', target: action.suspect }));
                    }
                    choicesContainer.appendChild(button);
                });
            }
        }
    }
}

/**
 * Show loading state while scenario initializes
 */
function showLoadingState() {
    const sceneDisplay = document.getElementById('scene-display');
    const choicesContainer = document.getElementById('choices-container');
    
    if (sceneDisplay) {
        sceneDisplay.innerHTML = `
            <h2>Initializing Investigation...</h2>
            <p style="color: var(--text-muted);">Preparing the scene...</p>
        `;
    }
    
    if (choicesContainer) {
        choicesContainer.innerHTML = '<p style="color: var(--text-muted);">Loading...</p>';
    }
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

// Listen for play again event
window.addEventListener('playAgain', () => {
    initGame(); // This calls resetGameState() and updateUI()
});

// Initialize game when DOM is ready
function startGame() {
    // Ensure DOM elements exist before initializing
    const sceneDisplay = document.getElementById('scene-display');
    const choicesContainer = document.getElementById('choices-container');
    
    if (!sceneDisplay || !choicesContainer) {
        // Retry after a short delay if DOM not ready
        setTimeout(startGame, 100);
        return;
    }
    
    try {
        initUI();
        initGame();
        
        // Safety check: ensure content rendered after initialization
        setTimeout(() => {
            if (!sceneDisplay.innerHTML || sceneDisplay.innerHTML.trim() === '') {
                sceneDisplay.innerHTML = `
                    <div class="location">Grand Hall</div>
                    <p>You stand in the grand hall of Blackthorn Manor. The storm rages outside, and you know there is no escape until morning. Charles Blackthorn lies dead in his study. Someone in this house is the killer.</p>
                `;
            }
            if (!choicesContainer.innerHTML || choicesContainer.innerHTML.trim() === '') {
                const currentRoom = rooms[gameState.currentLocation] || rooms['grandHall'];
                if (currentRoom && currentRoom.actions) {
                    choicesContainer.innerHTML = '';
                    currentRoom.actions.forEach(action => {
                        const button = document.createElement('button');
                        button.className = 'choice-button';
                        button.textContent = action.text;
                        if (action.location) {
                            button.addEventListener('click', () => handleAction({ type: 'navigate', target: action.location }));
                        } else if (action.object) {
                            button.addEventListener('click', () => handleAction({ type: 'examine', target: action.object }));
                        } else if (action.suspect) {
                            button.addEventListener('click', () => handleAction({ type: 'interrogate', target: action.suspect }));
                        }
                        choicesContainer.appendChild(button);
                    });
                }
            }
        }, 50);
    } catch (error) {
        // Render fallback content on error to ensure text always appears
        if (sceneDisplay) {
            sceneDisplay.innerHTML = `
                <div class="location">Grand Hall</div>
                <p>You stand in the grand hall of Blackthorn Manor. The storm rages outside, and you know there is no escape until morning. Charles Blackthorn lies dead in his study. Someone in this house is the killer.</p>
            `;
        }
        if (choicesContainer) {
            const fallbackRoom = rooms['grandHall'];
            if (fallbackRoom && fallbackRoom.actions) {
                choicesContainer.innerHTML = '';
                fallbackRoom.actions.forEach(action => {
                    const button = document.createElement('button');
                    button.className = 'choice-button';
                    button.textContent = action.text;
                    if (action.location) {
                        button.addEventListener('click', () => handleAction({ type: 'navigate', target: action.location }));
                    } else if (action.object) {
                        button.addEventListener('click', () => handleAction({ type: 'examine', target: action.object }));
                    } else if (action.suspect) {
                        button.addEventListener('click', () => handleAction({ type: 'interrogate', target: action.suspect }));
                    }
                    choicesContainer.appendChild(button);
                });
            }
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        startGame();
    });
} else {
    startGame();
}

// Export for potential external use
export { initGame, updateUI };

