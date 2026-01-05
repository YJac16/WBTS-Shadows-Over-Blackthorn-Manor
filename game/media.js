/**
 * Media Support System
 * 
 * Handles images and audio with mobile-first considerations.
 * - Audio is optional and muteable
 * - No autoplay on mobile
 * - Respects browser limitations
 */

/**
 * Image registry
 * Maps image IDs to paths
 */
export const IMAGE_REGISTRY = {
    // Room images
    'room_grandHall': '/assets/images/rooms/grand-hall.jpg',
    'room_study': '/assets/images/rooms/study.jpg',
    'room_kitchen': '/assets/images/rooms/kitchen.jpg',
    'room_servants': '/assets/images/rooms/servants.jpg',
    'room_corridor': '/assets/images/rooms/corridor.jpg',
    'room_eleanorRoom': '/assets/images/rooms/eleanor-room.jpg',
    'room_marcusRoom': '/assets/images/rooms/marcus-room.jpg',
    'room_gardenShed': '/assets/images/rooms/garden-shed.jpg',
    
    // Character portraits
    'portrait_eleanor': '/assets/images/characters/eleanor.jpg',
    'portrait_marcus': '/assets/images/characters/marcus.jpg',
    'portrait_lydia': '/assets/images/characters/lydia.jpg',
    'portrait_hale': '/assets/images/characters/hale.jpg',
    
    // Evidence
    'evidence_letterOpener': '/assets/images/evidence/letter-opener.jpg',
    'evidence_firePoker': '/assets/images/evidence/fire-poker.jpg',
    'evidence_syringe': '/assets/images/evidence/syringe.jpg',
    'evidence_body': '/assets/images/evidence/body.jpg'
};

/**
 * Audio registry
 * Maps audio IDs to paths
 */
export const AUDIO_REGISTRY = {
    // Ambient loops
    'ambient_storm': '/assets/sounds/ambient/storm-loop.mp3',
    'ambient_manor': '/assets/sounds/ambient/manor-loop.mp3',
    
    // Room-specific
    'room_study': '/assets/sounds/rooms/study-ambient.mp3',
    'room_kitchen': '/assets/sounds/rooms/kitchen-ambient.mp3',
    
    // Sound effects
    'sfx_door': '/assets/sounds/sfx/door-close.mp3',
    'sfx_paper': '/assets/sounds/sfx/paper-rustle.mp3',
    'sfx_thunder': '/assets/sounds/sfx/thunder.mp3'
};

/**
 * Media state
 */
const mediaState = {
    audioEnabled: false,
    currentAmbient: null,
    currentRoomAudio: null,
    volume: 0.5
};

/**
 * Check if audio is supported
 * @returns {boolean} True if audio is supported
 */
export function isAudioSupported() {
    return typeof Audio !== 'undefined';
}

/**
 * Check if we're on mobile
 * @returns {boolean} True if mobile device
 */
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
}

/**
 * Enable/disable audio
 * @param {boolean} enabled - Whether to enable audio
 */
export function setAudioEnabled(enabled) {
    mediaState.audioEnabled = enabled;
    
    if (!enabled) {
        stopAllAudio();
    } else if (!isMobile()) {
        // Only autoplay on desktop if enabled
        playAmbient('ambient_storm');
    }
}

/**
 * Play ambient audio
 * @param {string} audioId - Audio ID from AUDIO_REGISTRY
 */
export function playAmbient(audioId) {
    if (!mediaState.audioEnabled || !isAudioSupported()) {
        return;
    }
    
    // Don't autoplay on mobile
    if (isMobile()) {
        return;
    }
    
    const audioPath = AUDIO_REGISTRY[audioId];
    if (!audioPath) {
        return;
    }
    
    // Stop current ambient
    if (mediaState.currentAmbient) {
        mediaState.currentAmbient.pause();
    }
    
    const audio = new Audio(audioPath);
    audio.loop = true;
    audio.volume = mediaState.volume;
    audio.play().catch(() => {
        // Autoplay blocked, user must interact first
        console.log('Audio autoplay blocked');
    });
    
    mediaState.currentAmbient = audio;
}

/**
 * Play room-specific audio
 * @param {string} roomId - Room ID
 */
export function playRoomAudio(roomId) {
    if (!mediaState.audioEnabled || !isAudioSupported()) {
        return;
    }
    
    const audioId = `room_${roomId}`;
    const audioPath = AUDIO_REGISTRY[audioId];
    if (!audioPath) {
        return;
    }
    
    // Stop current room audio
    if (mediaState.currentRoomAudio) {
        mediaState.currentRoomAudio.pause();
    }
    
    const audio = new Audio(audioPath);
    audio.loop = true;
    audio.volume = mediaState.volume * 0.7; // Room audio quieter than ambient
    audio.play().catch(() => {
        // Autoplay blocked
    });
    
    mediaState.currentRoomAudio = audio;
}

/**
 * Play sound effect
 * @param {string} sfxId - Sound effect ID
 */
export function playSFX(sfxId) {
    if (!mediaState.audioEnabled || !isAudioSupported()) {
        return;
    }
    
    const audioPath = AUDIO_REGISTRY[sfxId];
    if (!audioPath) {
        return;
    }
    
    const audio = new Audio(audioPath);
    audio.volume = mediaState.volume;
    audio.play().catch(() => {
        // Autoplay blocked
    });
}

/**
 * Stop all audio
 */
export function stopAllAudio() {
    if (mediaState.currentAmbient) {
        mediaState.currentAmbient.pause();
        mediaState.currentAmbient = null;
    }
    
    if (mediaState.currentRoomAudio) {
        mediaState.currentRoomAudio.pause();
        mediaState.currentRoomAudio = null;
    }
}

/**
 * Get image path
 * @param {string} imageId - Image ID from IMAGE_REGISTRY
 * @returns {string|null} Image path or null
 */
export function getImagePath(imageId) {
    return IMAGE_REGISTRY[imageId] || null;
}

/**
 * Get audio enabled state
 * @returns {boolean} True if audio is enabled
 */
export function getAudioEnabled() {
    return mediaState.audioEnabled;
}


