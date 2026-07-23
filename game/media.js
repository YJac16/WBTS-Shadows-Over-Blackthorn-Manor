/**
 * Media Support System
 *
 * Handles images and mystery background music.
 * - Soft looping track during play
 * - Speeds up when time is low
 * - Muteable via settings; starts after first user gesture
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
    'evidence_kitchenKnife': '/kitchen_knife.jpg',
    'evidence_kitchen_knife': '/kitchen_knife.jpg',
    'evidence_syringe': '/scalpel.jpg',
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
 */
export const AUDIO_REGISTRY = {
    mystery_bg: '/mystery_background_music.mp3',
    ambient_storm: '/assets/sounds/ambient/storm-loop.mp3',
    ambient_manor: '/assets/sounds/ambient/manor-loop.mp3',
    room_study: '/assets/sounds/rooms/study-ambient.mp3',
    room_kitchen: '/assets/sounds/rooms/kitchen-ambient.mp3',
    sfx_door: '/assets/sounds/sfx/door-close.mp3',
    sfx_paper: '/assets/sounds/sfx/paper-rustle.mp3',
    sfx_thunder: '/assets/sounds/sfx/thunder.mp3'
};

const MYSTERY_VOLUME = 0.22;
const NORMAL_RATE = 1.0;
const URGENT_RATE = 1.3;
const URGENT_TIME_THRESHOLD = 10;

/**
 * Media state
 */
const mediaState = {
    audioEnabled: true, // default on after unlock; user can mute in settings
    mysteryMusic: null,
    musicUnlocked: false,
    gamePlaying: false,
    lastTimeRemaining: null,
    currentAmbient: null,
    currentRoomAudio: null,
    volume: 0.5
};

export function isAudioSupported() {
    return typeof Audio !== 'undefined';
}

export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
}

/**
 * Enable/disable audio (mute override)
 * @param {boolean} enabled
 */
export function setAudioEnabled(enabled) {
    mediaState.audioEnabled = enabled;

    if (!enabled) {
        stopMysteryMusic(false);
        stopAllAudio();
    } else if (mediaState.gamePlaying && mediaState.musicUnlocked) {
        startMysteryMusic();
        if (mediaState.lastTimeRemaining != null) {
            syncMysteryMusicTempo(mediaState.lastTimeRemaining);
        }
    }
}

/**
 * Mark that the player is in an active playthrough
 * @param {boolean} playing
 */
export function setGamePlaying(playing) {
    mediaState.gamePlaying = playing;
    if (!playing) {
        stopMysteryMusic(false);
    }
}

/**
 * Unlock audio on first user gesture, then start mystery track if playing
 */
export function unlockAndStartMysteryMusic() {
    mediaState.musicUnlocked = true;
    if (mediaState.gamePlaying && mediaState.audioEnabled) {
        startMysteryMusic();
        if (mediaState.lastTimeRemaining != null) {
            syncMysteryMusicTempo(mediaState.lastTimeRemaining);
        }
    }
}

/**
 * Soft looping mystery background music
 */
export function startMysteryMusic() {
    if (!mediaState.audioEnabled || !isAudioSupported() || !mediaState.gamePlaying) {
        return;
    }

    const audioPath = AUDIO_REGISTRY.mystery_bg;
    if (!audioPath) {
        return;
    }

    if (mediaState.mysteryMusic) {
        if (mediaState.mysteryMusic.paused) {
            mediaState.mysteryMusic.play().catch(() => {});
        }
        return;
    }

    const audio = new Audio(audioPath);
    audio.loop = true;
    audio.volume = MYSTERY_VOLUME;
    audio.playbackRate = NORMAL_RATE;
    audio.play().catch(() => {
        // Autoplay blocked until user gesture
    });

    mediaState.mysteryMusic = audio;
}

/**
 * Stop mystery music
 * @param {boolean} resetElement - If true, dispose the Audio element
 */
export function stopMysteryMusic(resetElement = true) {
    if (mediaState.mysteryMusic) {
        mediaState.mysteryMusic.pause();
        if (resetElement) {
            mediaState.mysteryMusic.currentTime = 0;
            mediaState.mysteryMusic = null;
        }
    }
}

/**
 * Speed up when time is running out
 * @param {number} timeRemaining
 */
export function syncMysteryMusicTempo(timeRemaining) {
    mediaState.lastTimeRemaining = timeRemaining;

    if (!mediaState.mysteryMusic) {
        return;
    }

    const targetRate = timeRemaining <= URGENT_TIME_THRESHOLD ? URGENT_RATE : NORMAL_RATE;
    if (mediaState.mysteryMusic.playbackRate !== targetRate) {
        mediaState.mysteryMusic.playbackRate = targetRate;
    }
}

/**
 * Restart soft music for a new playthrough
 * @param {number} timeRemaining
 */
export function restartMysteryMusic(timeRemaining = 20) {
    mediaState.gamePlaying = true;
    stopMysteryMusic(true);
    mediaState.lastTimeRemaining = timeRemaining;
    if (mediaState.audioEnabled && mediaState.musicUnlocked) {
        startMysteryMusic();
        syncMysteryMusicTempo(timeRemaining);
    }
}

/** @deprecated Prefer startMysteryMusic */
export function playAmbient(audioId) {
    if (audioId === 'mystery_bg' || audioId === 'ambient_storm') {
        startMysteryMusic();
        return;
    }
    if (!mediaState.audioEnabled || !isAudioSupported()) {
        return;
    }
    const audioPath = AUDIO_REGISTRY[audioId];
    if (!audioPath) {
        return;
    }
    if (mediaState.currentAmbient) {
        mediaState.currentAmbient.pause();
    }
    const audio = new Audio(audioPath);
    audio.loop = true;
    audio.volume = mediaState.volume;
    audio.play().catch(() => {});
    mediaState.currentAmbient = audio;
}

export function playRoomAudio(roomId) {
    if (!mediaState.audioEnabled || !isAudioSupported()) {
        return;
    }
    const audioPath = AUDIO_REGISTRY[`room_${roomId}`];
    if (!audioPath) {
        return;
    }
    if (mediaState.currentRoomAudio) {
        mediaState.currentRoomAudio.pause();
    }
    const audio = new Audio(audioPath);
    audio.loop = true;
    audio.volume = mediaState.volume * 0.7;
    audio.play().catch(() => {});
    mediaState.currentRoomAudio = audio;
}

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
    audio.play().catch(() => {});
}

export function stopAllAudio() {
    if (mediaState.currentAmbient) {
        mediaState.currentAmbient.pause();
        mediaState.currentAmbient = null;
    }
    if (mediaState.currentRoomAudio) {
        mediaState.currentRoomAudio.pause();
        mediaState.currentRoomAudio = null;
    }
    stopMysteryMusic(false);
}

export function getImagePath(imageId) {
    return IMAGE_REGISTRY[imageId] || null;
}

export function getAudioEnabled() {
    return mediaState.audioEnabled;
}
