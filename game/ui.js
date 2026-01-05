/**
 * UI Rendering System
 * 
 * Mobile-first UI with collapsible navigation.
 * Handles scene rendering, choices, journal, character profiles, and endings.
 */

import { gameState } from './state.js';
import { getEnding, suspects } from './scenes.js';
import { getCluesSupporting, getCluesContradicting } from './clues.js';
import { getAudioEnabled, setAudioEnabled } from './media.js';

// UI State
let currentPanel = null;

/**
 * Initialize UI
 */
export function initUI() {
    // Mobile nav toggle
    const navToggle = document.getElementById('nav-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    
    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('hidden');
        });
    }
    
    // Panel navigation
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const panel = e.target.dataset.panel;
            showMobilePanel(panel);
        });
    });
    
    // Panel close
    const panelClose = document.getElementById('panel-close');
    const panelOverlay = document.getElementById('mobile-panel-overlay');
    
    if (panelClose) {
        panelClose.addEventListener('click', () => {
            hideMobilePanel();
        });
    }
    
    if (panelOverlay) {
        panelOverlay.addEventListener('click', (e) => {
            if (e.target === panelOverlay) {
                hideMobilePanel();
            }
        });
    }
    
    // Close mobile nav when clicking outside
    if (mobileNav) {
        document.addEventListener('click', (e) => {
            if (!mobileNav.contains(e.target) && !navToggle.contains(e.target)) {
                mobileNav.classList.add('hidden');
            }
        });
    }
    
    // Initialize character names in mobile nav
    updateNavCharacters();
}

/**
 * Update game stats display
 */
export function updateStats() {
    // Update mobile nav stats
    const timeElement = document.getElementById('time-value');
    const suspicionElement = document.getElementById('suspicion-value');
    
    // Update desktop stats
    const timeElementDesktop = document.getElementById('time-value-desktop');
    const suspicionElementDesktop = document.getElementById('suspicion-value-desktop');
    
    const updateTimeElement = (element) => {
        if (element) {
            element.textContent = gameState.timeRemaining;
            
            // Add warning classes based on time remaining
            element.classList.remove('warning', 'danger');
            if (gameState.timeRemaining <= 3) {
                element.classList.add('danger');
            } else if (gameState.timeRemaining <= 6) {
                element.classList.add('warning');
            }
        }
    };
    
    const updateSuspicionElement = (element) => {
        if (element) {
            element.textContent = gameState.suspicion;
            
            // Add warning class for high suspicion
            element.classList.remove('high');
            if (gameState.suspicion >= 50) {
                element.classList.add('high');
            }
        }
    };
    
    updateTimeElement(timeElement);
    updateTimeElement(timeElementDesktop);
    updateSuspicionElement(suspicionElement);
    updateSuspicionElement(suspicionElementDesktop);
}

/**
 * Render current scene
 * @param {object} sceneData - Scene data from getCurrentScene()
 */
export function renderScene(sceneData) {
    const sceneDisplay = document.getElementById('scene-display');
    if (!sceneDisplay || !sceneData) {
        return;
    }
    
    const location = sceneData.location;
    
    sceneDisplay.innerHTML = `
        <div class="location">${location.name}</div>
        <p>${sceneData.description}</p>
    `;
}

/**
 * Render available choices/actions
 * @param {array} actions - Array of action objects
 * @param {function} onActionClick - Callback when action is clicked
 */
export function renderChoices(actions, onActionClick) {
    const choicesContainer = document.getElementById('choices-container');
    if (!choicesContainer) {
        return;
    }
    
    choicesContainer.innerHTML = '';
    
    if (actions.length === 0) {
        choicesContainer.innerHTML = '<p class="text-center">No actions available.</p>';
        return;
    }
    
    actions.forEach(action => {
        const button = document.createElement('button');
        button.className = 'choice-button';
        button.textContent = action.text;
        button.dataset.actionId = action.id;
        button.dataset.actionType = action.type;
        
        if (action.type === 'accuse') {
            button.classList.add('danger');
        }
        
        if (action.examined || action.interrogated) {
            button.disabled = false; // Allow re-examination/re-interrogation
        }
        
        button.addEventListener('click', () => {
            if (!button.disabled) {
                onActionClick(action);
            }
        });
        
        choicesContainer.appendChild(button);
    });
}

/**
 * Update character names in mobile nav
 */
function updateNavCharacters() {
    const navCharacters = document.getElementById('nav-characters');
    if (!navCharacters) {
        return;
    }
    
    navCharacters.innerHTML = '';
    
    Object.values(suspects).forEach(suspect => {
        const profile = gameState.characterProfiles[suspect.id];
        if (!profile || !profile.unlocked) {
            return; // Only show characters after speaking with them
        }
        
        const charButton = document.createElement('button');
        charButton.className = 'nav-button';
        charButton.textContent = suspect.name;
        charButton.dataset.panel = 'profiles';
        charButton.dataset.suspectId = suspect.id;
        charButton.addEventListener('click', (e) => {
            showMobilePanel('profiles', suspect.id);
        });
        navCharacters.appendChild(charButton);
    });
    
    if (navCharacters.children.length === 0) {
        navCharacters.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem;">Speak with characters to unlock their profiles.</p>';
    }
}

/**
 * Update journal display
 */
export function updateJournal() {
    // Desktop journal
    const journalContent = document.getElementById('journal-content');
    if (journalContent) {
        updateJournalContent(journalContent);
    }
    
    // Mobile journal (if panel is open)
    if (currentPanel === 'journal') {
        const panelContent = document.getElementById('panel-content');
        if (panelContent) {
            panelContent.innerHTML = '<h2>Clue Journal</h2>';
            const mobileJournal = document.createElement('div');
            mobileJournal.className = 'journal-content';
            updateJournalContent(mobileJournal);
            panelContent.appendChild(mobileJournal);
        }
    }
    
    // Update character profiles in desktop sidebar
    updateProfilesSidebar();
    
    // Update character names in mobile nav
    updateNavCharacters();
}

/**
 * Update journal content element
 * @param {HTMLElement} container - Container element
 */
function updateJournalContent(container) {
    container.innerHTML = '';
    
    if (gameState.journalEntries.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No clues discovered yet.</p>';
        return;
    }
    
    gameState.journalEntries.forEach((entry, index) => {
        const clueEntry = document.createElement('div');
        clueEntry.className = 'clue-entry';
        
        // Mark as new if it's the last entry
        if (index === gameState.journalEntries.length - 1) {
            clueEntry.classList.add('new');
        }
        
        clueEntry.innerHTML = `
            <div class="clue-title">${entry.title}</div>
            <div class="clue-text">${entry.text}</div>
        `;
        
        container.appendChild(clueEntry);
    });
    
    // Scroll to bottom to show newest clue
    container.scrollTop = container.scrollHeight;
}

/**
 * Show mobile panel
 * @param {string} panelName - Panel name ('journal', 'profiles', 'settings')
 * @param {string} suspectId - Optional suspect ID to show specific profile
 */
function showMobilePanel(panelName, suspectId = null) {
    currentPanel = panelName;
    const panelOverlay = document.getElementById('mobile-panel-overlay');
    const panelContent = document.getElementById('panel-content');
    const mobileNav = document.getElementById('mobile-nav');
    
    if (!panelOverlay || !panelContent) {
        return;
    }
    
    // Hide mobile nav
    if (mobileNav) {
        mobileNav.classList.add('hidden');
    }
    
    // Show panel
    panelOverlay.classList.remove('hidden');
    
    // Render panel content
    switch (panelName) {
        case 'journal':
            renderJournalPanel(panelContent);
            break;
        case 'profiles':
            renderProfilesPanel(panelContent, suspectId);
            break;
        case 'settings':
            renderSettingsPanel(panelContent);
            break;
    }
}

/**
 * Hide mobile panel
 */
function hideMobilePanel() {
    currentPanel = null;
    const panelOverlay = document.getElementById('mobile-panel-overlay');
    if (panelOverlay) {
        panelOverlay.classList.add('hidden');
    }
}

/**
 * Render journal panel
 * @param {HTMLElement} container - Container element
 */
function renderJournalPanel(container) {
    container.innerHTML = '<h2>Clue Journal</h2>';
    const journalDiv = document.createElement('div');
    journalDiv.className = 'journal-content';
    updateJournalContent(journalDiv);
    container.appendChild(journalDiv);
}

/**
 * Update character profiles in desktop sidebar
 */
function updateProfilesSidebar() {
    const profilesContent = document.getElementById('profiles-content');
    if (!profilesContent) {
        return;
    }
    
    profilesContent.innerHTML = '';
    
    let hasUnlockedProfiles = false;
    
    Object.values(suspects).forEach(suspect => {
        const profile = gameState.characterProfiles[suspect.id];
        if (!profile || !profile.unlocked) {
            return; // Don't show locked profiles
        }
        
        hasUnlockedProfiles = true;
        
        const profileDiv = document.createElement('div');
        profileDiv.className = 'character-profile';
        
        // Get supporting/contradicting clues
        const supportingClues = getCluesSupporting(suspect.id);
        const contradictingClues = getCluesContradicting(suspect.id);
        
        let profileHTML = `
            <div class="profile-header">
                <h3>${suspect.name}</h3>
                <div class="profile-title">${suspect.title}</div>
                <div class="profile-role">${suspect.role}</div>
            </div>
            <div class="profile-description">${suspect.description}</div>
        `;
        
        if (profile.facts.length > 0) {
            profileHTML += '<div class="profile-section"><h4>Known Facts</h4><ul>';
            profile.facts.forEach(fact => {
                profileHTML += `<li>${fact}</li>`;
            });
            profileHTML += '</ul></div>';
        }
        
        if (profile.suspicious.length > 0) {
            profileHTML += '<div class="profile-section suspicious"><h4>Suspicious Behavior</h4><ul>';
            profile.suspicious.forEach(behavior => {
                profileHTML += `<li>${behavior}</li>`;
            });
            profileHTML += '</ul></div>';
        }
        
        if (supportingClues.length > 0) {
            profileHTML += `<div class="profile-section"><h4>Supporting Evidence (${supportingClues.length})</h4><p>Clues point to this suspect.</p></div>`;
        }
        
        if (contradictingClues.length > 0) {
            profileHTML += `<div class="profile-section contradicting"><h4>Contradicting Evidence (${contradictingClues.length})</h4><p>Some clues contradict this suspect's involvement.</p></div>`;
        }
        
        profileDiv.innerHTML = profileHTML;
        profilesContent.appendChild(profileDiv);
    });
    
    // Show message if no profiles unlocked
    if (!hasUnlockedProfiles) {
        profilesContent.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Interrogate suspects and examine objects to unlock character profiles.</p>';
    }
}

/**
 * Render character profiles panel
 * @param {HTMLElement} container - Container element
 * @param {string} suspectId - Optional specific suspect ID to show
 */
function renderProfilesPanel(container, suspectId = null) {
    container.innerHTML = '<h2>Character Profiles</h2>';
    
    const suspectsToShow = suspectId 
        ? [suspects[suspectId]].filter(Boolean)
        : Object.values(suspects);
    
    suspectsToShow.forEach(suspect => {
        const profile = gameState.characterProfiles[suspect.id];
        if (!profile || !profile.unlocked) {
            return; // Don't show locked profiles
        }
        
        const profileDiv = document.createElement('div');
        profileDiv.className = 'character-profile';
        
        // Get supporting/contradicting clues
        const supportingClues = getCluesSupporting(suspect.id);
        const contradictingClues = getCluesContradicting(suspect.id);
        
        let profileHTML = `
            <div class="profile-header">
                <h3>${suspect.name}</h3>
                <div class="profile-title">${suspect.title}</div>
                <div class="profile-role">${suspect.role}</div>
            </div>
            <div class="profile-description">${suspect.description}</div>
        `;
        
        if (profile.facts.length > 0) {
            profileHTML += '<div class="profile-section"><h4>Known Facts</h4><ul>';
            profile.facts.forEach(fact => {
                profileHTML += `<li>${fact}</li>`;
            });
            profileHTML += '</ul></div>';
        }
        
        if (profile.suspicious.length > 0) {
            profileHTML += '<div class="profile-section suspicious"><h4>Suspicious Behavior</h4><ul>';
            profile.suspicious.forEach(behavior => {
                profileHTML += `<li>${behavior}</li>`;
            });
            profileHTML += '</ul></div>';
        }
        
        if (supportingClues.length > 0) {
            profileHTML += `<div class="profile-section"><h4>Supporting Evidence (${supportingClues.length})</h4><p>Clues point to this suspect.</p></div>`;
        }
        
        if (contradictingClues.length > 0) {
            profileHTML += `<div class="profile-section contradicting"><h4>Contradicting Evidence (${contradictingClues.length})</h4><p>Some clues contradict this suspect's involvement.</p></div>`;
        }
        
        profileDiv.innerHTML = profileHTML;
        container.appendChild(profileDiv);
    });
    
    // Show message if no profiles unlocked
    if (container.children.length === 1) {
        container.innerHTML += '<p style="color: var(--text-muted); margin-top: 2rem;">Interrogate suspects and examine objects to unlock character profiles.</p>';
    }
}

/**
 * Render settings panel
 * @param {HTMLElement} container - Container element
 */
function renderSettingsPanel(container) {
    const audioEnabled = getAudioEnabled();
    
    container.innerHTML = `
        <h2>Settings</h2>
        <div class="settings-section">
            <label class="settings-toggle">
                <input type="checkbox" id="audio-toggle" ${audioEnabled ? 'checked' : ''}>
                <span>Enable Audio</span>
            </label>
            <p class="settings-note">Audio is optional and can be muted at any time.</p>
        </div>
    `;
    
    const audioToggle = document.getElementById('audio-toggle');
    if (audioToggle) {
        audioToggle.addEventListener('change', (e) => {
            setAudioEnabled(e.target.checked);
        });
    }
}

/**
 * Show modal dialog
 * @param {string} text - Text to display
 * @param {array} actions - Array of action objects with {text, onClick}
 */
export function showModal(text, actions = []) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalText = document.getElementById('modal-text');
    const modalActions = document.getElementById('modal-actions');
    
    if (!modalOverlay || !modalText || !modalActions) {
        return;
    }
    
    modalText.textContent = text;
    modalActions.innerHTML = '';
    
    actions.forEach(action => {
        const button = document.createElement('button');
        button.className = 'choice-button';
        button.textContent = action.text;
        button.addEventListener('click', () => {
            hideModal();
            if (action.onClick) {
                action.onClick();
            }
        });
        modalActions.appendChild(button);
    });
    
    // If no actions provided, add a close button
    if (actions.length === 0) {
        const closeButton = document.createElement('button');
        closeButton.className = 'choice-button';
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', hideModal);
        modalActions.appendChild(closeButton);
    }
    
    modalOverlay.classList.remove('hidden');
}

/**
 * Hide modal dialog
 */
export function hideModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.add('hidden');
    }
}

/**
 * Render ending
 * @param {string} endingId - ID of the ending
 */
export function renderEnding(endingId) {
    const ending = getEnding(endingId);
    if (!ending) {
        return;
    }
    
    const sceneDisplay = document.getElementById('scene-display');
    const choicesContainer = document.getElementById('choices-container');
    
    if (sceneDisplay) {
        sceneDisplay.innerHTML = `
            <h2>${ending.title}</h2>
            <div style="white-space: pre-line; line-height: 1.8;">${ending.text}</div>
        `;
    }
    
    if (choicesContainer) {
        choicesContainer.innerHTML = `
            <button class="choice-button" onclick="location.reload()">Play Again</button>
        `;
    }
    
    // Hide stats and journal in ending
    const stats = document.getElementById('game-stats');
    const journal = document.getElementById('journal-sidebar');
    const mobileNav = document.getElementById('mobile-nav');
    if (stats) stats.style.display = 'none';
    if (journal) journal.style.display = 'none';
    if (mobileNav) mobileNav.style.display = 'none';
}

/**
 * Render accusation interface
 * @param {object} accusationData - Data from getAccusationData()
 * @param {function} onAccuse - Callback when accusation is made
 */
export function renderAccusationInterface(accusationData, onAccuse) {
    const sceneDisplay = document.getElementById('scene-display');
    const choicesContainer = document.getElementById('choices-container');
    
    if (!sceneDisplay || !choicesContainer) {
        return;
    }
    
    sceneDisplay.innerHTML = `
        <h2>Make Your Accusation</h2>
        <p>The time has come. You must name the killer and the weapon they used.</p>
        <p style="color: var(--text-muted); font-style: italic;">Choose carefully. There are no second chances.</p>
    `;
    
    choicesContainer.innerHTML = '';
    
    // Create suspect selection
    const suspectSection = document.createElement('div');
    suspectSection.innerHTML = '<h3 style="margin-bottom: 1rem; font-size: 1.1rem;">Who is the murderer?</h3>';
    
    accusationData.suspects.forEach(suspect => {
        const button = document.createElement('button');
        button.className = 'choice-button';
        button.textContent = `${suspect.name} - ${suspect.title}`;
        button.dataset.suspectId = suspect.id;
        button.addEventListener('click', () => {
            // Remove previous selection
            document.querySelectorAll('[data-suspect-id]').forEach(btn => {
                btn.classList.remove('selected');
            });
            button.classList.add('selected');
            gameState.accusation.suspect = suspect.id;
            checkAccusationReady(onAccuse);
        });
        suspectSection.appendChild(button);
    });
    
    choicesContainer.appendChild(suspectSection);
    
    // Create weapon selection
    const weaponSection = document.createElement('div');
    weaponSection.innerHTML = '<h3 style="margin: 1.5rem 0 1rem 0; font-size: 1.1rem;">What was the murder weapon?</h3>';
    
    if (accusationData.weapons.length === 0) {
        weaponSection.innerHTML += '<p style="color: var(--text-muted); font-style: italic; margin-bottom: 1rem;">You have not discovered any weapons yet. Continue investigating to find evidence of the murder weapon.</p>';
    } else {
        accusationData.weapons.forEach(weapon => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = `${weapon.name} - ${weapon.description}`;
            button.dataset.weaponId = weapon.id;
            button.addEventListener('click', () => {
                // Remove previous selection
                document.querySelectorAll('[data-weapon-id]').forEach(btn => {
                    btn.classList.remove('selected');
                });
                button.classList.add('selected');
                gameState.accusation.weapon = weapon.id;
                checkAccusationReady(onAccuse);
            });
            weaponSection.appendChild(button);
        });
    }
    
    choicesContainer.appendChild(weaponSection);
    
    // Final accusation button (initially disabled)
    const finalButton = document.createElement('button');
    finalButton.className = 'choice-button danger';
    finalButton.textContent = 'Make Final Accusation';
    finalButton.id = 'final-accusation-btn';
    finalButton.disabled = true;
    finalButton.style.marginTop = '1.5rem';
    finalButton.addEventListener('click', () => {
        if (gameState.accusation.suspect && gameState.accusation.weapon) {
            onAccuse(gameState.accusation.suspect, gameState.accusation.weapon);
        }
    });
    choicesContainer.appendChild(finalButton);
    
    // Go Back button
    const goBackButton = document.createElement('button');
    goBackButton.className = 'choice-button';
    goBackButton.textContent = 'Go Back to Investigation';
    goBackButton.style.marginTop = '1rem';
    goBackButton.addEventListener('click', () => {
        // Reset accusation phase and selections
        gameState.phase = 'investigation';
        gameState.accusation.suspect = null;
        gameState.accusation.weapon = null;
        // Trigger UI update by dispatching a custom event
        window.dispatchEvent(new CustomEvent('gameStateChanged'));
    });
    choicesContainer.appendChild(goBackButton);
}

/**
 * Check if accusation is ready and enable final button
 * @param {function} onAccuse - Callback function
 */
function checkAccusationReady(onAccuse) {
    const finalButton = document.getElementById('final-accusation-btn');
    if (finalButton && gameState.accusation.suspect && gameState.accusation.weapon) {
        finalButton.disabled = false;
    }
}

/**
 * Show examination result
 * @param {object} result - Result from examineObject()
 */
export function showExaminationResult(result) {
    if (result.error) {
        showModal(result.error, [
            { text: 'Understood', onClick: null }
        ]);
    } else {
        showModal(result.description, [
            { text: 'Continue', onClick: null }
        ]);
    }
}

/**
 * Show interrogation result
 * @param {object} result - Result from interrogateSuspect()
 */
export function showInterrogationResult(result) {
    if (!result) {
        return;
    }
    
    const suspect = result.suspect;
    const dialogue = result.dialogue;
    
    showModal(
        `${suspect.name}\n\n"${dialogue.text}"`,
        [
            { text: 'Continue', onClick: null }
        ]
    );
}
