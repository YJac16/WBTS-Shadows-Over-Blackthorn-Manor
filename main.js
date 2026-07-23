/**
 * Main Entry Point
 *
 * Initializes the game and wires together all systems.
 */

import { gameState } from './game/state.js';
import { getCurrentScene, getAvailableActions, navigateToLocation, examineObject, interrogateSuspect, getAccusationData, processAccusation } from './game/logic.js';
import {
    initUI,
    updateStats,
    renderScene,
    renderChoices,
    updateJournal,
    renderEnding,
    renderAccusationInterface,
    showExaminationResult,
    showInterrogationResult
} from './game/ui.js';
import { loadGame, saveGame, startNewGame, clearSave } from './game/save.js';
import { unlockAndStartMysteryMusic, restartMysteryMusic, setGamePlaying, stopMysteryMusic } from './game/media.js';

/**
 * Initialize the game — restore save if present, otherwise new run
 */
function initGame(forceNew = false) {
    document.body.classList.remove('ending-active');

    const stats = document.getElementById('game-stats');
    const journal = document.getElementById('journal-sidebar');
    if (stats) stats.style.display = '';
    if (journal) journal.style.display = '';

    if (forceNew) {
        startNewGame();
    } else if (!loadGame()) {
        startNewGame();
    }

    if (gameState.gameOver) {
        setGamePlaying(false);
        stopMysteryMusic(true);
    } else {
        setGamePlaying(true);
        restartMysteryMusic(gameState.timeRemaining);
    }

    updateUI();
}

/**
 * Update all UI elements
 */
function updateUI() {
    if (!gameState.activeScenario) {
        showLoadingState();
        return;
    }
    
    updateStats();
    updateJournal();
    
    if (gameState.gameOver && gameState.ending) {
        clearSave();
        renderEnding(gameState.ending);
        return;
    }
    
    if (gameState.phase === 'accusation') {
        const accusationData = getAccusationData();
        renderAccusationInterface(accusationData, handleAccusation);
        return;
    }
    
    const sceneData = getCurrentScene();
    if (sceneData) {
        renderScene(sceneData);
    } else {
        renderScene({
            name: 'Grand Hall',
            description: 'You stand in the grand hall of Blackthorn Manor. The storm rages outside, and you know there is no escape until morning. Charles Blackthorn lies dead in his study. Someone in this house is the killer.'
        });
    }
    
    renderChoices(getAvailableActions() || [], handleAction);
}

function showLoadingState() {
    const narrative = document.getElementById('scene-narrative');
    const choicesContainer = document.getElementById('choices-container');
    
    if (narrative) {
        narrative.innerHTML = `
            <h2>Initializing Investigation...</h2>
            <p style="color: var(--text-muted);">Preparing the scene...</p>
        `;
    }
    
    if (choicesContainer) {
        choicesContainer.innerHTML = '<p style="color: var(--text-muted);">Loading...</p>';
    }
}

function handleAction(action) {
    if (gameState.gameOver) {
        return;
    }
    
    switch (action.type) {
        case 'navigate':
            navigateToLocation(action.target);
            saveGame();
            updateUI();
            break;
            
        case 'examine': {
            const examineResult = examineObject(action.target);
            updateStats();
            if (examineResult) {
                if (examineResult.error) {
                    showExaminationResult(examineResult);
                } else {
                    showExaminationResult(examineResult);
                    saveGame();
                    updateUI();
                }
            } else {
                saveGame();
                updateUI();
            }
            break;
        }
            
        case 'interrogate': {
            const interrogateResult = interrogateSuspect(action.target);
            updateStats();
            if (interrogateResult) {
                showInterrogationResult(interrogateResult);
                saveGame();
                updateUI();
            } else {
                saveGame();
                updateUI();
            }
            break;
        }
            
        case 'accuse':
            gameState.phase = 'accusation';
            saveGame();
            updateUI();
            break;
            
        default:
            console.warn('Unknown action type:', action.type);
    }
}

function handleAccusation(suspectId, weaponId) {
    processAccusation(suspectId, weaponId);
    clearSave();
    updateUI();
}

window.addEventListener('gameStateChanged', () => {
    saveGame();
    updateUI();
});

window.addEventListener('playAgain', () => {
    initGame(true);
});

function startGame() {
    const narrative = document.getElementById('scene-narrative');
    const choicesContainer = document.getElementById('choices-container');
    
    if (!narrative || !choicesContainer) {
        setTimeout(startGame, 100);
        return;
    }
    
    try {
        initUI();
        initGame(false);

        const unlockMusicOnce = () => {
            document.removeEventListener('pointerdown', unlockMusicOnce);
            document.removeEventListener('keydown', unlockMusicOnce);
            unlockAndStartMysteryMusic();
            if (!gameState.gameOver) {
                restartMysteryMusic(gameState.timeRemaining);
            }
        };
        document.addEventListener('pointerdown', unlockMusicOnce);
        document.addEventListener('keydown', unlockMusicOnce);
    } catch (error) {
        console.error(error);
        if (narrative) {
            narrative.innerHTML = `
                <div class="location">Grand Hall</div>
                <p>You stand in the grand hall of Blackthorn Manor. The storm rages outside, and you know there is no escape until morning. Charles Blackthorn lies dead in his study. Someone in this house is the killer.</p>
            `;
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

export { initGame, updateUI };
