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
 * Maps image IDs to paths in public folder
 */
export const IMAGE_REGISTRY = {
    // Room images
    'room_grandHall': '/Grand Hall (Opening Scene).jpg',
    'room_study': '/The Study (Crime Scene).jpg',
    'room_kitchen': '/Kitchen (Poison Narrative Friendly).jpg',
    'room_servants': '/servants quarters.jpg',
    'room_corridor': '/upstairs corridor.jpg',
    'room_eleanorRoom': '/Eleanors_room.jpg',
    'room_marcusRoom': '/victors room.jpg',
    'room_garden': '/Garden_Tool Shed (Blunt Force Narrative).jpg',
    'room_gardenShed': '/Garden_Tool Shed (Blunt Force Narrative).jpg',
    'room_medicalRoom': '/Medical Room (Doctor Narrative).jpg',
    
    // Character portraits - Eleanor with emotional states
    'portrait_eleanor': '/Eleanor Blackthorn (The Wife).jpg',
    'portrait_eleanor_calm': '/Eleanor Blackthorn (The Wife) Calm but guarded.jpg',
    'portrait_eleanor_defensive': '/Eleanor Blackthorn (The Wife) cold and defensive.jpg',
    'portrait_eleanor_shaken': '/Eleanor Blackthorn (The Wife) emotionally shaken.jpg',
    
    // Character portraits - Other characters
    'portrait_victor': '/Victor Hale (Business Associate).jpg',
    'portrait_thomas': '/Thomas Reed (Gardener  Cleaner).jpg',
    'portrait_doctor': '/Dr. Adrian Whitlock (Doctor).jpg',
    'portrait_lydia': '/Lydia Crane.jpg',
    
    // Evidence/Weapons
    'evidence_letterOpener': '/letter_opener.jpg',
    'evidence_firePoker': '/fireplace_poker.jpg',
    'evidence_poisonVial': '/poison_vial.jpg',
    'evidence_scalpel': '/scalpel.jpg',
    'evidence_syringe': '/scalpel.jpg', // Using scalpel as fallback (syringe not in public)
    'evidence_body': '/autopsy.jpg',
    'evidence_portrait': '/family portrait.jpg',
    'object_portrait': '/family portrait.jpg',
    
    // Endings
    'ending_success': '/successful_accusation.jpg',
    'ending_failure': '/failure_time_ran_out.jpg',
    'ending_timeout': '/failure_time_ran_out.jpg'
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


