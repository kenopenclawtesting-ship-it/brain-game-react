import { Howl, Howler } from 'howler';

// Sound file mapping
const SOUND_FILES = {
  themeMusic: '/sounds/2_ThemeMusic.mp3',
  ingameMusic: '/sounds/7_IngameMusic.mp3',
  buttonInGame: '/sounds/8_ButtonInGame.mp3',
  buttonMenu: '/sounds/9_ButtonMenu.mp3',
  timerSound: '/sounds/1_TimerSound.mp3',
  startSound: '/sounds/3_StartSound.mp3',
  applauseSound: '/sounds/10_ApplauseSound.mp3',
  crowdCheerSound: '/sounds/4_CrowdCheerSound.mp3',
  scoreCountSound: '/sounds/5_ScoreCountSound.mp3',
  scoreCountEndSound: '/sounds/6_ScoreCountEndSound.mp3',
  correct: '/sounds/862.mp3',
  wrong: '/sounds/848.mp3',
};

// Sound instances
const sounds = {};

// Initialize all sounds
export function initSounds() {
  Object.entries(SOUND_FILES).forEach(([name, src]) => {
    sounds[name] = new Howl({
      src: [src],
      preload: true,
      volume: name.includes('Music') ? 0.5 : 0.7,
      loop: name.includes('Music'),
    });
  });
}

// Play a sound
export function playSound(name, loop = false) {
  if (sounds[name]) {
    if (loop) {
      sounds[name].loop(true);
    }
    sounds[name].play();
  }
}

// Stop a sound
export function stopSound(name) {
  if (sounds[name]) {
    sounds[name].stop();
  }
}

// Stop all sounds
export function stopAllSounds() {
  Object.values(sounds).forEach(sound => sound.stop());
}

// Set master volume
export function setVolume(volume) {
  Howler.volume(volume);
}

// Mute/unmute
export function setMute(muted) {
  Howler.mute(muted);
}

// Get sound instance for direct control
export function getSound(name) {
  return sounds[name];
}

export default {
  initSounds,
  playSound,
  stopSound,
  stopAllSounds,
  setVolume,
  setMute,
  getSound,
};
